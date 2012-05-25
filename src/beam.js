function SubitoBeam(notes) {
  this.notes = (notes && Subito._isArray(notes)) ? notes : [];

  for(var i = 0, length = this.notes.length; i < length; i++) {
    this.notes[i].setBeam(this);
  }

  this.graphical = this.g = {};
  this.g.rendered = false;
}

SubitoBeam.prototype.render = function(renderer) {
  if(this.notes.length < 2 || !this.ready()) {
    return false;
  }

  var ctx = renderer.context;
  var first = {
    x: this.notes[0].g.x,
    y: this.notes[0].g.y
  };

  var last = {
    x: this.notes[this.notes.length-1].g.x,
    y: this.notes[this.notes.length-1].g.y
  };

  if(this.getStem() == 'up') {
    var head = this.notes[0].getHeadGlyphName();
    var headwidth = renderer.font.glyphs[head].hoz * renderer.font.scale.x;

    first.x += headwidth-1; // 1 = stemwidth
    first.y -= renderer.settings.note.stem;
    last.x += headwidth;
    last.y -= renderer.settings.note.stem;
  } else {
    first.y += renderer.settings.note.stem - 4;
    last.y += renderer.settings.note.stem - 4;
  }

  // (Naive) Awesome beaming algorithm
  ctx.save();
  ctx.moveTo(first.x, first.y);
  ctx.lineTo(last.x, last.y);
  ctx.lineTo(last.x, last.y+4);
  ctx.lineTo(first.x, first.y+4);
  ctx.fill();
  ctx.restore();

  this.g.rendered = true;
};

SubitoBeam.prototype.ready = function() {
  for(var i = 0, length = this.notes.length; i < length; i++) {
    if(!this.notes[i].g || !this.notes[i].g.x || !this.notes[i].g.y) {
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
