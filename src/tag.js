const sqlite3 = require('sqlite3').verbose();

const Tag = (() => {
  const TABLE = {
    QUOTE: 'quote',
    LANG: 'language',
    TAG: 'tag',
    QUOTE_TAG: 'quote_tag'
  };

  class Tag {
    constructor(db) {
      if (!(db instanceof sqlite3.Database)) {
        throw new Error('"this.db" must be instance of sqlite3.Database');
      }
      this.db = db;
    }

    getTags(quoteID, callback) {
      this.db.all(`SELECT tag_id,name FROM ${TABLE.QUOTE_TAG} JOIN ${TABLE.TAG} ON ${TABLE.QUOTE_TAG}.tag_id = ${TABLE.TAG}.id WHERE quote_id = ?`, quoteID, function (err, rows) {
        if (err) throw err;
        let tags = [];
        
        rows.forEach((row) => {
          tags.push(row.name);
        });
        callback(tags);
      });
    }

    getOrCreate(str, callback) {
      let create = (name) => {
        this.db.run(`INSERT INTO ${TABLE.TAG} (name) VALUES (?)`, name, function (err) {
          if (err) throw err;
          get(this.lastID);
        });
      };
      let get = (id) => {
        this.db.get(`SELECT * FROM ${TABLE.TAG} WHERE id = ?`, id, (err, row) => {
          if (err) throw err;
          callback(row);
        });
      };

      this.db.get(`SELECT * FROM ${TABLE.TAG} WHERE name = ?`, str, (err, row) => {
        if (err) throw err;
        if (row) {
          callback(row);
        } else {
          create(str);
        }
      });
    }

    sync(quoteID, tags) {
      // delete old quote's tags.
      this.truncate(quoteID);

      // relate new tags.
      for (let tag of tags) {
        this.getOrCreate(tag, (row) => {
          this._relate(quoteID, row.id);
        });
      }
    }

    truncate(quoteID) {
      this.db.run(`DELETE FROM ${TABLE.QUOTE_TAG} WHERE quote_id = ?`, quoteID, function (err) {
        if (err) throw err;
      });
    }

    _relate(quoteID, tagID) {
      this.db.run(`INSERT INTO ${TABLE.QUOTE_TAG} (quote_id, tag_id) VALUES (?,?)`, [quoteID, tagID], function (err) {
        if (err) throw err;
      });
    }
  }

  return Tag;
})();

module.exports = Tag;
