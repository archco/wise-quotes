const sqlite3 = require('sqlite3').verbose();

class SqlitePromiseDriver {
  constructor(filename, mode = undefined, callback = undefined) {
    this.db = new sqlite3.Database(filename, mode, callback);
  }

  /**
   * close
   *
   * @returns {Promise.<true, Error>}
   */
  close() {
    return new Promise((resolve, reject) => {
      this.db.close(err => {
        err ? reject(err) : resolve(true);
      });
    });
  }

  /**
   * run
   *
   * @param  {String} sql
   * @param  {Array}  params
   * @returns {Promise.<object, Error>} Statement {sql: string, lastID: number, changes: number}
   */
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        err ? reject(err) : resolve(this);
      });
    });
  }

  /**
   * get
   *
   * @param  {String} sql
   * @param  {Array}  params
   * @returns {Promise.<object, Error>} Row as object.
   */
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        err ? reject(err) : resolve(row);
      });
    });
  }

  /**
   * all
   *
   * @param  {String} sql
   * @param  {Array}  params
   * @returns {Promise.<Array, Error>} Rows as object[].
   */
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        err ? reject(err) : resolve(rows);
      });
    });
  }

  /**
   * each - There is currently no way to abort execution.
   *
   * @param  {String}   sql
   * @param  {Array}    params
   * @param  {Function} callback (err, row)
   * @returns {Promise.<number, Error>} The number of affected.
   */
  each(sql, params = [], callback = null) {
    return new Promise((resolve, reject) => {
      const completeHandle = (err, effected) => {
        err ? reject(err) : resolve(effected);
      };

      if (typeof arguments[1] === 'function') {
        this.db.each(sql, arguments[1], completeHandle);
      } else {
        this.db.each(sql, params, callback, completeHandle);
      }
    });
  }

  /**
   * exec
   *
   * @param  {String} sql
   * @returns {Promise.<true, Error>}
   */
  exec(sql) {
    return new Promise((resolve, reject) => {
      this.db.exec(sql, function (err) {
        err ? reject(err) : resolve(true);
      });
    });
  }

  /**
   * prepare
   *
   * @param  {String}   sql
   * @param  {Array}    params
   * @param  {Function} callback
   * @returns {Statement}
   */
  prepare(sql, params = [], callback = null) {
    return this.db.prepare(sql, params, callback);
  }
}

module.exports = SqlitePromiseDriver;
