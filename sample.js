const WiseQuotes = require('./index.js');
let file = '../db/sample.sqlite3';
let memory = ':memory:';

let wq = new WiseQuotes({
  database: memory
});
/*let errHandler = function (err) {
  throw err;
};*/
(async function () {
  let result;
  result = await wq.migration();
  console.log(result);
  result = await wq.feed();
  console.log(result);
})();


/*wq.migration()
.then((msg) => {
  // console.log(msg);
  wq.feed();
}, errHandler)
.then((result) => {
  // consol.log(result);
  return wq.count;
})
.then((result) => {
  console.log(`count: ${result}`);
  return wq.read(5);
}, errHandler)
.then((row) => {
  console.log(row);
})
.catch(errHandler);*/
