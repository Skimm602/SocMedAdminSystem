const SPREADSHEET_ID = '15obwGmVNG5R6gxDQGmqTx2p2tiEoSiPWhe02EeCDctI';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Social Media Admin Dashboard')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getAllSheets() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    return {
      success: true,
      title: ss.getName(),
      sheets: ss.getSheets().map(function(s) {
        return {
          name: s.getName(),
          rowCount: Math.max(0, s.getLastRow() - 1),
          colCount: s.getLastColumn()
        };
      })
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function getSheetData(sheetName) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = sheetName ? ss.getSheetByName(sheetName) : ss.getSheets()[0];
    if (!sheet) throw new Error('Sheet not found: ' + (sheetName || 'first sheet'));

    const dataRange = sheet.getDataRange();
    const values = dataRange.getDisplayValues();

    // Fill down merged cell values so blank cells show their merged parent's value
    const rowOffset = dataRange.getRow() - 1;
    const colOffset = dataRange.getColumn() - 1;
    dataRange.getMergedRanges().forEach(function(mr) {
      const r0 = mr.getRow() - 1 - rowOffset;
      const c0 = mr.getColumn() - 1 - colOffset;
      const numR = mr.getNumRows();
      const numC = mr.getNumColumns();
      if (r0 < 0 || r0 >= values.length) return;
      const topVal = (values[r0] && values[r0][c0]) ? values[r0][c0] : '';
      for (let r = r0 + 1; r < r0 + numR && r < values.length; r++) {
        for (let c = c0; c < c0 + numC && values[r] && c < values[r].length; c++) {
          values[r][c] = topVal;
        }
      }
    });

    return {
      success: true,
      sheetName: sheet.getName(),
      headers: values.length > 0 ? values[0].map(String) : [],
      rows: values.length > 1 ? values.slice(1) : [],
      totalRows: Math.max(0, values.length - 1),
      lastUpdated: Utilities.formatDate(
        new Date(),
        Session.getScriptTimeZone(),
        "MMM d, yyyy 'at' h:mm a"
      )
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function addRow(sheetName, rowData) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error('Sheet not found: ' + sheetName);
    sheet.appendRow(rowData);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
