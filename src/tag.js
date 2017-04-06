const sqlite3 = require('sqlite3').verbose();


class Tag {
  constructor(db, table) {
    if (!(db instanceof sqlite3.Database)) {
      throw new Error('"this.db" must be instance of sqlite3.Database');
    }
    this.db = db;
    this.table = table;
  }

  /**
   * getTags
   * @param  {Number} quoteID
   * @return {Promise} [ resolve({Array} tags) | reject(err) ]
   */
  getTags(quoteID) {
    return new Promise((resolve, reject) => {
      let sql = `SELECT tag_id,name FROM ${this.table.quote_tag} JOIN ${this.table.tag} ON ${this.table.quote_tag}.tag_id = ${this.table.tag}.id WHERE quote_id = ?`;

      this.db.all(sql, quoteID, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          let tags = [];
          rows.forEach((row) => {
            tags.push(row.name);
          });
          resolve(tags);
        }
      });
    });
  }

  /**
   * getOrCreate
   * 
   * @param  {String} tagName
   * @return {Promise} [ resolve({Object} row) | reject(err) ]
   */
  getOrCreate(tagName) {
    return new Promise((resolve, reject) => {
      let sql = `SELECT * FROM ${this.table.tag} WHERE name = ?`;

      this.db.get(sql, tagName, (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (row) {
          resolve(row);
        } else {
          this.create(tagName)
          .then((id) => {
            return this.read(id);
          }, reject)
          .then(resolve)
          .catch(reject);
        }
      });
    });
  }

  /**
   * sync - Relate array of tags to quote.
   * 
   * @param  {Number} quoteID
   * @param  {Array} tags
   * @return {Promise} [ resolve({String} msg) | reject(err) ]
   */
  sync(quoteID, tags) {
    if (Array.isArray(tags)) {
      return this._relateToQuote(quoteID, tags);
    } else {
      // empty promise.
      return Promise.resolve('Tags is empty.');
    }
  }

  /**
   * truncate - Delete all related tags from quote.
   * 
   * @param  {Number} quoteID
   * @return {Promise} [ resolve({Object} result) | reject(err) ]
   */
  truncate(quoteID) {
    return new Promise((resolve, reject) => {
      this.db.run(`DELETE FROM ${this.table.quote_tag} WHERE quote_id = ?`, quoteID, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  /**
   * create a new tag.
   * 
   * @param  {String} name
   * @return {Promise} [ resolve({Number} lastID) | reject(err) ]
   */
  create(name) {
    return new Promise((resolve, reject) => {
      this.db.run(`INSERT INTO ${this.table.tag} (name) VALUES (?)`, name, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  /**
   * read a tag.
   * 
   * @param  {Number} id 
   * @return {Promise} [ resolve({Object} row) | reject(err) ]
   */
  read(id) {
    return new Promise((resolve, reject) => {
      this.db.get(`SELECT * FROM ${this.table.tag} WHERE id = ?`, id, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  _relateToQuote(quoteID, tags) {
    return new Promise((resolve, reject) => {
      // delete old quote's tags.
      this.truncate(quoteID)
      .then((res) => {
        // relate new tags.
        let stmt = this.db.prepare(`INSERT INTO ${this.table.quote_tag} (quote_id, tag_id) VALUES (?,?)`);
        let count = 0;
        if (tags.length == 0) {
          resolve('No have Tag.');
          return;
        }

        for (let tag of tags) {
          this.getOrCreate(tag)
          .then((row) => {
            stmt.run(quoteID, row.id, (err) => {
              if (err) reject(err);
              count++;
              if (count >= tags.length) {
                resolve('Related complete.');
              }
            });
          })
          .catch(reject);
        }
      })
      .catch(reject);
    });
  }
}

module.exports = Tag;
