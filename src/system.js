function SubitoSystem(contexts) {
  this.contexts = contexts || [];
  this.graphical = this.g = {};
  this.g.pen = {x: 0, y: 0};
}

SubitoSystem.prototype.addContext = function(context) {
  if(!(context instanceof SubitoStave) &&
      !(context instanceof SubitoElement)) {
    throw new Subito.Exception('InvalidContext', 'SubitoSystem only accepts ' +
      'SubitoStave and SubitoElements as child contexts');
  } else {
    context.setSystem(this);
    this.contexts.push(context);
  }
};

SubitoSystem.prototype.render = function(ctx) {
  var linebreak = false;
  for(var i = 0, length = this.contexts.length; i < length; i++) {
    var context = this.contexts[i];
    context.render(ctx);
  }
};

SubitoSystem.prototype.getMetrics = function(renderer) {
  var highest = this.g.pen.y || 0;
  for(var i = 0, length = this.contexts.length; i < length; i++) {
    highest = this.contexts[i].getMetrics(renderer).highest;
  }

  var metrics = {
    y: -highest,
    x: 0
  };

  return (this.cachedMetrics = metrics);
};
