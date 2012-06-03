function SubitoScore(metadata) {
  this.meta = (typeof metadata === 'object') ? metadata : {};
  this.contexts = [];
  this.graphical = this.g = {pen: {x: 0, y: 0}};
}

SubitoScore.prototype = {
  metadata: function scoreMetadata(name, value) {
    if(!name && !value) {
      return this.meta;
    } else if(name && !value) {
      return this.meta[name] || null;
    } else if(name && value) {
      return this.meta[name] = value;
    }
  },

  addContext: function scoreAddContext(context) {
    if(!(context instanceof SubitoSystem) &&
        !(context instanceof SubitoElement)) {
      throw new Subito.Exception('InvalidContext', 'Only SubitoSystem and ' +
            'SubitoElements can be added to the SubitoScore context');
    } else {
      context.setScore(this);
      this.contexts.push(context);
    }
  },

  render: function scoreRender(renderer) {
    this.g.pen.x = renderer.settings.score.marginleft;
    this.g.pen.y = renderer.settings.score.margintop;
    var context;

    for(var i = 0, length = this.contexts.length; i < length; i++) {
      context = this.contexts[i];
      if(context instanceof SubitoSystem) {
        context.format(renderer);
        this.g.pen.y += this.contexts[i].getMetrics(renderer).y;
      }

      this.contexts[i].render(renderer);
    }
  }
};

