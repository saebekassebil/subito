(function standaloneClosure() {
  // Standalone version of Subito

  function createSubito(el) {
    var script = el.querySelector('script');
    var type = script ? script.getAttribute('type') : null;
    if(!type) {
      return false;
    }
          
    type = type.split('/');

    var subito = new Subito(el);
    subito.parse(script.textContent, type[type.length-1]);
          
    window._subitos = window._subitos || [];
    window._subitos.push(subito);
  }
  
  window.addEventListener('load', function() {
    [].slice.call(document.querySelectorAll('.subito')).map(createSubito);
  }, false);
})();
