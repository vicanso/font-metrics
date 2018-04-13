var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FontMetrics = function () {
  function FontMetrics(options) {
    _classCallCheck(this, FontMetrics);

    this.options = options;
    this.widths = {};
  }
  // 获取文本的宽度


  _createClass(FontMetrics, [{
    key: 'getTextWidth',
    value: function getTextWidth(ctx, ch) {
      var cache = this.options.cache;

      if (!cache) {
        return ctx.measureText(ch).width;
      }
      var width = this.widths[ch];
      if (!width) {
        width = ctx.measureText(ch).width;
        this.widths[ch] = width;
      }
      return width;
    }
    // 获取文本填充内容

  }, {
    key: 'getFillText',
    value: function getFillText(content, start) {
      // eslint-disable-next-line
      var canvas = document.createElement('canvas');
      var options = this.options;
      var _options = this.options,
          fontFamily = _options.fontFamily,
          color = _options.color,
          devicePixelRatio = _options.devicePixelRatio,
          format = _options.format;


      var ctx = canvas.getContext('2d');
      var backingStoreRatio = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;
      var ratio = (devicePixelRatio || 1) / backingStoreRatio;
      var width = options.width * ratio;
      var height = options.height * ratio;
      var paragraphSpacing = ratio * (options.paragraphSpacing || 18);
      var fontSize = ratio * options.fontSize;
      var fontWeight = options.fontWeight || 'normal';
      var lineHeight = ratio * (options.lineHeight || Math.ceil(options.fontSize * 1.5));
      canvas.width = width;
      canvas.height = height;
      ctx.textBaseline = 'bottom';
      ctx.font = fontWeight + ' ' + fontSize + 'px ' + (fontFamily || 'sans-serif');
      if (color) {
        ctx.fillStyle = color;
      }
      var defaultStartOffset = 2 * fontSize;
      var prevCh = content[start - 1];
      var x = !prevCh || prevCh === '\n' ? defaultStartOffset : 0;
      var y = lineHeight;
      var end = void 0;
      var contentList = [];
      var str = '';
      var indent = x;
      for (end = start; end < content.length; end += 1) {
        var ch = content[end];
        // 如果是换行符，x缩进两个字符，y加一行并加上段落高
        if (ch === '\n') {
          // 如果是新的一页的第一个字符，直接跳过
          if (start !== end) {
            contentList.push({
              data: str,
              indent: indent
            });
            contentList.push({
              data: '\n'
            });
            str = '';
            y += lineHeight + paragraphSpacing;
          }
          x = defaultStartOffset;
          indent = x;
          // 如果已经到达最底，换页
          if (y > height) {
            break;
          }
        } else {
          // 计算该字符的显示宽度
          var chWidth = this.getTextWidth(ctx, ch);
          if (chWidth + x > width) {
            contentList.push({
              data: str,
              indent: indent
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
          indent: indent
        });
      }
      var result = {
        start: start,
        end: end,
        ratio: ratio
      };
      if (format === 'html') {
        var arr = [];
        var html = '';
        var style = {
          margin: 0,
          padding: '0 0 ' + paragraphSpacing + 'px 0',
          'line-height': lineHeight + 'px',
          'font-size': fontSize + 'px',
          'font-weight': fontWeight,
          color: color
        };
        var stylDesc = '';
        var keys = Object.keys(style);
        keys.forEach(function (k) {
          stylDesc += k + ':' + style[k] + ';';
        });
        contentList.forEach(function (item) {
          var spanStyle = 'display: inline-block;white-space: nowrap;';
          if (item.indent) {
            spanStyle += 'text-indent:' + item.indent + 'px;';
          }
          // 如果下一段，则将内容生成一个<p>
          if (item.data === '\n') {
            arr.push('<p style="' + stylDesc + '">' + html + '</p>');
            html = '';
          } else {
            html += '<span style="' + spanStyle + '">' + item.data + '</span>';
          }
        });
        if (html) {
          arr.push('<p style="' + stylDesc + '">' + html + '</p>');
        }
        result.html = arr.join('');
      } else {
        result.canvas = canvas;
      }
      return result;
    }
  }, {
    key: 'getFillTextList',
    value: function getFillTextList(content) {
      var start = 0;
      var max = content.length;
      var isEnd = false;
      var list = [];
      // 是否已到最后一页
      while (!isEnd) {
        var result = this.getFillText(content, start);
        list.push(result);
        // 开始字符重新赋值
        start = result.end;
        if (start >= max) {
          isEnd = true;
        }
      }
      return list;
    }
  }]);

  return FontMetrics;
}();

export default FontMetrics;
