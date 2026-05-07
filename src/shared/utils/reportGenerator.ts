import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export type ReportColumn = {
  header: string;
  key: string;
  width?: number;
};

export type ReportConfig = {
  title: string;
  sheetName?: string;
  columns: ReportColumn[];
};

export async function generateExcelReport(
  config: ReportConfig,
  data: Record<string, unknown>[],
  filename?: string,
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Blaunk Admin';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(config.sheetName ?? config.title);

  sheet.columns = config.columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width ?? 20,
  }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1A1A2E' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 20;

  sheet.addRows(data);

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: rowNumber % 2 === 0 ? 'FFF8F9FA' : 'FFFFFFFF' },
    };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, filename ?? `${config.title.replace(/\s+/g, '_')}.xlsx`);
}
