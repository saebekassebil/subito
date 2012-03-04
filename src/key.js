function SubitoKey(key) {
  if(!(key in SubitoKey.Keys)) {
    throw new Subito.Exception('InvalidKeySignature', 'Invalid key signature');
  }

  this.name = key;
  this.key = SubitoKey.Keys[key];
}

SubitoKey.prototype.render = function(renderer, x, y) {
  if(this.key < 0) { // Flats

  } else {
    renderer.context.renderGlyph('accidentals.sharp', x, y);
  }
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

