import * as XLSX from 'xlsx';
import { formatDate, getImageUrl } from './formatters';

/**
 * Export array of trademarks to an .xlsx Excel file.
 *
 * @param {Array} trademarksList - List of trademark objects to export
 * @param {string} filename - Output filename (e.g. selected-trademarks.xlsx or trademarks.xlsx)
 */
export const exportTrademarksToExcel = (trademarksList, filename = 'trademarks.xlsx') => {
  if (!trademarksList || trademarksList.length === 0) return;

  const rows = trademarksList.map((tm) => ({
    'Trademark Name Arabic': tm.nameAr || '',
    'Trademark Name English': tm.nameEn || '',
    'Trademark Number': tm.trademarkNumber || '',
    'Class': tm.classNumber !== null && tm.classNumber !== undefined ? tm.classNumber : '',
    'Owner Name Arabic': tm.ownerNameAr || '',
    'Owner Name English': tm.ownerNameEn || '',
    'Nationality': tm.nationality || '',
    'Filing Date': tm.filingDate ? formatDate(tm.filingDate) : '',
    'Expiry Date': tm.expiryDate ? formatDate(tm.expiryDate) : '',
    'Status': tm.status || '',
    'Agent Name': tm.agentName || '',
    'Image URL': getImageUrl(tm.image) || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Trademarks');

  XLSX.writeFile(workbook, filename);
};
