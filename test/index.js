'use strict';
const fs = require('fs');
const _ = require('lodash');
const FontMetrics = require('..');


function getChinese() {
  const data = fs.readFileSync('../assets/chinese.dat', 'utf8');
  const arr = data.split('\n');
  const chinese = arr.map(item => item.substring(item.length - 1));

}
function getRandomArticle() {

}

describe('font-metrics', () => {
  it('get content of page success', done => {
    const fontMetrics = new FontMetrics();
    fontMetrics.region = {
      width: 360,
      height: 640,
    };
    fontMetrics.data = '';
  });
});
