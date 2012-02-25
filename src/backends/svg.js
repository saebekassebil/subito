var SubitoSVGContext = (function() {
  var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
  
  function constructor(svg, renderer) {
    this.context = svg;
    this.renderer = renderer;
    this.pen = {x: 0, y: 0};
    this.path = '';
    
    this.position = {x: 0, y: 0};
    
    this.state = {
      scale: {x: 1, y: 1}
    };
    
    this.attributes = {
      stroke: 'black',
      transform: 'translate('+ this.renderer.settings.margin +
                  ', '+ this.renderer.settings.margin +')'
    };
    
    this.font = {
      family: 'Arial',
      size: 16
    };
    
    this.stateStack = [];
  }
  
  function create(elementName) {
    return document.createElementNS(SVG_NAMESPACE, elementName);
  }

  constructor.prototype = {
    /* Path API */
    moveTo: function(x, y) {
      this.path += 'M' + x + ',' + y;
      
      this.pen.x = x;
      this.pen.y = y;
      
      return this;
    },
      
    lineTo: function(x, y) {
      this.path += 'L' + x + ',' + y;
      
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
      var path = create('path');
      path.setAttribute('d', this.path);
      for(var i in this.attributes) {
        path.setAttribute(i, this.attributes[i]);
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
        font: Object.create(this.font),
        attributes: Object.create(this.attributes)
      });
    },
    
    restore: function() {
      var stack = this.stateStack.pop();
      this.font = stack.font;
      this.attributes = stack.attributes;
      this.state = stack.state;
    },
    
    /* Glyph API */
    renderGlyph: function(glyphName, x, y, absolute) {
      var font = Subito.Fonts[this.renderer.settings.font];
      if(!font) {
        throw new Subito.Exception("Invalid Font");
      }
      
      var glyph = font.glyphs[glyphName];
      if(!glyph) {
        throw new Subito.Exception("Couldn't found glyph: " + glyphName);
      }
      
      if(!absolute) {
        x += this.position.x;
      }

      this.position.x += glyph.hoz*font.scale.x || 0;
      var path = create('path');
      path.setAttribute('d', glyph.path);
      path.setAttribute('transform',
          'translate(' + this.renderer.settings.margin +
          ', ' + this.renderer.settings.margin +
          ') translate(' + x + ', ' + y + ') scale(' +
          font.scale.x + ', ' + font.scale.y + ')');
      this.context.appendChild(path);
    },
    
    /* Subito Context Extensions */
    getSize: function() {
      return {
        width: parseFloat(this.context.getAttribute('width')),
        height: parseFloat(this.context.getAttribute('height'))
      };
    }
  };
  
  return constructor;
})();
