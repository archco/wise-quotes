const path = require('path');
const SqlitePromiseDriver = require('./sqlite-promise-driver.js');
const Config = require('./config.json');
const Schema = require('./schema.js');
const Tag = require('./tag.js');
const Util = require('./lib/util');

class WiseQuotes {
  constructor(config = {}) {
    // configuration.
    this.config = Object.assign({}, Config, config);
    this.table = this.config.table;
    this._setConfigDatabase();

    this.db = new SqlitePromiseDriver(this.config.database);
    this.schema = new Schema(this.db, this.table);
    this.tag = new Tag(this.db, this.table);
  }

  // getter

  /**
   * count
   * @returns {Promise.<number, Error>} The count of quotes.
   */
  get count() {
    return (async () => {
      const sql = `SELECT COUNT(*) AS count FROM ${this.table.quote} WHERE %L`;
      const row = await this.getFromDB(sql);

      return row.count;
    })();
  }

  /**
   * random
   * @returns {Promise.<object, Error>} A quote row as object.
   */
  get random() {
    return (async () => {
      const sql = `SELECT rowid FROM ${this.table.quote} WHERE %L ORDER BY RANDOM()`;
      const row = await this.getFromDB(sql);

      return await this.read(row.rowid);
    })();
  }

  // public

  /**
   * migration - async function.
   *
   * @returns {Promise.<string, Error>} Message.
   */
  async migration() {
    await this.schema.drop();
    await this.schema.create();
    await this.schema.seed();

    return 'Migration Complete.';
  }

  /**
   * create a new quote.
   *
   * @param  {Object} obj
   * @returns {Promise.<object, Error>} A quote row as object.
   */
  async create(obj) {
    const result = await this.db.run(
      `INSERT INTO ${this.table.quote} (author,content,language) VALUES (?,?,?)`,
      [obj.author, obj.content, obj.language]
    );
    await this.tag.sync(result.lastID, obj.tags);

    return this.read(result.lastID);
  }

  /**
   * read - get a quote.
   *
   * @param  {Number} id
   * @returns {Promise.<object, Error>} object or undefined.
   */
  async read(id) {
    let row = await this.db.get(
      `SELECT rowid,author,content,language FROM ${this.table.quote} WHERE rowid = ?`,
      id
    );
    if (row) {
      row = await this.tag.quoteAppendTags(row);
    }

    return row;
  }

  /**
   * update quote.
   *
   * @param  {Number} id
   * @param  {Object} obj
   * @returns {Promise.<object, Error>} The row object that updated.
   */
  async update(id, obj) {
    await this.db.run(
      `UPDATE ${this.table.quote} SET author = ?, content = ?, language = ? WHERE rowid = ?`,
      [obj.author, obj.content, obj.language, id]
    );
    await this.tag.sync(id, obj.tags);

    return await this.read(id);
  }

  /**
   * delete
   *
   * @param  {Number} id
   * @returns {Promise.<number, Error>} The number of affected.
   */
  async delete(id) {
    await this.tag.truncate(id);
    let result = await this.db.run(`DELETE FROM ${this.table.quote} WHERE rowid = ?`);

    return result.changes;
  }

  /**
   * get all quotes.
   *
   * @returns {Promise.<Array, Error>} Returns all rows as object[].
   */
  async all() {
    const sql = `SELECT rowid,author,content,language FROM ${this.table.quote} WHERE %L`;
    const rows = await this.allFromDB(sql);

    for (const row of rows) {
      row.tags = await this.tag.getTags(row.rowid);
    }

    return rows;
  }

  /**
   * feed
   *
   * @param  {String} filename
   * @returns {Promise.<string, Error>} Message.
   */
  async feed(filename = 'feed.json') {
    const feeds = require(path.resolve(__dirname, '../feeds/', filename));
    let result;

    for (const [i, item] of feeds.entries()) {
      Util.progressShow(i + 1, feeds.length);
      result = await this.create(item);
    }

    return `Feeds Complete: lastID ${result.rowid}`;
  }

  /**
   * Retrieve quotes by tag name.
   *
   * @param  {String} name
   * @returns {Promise.<Array, Error>} returns rows as object[].
   */
  async retrieveByTagName(name) {
    const sql = `SELECT ${this.table.quote}.rowid,${this.table.quote}.*
    FROM ${this.table.quote}
    JOIN ${this.table.quote_tag}
    ON ${this.table.quote}.rowid=${this.table.quote_tag}.quote_id
    JOIN ${this.table.tag}
    ON ${this.table.quote_tag}.tag_id=${this.table.tag}.rowid
    WHERE (${this.table.tag}.name = ?) AND (%L)`;
    const rows = await this.allFromDB(sql, name);

    for (const row of rows) {
      row.tags = await this.tag.getTags(row.rowid);
    }

    return rows;
  }

  /**
   * Retrieves rows that match by query.
   *
   * @param {string} str search query.
   * @returns {Promise.<Array, Error>} Returns rows as object[].
   */
  async match(str) {
    const sql = `SELECT rowid,author,content,language
    FROM ${this.table.quote}
    WHERE (${this.table.quote} MATCH ?) AND (%L)`;
    const rows = await this.allFromDB(sql, str);

    for (const row of rows) {
      row.tags = await this.tag.getTags(row.rowid);
    }

    return rows;
  }

  /**
   * Get row from database with language filter.
   *
   * @param {string} sql
   * @returns {Promise.<object, Error>} Returns row as object.
   */
  async getFromDB(sql, params = []) {
    return await this.db.get(this._refineSql(sql), params);
  }

  /**
   * Get rows from database with language filter.
   *
   * @param {string} sql
   * @returns {Promise.<Array, Error>} Returns rows as object[].
   */
  async allFromDB(sql, params = []) {
    return await this.db.all(this._refineSql(sql), params);
  }

  // private

  _setConfigDatabase() {
    if (!this.config.database) {
      throw new Error('config.database is not exist.');
    }

    if (this.config.database !== ':memory:') {
      // absolute path of database file.
      this.config.database = path.resolve(__dirname, this.config.database);
    }
  }

  _getLanguageWhereClause() {
    let l = this.config.language ? this.config.language : 'all';
    if (l === 'all') {
      return 'language IS NOT NULL';
    } else if (Array.isArray(l)) {
      let array = [];
      l.forEach(v => array.push(`language = '${v}'`));
      return array.join(' OR ');
    } else {
      // single language.
      return `language = '${l}'`;
    }
  }

  _refineSql(sql) {
    let lang = this._getLanguageWhereClause();
    sql = sql.replace(/(%L)/, lang); // language where clause.

    return sql;
  }
}

module.exports = WiseQuotes;
