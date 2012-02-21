/**
 * Jakob Miland - 2011
 * 
 * Music Engraver written in JavaScript
 */

/**
 * The main subito class
 * 
 * @param canvas HTMLElement This can either be an <canvas> or and <svg> element.
 */
function Subito(canvas, settings) {
  this.scores = [], this.canvas = canvas;
  
  this.renderer = new SubitoRenderer(canvas, settings);
}

Subito.prototype.render = function() {
  this.renderer.render(this.scores[0]); // Only support 1 score for now.
};

Subito.prototype.parse = function(source, type) {
  if(!source || !type) return false;
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

Subito.Exception = function(message) {
  this.prototype = Error.prototype;
  
  this.name = 'SubitoException';
  this.message = String(message) || 'Unknown Subito Exception';
};

Subito.C4 = 24; // The (new teoria.note('c4')).getKeyNumber(true) value of C4