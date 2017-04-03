const sqlite3 = require('sqlite3').verbose();
// Language Codes (ISO 639-1)
// @links http://data.okfn.org/data/core/language-codes
const Language = require('./lib/language-codes.json');
const Tags = require('./lib/popular-tags.json');

const Schema = (() => {
  const TABLE = {
    QUOTE: 'quote',
    LANG: 'language',
    TAG: 'tag',
    QUOTE_TAG: 'quote_tag'
  };

  class Schema {
    constructor(db) {
      if (!(db instanceof sqlite3.Database)) {
        throw new Error('"this.db" must be instance of sqlite3.Database');
      }
      this.db = db;
    }

    create() {
      this.db.serialize(() => {
        // language table.
        this.db.run(
          `CREATE TABLE IF NOT EXISTS ${TABLE.LANG} (
            code TEXT PRIMARY KEY,
            name TEXT NOT NULL
          )`
        );
        // quote table.
        this.db.run(
          `CREATE TABLE IF NOT EXISTS ${TABLE.QUOTE} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT NOT NULL,
            content TEXT NOT NULL,
            language TEXT NOT NULL,
            FOREIGN KEY(language) REFERENCES ${TABLE.LANG}(code)
          )`
        );
        // tag table.
        this.db.run(
          `CREATE TABLE IF NOT EXISTS ${TABLE.TAG} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT
          )`
        );
        // quote_tag table.
        this.db.run(
          `CREATE TABLE IF NOT EXISTS ${TABLE.QUOTE_TAG} (
            quote_id INTEGER NOT NULL,
            tag_id INTEGER NOT NULL,
            PRIMARY KEY (quote_id, tag_id)
          )`
        );
      });
      console.log(`${TABLE.LANG} table is created.`);
      console.log(`${TABLE.QUOTE} table is created.`);
      console.log(`${TABLE.TAG} table is created.`);
      console.log(`${TABLE.QUOTE_TAG} table is created.`);
    }

    drop() {
      this.db.serialize(() => {
        // quote_tag
        this.db.run(`DROP TABLE IF EXISTS ${TABLE.QUOTE_TAG}`);
        // tag
        this.db.run(`DROP TABLE IF EXISTS ${TABLE.TAG}`);
        // quote
        this.db.run(`DROP TABLE IF EXISTS ${TABLE.QUOTE}`);
        // language
        this.db.run(`DROP TABLE IF EXISTS ${TABLE.LANG}`);
      });
    }

    seed() {
      // Language seed.
      let stmt = this.db.prepare(`INSERT INTO ${TABLE.LANG} (code,name) VALUES (?,?)`);
      for (let lang of Language) {
        stmt.run(lang.alpha2, lang.English);
      }
      stmt.finalize((err) => {
        if (err) throw err;
        console.log(`Seed to ${TABLE.LANG}`);
      });

      // Tags.
      stmt = this.db.prepare(`INSERT INTO ${TABLE.TAG} (name,description) VALUES (?,?)`);
      for (let tag of Tags) {
        stmt.run(tag, `Popular tag: ${tag}`);
      }
      stmt.finalize((err) => {
        if (err) throw err;
        console.log(`Seed to ${TABLE.TAG}`);
      });
    }
  }

  return Schema;
})();

module.exports = Schema;
