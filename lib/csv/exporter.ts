import Papa from 'papaparse';

/**
 * Serializes JSON dataset to CSV and triggers a client-side download.
 * @param dataset The array of row objects to export.
 * @param originalFilename The name of the original uploaded file to form the download name.
 */
export function exportToCSV(dataset: any[], originalFilename: string) {
  if (!dataset || dataset.length === 0) return;

  // Convert JSON dataset array back to CSV string format
  const csvString = Papa.unparse(dataset);

  // Create a blob representing the CSV content
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  // Form clean export filename
  const cleanName = originalFilename.replace(/\.csv$/i, '');
  const downloadName = `${cleanName}_cleaned.csv`;

  // Create temporary link element and click to download
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', downloadName);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Free up browser memory resources
  URL.revokeObjectURL(url);
}
