function SubitoScore() {
  this.meta = {};
  this.systems = [];
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
