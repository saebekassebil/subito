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

  canvas._exLineTo = function canvasLineTo(x, y) {
    x = Math.round(x * self.settings.scale) + 0.5;
    y = Math.round(y * self.settings.scale) + 0.5;
    this.lineTo(x, y);
  };

  canvas._exMoveTo = function canvasMoveTo(x, y) {
    x = Math.round(x * self.settings.scale) + 0.5;
    y = Math.round(y * self.settings.scale) + 0.5;
    this.moveTo(x, y);
  };

  canvas.renderGlyph = function canvasRenderGlyph(name, x, y) {
    var font = self.font;

    x = x * self.settings.scale;
    y = y * self.settings.scale;
    if(!(name instanceof SubitoGlyph) && !font.glyphs[name]) {
      return Subito.log('Unsupported Glyph: ' + name , 'warn');
    }


    var glyph = (name instanceof SubitoGlyph) ? name :
      new SubitoGlyph(font.glyphs[name]);

    glyph.scale(self.settings.scale);
    var path = glyph.path, c, cname, cp1, cp2;
    var coords = {
        'start': {
          'x': x,
          'y': y
        },

        'coords': {
          'x': 0,
          'y': 0
        },

        'controlpoint': {
          'x': null,
          'y': null
        }
    };

    this.fillStyle = self.settings.fillcolor;

    this.beginPath();
    for(var i = 0, length = path.length; i < length; i++) {
      c = path[i];
      cname = path[i][0];
      switch(cname) {
      case 'M':
        coords.coords.x = c[1];
        coords.coords.y = c[2];

        this.moveTo(coords.start.x + (coords.coords.x*font.scale.x),
                    coords.start.y + (coords.coords.y*font.scale.y));

        break;

      case 'l':
        coords.coords.x += c[1];
        coords.coords.y += c[2];

        this.lineTo(coords.start.x + (coords.coords.x*font.scale.x),
                    coords.start.y + (coords.coords.y*font.scale.y));

        break;

      case 'h':
        coords.coords.x += c[1];

        this.lineTo(coords.start.x + (coords.coords.x*font.scale.x),
                    coords.start.y + (coords.coords.y*font.scale.y));

        break;

      case 'v':
        coords.coords.y += c[1];

        this.lineTo(coords.start.x + (coords.coords.x*font.scale.x),
                    coords.start.y + (coords.coords.y*font.scale.y));

        break;

      case 'q':
        coords.controlpoint.x = coords.coords.x + c[1];
        coords.controlpoint.y = coords.coords.y + c[2];

        coords.coords.x += c[3];
        coords.coords.y += c[4];

        this.quadraticCurveTo(
            coords.start.x + (coords.controlpoint.x*font.scale.x),
            coords.start.y + (coords.controlpoint.y*font.scale.y),
            coords.start.x + (coords.coords.x*font.scale.x),
            coords.start.y + (coords.coords.y*font.scale.y));
      
        break;

      case 't':
        if(coords.controlpoint.x === null || coords.controlpoint.y === null) {
          return;
        }

        coords.controlpoint.x = coords.coords.x +
            (coords.coords.x - coords.controlpoint.x);
        coords.controlpoint.y = coords.coords.y +
            (coords.coords.y - coords.controlpoint.y);

        coords.coords.x += c[1];
        coords.coords.y += c[2];

        this.quadraticCurveTo(
            coords.start.x + (coords.controlpoint.x*font.scale.x),
            coords.start.y + (coords.controlpoint.y*font.scale.y),
            coords.start.x + (coords.coords.x*font.scale.x),
            coords.start.y + (coords.coords.y*font.scale.y));

        break;

      case 'c':
        cp1 = {
          x: coords.coords.x + c[1],
          y: coords.coords.y + c[2]
        };

        cp2 = {
          x: coords.coords.x + c[3],
          y: coords.coords.y + c[4]
        };

        coords.controlpoint.x = cp2.x;
        coords.controlpoint.y = cp2.y;
        
        coords.coords.x += c[5];
        coords.coords.y += c[6];

        this.bezierCurveTo(
            coords.start.x + cp1.x*font.scale.x,
            coords.start.y + cp1.y*font.scale.y,
            coords.start.x + cp2.x*font.scale.x,
            coords.start.y + cp2.y*font.scale.y,
            coords.start.x + coords.coords.x*font.scale.x,
            coords.start.y + coords.coords.y*font.scale.y);
        break;

      case 's':
        cp1 = {
          x: coords.controlpoint.x,
          y: coords.controlpoint.y
        };

        cp2 = {
          x: coords.coords.x + c[1],
          y: coords.coords.y + c[2]
        };

        coords.coords.x += c[3];
        coords.coords.y += c[4];
        coords.controlpoint.x = cp2.x;
        coords.controlpoint.y = cp2.y;

        this.bezierCurveTo(
            coords.start.x + cp1.x*font.scale.x,
            coords.start.y + cp1.y*font.scale.y,
            coords.start.x + cp2.x*font.scale.x,
            coords.start.y + cp2.y*font.scale.y,
            coords.start.x + coords.coords.x*font.scale.x,
            coords.start.y + coords.coords.y*font.scale.y);
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
    width: 3
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

