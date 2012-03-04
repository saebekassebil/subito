function SubitoFormatter(settings) {
  this.settings = settings || SubitoFormatter.DefaultSettings;
}

SubitoFormatter.prototype.formatScore = function(score) {
  var settings = this.settings;
  if(!(score instanceof SubitoScore)) {
    throw new Subito.Exception('InvalidScore', 'The parameter isn\'t a valid ' +
        'SubitoScore');
  } else if(!settings.height || !settings.width) {
    if(settings.canvas) {
      var metrics = settings.canvas.getMetrics();
      settings.height = metrics.height;
      settings.width = metrics.width;
    } else {
      throw new Subito.Exception('NotEnoughInformation',
         'The formatter needs either a width and height settings, ' +
         'or a canvas to get it from');
    }
  }
};

SubitoFormatter.DefaultSettings = {

};
