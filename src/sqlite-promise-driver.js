const sqlite3 = require('sqlite3').verbose();

class SqlitePromiseDriver {
  constructor(filename, mode = null, callback = null) {
    this.db = new sqlite3.Database(filename, mode, callback);
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      })
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  each(sql, params = [], callback = null) {
    return new Promise((resolve, reject) => {
      this.db.each(sql, params, callback, (err, effected) => {
        if (err) {
          reject(err);
        } else {
          resolve(effected);
        }
      });
    });
  }

  exec(sql) {
    return new Promise((resolve, reject) => {
      this.db.exec(sql, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  prepare(sql, params = [], callback = null) {
    return this.db.prepare(sql, params, callback);
  }
}

module.exports = SqlitePromiseDriver;
