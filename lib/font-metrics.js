'use strict';

class FontMetrics {
  constructor(options) {
    this.opts = Object.assgin({
      // if indent is null, it will be 2 * fontSize
      // indent: null,
      padding: 10,
      fontSize: 16,
    }, options);
  }
  set data(text) {
    this._data = text;
  }
  set region(data) {
    this._region = data;
  }
  getContent(page) {
    if (!this._data || !this._region) {
      throw new Eroor('data or region is not set');
    }

  }
}
