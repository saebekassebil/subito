Subito.Parser.MusicJSON = (function() {
  function constructor(source) {
    this.source = JSON.parse(source);
  }
  
  function parseMeasure(measure) {
    var subitoMeasure = new SubitoMeasure(), subitoNote, note, teoriaNote;
    if(Object.prototype.toString.call(measure.note) === '[object Array]') {
      for(var i = 0, length = measure.note.length; i < length; i++) {
        note = measure.note[i];
        
        teoriaNote = teoria.note(note.pitch.step + note.pitch.octave, note.duration);
        subitoNote = new SubitoNote(teoriaNote);
        subitoMeasure.elements.push(subitoNote);
      }
    } else {
      note = measure.note;
      teoriaNote = teoria.note(note.pitch.step + note.pitch.octave, note.duration);
      subitoNote = new SubitoNote(teoriaNote);
      subitoMeasure.elements.push(subitoNote);
    }
    
    return subitoMeasure;
  }
  
  constructor.prototype = {
    parseScore: function() {
      if(!this.source) return false;
      var source = this.source;
      var score = source['score-partwise'];
      var part = score.part;
      var measures = part.measure;
      
      var subitoScore = new SubitoScore();
      var subitoSystem = new SubitoSystem();
      var subitoStave = new SubitoStave();
      subitoStave.clef = new SubitoClef('g');
      var subitoMeasure;
      
      subitoSystem.staves.push(subitoStave);
      subitoScore.systems.push(subitoSystem);
      if(Object.prototype.toString.call(measures) === '[object Array]') {
        for(var i = 0, length = measures.length; i < length; i++) {
          subitoStave.measures.push(parseMeasure(measures[i]));
        }
      } else {
        subitoStave.measures.push(parseMeasure(measures));
      }
      
      return subitoScore;
    }
  };
  
  return constructor;
})();