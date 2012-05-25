function SubitoKey(key) {
  if(!(key in SubitoKey.Keys)) {
    throw new Subito.Exception('InvalidKeySignature', 'Invalid key signature');
  }

  this.name = key;
  this.key = SubitoKey.Keys[key];
  this.parent = null;
}

SubitoKey.prototype.render = function(renderer, x, y) {
  var head, abs = Math.abs(this.key), posy, hoz, accidentals, clef;
  if(this.key < 0) { // Flats
    head = 'accidentals.flat';
    accidentals = SubitoKey.Fifths.flat;
  } else {
    head = 'accidentals.sharp';
    accidentals = SubitoKey.Fifths.sharp;
  }

  clef = this.parent.getClef();

  hoz = renderer.font.glyphs[head].hoz * renderer.font.scale.x;

  for(var i = 0; i < abs; i++) {
    posy = accidentals[i]*(renderer.settings.measure.linespan/2);
    if(clef.name == 'f') {
      posy += renderer.settings.measure.linespan;
    }

    renderer.context.renderGlyph(head, x, y + posy);
    x += hoz;
  }
};

SubitoKey.prototype.getMetrics = function(renderer) {
  if(this.cachedMetrics) {
    return this.cachedMetrics;
  }

  var metric = {
    width: renderer.font.glyphs['accidentals.sharp'].hoz *
      renderer.font.scale.x * Math.abs(this.key)
  };

  return (this.cachedMetric = metric);
};

SubitoKey.prototype.setParent = function(parent) {
  if(!(parent instanceof SubitoMeasure) && !(parent instanceof SubitoStave)) {
    throw new Subito.Exception('InvalidParent', 'Can\'t assign SubitoKey ' +
        'to this element');
  }

  this.parent = parent;
};

SubitoKey.Keys = {
  cmajor: 0,
  aminor: 0,
  gmajor: 1,
  eminor: 1,
  dmajor: 2,
  bminor: 2,
  amajor: 3,
  fisminor: 3,
  emajor: 4,
  cisminor: 4,
  bmajor: 5,
  gisminor: 5,
  fismajor: 6,
  disminor: 6,
  cismajor: 7,
  aisminor: 7,
  fmajor: -1,
  dminor: -1,
  besmajor: -2,
  gminor: -2,
  esmajor: -3,
  cminor: -3,
  asmajor: -4,
  fminor: -4,
  desmajor: -5,
  besminor: -5,
  gesmajor: -6,
  esminor: -6,
  cesmajor: -7,
  asminor: -7
};

SubitoKey.Fifths = {
  sharp: [0, 3, -1, 2, 5, 1, 4],
  flat: [4, 1, 5, 2, 6, 3, 7]
};

