import { create } from 'zustand';
import { ColumnProfile, generateDatasetProfile } from '@/lib/analysis/profiling';

export interface DatasetMetadata {
  filename: string;
  size: number;
  rowCount: number;
  columnCount: number;
}

export interface CleaningOperation {
  id: string;
  type: string;
  description: string;
  affectedRows: number;
  timestamp: string; // ISO string
}

interface DatasetStore {
  dataset: any[];
  metadata: DatasetMetadata | null;
  profiles: ColumnProfile[];
  cleaningHistory: CleaningOperation[];
  loading: boolean;
  error: string | null;
  setDataset: (data: any[], meta: DatasetMetadata) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearDataset: () => void;
  removeDuplicates: () => void;
  handleMissingValues: (
    columnName: string,
    method: 'drop' | 'mean' | 'median' | 'mode' | 'custom',
    customValue?: any
  ) => void;
  handleColumnOperation: (
    action: 'rename' | 'delete',
    targetColumn: string,
    newName?: string
  ) => void;
  handleTypeConversion: (
    columnName: string,
    targetType: 'String' | 'Integer' | 'Float' | 'Boolean'
  ) => void;
  handleTransform: (
    method: 'min-max' | 'z-score' | 'label-encode',
    columnName: string
  ) => void;
  handleOutliers: (columnName: string) => void;
}

