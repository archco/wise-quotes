// test
const chai = require('chai');
const should = chai.should();

// modules.
const sqlite3 = require('sqlite3').verbose();
const WiseQuotes = require('../src/wise-quotes.js');
const Tag = require('../src/tag.js');

// prepare variables and instance.
var dbTarget = {
  memory: ':memory:',
  file: '../db/sample.sqlite3'
};
var wq = new WiseQuotes({
  database: dbTarget.memory
});
var tag = wq.tag;

describe('Tag', function () {
  
  describe('#constructor', function () {
    
    it('should have property "db"', function () {
      tag.should.have.property('db');
    });
    it('should have property "table"', function () {
      tag.should.have.property('table');
    });
    it('property "db" should be an instanceof sqlite3.Database', function () {
      tag.db.should.to.be.an.instanceof(sqlite3.Database);
    });
  });
})
