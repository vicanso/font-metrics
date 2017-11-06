const { createCanvas } = require('canvas');

global.document = {
  createElement() {
    return createCanvas();
  },
};
