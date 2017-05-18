const WiseQuotes = require('./index.js');
let file = '../db/sample.sqlite3';
let memory = ':memory:';

let wq = new WiseQuotes({
  database: memory,
});

(async function () {
  // initialize.
  let result;
  result = await wq.migration();
  console.log(result);
  result = await wq.feed('feed-sample.json');
  console.log(result);

  // status.
  let count = await wq.count;
  console.log(`count: ${count}`);
  console.log(await wq.random);

  // all.
  console.log(await wq.all());
})();
