function SubitoMeasure(contexts) {
  if(contexts && Subito._isArray(contexts)) {
    for(var i = 0, length = contexts.length; i < length; i++) {
      contexts[i].setMeasure(this);
    }
  }
  this.contexts = contexts || [];
  this.barline = 'single';

  this.graphical = this.g = {};
  this.g.pen = {x: 0, y: 0};
}

SubitoMeasure.prototype.addContext = function(context) {
  if(!(context instanceof SubitoNote) &&
      !(context instanceof SubitoElement)) {
    throw new Subito.Exception('InvalidContext', 'SubitoMeasure only accepts ' +
        'SubitoNote and SubitoElements as child contexts');
  } else {
    if(context instanceof SubitoNote) {
      context.setMeasure(this);
    }

    this.contexts.push(context);
  }
};

SubitoMeasure.prototype.getMetrics = function(renderer, nocache) {
  if(this.cachedMetrics && !nocache) {
    return this.cachedMetrics;
  } else {
    var defaults = renderer.settings;
    var g = this.graphical || {};
    var width = g.width || defaults.measure.width;
    var height = g.height || defaults.measure.linespan * 4;
    var highest = 0, rwidth;

    for(var i = 0, length = this.contexts.length; i < length; i++) {
      if(this.contexts[i] instanceof SubitoNote) {
        var metric = this.contexts[i].getMetrics();
        highest = Math.min(highest, metric.position *
            renderer.settings.measure.linespan -
            renderer.settings.measure.linespan);
      }
    }

    rwidth = width;
    if(this.clef || renderer.flags && renderer.flags.renderClef) {
      var clef = this.getClef();
      width += 3; // Prespacing
      width += clef.getMetrics(renderer).width;
    }

    if(renderer.flags && renderer.flags.renderKey) {
      var key = this.getKey();
      width += key.getMetrics(renderer).width;
      width += 20; // Some nice space
    }

    var metrics = {
      height: height,
      width: width,
      rwidth: rwidth, // Without clef and key
      highest: highest
    };
    return (this.cachedMetrics = metrics);
  }
};

SubitoMeasure.prototype.render = function(renderer) {
  var ctx = renderer.context;
  var flags = renderer.flags;
  var metric = this.getMetrics();
  var xshift = this.stave.g.pen.x;
  var yshift = this.stave.g.pen.y;
  var y;

  // Draw stavelines
  for(var i = 0, length = 5; i < length; i++) {
    y = renderer.settings.measure.linespan * i;
    ctx.beginPath();
    ctx.moveTo(xshift, yshift + y);
    ctx.lineTo(xshift + metric.width, yshift + y);
    ctx.closePath();
    ctx.stroke();
  }


  // Draw barline
  if(this.barline == 'single') {
    ctx.beginPath();
    ctx.moveTo(xshift + metric.width + 0.5, yshift);
    ctx.lineTo(xshift + metric.width + 0.5, yshift + y);
    ctx.closePath();
    ctx.stroke();
  } else if(this.barline == 'final') {
    ctx.beginPath();
    ctx.moveTo(xshift + metric.width - 7.5, yshift);
    ctx.lineTo(xshift + metric.width - 7.5, yshift + y);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.save();
    ctx.moveTo(xshift + metric.width - 5, yshift);
    ctx.lineTo(xshift + metric.width, yshift);
    ctx.lineTo(xshift + metric.width, yshift + y);
    ctx.lineTo(xshift + metric.width - 5, yshift + y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else {
    throw new Error(this.barline + ' is an unsupported barline');
  }

  // Draw clef
  if(flags.renderClef || this.clef) {
    xshift += 3; // Prespacing
    var clef = this.getClef();
    var clefY = renderer.settings.measure.linespan * clef.line;
    clef.render(renderer, xshift, yshift + clefY);

    xshift += clef.getMetrics(renderer).width;
  } else {
    xshift += 20; // Little margin in measures
  }

  // Draw key
  if(flags.renderKey || this.key) {
    var key = this.getKey();

    key.render(renderer, xshift, yshift);
    xshift += key.getMetrics(renderer).width;
    xshift += 10; // Some nice space
  }

  // Draw time signature
  /*if(flags.renderTime || this.time) {
   *
  }*/

  // Render notes
  var context, shift;
  this.g.pen.x = xshift;
  this.g.pen.y = yshift;
  for(i = 0, length = this.contexts.length; i < length; i++) {
    context = this.contexts[i];
    if(context instanceof SubitoNote) {
      context.render(renderer);
      shift = metric.rwidth/context.tnote.duration;
      this.g.pen.x += shift;
    }
  }

  // Render BBox
  /*
  var bboxx = this.stave.g.pen.x, bboxy = this.stave.g.pen.y;
  ctx.save();
  ctx.fillStyle = '#0099FF';
  ctx.globalAlpha = 0.5;

  ctx.beginPath();
  ctx.moveTo(bboxx, bboxy + y);
  ctx.lineTo(bboxx, bboxy);
  ctx.lineTo(bboxx + metric.width, bboxy);
  ctx.lineTo(bboxx + metric.width, bboxy + y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  */
};

SubitoMeasure.prototype.getKey = function() {
  if(this.key instanceof SubitoKey) {
    return this.key;
  } else if(this.stave instanceof SubitoStave) {
    return this.stave.getKey();
  } else {
    return null;
  }
};

SubitoMeasure.prototype.setClef = function(clef) {
  if(!(clef instanceof SubitoClef)) {
    throw new Subito.Eception('InvalidClef', 'An invalid clef was passed');
  }

  this.clef = clef;
};

SubitoMeasure.prototype.getClef = function() {
  if(this.clef instanceof SubitoClef) {
    return this.clef;
  } else if(this.stave instanceof SubitoStave) {
    return this.stave.getClef();
  } else {
    return null;
  }
};

SubitoMeasure.prototype.setStave = function(stave) {
  this.stave = stave;
};

SubitoMeasure.prototype.setBarline = function(barline) {
  this.barline = barline;
};

SubitoMeasure.DurationUnits = 0x6900; // is divided by 2, 3, 5, and 7

