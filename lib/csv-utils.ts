/**
 * CSV Export/Import Utilities
 */

import { safeRemoveElement } from "./dom-utils";

/**
 * Convert array of objects to CSV string
 */
export function convertToCSV(data: any[], headers: string[]): string {
  if (!data || data.length === 0) {
    return headers.join(",");
  }

  // Create header row
  const headerRow = headers.join(",");

  // Create data rows
  const dataRows = data.map((row) => {
    return headers
      .map((header) => {
        const value = row[header] || "";
        // Escape commas, quotes, and newlines
        if (typeof value === "string") {
          const escaped = value.replace(/"/g, '""');
          return `"${escaped}"`;
        }
        // Handle arrays
        if (Array.isArray(value)) {
          return `"${value.join(", ")}"`;
        }
        // Handle objects
        if (value && typeof value === "object") {
          return `"${JSON.stringify(value)}"`;
        }
        return value;
      })
      .join(",");
  });

  return [headerRow, ...dataRows].join("\n");
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  
  // Check if document.body exists before appending
  if (document.body) {
    document.body.appendChild(link);
    link.click();
    
    // Safely remove the link element with a small delay to ensure click completes
    setTimeout(() => {
      safeRemoveElement(link);
    }, 100);
  }
  
  URL.revokeObjectURL(url);
}

/**
 * Parse CSV file to array of objects
 */
export function parseCSV(csvText: string): { headers: string[]; rows: any[] } {
  const lines = csvText.split("\n").filter((line) => line.trim());
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  // Parse headers
  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/^"|"$/g, ""));

  // Parse data rows
  const rows = lines.slice(1).map((line) => {
    const values: string[] = [];
    let currentValue = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          currentValue += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        // End of field
        values.push(currentValue.trim());
        currentValue = "";
      } else {
        currentValue += char;
      }
    }
    // Add last value
    values.push(currentValue.trim());

    // Create object from headers and values
    const row: any = {};
    headers.forEach((header, index) => {
      let value = values[index] || "";
      // Remove surrounding quotes if present
      value = value.replace(/^"|"$/g, "");
      // Try to parse as JSON if it looks like JSON
      if (value.startsWith("{") || value.startsWith("[")) {
        try {
          value = JSON.parse(value);
        } catch {
          // Keep as string if parsing fails
        }
      }
      row[header] = value;
    });
    return row;
  });

  return { headers, rows };
}

/**
 * Read CSV file from input
 */
export function readCSVFile(file: File): Promise<{ headers: string[]; rows: any[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCSV(text);
        resolve(parsed);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

