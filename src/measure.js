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

SubitoMeasure.prototype = {
  addContext: function measureAddContext(context) {
    if(!(context instanceof SubitoNote) &&
        !(context instanceof SubitoElement) &&
        !(context instanceof SubitoChord)) {
      throw new Subito.Exception('InvalidContext',
          'SubitoMeasure only accepts ' +
          'SubitoNote, SubitoChord and SubitoElements as child contexts');
    } else {
      context.setMeasure(this);
      this.contexts.push(context);
    }
  },

  getMetrics: function measureGetMetrics(renderer, nocache) {
    if(this.cachedMetrics && !nocache) {
      return this.cachedMetrics;
    } else {
      var defaults = renderer.settings;
      var g = this.graphical || {};
      var width = g.width || defaults.measure.width;
      var height = g.height || defaults.measure.linespan * 4;
      var highest = 0, rwidth, clef = this.getClef();

      for(var i = 0, length = this.contexts.length; i < length; i++) {
        if(this.contexts[i] instanceof SubitoNote) {
          var metric = this.contexts[i].getMetrics();
          var stem = this.contexts[i].getStem(clef);
          var notey = metric.position * defaults.measure.linespan +
                (stem === 'up' ? -1 : 0) *
                (metric.stemlength || defaults.note.stem) -
                (stem === 'up' ? 0 : 1) * defaults.measure.linespan/2;
          highest = Math.min(highest, notey);
        }
      }

      rwidth = width;
      if(this.clef || (renderer.flags && renderer.flags.renderClef)) {
        width += 3; // Prespacing
        width += clef.getMetrics(renderer).width;
      }

      if(renderer.flags && renderer.flags.renderKey) {
        var key = this.getKey();
        width += key.getMetrics(renderer).width;
        width += 20; // Some nice space
      }

      if(this.time || (renderer.flags && renderer.flags.renderTime)) {
        width += this.getTime().getMetrics(renderer).width;
      }

      var metrics = {
        height: height,
        width: width,
        rwidth: rwidth, // Without clef and key
        highest: highest
      };
      return (this.cachedMetrics = metrics);
    }
  },

  render: function measureRender(renderer) {
    var ctx = renderer.context;
    var flags = renderer.flags;
    var metric = this.getMetrics();
    var xshift = this.stave.g.pen.x;
    var yshift = this.stave.g.pen.y;
    var y, time;

    // Draw stavelines
    for(var i = 0, length = 5; i < length; i++) {
      y = renderer.settings.measure.linespan * i;
      ctx.beginPath();
      ctx._exMoveTo(xshift, yshift + y);
      ctx._exLineTo(xshift + metric.width, yshift + y);
      ctx.closePath();
      ctx.stroke();
    }


    // Draw barline
    if(this.barline === 'single') {
      ctx.beginPath();
      ctx._exMoveTo(xshift + metric.width + 0.5, yshift);
      ctx._exLineTo(xshift + metric.width + 0.5, yshift + y);
      ctx.closePath();
      ctx.stroke();
    } else if(this.barline === 'final') {
      ctx.beginPath();
      ctx._exMoveTo(xshift + metric.width - 7.5, yshift);
      ctx._exLineTo(xshift + metric.width - 7.5, yshift + y);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.save();
      ctx._exMoveTo(xshift + metric.width - 5, yshift);
      ctx._exLineTo(xshift + metric.width, yshift);
      ctx._exLineTo(xshift + metric.width, yshift + y);
      ctx._exLineTo(xshift + metric.width - 5, yshift + y);
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
      xshift += 5; // Some nice space
    }

    if(flags.renderTime || this.time) {
      time = this.getTime();
      var timeY = renderer.settings.measure.linespan * time.line;
      time.render(renderer, xshift, yshift + timeY);

      xshift += time.getMetrics(renderer).width;
      xshift += 10; // Some nice space
    }

    // Render notes
    var context, shift;
    time = time || this.getTime();
    this.g.pen.x = xshift;
    this.g.pen.y = yshift;
    for(i = 0, length = this.contexts.length; i < length; i++) {
      context = this.contexts[i];
      if(context instanceof SubitoNote) {
        context.render(renderer);
        shift = (metric.rwidth/time.count) / (context.tnote.duration/time.unit);
        this.g.pen.x += shift;
      } else if(context instanceof SubitoChord) {
        context.render(renderer);
        shift = (metric.rwidth/time.count) /
          (context.notes[0].tnote.duration/time.unit);
        this.g.pen.x += shift;
      }
    }
  },

  getKey: function measureGetKey() {
    if(this.key instanceof SubitoKey) {
      return this.key;
    } else if(this.stave instanceof SubitoStave) {
      return this.stave.getKey();
    } else {
      return null;
    }
  },

  getTime: function measureGetTime() {
    if(this.time instanceof SubitoTime) {
      return this.time;
    } else if(this.stave instanceof SubitoStave) {
      return this.stave.getTime();
    } else {
      return null;
    }
  },

  setClef: function measureSetClef(clef) {
    if(!(clef instanceof SubitoClef)) {
      throw new Subito.Eception('InvalidClef', 'An invalid clef was passed');
    }

    this.clef = clef;
  },

  getClef: function measureGetClef() {
    if(this.clef instanceof SubitoClef) {
      return this.clef;
    } else if(this.stave instanceof SubitoStave) {
      return this.stave.getClef();
    } else {
      return null;
    }
  },

  setStave: function measureSetStave(stave) {
    this.stave = stave;
  },

  setBarline: function measureSetBarline(barline) {
    this.barline = barline;
  },

  setGraphicStaveLine: function measureSetGraphicStaveLine(gStave) {
    this.gStaveLine = gStave;
  }
};

SubitoMeasure.DurationUnits = 0x6900; // is divided by 2, 3, 5, and 7

