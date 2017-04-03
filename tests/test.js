const WiseQuotes = require('../index.js');
const path = require('path');

let wq = new WiseQuotes();

wq.random.then((res) => {
  console.log(res);
});