export const useDatasetStore = create<DatasetStore>((set, get) => ({
  dataset: [],
  metadata: null,
  profiles: [],
  cleaningHistory: [],
  loading: false,
  error: null,
  setDataset: (data, meta) => {
    const profiles = generateDatasetProfile(data);
    set({ dataset: data, metadata: meta, profiles, error: null, loading: false });
  },
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  clearDataset: () => set({ dataset: [], metadata: null, profiles: [], cleaningHistory: [], error: null }),
  removeDuplicates: () => {
    const { dataset, metadata } = get();
    if (!dataset || dataset.length === 0) return;

    const seen = new Set<string>();
    const uniqueRows: any[] = [];
    let duplicatesCount = 0;

    for (let i = 0; i < dataset.length; i++) {
      const row = dataset[i];
      const stringified = JSON.stringify(row);
      if (seen.has(stringified)) {
        duplicatesCount++;
      } else {
        seen.add(stringified);
        uniqueRows.push(row);
      }
    }

    if (duplicatesCount === 0) return;

    const updatedMetadata = metadata
      ? { ...metadata, rowCount: uniqueRows.length }
      : null;

    const profiles = generateDatasetProfile(uniqueRows);

    const operation: CleaningOperation = {
      id: `op-${Date.now()}`,
      type: 'remove_duplicates',
      description: `Menghapus ${duplicatesCount} baris duplikat dari dataset`,
      affectedRows: duplicatesCount,
      timestamp: new Date().toISOString()
    };

    set((state) => ({
      dataset: uniqueRows,
      metadata: updatedMetadata,
      profiles,
      cleaningHistory: [operation, ...state.cleaningHistory]
    }));
  },
  handleMissingValues: (columnName, method, customValue) => {
    const { dataset, metadata, profiles } = get();
    if (!dataset || dataset.length === 0) return;

    const columnProfile = profiles.find((p) => p.name === columnName);
    if (!columnProfile) return;

    // Filter valid values in the column
    const validValues = dataset
      .map((row) => row[columnName])
      .filter((v) => v !== null && v !== undefined && String(v).trim() !== '');

    let targetValue: any = null;
    let affectedRows = 0;
    let updatedDataset: any[] = [];

    if (method === 'drop') {
      updatedDataset = dataset.filter(
        (row) =>
          row[columnName] !== null &&
          row[columnName] !== undefined &&
          String(row[columnName]).trim() !== ''
      );
      affectedRows = dataset.length - updatedDataset.length;
    } else {
      // Perform imputation calculations
      if (method === 'mean') {
        const numValues = validValues.map(Number).filter((v) => !isNaN(v));
        if (numValues.length > 0) {
          const sum = numValues.reduce((a, b) => a + b, 0);
          const rawMean = sum / numValues.length;
          targetValue = columnProfile.dataType === 'Integer' ? Math.round(rawMean) : parseFloat(rawMean.toFixed(4));
        } else {
          targetValue = 0;
        }
      } else if (method === 'median') {
        const numValues = validValues.map(Number).filter((v) => !isNaN(v));
        if (numValues.length > 0) {
          numValues.sort((a, b) => a - b);
          const mid = Math.floor(numValues.length / 2);
          const rawMedian =
            numValues.length % 2 !== 0
              ? numValues[mid]
              : (numValues[mid - 1] + numValues[mid]) / 2;
          targetValue = columnProfile.dataType === 'Integer' ? Math.round(rawMedian) : parseFloat(rawMedian.toFixed(4));
        } else {
          targetValue = 0;
        }
      } else if (method === 'mode') {
        if (validValues.length > 0) {
          const countMap: Record<string, number> = {};
          let maxCount = 0;
          let modeVal = validValues[0];
          
          for (const val of validValues) {
            const key = String(val);
            countMap[key] = (countMap[key] || 0) + 1;
            if (countMap[key] > maxCount) {
              maxCount = countMap[key];
              modeVal = val;
            }
          }
          targetValue = modeVal;
        } else {
          targetValue = columnProfile.dataType === 'Boolean' ? false : '';
        }
      } else if (method === 'custom') {
        const cleanedVal = String(customValue).trim();
        if (columnProfile.dataType === 'Integer') {
          targetValue = isNaN(Number(cleanedVal)) ? 0 : Math.round(Number(cleanedVal));
        } else if (columnProfile.dataType === 'Float') {
          targetValue = isNaN(Number(cleanedVal)) ? 0.0 : Number(cleanedVal);
        } else if (columnProfile.dataType === 'Boolean') {
          targetValue = cleanedVal.toLowerCase() === 'true';
        } else {
          targetValue = customValue;
        }
      }

      // Impute matching empty values
      updatedDataset = dataset.map((row) => {
        const val = row[columnName];
        if (val === null || val === undefined || String(val).trim() === '') {
          affectedRows++;
          return { ...row, [columnName]: targetValue };
        }
        return row;
      });
    }

    if (affectedRows === 0) return;

    const updatedMetadata = metadata
      ? { ...metadata, rowCount: updatedDataset.length }
      : null;

    const updatedProfiles = generateDatasetProfile(updatedDataset);

    // Formulate a user friendly description
    const desc =
      method === 'drop'
        ? `Menghapus ${affectedRows} baris dengan nilai kosong pada kolom "${columnName}"`
        : `Mengisi nilai kosong pada kolom "${columnName}" menggunakan metode ${method.toUpperCase()} = "${targetValue}" (${affectedRows} baris diubah)`;

    const operation: CleaningOperation = {
      id: `op-${Date.now()}`,
      type: method === 'drop' ? 'drop_missing' : 'impute_missing',
      description: desc,
      affectedRows,
      timestamp: new Date().toISOString()
    };

    set((state) => ({
      dataset: updatedDataset,
      metadata: updatedMetadata,
      profiles: updatedProfiles,
      cleaningHistory: [operation, ...state.cleaningHistory]
    }));
  },
  handleColumnOperation: (action, targetColumn, newName) => {
    const { dataset, metadata } = get();
    if (!dataset || dataset.length === 0) return;

    let updatedDataset: any[] = [];
    let desc = '';

    if (action === 'delete') {
      updatedDataset = dataset.map((row) => {
        const newRow = { ...row };
        delete newRow[targetColumn];
        return newRow;
      });
      desc = `Menghapus kolom "${targetColumn}" dari dataset`;
    } else if (action === 'rename' && newName) {
      const cleanNewName = newName.trim();
      if (!cleanNewName || cleanNewName === targetColumn) return;

      updatedDataset = dataset.map((row) => {
        const newRow = { ...row };
        newRow[cleanNewName] = newRow[targetColumn];
        delete newRow[targetColumn];
        return newRow;
      });
      desc = `Mengubah nama kolom "${targetColumn}" menjadi "${cleanNewName}"`;
    } else {
      return;
    }

    const updatedMetadata = metadata
      ? {
          ...metadata,
          columnCount: action === 'delete' ? metadata.columnCount - 1 : metadata.columnCount
        }
      : null;

    const updatedProfiles = generateDatasetProfile(updatedDataset);

    const operation: CleaningOperation = {
      id: `op-${Date.now()}`,
      type: action === 'delete' ? 'delete_column' : 'rename_column',
      description: desc,
      affectedRows: dataset.length,
      timestamp: new Date().toISOString()
    };

    set((state) => ({
      dataset: updatedDataset,
      metadata: updatedMetadata,
      profiles: updatedProfiles,
      cleaningHistory: [operation, ...state.cleaningHistory]
    }));
  },
  handleTypeConversion: (columnName, targetType) => {
    const { dataset, metadata } = get();
    if (!dataset || dataset.length === 0) return;

    let affectedRows = 0;

    const updatedDataset = dataset.map((row) => {
      const val = row[columnName];
      if (val === null || val === undefined || String(val).trim() === '') {
        return row;
      }

      let parsedVal: any = null;
      let conversionSucceeded = true;

      if (targetType === 'String') {
        parsedVal = String(val).trim();
      } else if (targetType === 'Integer') {
        const num = Number(val);
        if (isNaN(num)) {
          parsedVal = null;
          conversionSucceeded = false;
        } else {
          parsedVal = Math.round(num);
        }
      } else if (targetType === 'Float') {
        const num = Number(val);
        if (isNaN(num)) {
          parsedVal = null;
          conversionSucceeded = false;
        } else {
          parsedVal = num;
        }
      } else if (targetType === 'Boolean') {
        if (typeof val === 'boolean') {
          parsedVal = val;
        } else {
          const str = String(val).trim().toLowerCase();
          if (str === 'true' || str === '1') {
            parsedVal = true;
          } else if (str === 'false' || str === '0') {
            parsedVal = false;
          } else {
            parsedVal = null;
            conversionSucceeded = false;
          }
        }
      }

      if (parsedVal !== val) {
        affectedRows++;
        return { ...row, [columnName]: parsedVal };
      }
      return row;
    });

    if (affectedRows === 0) return;

    const updatedProfiles = generateDatasetProfile(updatedDataset);

    const operation: CleaningOperation = {
      id: `op-${Date.now()}`,
      type: 'convert_type',
      description: `Mengonversi tipe data kolom "${columnName}" menjadi ${targetType.toUpperCase()} (${affectedRows} baris dikonversi)`,
      affectedRows,
      timestamp: new Date().toISOString()
    };

    set((state) => ({
      dataset: updatedDataset,
      profiles: updatedProfiles,
      cleaningHistory: [operation, ...state.cleaningHistory]
    }));
  },
  handleTransform: (method, columnName) => {
    const { dataset } = get();
    if (!dataset || dataset.length === 0) return;

    let updatedDataset: any[] = [];
    let affectedRows = 0;
    let description = '';

    if (method === 'min-max' || method === 'z-score') {
      const validNumbers = dataset
        .map((row) => Number(row[columnName]))
        .filter((num) => !isNaN(num) && num !== null && num !== undefined);

      if (validNumbers.length === 0) return;

      if (method === 'min-max') {
        let min = Infinity;
        let max = -Infinity;
        for (let i = 0; i < validNumbers.length; i++) {
          const val = validNumbers[i];
          if (val < min) min = val;
          if (val > max) max = val;
        }

        const range = max - min;
        if (range === 0) return;

        updatedDataset = dataset.map((row) => {
          const val = row[columnName];
          if (val === null || val === undefined || String(val).trim() === '' || isNaN(Number(val))) {
            return row;
          }
          const num = Number(val);
          const scaled = (num - min) / range;
          affectedRows++;
          return { ...row, [columnName]: parseFloat(scaled.toFixed(4)) };
        });

        description = `Normalisasi Min-Max pada kolom "${columnName}" (skala 0-1)`;
      } else if (method === 'z-score') {
        const sum = validNumbers.reduce((a, b) => a + b, 0);
        const mean = sum / validNumbers.length;

        let varianceSum = 0;
        for (let i = 0; i < validNumbers.length; i++) {
          varianceSum += Math.pow(validNumbers[i] - mean, 2);
        }
        const variance = varianceSum / validNumbers.length;
        const stdDev = Math.sqrt(variance);

        if (stdDev === 0) return;

        updatedDataset = dataset.map((row) => {
          const val = row[columnName];
          if (val === null || val === undefined || String(val).trim() === '' || isNaN(Number(val))) {
            return row;
          }
          const num = Number(val);
          const zScore = (num - mean) / stdDev;
          affectedRows++;
          return { ...row, [columnName]: parseFloat(zScore.toFixed(4)) };
        });

        description = `Normalisasi Z-Score pada kolom "${columnName}" (mean=0, std=${stdDev.toFixed(4)})`;
      }
    } else if (method === 'label-encode') {
      const uniqueValues = new Set<string>();
      for (let i = 0; i < dataset.length; i++) {
        const val = dataset[i][columnName];
        if (val !== null && val !== undefined && String(val).trim() !== '') {
          uniqueValues.add(String(val).trim());
        }
      }

      const sortedUnique = Array.from(uniqueValues).sort();
      const valueToCodeMap = new Map<string, number>();
      sortedUnique.forEach((val, idx) => {
        valueToCodeMap.set(val, idx);
      });

      updatedDataset = dataset.map((row) => {
        const val = row[columnName];
        if (val === null || val === undefined || String(val).trim() === '') {
          return row;
        }
        const stringVal = String(val).trim();
        const code = valueToCodeMap.get(stringVal);
        if (code !== undefined) {
          affectedRows++;
          return { ...row, [columnName]: code };
        }
        return row;
      });

      description = `Label Encoding pada kolom "${columnName}" (${sortedUnique.length} kelas unik terpetakan)`;
    }

    if (affectedRows === 0) return;

    const updatedProfiles = generateDatasetProfile(updatedDataset);

    const operation: CleaningOperation = {
      id: `op-${Date.now()}`,
      type: 'transform_data',
      description,
      affectedRows,
      timestamp: new Date().toISOString()
    };

    set((state) => ({
      dataset: updatedDataset,
      profiles: updatedProfiles,
      cleaningHistory: [operation, ...state.cleaningHistory]
    }));
  },
  handleOutliers: (columnName) => {
    const { dataset, metadata } = get();
    if (!dataset || dataset.length === 0) return;

    const numericValues = dataset
      .map((row) => Number(row[columnName]))
      .filter((num) => !isNaN(num) && num !== null && num !== undefined)
      .sort((a, b) => a - b);

    if (numericValues.length === 0) return;

    const q1Idx = Math.floor(numericValues.length * 0.25);
    const q3Idx = Math.floor(numericValues.length * 0.75);
    const q1 = numericValues[q1Idx];
    const q3 = numericValues[q3Idx];
    const iqr = q3 - q1;

    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const updatedDataset = dataset.filter((row) => {
      const val = row[columnName];
      if (val === null || val === undefined || String(val).trim() === '' || isNaN(Number(val))) {
        return true;
      }
      const num = Number(val);
      return num >= lowerBound && num <= upperBound;
    });

    const affectedRows = dataset.length - updatedDataset.length;

    if (affectedRows === 0) return;

    const updatedMetadata = metadata
      ? { ...metadata, rowCount: updatedDataset.length }
      : null;

    const updatedProfiles = generateDatasetProfile(updatedDataset);

    const operation: CleaningOperation = {
      id: `op-${Date.now()}`,
      type: 'remove_outliers',
      description: `Menghapus ${affectedRows} baris outlier pada kolom "${columnName}" menggunakan batas IQR [${lowerBound.toFixed(2)}, ${upperBound.toFixed(2)}]`,
      affectedRows,
      timestamp: new Date().toISOString()
    };

    set((state) => ({
      dataset: updatedDataset,
      metadata: updatedMetadata,
      profiles: updatedProfiles,
      cleaningHistory: [operation, ...state.cleaningHistory]
    }));
  }
}));
