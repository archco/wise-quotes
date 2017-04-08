const WiseQuotes = require('../index.js');

let wq = new WiseQuotes();

(async () => {
  let result = await wq.feed();
  console.log(result);
})();
