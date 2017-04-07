const WiseQuotes = require('../index.js');

let wq = new WiseQuotes();

(async () => {
  let count = await wq.count;
  console.log(`Total rows: ${count}`);

  console.log(await wq.random);
})();
