const Quotes = require('../db/quotes.json');

const DefaultOption = {
  language: "all"
};

class WiseQuotesClient {
  constructor(option) {
    this.option = Object.assign({}, DefaultOption, option);
    this.quotes = this._initQuotes();
  }

  get status() {
    return `language: ${this.option.language} count: ${this.quotes.length}`;
  }

  read(index) {
    return this.quotes[index];
  }

  all() {
    return this.quotes;
  }

  random() {
    let index = this._getRandomInt(0, this.quotes.length);
    return this.quotes[index];
  }

  /**
   * returns a random integer between two values.
   * 
   * @param  {Number} min  the next integer greater than min if min isn't an integer
   * @param  {Number} max  less than (but not equal to)
   * @return {Number} integer min =< value < max
   */
  _getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  _initQuotes() {
    if (this.option.language == 'all') {
      return Quotes;
    } else if (typeof this.option.language == 'string') {
      return this._getQuotesByLang(this.option.language);
    } else if (Array.isArray(this.option.language)) {
      let quotes = [];

      for (let lang of this.option.language) {
        quotes = quotes.concat(this._getQuotesByLang(lang));
      }

      return quotes;
    }

    return Quotes;
  }

  _getQuotesByLang(lang) {
    let quotes = [];

    for (let row of Quotes) {
      if (row.language == lang) {
        quotes.push(row);
      }
    }
    
    return quotes;
  }
}

module.exports = WiseQuotesClient;
