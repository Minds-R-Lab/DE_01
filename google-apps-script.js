/**
 * Google Apps Script — Chat Logger for DE Course AI Tutor
 * ========================================================
 *
 * This script receives chat data from the Cloudflare Worker and logs it
 * to a Google Sheet. It also creates a summary dashboard sheet.
 *
 * SETUP INSTRUCTIONS:
 *
 * 1. Create a new Google Sheet:
 *    - Go to https://sheets.google.com → Blank spreadsheet
 *    - Name it "DE AI Tutor — Chat Logs"
 *
 * 2. Open Apps Script:
 *    - In the spreadsheet, go to Extensions → Apps Script
 *    - Delete the default code, paste this ENTIRE file
 *    - Click the save icon (or Ctrl+S)
 *
 * 3. Run initial setup:
 *    - In the Apps Script editor, select "setupSheet" from the function dropdown
 *    - Click "Run"
 *    - Grant permissions when prompted (review, allow)
 *    - This creates the header row and formatting
 *
 * 4. Deploy as web app:
 *    - Click "Deploy" → "New deployment"
 *    - Click the gear icon → select "Web app"
 *    - Set "Execute as" → "Me"
 *    - Set "Who has access" → "Anyone"
 *    - Click "Deploy"
 *    - Copy the Web App URL
 *
 * 5. Add the URL to Cloudflare Worker:
 *    - Go to your Worker → Settings → Variables
 *    - Add a new Secret: GOOGLE_SHEET_WEBHOOK = the Web App URL you copied
 *
 * That's it! Every student chat will now appear in your spreadsheet.
 *
 * SHEET STRUCTURE:
 *   "Chat Logs" sheet — every message exchange (one row per Q&A pair)
 *   "Dashboard" sheet — auto-generated summary (students, chapters, usage)
 */

