function SubitoRenderer(canvas, settings) {
  var canvasTagName = (canvas && canvas.tagName) ?
    canvas.tagName.toLowerCase() : null;
  
  this.settings = {};
  for(var i in SubitoRenderer.DefaultSettings) {
    if(SubitoRenderer.DefaultSettings.hasOwnProperty(i)) {
      this.settings[i] = (settings && (i in settings)) ? settings[i] :
          SubitoRenderer.DefaultSettings[i];
    }
  }

  this.canvas = canvas;
  this.flags = {};
  this.pen = {x: 0, y: 0};
  this.path = '';
  this.font = Subito.Fonts[this.settings.font];

  if(canvasTagName === 'canvas') {
    this.context = canvas.getContext('2d');
    this.extendCanvas(this.context);
  } else if(canvasTagName === 'svg') {
    this.context = new SubitoSVGContext(canvas, this);
  } else {
    var msg = "Invalid canvas. Must be either <canvas> or <svg> element";
    throw new Subito.Exception(msg);
  }
}

SubitoRenderer.prototype.extendCanvas = function rendererExtendCanvas(canvas) {
  var self = this;
  var scale = this.settings.scale;
  var round = Math.round;
  var font = this.font;

  canvas._exLineTo = function canvasLineTo(x, y) {
    x = round(x * scale) + 0.5;
    y = round(y * scale) + 0.5;
    this.lineTo(x, y);
  };

  canvas._exMoveTo = function canvasMoveTo(x, y) {
    x = round(x * scale) + 0.5;
    y = round(y * scale) + 0.5;
    this.moveTo(x, y);
  };

  canvas.renderGlyph = function canvasRenderGlyph(name, x, y) {
    if(!(name instanceof SubitoGlyph) && !font.glyphs[name]) {
      return Subito.log('Unsupported Glyph: ' + name , 'warn');
    }

    x = x * scale;
    y = y * scale;

    var glyph = (name instanceof SubitoGlyph) ? name :
      new SubitoGlyph(font.glyphs[name]);

    var path = glyph.path, c, cname, startx = x, starty = y, px = 0, py = 0,
        controlpx, controlpy;

    glyph.scale(scale * font.scale.x, scale * font.scale.y);

    this.beginPath();
    for(var i = 0, length = path.length; i < length; i++) {
      c = path[i];
      cname = c[0];
      switch(cname) {
      case 'M':
        px = c[1];
        py = c[2];

        this.moveTo(startx + px, starty + py);
        break;

      case 'l':
        px += c[1];
        py += c[2];

        this.lineTo(startx + px, starty + py);
        break;

      case 'h':
        px += c[1];

        this.lineTo(startx + px, starty + py);
        break;

      case 'v':
        py += c[1];

        this.lineTo(startx + px, starty + py);
        break;

      case 'q':
        controlpx = px + c[1];
        controlpy = py + c[2];

        px += c[3];
        py += c[4];

        this.quadraticCurveTo(
            startx + controlpx,
            starty + controlpy,
            startx + px,
            starty + py);
        break;

      case 't':
        controlpx = px + (px - controlpx);
        controlpy = py + (py - controlpy);

        px += c[1];
        py += c[2];

        this.quadraticCurveTo(
            startx + controlpx,
            starty + controlpy,
            startx + px,
            starty + py);
        break;

      case 'c':
        controlpx = px + c[3];
        controlpy = py + c[4];
        

        this.bezierCurveTo(
            startx + px + c[1],
            starty + py + c[2],
            startx + controlpx,
            starty + controlpy,
            startx + px + c[5],
            starty + py + c[6]);

          px += c[5];
          py += c[6];
        break;

      case 's':
        this.bezierCurveTo(
            startx + controlpx,
            starty + controlpy,
            startx + px + c[1],
            starty + py + c[2],
            startx + px + c[3],
            starty + py + c[4]);

        px += c[3];
        py += c[4];

        controlpx = px + c[1];
        controlpy = py + c[2];
        break;

      case 'z':
        this.closePath();
        break;

      default:
        if(cname.match(/[a-z]/i)) {
          Subito.log('Unsupported path command: ' + cname, name, 'warn');
        }

        break;
      }
    }

    this.fillStyle = self.settings.fillcolor;
    this.fill();
  };
  
  canvas.getMetrics = function canvasGetMetrics() {
    return {
      width: this.canvas.getAttribute('width'),
      height: this.canvas.getAttribute('height')
    };
  };
};

SubitoRenderer.prototype.renderScore = function rendererRenderScore(score) {
  if(!(score instanceof SubitoScore)) {
    throw Subito.Exception('InvalidScore', 'The parameter isn\'t valid score');
  }

  score.render(this);
};

SubitoRenderer.DefaultSettings = {
  strokecolor: '#000000',
  fillcolor: '#000000',

  // Measure defaults
  measure: {
    width: 200,
    linespan: 7,
    linewidth: 1
  },

  note: {
    stem: 24,
    stemwidth: 1
  },

  beam: {
    slope: 0.22,
    width: 3.5
  },

  score: {
    margintop: 5,
    marginleft: 5
  },

  // Font
  font: 'Gonville',

  // Scale level
  scale: 2
};

