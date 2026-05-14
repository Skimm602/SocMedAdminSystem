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

    const values = sheet.getDataRange().getDisplayValues();

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
