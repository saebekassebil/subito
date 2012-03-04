function SubitoScore(metadata) {
  this.meta = (typeof metadata == 'object') ? metadata : {};
  this.contexts = [];
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

SubitoScore.prototype.addContext = function(context) {
  if(!(context instanceof SubitoSystem) &&
      !(context instanceof SubitoElement)) {
    throw new Subito.Exception('InvalidContext', 'Only SubitoSystem and ' +
          'SubitoElements can be added to the SubitoScore context');
  } else {
    this.contexts.push(context);
  }
};

SubitoScore.prototype.render = function(ctx) {
  for(var i = 0, length = this.contexts.length; i < length; i++) {
    this.contexts[i].render(ctx);
  }
};
