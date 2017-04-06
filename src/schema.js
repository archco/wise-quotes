const sqlite3 = require('sqlite3').verbose();
// Language Codes (ISO 639-1)
// @links http://data.okfn.org/data/core/language-codes
const Language = require('./lib/language-codes.json');
const Tags = require('./lib/popular-tags.json');


class Schema {
  constructor(db, table) {
    if (!(db instanceof sqlite3.Database)) {
      throw new Error('"this.db" must be instance of sqlite3.Database');
    }
    this.db = db;
    this.table = table;
  }

  create() {
    this.db.serialize(() => {
      // language table.
      this.db.run(
        `CREATE TABLE IF NOT EXISTS ${this.table.lang} (
          code TEXT PRIMARY KEY,
          name TEXT NOT NULL
        )`,
        function (err) {
          if (err) throw err;
          console.log(`${this.table.lang} table is created.`);
        }
      );
      // quote table.
      this.db.run(
        `CREATE TABLE IF NOT EXISTS ${this.table.quote} (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          author TEXT NOT NULL,
          content TEXT NOT NULL,
          language TEXT NOT NULL,
          FOREIGN KEY(language) REFERENCES ${this.table.lang}(code)
        )`,
        function (err) {
          if (err) throw err;
          console.log(`${this.table.quote} table is created.`);
        }
      );
      // tag table.
      this.db.run(
        `CREATE TABLE IF NOT EXISTS ${this.table.tag} (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT
        )`,
        function (err) {
          if (err) throw err;
          console.log(`${this.table.tag} table is created.`);
        }
      );
      // quote_tag table.
      this.db.run(
        `CREATE TABLE IF NOT EXISTS ${this.table.quote_tag} (
          quote_id INTEGER NOT NULL,
          tag_id INTEGER NOT NULL,
          PRIMARY KEY (quote_id, tag_id)
        )`,
        function (err) {
          if (err) throw err;
          console.log(`${this.table.quote_tag} table is created.`);
        }
      );
    });
  }

  drop() {
    this.db.serialize(() => {
      // quote_tag
      this.db.run(`DROP TABLE IF EXISTS ${this.table.quote_tag}`);
      // tag
      this.db.run(`DROP TABLE IF EXISTS ${this.table.tag}`);
      // quote
      this.db.run(`DROP TABLE IF EXISTS ${this.table.quote}`);
      // language
      this.db.run(`DROP TABLE IF EXISTS ${this.table.lang}`);
    });
  }

  seed() {
    // Language seed.
    let stmt = this.db.prepare(`INSERT INTO ${this.table.lang} (code,name) VALUES (?,?)`);
    for (let lang of Language) {
      stmt.run(lang.alpha2, lang.English);
    }
    stmt.finalize((err) => {
      if (err) throw err;
      console.log(`Seed to ${this.table.lang}`);
    });

    // Tags.
    stmt = this.db.prepare(`INSERT INTO ${this.table.tag} (name,description) VALUES (?,?)`);
    for (let tag of Tags) {
      stmt.run(tag, `Popular tag: ${tag}`);
    }
    stmt.finalize((err) => {
      if (err) throw err;
      console.log(`Seed to ${this.table.tag}`);
    });
  }
}

module.exports = Schema;
