/**
 * SubitoMeasure
 * - Describes a measure in a stave
 */
function SubitoMeasure() {
  this.elements = [];
  this.clef = null;
  this.time = {beat: null, type: null};
  this.key = {fifths: 0, mode: 'major'};
}

SubitoMeasure.prototype.render = function(renderer, stave) {
  if(renderer.settings.measure.renderClef) { // Render clef
    this.clef = this.clef || stave.clef;
    this.clef.render(renderer, this);
  }
  
  // Render Stave lines
  var bbox = this.getBoundingBox(stave);
  for(var i = 0, length = 5; i < length; i++) {
    renderer.context.beginPath()
                    .moveTo(0, renderer.settings.stave.linespace*i)
                    .lineTo(bbox.right.x, renderer.settings.stave.linespace*i)
                    .stroke();
  }
  
  // Render notes
  for(i = 0, length = this.elements.length; i < length; i++) {
    bbox = this.elements[i].getBoundingBox();
    this.elements[i].render(renderer, this);
    renderer.context.position.x += bbox.right.x;
  }
};

SubitoMeasure.prototype.getBoundingBox = function(parent) {
  if(this.cachedBBox) {
    return this.cachedBBox;
  }
  
  var bbox = {left: {x:0, y:0}, right: {x:0, y:0}},
      clef = this.clef || parent.clef, childrenbbox;
  for(var i = 0, length = this.elements.length; i < length; i++) {
    childrenbbox = this.elements[i].getBoundingBox();
    bbox.right.x += childrenbbox.right.x;
    //@TODO add vertical support
  }
  
  if(bbox.right.x < 100) bbox.right.x = 100; // Minimum measure width
  
  this.cachedBBox = bbox;
  return bbox;
};
