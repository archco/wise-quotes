// test
const chai = require('chai');
const should = chai.should();

const sqlite3 = require('sqlite3').verbose();
const SqlitePromiseDriver = require('../src/sqlite-promise-driver.js');
var spd = new SqlitePromiseDriver(':memory:');

describe('SqlitePromiseDriver', function () {
  before(function (done) {
    (async () => {
      await spd.exec("CREATE TABLE lorem (info TEXT)");
      for(let i = 0 ; i < 10 ; i++) {
        await spd.run("INSERT INTO lorem VALUES (?)", i);
      }
      return 'done';
    })()
      .then(r => {
        console.log(r);
        done();
      })
      .catch(done);
  });
  
  describe('#constructor', function () {
    
    it('should have property "db"', function () {
      console.log(spd.db);
      spd.should.have.property('db');
    });
    it('"db" should be an instanceof sqlite.Database', function () {
      spd.db.should.be.an.instanceof(sqlite3.Database);
    });
  });

  describe('#close', function () {
    let temp = new SqlitePromiseDriver(':memory:');

    it('should be fullfilled', function (done) {
      temp.close().then(() => {
        // console.log(temp);
        done();
      }).catch(done);
    });
  });

  describe('#run', function () {
    
    it('should be fullfilled', function (done) {
      spd.run('INSERT INTO lorem VALUES (?)', 'run')
        .then((result) => {
          console.log(result);
          done();
        })
        .catch(done);
    });
  });

  describe('#all', function () {
    
    it('should eventually be a array', async function () {
      let rows = await spd.all('select * from lorem');
      rows.should.be.a('array');
    });
  });

  describe('#each', function () {
    
    it('should', function (done) {
      spd.each('select * from lorem', [], (err, row) => {
        console.log(row.info);
      }).then((res) => {
        console.log(res);
        done();
      })
      .catch(done);
    });
  });

  describe('#prepare', function () {
    
    it('should be an instanceof sqlite3.Statement', function () {
      let stmt = spd.prepare('INSERT INTO lorem VALUES (?)');
      console.log(stmt);
      stmt.should.be.an.instanceof(sqlite3.Statement);
    });
  });
});
