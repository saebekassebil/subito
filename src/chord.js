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
    var i, n, notes = this.notes;
    for(i = 0, n = notes.length; i < n; i++) {
      notes[i].render(renderer);
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

    for(var i = 0, n = notes.length; i < n; i++) {
      pos = notes[i].getMetrics(clef).position;
      highest = Math.min(highest, pos);
      lowest = Math.max(lowest, pos);
    }

    if(Math.abs(highest - 2) >= Math.abs(lowest - 2)) { // Stem up
      return (this.cache.stem = 'down');
    } else {
      return (this.cache.stem = 'up');
    }
  }
};

