/**
 * Jakob Miland - 2012
 *  Subito - Music Engraver written in JavaScript
 */

function Subito(canvas) {
  this.score = null;
  this.canvas = canvas;
  
  if(canvas) {
    this.renderer = new SubitoRenderer(canvas);
  }
}

Subito.prototype.setScore = function(score) {
  if(!(score instanceof SubitoScore)) {
    throw new Subito.Exception('InvalidScore', 'The parameter isn\'t a ' +
        'valid SubitoScore instance');
  }

  this.score = score;
};

Subito.prototype.render = function() {
  if(this.score) {
    this.score.render();
    return true;
  }
  
  return false;
};

Subito.prototype.parse = function(source, type) {
  if(!source || !type) {
    return false;
  }

  type = Subito.ParserLanguages[type.toLowerCase()];

  if(typeof Subito.Parsers[type] === 'function') {
    var parser = new Subito.Parsers[type](source);
    try {
      this.score = parser.parseScore();
    } catch(e) {
      return e;
    }

    return true;
  }
  
  return false;
};

// Subito Fonts holds all font objects (Gonville pt.)
Subito.Fonts = {};

// Subito Parsers holds every parser available
Subito.Parsers = {};
Subito.ParserLanguages = {
  'musicjson':      'MusicJSON',
  'musicxml':       'MusicXML',
  'lilypond':       'LilyPond',
  'subito':         'SubitoScript',
  'subitoscript':   'SubitoScript'
};

Subito.Exception = function(code, message) {
  this.code = code || 'SubitoException';
  this.message = String(message) || 'Unknown Subito Exception';
};
Subito.Exception.prototype = Error.prototype;

Subito.C4 = 24;

// Utility functions
Subito._isArray = function(element) {
  return Object.prototype.toString.call(element) === '[object Array]';
};

//=include standalone.js

//=include score.js
//=include renderer.js
//=include backends/svg.js
//=include fonts/gonville.js
//=include parsers/lilypond.js
//=include parsers/musicjson.js
//=include parsers/musicxml.js
//=include parsers/subitoscript.js
