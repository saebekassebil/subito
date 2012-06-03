function SubitoGraphicStaveLine() {
  this.measures = [];
}

SubitoGraphicStaveLine.prototype.addMeasure = function(measure) {
  if(!(measure instanceof SubitoMeasure)) {
    throw new Subito.Exception('InvalidContext', 'Invalid measure');
  }

  measure.setGraphicStaveLine(this);
  this.measures.push(measure);
};
