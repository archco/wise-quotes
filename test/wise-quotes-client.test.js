const chai = require('chai');
const should = chai.should();

// test target.
const WiseQuotesClient = require('../index.js').client;
let wqc = new WiseQuotesClient({
  language: 'en'
});

/************************************************************
  Describes
*************************************************************/
describe('WiseQuotesClient', function () {
    
  describe('#constructor', function () {
    
    it('should have property "option"', function () {
      // console.log(wqc.option);
      wqc.should.have.property('option');
    });
    it('should have property "quotes"', function () {
      // console.log(wqc.quotes.length);
      wqc.should.have.property('quotes');
    });
    /*it('"option.language" should equal "all"', function () {
      wqc.option.language.should.equal(['ko', 'ja']);
    });*/
  });

  describe('#status', function () {
    
    it('should be a string', function () {
      let str = wqc.status;
      console.log(str);
      str.should.be.a('string');
    });
  });

  describe('#read', function () {
    
    it('should be a object', function () {
      let row = wqc.read(0);
      row.should.be.a('object');
    });
  });

  describe('#all', function () {
    
    it('should be a array', function () {
      let rows = wqc.all();
      // console.log(rows.length);
      rows.should.be.a('array');
    });
  });

  describe('#random', function () {

    it('should be a object', function () {
      let row = wqc.random();
      // console.log(row);
      row.should.be.a('object');
    });
  });
});
