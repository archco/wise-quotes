const sqlite3 = require('sqlite3').verbose();

class SqlitePromiseDriver {
  constructor(filename, mode = undefined, callback = undefined) {
    this.db = new sqlite3.Database(filename, mode, callback);
  }

  /**
   * close
   * 
   * @return {Promise} [ resolve(true) | reject(err) ]
   */
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

  /**
   * run
   * 
   * @param  {String} sql
   * @param  {Array}  params
   * @return {Promise} [ resolve({Object} result) | reject(err) ]
   */
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

  /**
   * get
   * 
   * @param  {String} sql
   * @param  {Array}  params
   * @return {Promise} [ resolve({Object} row) | reject(err) ]
   */
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

  /**
   * all
   * 
   * @param  {String} sql
   * @param  {Array}  params
   * @return {Promise} [ resolve({Array} rows) | reject(err) ]
   */
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

  /**
   * each - There is currently no way to abort execution.
   * 
   * @param  {String}   sql
   * @param  {Array}    params
   * @param  {Function} callback
   * @return {Promise} [ resolve({Number} effected) | reject(err) ]
   */
  each(sql, params = [], callback = null) {
    return new Promise((resolve, reject) => {
      let completeHandle = (err, effected) => {
        if (err) {
          reject(err);
        } else {
          resolve(effected);
        }
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
   * @return {Promise} [ resolve(true) | reject(err) ]
   */
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

  /**
   * prepare
   * 
   * @param  {String}   sql
   * @param  {Array}    params
   * @param  {Function} callback
   * @return {Statement}
   */
  prepare(sql, params = [], callback = null) {
    return this.db.prepare(sql, params, callback);
  }
}

module.exports = SqlitePromiseDriver;
