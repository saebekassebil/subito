function SubitoRenderer(canvas, settings) {
  var canvasTagName = (canvas && canvas.tagName) ? canvas.tagName.toLowerCase() : null;
  
  if(canvasTagName === 'canvas') {
    this.context = canvas.getContext('2d');
  } else if(canvasTagName === 'svg') {
    this.context = new SubitoSVGContext(canvas, this);
  } else {
    throw new Subito.Exception("Invalid canvas. Must be either <canvas> or <svg> element");
  }
}

SubitoRenderer.prototype.render = function(score) {
  score.render(this);
};

SubitoRenderer.prototype.extendCanvas = function(canvas) {
  canvas.renderGlyph = function(name, x, y) {
    var font = SubitoRender.Fonts[SubitoRender.ActiveFont];

    if(!font.glyphs[name]) {
      return Subito.log('Unsupported Glyph: ' + name , 'warn');
    }

    var path = font.glyphs[name].path.split(" ");
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


    if(Subito.Settings['debug']) {
      this.fillStyle = "#FF0000";
      this.beginPath();
      this.arc(x, y, 2, 0, Math.PI*2, true);
      this.closePath();
      this.fill();
    }

    this.fillStyle = "#000000";

    this.beginPath();
    for(var i = 0, length = path.length; i < length; i++) {
      switch(path[i]) {
      case 'M': {     
        coords.coords.x = parseFloat(path[++i]);
        coords.coords.y = parseFloat(path[++i]);

        this.moveTo(coords.start.x + (coords.coords.x/font.resolution), coords.start.y + (coords.coords.y/font.resolution));
      } break;

      case 'l': {
        coords.coords.x += parseFloat(path[++i]);
        coords.coords.y += parseFloat(path[++i]);

        this.lineTo(coords.start.x + (coords.coords.x/font.resolution), coords.start.y + (coords.coords.y/font.resolution));
      } break;

      case 'h': {
        coords.coords.x += parseFloat(path[++i]);

        this.lineTo(coords.start.x + (coords.coords.x/font.resolution), coords.start.y + (coords.coords.y/font.resolution));
      } break;

      case 'v': {
        coords.coords.y += parseFloat(path[++i]);

        this.lineTo(coords.start.x + (coords.coords.x/font.resolution), coords.start.y + (coords.coords.y/font.resolution));
      } break;

      case 'q': {

        coords.controlpoint.x = coords.coords.x + parseFloat(path[++i]);
        coords.controlpoint.y = coords.coords.y + parseFloat(path[++i]);

        coords.coords.x += parseFloat(path[++i]);
        coords.coords.y += parseFloat(path[++i]);

        this.quadraticCurveTo(coords.start.x + (coords.controlpoint.x/font.resolution), coords.start.y + (coords.controlpoint.y/font.resolution), coords.start.x + (coords.coords.x/font.resolution), coords.start.y + (coords.coords.y/font.resolution));
      } break;

      case 't': {
        if(coords.controlpoint.x === null || coords.controlpoint.y === null) return;

        coords.controlpoint.x = coords.coords.x + (coords.coords.x - coords.controlpoint.x);
        coords.controlpoint.y = coords.coords.y + (coords.coords.y - coords.controlpoint.y);

        coords.coords.x += parseFloat(path[++i]);
        coords.coords.y += parseFloat(path[++i]);

        this.quadraticCurveTo(coords.start.x + (coords.controlpoint.x/font.resolution), coords.start.y + (coords.controlpoint.y/font.resolution), coords.start.x + (coords.coords.x/font.resolution), coords.start.y + (coords.coords.y/font.resolution));
      } break;

      case 'z': {
        this.closePath();
      } break;
      }
    }
    this.strokeStyle = "#000000";
    this.stroke();
  };
  
  canvas.getWidth = function() {
    return parseFloat(this.getAttribute('width'));
  };
};

SubitoRenderer.prototype.settings = {
  renderTitle: false,
  font: 'Gonville',
  margin: 20.5,
  zoom: 1.0,
  measure: {
    
  },
  
  stave: {
    linespace: 7
  }
};
