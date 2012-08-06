/**
 * A most basic MusicJSON parser
 **/
Subito.Parsers.MusicJSON = (function() {
  function constructor(source) {
    this.source = (typeof source === 'string') ? JSON.parse(source) : source;
  }

  function parseMeasure(measure) {
    var subitoMeasure = new SubitoMeasure(), subitoNote, note, length,
        notes = [], beam, tryBeam, name, key, clef, time, i, subitoClef,
        activeTime = 4, duration, divisions, activeDivision;

    if (measure.attributes) {
      // Divisions
      if ((divisions = measure.attributes.divisions)) {
        activeDivision = parseInt(divisions, 10);
      }
      // Time
      if ((time = measure.attributes.time)) {
        activeTime = time['beat-type'];

        subitoMeasure.setTime({
          beats: time.beats,
          unit: time['beat-type']
        });
      }

      // Key
      if ((key = measure.attributes.key)) {
        key = parseInt(key.fifths, 10);
        for(var akey in SubitoKey.Keys) {
          if(SubitoKey.Keys[akey] === key) {
            subitoMeasure.setKey(new SubitoKey(akey));
          }
        }
      }

      // Clef
      if ((clef = measure.attributes.clef)) {
        subitoClef = new SubitoClef(clef.sign.toLowerCase());
        // MusicXML/JSON count lines from below, Subito from the top, thus:
        subitoClef.line = 3 - (parseInt(clef.line, 10) - 2);
        subitoMeasure.setClef(subitoClef);
      }
    }

    if (Object.prototype.toString.call(measure.note) === '[object Array]') {
      for(i = 0, length = measure.note.length; i < length; i++) {
        note = measure.note[i];

        duration = activeDivision / note.duration * activeTime;
        name = note.pitch.step + note.pitch.octave;
        subitoNote = new SubitoNote(name, duration);

        if(duration >= 8) {
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
      name = note.pitch.step + note.pitch.octave;
      duration = activeDivision / note.duration * activeTime;
      subitoNote = new SubitoNote(name, duration);
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
      if (!score) {
        throw new Error('Invalid MusicJSON file');
      }

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
