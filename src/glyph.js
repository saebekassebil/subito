function SubitoGlyph(glyph) {
  this.glyph = glyph;
  this.path = glyph.path.replace(/(\d|^)?([a-z])(\d|$)?/ig, '$1 $2 $3');
  this.bits = this.path.split(/\s+/);
  this.position = {x: 0, y: 0};
}

SubitoGlyph.prototype.scale = function(scalex, scaley) {
  scaley = scaley || scalex;
  var bits = this.bits;
  for(var i = 0, length = bits.length; i < length; i++) {
    var bit = bits[i];
    if(bit === 'H' || bit === 'h') {
      var mx = parseFloat(bits[i+1]) * scalex;

      bits[++i] = mx;
    } else if(bit === 'V' || bit === 'v') {
      var my = parseFloat(bits[i+1]) * scaley;

      bits[++i] = my;
    } else if(bit === 'M' || bit === 'L' || bit === 'm' || bit === 'l') {
      var mx = parseFloat(bits[i+1]) * scalex;
      var my = parseFloat(bits[i+2]) * scaley;

      bits[++i] = mx;
      bits[++i] = my;
    } else if(bit === 'C' || bit === 'c') {
      var x1 = parseFloat(bits[i+1]) * scalex;
      var y1 = parseFloat(bits[i+2]) * scaley;
      var x2 = parseFloat(bits[i+3]) * scalex;
      var y2 = parseFloat(bits[i+4]) * scaley;
      var x = parseFloat(bits[i+5]) * scalex;
      var y = parseFloat(bits[i+6]) * scaley;

      bits[++i] = x1;
      bits[++i] = y1;
      bits[++i] = x2;
      bits[++i] = y2;
      bits[++i] = x;
      bits[++i] = y;
    } else if(bit === 'S' | bit === 's') {
      var x2 = parseFloat(bits[i+1]) * scalex;
      var y2 = parseFloat(bits[i+2]) * scaley;
      var x = parseFloat(bits[i+3]) * scalex;
      var y = parseFloat(bits[i+4]) * scaley;

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
  var bits = this.bits;

  for(var i = 0, length = bits.length; i < length; i++) {
    var bit = bits[i];
    if(bit === 'H') {
      var mx = parseFloat(bits[i+1]) + x;

      bits[++i] = mx;
    } else if(bit === 'V') {
      var my = parseFloat(bits[i+1]) + y;

      bits[++i] = my;
    } else if(bit === 'M' || bit === 'L') {
      var mx = parseFloat(bits[i+1]);
      var my = parseFloat(bits[i+2]);

      mx = x + mx;
      my = y + my;

      bits[++i] = mx;
      bits[++i] = my;
    } else if(bit === 'C') {
      var x1 = parseFloat(bits[i+1]) + x;
      var y1 = parseFloat(bits[i+2]) + y;
      var x2 = parseFloat(bits[i+3]) + x;
      var y2 = parseFloat(bits[i+4]) + y;
      var x = parseFloat(bits[i+5]) + x;
      var y = parseFloat(bits[i+6]) + y;

      bits[++i] = x1;
      bits[++i] = y1;
      bits[++i] = x2;
      bits[++i] = y2;
      bits[++i] = x;
      bits[++i] = y;
    } else if(bit === 'S') {
      var x2 = parseFloat(bits[i+1]) + x;
      var y2 = parseFloat(bits[i+2]) + y;
      var x = parseFloat(bits[i+3]) + x;
      var y = parseFloat(bits[i+4]) + y;

      bits[++i] = x2;
      bits[++i] = y2;
      bits[++i] = x;
      bits[++i] = y;
    }
  }

  this.path = bits.join(' ');
};
