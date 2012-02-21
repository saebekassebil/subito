/**
 * SubitoScore
 *  - Describes a music score
 */
function SubitoScore() {
  this.meta = {}, this.systems = [];
}

SubitoScore.prototype.metadata = function(name, value) {
  if(!name && !value) {
    return this.meta;
  } else if(name && !value) {
    return this.meta[name] || null;
  } else if(name && value) {
    return this.meta[name] = value;
  }
};

SubitoScore.prototype.render = function(renderer) {
  if(renderer.settings.renderTitle && this.meta.title) {
    renderer.context.save();
    renderer.context.fillText(this.meta.title, 20, 20);
    renderer.context.restore();
  }

  for(var i = 0, length = this.systems.length; i < length; i++) {
    this.systems[i].render(renderer);
  }
};

SubitoScore.prototype.getBoundingBox = function() {
  
};