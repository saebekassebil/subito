(function standaloneClosure() {
  // Standalone Version of Subito
  // This helper functionallity makes subito.js extremely easy to
  // use in blogs, small music notation examples, etc.

  function createSubitoInstance(el) {
    if(el.childNodes && el.childNodes.length > 0) {
      var children = el.childNodes, child;
      for(var i = 0, length = children.length; i < length; i++) {
        child = children[i];
        if(child.tagName && child.tagName.toLowerCase() === 'script') {
          var type = child.getAttribute('type') || null;
          if(!type) {
            return false;
          }
          
          type = type.split('/');
          type = (type.length === 2) ? type[1] : type[0];
          console.log(type);
          var subito = new Subito(el);
          subito.parse(child.innerHTML);
          
          window._subitos = window._subitos || [];
          window._subitos.push(subito);
        }
      }
    }
  }
  
  function listener(e) {
    var canvas = document.getElementsByTagName('canvas');
    var svg = document.getElementsByTagName('svg');
    var classname;

    for(var i = 0, length = canvas.length; i < length; i++) {
      if(canvas[i].className.indexOf('subito') !== -1) {
        createSubitoInstance(canvas[i]);
      }
    }

    for(i = 0, length = svg.length; i < length; i++) {
      classname = (svg[i].className.baseVal) ? svg[i].className.baseVal :
                                               svg[i].className;

      if(classname.indexOf('subito') !== -1) {
        createSubitoInstance(svg[i]);
      }
    }
  }

  if(window.addEventListener) {
    window.addEventListener('load', listener, false);
  } else if(window.attachEvent) {
    window.attachEvent('onload', listener);
  } else {
    throw new Subito.Exception('UnsupportedPlatform', 'This platform is not ' +
                                'supported by Subito');
  }
})();
