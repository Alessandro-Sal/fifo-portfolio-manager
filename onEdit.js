// onEdit.js
// Google Sheets automation: updates date when column B is edited
// Author: Alessandro Saladino

/*Behavior:
 * - Works only on the "Expenses Tracker 2025" sheet.
 * - Reacts only when editing column B from FIRST_DATA_ROW downward.
 * - Automatically writes today's date in column A if it's empty or not a valid date.
 * - Finds all rows of the same month/year in column A (from FIRST_DATA_ROW downward).
 * - Finds the monthly summary row (1..12 in column A at the top of the sheet).
 * - For each column listed in SUMMARY_COLS, writes a SUM formula over
 *   the rows of the current month (e.g. =SUM(E20:E45)).
 *
 * NOTE:
 * - Adjust SHEET_NAME and FIRST_DATA_ROW according to your sheet structure.
 * - The summary rows must have the month numbers (1..12) in column A.
 */

function onEdit(e) {
  // If onEdit is run manually from the editor, e is undefined -> exit
  if (!e) return;

  var SHEET_NAME = 'Expenses Tracker 2025';

  // *** ADAPT ONLY THIS VALUE TO YOUR STRUCTURE ***
  var FIRST_DATA_ROW = 20; // first row where expenses start (with dates in column A)

  // Columns of the monthly totals to update:
  // E, F, G, H, I, J, K, L, P, Q, R, S, U..AE, AG, AH
  var SUMMARY_COLS = [
    5, 6, 7, 8, 9, 10,      // E..J
    11, 12,                 // K, L
    16, 17, 18, 19,         // P, Q, R, S
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, // U..AE
    33, 34                  // AG, AH
  ];
  // ***********************************************

  var range = e.range;
  var sheet = range.getSheet();

  // Work only on the correct sheet
  if (sheet.getName() !== SHEET_NAME) return;

  // Work only if editing column B and from FIRST_DATA_ROW downward
  if (range.getColumn() !== 2 || range.getRow() < FIRST_DATA_ROW) {
    return;
  }

  var row = range.getRow();

  // 1) Write today's date in column A if it's not already a valid date
  var dateCell = sheet.getRange(row, 1);
  var currentValue = dateCell.getValue();
  if (!(currentValue instanceof Date)) {
    dateCell.setValue(new Date());
    currentValue = dateCell.getValue();
  }

  // If for some reason it's still not a date, exit
  if (!(currentValue instanceof Date)) return;

  var d = currentValue;
  var year = d.getFullYear();
  var monthIndex = d.getMonth();    // 0 = January, 11 = December
  var monthNumber = monthIndex + 1; // 1..12

  // 2) Find all rows for THIS MONTH and THIS YEAR in column A
  //    (only from FIRST_DATA_ROW downward)
  var lastRow = sheet.getLastRow();
  if (lastRow < FIRST_DATA_ROW) return;

  var colAValues = sheet.getRange(FIRST_DATA_ROW, 1, lastRow - FIRST_DATA_ROW + 1, 1).getValues();
  var firstRowOfMonth = null;
  var lastRowOfMonth = null;

  for (var i = 0; i < colAValues.length; i++) {
    var val = colAValues[i][0];
    if (val instanceof Date &&
        val.getFullYear() === year &&
        val.getMonth() === monthIndex) {
      var realRow = FIRST_DATA_ROW + i;
      if (firstRowOfMonth === null) {
        firstRowOfMonth = realRow;
      }
      lastRowOfMonth = realRow;
    }
  }

  // If no rows for that month were found, exit
  if (firstRowOfMonth === null || lastRowOfMonth === null) {
    return;
  }

  // 3) Find the summary row for this MONTH (1..12 in column A) in the entire sheet
  var allRows = sheet.getLastRow();
  var monthValues = sheet.getRange(1, 1, allRows, 1).getValues(); // entire column A
  var summaryRow = null;

  for (var r = 0; r < monthValues.length; r++) {
    var cellVal = monthValues[r][0];

    // Accept both numbers and strings like "12"
    if (cellVal !== '' && cellVal != null) {
      var num = Number(cellVal);
      if (!isNaN(num) && num === monthNumber) {
        summaryRow = r + 1; // +1 because range index starts at 0
        break;
      }
    }
  }

  // If the month row is not found (e.g. missing "12" in column A), exit
  if (!summaryRow) return;

  // 4) For EACH column listed in SUMMARY_COLS, write/update the SUM formula
  for (var c = 0; c < SUMMARY_COLS.length; c++) {
    var colIndex = SUMMARY_COLS[c];
    var colLetter = columnToLetter(colIndex);

    // =SUM(E[firstRowOfMonth]:E[lastRowOfMonth]) adapted to the correct column
    var formula = '=SUM(' + colLetter + firstRowOfMonth + ':' + colLetter + lastRowOfMonth + ')';
    sheet.getRange(summaryRow, colIndex).setFormula(formula);
  }
}

/**
 * Converts a column number to its letter (e.g. 5 -> "E", 10 -> "J").
 *
 * @param {number} column - The 1-based column index.
 * @return {string} The corresponding column letter(s).
 */
function columnToLetter(column) {
  var temp;
  var letter = '';
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}
