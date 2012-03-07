function SubitoClef(name) {
  if(!(name in SubitoClef.Clefs)) {
    throw new Subito.Exception('InvalidClef',
        name + ' is an invalid clef name');
  }
  var clef = SubitoClef.Clefs[name];

  this.name = name;
  this.line = clef.line;
  this.glyph = clef.glyph;
  this.c4 = clef.c4;
}

SubitoClef.prototype.render = function(renderer, x, y) {
  var ctx = renderer.context;

  ctx.renderGlyph(this.glyph, x, y);
};

SubitoClef.prototype.getMetrics = function(renderer) {
  if(this.cachedMetrics) {
    return this.cachedMetrics;
  }

  var metrics = {
    width: renderer.font.glyphs[this.glyph].hoz * renderer.font.scale.x
  };

  return (this.cachedMetrics = metrics);
};

SubitoClef.Clefs = {
  'g': {
    line: 3,
    glyph: 'clefs.G',
    c4: 5
  },

  'f': {
    line: 1,
    glyph: 'clefs.F',
    c4: -1
  }
};
