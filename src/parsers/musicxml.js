/**
 * @author saebekassebil
 */
Subito.Parsers.MusicXML = (function() {
  function constructor(source) {
    this.source = source;
  }

  function isArray(el) {
    return Object.prototype.toString.call(el) === '[object Array]';
  }

  function toMusicJSON(source) {
    if(!source || !('DOMParser' in window)) {
      return false;
    }

    var parser = new DOMParser();
    var doc = parser.parseFromString(source, 'application/xml');
    var parseError = doc.getElementsByTagName('parsererror');
    if(parseError.length > 0) {
      throw new Error('Invalid MusicXML');
    }

    // Translate to MusicJSON

    // Parsing a MusicXML element
    function parseElement(el) {
      var obj = {}, i, length, attribute, child, childNodeName, tmp, node;
      // Save attributes with '$' prefix
      if(el.hasAttributes()) {
        for(i = 0, length = el.attributes.length; i < length; i++) {
          attribute = el.attributes[i];
          obj['$' + attribute.name] = attribute.value;
        }
      }

      // Iterate over child nodes
      for(i = 0, length = el.childNodes.length; i < length; i++) {
        node = el.childNodes[i];
        if(node.nodeType === el.ELEMENT_NODE) {
          child = parseElement(node);
          childNodeName = node.nodeName.toLowerCase();

          if(childNodeName in obj && !isArray(obj[childNodeName])) {
            tmp = obj[childNodeName];
            obj[childNodeName] = [tmp, child];
          } else if(childNodeName in obj) {
            obj[childNodeName].push(child);
          } else {
            obj[childNodeName] = child;
          }
        } else if(node.nodeType === el.TEXT_NODE) {
          if(node.textContent && node.textContent.trim() !== '') {
            if(!el.attributes.length || el.attributes.length < 1) {
              obj = node.textContent;
            } else {
              obj.content = node.textContent;
            }
          }
        }
      }

      return obj;
    }

    var musicJSON = {};
    var root = doc.documentElement;
    musicJSON[root.tagName.toLowerCase()] = parseElement(root);

    return musicJSON;
  }

  constructor.prototype = {
    parseScore: function() {
      var musicjson = toMusicJSON(this.source);
      var jsonParser = new Subito.Parsers.MusicJSON(musicjson);

      return jsonParser.parseScore();
    }
  };

  return constructor;
})();
