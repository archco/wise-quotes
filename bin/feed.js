const WiseQuotes = require('../index.js');

let wq = new WiseQuotes();

wq.feed()
.then(() => {
  console.log('Feed Complete.');
});
