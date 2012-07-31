function SubitoChord(notes) {
  this.notes = Subito._isArray(notes) ? notes : [];
  for(var i = 0, n = this.notes.length; i < n; i++) {
    this.notes[i].setChord(this);
  }

  this.g = this.graphical = {};
  this.measure = null;
  this.cache = {stem: null};
}

SubitoChord.prototype = {
  addNote: function chordAddNote(note) {
    if(!(note instanceof SubitoNote)) {
      throw new Subito.Exception('InvalidNote', 'Invalid parameters');
    }

    note.setChord(this);
    this.notes.push(note);
  },

  render: function chordRender(renderer) {
    var i, n, notes = this.notes, dir, x, y, ctx = renderer.context, stem,
        yshift = this.measure.g.pen.y, settings = renderer.settings,
        ls = settings.measure.linespan, pos, outer;
    // Render notes
    for(i = 0, n = notes.length; i < n; i++) {
      notes[i].render(renderer);
    }

    // Render stem
    dir = this.getStem();
    outer = this.getOuterNotes();

    stem = renderer.settings.note.stem;
    if(dir === 'up') {
      x = outer[0].g.x + outer[0].getMetrics(renderer).headwidth;
      y = outer[0].g.y;
      pos = outer[1].getMetrics().position;
      if(pos >= 6) {
        stem += (pos + 0.5 - 6) * ls + settings.measure.linewidth/2;
      }

      ctx.beginPath();
      ctx._exMoveTo(x, y);
      ctx._exLineTo(x, outer[1].g.y-stem);
      ctx.closePath();
      ctx.stroke();
    } else {
      x = outer[0].g.x;
      y = outer[1].g.y;
      pos = outer[0].getMetrics().position;
      if(pos < -1) {
        stem += Math.abs(pos + 1 + 0.5) * ls + settings.measure.linewidth/2;
      }

      ctx.beginPath();
      ctx._exMoveTo(x, y);
      ctx._exLineTo(x, outer[0].g.y+stem);
      ctx.closePath();
      ctx.stroke();
    }
  },

  getMetrics: function chordGetMetrics(renderer, nocache) {
    if(this.cachedMetrics && !nocache) {
      return this.cachedMetrics;
    }

    var metrics = this.notes[0].getMetrics();

    return (this.cachedMetrics = metrics);
  },

  setMeasure: function chordSetMeasure(measure) {
    if(measure instanceof SubitoMeasure) {
      this.measure = measure;
      for(var i = 0, n = this.notes.length; i < n; i++) {
        this.notes[i].setMeasure(measure);
      }
    } else {
      throw new Subito.Exception('InvalidMeasure', 'Invalid parameters');
    }
  },

  getStem: function chordGetStem(clef, nocache) {
    if(this.cache.stem && !nocache) {
      return this.cache.stem;
    }

    clef = (clef instanceof SubitoClef) ? clef : this.measure.getClef();
    var i, n, notes = this.notes, highest = 2, lowest = 2, pos;

    for(i = 0, n = notes.length; i < n; i++) {
      pos = notes[i].getMetrics().position;
      highest = Math.min(highest, pos);
      lowest = Math.max(lowest, pos);
    }

    if(Math.abs(highest - 2) >= Math.abs(lowest - 2)) { // Stem up
      return (this.cache.stem = 'down');
    } else {
      return (this.cache.stem = 'up');
    }
  },

  getOuterNotes: function chordGetOuterNotes() {
    var lowest, lowestPos, highest, highestPos, i, n, notes = this.notes, pos;

    for(i = 0, n = notes.length; i < n; i++) {
      pos = notes[i].getMetrics().position;
      if(!lowestPos || pos > lowestPos) {
        lowest = notes[i];
        lowestPos = pos;
      }

      if (!highestPos || pos < highestPos) {
        highest = notes[i];
        highestPos = pos;
      }
    }

    return [lowest, highest];
  }
};

