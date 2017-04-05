const expect = require('chai').expect;

describe('test', () => {
  describe('#test()', () => {
    it('unit', () => {
      let foo = 'bar';
      let obj = {
        tea: ['java', 'mocha', 'chai']
      };

      expect(foo).to.be.a('string');
      expect(foo).to.equal('bar');
      expect(foo).to.have.lengthOf(3);

      expect(obj).to.have.property('tea').with.lengthOf(3);
    });
  });
});
