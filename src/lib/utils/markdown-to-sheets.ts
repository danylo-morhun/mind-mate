/**
 * Convert markdown content to a table format suitable for Google Sheets
 * Handles headings, lists, paragraphs, and tables
 */

export interface SheetRow {
  cells: string[];
  isHeader?: boolean;
  level?: number; // For nested headings
}

/**
 * Convert markdown to sheet rows
 */
export function markdownToSheetRows(markdown: string): SheetRow[] {
  if (!markdown || !markdown.trim()) {
    return [];
  }

  const lines = markdown.split('\n');
  const rows: SheetRow[] = [];
  let currentSection: string[] = [];
  let currentLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) {
      // Empty line - flush current section if exists
      if (currentSection.length > 0) {
        rows.push({
          cells: [currentSection.join(' ')],
          isHeader: false,
        });
        currentSection = [];
      }
      continue;
    }

    // Check for headings
    const h1Match = line.match(/^#\s+(.+)$/);
    const h2Match = line.match(/^##\s+(.+)$/);
    const h3Match = line.match(/^###\s+(.+)$/);
    const h4Match = line.match(/^####\s+(.+)$/);
    const h5Match = line.match(/^#####\s+(.+)$/);
    const h6Match = line.match(/^######\s+(.+)$/);

    if (h1Match || h2Match || h3Match || h4Match || h5Match || h6Match) {
      // Flush current section before adding heading
      if (currentSection.length > 0) {
        rows.push({
          cells: [currentSection.join(' ')],
          isHeader: false,
        });
        currentSection = [];
      }

      const headingText = h1Match?.[1] || h2Match?.[1] || h3Match?.[1] || 
                          h4Match?.[1] || h5Match?.[1] || h6Match?.[1] || '';
      const level = h1Match ? 1 : h2Match ? 2 : h3Match ? 3 : 
                    h4Match ? 4 : h5Match ? 5 : 6;
      
      // Add heading as header row
      rows.push({
        cells: [headingText],
        isHeader: true,
        level: level,
      });
      currentLevel = level;
      continue;
    }

    // Check for markdown tables
    if (line.includes('|') && line.split('|').length > 2) {
      // Flush current section
      if (currentSection.length > 0) {
        rows.push({
          cells: [currentSection.join(' ')],
          isHeader: false,
        });
        currentSection = [];
      }

      // Parse table row
      const cells = line
        .split('|')
        .map(cell => cell.trim())
        .filter(cell => cell.length > 0 && !/^:?-+:?$/.test(cell)); // Filter out separator rows
      
      if (cells.length > 0) {
        // Check if it's a header row (next line might be separator)
        const isHeaderRow = i + 1 < lines.length && 
                           lines[i + 1].trim().match(/^[\|\s:-\|]+$/);
        
        rows.push({
          cells: cells,
          isHeader: isHeaderRow || false,
        });
        
        // Skip separator row if exists
        if (isHeaderRow) {
          i++;
        }
      }
      continue;
    }

    // Check for lists
    const ulMatch = line.match(/^[-*+]\s+(.+)$/);
    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    
    if (ulMatch || olMatch) {
      // Flush current section
      if (currentSection.length > 0) {
        rows.push({
          cells: [currentSection.join(' ')],
          isHeader: false,
        });
        currentSection = [];
      }

      const listText = ulMatch?.[1] || olMatch?.[1] || '';
      // Remove markdown formatting from list item
      const cleanText = listText
        .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
        .replace(/\*(.*?)\*/g, '$1') // Italic
        .replace(/`(.*?)`/g, '$1') // Code
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1'); // Links
      
      rows.push({
        cells: ['•', cleanText],
        isHeader: false,
      });
      continue;
    }

    // Regular paragraph text
    // Remove markdown formatting
    const cleanText = line
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1') // Italic
      .replace(/`(.*?)`/g, '$1') // Code
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Links
      .replace(/^#+\s+/, '') // Headings (shouldn't happen but just in case)
      .trim();

    if (cleanText) {
      currentSection.push(cleanText);
    }
  }

  // Flush remaining section
  if (currentSection.length > 0) {
    rows.push({
      cells: [currentSection.join(' ')],
      isHeader: false,
    });
  }

  return rows;
}

/**
 * Get the maximum number of columns across all rows
 */
export function getMaxColumns(rows: SheetRow[]): number {
  if (rows.length === 0) return 0;
  return Math.max(...rows.map(row => row.cells.length), 0);
}

/**
 * Convert column number to letter (A, B, ..., Z, AA, AB, ...)
 */
export function getColumnLetter(colNum: number): string {
  let result = '';
  while (colNum > 0) {
    colNum--;
    result = String.fromCharCode(65 + (colNum % 26)) + result;
    colNum = Math.floor(colNum / 26);
  }
  return result;
}

