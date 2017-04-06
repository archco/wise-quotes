const expect = require('chai').expect;

describe('test', () => {
  describe('#test()', () => {
    let foo = 'bar';
    let obj = {
      tea: ['java', 'mocha', 'chai']
    };

    it('foo', () => {
      expect(foo).to.be.a('string');
      expect(foo).to.equal('bar');
      expect(foo).to.have.lengthOf(3);
    });

    it('obj', () => {
      expect(obj).to.have.property('tea').with.lengthOf(3);
    });
  });
});
