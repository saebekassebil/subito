var SubitoSVGContext = (function() {
  var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
  
  function constructor(svg, renderer) {
    this.context = svg;
    this.renderer = renderer;
    this.pen = {x: 0, y: 0};
    this.path = '';

    this.lineWidth = 1;
    this.globalAlpha = 1.0;
    this.strokeStyle = '#000000';
    this.fillColor = '#000000';
    
    this.state = {
      scale: {x: 1, y: 1}
    };
    
    this.stateStack = [];
  }
  
  function create(elementName) {
    return document.createElementNS(SVG_NAMESPACE, elementName);
  }

  constructor.prototype = {
    /* Path API */
    moveTo: function(x, y) {
      this.path += 'M' + x + ' ' + y;
      
      this.pen.x = x;
      this.pen.y = y;
      
      return this;
    },
      
    lineTo: function(x, y) {
      this.path += 'L' + x + ' ' + y;
      
      this.pen.x = x;
      this.pen.y = y;
      
      return this;
    },
    
    beginPath: function() {
      this.path = '';
      
      this.pen.x = 0;
      this.pen.y = 0;
      
      return this;
    },
    
    closePath: function() {
      this.path += 'Z';
      
      this.pen.x = 0;
      this.pen.y = 0;
      
      return this;
    },
    
    stroke: function() {
      var scale = this.renderer.settings.scale;
      var glyph = new SubitoGlyph({path: this.path});
      var path = create('path');

      glyph.scale(this.renderer.settings.scale);
      glyph.move(0.5, 0.5);
      path.setAttribute('d', glyph.path);
      path.setAttribute('stroke', this.strokeStyle ||
          this.renderer.settings.strokecolor);
      path.setAttribute('stroke-width', this.lineWidth);
      if (this.globalAlpha !== 1.0) {
        path.setAttribute('opacity', this.globalAlpha);
      }
      
      this.context.appendChild(path);

      return this;
    },

    fill: function() {
      var scale = this.renderer.settings.scale;
      var glyph = new SubitoGlyph({path: this.path});
      var path = create('path');

      glyph.scale(this.renderer.settings.scale);
      glyph.move(0.5, 0.5);
      path.setAttribute('d', glyph.path);
      path.setAttribute('fill', this.fillStyle ||
          this.renderer.settings.fillcolor);
      if (this.globalAlpha !== 1.0) {
        path.setAttribute('opacity', this.globalAlpha);
      }
      
      this.context.appendChild(path);

      return this;
    },
    
    /* Text API */
    fillText: function(string, x, y) {
      var text = create('text');
      text.setAttribute('x', x);
      text.setAttribute('y', y);
      text.textContent = string;
      
      this.context.appendChild(text);
      return this;
    },
    
    save: function() {
      this.stateStack.push({
        state: Object.create(this.state),
        font: Object.create(this.renderer.font),
        attributes: Object.create(this.attributes || {}),
        lineWidth: this.lineWidth,
        globalAlpha: this.globalAlpha,
        strokeStyle: this.strokeStyle,
        fillStyle: this.fillStyle
      });
    },
    
    restore: function() {
      var stack = this.stateStack.pop();
      this.font = stack.font;
      this.attributes = stack.attributes;
      this.state = stack.state;
      this.lineWidth = stack.lineWidth;
      this.globalAlpha = stack.globalAlpha;
      this.strokeStyle = stack.strokeStyle;
      this.fillStyle = stack.fillStyle;
    },
    
    /* Glyph API */
    renderGlyph: function(glyphName, x, y) {
      var font = this.renderer.font;
      if(!font) {
        throw new Subito.Exception("Invalid Font");
      }
      
      var glyph = font.glyphs[glyphName];
      if(!glyph) {
        throw new Subito.Exception("InvalidGlyph",
            "Couldn't found glyph: " + glyphName);
      }

      var scale = this.renderer.settings.scale;
      glyph = new SubitoGlyph(glyph);
      glyph.scale(font.scale.x, font.scale.y); // scale to font scale
      glyph.move(x, y); // move in place
      glyph.scale(scale); // scale to rendering scale

      var path = create('path');
      path.setAttribute('d', glyph.path);
      this.context.appendChild(path);
    },
    
    /* Subito Context Extensions */
    getMetrics: function() {
      return {
        width: parseFloat(this.context.width.baseVal.value),
        height: parseFloat(this.context.height.baseVal.value)
      };
    },

    drawDot: function(x, y, r) {
      var circle = create('circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', r);
      circle.setAttribute('fill', 'red');
      circle.setAttribute('transform',
          'scale('+this.renderer.settings.scale+')');
      this.context.appendChild(circle);
    }
  };
  
  return constructor;
})();
