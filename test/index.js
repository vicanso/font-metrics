'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const FontMetrics = require('..');
// set font-size is 16px, these word is not 16px
const specialWords = require('../assets/special-words');

const text = fs.readFileSync(path.join(__dirname, '../assets/text.txt'), 'utf8');
const template = fs.readFileSync(path.join(__dirname, '../assets/page-view.tpl'), 'utf8');
describe('font-metrics', () => {
  it('get content of page success', (done) => {
    const fontMetrics = new FontMetrics();
    fontMetrics.region = {
      width: 375,
      height: 667,
    };
    fontMetrics.getFontSize = () => 16;
    fontMetrics.data = text.trim();
    const composing = fontMetrics.getComposing();
    assert.equal(composing.length, 6);
    composing.forEach((item, i) => {
      assert(item.content);
      assert.equal(item.page, i);
    });
    done();
  });

  it('create multi view of page', (done) => {
    const devices = [
      {
        name: 'iPhone6P',
        width: 414,
        height: 736,
      },
      {
        name: 'iPhone6',
        width: 375,
        height: 667,
      },
      {
        name: 'iPhone5',
        width: 320,
        height: 568,
      },
      {
        name: 'galaxyS5',
        width: 360,
        height: 640,
      },
      {
        name: 'nexus5X',
        width: 412,
        height: 732,
      },
    ];
    const contentHtml = devices.map((device) => {
      const fontSize = 16;
      const fontMetrics = new FontMetrics({
        fontSize,
      });
      // the content will set padding:5px
      fontMetrics.region = {
        width: device.width - 10,
        height: device.height - 10,
      };
      fontMetrics.data = text.trim();
      fontMetrics.getFontSize = ch => specialWords[ch] || 16;
      const html = fontMetrics.toHTML()
        .map(item => `<div class="content">
          <div class="bar">${device.name}</div>${item}
        </div>`)
        .join('');
      return `<div class="${device.name}">${html}<div>`;
    }).join('');
    fs.writeFile(
      path.join(__dirname, '../assets/page-view.html'),
      template.replace('{CONTENT}', contentHtml),
      done
    );
  });
});
