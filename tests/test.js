const WiseQuotes = require('../index.js');
const path = require('path');

let wq = new WiseQuotes();

wq.count.then((count) => {
  console.log(count);
});
