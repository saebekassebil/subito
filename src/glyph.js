function SubitoGlyph(glyph) {
  this.glyph = glyph;
  this.path = glyph.path.replace(/(\d|^)?([a-z])(\d|$)?/ig, '$1 $2 $3');
  this.bits = this.path.split(/\s+/);
  this.position = {x: 0, y: 0};
}

SubitoGlyph.prototype.scale = function(scale) {
  var num;
  for(var i = 0, length = this.bits.length; i < length; i++) {
    if(!isNaN(num = parseFloat(this.bits[i]))) {
      this.bits[i] = num * scale;
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
