const SqlitePromiseDriver = require('./sqlite-promise-driver.js');

// Language Codes (ISO 639-1)
// @links http://data.okfn.org/data/core/language-codes
const Languages = require('./lib/language-codes.json');
const Tags = require('./lib/popular-tags.json');
const Util = require('./lib/util');

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

    // quote table. using fts5
    await this.db.run(
      `CREATE VIRTUAL TABLE ${this.table.quote} USING fts5(
        author,
        content,
        language
      )`
    );

    // tag table. using fts5
    await this.db.run(
      `CREATE VIRTUAL TABLE ${this.table.tag} USING fts5(
        name,
        description
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
    // Languages seed.
    for (let [i, lang] of Languages.entries()) {
      Util.progressShow(i + 1, Languages.length);
      await this.db.run(
        `INSERT INTO ${this.table.lang} (code,name) VALUES (?,?)`,
        [lang.alpha2, lang.English]
      );
    }

    return `Seed: ${this.table.lang}`;
  }

  async _seedTag() {
    // Tags.
    for (let [i, tag] of Tags.entries()) {
      Util.progressShow(i + 1, Tags.length);
      await this.db.run(
        `INSERT INTO ${this.table.tag} (name,description) VALUES (?,?)`,
        [tag, `Popular tag: ${tag}`]
      );
    }

    return `Seed: ${this.table.tag}`;
  }
}

module.exports = Schema;
