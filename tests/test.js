const WiseQuotes = require('../index.js');
const path = require('path');

let wq = new WiseQuotes();

wq.read(1, (res) => {
  console.log(res);
});
