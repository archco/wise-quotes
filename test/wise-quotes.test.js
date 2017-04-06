const chai = require('chai');
const chaiAsPromiese = require('chai-as-promised');
chai.use(chaiAsPromiese);
const should = chai.should();

const WiseQuotes = require('../src/wise-quotes.js');


describe('WiseQuotes', function () {
  let wq = new WiseQuotes();

  describe('#count', function () {
    let promise = wq.count;

    it('should be fullfilled', function () {
      promise.should.be.fullfilled;
    });
    it('should eventually be a number', function () {
      promise.should.eventually.be.a('number');
    });
  });
});
