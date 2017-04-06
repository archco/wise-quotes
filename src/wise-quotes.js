const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const Config = require('./config.json');
const Schema = require('./schema.js');
const Tag = require('./tag.js');


class WiseQuotes {
  constructor(config = {}) {
    // configuration.
    this.config = Object.assign({}, Config, config);
    this.table = this.config.table;
    this._setConfigDatabase();

    this.db = new sqlite3.Database(this.config.database);
    this.schema = new Schema(this.db, this.table);
    this.tag = new Tag(this.db, this.table);
  }

  // getter
  
  /**
   * count
   * @return {Promise} [resolve({Number} count) | reject(err)]
   */
  get count() {
    return new Promise((resolve, reject) => {
      this.db.get(`SELECT COUNT(*) AS count FROM ${this.table.quote}`, function (err, row) {
        if (err) {
          reject(err);
          return;
        }
        resolve(row.count);
      });
    });
  }

  /**
   * random
   * @return {Promise} [resolve({Object} row) | reject(err)]
   */
  get random() {
    return new Promise((resolve, reject) => {
      this.db.get(`SELECT id,author,content,language FROM ${this.table.quote} ORDER BY RANDOM()`, (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        this.read(row.id).then(resolve, reject);
      });
    });
  }

  // public

  migration() {
    this.schema.drop(); // if exist drop.
    this.schema.create();
    this.schema.seed();
  }

  test() {
    this.tag.getOrCreate('test5')
    .then((row) => {
      console.log(row);
    })
    .catch((err) => {
      throw err;
    });
  }

  /**
   * create a new quote.
   * 
   * @param  {Object} obj
   * @return {Promise} [ resolve({Object} row) | reject(err) ]
   */
  create(obj) {
    return new Promise((resolve, reject) => {
      let sql = `INSERT INTO ${this.table.quote} (author,content,language) VALUES (?,?,?)`;
      let relateTags = (id) => {
        return this.tag.sync(id, obj.tags);
      };
      let read = (id) => {
        return this.read(id);
      };
      
      this.db.run(sql, [obj.author, obj.content, obj.language], function (err) {
        if (err) {
          reject(err);
          return;
        }

        relateTags(this.lastID)
        .then(() => {
          return read(this.lastID);
        }, reject)
        .then(resolve)
        .catch(reject);
      });
    });
  }

  /**
   * read - get a quote.
   * 
   * @param  {Number} id
   * @return {Promise} [ resolve({Object} row) | reject(err) ]
   */
  read(id) {
    return new Promise((resolve, reject) => {
      let sql = `SELECT id,author,content,language FROM ${this.table.quote} WHERE id = ?`;
    
      this.db.get(sql, id, (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        this.tag.getTags(row.id)
        .then((tags) => {
          if (tags) row.tags = tags;
          resolve(row);
        })
        .catch((err) => {
          reject(err);
        });
      });
    });
  }

  /**
   * update quote.
   * 
   * @param  {Number} id
   * @param  {Object} obj
   * @return {Promise} [ resolve({Object} row) | reject(err) ]
   */
  update(id, obj) {
    return new Promise((resolve, reject) => {
      let sql = `UPDATE ${this.table.quote} SET author = ?, content = ?, language = ? WHERE id = ?`;
      
      this.db.run(sql, [obj.author, obj.content, obj.language, id], (err) => {
        if (err) {
          reject(err);
          return;
        }

        this.tag.sync(id, obj.tags)
        .then((msg) => {
          this.read(id).then(resolve, reject);
        })
        .catch(reject);
      });
    });
  }

  /**
   * delete
   * 
   * @param  {Number} id
   * @return {Promise} [ resolve({Number} changes) | reject(err) ]
   */
  delete(id) {
    return new Promise((resolve, reject) => {
      let sql = `DELETE FROM ${this.table.quote} WHERE id = ?`;

      this.tag.truncate(id)
      .then(() => {
        this.db.run(sql, id, function (err) {
          if (err) {
            reject(err);
            return;
          }

          resolve(this.changes);
        });
      })
      .catch(reject);
    });
  }

  /**
   * feed
   * 
   * @param  {String} filename
   * @return {void}
   */
  feed(filename = 'feed.json') {
    let feeds = require(path.resolve(__dirname, '../feeds/', filename));
    
    feeds.forEach((obj) => {
      this.create(obj)
      .then((row) => {
        console.log(`Insert: ${row.id}`);
      })
      .catch((err) => {
        console.error(err);
      });
    });
  }

  _setConfigDatabase() {
    if (!this.config.database) {
      throw new Error('config.database is not exist.');
    }

    if (this.config.database == ':memory:') {
      // do nothing. it use memory.
    } else {
      // absolute path of database file.
      this.config.database = path.resolve(__dirname, this.config.database);
    }
  }
}

module.exports = WiseQuotes;
