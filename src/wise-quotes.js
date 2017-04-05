const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const Schema = require('./schema.js');
const Tag = require('./tag.js');

const WiseQuotes = (() => {
  const TABLE = {
    QUOTE: 'quote',
    LANG: 'language',
    TAG: 'tag',
    QUOTE_TAG: 'quote_tag'
  };
  const DB_FILE = path.resolve(__dirname, '../db/quotes.sqlite3');

  class WiseQuotes {
    constructor() {
      this.db = new sqlite3.Database(DB_FILE);
      this.schema = new Schema(this.db);
      this.tag = new Tag(this.db);
    }

    // getter
    
    /**
     * count
     * @return {Promise} [resolve({Number} count) | reject(err)]
     */
    get count() {
      return new Promise((resolve, reject) => {
        this.db.get(`SELECT COUNT(*) AS count FROM ${TABLE.QUOTE}`, function (err, row) {
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
        this.db.get(`SELECT id,author,content,language FROM ${TABLE.QUOTE} ORDER BY RANDOM()`, (err, row) => {
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
        let sql = `INSERT INTO ${TABLE.QUOTE} (author,content,language) VALUES (?,?,?)`;
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
        let sql = `SELECT id,author,content,language FROM ${TABLE.QUOTE} WHERE id = ?`;
      
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
        let sql = `UPDATE ${TABLE.QUOTE} SET author = ?, content = ?, language = ? WHERE id = ?`;
        
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
        let sql = `DELETE FROM ${TABLE.QUOTE} WHERE id = ?`;

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
  }

  return WiseQuotes;
})();

module.exports = WiseQuotes;
