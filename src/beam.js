function SubitoBeam(notes) {
  this.notes = (notes && Subito._isArray(notes)) ? notes : [];

  for(var i = 0, length = this.notes.length; i < length; i++) {
    this.notes[i].setBeam(this);
  }

  this.graphical = this.g = {};
  this.g.rendered = false;
  this.slope = null;
  this.nextBeam = null;
  this.previousBeam = null;
}

SubitoBeam.prototype = {
  render: function beamRender(renderer) {
    if (this.notes.length < 2 || !this.ready()) {
      return false;
    }
    var ctx = renderer.context, notes = this.notes, notea, noteb, slope,
        maxslope = 0, peak, newy, settings = renderer.settings,
        beamwidth = renderer.settings.beam.width,
        stemwidth = renderer.settings.note.stemwidth,
        beamNumber = renderer.flags.beamNumber,
        head = notes[0].getHeadGlyphName(),
        headwidth = renderer.font.glyphs[head].hoz * renderer.font.scale.x,
        i = 0, length = notes.length - 1, stem = this.getStem();

    if (typeof beamNumber === 'undefined') {
      renderer.flags.beamNumber = beamNumber = 0;
    }

    if (beamNumber > 0) { // This is not the first beam
      maxslope = notes[0].beams[0].slope;
      peak = 0;
    } else { // This is the first beam
      for(; i < length; i++) {
        notea = notes[i];
        noteb = notes[i+1];

        slope = (noteb.g.y - notea.g.y) / (noteb.g.x - notea.g.x);
        if(Math.abs(slope) > Math.abs(maxslope)) {
          maxslope = slope;
          peak = (stem === 'up') ? i+1 : i;
        } else if ((maxslope > 0 && slope < 0) || (maxslope < 0 && slope > 0)) {
          maxslope = 0;
          peak = i;
          break;
        }
      }

      // If the slope is too steep, we'll adjust to use the default slope
      if (Math.abs(maxslope) > settings.beam.slope) {
        // sign(maxslope) * defslope
        maxslope = Math.abs(maxslope)/maxslope * settings.beam.slope;
      }

      for(i = 0, length = length + 1; i < length; i++) {
        notea = notes[i];
        newy = notes[peak].g.y - (notes[peak].g.x-notea.g.x) * maxslope;
        notea.g.stemlength = settings.note.stem +
                              Math.abs((newy - notea.g.y));

        // "Artificially" add the extended stemlength - Yikes
        ctx.beginPath();
        if(stem === 'down') {
          ctx._exMoveTo(notea.g.x, notea.g.y+notea.g.stemlength);
          ctx._exLineTo(notea.g.x, notea.g.y+settings.note.stem);
        } else {
          ctx._exMoveTo(notea.g.x + headwidth - settings.note.stemwidth/2,
              notea.g.y - settings.note.stem);
          ctx._exLineTo(notea.g.x + headwidth - settings.note.stemwidth/2,
              notea.g.y - settings.note.stem + (newy - notea.g.y));
        }
        ctx.closePath();
        ctx.stroke();
      }
    }


    // Render beam
    var fnote = notes[0].g, lnote = notes[notes.length-1].g;
    var yshift = beamNumber * (beamwidth * 1.5);
    var first, last;
    if (beamNumber > 0) {
      if (stem === 'up') {
        first = {
          top: {
            x: fnote.x + headwidth - stemwidth,
            y: fnote.y - fnote.stemlength - (beamwidth / 2) - 0.5 + yshift
          },

          bottom: {
            x: fnote.x + headwidth - stemwidth,
            y: fnote.y - fnote.stemlength + beamwidth / 2 - 0.5+ yshift
          }
        };

        last = {
          top: {
            x: lnote.x + headwidth,
            y: first.top.y + (lnote.x - fnote.x + stemwidth * 2) * maxslope
          },

          bottom: {
            x: lnote.x + headwidth,
            y: first.bottom.y + (lnote.x - fnote.x + stemwidth * 2) * maxslope
          }
        };
      } else {
        first = {
          top: {
            x: fnote.x - stemwidth / 2,
            y: fnote.y + fnote.stemlength - (beamwidth / 2) - yshift
          },

          bottom: {
            x: fnote.x - stemwidth / 2,
            y: fnote.y + fnote.stemlength + beamwidth / 2 - yshift
          }
        };

        last = {
          top: {
            x: lnote.x + stemwidth / 2,
            y: first.top.y + (lnote.x - fnote.x + stemwidth * 2) * maxslope
          },

          bottom: {
            x: lnote.x + stemwidth / 2,
            y: first.bottom.y + (lnote.x - fnote.x + stemwidth * 2) * maxslope
          }
        };
      }
    } else if (stem === 'up') {
      first = {
        top: {
          x: fnote.x + headwidth - stemwidth,
          y: fnote.y - (beamwidth / 2) - fnote.stemlength
        },

        bottom: {
          x: fnote.x + headwidth - stemwidth,
          y: fnote.y + beamwidth / 2 - fnote.stemlength
        }
      };

      last = {
        top: {
          x: lnote.x + headwidth,
          y: lnote.y - (beamwidth - 2) - lnote.stemlength
        },

        bottom: {
          x: lnote.x + headwidth,
          y: lnote.y + 2 - lnote.stemlength
        }
      };
    } else {
      first = {
        top: {
          x: fnote.x - stemwidth/2,
          y: fnote.y + fnote.stemlength - (beamwidth - 1)
        },

        bottom: {
          x: fnote.x - stemwidth/2,
          y: fnote.y + fnote.stemlength + 1
        }
      };

      last = {
        top: {
          x: lnote.x + stemwidth / 2,
          y: lnote.y + lnote.stemlength - (beamwidth - 1)
        },

        bottom: {
          x: lnote.x + stemwidth / 2,
          y: lnote.y + lnote.stemlength + 1
        }
      };
    }

    ctx.beginPath();
    ctx._exMoveTo(first.top.x, first.top.y);
    ctx._exLineTo(first.bottom.x, first.bottom.y);
    ctx._exLineTo(last.bottom.x, last.bottom.y);
    ctx._exLineTo(last.top.x, last.top.y);
    ctx.closePath();
    ctx.fill();

    this.slope = maxslope;
    this.g.rendered = true;
    if (this.nextBeam instanceof SubitoBeam) {
      renderer.flags.beamNumber++;
      this.nextBeam.render(renderer);
    }
  },

  ready: function beamReady() {
    for(var i = 0, length = this.notes.length; i < length; i++) {
      if(!this.notes[i].g.x || !this.notes[i].g.y) {
        return false;
      }
    }

    return true;
  },

  addNote: function beamAddNote(note) {
    if(!(note instanceof SubitoNote)) {
      throw new Subito.Exception('InvalidNote', 'Invalid note as parameter');
    }

    note.setBeam(this);
    this.notes.push(note);
  },

  getStem: function beamGetStem() {
    var up = 0, down = 0, avgPos = 0, dir, pos, note;
    if (this.previousBeam instanceof SubitoBeam) {
      return this.previousBeam.getStem();
    }

    for(var i = 0, length = this.notes.length; i < length; i++) {
      note = this.notes[i];
      if(note.voice && (dir = note.voice.getStem())) {
        return dir;
      }

      pos = note.getStem(null, true);
      avgPos += note.getMetrics().position;
      if(pos === 'up') {
        up++;
      } else {
        down++;
      }
    }

    if(up === down) {
      avgPos = avgPos/this.notes.length;
      dir = (avgPos > 2) ? 'up' : 'down';
    } else {
      dir = (up > down) ? 'up' : 'down';
    }

    return dir;
  },

  setNextBeam: function beamSetNextBeam(beam) {
    if (!(beam instanceof SubitoBeam)) {
      throw new Subito.Exception('InvalidBeam', 'Invalid beam as parameter');
    }

    this.nextBeam = beam;
  },

  setPreviousBeam: function beamSetPreviousBeam(beam) {
    if (!(beam instanceof SubitoBeam)) {
      throw new Subito.Exception('InvalidBeam', 'Invalid beam as parameter');
    }

    this.previousBeam = beam;
  }
};

