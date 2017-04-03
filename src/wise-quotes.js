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
  const DB_FILE = 'db/quotes.sqlite3';

  class WiseQuotes {
    constructor() {
      this.db = new sqlite3.Database(DB_FILE);
      this.schema = new Schema(this.db);
      this.tag = new Tag(this.db);
    }

    migration() {
      this.schema.drop(); // if exist drop.
      this.schema.create();
      this.schema.seed();
    }

    create(obj, callback) {
      let sql = `INSERT INTO ${TABLE.QUOTE} (author,content,language) VALUES (?,?,?)`;
      let relateTags = (id) => {
        if (obj.tags && Array.isArray(obj.tags)) {
          this.tag.sync(id, obj.tags);
        }
      };
      let read = (id) => {
        this.read(id, callback);
      };
      
      this.db.run(sql, [obj.author, obj.content, obj.language], function (err) {
        if (err) throw err;
        relateTags(this.lastID);
        read(this.lastID);
      });
    }

    read(id, callback) {
      let sql = `SELECT id,author,content,language FROM ${TABLE.QUOTE} WHERE id = ?`;
      
      this.db.get(sql, id, (err, row) => {
        if (err) throw err;
        this.tag.getTags(row.id, (tags) => {
          if (tags) row.tags = tags;
          callback(row);
        });
      });
    }

    update(id, obj, callback) {
      let sql = `UPDATE ${TABLE.QUOTE} SET author = ?, content = ?, language = ? WHERE id = ${id}`;
      let relateTags = (id) => {
        if (obj.tags && Array.isArray(obj.tags)) {
          this.tag.sync(id, obj.tags);
        }
      };
      let read = (id) => {
        this.read(id, callback);
      };

      this.db.run(sql, [obj.author, obj.content, obj.language], function (err) {
        if (err) throw err;
        relateTags(id);
        read(id);
      });
    }

    delete(id, callback) {
      let sql = `DELETE FROM ${TABLE.QUOTE} WHERE id = ${id}`;

      this.db.serialize(() => {
        // delete quote_tag.
        this.tag.truncate(id);
        // delete quote.
        this.db.run(sql, function (err) {
          if (err) throw err;
          callback(this.changes);
        });
      });
    }

    feed(filename = 'feed.json') {
      let feeds = require(path.resolve(__dirname, '../feeds/', filename));
      
      this.db.serialize(() => {
        feeds.forEach((obj) => {
          this.create(obj, (row) => {
            console.log(`Insert: ${row.id}`);
          });
        });
      });
    }
  }

  return WiseQuotes;
})();

module.exports = WiseQuotes;
