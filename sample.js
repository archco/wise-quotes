const WiseQuotes = require('./index.js');
let file = '../db/sample.sqlite3';
let memory = ':memory:';

let wq = new WiseQuotes({
  database: memory
});
let errHandler = function (err) {
  throw err;
};

wq.migration()
.then((msg) => {
  // console.log(msg);
  return wq.feed();
}, errHandler)
.then((result) => {
  // console.log(result);
  return wq.read(1);
}, errHandler)
.then((row) => {
  console.log(row);
})
.catch(errHandler);
