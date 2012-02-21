/** 
 * SubitoSystem
 *  - Describes a music system
 */
function SubitoSystem() {
  this.instrument = null;
  this.staves = [];
  this.voices = [];
}

SubitoSystem.prototype.render = function(renderer) {
  for(var i = 0, length = this.staves.length; i < length; i++) {
    this.staves[i].render(renderer);
  }
  
  if(this.staves.length > 1) {
    // Render brace '{'
  }
  
  if(this.instrument && this.instrument.name) {
    // Render instrument name
  }
};

SubitoSystem.prototype.getBoundingBox = function() {
  
};