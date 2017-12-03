export default class FontMetrics {
  constructor(options) {
    this.options = options;
    this.widths = {};
  }
  // 获取文本的宽度
  getTextWidth(ctx, ch) {
    const {
      cache,
    } = this.options;
    if (!cache) {
      return ctx.measureText(ch).width;
    }
    let width = this.widths[ch];
    if (!width) {
      width = ctx.measureText(ch).width;
      this.widths[ch] = width;
    }
    return width;
  }
  // 获取文本填充内容
  getFillText(content, start) {
    // eslint-disable-next-line
    const canvas = document.createElement('canvas');
    const options = this.options;
    const {
      fontFamily,
      color,
      devicePixelRatio,
      format,
    } = this.options;

    const ctx = canvas.getContext('2d');
    const backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio || 1;
    const ratio = (devicePixelRatio || 1) / backingStoreRatio;
    const width = options.width * ratio;
    const height = options.height * ratio;
    const paragraphSpacing = ratio * (options.paragraphSpacing || 18);
    const fontSize = ratio * options.fontSize;
    const fontWeight = options.fontWeight || 'normal';
    const lineHeight = ratio * (options.lineHeight || Math.ceil(options.fontSize * 1.5));
    canvas.width = width;
    canvas.height = height;
    ctx.textBaseline = 'bottom';
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily || 'sans-serif'}`;
    if (color) {
      ctx.fillStyle = color;
    }
    const defaultStartOffset = 2 * fontSize;
    const prevCh = content[start - 1];
    let x = (!prevCh || prevCh === '\n') ? defaultStartOffset : 0;
    let y = lineHeight;
    let end;
    const contentList = [];
    let str = '';
    let indent = x;
    for (end = start; end < content.length; end += 1) {
      const ch = content[end];
      // 如果是换行符，x缩进两个字符，y加一行并加上段落高
      if (ch === '\n') {
        // 如果是新的一页的第一个字符，直接跳过
        if (start !== end) {
          contentList.push({
            data: str,
            indent,
          });
          contentList.push({
            data: '\n',
          });
          str = '';
          y += (lineHeight + paragraphSpacing);
        }
        x = defaultStartOffset;
        indent = x;
        // 如果已经到达最底，换页
        if (y > height) {
          break;
        }
      } else {
        // 计算该字符的显示宽度
        const chWidth = this.getTextWidth(ctx, ch);
        if (chWidth + x > width) {
          contentList.push({
            data: str,
            indent,
          });
          indent = 0;
          x = 0;
          y += lineHeight;
          str = '';
        }
        // 如果已经到达最底，换页
        if (y > height) {
          break;
        }
        if (format !== 'html') {
          ctx.fillText(ch, x, y);
        }
        str += ch;
        x += chWidth;
      }
    }
    if (str) {
      contentList.push({
        data: str,
        indent,
      });
    }
    const result = {
      start,
      end,
      ratio,
    };
    if (format === 'html') {
      const arr = [];
      let html = '';
      const style = {
        margin: 0,
        padding: `0 0 ${paragraphSpacing}px 0`,
        'line-height': `${lineHeight}px`,
        'font-size': `${fontSize}px`,
        'font-weight': fontWeight,
        color,
      };
      let stylDesc = '';
      const keys = Object.keys(style);
      keys.forEach((k) => {
        stylDesc += (`${k}:${style[k]};`);
      });
      contentList.forEach((item) => {
        let spanStyle = 'display: inline-block;white-space: nowrap;';
        if (item.indent) {
          spanStyle += `text-indent:${item.indent}px;`;
        }
        // 如果下一段，则将内容生成一个<p>
        if (item.data === '\n') {
          arr.push(`<p style="${stylDesc}">${html}</p>`);
          html = '';
        } else {
          html += `<span style="${spanStyle}">${item.data}</span>`;
        }
      });
      if (html) {
        arr.push(`<p style="${stylDesc}">${html}</p>`);
      }
      result.html = arr.join('');
    } else {
      result.canvas = canvas;
    }
    return result;
  }
  getFillTextList(content) {
    let start = 0;
    const max = content.length;
    let isEnd = false;
    const list = [];
    // 是否已到最后一页
    while (!isEnd) {
      const result = this.getFillText(content, start);
      list.push(result);
      // 开始字符重新赋值
      start = result.end;
      if (start >= max) {
        isEnd = true;
      }
    }
    return list;
  }
}
