/**
 * Parse CSV content into a structured table format
 */
export interface TableData {
  headers: string[];
  rows: string[][];
}

/**
 * Parse CSV string into table data
 * Handles basic CSV parsing with comma separators
 */
export function parseCSV(csvContent: string): TableData {
  if (!csvContent || !csvContent.trim()) {
    return { headers: [], rows: [] };
  }

  const lines = csvContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  // Parse headers (first line)
  const headers = parseCSVLine(lines[0]);

  // Parse rows (remaining lines)
  const rows = lines.slice(1).map(line => parseCSVLine(line));

  return { headers, rows };
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add the last field
  result.push(current.trim());

  return result;
}

/**
 * Get a preview of the table (first few rows)
 */
export function getTablePreview(tableData: TableData, maxRows: number = 5): TableData {
  return {
    headers: tableData.headers,
    rows: tableData.rows.slice(0, maxRows)
  };
}

