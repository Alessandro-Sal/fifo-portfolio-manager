// fifo.js
// FIFO Portfolio Manager logic for Google Sheets
// Author: Alessandro Saladino

/**
 * Helper function to generate a trade object.
 * Reusable for both Stocks and Crypto.
 * * @param {number} amount - Quantity of shares or coins
 * @param {number} price - Price per unit
 * @param {string} action - Type of action (Buy, Sell, DRIP, REWARD, etc.)
 * @returns {Object} The trade object
 */
function generateTrade(amount, price, action) {
  return {
    shares: amount,
    price: price,
    action: action
  };
}

/**
 * Calculates the Stock Portfolio using the FIFO (First-In, First-Out) method.
 * Default precision: 5 decimal places.
 * * @param {Array} security - Array of tickers/symbols
 * @param {Array} actions - Array of actions (Buy/Sell)
 * @param {Array} quantity - Array of quantities
 * @param {Array} price - Array of prices
 * @returns {Map} Portfolio map containing active lots
 */
function generateFifo(security, actions, quantity, price) {
  let portfolio = new Map();

  for (let i = 0; i < security.length; i++) {
    let ticker = security[i].toString();
    let action = actions[i].toString();
    let stockQuant = Number(quantity[i]);
    let stockPrice = Number(price[i]);
    let trade = generateTrade(stockQuant, stockPrice, action);

    // Handle Buys and Dividend Reinvestments
    if (action === "Buy" || action.toUpperCase() === "DRIP") {
      let activeTrades = portfolio.get(ticker);
      if (activeTrades == null) {
        portfolio.set(ticker, [trade]);
      } else {
        activeTrades.push(trade);
      }
    }

    // Handle Sells
    if (action === "Sell") {
      let activeTrades = portfolio.get(ticker);
      let precision = 5;

      if (activeTrades != null) {
        let sharesToSell = Number(Number(trade.shares).toFixed(precision));
        
        while (sharesToSell > 0) {
          sharesToSell = Number(Number(sharesToSell).toFixed(precision));
          
          if (activeTrades.length > 0) {
            let itemToSell = activeTrades[0];
            itemToSell.shares = Number(Number(itemToSell.shares).toFixed(precision));

            if (itemToSell.shares === sharesToSell) {
              // Exact match: sell the entire oldest lot
              sharesToSell = 0;
              activeTrades.splice(0, 1);
            } else if (itemToSell.shares < sharesToSell) {
              // Oldest lot is not enough: sell it all and continue to next lot
              sharesToSell -= itemToSell.shares;
              activeTrades.splice(0, 1);
            } else {
              // Oldest lot is larger: reduce the lot size
              itemToSell.shares -= sharesToSell;
              sharesToSell = 0;
            }
          } else {
            // Loop break if no more active trades exist (e.g., short selling or data error)
            sharesToSell = 0; 
          }
        }

        if (activeTrades.length === 0) {
          portfolio.delete(ticker);
        }
      }
    }
  }
  return portfolio;
}

/**
 * Main function for Stocks.
 * * @returns {Array} Array of [Ticker, Total Shares, Average Cost]
 */
function myPositions(security, actions, quantity, price) {
  let portfolio = generateFifo(security, actions, quantity, price);
  let returnArray = [];
  
  portfolio.forEach((value, key) => {
    let shares = 0;
    let totalCost = 0;
    let avgPrice = 0;

    value.forEach(trade => {
      shares += trade.shares;
      totalCost += trade.shares * trade.price;
    });

    if (shares > 0) {
      avgPrice = totalCost / shares;
    }

    returnArray.push([key, shares, avgPrice]);
  });
  
  return returnArray;
}

/**
 * Calculates the Crypto Portfolio using the FIFO method.
 * Precision increased to 8 decimal places to handle Bitcoin/ETH fractions.
 * * @returns {Map} Portfolio map containing active crypto lots
 */
function generateCryptoFifo(security, actions, quantity, price) {
  let portfolio = new Map();

  for (let i = 0; i < security.length; i++) {
    let ticker = security[i].toString();
    let action = actions[i].toString();
    let cryptoQuant = Number(quantity[i]);
    let cryptoPrice = Number(price[i]);

    let trade = generateTrade(cryptoQuant, cryptoPrice, action);

    // Handle Buys, Staking, and Rewards
    if (action === "Buy" || action.toUpperCase() === "DRIP" || action.toUpperCase() === "REWARD") {
      let activeTrades = portfolio.get(ticker);
      if (activeTrades == null) {
        portfolio.set(ticker, [trade]);
      } else {
        activeTrades.push(trade);
      }
    }

    // Handle Sells
    if (action === "Sell") {
      let activeTrades = portfolio.get(ticker);
      
      // *** High Precision for Crypto ***
      let precision = 8;

      if (activeTrades != null) {
        let sharesToSell = Number(Number(trade.shares).toFixed(precision));

        while (sharesToSell > 0) {
          sharesToSell = Number(Number(sharesToSell).toFixed(precision));

          if (activeTrades.length > 0) {
            let itemToSell = activeTrades[0];
            itemToSell.shares = Number(Number(itemToSell.shares).toFixed(precision));

            if (itemToSell.shares === sharesToSell) {
              sharesToSell = 0;
              activeTrades.splice(0, 1);
            } else if (itemToSell.shares < sharesToSell) {
              sharesToSell -= itemToSell.shares;
              activeTrades.splice(0, 1);
            } else {
              itemToSell.shares -= sharesToSell;
              sharesToSell = 0;
            }
          } else {
            sharesToSell = 0;
          }
        }

        if (activeTrades.length === 0) {
          portfolio.delete(ticker);
        }
      }
    }
  }
  return portfolio;
}

/**
 * Main function for Crypto.
 * * @returns {Array} Array of [Symbol, Total Coins, Average Buy Price]
 */
function myCryptoPositions(security, actions, quantity, price) {
  let portfolio = generateCryptoFifo(security, actions, quantity, price);
  let returnArray = [];

  portfolio.forEach((value, key) => {
    let totalCoins = 0;
    let totalCost = 0;
    let avgPrice = 0;

    value.forEach(trade => {
      totalCoins += trade.shares;
      totalCost += trade.shares * trade.price;
    });

    if (totalCoins > 0) {
      avgPrice = totalCost / totalCoins;
    } else {
      avgPrice = 0;
    }

    returnArray.push([key, totalCoins, avgPrice]);
  });

  return returnArray;
}
