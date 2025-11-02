/**
 * Utility functions for exporting data in various formats
 */

// Convert array of objects to CSV string
export const convertToCSV = (data, headers = null) => {
  if (!data || data.length === 0) return '';

  // Use provided headers or extract from first object
  const csvHeaders = headers || Object.keys(data[0]);

  // Create CSV header row
  const headerRow = csvHeaders.join(',');

  // Create CSV data rows
  const dataRows = data.map(item => {
    return csvHeaders.map(header => {
      const value = item[header];
      // Handle special cases
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""');
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
};

// Download CSV file
export const downloadCSV = (data, filename = 'export.csv', headers = null) => {
  const csv = convertToCSV(data, headers);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Download JSON file
export const downloadJSON = (data, filename = 'export.json') => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Convert data to formatted text report
export const generateTextReport = (title, data, sections = []) => {
  let report = `${title}\n`;
  report += `Generated: ${new Date().toLocaleString()}\n`;
  report += `${'='.repeat(title.length)}\n\n`;

  sections.forEach(section => {
    report += `${section.title}:\n`;
    report += `${'-'.repeat(section.title.length)}\n`;
    
    if (Array.isArray(section.data)) {
      section.data.forEach((item, index) => {
        report += `${index + 1}. ${item}\n`;
      });
    } else if (typeof section.data === 'object') {
      Object.entries(section.data).forEach(([key, value]) => {
        report += `${key}: ${value}\n`;
      });
    } else {
      report += `${section.data}\n`;
    }
    
    report += '\n';
  });

  return report;
};

// Download text report
export const downloadTextReport = (title, data, sections, filename = 'report.txt') => {
  const report = generateTextReport(title, data, sections);
  const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Format data for export (clean up dates, format numbers, etc.)
export const formatDataForExport = (data, dateFields = [], numberFields = []) => {
  return data.map(item => {
    const formatted = { ...item };
    
    // Format date fields
    dateFields.forEach(field => {
      if (formatted[field]) {
        formatted[field] = new Date(formatted[field]).toLocaleString();
      }
    });
    
    // Format number fields
    numberFields.forEach(field => {
      if (formatted[field] !== null && formatted[field] !== undefined) {
        formatted[field] = Number(formatted[field]).toFixed(2);
      }
    });
    
    return formatted;
  });
};

