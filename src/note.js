function SubitoNote(name, duration) {
  try {
    this.tnote = new teoria.TeoriaNote(name, duration);
  } catch(e) {
    throw new Subito.Exception('InvalidNote', e.message);
  }

  this.cachedMetrics = null;
  this.beams = [];
  this.voice = null;
  this.measure = null;
  this.graphical = this.g = {};
}

SubitoNote.prototype.render = function(renderer) {
  var ctx = renderer.context;
  var font = renderer.font;
  var head = this.getHeadGlyphName();
  var headwidth = renderer.font.glyphs[head].hoz * renderer.font.scale.x;
  var clef = this.measure.getClef();
  var yshift = this.measure.g.pen.y;
  var lpos, lx, ly, i, length, stemx, ls, pos, y;

  // Render head
  ls = renderer.settings.measure.linespan;
  pos = Subito.C4 - this.tnote.key(true);
  pos = clef.c4 + pos/2;
  y = ls*pos;
  ctx.renderGlyph(head, this.measure.g.pen.x, yshift + y);
  this.g.x = this.measure.g.pen.x;
  this.g.y = yshift + y;

  // Render ledger lines if any
  if(pos >= 5) {
    lpos = Math.floor(pos);
    for(i = 0, length = lpos - 4; i < length; i++) {
      lx = this.measure.g.pen.x;
      ly = ls*(5+i) + yshift;

      ctx.beginPath();
      ctx.moveTo(lx - headwidth/2, ly);
      ctx.lineTo(lx + headwidth*1.5, ly);
      ctx.closePath();
      ctx.stroke();
    }
  } else if(pos <= -1) {
    lpos = Math.ceil(pos);
    for(i = 0, length = 0 - lpos; i < length; i++) {
      lx = this.measure.g.pen.x;
      ly = -ls*(i+1) + yshift;

      ctx.beginPath();
      ctx.moveTo(lx - headwidth/2, ly);
      ctx.lineTo(lx + headwidth*1.5, ly);
      ctx.closePath();
      ctx.stroke();
    }
  }

  // Render stem if any
  var direction = this.getStem(clef);
  var stemlength = renderer.settings.note.stem;
  if(this.tnote.duration >= 2) {
    if(direction == 'up') {
      stemx = this.measure.g.pen.x +
        font.glyphs[head].hoz * font.scale.x - 0.5;

      ctx.beginPath();
      ctx.moveTo(stemx, yshift + y);
      ctx.lineTo(stemx, yshift + y-stemlength);
      ctx.closePath();
      ctx.stroke();
    } else {
      stemx = this.measure.g.pen.x + 0.5;
      ctx.beginPath();
      ctx.moveTo(stemx, yshift + y);
      ctx.lineTo(stemx, yshift + y+stemlength);
      ctx.closePath();
      ctx.stroke();
    }
  }

  // Render flag if any
  if(this.tnote.duration >=8 && this.beams.length == 0) {
    var flag = this.getFlagGlyphName();
    var flagx = this.measure.g.pen.x;
    var flagy = yshift;

    if(direction == 'up') {
      flagx += font.glyphs[head].hoz * font.scale.x;
      flagy = flagy + (y - stemlength);
    } else {
      flagx += 1;
      flagy = flagy + (y + stemlength);
    }

    ctx.renderGlyph(flag, flagx, flagy);
  } else if(this.beams.length > 0) { // Render beams
    for(i = 0, length = this.beams.length; i < length; i++) {
      this.beams[i].render(renderer);
    }
  }
};

SubitoNote.prototype.getHeadGlyphName = function() {
  var name;
  if(this.tnote.duration >= 4) {
    name = 'noteheads.s2';
  } else if(this.tnote.duration === 2) {
    name = 'noteheads.s1';
  } else if(this.tnote.duration === 1) {
    name = 'noteheads.s0';
  }

  return name;
};

SubitoNote.prototype.getFlagGlyphName = function() {
  var duration = this.tnote.duration;
  var direction = this.getStem(this.measure.getClef());
  if(duration == 8) {
    return (direction == 'up') ? 'flags.u3' : 'flags.d3';
  } else if(duration == 16) {
    return (direction == 'up') ? 'flags.u4' : 'flags.d4';
  } else if(duration == 32) {
    return (direction == 'up') ? 'flags.u5' : 'flags.d5';
  } else if(duration == 64) {
    return (direction == 'up') ? 'flags.u6' : 'flags.d6';
  } else if(duration == 128) {
    return (direction == 'up') ? 'flags.u7' : 'flags.d7';
  }
};

SubitoNote.prototype.getStem = function(clef, ignoreBeam) {
  var stem;
  if(this.g && this.g.stem) { // If a fixed stem is set
    return this.g.stem;
  } else if(this.voice && (stem = this.voice.getStem())) {
    return stem;
  } else if(!ignoreBeam && this.beams.length > 0) {
    for(var i = 0, length = this.beams.length; i < length; i++) {
      if((stem = this.beams[i].getStem())) {
        return stem;
      }
    }
  }

  clef = (clef instanceof SubitoClef) ? clef : this.measure.getClef();

  var pos = Subito.C4 - this.tnote.key(true);
  pos = clef.c4 + pos/2;

  return (pos <= 2) ? 'down' : 'up';
};

SubitoNote.prototype.getMetrics = function() {
  if(this.cachedMetrics) {
    return this.cachedMetrics;
  }

  a = this.measure;
  var pos = Subito.C4 - this.tnote.key(true);
  pos = this.measure.getClef().c4 + pos/2;

  var metric = {
    position: pos
  };

  return (this.cachedMetrics = metric);
};

SubitoNote.prototype.setMeasure = function(measure) {
  if(!(measure instanceof SubitoMeasure)) {
    throw new Subito.Exception('InvalidMeasure',
        'Invalid measure as parameter');
  }

  this.measure = measure;
};

SubitoNote.prototype.setBeam = function(beam) {
  if(!(beam instanceof SubitoBeam)) {
    throw new Subito.Exception('InvalidBeam', 'Invalid beam as parameter');
  }

  this.beams.push(beam);
};

SubitoNote.prototype.setVoice = function(voice) {
  if(!(voice instanceof SubitoVoice)) {
    throw new Subito.Exception('InvalidVoice', 'Invalid voice as parameter');
  }

  this.voice = voice;
};

SubitoNote.prototype.getDUnits = function() {
  return SubitoMeasure.DurationUnits / this.tnote.duration;
};

