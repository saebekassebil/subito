/**
 * A truly naive and half-hearted implementation
 * But works for the most basics
 **/
Subito.Parsers.MusicJSON = (function() {
  function constructor(source) {
    this.source = JSON.parse(source);
  }

  function parseMeasure(measure) {
    var subitoMeasure = new SubitoMeasure(), subitoNote, note,
        notes = [], beam, tryBeam = false;
    if(Object.prototype.toString.call(measure.note) === '[object Array]') {
      for(var i = 0, length = measure.note.length; i < length; i++) {
        note = measure.note[i];

        var name = note.pitch.step + note.pitch.octave;
        subitoNote = new SubitoNote(name, note.duration);

        if(note.duration >= 8) {
          if(tryBeam) {
            beam = beam || new SubitoBeam();
            if(beam.notes.length === 0) {
              beam.addNote(notes[i-1]);
            }

            beam.addNote(subitoNote);
          }

          tryBeam = true;
        }

        notes.push(subitoNote);
        subitoMeasure.addContext(subitoNote);
      }
    } else {
      note = measure.note;
      var name = note.pitch.step + note.pitch.octave;
      subitoNote = new SubitoNote(name, note.duration);
      subitoMeasure.addContext(subitoNote);
    }

    return subitoMeasure;
  }

  constructor.prototype = {
    parseScore: function() {
      if(!this.source) {
        return false;
      }

      var source = this.source;
      var score = source['score-partwise'];
      var part = score.part;
      var measures = part.measure;

      var subitoScore = new SubitoScore();
      var subitoSystem = new SubitoSystem();
      var subitoStave = new SubitoStave();
      subitoStave.setClef(new SubitoClef('g'));
      var subitoMeasure;

      subitoSystem.addContext(subitoStave);
      subitoScore.addContext(subitoSystem);
      if(Object.prototype.toString.call(measures) === '[object Array]') {
        for(var i = 0, length = measures.length; i < length; i++) {
          subitoStave.addContext(parseMeasure(measures[i]));
        }
      } else {
        subitoStave.addContext(parseMeasure(measures));
      }

      return subitoScore;
    }
  };

  return constructor;
})();
