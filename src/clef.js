/**
 * SubitoClef
 *  - Describes a clef change in a measure
 */
function SubitoClef(sign) {
  if(!SubitoClef.Clefs[sign]) {
    throw new Subito.Exception('Invalid Clef type');
  }
  
  this.sign = sign;
  this.line = SubitoClef.Clefs[sign].line;
  this.glyph = SubitoClef.Clefs[sign].glyph;
  this.c4 = SubitoClef.Clefs[sign].c4;
}

SubitoClef.prototype.render = function(renderer, measure) {
  renderer.context.renderGlyph(this.glyph, 0,
      renderer.settings.stave.linespace*this.line);
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
  },
  
  'c': {
    line: 2,
    glyph: 'clefs.C',
    c4: 2
  },
  
  'g_change': {
    line: 3,
    glyph: 'clefs.G_change',
    c4: 5
  },
  
  'f_change': {
    line: 1,
    glyph: 'clefs.F_change',
    c4: -1
  },
  
  'c_change': {
    line: 2,
    glyph: 'clefs.C._change',
    c4: 2
  }
};
