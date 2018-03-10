const SqlitePromiseDriver = require('./sqlite-promise-driver.js');

class Tag {
  constructor(db, table) {
    if (!(db instanceof SqlitePromiseDriver)) {
      throw new Error('"this.db" must be instance of SqlitePromiseDriver');
    }

    this.db = db;
    this.table = table;
  }

  /**
   * Returns array of tag names by quote id.
   *
   * @param  {Number} quoteID
   * @returns {Promise.<Array, Error>} Tags as string[].
   */
  async getTags(quoteID) {
    const tags = [];
    const rows = await this.db.all(
      `SELECT tag_id,name FROM ${this.table.quote_tag} JOIN ${this.table.tag} ON ${this.table.quote_tag}.tag_id = ${this.table.tag}.rowid WHERE quote_id = ?`, // jscs:ignore maximumLineLength
      quoteID
    );

    for (const row of rows) {
      tags.push(row.name);
    }

    return tags;
  }

  /**
   * Get quotes by tag id.
   *
   * @param  {Number} tagID
   * @returns {Promise.<Array, Error>} Rows as object[].
   */
  async getQuotes(tagID) {
    const rows = await this.db.all(
      `SELECT ${this.table.quote}.*
      FROM ${this.table.quote_tag}
      JOIN ${this.table.quote}
      ON ${this.table.quote_tag}.quote_id = ${this.table.quote}.rowid WHERE tag_id = ?`,
      tagID
    );

    return rows;
  }

  /**
   * Get or create tag.
   *
   * @param  {String} tagName
   * @returns {Promise.<object, Error>} Row as object.
   */
  async getOrCreate(tagName) {
    const row = await this.getByName(tagName);

    if (row) {
      return row;
    } else {
      const insertID = await this.create(tagName);
      return this.read(insertID);
    }
  }

  /**
   * Sync - Relate array of tags to quote.
   *
   * @param  {Number} quoteID
   * @param  {Array} tags
   * @returns {Promise.<string, Error>} Message.
   */
  sync(quoteID, tags) {
    return Array.isArray(tags)
      ? this._relateToQuote(quoteID, tags)
      : Promise.resolve('Tags is empty.');
  }

  /**
   * Truncate - Delete all related tags from quote.
   *
   * @param  {Number} quoteID
   * @returns {Promise.<object, Error>} Statement {sql: string, lastID: number, changes: number}
   */
  async truncate(quoteID) {
    const result = await this.db.run(
      `DELETE FROM ${this.table.quote_tag} WHERE quote_id = ?`,
      quoteID
    );

    return result;
  }

  /**
   * Create a new tag.
   *
   * @param  {String} name
   * @returns {Promise.<number, Error>} lastID.
   */
  async create(name) {
    const result = await this.db.run(`INSERT INTO ${this.table.tag} (name) VALUES (?)`, name);

    return result.lastID;
  }

  /**
   * Read a tag.
   *
   * @param  {Number} id
   * @returns {Promise.<object, Error>} A row as object.
   */
  async read(id) {
    const row = await this.db.get(`SELECT rowid,* FROM ${this.table.tag} WHERE rowid = ?`, id);

    return row;
  }

  /**
   * getByName
   *
   * @param  {String} tagName
   * @returns {Promise.<object, Error>} A row as object.
   */
  async getByName(tagName) {
    const row = await this.db.get(`SELECT rowid,* FROM ${this.table.tag} WHERE name = ?`, tagName);

    return row;
  }

  /**
   * quoteAppendTags
   *
   * @param  {Object} quote
   * @returns {Promise.<object, Error>} A quote as object.
   */
  async quoteAppendTags(quote) {
    const tags = await this.getTags(quote.rowid);
    if (tags) quote.tags = tags;

    return quote;
  }

  // private.

  async _relateToQuote(quoteID, tags) {
    // Remove old tags first.
    await this.truncate(quoteID);

    for (const tagName of tags) {
      const tag = await this.getOrCreate(tagName);
      await this._relate(quoteID, tag.rowid);
    }

    return 'Relate Successfully.';
  }

  async _relate(quoteID, tagID) {
    await this.db.run(
      `INSERT INTO ${this.table.quote_tag} (quote_id, tag_id) VALUES (?,?)`,
      [quoteID, tagID]
    );

    return true;
  }
}

module.exports = Tag;
