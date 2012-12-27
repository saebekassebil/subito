function SubitoNote(name, duration) {
  try {
    this.tnote = new teoria.TeoriaNote(name, {value: duration});
  } catch(e) {
    throw new Subito.Exception('InvalidNote', e.message);
  }

  this.cache = {metrics: null, stem: null};
  this.beams = [];
  this.voice = null;
  this.measure = null;
  this.graphical = this.g = {};
}

SubitoNote.prototype = {
  render: function noteRender(renderer) {
    var ctx = renderer.context;
    var font = renderer.font;
    var head = this.getHeadGlyphName();
    var headwidth = font.glyphs[head].hoz * font.scale.x;
    var clef = this.measure.getClef();
    var yshift = this.measure.g.pen.y;
    var settings = renderer.settings;
    var lpos, lx, ly, i, length, stemx, ls, pos, y, gx, gy;

    ls = settings.measure.linespan;
    pos = Subito.C4 - this.tnote.key(true);
    pos = clef.c4 + pos/2;
    y = ls*pos;
    gx = this.measure.g.pen.x;
    gy = yshift + y;

    // Render Accidentals if any
    var accidental = this.tnote.accidental;
    if(accidental.value !== 0) {
      var accidentalHead;
      if(accidental.value === 1) {
        accidentalHead = 'accidentals.sharp';
      } else if(accidental.value === 2) {
        accidentalHead = 'accidentals.doublesharp';
      } else if(accidental.value === -1) {
        accidentalHead = 'accidentals.flat';
      } else if(accidental.value === -2) {
        accidentalHead = 'accidentals.flatflat';
      }

      var width = font.glyphs[accidentalHead].hoz * font.scale.x * 1.5;

      gx = Math.round(gx + width);
      ctx.renderGlyph(accidentalHead, gx - width, yshift + y);
    }

    // Render head
    ctx.renderGlyph(head, gx, yshift + y);

    // Render ledger lines if any
    lx = gx;
    if(pos >= 5) {
      lpos = Math.floor(pos);
      for(i = 0, length = lpos - 4; i < length; i++) {
        ly = ls * (5 + i) + yshift;

        ctx.beginPath();
        ctx._exMoveTo(lx - headwidth/2, ly);
        ctx._exLineTo(lx + headwidth*1.5, ly);
        ctx.closePath();
        ctx.stroke();
      }
    } else if(pos <= -1) {
      lpos = Math.ceil(pos);
      for(i = 0, length = 0 - lpos; i < length; i++) {
        ly = -ls * (i + 1) + yshift;

        ctx.beginPath();
        ctx._exMoveTo(lx - headwidth/2, ly);
        ctx._exLineTo(lx + headwidth*1.5, ly);
        ctx.closePath();
        ctx.stroke();
      }
    }

    var direction = this.getStem(clef, false, true);
    var stemlength = this.g.stemlength || settings.note.stem;

    // Extend stem to touch middle line
    if(direction === 'up' && pos >= 6 && !this.g.stemlength) {
      stemlength += (pos - 6) * ls + settings.measure.linewidth/2;
    } else if(direction === 'down' && pos < -1 && !this.g.stemlength) {
      stemlength += Math.abs(pos + 1) * ls + settings.measure.linewidth/2;
    }

    // Render stem if any and not part of a chord If it's part of a chord,
    // the stem rendering will be done by SubitoChord#render
    if(this.tnote.duration.value >= 2 && !this.chord) {
      if(direction === 'up') {
        stemx = gx +
          font.glyphs[head].hoz * font.scale.x - settings.note.stemwidth/2;

        ctx.beginPath();
        ctx._exMoveTo(stemx, yshift + y);
        ctx._exLineTo(stemx, yshift + y-stemlength);
        ctx.closePath();
        ctx.stroke();
      } else {
        stemx = gx;
        ctx.beginPath();
        ctx._exMoveTo(stemx, yshift + y);
        ctx._exLineTo(stemx, yshift + y+stemlength);
        ctx.closePath();
        ctx.stroke();
      }
    }

    // Render flag if any
    if(this.tnote.duration.value >= 8 && this.beams.length === 0) {
      var flag = this.getFlagGlyphName();
      var flagx = gx;
      var flagy = yshift;

      if(direction === 'up') {
        flagx += headwidth;
        flagy = flagy + (y - stemlength);
      } else {
        flagx += settings.note.stemwidth;
        flagy = flagy + (y + stemlength);
      }

      ctx.renderGlyph(flag, flagx, flagy);
    } else if(this.beams.length > 0) { // Render beams
      this.g.x = gx;
      this.g.y = gy;
      for(i = 0, length = this.beams.length-1; i < length; i++) {
        this.beams[i].setNextBeam(this.beams[i+1]);
        this.beams[i+1].setPreviousBeam(this.beams[i]);
      }

      this.beams[0].render(renderer);
      delete renderer.flags.beamNumber;
    }

    this.g.rendered = true;
    this.g.x = gx;
    this.g.y = gy;
  },

  getHeadGlyphName: function noteGetHeadGlyphName() {
    var name;
    if(this.tnote.duration.value >= 4) {
      name = 'noteheads.s2';
    } else if(this.tnote.duration.value === 2) {
      name = 'noteheads.s1';
    } else if(this.tnote.duration.value === 1) {
      name = 'noteheads.s0';
    }

    return name;
  },

  getFlagGlyphName: function noteGetFlagGlyphName() {
    var duration = this.tnote.duration.value;
    var direction = this.getStem(this.measure.getClef());
    if(duration === 8) {
      return (direction === 'up') ? 'flags.u3' : 'flags.d3';
    } else if(duration === 16) {
      return (direction === 'up') ? 'flags.u4' : 'flags.d4';
    } else if(duration === 32) {
      return (direction === 'up') ? 'flags.u5' : 'flags.d5';
    } else if(duration === 64) {
      return (direction === 'up') ? 'flags.u6' : 'flags.d6';
    } else if(duration === 128) {
      return (direction === 'up') ? 'flags.u7' : 'flags.d7';
    }
  },

  getStem: function noteGetStem(clef, ignore, nocache) {
    var stem;
    if(this.cache.stem && !nocache) {
      return this.cache.stem;
    } else if(this.g && this.g.stem) { // If a fixed stem is set
      stem = this.g.stem;
    } else if (this.chord && !ignore) {
      stem = this.chord.getStem(clef);
    } else if(!ignore && this.beams.length > 0) {
      for(var i = 0, length = this.beams.length; i < length; i++) {
        if((stem = this.beams[i].getStem())) {
          break;
        }
      }
    } else if(this.voice) {
      stem = this.voice.getStem();
    }

    if(stem) {
      if(!ignore && !nocache) {
        this.cache.stem = stem;
      }

      return stem;
    }

    clef = (clef instanceof SubitoClef) ? clef : this.measure.getClef();

    var pos = Subito.C4 - this.tnote.key(true);
    pos = clef.c4 + pos/2;
    stem = (pos <= 2) ? 'down' : 'up';

    if(!ignore && !nocache) {
      this.cache.stem = stem;
    }

    return stem;
  },

  getMetrics: function noteGetMetrics(renderer) {
    if(this.cache.metrics && !(renderer && !this.cache.metrics.headwidth)) {
      return this.cache.metrics;
    }
    var pos, headwidth;

    pos = Subito.C4 - this.tnote.key(true);
    pos = this.measure.getClef().c4 + pos/2;

    if(renderer) {
      headwidth = renderer.font.glyphs[this.getHeadGlyphName()].hoz *
        renderer.font.scale.x;
    }

    var metric = {
      position: pos,
      headwidth: headwidth
    };

    return (this.cache.metrics = metric);
  },

  setMeasure: function noteSetMeasure(measure) {
    if(!(measure instanceof SubitoMeasure)) {
      throw new Subito.Exception('InvalidMeasure',
          'Invalid measure as parameter');
    }

    this.measure = measure;
  },

  setBeam: function noteSetBeam(beam) {
    if(!(beam instanceof SubitoBeam)) {
      throw new Subito.Exception('InvalidBeam', 'Invalid beam as parameter');
    }

    this.beams.push(beam);
  },

  setVoice: function noteSetVoice(voice) {
    if(!(voice instanceof SubitoVoice)) {
      throw new Subito.Exception('InvalidVoice', 'Invalid voice as parameter');
    }

    this.voice = voice;
  },

  setChord: function noteSetChord(chord) {
    if(!(chord instanceof SubitoChord)) {
      throw new Subito.Exception('InvalidChord', 'Invalid chord as parameter');
    }

    this.chord = chord;
  },

  getDUnits: function noteGetDUnits() {
    return SubitoMeasure.DurationUnits / this.tnote.duration.value;
  }
};

