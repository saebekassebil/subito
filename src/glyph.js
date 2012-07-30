function SubitoGlyph(glyph) {
  this.glyph = glyph;
  this.rawpath = glyph.path.replace(/(\d)?([mlhvcsqtaz])(\d)?/ig,
                                    '$1 $2 $3');
  var bits = this.rawpath.split(' '), bit, num, index, path = [];

  // Compile string-path to array-format
  for(var i = 0, length = bits.length; i < length; i++) {
    bit = bits[i];
    if(!bit) {
      continue;
    }

    num = parseFloat(bit);
    if(isNaN(num)) {
      index = path.push([bit]) - 1;
    } else {
      path[index].push(num);
    }
  }

  this.path = path;
}

SubitoGlyph.prototype = {
  scale: function glyphScale(scalex, scaley) {
    scaley = scaley || scalex;
    var path = this.path, c, name, i, length, ii, n;
    for(i = 0, length = path.length; i < length; i++) {
      c = path[i];
      name = c[0];
      for(ii = 1, n = c.length; ii < n; ii++) {
        if(name === 'H' || name === 'h') {
          path[i][ii] = path[i][ii] * scalex;
        } else if(name === 'V' || name === 'v') {
          path[i][ii] = path[i][ii] * scaley;
        } else if(ii % 2 === 1) { // X parameter
          path[i][ii] = path[i][ii] * scalex;
        } else { // Y parameter
          path[i][ii] = path[i][ii] * scaley;
        }
      }
    }

    this.cachedPath = null;
    return (this.path = path);
  },

  move: function glyphMove(x, y) {
    var path = this.path, c, name, i, length, ii, n;
    for(i = 0, length = path.length; i < length; i++) {
      c = path[i];
      name = c[0];
      if(name === name.toUpperCase()) {
        for(ii = 1, n = c.length; ii < n; ii++) {
          if(name === 'H' || name === 'h') {
            path[i][ii] = path[i][ii] + x;
          } else if(name === 'V' || name === 'v') {
            path[i][ii] = path[i][ii] + y;
          } else if(ii % 2 === 1) { // X parameter
            path[i][ii] += x;
          } else { // Y parameter
            path[i][ii] += y;
          }
        }
      }
    }

    this.cachedPath = null;
    return (this.path = path);
  },

  getPath: function glyphGetPath() {
    if(this.cachedPath) {
      return this.cachedPath;
    }

    var path = '';
    for(var i = 0, length = this.path.length; i < length; i++) {
      path += this.path[i].join(' ') + ' ';
    }

    return (this.cachedPath = path);
  }
};

