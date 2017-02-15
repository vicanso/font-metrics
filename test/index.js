'use strict';
const fs = require('fs');
const path = require('path');
const FontMetrics = require('..');


function getChinese() {
  const data = fs.readFileSync(path.join(__dirname, '../assets/chinese.dat'), 'utf8');
  const arr = data.split('\n');
  return arr.map(item => item.substring(item.length - 1));
}

function getRandomArticle() {
  const chineseList = getChinese();
  const start = Math.ceil(Math.random() * (chineseList.length / 2));
  const end = Math.ceil(Math.random() * (chineseList.length / 2)) + start;
  return chineseList.slice(start, end).join('');
}

describe('font-metrics', () => {
  it('get content of page success', (done) => {
    const fontMetrics = new FontMetrics();
    fontMetrics.region = {
      width: 375,
      height: 667,
    };
    fontMetrics.data = [
      getRandomArticle(),
      getRandomArticle(),
      getRandomArticle(),
    ].join('\n');
    const composing = fontMetrics.getComposing();
    done();
  });
});
