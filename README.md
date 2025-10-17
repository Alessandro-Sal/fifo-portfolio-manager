# FIFO Portfolio Manager 📊

A Google Apps Script to manage and calculate stock positions using FIFO (First-In-First-Out) logic.

## 🚀 Features
- Calculates remaining stock positions using FIFO logic  
- Handles Buy, Sell, and DRIP transactions  
- Automatically updates dates in Google Sheets when editing rows  
- Lightweight and easy to integrate

## 🧩 Functions Overview
### `generateTrade(stockQuant, stockPrice, action)`
Creates a trade object.

### `generateFifo(security, actions, quantity, price)`
Applies FIFO logic to maintain active trades per ticker.

### `myPositions(security, actions, quantity, price)`
Returns the list of open positions with average price.

### `onEdit(e)`
Google Sheets trigger function that auto-fills the date in column A when column B is edited (from row 20 onward).

## 📄 Example Usage
```javascript
const security = ["AAPL", "AAPL", "AAPL"];
const actions = ["Buy", "Buy", "Sell"];
const quantity = [10, 5, 8];
const price = [150, 160, 170];

console.log(myPositions(security, actions, quantity, price));
// Output: [["AAPL", 7, 154.29]]
