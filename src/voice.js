function SubitoVoice(notes) {
  this.notes = (notes && Subito._isArray(notes)) ? notes : [];
  this.fixedStem = null;
}

SubitoVoice.prototype = {
  render: function voiceRender(renderer) {
    var ctx = renderer.context;
  },

  addNote: function voiceAddNote(note) {
    if(!(note instanceof SubitoNote)) {
      throw new Subito.Exception('InvalidNote', 'The note is invalid');
    }

    note.setVoice(this);
    this.notes.push(note);
  },

  setStem: function voiceSetStem(direction) {
    this.fixedStem = direction;
  },

  getStem: function voiceGetStem() {
    return this.fixedStem || null;
  }
};

