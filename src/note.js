/**
 * SubitoNote
 *  - Describes a musical note.
 */
function SubitoNote(note) {
  this.note = note || null;
  this.voice = null;
  this.beams = [];
  this.rest = false;
}

SubitoNote.prototype.render = function(renderer, measure) {
  var headGlyph = this.getHeadGlyph();
  var diff = -1 * (this.note.key(true)-Subito.C4)/2; // '/2' because we count in whole lines
  var clefC4 = measure.clef.c4;
  var pos = renderer.settings.stave.linespace*(clefC4+diff), i, length;
  // Render note head
  renderer.context.renderGlyph(headGlyph, 0, pos);
  
  // Render stem ?
  
  // Render ledger lines down
  if((clefC4+diff) >= 5) {
    length = Math.floor((clefC4+diff)-5)+1;
    for(i = 0; i < length; i++) {
      renderer.context.beginPath()
                      .moveTo(35, renderer.settings.stave.linespace*(5+i))
                      .lineTo(55, renderer.settings.stave.linespace*(5+i))
                      .stroke();
    }
    
  } else if((clefC4+diff) <= -1) { // ledger lines up
    length = (-Math.round((clefC4+diff))) + 1;
    for(i = 0; i < length; i++) {
      renderer.context.beginPath()
                      .moveTo(35, 0-(renderer.settings.stave.linespace*i))
                      .lineTo(55, 0-(renderer.settings.stave.linespace*i))
                      .stroke();
    }
  }
};

SubitoNote.prototype.getBoundingBox = function(measure) {
  return {left: {x: 0, y: 0}, right: {x: 20, y: 50}};
};

SubitoNote.prototype.getHeadGlyph = function() {
  var headGlyph = null;
  if(this.note.duration >= 4) {
    headGlyph = 'noteheads.s2';
  } else if(this.note.duration == 2) {
    headGlyph = 'noteheads.s1';
  } else if(this.note.duration == 1) {
    headGlyph = 'noteheads.s0';
  }
  
  return headGlyph;
};