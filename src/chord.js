function SubitoChord(notes) {
  this.notes = Subito._isArray(notes) ? notes : [];
  this.g = this.graphical = {};
  this.measure = null;
}

SubitoChord.prototype = {
  addNote: function chordAddNote(note) {
    if(!(note instanceof SubitoNote)) {
      throw new Subito.Exception('InvalidNote', 'Invalid parameters');
    }

    //note.setChord(this);
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
  }
};

