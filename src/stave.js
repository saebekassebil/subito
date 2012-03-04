function SubitoStave(contexts) {
  this.contexts = contexts || [];
  this.graphical = this.g = {}; // For saving graphical relevant information
  this.g.pen = {x: 0, y: 0};

  this.key = null;
}

SubitoStave.prototype.addContext = function(context) {
  if(!(context instanceof SubitoMeasure) &&
      !(context instanceof SubitoClef) &&
      !(context instanceof SubitoElement)) {
    throw new Subito.Exception('InvalidContext', 'SubitoStave only accepts ' +
      'SubitoMeasure, SubitoClef and SubitoElements as child contexts');
  } else {
    if(context instanceof SubitoMeasure) {
      context.setStave(this);
    }

    this.contexts.push(context);
  }
};

SubitoStave.prototype.render = function(renderer) {
  var ctx = renderer.context;
  var canvasmetrics = ctx.getMetrics();
  var stavemetrics = this.getMetrics();
  var stavewidth = 0, context, metric;

  this.g.pen.y = this.system.getMetrics().y;

  for(var i = 0, length = this.contexts.length; i < length; i++) {
    context = this.contexts[i];
    if(context instanceof SubitoMeasure) {
      if(i === 0) {
        renderer.flags.renderClef = true;
        renderer.flags.renderKey = true;
      } else if(i === 1) {
        renderer.flags.renderClef = false;
        renderer.flags.renderKey = false;
      }

      metric = context.getMetrics();
      if((stavewidth + metric.width) < canvasmetrics.width) {
        context.render(renderer);
      }

      this.g.pen.x += metric.width;
    }
  }
};

SubitoStave.prototype.setClef = function(clef) {
  if(clef instanceof SubitoClef) {
    this.clef = clef;
  } else {
    throw new Subito.Exception('InvalidClef', 'Invalid parameter');
  }
};

SubitoStave.prototype.getKey = function() {
  if(!(this.key instanceof SubitoKey)) {
    throw new Subito.Exception('StaveGotNoKey', 'No key has been assigned');
  }

  return this.key;
};

SubitoStave.prototype.setKey = function(key) {
  this.key = key;
};

SubitoStave.prototype.getClef = function() {
  if(!(this.clef instanceof SubitoClef)) {
    throw new Subito.Exception('StaveGotNoClef', 'No clef has been assigned ' +
        'to this stave');
  }

  return this.clef;
};

SubitoStave.prototype.getMetrics = function() {
  if(this.cachedMetrics) {
    return this.cachedMetrics;
  } else {
    var width = (this.graphical) ? this.graphical.width : null;
    var height = (this.graphical) ? this.graphical.height : null;
    var context, contextMetric, metrics;

    if(!width || !height) {
      width = 0;
      height = 0;
      for(var i = 0, length = this.contexts.length; i < length; i++) {
        context = this.contexts[i];
        if(context instanceof SubitoMeasure) {
          contextMetric = context.getMetrics();
          width += contextMetric.width;
          height = Math.min(contextMetric.highest, height);
        }
      }
    }

    metrics = {
      highest: height,
      width: width
    };

    return (this.cachedMetrics = metrics);
  }
};

SubitoStave.prototype.setSystem = function(system) {
  this.system = system;
};

