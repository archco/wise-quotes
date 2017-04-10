const path = require('path');
const jsonfile = require('jsonfile');
const WiseQuotes = require('../index.js');

let wq = new WiseQuotes();
let file = path.resolve(__dirname, '../db/quotes.json');

(async () => {
  let rows = await wq.all();
  
  jsonfile.writeFile(file, rows, {spaces: 0}, function (err) {
    if (err) {
      console.error(err);  
    } else {
      console.log(`Generate File: ${file}`);
    }
  });
})();
