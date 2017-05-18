const SqlitePromiseDriver = require('./sqlite-promise-driver.js');

// Language Codes (ISO 639-1)
// @links http://data.okfn.org/data/core/language-codes
const Language = require('./lib/language-codes.json');
const Tags = require('./lib/popular-tags.json');

class Schema {
  constructor(db, table) {
    if (!(db instanceof SqlitePromiseDriver)) {
      throw new Error('"this.db" must be instance of SqlitePromiseDriver');
    }

    this.db = db;
    this.table = table;
  }

  async create() {
    // language table.
    await this.db.run(
      `CREATE TABLE ${this.table.lang} (
        code TEXT PRIMARY KEY,
        name TEXT NOT NULL
      )`
    );

    // quote table.
    await this.db.run(
      `CREATE TABLE ${this.table.quote} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        author TEXT NOT NULL,
        content TEXT NOT NULL,
        language TEXT NOT NULL,
        FOREIGN KEY(language) REFERENCES ${this.table.lang}(code)
      )`
    );

    // tag table.
    await this.db.run(
      `CREATE TABLE ${this.table.tag} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT
      )`
    );

    // quote_tag table.
    await this.db.run(
      `CREATE TABLE ${this.table.quote_tag} (
        quote_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (quote_id, tag_id)
      )`
    );

    return 'create: All queries executed.';
  }

  async drop() {
    await this.db.run(`DROP TABLE IF EXISTS ${this.table.quote_tag}`); // quote_tag
    await this.db.run(`DROP TABLE IF EXISTS ${this.table.tag}`); // tag
    await this.db.run(`DROP TABLE IF EXISTS ${this.table.quote}`); // quote
    await this.db.run(`DROP TABLE IF EXISTS ${this.table.lang}`); // language

    return 'drop: All queries executed';
  }

  /**
   * seed - async function.
   *
   * @return {AsyncFunction} message.
   */
  async seed() {
    await this._seedLanguage();
    await this._seedTag();

    return 'Seed Complete.';
  }

  async _seedLanguage() {
    // Language seed.
    for (let lang of Language) {
      await this.db.run(
        `INSERT INTO ${this.table.lang} (code,name) VALUES (?,?)`,
        [lang.alpha2, lang.English]
      );
    }

    return `Seed: ${this.table.lang}`;
  }

  async _seedTag() {
    // Tags.
    for (let tag of Tags) {
      await this.db.run(
        `INSERT INTO ${this.table.tag} (name,description) VALUES (?,?)`,
        [tag, `Popular tag: ${tag}`]
      );
    }

    return `Seed: ${this.table.tag}`;
  }
}

module.exports = Schema;
