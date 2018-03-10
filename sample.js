const WiseQuotes = require('./src/wise-quotes');
const DB = {
  file: '../db/sample.sqlite3',
  memory: ':memory:',
};

const wq = new WiseQuotes({
  database: DB.memory,
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
