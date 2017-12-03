'use strict';

const fs = require('fs');
const path = require('path');
require('./mock-canvas');

const FontMetrics = require('..');

const text = fs.readFileSync(path.join(__dirname, '../assets/text.txt'), 'utf8');
const tpl = fs.readFileSync(path.join(__dirname, '../assets/page-view.tpl'), 'utf8');
// eslint-disable-next-line
describe('font-metrics', () => {
  // eslint-disable-next-line
  it('get image page view success', function (done) {
    this.timeout(5000);
    const fontMetrics = new FontMetrics({
      width: 404,
      height: 726,
      fontSize: 18,
      paragraphSpacing: 18,
      lineHeight: 24,
      fontFamily: 'sans-serif',
      fontWeight: 'bold',
      devicePixelRatio: 2,
      color: '#333',
    });
    const canvasList = fontMetrics.getFillTextList(text);
    canvasList.forEach((item, index) => {
      item.canvas.pngStream().pipe(fs.createWriteStream(`./assets/${index}.png`));
    });
    setTimeout(done, 3000);
  });

  // eslint-disable-next-line
  it('get html page view success', (done) => {
    const fontMetrics = new FontMetrics({
      width: 404,
      height: 726,
      fontSize: 18,
      paragraphSpacing: 18,
      lineHeight: 24,
      fontFamily: 'sans-serif',
      fontWeight: 'bold',
      devicePixelRatio: 1,
      color: '#333',
      format: 'html',
      cache: true,
    });
    const htmlList = fontMetrics.getFillTextList(text);
    const html = htmlList.map((item) => {
      const data = `<div class="content">${item.html}</div>`;
      return data;
    }).join('');
    fs.writeFileSync(path.join(__dirname, '../assets/page-view.html'), tpl.replace('{CONTENT}', html));
    done();
  });
});

