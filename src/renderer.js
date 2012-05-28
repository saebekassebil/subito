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

SubitoRenderer.prototype.extendCanvas = function(canvas) {
  var self = this;

  canvas.renderGlyph = function(name, x, y) {
    var font = self.font;

    if(!(name instanceof SubitoGlyph) && !font.glyphs[name]) {
      return Subito.log('Unsupported Glyph: ' + name , 'warn');
    }

    var glyph = (name instanceof SubitoGlyph) ? name :
      new SubitoGlyph(font.glyphs[name]);
    //glyph.scale(self.settings.scale);
    ////glyph.move(0.5, 0.5);
    var path = glyph.bits;
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
      switch(path[i]) {
      case 'M':
        coords.coords.x = parseFloat(path[++i]);
        coords.coords.y = parseFloat(path[++i]);

        this.moveTo(coords.start.x + (coords.coords.x*font.scale.x),
                    coords.start.y + (coords.coords.y*font.scale.y));

        break;

      case 'l':
        coords.coords.x += parseFloat(path[++i]);
        coords.coords.y += parseFloat(path[++i]);

        this.lineTo(coords.start.x + (coords.coords.x*font.scale.x),
                    coords.start.y + (coords.coords.y*font.scale.y));

        break;

      case 'h':
        coords.coords.x += parseFloat(path[++i]);

        this.lineTo(coords.start.x + (coords.coords.x*font.scale.x),
                    coords.start.y + (coords.coords.y*font.scale.y));

        break;

      case 'v':
        coords.coords.y += parseFloat(path[++i]);

        this.lineTo(coords.start.x + (coords.coords.x*font.scale.x),
                    coords.start.y + (coords.coords.y*font.scale.y));

        break;

      case 'q':
        coords.controlpoint.x = coords.coords.x + parseFloat(path[++i]);
        coords.controlpoint.y = coords.coords.y + parseFloat(path[++i]);

        coords.coords.x += parseFloat(path[++i]);
        coords.coords.y += parseFloat(path[++i]);

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

        coords.coords.x += parseFloat(path[++i]);
        coords.coords.y += parseFloat(path[++i]);

        this.quadraticCurveTo(
            coords.start.x + (coords.controlpoint.x*font.scale.x),
            coords.start.y + (coords.controlpoint.y*font.scale.y),
            coords.start.x + (coords.coords.x*font.scale.x),
            coords.start.y + (coords.coords.y*font.scale.y));

        break;

      case 'c':
        var cp1 = {
          x: coords.coords.x + parseFloat(path[++i]),
          y: coords.coords.y + parseFloat(path[++i])
        };

        var cp2 = {
          x: coords.coords.x + parseFloat(path[++i]),
          y: coords.coords.y + parseFloat(path[++i])
        };
        
        coords.coords.x += parseFloat(path[++i]);
        coords.coords.y += parseFloat(path[++i]);

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
        break;
      }
    }
    this.fillStyle = self.settings.fillcolor;
    this.fill();
  };
  
  canvas.getMetrics = function() {
    return {
      width: this.canvas.getAttribute('width'),
      height: this.canvas.getAttribute('height')
    };
  };
};

SubitoRenderer.prototype.renderScore = function(score) {
  if(!(score instanceof SubitoScore)) {
    throw Subito.Exception('InvalidScore', 'The parameter isn\'t valid score');
  }

  if(typeof this.context.scale === 'function') {
    this.context.scale(this.settings.scale, this.settings.scale);
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

  // Font
  font: 'Gonville',

  // Scale level
  scale: 2
};

