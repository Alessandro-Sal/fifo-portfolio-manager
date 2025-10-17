// fifo.js
// FIFO Portfolio Manager logic for Google Sheets
// Author: Alessandro Saladino

function generateTrade(stockQuant, stockPrice, action) {
  return {
    shares: stockQuant,
    price: stockPrice,
    action: action
  };
}

function generateFifo(security, actions, quantity, price) {
  let portfolio = new Map();

  for (var i = 0; i < security.length; i++) {
    let ticker = security[i].toString();
    let action = actions[i].toString();
    let stockQuant = Number(quantity[i]);
    let stockPrice = Number(price[i]);
    let trade = generateTrade(stockQuant, stockPrice, action);

    if (action == "Buy" || action.toUpperCase() == "DRIP") {
      let activeTrades = portfolio.get(ticker);
      if (activeTrades == null) {
        portfolio.set(ticker, [trade]);
      } else {
        activeTrades.push(trade);
      }
    }

    if (action == "Sell") {
      let activeTrades = portfolio.get(ticker);
      let precision = 5;

      if (activeTrades != null) {
        let sharesToSell = Number(Number(trade.shares).toFixed(precision));
        while (sharesToSell > 0) {
          sharesToSell = Number(Number(sharesToSell).toFixed(precision));
          if (activeTrades.length > 0) {
            let itemToSell = activeTrades[0];
            itemToSell.shares = Number(Number(itemToSell.shares).toFixed(precision));

            if (itemToSell.shares == sharesToSell) {
              sharesToSell = 0;
              activeTrades.splice(0, 1);
            } else if (itemToSell.shares < sharesToSell) {
              sharesToSell -= itemToSell.shares;
              activeTrades.splice(0, 1);
            } else {
              itemToSell.shares -= sharesToSell;
              sharesToSell = 0;
            }
          }
        }

        if (activeTrades.length == 0) {
          portfolio.delete(ticker);
        }
      }
    }
  }

  return portfolio;
}

function myPositions(security, actions, quantity, price) {
  let portfolio = generateFifo(security, actions, quantity, price);
  let returnArray = [];

  portfolio.forEach((value, key) => {
    let shares = 0;
    let totalCost = 0;
    let avgPrice = 0;

    value.map(trade => {
      shares += trade.shares;
      totalCost += trade.shares * trade.price;
    });

    avgPrice = totalCost / shares;
    returnArray.push([key, shares, avgPrice]);
  });

  return returnArray;
}
