function SubitoTime(count, unit, forceNumbers) {
  this.count = count;
  this.unit = unit;
  this.line = 2; // Default to middle line
  
  this.parent = null;
  this.forceNumbers = forceNumbers || false;

  if(this.count === this.unit && this.unit === 2 && !forceNumbers) {
    this.glyph = 'timesig.C22';
  } else if(this.count === this.unit && this.unit === 4 && !forceNumbers) {
    this.glyph = 'timesig.C44';
  } else {
    this.glyph = SubitoTime.NumberToName[this.count.toString()[0]];
  }
}

SubitoTime.prototype = {
  render: function timeRender(renderer, x, y) {
    var ctx = renderer.context;
    var count = this.count, unit = this.unit;
    if(count === unit && unit === 2 && !this.forceNumbers) {
      // Render half-circle
      ctx.renderGlyph('timesig.C22', x, y);
    } else if(count === unit && unit === 4 && !this.forceNumbers) {
      // Render whole-circle
      ctx.renderGlyph('timesig.C44', x, y);
    } else {
      // Render number fraction
      count = count.toString();
      unit = unit.toString();
      var i, length, shift = 0, name,
          numwidth = renderer.font.glyphs.one.hoz * renderer.font.scale.x;

      if(unit.length > count.length) {
        shift = ((unit.length - count.length) / 2) * numwidth;
      }

      for(i = 0, length = count.length; i < length; i++) {
        name = SubitoTime.NumberToName[count[i]];
        ctx.renderGlyph(name, x + shift, y);
        shift += renderer.font.glyphs[name].hoz * renderer.font.scale.x;
      }

      if(count.length > unit.length) {
        shift = ((count.length - unit.length) / 2) * numwidth;
      } else {
        shift = 0;
      }

      for(i = 0, length = unit.length; i < length; i++) {
        name = SubitoTime.NumberToName[unit[i]];
        ctx.renderGlyph(name, x + shift,
            y + renderer.settings.measure.linespan * 2);
        shift += renderer.font.glyphs[name].hoz * renderer.font.scale.x;
      }
    }
  },

  setParent: function timeSetParent(parent) {
    this.parent = parent;
  },

  getMetrics: function timeGetMetrics(renderer) {
    if(this.cachedMetrics) {
      return this.cachedMetrics;
    }

    var strLength = Math.max(this.unit.toString().length,
                             this.count.toString().length);
    var glyph = this.glyph;
    var metrics = {
      width: renderer.font.glyphs[glyph].hoz *
              renderer.font.scale.x * strLength
    };

    return (this.cachedMetrics = metrics);
  }
};

SubitoTime.NumberToName = ['zero', 'one', 'two', 'three', 'four', 'five',
                           'six', 'seven', 'eight', 'nine'];
