// test
const chai = require('chai');
const should = chai.should();

// modules.
const SqlitePromiseDriver = require('../src/sqlite-promise-driver.js');
const WiseQuotes = require('../src/wise-quotes.js');

// prepare variables and instance.
const dbTarget = {
  memory: ':memory:',
  file: '../db/sample.sqlite3',
};
const wq = new WiseQuotes({
  database: dbTarget.memory,
});
const tag = wq.tag;

describe('Tag', function () {

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

    it('should have property "db"', function () {
      tag.should.have.property('db');
    });

    it('should have property "table"', function () {
      tag.should.have.property('table');
    });

    it('property "db" should be an instanceof SqlitePromiseDriver', function () {
      tag.db.should.to.be.an.instanceof(SqlitePromiseDriver);
    });
  });

  describe('#getByName', function () {

    it('should eventually be a object', async function () {
      let row = await tag.getByName('love');
      row.should.be.a('object');
    });

    it('if no exist tag should eventually return undefined', async function () {
      let row = await tag.getByName('no-name');
      should.not.exist(row);
    });
  });
});
