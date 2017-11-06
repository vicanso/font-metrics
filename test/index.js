'use strict';

const fs = require('fs');
const path = require('path');
require('./mock-canvas');

const fontMetrics = require('..');

const text = fs.readFileSync(path.join(__dirname, '../assets/text.txt'), 'utf8');
describe('font-metrics', () => {
  it('get content of page success', (done) => {
    const canvasList = fontMetrics.getCanvasList(text, {
      width: 404,
      height: 726,
      fontSize: 18,
      paragraphSpacing: 18,
      lineHeight: 24,
      fontFamily: 'sans-serif',
    });
    canvasList.forEach((item, index) => {
      item.canvas.pngStream().pipe(fs.createWriteStream(`./assets/${index}.png`));
    });
    setTimeout(done, 500);
  });
});
