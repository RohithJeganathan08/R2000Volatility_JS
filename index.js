const Papa = require('papaparse');
const fs = require('fs');

// Step 1: Import the CSV file
const csvData = fs.readFileSync('russell2000.csv', 'utf8');
const parsedData = Papa.parse(csvData, { header: true }).data;

// Step 2: Extract data for each stock's past earnings seasons
const stockData = {};
parsedData.forEach(row => {
  const stockSymbol = row['Symbol'];
  const quarter = row['Quarter'];
  const eps = parseFloat(row['Earnings']);
  const actualEps = parseFloat(row['Actual EPS']);
  const surprisePercentage = ((actualEps - eps) / eps) * 100;

  if (!stockData[stockSymbol]) {
    stockData[stockSymbol] = [];
  }

  stockData[stockSymbol].push({
    quarter,
    eps,
    actualEps,
    surprisePercentage
  });
});

// Step 3: Identify stocks with significant percentage changes in stock price
const volatileStocks = [];
for (const [stockSymbol, data] of Object.entries(stockData)) {
  let hasSignificantChange = false;
  let latestPrice = 0;

  for (const earnings of data) {
    const priceChange = earnings.surprisePercentage;
    if (Math.abs(priceChange) >= 30) {
      hasSignificantChange = true;
      break;
    }

    // Get the latest price from the latest earnings report
    if (earnings.quarter === 'Q4 2022') {
      latestPrice = earnings.actualEps;
    }
  }

  if (hasSignificantChange) {
    volatileStocks.push({
      symbol: stockSymbol,
      latestPrice,
      priceChange
    });
  }
}

// Step 4: Sort the array of objects based on the magnitude of the percentage change in stock price
volatileStocks.sort((a, b) => Math.abs(b.priceChange) - Math.abs(a.priceChange));

// Print the top 10 most volatile stocks
console.log('Top 10 Most Volatile Stocks:');
console.log('===========================');
for (let i = 0; i < 10; i++) {
  console.log(`#${i + 1} - ${volatileStocks[i].symbol}: ${volatileStocks[i].priceChange.toFixed(2)}%`);
}
