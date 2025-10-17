// onEdit.js
// Google Sheets automation: updates date when column B is edited
// Author: Alessandro Saladino

function onEdit(e) {
  var sheet = e.source.getSheetByName('Filename'); // change name if needed
  var range = e.range;

  // Check if edit happens in column B
  if (range.getColumn() == 2) {
    var row = range.getRow();

    // Only from row 20 and below
    if (row >= 20) {
      var dateCell = sheet.getRange(row, 1); // column A
      dateCell.setValue(new Date());
    }
  }
}