// ============================================================
// INITIAL SETUP — Run once to create headers and formatting
// ============================================================
function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // --- Chat Logs sheet ---
  var logs = ss.getSheetByName('Chat Logs');
  if (!logs) {
    logs = ss.insertSheet('Chat Logs');
  }

  var headers = [
    'Timestamp',
    'Student Name',
    'Student ID',
    'Major',
    'Chapter',
    'Student Message',
    'AI Response',
    'Input Tokens',
    'Output Tokens'
  ];

  var headerRange = logs.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#2563eb');
  headerRange.setFontColor('#ffffff');
  headerRange.setHorizontalAlignment('center');

  // Set column widths
  logs.setColumnWidth(1, 160);  // Timestamp
  logs.setColumnWidth(2, 140);  // Name
  logs.setColumnWidth(3, 100);  // ID
  logs.setColumnWidth(4, 120);  // Major
  logs.setColumnWidth(5, 180);  // Chapter
  logs.setColumnWidth(6, 400);  // Student Message
  logs.setColumnWidth(7, 400);  // AI Response
  logs.setColumnWidth(8, 100);  // Input Tokens
  logs.setColumnWidth(9, 110);  // Output Tokens

  // Freeze header row
  logs.setFrozenRows(1);

  // --- Dashboard sheet ---
  var dash = ss.getSheetByName('Dashboard');
  if (!dash) {
    dash = ss.insertSheet('Dashboard');
  }

  dash.getRange('A1').setValue('DE AI Tutor — Dashboard');
  dash.getRange('A1').setFontSize(16).setFontWeight('bold');
  dash.getRange('A3').setValue('This sheet updates automatically. Use Data → Refresh to see latest stats.');
  dash.getRange('A3').setFontColor('#64748b');

  dash.getRange('A5').setValue('Total Conversations');
  dash.getRange('A6').setValue('Unique Students');
  dash.getRange('A7').setValue('Total Tokens Used');
  dash.getRange('A8').setValue('Estimated Cost ($)');
  dash.getRange('A5:A8').setFontWeight('bold');

  // Formulas referencing Chat Logs
  dash.getRange('B5').setFormula('=COUNTA(\'Chat Logs\'!A:A)-1');
  dash.getRange('B6').setFormula('=IFERROR(COUNTA(UNIQUE(\'Chat Logs\'!B2:B)),0)');
  dash.getRange('B7').setFormula('=SUM(\'Chat Logs\'!H:H)+SUM(\'Chat Logs\'!I:I)');
  dash.getRange('B8').setFormula('=ROUND(SUM(\'Chat Logs\'!H:H)*0.25/1000000 + SUM(\'Chat Logs\'!I:I)*1.25/1000000, 4)');

  dash.getRange('A10').setValue('Messages by Chapter');
  dash.getRange('A10').setFontWeight('bold').setFontSize(12);

  dash.getRange('A11').setValue('Chapter');
  dash.getRange('B11').setValue('Count');
  dash.getRange('A11:B11').setFontWeight('bold').setBackground('#e2e8f0');

  // Top chapters (dynamic)
  for (var i = 0; i < 8; i++) {
    var row = 12 + i;
    dash.getRange('A' + row).setFormula(
      '=IFERROR(INDEX(QUERY(\'Chat Logs\'!E2:E, "SELECT E, COUNT(E) WHERE E IS NOT NULL GROUP BY E ORDER BY COUNT(E) DESC LABEL COUNT(E) \'\'", 0), ' + (i+1) + ', 1), "")'
    );
    dash.getRange('B' + row).setFormula(
      '=IFERROR(INDEX(QUERY(\'Chat Logs\'!E2:E, "SELECT E, COUNT(E) WHERE E IS NOT NULL GROUP BY E ORDER BY COUNT(E) DESC LABEL COUNT(E) \'\'", 0), ' + (i+1) + ', 2), "")'
    );
  }

  dash.getRange('A21').setValue('Messages by Student');
  dash.getRange('A21').setFontWeight('bold').setFontSize(12);

  dash.getRange('A22').setValue('Student');
  dash.getRange('B22').setValue('Messages');
  dash.getRange('C22').setValue('Last Active');
  dash.getRange('A22:C22').setFontWeight('bold').setBackground('#e2e8f0');

  for (var j = 0; j < 40; j++) {
    var sRow = 23 + j;
    dash.getRange('A' + sRow).setFormula(
      '=IFERROR(INDEX(QUERY(\'Chat Logs\'!B2:B, "SELECT B, COUNT(B) WHERE B IS NOT NULL GROUP BY B ORDER BY COUNT(B) DESC LABEL COUNT(B) \'\'", 0), ' + (j+1) + ', 1), "")'
    );
    dash.getRange('B' + sRow).setFormula(
      '=IFERROR(INDEX(QUERY(\'Chat Logs\'!B2:B, "SELECT B, COUNT(B) WHERE B IS NOT NULL GROUP BY B ORDER BY COUNT(B) DESC LABEL COUNT(B) \'\'", 0), ' + (j+1) + ', 2), "")'
    );
    dash.getRange('C' + sRow).setFormula(
      '=IFERROR(INDEX(QUERY(\'Chat Logs\'!A2:B, "SELECT MAX(A) WHERE B = \'" & A' + sRow + ' & "\' GROUP BY B LABEL MAX(A) \'\'", 0), 1, 1), "")'
    );
  }

  dash.setColumnWidth(1, 200);
  dash.setColumnWidth(2, 120);
  dash.setColumnWidth(3, 160);

  // Remove default Sheet1 if it exists
  var sheet1 = ss.getSheetByName('Sheet1');
  if (sheet1 && ss.getSheets().length > 1) {
    ss.deleteSheet(sheet1);
  }

  SpreadsheetApp.flush();
  Logger.log('Setup complete!');
}

// ============================================================
// WEBHOOK HANDLER — Called by Cloudflare Worker for each chat
// ============================================================
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var logs = ss.getSheetByName('Chat Logs');

    if (!logs) {
      logs = ss.insertSheet('Chat Logs');
      setupSheet();
    }

    // Format timestamp for readability
    var timestamp = data.timestamp || new Date().toISOString();
    try {
      var d = new Date(timestamp);
      timestamp = Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    } catch (err) {
      // Keep ISO format if parsing fails
    }

    // Truncate very long messages to avoid sheet cell limits (50k chars)
    var studentMsg = (data.studentMessage || '').substring(0, 5000);
    var aiMsg = (data.aiResponse || '').substring(0, 5000);

    // Append the row
    logs.appendRow([
      timestamp,
      data.studentName || 'Unknown',
      data.studentId || '',
      data.major || '',
      data.chapter || 'General',
      studentMsg,
      aiMsg,
      data.inputTokens || 0,
      data.outputTokens || 0
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('Error in doPost: ' + err.message);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================
// GET handler — simple status check
// ============================================================
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'active',
      service: 'DE AI Tutor Chat Logger',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
