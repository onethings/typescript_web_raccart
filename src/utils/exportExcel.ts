/**
 * Excel 匯出工具
 *
 * 使用 exceljs + file-saver 建立多 sheet 工作簿。
 * 對應 FRONTME.md 13.6 exportExcel 章節。
 */

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/** 表格欄位定義 */
export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

/**
 * 匯出資料為 Excel 檔案
 *
 * @param columns - 欄位定義
 * @param data - 資料陣列
 * @param filename - 檔名（不含副檔名）
 * @param sheetName - 工作表名稱
 *
 * @example
 * await exportExcel(
 *   [{ header: 'Name', key: 'name' }, { header: 'Status', key: 'status' }],
 *   [{ name: 'Device 1', status: 'online' }],
 *   'devices'
 * );
 */
export const exportExcel = async <T extends Record<string, unknown>>(
  columns: ExcelColumn[],
  data: T[],
  filename: string,
  sheetName: string = 'Sheet1',
): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // 定義欄位
  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width || 15,
  }));

  // 標題樣式
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1A237E' }, // indigo[900]
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.commit();

  // 資料
  data.forEach((row) => {
    worksheet.addRow(row);
  });

  // 邊框
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  // 產生並下載
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
};

/**
 * 匯出多 sheet Excel
 *
 * @param sheets - 多個工作表的定義
 * @param filename - 檔名
 *
 * @example
 * await exportMultiSheetExcel([
 *   { name: 'Devices', columns: [...], data: [...] },
 *   { name: 'Events', columns: [...], data: [...] },
 * ], 'report');
 */
export const exportMultiSheetExcel = async (
  sheets: Array<{
    name: string;
    columns: ExcelColumn[];
    data: Record<string, unknown>[];
  }>,
  filename: string,
): Promise<void> => {
  const workbook = new ExcelJS.Workbook();

  sheets.forEach(({ name, columns, data }) => {
    const worksheet = workbook.addWorksheet(name);

    worksheet.columns = columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 15,
    }));

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A237E' },
    };

    data.forEach((row) => worksheet.addRow(row));

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
};
