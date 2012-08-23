function SubitoSystem(contexts) {
  this.contexts = contexts || [];
  this.graphical = this.g = {};
  this.g.pen = {x: 0, y: 0};
}

SubitoSystem.prototype = {
  addContext: function systemAddContext(context) {
    if(!(context instanceof SubitoStave) &&
        !(context instanceof SubitoElement)) {
      throw new Subito.Exception('InvalidContext', 'SubitoSystem only ' +
        'accepts SubitoStave and SubitoElements as child contexts');
    } else {
      context.setSystem(this);
      this.contexts.push(context);
    }
  },

  render: function systemRender(renderer) {
    if(!this.g.formatted) {
      throw new Subito.Exception('UnformattedSystem',
                                 'This system isn\'t formatted');
    }

    this.g.pen.x = this.score.g.pen.x;
    this.g.pen.y = this.score.g.pen.y;
    for(var i = 0, length = this.contexts.length; i < length; i++) {
      this.contexts[i].render(renderer);
    }
  },

  getMetrics: function systemGetMetrics(renderer) {
    var highest = this.g.pen.y || 0;
    for(var i = 0, length = this.contexts.length; i < length; i++) {
      highest = this.contexts[i].getMetrics(renderer).highest;
    }

    var metrics = {
      y: -highest,
      x: 0
    };

    return (this.cachedMetrics = metrics);
  },

  format: function systemFormat(renderer) {
    var context, i, length, lines = [], graphicLines = [];
    for(i = 0, length = this.contexts.length; i < length; i++) {
      context = this.contexts[i];
      if(context instanceof SubitoStave) {
        lines[i] = context.format(renderer);
      }
    }
    
    for(i = 0, length = lines.length; i < length; i++) {
      graphicLines.push(new SubitoGraphicSystemLine(lines[i]));
    }

    this.g.formatted = true;
    this.gLines = graphicLines;
    return graphicLines;
  },

  setScore: function systemSetScore(score) {
    if(!(score instanceof SubitoScore)) {
      throw new Subito.Exception('InvalidContext', 'Invalid score');
    }

    this.score = score;
  }
};

