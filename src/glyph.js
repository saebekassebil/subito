function SubitoGlyph(glyph) {
  this.glyph = glyph;
  this.path = glyph.path.replace(/(\d|^)?([mlhvcsqtaz])(\d|$)?/ig, '$1 $2 $3');
  this.bits = this.path.split(/\s+/);
  this.position = {x: 0, y: 0};
}

SubitoGlyph.prototype.scale = function(scalex, scaley) {
  scaley = scaley || scalex;
  var bits = this.bits, x, y, x1, x2, y1, y2;
  for(var i = 0, length = bits.length; i < length; i++) {
    var bit = bits[i];
    if(bit === 'H' || bit === 'h') {
      x = parseFloat(bits[i+1]) * scalex;

      bits[++i] = x;
    } else if(bit === 'V' || bit === 'v') {
      y = parseFloat(bits[i+1]) * scaley;

      bits[++i] = y;
    } else if(bit === 'M' || bit === 'L' || bit === 'm' || bit === 'l') {
      x = parseFloat(bits[i+1]) * scalex;
      y = parseFloat(bits[i+2]) * scaley;

      bits[++i] = x;
      bits[++i] = y;
    } else if(bit === 'C' || bit === 'c') {
      x1 = parseFloat(bits[i+1]) * scalex;
      y1 = parseFloat(bits[i+2]) * scaley;
      x2 = parseFloat(bits[i+3]) * scalex;
      y2 = parseFloat(bits[i+4]) * scaley;
      x = parseFloat(bits[i+5]) * scalex;
      y = parseFloat(bits[i+6]) * scaley;

      bits[++i] = x1;
      bits[++i] = y1;
      bits[++i] = x2;
      bits[++i] = y2;
      bits[++i] = x;
      bits[++i] = y;
    } else if(bit === 'S' | bit === 's') {
      x2 = parseFloat(bits[i+1]) * scalex;
      y2 = parseFloat(bits[i+2]) * scaley;
      x = parseFloat(bits[i+3]) * scalex;
      y = parseFloat(bits[i+4]) * scaley;

      bits[++i] = x2;
      bits[++i] = y2;
      bits[++i] = x;
      bits[++i] = y;
    }
  }

  this.path = this.bits.join(' ');
};

SubitoGlyph.prototype.move = function(x, y) {
  this.position = {x: x, y: y};
  var bits = this.bits, mx, my, x1, x2, y1, y2;

  for(var i = 0, length = bits.length; i < length; i++) {
    var bit = bits[i];
    if(bit === 'H') {
      mx = parseFloat(bits[i+1]) + x;

      bits[++i] = mx;
    } else if(bit === 'V') {
      my = parseFloat(bits[i+1]) + y;

      bits[++i] = my;
    } else if(bit === 'M' || bit === 'L') {
      mx = parseFloat(bits[i+1]);
      my = parseFloat(bits[i+2]);

      mx = x + mx;
      my = y + my;

      bits[++i] = mx;
      bits[++i] = my;
    } else if(bit === 'C') {
      x1 = parseFloat(bits[i+1]) + x;
      y1 = parseFloat(bits[i+2]) + y;
      x2 = parseFloat(bits[i+3]) + x;
      y2 = parseFloat(bits[i+4]) + y;
      mx = parseFloat(bits[i+5]) + x;
      my = parseFloat(bits[i+6]) + y;

      bits[++i] = x1;
      bits[++i] = y1;
      bits[++i] = x2;
      bits[++i] = y2;
      bits[++i] = mx;
      bits[++i] = my;
    } else if(bit === 'S') {
      x2 = parseFloat(bits[i+1]) + x;
      y2 = parseFloat(bits[i+2]) + y;
      mx = parseFloat(bits[i+3]) + x;
      my = parseFloat(bits[i+4]) + y;

      bits[++i] = x2;
      bits[++i] = y2;
      bits[++i] = mx;
      bits[++i] = my;
    }
  }

  this.path = bits.join(' ');
};
