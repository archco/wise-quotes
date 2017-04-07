const WiseQuotes = require('../index.js');

let wq = new WiseQuotes();

(async () => {
  result = await wq.feed();
  console.log(result);
})();
