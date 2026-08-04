export interface ColumnProfile {
  name: string;
  dataType: 'String' | 'Integer' | 'Float' | 'Boolean';
  missingCount: number;
  missingPercentage: number;
  uniqueCount: number;
  min?: number;
  max?: number;
  mean?: number;
}

export function generateDatasetProfile(dataset: any[]): ColumnProfile[] {
  if (!dataset || dataset.length === 0) return [];

  // Get the list of column names
  const firstRow = dataset[0];
  const columns = Object.keys(firstRow);
  const totalCount = dataset.length;

  return columns.map((colName) => {
    let missingCount = 0;
    const uniqueValues = new Set<any>();

    // Counters for type detection
    let countInteger = 0;
    let countFloat = 0;
    let countBoolean = 0;
    let countString = 0;

    // For numeric analysis
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    let numericCount = 0;

    for (let i = 0; i < totalCount; i++) {
      const row = dataset[i];
      if (!row) continue;
      
      const val = row[colName];

      // Check for missing value
      if (val === null || val === undefined || String(val).trim() === '') {
        missingCount++;
        continue;
      }

      // Add to unique set
      uniqueValues.add(val);

      // Detect base cell type
      let cellType: 'String' | 'Integer' | 'Float' | 'Boolean' = 'String';

      if (typeof val === 'boolean') {
        cellType = 'Boolean';
      } else if (typeof val === 'number') {
        if (Number.isInteger(val)) {
          cellType = 'Integer';
        } else {
          cellType = 'Float';
        }
      } else if (typeof val === 'string') {
        const str = val.trim();
        const lowerStr = str.toLowerCase();
        
        if (lowerStr === 'true' || lowerStr === 'false') {
          cellType = 'Boolean';
        } else if (/^-?\d+$/.test(str)) {
          cellType = 'Integer';
        } else if (/^-?\d*\.\d+$/.test(str) || /^-?\d+\.\d*$/.test(str)) {
          cellType = 'Float';
        } else {
          cellType = 'String';
        }
      }

      // Update counters
      if (cellType === 'Integer') countInteger++;
      else if (cellType === 'Float') countFloat++;
      else if (cellType === 'Boolean') countBoolean++;
      else countString++;

      // Safely accumulate numeric values for stats (if applicable)
      if (typeof val !== 'boolean') {
        const numVal = typeof val === 'number' ? val : Number(val);
        if (!isNaN(numVal)) {
          if (numVal < min) min = numVal;
          if (numVal > max) max = numVal;
          sum += numVal;
          numericCount++;
        }
      }
    }

    // Determine column-wide data type based on the most frequent cell type
    let dataType: 'String' | 'Integer' | 'Float' | 'Boolean' = 'String';
    let maxCount = -1;

    // Priority hierarchy if counts are equal (e.g., mix of int/float -> float; any string -> string)
    const types = [
      { name: 'Boolean', count: countBoolean },
      { name: 'Integer', count: countInteger },
      { name: 'Float', count: countFloat },
      { name: 'String', count: countString },
    ] as const;

    for (const t of types) {
      if (t.count > maxCount) {
        dataType = t.name;
        maxCount = t.count;
      }
    }

    // If everything was missing, fallback to String
    if (totalCount === missingCount) {
      dataType = 'String';
    }

    const missingPercentage = totalCount > 0 ? (missingCount / totalCount) * 100 : 0;
    const uniqueCount = uniqueValues.size;

    const profile: ColumnProfile = {
      name: colName,
      dataType,
      missingCount,
      missingPercentage: parseFloat(missingPercentage.toFixed(2)),
      uniqueCount,
    };

    // Only add numeric statistics for numeric fields with valid numbers
    if ((dataType === 'Integer' || dataType === 'Float') && numericCount > 0) {
      profile.min = min === Infinity ? undefined : parseFloat(min.toFixed(4));
      profile.max = max === -Infinity ? undefined : parseFloat(max.toFixed(4));
      profile.mean = parseFloat((sum / numericCount).toFixed(4));
    }

    return profile;
  });
}
