const chai = require('chai');
const should = chai.should();

// test-unit
const WiseQuotes = require('../src/wise-quotes.js');

let sampleFile = '../db/sample.sqlite3';
let memory = ':memory:';
const wq = new WiseQuotes({
  database: memory
});

before(function (done) {
  let initialize = async () => {
    let result;
    result = await wq.migration();
    console.log(result);
    result = await wq.feed('feed-sample.json');
    console.log(result);
    // status.
    let count = await wq.count;
    console.log(`count: ${count}`);

    return 'initialized';
  };

  initialize()
  .then(r => {
    console.log(r);
    done();
  })
  .catch(done);
});

describe('WiseQuotes', function () {
  describe('#constructor', function () {
    it('should be an instanceof WiseQuotes', function () {
      wq.should.to.be.an.instanceof(WiseQuotes);
    });
    it('should have property "config"', function () {
      wq.should.have.property('config');
    });
    it('should have property "table"', function () {
      wq.should.have.property('table');
    });
    it('should have property "db"', function () {
      wq.should.have.property('db');
    });
    it('should have property "schema', function () {
      wq.should.have.property('schema');
    });
    it('should have property "tag"', function () {
      wq.should.have.property('tag');
    });
  });

  describe('#count', function () {
    
    it('should be fullfilled', function (done) {
      wq.count.then(() => {
        done();
      }).catch(done);
    });

    it('should eventually be a number', async function () {
      let count = await wq.count;
      count.should.be.a('number');
    });
  });

  describe('#read', function () {

    it('should be fullfilled', function (done) {
      wq.read(1).then(() => {
        done();
      }).catch(done);
    });

    it('should eventually be a object', async function () {
      let row = await wq.read(1);
      row.should.be.a('object');
    });
    
    it('should eventually include keys "id, content, author and language"', async function () {
      let row = await wq.read(1);
      row.should.include.keys('id', 'content', 'author', 'language');
    });
  });
});
