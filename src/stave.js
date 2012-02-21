/**
 * SubitoStave
 *  - Describes a stave in a system
 */
function SubitoStave() {
  this.measures = [];
  this.clef = null;
  this.time = {beat: null, type: null};
  this.key = {fifths: 0, mode: 'major'};
  this.lines = 5;
}

SubitoStave.prototype.render = function(renderer) {
  var bbox = this.getBoundingBox(), i, length;
  
  for(i = 0, length = this.measures.length; i < length; i++) {
    if(i == 0) {
      renderer.settings.measure.renderClef = true;
      renderer.settings.measure.renderTime = true;
      renderer.settings.measure.renderKey = true;
    } else if(i == 1) {
      renderer.settings.measure.renderClef = false;
      renderer.settings.measure.renderTime = false;
      renderer.settings.measure.renderKey = false;
    }
    
    this.measures[i].render(renderer, this);
  }
};

SubitoStave.prototype.getBoundingBox = function() {
  if(this.cachedBBox) {
    return this.cachedBBox;
  }
  var bbox = {length: 0}, measureBBox;
  for(var i = 0, length = this.measures.length; i < length; i++) {
    measureBBox = this.measures[i].getBoundingBox(this);
    bbox.length += measureBBox.length;
  }
  
  
  return this.cachedBBox = bbox;
};