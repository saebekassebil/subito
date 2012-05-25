function SubitoVoice(notes) {
  this.notes = (notes && Subito._isArray(notes)) ? notes : [];
  this.fixedStem = null;
}

SubitoVoice.prototype.render = function(renderer) {
  var ctx = renderer.context;
};

SubitoVoice.prototype.addNote = function(note) {
  if(!(note instanceof SubitoNote)) {
    throw new Subito.Exception('InvalidNote', 'The note is invalid');
  }

  note.setVoice(this);
  this.notes.push(note);
};

SubitoVoice.prototype.setStem = function(direction) {
  this.fixedStem = direction;
};

SubitoVoice.prototype.getStem = function() {
  return this.fixedStem || null;
};

