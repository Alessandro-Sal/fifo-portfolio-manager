# FIFO Portfolio Manager 📊

A robust Google Apps Script toolkit designed to manage and calculate **Stock** and **Cryptocurrency** portfolio positions using the **First-In-First-Out (FIFO)** accounting method.

This script helps track cost basis, remaining shares/coins, and average buy prices directly inside Google Sheets, handling complex decimal precision for different asset classes.

## 🚀 Features

- **Dual Asset Support:**
  - **Stocks:** Standard calculation with **5-decimal** precision.
  - **Crypto:** High-precision calculation with **8-decimal** precision to handle fractional coins (e.g., BTC, ETH).
- **FIFO Logic:** Strictly sells the oldest lots first to accurately calculate the remaining cost basis.
- **Transaction Support:** Handles `Buy`, `Sell`, `DRIP` (Dividend Reinvestment), and `REWARD` (Staking/Airdrops).
- **Automation:** Includes an `onEdit` trigger to automatically timestamp entries when data is entered.
- **Spreadsheet Integration:** Designed to work as custom formulas inside Google Sheets cells.

## 🛠️ Installation

1. Open your Google Sheet.
2. Navigate to **Extensions** > **Apps Script**.
3. Create a new script file (e.g., `fifo.js`).
4. Copy and paste the project code into the editor.
5. Save the project.
6. Use the custom functions directly in your spreadsheet cells (e.g., `=myPositions(...)`).

## 🧩 Functions Overview

### 1. Stock Calculation
#### `myPositions(security, actions, quantity, price)`
Calculates the current portfolio status for standard stocks.
- **security:** Range of Tickers/Symbols.
- **actions:** Range of Actions (Buy, Sell, DRIP).
- **quantity:** Range of quantities transacted.
- **price:** Range of price per share.
- **Returns:** An array of `[Ticker, Total Shares, Average Cost]`.

### 2. Crypto Calculation
#### `myCryptoPositions(security, actions, quantity, price)`
Calculates the current portfolio status for cryptocurrencies. Uses **8 decimal precision** to prevent floating-point errors on small fractional amounts.
- **Returns:** An array of `[Symbol, Total Coins, Average Cost]`.

### 3. Automation
#### `onEdit(e)`
A built-in Google Sheets trigger.
- **Behavior:** Automatically inserts the current date in **Column A** when **Column B** is edited (active only from row 20 onwards to preserve headers).

## 📄 Example Usage

### In Google Sheets
Assuming your data is organized with Tickers in Col B, Actions in Col C, Qty in Col D, and Price in Col E:

```excel
=myPositions(B2:B, C2:C, D2:D, E2:E)
