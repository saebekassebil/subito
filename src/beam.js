function SubitoBeam(notes) {
  this.notes = (notes && Subito._isArray(notes)) ? notes : [];

  for(var i = 0, length = this.notes.length; i < length; i++) {
    this.notes[i].setBeam(this);
  }

  this.graphical = this.g = {};
  this.g.rendered = false;
}

SubitoBeam.prototype.render = function(renderer) {
  if (this.notes.length < 2 || !this.ready()) {
    return false;
  }

  var ctx = renderer.context;
  var notes = this.notes, notea, noteb, slope, maxslope = 0, peak;
  var head = notes[0].getHeadGlyphName();
  var headwidth = renderer.font.glyphs[head].hoz * renderer.font.scale.x;

  for(var i = 0, length = notes.length-1; i < length; i++) {
    notea = notes[i];
    noteb = notes[i+1];

    slope = (noteb.g.y - notea.g.y) / (noteb.g.x - notea.g.x);
    if(Math.abs(slope) > Math.abs(maxslope)) {
      maxslope = slope;
      peak = i+1;
    } else if ((maxslope > 0 && slope < 0) || (maxslope < 0 && slope > 0)) {
      maxslope = 0;
      peak = i;
      break;
    }
  }

  if (Math.abs(maxslope) > renderer.settings.beam.slope) {
    maxslope = Math.abs(maxslope)/maxslope * renderer.settings.beam.slope;
  }

  for(i = 0, length = length + 1; i < length; i++) {
    notea = notes[i];
    var newy = notes[peak].g.y - (notes[peak].g.x-notea.g.x) * maxslope;
    notea.g.stemlength = renderer.settings.note.stem + Math.abs((newy - notea.g.y));

    // "Artificially" add the extended stemlength - Yikes
    ctx.beginPath();
    if(this.getStem() == 'down') {
      ctx.moveTo(notea.g.x, notea.g.y+notea.g.stemlength);
      ctx.lineTo(notea.g.x, notea.g.y+renderer.settings.note.stem);
    } else {
      ctx.moveTo(notea.g.x + headwidth - renderer.settings.note.stemwidth/2,
          notea.g.y - renderer.settings.note.stem);
      ctx.lineTo(notea.g.x + headwidth - renderer.settings.note.stemwidth/2,
          notea.g.y - renderer.settings.note.stem + (newy - notea.g.y));
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Render beam
  var first = notes[0].g, last = notes[length-1].g,
      beamwidth = renderer.settings.beam.width,
      stemwidth = renderer.settings.note.stemwidth;
  if(this.getStem() == 'up') {
    ctx.beginPath();
    ctx.moveTo(first.x + headwidth - stemwidth,
        first.y - (beamwidth - 2) - first.stemlength);
    ctx.lineTo(first.x + headwidth - stemwidth,
        first.y + 2 - first.stemlength);
    ctx.lineTo(last.x + headwidth, last.y + 2 - last.stemlength);
    ctx.lineTo(last.x + headwidth, last.y - (beamwidth - 2) - last.stemlength);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(first.x - stemwidth/2,
        first.y + first.stemlength - (beamwidth - 1));
    ctx.lineTo(first.x - stemwidth/2,
        first.y + first.stemlength + 1);
    ctx.lineTo(last.x + stemwidth/2,
        last.y + last.stemlength + 1);
    ctx.lineTo(last.x + stemwidth/2,
        last.y + last.stemlength - (beamwidth - 1));
    ctx.closePath();
    ctx.fill();
  }


  this.g.rendered = true;
};

SubitoBeam.prototype.ready = function() {
  for(var i = 0, length = this.notes.length; i < length; i++) {
    if(!this.notes[i].g.x || !this.notes[i].g.y) {
      return false;
    }
  }

  return true;
};

SubitoBeam.prototype.addNote = function(note) {
  if(!(note instanceof SubitoNote)) {
    throw new Subito.Exception('InvalidNote', 'Invalid note as parameter');
  }

  note.setBeam(this);
  this.notes.push(note);
};

SubitoBeam.prototype.getStem = function() {
  var up = 0, down = 0, avgPos = 0, dir, pos, note;

  for(var i = 0, length = this.notes.length; i < length; i++) {
    note = this.notes[i];
    if(note.voice && (dir = note.voice.getStem())) {
      return dir;
    }

    pos = note.getStem(null, true);
    avgPos += note.getMetrics().position;
    if(pos == 'up') {
      up++;
    } else {
      down++;
    }
  }

  if(up == down) {
    avgPos = avgPos/this.notes.length;
    dir = (avgPos > 2) ? 'up' : 'down';
  } else {
    dir = (up > down) ? 'up' : 'down';
  }

  return dir;
};
