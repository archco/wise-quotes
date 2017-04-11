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
   * getTags
   * @param  {Number} quoteID
   * @return {Promise} [ resolve({Array} tags) | reject(err) ]
   */
  async getTags(quoteID) {
    let tags = [];
    let rows = await this.db.all(`SELECT tag_id,name FROM ${this.table.quote_tag} JOIN ${this.table.tag} ON ${this.table.quote_tag}.tag_id = ${this.table.tag}.id WHERE quote_id = ?`, quoteID);

    for (let row of rows) {
      tags.push(row.name);
    }

    return tags;
  }

  /**
   * getOrCreate
   * 
   * @param  {String} tagName
   * @return {Promise} [ resolve({Object} row) | reject(err) ]
   */
  async getOrCreate(tagName) {
    let row = await this.db.get(`SELECT * FROM ${this.table.tag} WHERE name = ?`, tagName);

    if (row) {
      return row;
    } else {
      let insertID = await this.create(tagName);
      return this.read(insertID);
    }
  }

  /**
   * sync - Relate array of tags to quote.
   * 
   * @param  {Number} quoteID
   * @param  {Array} tags
   * @return {Promise} [ resolve({String} msg) | reject(err) ]
   */
  sync(quoteID, tags) {
    if (Array.isArray(tags)) {
      return this._relateToQuote(quoteID, tags);
    } else {
      // empty promise.
      return Promise.resolve('Tags is empty.');
    }
  }

  /**
   * truncate - Delete all related tags from quote.
   * 
   * @param  {Number} quoteID
   * @return {Promise} [ resolve({Object} result) | reject(err) ]
   */
  async truncate(quoteID) {
    let result = await this.db.run(`DELETE FROM ${this.table.quote_tag} WHERE quote_id = ?`, quoteID);

    return result;
  }

  /**
   * create a new tag.
   * 
   * @param  {String} name
   * @return {Promise} [ resolve({Number} lastID) | reject(err) ]
   */
  async create(name) {
    let result = await this.db.run(`INSERT INTO ${this.table.tag} (name) VALUES (?)`, name);

    return result.lastID;
  }

  /**
   * read a tag.
   * 
   * @param  {Number} id 
   * @return {Promise} [ resolve({Object} row) | reject(err) ]
   */
  async read(id) {
    let row = await this.db.get(`SELECT * FROM ${this.table.tag} WHERE id = ?`, id);

    return row;
  }

  async _relateToQuote(quoteID, tags) {
    // first, remove old tags.
    await this.truncate(quoteID);

    for (let tagName of tags) {
      let tag = await this.getOrCreate(tagName);
      await this._relate(quoteID, tag.id);
    }

    return 'Relate Successfully.';
  }

  async _relate(quoteID, tagID) {
    await this.db.run(`INSERT INTO ${this.table.quote_tag} (quote_id, tag_id) VALUES (?,?)`, [quoteID, tagID]);

    return true;
  }
}

module.exports = Tag;
