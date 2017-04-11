// test
const chai = require('chai');
const should = chai.should();

// modules.
const SqlitePromiseDriver = require('../src/sqlite-promise-driver.js');
const WiseQuotes = require('../src/wise-quotes.js');
const Schema = require('../src/schema.js');

// prepare variables and instance.
var dbTarget = {
  memory: ':memory:',
  file: '../db/sample.sqlite3'
};
var wq = new WiseQuotes({
  database: dbTarget.memory
});
var schema = wq.schema;

describe('Schema', function () {
  
  describe('#constructor', function () {
    
    it('should have property "db"', function () {
      schema.should.have.property('db');
    });
    it('should have property "table"', function () {
      schema.should.have.property('table');
    });
    it('property "db" should be an instanceof SqlitePromiseDriver', function () {
      schema.db.should.to.be.an.instanceof(SqlitePromiseDriver);
    });
  });
});
