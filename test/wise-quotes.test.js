const chai = require('chai');
const chaiAsPromiese = require('chai-as-promised');
chai.use(chaiAsPromiese);
const should = chai.should();

const WiseQuotes = require('../src/wise-quotes.js');
const wq = new WiseQuotes({
  database: ":memory:"
});

before(function (done) {
  wq.migration()
  .then(() => {
    return wq.feed();
  }, done)
  .then(() => {
    done();
  }, done);
});

describe('WiseQuotes', function () {
  
  describe('#count', function () {
    let promise = wq.count;

    it('should be fullfilled', function () {
      promise.should.be.fullfilled;
    });
    it('should eventually be a number', function () {
      promise.should.eventually.be.a('number');
    });
  });

  describe('#read', function () {
    let promise = wq.read(1);
    promise.then((row) => {console.log(row);});

    it('should be fullfilled', function () {
      promise.should.be.fullfilled;
    });
    it('should eventually be a object', function () {
      promise.should.eventually.be.a('object');
    });
  });
});
