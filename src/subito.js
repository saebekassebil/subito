/**
 * Jakob Miland - 2012
 *  Subito - Music Engraver written in JavaScript
 */

function Subito(canvas, settings) {
  this.scores = [], this.canvas = canvas;
  
  this.renderer = new SubitoRenderer(canvas, settings);
}

Subito.prototype.render = function() {
  this.renderer.render(this.scores[0]); // Only support 1 score for now.
};

Subito.prototype.parse = function(source, type) {
  if(!source || !type) 
    return false;

  type = Subito.ParserTable[type.toLowerCase()];

  if(typeof Subito.Parser[type] === 'function') {
    var parser = new Subito.Parser[type](source), score;
    try {
      score = parser.parseScore();
      this.scores.push(score);
    } catch(e) {
      console.error(e);
      return false;
    }
    return true;
  }
  
  return false;
};

Subito.Parser = {};
Subito.ParserTable = {
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

Subito.C4 = 24; // The teoria.note('c4').key(true) value of C4

//=include score.js
//=include system.js
//=include voice.js
//=include stave.js
//=include measure.js
//=include clef.js
//=include note.js
//=include renderer.js
//=include backends/svg.js
//=include fonts/gonville.js
//=include parsers/lilypond.js
//=include parsers/musicjson.js
//=include parsers/musicxml.js
//=include parsers/subitoscript.js
