const path = require('path');
const SqlitePromiseDriver = require('./sqlite-promise-driver.js');
const Config = require('./config.json');
const Schema = require('./schema.js');
const Tag = require('./tag.js');

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
   * @return {AsyncFunction} [resolve({Number} count) | reject(err)]
   */
  get count() {
    return (async () => {
      return await this.getCount();
    })();
  }

  /**
   * random
   * @return {AsyncFunction} [resolve({Object} row) | reject(err)]
   */
  get random() {
    return (async () => {
      return await this.getRandom();
    })();
  }

  // public

  /**
   * migration - async function.
   * 
   * @return {AsyncFunction} message.
   */
  async migration() {
    let result;

    result = await this.schema.drop();
    console.log(result);
    result = await this.schema.create();
    console.log(result);
    result = await this.schema.seed();
    console.log(result);

    return 'Migration Complete.'
  }

  /**
   * create a new quote.
   * 
   * @param  {Object} obj
   * @return {Promise} [ resolve({Object} row) | reject(err) ]
   */
  async create(obj) {
    let result = await this.db.run(`INSERT INTO ${this.table.quote} (author,content,language) VALUES (?,?,?)`, [obj.author, obj.content, obj.language]);
    await this.tag.sync(result.lastID, obj.tags);

    return this.read(result.lastID);
  }

  /**
   * read - get a quote.
   * 
   * @param  {Number} id
   * @return {Promise} [ resolve({Object} row) | reject(err) ]
   */
  async read(id) {
    let row = await this.db.get(`SELECT id,author,content,language FROM ${this.table.quote} WHERE id = ?`, id);
    let tags = await this.tag.getTags(row.id);
    if (tags) {
      row.tags = tags;
    }

    return row;
  }

  /**
   * update quote.
   * 
   * @param  {Number} id
   * @param  {Object} obj
   * @return {Promise} [ resolve({Object} row) | reject(err) ]
   */
  async update(id, obj) {
    await this.db.run(`UPDATE ${this.table.quote} SET author = ?, content = ?, language = ? WHERE id = ?`, [obj.author, obj.content, obj.language, id]);
    await this.tag.sync(id, obj.tags);

    return await this.read(id);
  }

  /**
   * delete
   * 
   * @param  {Number} id
   * @return {Promise} [ resolve({Number} changes) | reject(err) ]
   */
  async delete(id) {
    await this.tag.truncate(id);
    let result = await this.db.run(`DELETE FROM ${this.table.quote} WHERE id = ?`);

    return result.changes;
  }

  /**
   * get all quotes.
   * 
   * @return {Promise} [resolve({Array} rows) | reject(err)]
   */
  async all() {
    let rows = await this._getAllQuotes();

    for (let row of rows) {
      let tags = await this.tag.getTags(row.id);
      row.tags = tags;
    }

    return rows;
  }

  /**
   * feed
   * 
   * @param  {String} filename
   * @return {AsyncFunction} message.
   */
  async feed(filename = 'feed.json') {
    let feeds = require(path.resolve(__dirname, '../feeds/', filename));

    for (let feed of feeds) {
      let result = await this.create(feed);
      console.log(`Feed: insertID - ${result.id}`);
    }

    return 'Feeds Complete.';
  }

  async getCount() {
    let row = await this.db.get(`SELECT COUNT(*) AS count FROM ${this.table.quote}`);

    return row.count;
  }

  async getRandom() {
    let row = await this.db.get(`SELECT id FROM ${this.table.quote} ORDER BY RANDOM()`);

    return await this.read(row.id);
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

  async _getAllQuotes() {
    let rows = await this.db.all(`SELECT id,author,content,language FROM ${this.table.quote}`);

    return rows;
  }
}

module.exports = WiseQuotes;
