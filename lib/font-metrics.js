'use strict';

class Composing {
  constructor(opts) {
    this.page = 0;
    this.opts = opts;
    this.reset();
  }
  getFontSize(ch) {
    const {
      fontSize,
      getCustomFontSize,
    } = this.opts;
    if (getCustomFontSize) {
      return getCustomFontSize(ch) || fontSize;
    }
    return fontSize;
  }
  reset() {
    this.content = [];
    this.currentText = '';
    this.currentWidth = 0;
    this.currentHeight = 0;
    this.firstParagraphIndented = false;
    return this;
  }
  nextPage() {
    this.page += 1;
    this.reset();
    return this;
  }
  addChar(ch) {
    const {
      lineHeight,
      width,
      height,
    } = this.opts;
    let {
      currentHeight,
      currentWidth,
    } = this;
    // if the first char, add the currentHeight
    if (currentWidth === 0) {
      currentHeight += lineHeight;
    }
    const fontSize = this.getFontSize(ch);
    currentWidth += fontSize;
    // if the currentWidth is larger than width (over one line)
    if (currentWidth > width) {
      currentHeight += lineHeight;
      currentWidth = fontSize;
    }
    if (currentHeight > height) {
      // over flow one page
      return 1;
    }
    this.currentText += ch;
    this.currentHeight = currentHeight;
    this.currentWidth = currentWidth;
    return 0;
  }
  addIndent() {
    const {
      indent,
      width,
      height,
      lineHeight,
    } = this.opts;
    if (!indent) {
      return 0;
    }
    let {
      currentHeight,
      currentWidth,
    } = this;
    // if the first char, add the currentHeight
    if (currentWidth === 0) {
      currentHeight += lineHeight;
    }
    currentWidth += indent;
    // if the currentWidth is larger than width (over one line)
    if (currentWidth > width) {
      currentHeight += lineHeight;
      currentWidth = indent;
    }
    if (currentHeight > height) {
      // over flow one page
      return 1;
    }
    // 每页的第一段，如果一开始是indent ，则表示该段落需要 indent ，
    // 不然则是某段落的一部分，不需要indent
    if (this.currentWidth === 0 && this.currentHeight === 0) {
      this.firstParagraphIndented = true;
    }
    this.currentHeight = currentHeight;
    this.currentWidth = currentWidth;
    return 0;
  }
  wrapLine() {
    const {
      padding,
      height,
    } = this.opts;
    if (!padding) {
      return 0;
    }
    let {
      currentHeight,
    } = this;
    currentHeight += padding;
    if (currentHeight > height) {
      return 1;
    }
    this.currentWidth = 0;
    this.currentHeight = currentHeight;
    this.content.push(this.currentText);
    this.currentText = '';
    return 0;
  }
  toJSON() {
    if (this.currentText) {
      this.content.push(this.currentText);
    }
    return {
      firstParagraphIndented: this.firstParagraphIndented,
      page: this.page,
      content: this.content,
    };
  }
}

class FontMetrics {
  constructor(options) {
    this.opts = Object.assign({
      indent: 32,
      padding: 10,
      fontSize: 16,
      lineHeight: 24,
    }, options);
  }
  set data(text) {
    this.opts.data = text.split('\n');
  }
  set region(data) {
    this.opts.region = data;
  }
  getComposing() {
    const opts = this.opts;
    if (!opts.data || !opts.region) {
      throw new Error('data or region is not set');
    }
    const composing = new Composing({
      width: opts.region.width,
      height: opts.region.height,
      indent: opts.indent,
      fontSize: opts.fontSize,
      lineHeight: opts.lineHeight,
      padding: opts.padding,
      getCustomFontSize: this.getCustomFontSize,
    });
    const composingResult = [];
    opts.data.forEach((content) => {
      let result = composing.addIndent();
      if (result === 1) {
        composingResult.push(composing.toJSON());
        composing.nextPage().addIndent();
      }
      content.split('').forEach((ch) => {
        result = composing.addChar(ch);
        if (result === 1) {
          composingResult.push(composing.toJSON());
          composing.nextPage().addChar(ch);
        }
      });
      result = composing.wrapLine();
      if (result === 1) {
        composingResult.push(composing.toJSON());
        composing.nextPage();
      }
    });
    const lastComposing = composing.toJSON();
    if (lastComposing.content.length) {
      composingResult.push(lastComposing);
    }
    return composingResult;
  }
  toHTML() {
    const composing = this.getComposing();
    const {
      indent,
      padding,
      fontSize,
      lineHeight,
    } = this.opts;
    const getStyle = (index, total, firstParagraphIndented) => {
      let style = `font-size:${fontSize}px;line-height:${lineHeight}px;`;
      if (index !== 0 || firstParagraphIndented) {
        style += `text-indent:${indent}px;`;
      }
      if (index !== total - 1) {
        style += `margin-bottom:${padding}px`;
      }
      return style;
    };
    return composing.map((item) => {
      const html = ['<div>'];
      const total = item.content.length;
      const firstParagraphIndented = item.firstParagraphIndented;
      item.content.forEach((data, index) => {
        const style = getStyle(index, total, firstParagraphIndented);
        html.push(`<p style="${style}">${data}</p>`);
      });
      html.push('</div>');
      return html.join('');
    });
  }
}

module.exports = FontMetrics;
