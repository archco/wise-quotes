const chai = require('chai');
chai.should();

// test-unit
const WiseQuotes = require('../src/wise-quotes.js');

const dbType = {
  file: '../db/sample.sqlite3',
  memory: ':memory:',
};
const wq = new WiseQuotes({
  database: dbType.memory,
  language: 'all',
});

describe('WiseQuotes', function () {

  before(function (done) {
    let initialize = async () => {
      await wq.migration();
      await wq.feed('feed-sample.json');

      // status.
      let count = await wq.count;

      return `initialized: count - ${count}`;
    };

    initialize()
      .then(r => {
        console.log(r);
        done();
      })
      .catch(done);
  });

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

    it('should eventually include keys "rowid, content, author and language"', async function () {
      let row = await wq.read(1);
      row.should.include.keys('rowid', 'content', 'author', 'language');
    });
  });

  describe('#all', function () {
    // get all quotes.

    it('should be fullfilled', function (done) {
      wq.all().then(() => {
        done();
      }).catch(done);
    });

    it('should eventually be an array', async function () {
      let rows = await wq.all();
      rows.should.be.an('array');
    });
  });

  describe('#retrieveByTagID', function () {

    it('should eventually be an array', async function () {
      let rows = await wq.retrieveByTagID(1);
      rows.should.be.an('array');
    });
  });

  describe('#retrieveByTagName', function () {

    it('should eventually be an array', async function () {
      let rows = await wq.retrieveByTagName('love');
      rows.should.be.an('array');
    });
  });

  describe('#match', () => {
    it('Returns result of quotes match "Nietzsche"', async function () {
      let rows = await wq.match('Nietzsche');
      rows.length.should.to.equal(3);
    });

    it('Tags are included in results row.', async function () {
      let rows = await wq.match('Nietzsche');
      rows[0].tags.should.not.empty;
    });
  });

  describe('#_getLanguageWhereClause', function () {

    it('should be a string', function () {
      let w = wq._getLanguageWhereClause();
      w.should.be.a('string');
    });
  });

  describe('#_refineSql', function () {

    it('should be a string', function () {
      let sql = wq._refineSql('SELECT COUNT(*) AS count FROM quote WHERE %L');
      sql.should.be.a('string');
    });
  });
});
