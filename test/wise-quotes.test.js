const chai = require('chai');
const chaiAsPromiese = require('chai-as-promised');
chai.use(chaiAsPromiese);
const should = chai.should();

// test-unit
const WiseQuotes = require('../src/wise-quotes.js');

let sampleFile = '../db/sample.sqlite3';
let memory = ':memory:';
const wq = new WiseQuotes({
  database: sampleFile
});

describe('WiseQuotes', function () {
  before(function (done) {
    let initialize = async () => {
      /*// initialize.
      let result;
      result = await wq.migration();
      console.log(result);
      result = await wq.feed();
      console.log(result);*/
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
    .catch(err => {
      throw err;
    });
  });

  describe('#count', function () {
    let promise = wq.count;
    promise.catch((err) => {
      throw err;
    });

    it('should be fullfilled', function () {
      promise.should.be.fullfilled;
    });
    it('should eventually be a number', function () {
      promise.should.eventually.be.a('number');
    });
  });

  describe('#read', function () {
    let promise = wq.read(1);
    promise.catch((err) => {
      throw err;
    });

    it('should be fullfilled', function () {
      promise.should.be.fullfilled;
    });
    it('should eventually be a object', function () {
      promise.should.eventually.be.a('object');
    });
  });
});
