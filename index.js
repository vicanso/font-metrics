
function getCanvasFillText(content, start, options) {
  // eslint-disable-next-line
  const canvas = document.createElement('canvas');
  const {
    width,
    height,
    fontSize,
    fontFamily,
    lineHeight,
    paragraphSpacing,
  } = options;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.font = `${fontSize}px ${fontFamily}`;
  const defaultStartOffset = 2 * fontSize;
  const prevCh = content[start - 1];
  let x = (!prevCh || prevCh === '\n') ? defaultStartOffset : 0;
  let y = lineHeight;
  let end;
  for (end = start; end < content.length; end += 1) {
    // 如果已经到达最底，换页，将end回退一个字符
    if (y > height) {
      end -= 1;
      break;
    }
    const ch = content[end];
    // 如果是换行符，x缩进两个字符，y加一行并加上段落高
    if (ch === '\n') {
      x = defaultStartOffset;
      y += (lineHeight + paragraphSpacing);
    } else {
      // 计算该字符的显示宽度
      const chWidth = ctx.measureText(ch).width;
      if (chWidth + x > width) {
        x = 0;
        y += lineHeight;
      }
      ctx.fillText(ch, x, y);
      x += chWidth;
    }
  }
  return {
    end,
    canvas,
  };
}

function getCanvasList(content, options) {
  let start = 0;
  const max = content.length;
  let isEnd = false;
  const list = [];
  // 是否已到最后一页
  while (!isEnd) {
    const result = getCanvasFillText(content, start, options);
    list.push(result);
    // 开始字符重新赋值
    start = result.end;
    if (start >= max) {
      isEnd = true;
    }
  }
  return list;
}

exports.getCanvasList = getCanvasList;
exports.getCanvasFillText = getCanvasFillText;
