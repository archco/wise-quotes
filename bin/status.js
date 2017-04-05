const WiseQuotes = require('../index.js');

let wq = new WiseQuotes();

wq.count.then((count) => {
  console.log(`Total rows: ${count}`);
});

wq.random.then((res) => {
  console.log(res);
})
.catch((err) => {
  throw err;
});
