const path = require('path');
const jsonfile = require('jsonfile');
const dateformat = require('dateformat');
const WiseQuotes = require('../index.js');

let wq = new WiseQuotes();
let file = path.resolve(__dirname, '../db/backup/' + dateformat(new Date(), 'yyyymmdd') + '_quotes.json');

(async () => {
  let rows = await wq.all();
  
  jsonfile.writeFile(file, rows, {spaces: 2}, function (err) {
    if (err) {
      console.error(err);  
    } else {
      console.log(`Backup to: ${file}`);
    }
  });
})();
