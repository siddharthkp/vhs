(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
 * Module exports.
 */

module.exports = getDocument;

// defined by w3c
var DOCUMENT_NODE = 9;

/**
 * Returns `true` if `w` is a Document object, or `false` otherwise.
 *
 * @param {?} d - Document object, maybe
 * @return {Boolean}
 * @private
 */

function isDocument (d) {
  return d && d.nodeType === DOCUMENT_NODE;
}

/**
 * Returns the `document` object associated with the given `node`, which may be
 * a DOM element, the Window object, a Selection, a Range. Basically any DOM
 * object that references the Document in some way, this function will find it.
 *
 * @param {Mixed} node - DOM node, selection, or range in which to find the `document` object
 * @return {Document} the `document` object associated with `node`
 * @public
 */

function getDocument(node) {
  if (isDocument(node)) {
    return node;

  } else if (isDocument(node.ownerDocument)) {
    return node.ownerDocument;

  } else if (isDocument(node.document)) {
    return node.document;

  } else if (node.parentNode) {
    return getDocument(node.parentNode);

  // Range support
  } else if (node.commonAncestorContainer) {
    return getDocument(node.commonAncestorContainer);

  } else if (node.startContainer) {
    return getDocument(node.startContainer);

  // Selection support
  } else if (node.anchorNode) {
    return getDocument(node.anchorNode);
  }
}

},{}],2:[function(require,module,exports){
"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DOMException = function DOMException(message, name) {
  _classCallCheck(this, DOMException);

  this.message = message;
  this.name = name;
  this.stack = new Error().stack;
};

exports["default"] = DOMException;


DOMException.prototype = new Error();

DOMException.prototype.toString = function () {
  return this.name + ": " + this.message;
};

},{}],3:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.fromNode = fromNode;
exports.toNode = toNode;

var _getDocument = require('get-document');

var _getDocument2 = _interopRequireDefault(_getDocument);

var _domException = require('./dom-exception');

var _domException2 = _interopRequireDefault(_domException);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// https://developer.mozilla.org/en-US/docs/XPathResult
var FIRST_ORDERED_NODE_TYPE = 9;

// Default namespace for XHTML documents
var HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';

/**
 * Compute an XPath expression for the given node.
 *
 * If the optional parameter `root` is supplied, the computed XPath expression
 * will be relative to it. Otherwise, the root element is the root of the
 * document to which `node` belongs.
 *
 * @param {Node} node The node for which to compute an XPath expression.
 * @param {Node} [root] The root context for the XPath expression.
 * @returns {string}
 */
function fromNode(node) {
  var root = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  if (node === undefined) {
    throw new Error('missing required parameter "node"');
  }

  root = root || (0, _getDocument2['default'])(node);

  var path = '/';
  while (node !== root) {
    if (!node) {
      var message = 'The supplied node is not contained by the root node.';
      var name = 'InvalidNodeTypeError';
      throw new _domException2['default'](message, name);
    }
    path = '/' + nodeName(node) + '[' + nodePosition(node) + ']' + path;
    node = node.parentNode;
  }
  return path.replace(/\/$/, '');
}

/**
 * Find a node using an XPath relative to the given root node.
 *
 * The XPath expressions are evaluated relative to the Node argument `root`.
 *
 * If the optional parameter `resolver` is supplied, it will be used to resolve
 * any namespaces within the XPath.
 *
 * @param {string} path An XPath String to evaluate.
 * @param {Node} root The root context for the XPath expression.
 * @returns {Node|null} The first matching Node or null if none is found.
 */
function toNode(path, root) {
  var resolver = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  if (path === undefined) {
    throw new Error('missing required parameter "path"');
  }
  if (root === undefined) {
    throw new Error('missing required parameter "root"');
  }

  // Make the path relative to the root, if not the document.
  var document = (0, _getDocument2['default'])(root);
  if (root !== document) path = path.replace(/^\//, './');

  // Make a default resolver.
  var documentElement = document.documentElement;
  if (resolver === null && documentElement.lookupNamespaceURI) {
    (function () {
      var defaultNS = documentElement.lookupNamespaceURI(null) || HTML_NAMESPACE;
      resolver = function resolver(prefix) {
        var ns = { '_default_': defaultNS };
        return ns[prefix] || documentElement.lookupNamespaceURI(prefix);
      };
    })();
  }

  return resolve(path, root, resolver);
}

// Get the XPath node name.
function nodeName(node) {
  switch (node.nodeName) {
    case '#text':
      return 'text()';
    case '#comment':
      return 'comment()';
    case '#cdata-section':
      return 'cdata-section()';
    default:
      return node.nodeName.toLowerCase();
  }
}

// Get the ordinal position of this node among its siblings of the same name.
function nodePosition(node) {
  var name = node.nodeName;
  var position = 1;
  while (node = node.previousSibling) {
    if (node.nodeName === name) position += 1;
  }
  return position;
}

// Find a single node with XPath `path`
function resolve(path, root, resolver) {
  try {
    // Add a default value to each path part lacking a prefix.
    var nspath = path.replace(/\/(?!\.)([^\/:\(]+)(?=\/|$)/g, '/_default_:$1');
    return platformResolve(nspath, root, resolver);
  } catch (err) {
    return fallbackResolve(path, root);
  }
}

// Find a single node with XPath `path` using the simple, built-in evaluator.
function fallbackResolve(path, root) {
  var steps = path.split("/");
  var node = root;
  while (node) {
    var step = steps.shift();
    if (step === undefined) break;
    if (step === '.') continue;

    var _step$split = step.split(/[\[\]]/);

    var name = _step$split[0];
    var position = _step$split[1];

    name = name.replace('_default_:', '');
    position = position ? parseInt(position) : 1;
    node = findChild(node, name, position);
  }
  return node;
}

// Find a single node with XPath `path` using `document.evaluate`.
function platformResolve(path, root, resolver) {
  var document = (0, _getDocument2['default'])(root);
  var r = document.evaluate(path, root, resolver, FIRST_ORDERED_NODE_TYPE, null);
  return r.singleNodeValue;
}

// Find the child of the given node by name and ordinal position.
function findChild(node, name, position) {
  for (node = node.firstChild; node; node = node.nextSibling) {
    if (nodeName(node) === name && --position === 0) break;
  }
  return node;
}

},{"./dom-exception":2,"get-document":1}],4:[function(require,module,exports){
'use strict';

var xpath = require('../node_modules/simple-xpath-position/lib/xpath.js');

var fire = function fire(event) {
  var target = xpath.fromNode(event.target);
  console.log(event.type, target);
};

var attachHandlers = function attachHandlers() {
  var eventTypes = ['click', 'keypress'];
  var triggers = {};
  eventTypes.map(function (type) {
    return triggers[type] = fire;
  });
  $('html').on(triggers);
};

$(function () {
  attachHandlers();
});

},{"../node_modules/simple-xpath-position/lib/xpath.js":3}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZ2V0LWRvY3VtZW50L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS14cGF0aC1wb3NpdGlvbi9zcmMvZG9tLWV4Y2VwdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUteHBhdGgtcG9zaXRpb24vc3JjL3hwYXRoLmpzIiwiaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7SUN6RHFCLFksR0FDbkIsc0JBQVksT0FBWixFQUFxQixJQUFyQixFQUEyQjtBQUFBOztBQUN6QixPQUFLLE9BQUwsR0FBZSxPQUFmO0FBQ0EsT0FBSyxJQUFMLEdBQVksSUFBWjtBQUNBLE9BQUssS0FBTCxHQUFjLElBQUksS0FBSixFQUFELENBQWMsS0FBM0I7QUFDRCxDOztxQkFMa0IsWTs7O0FBUXJCLGFBQWEsU0FBYixHQUF5QixJQUFJLEtBQUosRUFBekI7O0FBRUEsYUFBYSxTQUFiLENBQXVCLFFBQXZCLEdBQWtDLFlBQVk7QUFDNUMsU0FBVSxLQUFLLElBQWYsVUFBd0IsS0FBSyxPQUE3QjtBQUNELENBRkQ7Ozs7OztRQ1lnQixRLEdBQUEsUTtRQWlDQSxNLEdBQUEsTTs7QUF2RGhCOzs7O0FBRUE7Ozs7OztBQUVBO0FB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QUE5QyxFQUFpRDtBQUNsRDtBQUNELFNBQU8sSUFBUDtBQUNEOzs7OztBQ2xKRCxJQUFNLFFBQVEsUUFBUSxvREFBUixDQUFkOztBQUVBLElBQU0sT0FBTyxTQUFQLElBQU8sQ0FBQyxLQUFELEVBQVc7QUFDcEIsTUFBSSxTQUFTLE1BQU0sUUFBTixDQUFlLE1BQU0sTUFBckIsQ0FBYjtBQUNBLFVBQVEsR0FBUixDQUFZLE1BQU0sSUFBbEIsRUFBd0IsTUFBeEI7QUFDSCxDQUhEOztBQUtBLElBQU0saUJBQWlCLFNBQWpCLGNBQWlCLEdBQU07QUFDekIsTUFBSSxhQUFhLENBQUMsT0FBRCxFQUFVLFVBQVYsQ0FBakI7QUFDQSxNQUFJLFdBQVcsRUFBZjtBQUNBLGFBQVcsR0FBWCxDQUFlO0FBQUEsV0FBUSxTQUFTLElBQVQsSUFBaUIsSUFBekI7QUFBQSxHQUFmO0FBQ0EsSUFBRSxNQUFGLEVBQVUsRUFBVixDQUFhLFFBQWI7QUFDSCxDQUxEOztBQU9BLEVBQUUsWUFBTTtBQUNKO0FBQ0gsQ0FGRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbi8qKlxuICogTW9kdWxlIGV4cG9ydHMuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBnZXREb2N1bWVudDtcblxuLy8gZGVmaW5lZCBieSB3M2NcbnZhciBET0NVTUVOVF9OT0RFID0gOTtcblxuLyoqXG4gKiBSZXR1cm5zIGB0cnVlYCBpZiBgd2AgaXMgYSBEb2N1bWVudCBvYmplY3QsIG9yIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICpcbiAqIEBwYXJhbSB7P30gZCAtIERvY3VtZW50IG9iamVjdCwgbWF5YmVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzRG9jdW1lbnQgKGQpIHtcbiAgcmV0dXJuIGQgJiYgZC5ub2RlVHlwZSA9PT0gRE9DVU1FTlRfTk9ERTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBgZG9jdW1lbnRgIG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIGBub2RlYCwgd2hpY2ggbWF5IGJlXG4gKiBhIERPTSBlbGVtZW50LCB0aGUgV2luZG93IG9iamVjdCwgYSBTZWxlY3Rpb24sIGEgUmFuZ2UuIEJhc2ljYWxseSBhbnkgRE9NXG4gKiBvYmplY3QgdGhhdCByZWZlcmVuY2VzIHRoZSBEb2N1bWVudCBpbiBzb21lIHdheSwgdGhpcyBmdW5jdGlvbiB3aWxsIGZpbmQgaXQuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gbm9kZSAtIERPTSBub2RlLCBzZWxlY3Rpb24sIG9yIHJhbmdlIGluIHdoaWNoIHRvIGZpbmQgdGhlIGBkb2N1bWVudGAgb2JqZWN0XG4gKiBAcmV0dXJuIHtEb2N1bWVudH0gdGhlIGBkb2N1bWVudGAgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCBgbm9kZWBcbiAqIEBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBnZXREb2N1bWVudChub2RlKSB7XG4gIGlmIChpc0RvY3VtZW50KG5vZGUpKSB7XG4gICAgcmV0dXJuIG5vZGU7XG5cbiAgfSBlbHNlIGlmIChpc0RvY3VtZW50KG5vZGUub3duZXJEb2N1bWVudCkpIHtcbiAgICByZXR1cm4gbm9kZS5vd25lckRvY3VtZW50O1xuXG4gIH0gZWxzZSBpZiAoaXNEb2N1bWVudChub2RlLmRvY3VtZW50KSkge1xuICAgIHJldHVybiBub2RlLmRvY3VtZW50O1xuXG4gIH0gZWxzZSBpZiAobm9kZS5wYXJlbnROb2RlKSB7XG4gICAgcmV0dXJuIGdldERvY3VtZW50KG5vZGUucGFyZW50Tm9kZSk7XG5cbiAgLy8gUmFuZ2Ugc3VwcG9ydFxuICB9IGVsc2UgaWYgKG5vZGUuY29tbW9uQW5jZXN0b3JDb250YWluZXIpIHtcbiAgICByZXR1cm4gZ2V0RG9jdW1lbnQobm9kZS5jb21tb25BbmNlc3RvckNvbnRhaW5lcik7XG5cbiAgfSBlbHNlIGlmIChub2RlLnN0YXJ0Q29udGFpbmVyKSB7XG4gICAgcmV0dXJuIGdldERvY3VtZW50KG5vZGUuc3RhcnRDb250YWluZXIpO1xuXG4gIC8vIFNlbGVjdGlvbiBzdXBwb3J0XG4gIH0gZWxzZSBpZiAobm9kZS5hbmNob3JOb2RlKSB7XG4gICAgcmV0dXJuIGdldERvY3VtZW50KG5vZGUuYW5jaG9yTm9kZSk7XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIERPTUV4Y2VwdGlvbiB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UsIG5hbWUpIHtcbiAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlXG4gICAgdGhpcy5uYW1lID0gbmFtZVxuICAgIHRoaXMuc3RhY2sgPSAobmV3IEVycm9yKCkpLnN0YWNrXG4gIH1cbn1cblxuRE9NRXhjZXB0aW9uLnByb3RvdHlwZSA9IG5ldyBFcnJvcigpXG5cbkRPTUV4Y2VwdGlvbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBgJHt0aGlzLm5hbWV9OiAke3RoaXMubWVzc2FnZX1gXG59XG4iLCJpbXBvcnQgZ2V0RG9jdW1lbnQgZnJvbSAnZ2V0LWRvY3VtZW50J1xuXG5pbXBvcnQgRE9NRXhjZXB0aW9uIGZyb20gJy4vZG9tLWV4Y2VwdGlvbidcblxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9YUGF0aFJlc3VsdFxuY29uc3QgRklSU1RfT1JERVJFRF9OT0RFX1RZUEUgPSA5XG5cbi8vIERlZmF1bHQgbmFtZXNwYWNlIGZvciBYSFRNTCBkb2N1bWVudHNcbmNvbnN0IEhUTUxfTkFNRVNQQUNFID0gJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwnXG5cblxuLyoqXG4gKiBDb21wdXRlIGFuIFhQYXRoIGV4cHJlc3Npb24gZm9yIHRoZSBnaXZlbiBub2RlLlxuICpcbiAqIElmIHRoZSBvcHRpb25hbCBwYXJhbWV0ZXIgYHJvb3RgIGlzIHN1cHBsaWVkLCB0aGUgY29tcHV0ZWQgWFBhdGggZXhwcmVzc2lvblxuICogd2lsbCBiZSByZWxhdGl2ZSB0byBpdC4gT3RoZXJ3aXNlLCB0aGUgcm9vdCBlbGVtZW50IGlzIHRoZSByb290IG9mIHRoZVxuICogZG9jdW1lbnQgdG8gd2hpY2ggYG5vZGVgIGJlbG9uZ3MuXG4gKlxuICogQHBhcmFtIHtOb2RlfSBub2RlIFRoZSBub2RlIGZvciB3aGljaCB0byBjb21wdXRlIGFuIFhQYXRoIGV4cHJlc3Npb24uXG4gKiBAcGFyYW0ge05vZGV9IFtyb290XSBUaGUgcm9vdCBjb250ZXh0IGZvciB0aGUgWFBhdGggZXhwcmVzc2lvbi5cbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tTm9kZShub2RlLCByb290ID0gbnVsbCkge1xuICBpZiAobm9kZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdtaXNzaW5nIHJlcXVpcmVkIHBhcmFtZXRlciBcIm5vZGVcIicpXG4gIH1cblxuICByb290ID0gcm9vdCB8fCBnZXREb2N1bWVudChub2RlKVxuXG4gIGxldCBwYXRoID0gJy8nXG4gIHdoaWxlIChub2RlICE9PSByb290KSB7XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICBsZXQgbWVzc2FnZSA9ICdUaGUgc3VwcGxpZWQgbm9kZSBpcyBub3QgY29udGFpbmVkIGJ5IHRoZSByb290IG5vZGUuJ1xuICAgICAgbGV0IG5hbWUgPSAnSW52YWxpZE5vZGVUeXBlRXJyb3InXG4gICAgICB0aHJvdyBuZXcgRE9NRXhjZXB0aW9uKG1lc3NhZ2UsIG5hbWUpXG4gICAgfVxuICAgIHBhdGggPSBgLyR7bm9kZU5hbWUobm9kZSl9WyR7bm9kZVBvc2l0aW9uKG5vZGUpfV0ke3BhdGh9YFxuICAgIG5vZGUgPSBub2RlLnBhcmVudE5vZGVcbiAgfVxuICByZXR1cm4gcGF0aC5yZXBsYWNlKC9cXC8kLywgJycpXG59XG5cblxuLyoqXG4gKiBGaW5kIGEgbm9kZSB1c2luZyBhbiBYUGF0aCByZWxhdGl2ZSB0byB0aGUgZ2l2ZW4gcm9vdCBub2RlLlxuICpcbiAqIFRoZSBYUGF0aCBleHByZXNzaW9ucyBhcmUgZXZhbHVhdGVkIHJlbGF0aXZlIHRvIHRoZSBOb2RlIGFyZ3VtZW50IGByb290YC5cbiAqXG4gKiBJZiB0aGUgb3B0aW9uYWwgcGFyYW1ldGVyIGByZXNvbHZlcmAgaXMgc3VwcGxpZWQsIGl0IHdpbGwgYmUgdXNlZCB0byByZXNvbHZlXG4gKiBhbnkgbmFtZXNwYWNlcyB3aXRoaW4gdGhlIFhQYXRoLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIEFuIFhQYXRoIFN0cmluZyB0byBldmFsdWF0ZS5cbiAqIEBwYXJhbSB7Tm9kZX0gcm9vdCBUaGUgcm9vdCBjb250ZXh0IGZvciB0aGUgWFBhdGggZXhwcmVzc2lvbi5cbiAqIEByZXR1cm5zIHtOb2RlfG51bGx9IFRoZSBmaXJzdCBtYXRjaGluZyBOb2RlIG9yIG51bGwgaWYgbm9uZSBpcyBmb3VuZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvTm9kZShwYXRoLCByb290LCByZXNvbHZlciA9IG51bGwpIHtcbiAgaWYgKHBhdGggPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFcnJvcignbWlzc2luZyByZXF1aXJlZCBwYXJhbWV0ZXIgXCJwYXRoXCInKVxuICB9XG4gIGlmIChyb290ID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ21pc3NpbmcgcmVxdWlyZWQgcGFyYW1ldGVyIFwicm9vdFwiJylcbiAgfVxuXG4gIC8vIE1ha2UgdGhlIHBhdGggcmVsYXRpdmUgdG8gdGhlIHJvb3QsIGlmIG5vdCB0aGUgZG9jdW1lbnQuXG4gIGxldCBkb2N1bWVudCA9IGdldERvY3VtZW50KHJvb3QpXG4gIGlmIChyb290ICE9PSBkb2N1bWVudCkgcGF0aCA9IHBhdGgucmVwbGFjZSgvXlxcLy8sICcuLycpXG5cbiAgLy8gTWFrZSBhIGRlZmF1bHQgcmVzb2x2ZXIuXG4gIGxldCBkb2N1bWVudEVsZW1lbnQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRcbiAgaWYgKHJlc29sdmVyID09PSBudWxsICYmIGRvY3VtZW50RWxlbWVudC5sb29rdXBOYW1lc3BhY2VVUkkpIHtcbiAgICBsZXQgZGVmYXVsdE5TID0gZG9jdW1lbnRFbGVtZW50Lmxvb2t1cE5hbWVzcGFjZVVSSShudWxsKSB8fCBIVE1MX05BTUVTUEFDRVxuICAgIHJlc29sdmVyID0gKHByZWZpeCkgPT4ge1xuICAgICAgbGV0IG5zID0geydfZGVmYXVsdF8nOiBkZWZhdWx0TlN9XG4gICAgICByZXR1cm4gbnNbcHJlZml4XSB8fCBkb2N1bWVudEVsZW1lbnQubG9va3VwTmFtZXNwYWNlVVJJKHByZWZpeClcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzb2x2ZShwYXRoLCByb290LCByZXNvbHZlcilcbn1cblxuXG4vLyBHZXQgdGhlIFhQYXRoIG5vZGUgbmFtZS5cbmZ1bmN0aW9uIG5vZGVOYW1lKG5vZGUpIHtcbiAgc3dpdGNoIChub2RlLm5vZGVOYW1lKSB7XG4gIGNhc2UgJyN0ZXh0JzogcmV0dXJuICd0ZXh0KCknXG4gIGNhc2UgJyNjb21tZW50JzogcmV0dXJuICdjb21tZW50KCknXG4gIGNhc2UgJyNjZGF0YS1zZWN0aW9uJzogcmV0dXJuICdjZGF0YS1zZWN0aW9uKCknXG4gIGRlZmF1bHQ6IHJldHVybiBub2RlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKClcbiAgfVxufVxuXG5cbi8vIEdldCB0aGUgb3JkaW5hbCBwb3NpdGlvbiBvZiB0aGlzIG5vZGUgYW1vbmcgaXRzIHNpYmxpbmdzIG9mIHRoZSBzYW1lIG5hbWUuXG5mdW5jdGlvbiBub2RlUG9zaXRpb24obm9kZSkge1xuICBsZXQgbmFtZSA9IG5vZGUubm9kZU5hbWVcbiAgbGV0IHBvc2l0aW9uID0gMVxuICB3aGlsZSAoKG5vZGUgPSBub2RlLnByZXZpb3VzU2libGluZykpIHtcbiAgICBpZiAobm9kZS5ub2RlTmFtZSA9PT0gbmFtZSkgcG9zaXRpb24gKz0gMVxuICB9XG4gIHJldHVybiBwb3NpdGlvblxufVxuXG5cbi8vIEZpbmQgYSBzaW5nbGUgbm9kZSB3aXRoIFhQYXRoIGBwYXRoYFxuZnVuY3Rpb24gcmVzb2x2ZShwYXRoLCByb290LCByZXNvbHZlcikge1xuICB0cnkge1xuICAgIC8vIEFkZCBhIGRlZmF1bHQgdmFsdWUgdG8gZWFjaCBwYXRoIHBhcnQgbGFja2luZyBhIHByZWZpeC5cbiAgICBsZXQgbnNwYXRoID0gcGF0aC5yZXBsYWNlKC9cXC8oPyFcXC4pKFteXFwvOlxcKF0rKSg/PVxcL3wkKS9nLCAnL19kZWZhdWx0XzokMScpXG4gICAgcmV0dXJuIHBsYXRmb3JtUmVzb2x2ZShuc3BhdGgsIHJvb3QsIHJlc29sdmVyKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gZmFsbGJhY2tSZXNvbHZlKHBhdGgsIHJvb3QpXG4gIH1cbn1cblxuXG4vLyBGaW5kIGEgc2luZ2xlIG5vZGUgd2l0aCBYUGF0aCBgcGF0aGAgdXNpbmcgdGhlIHNpbXBsZSwgYnVpbHQtaW4gZXZhbHVhdG9yLlxuZnVuY3Rpb24gZmFsbGJhY2tSZXNvbHZlKHBhdGgsIHJvb3QpIHtcbiAgbGV0IHN0ZXBzID0gcGF0aC5zcGxpdChcIi9cIilcbiAgbGV0IG5vZGUgPSByb290XG4gIHdoaWxlIChub2RlKSB7XG4gICAgbGV0IHN0ZXAgPSBzdGVwcy5zaGlmdCgpXG4gICAgaWYgKHN0ZXAgPT09IHVuZGVmaW5lZCkgYnJlYWtcbiAgICBpZiAoc3RlcCA9PT0gJy4nKSBjb250aW51ZVxuICAgIGxldCBbbmFtZSwgcG9zaXRpb25dID0gc3RlcC5zcGxpdCgvW1xcW1xcXV0vKVxuICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoJ19kZWZhdWx0XzonLCAnJylcbiAgICBwb3NpdGlvbiA9IHBvc2l0aW9uID8gcGFyc2VJbnQocG9zaXRpb24pIDogMVxuICAgIG5vZGUgPSBmaW5kQ2hpbGQobm9kZSwgbmFtZSwgcG9zaXRpb24pXG4gIH1cbiAgcmV0dXJuIG5vZGVcbn1cblxuXG4vLyBGaW5kIGEgc2luZ2xlIG5vZGUgd2l0aCBYUGF0aCBgcGF0aGAgdXNpbmcgYGRvY3VtZW50LmV2YWx1YXRlYC5cbmZ1bmN0aW9uIHBsYXRmb3JtUmVzb2x2ZShwYXRoLCByb290LCByZXNvbHZlcikge1xuICBsZXQgZG9jdW1lbnQgPSBnZXREb2N1bWVudChyb290KVxuICBsZXQgciA9IGRvY3VtZW50LmV2YWx1YXRlKHBhdGgsIHJvb3QsIHJlc29sdmVyLCBGSVJTVF9PUkRFUkVEX05PREVfVFlQRSwgbnVsbClcbiAgcmV0dXJuIHIuc2luZ2xlTm9kZVZhbHVlXG59XG5cblxuLy8gRmluZCB0aGUgY2hpbGQgb2YgdGhlIGdpdmVuIG5vZGUgYnkgbmFtZSBhbmQgb3JkaW5hbCBwb3NpdGlvbi5cbmZ1bmN0aW9uIGZpbmRDaGlsZChub2RlLCBuYW1lLCBwb3NpdGlvbikge1xuICBmb3IgKG5vZGUgPSBub2RlLmZpcnN0Q2hpbGQgOyBub2RlIDsgbm9kZSA9IG5vZGUubmV4dFNpYmxpbmcpIHtcbiAgICBpZiAobm9kZU5hbWUobm9kZSkgPT09IG5hbWUgJiYgLS1wb3NpdGlvbiA9PT0gMCkgYnJlYWtcbiAgfVxuICByZXR1cm4gbm9kZVxufVxuIiwiY29uc3QgeHBhdGggPSByZXF1aXJlKCcuLi9ub2RlX21vZHVsZXMvc2ltcGxlLXhwYXRoLXBvc2l0aW9uL2xpYi94cGF0aC5qcycpO1xyXHJjb25zdCBmaXJlID0gKGV2ZW50KSA9PiB7XHIgICAgbGV0IHRhcmdldCA9IHhwYXRoLmZyb21Ob2RlKGV2ZW50LnRhcmdldCk7XHIgICAgY29uc29sZS5sb2coZXZlbnQudHlwZSwgdGFyZ2V0KTtccn07XHJccmNvbnN0IGF0dGFjaEhhbmRsZXJzID0gKCkgPT4ge1xyICAgIGxldCBldmVudFR5cGVzID0gWydjbGljaycsICdrZXlwcmVzcyddO1xyICAgIGxldCB0cmlnZ2VycyA9IHt9O1xyICAgIGV2ZW50VHlwZXMubWFwKHR5cGUgPT4gdHJpZ2dlcnNbdHlwZV0gPSBmaXJlKTtcciAgICAkKCdodG1sJykub24odHJpZ2dlcnMpO1xyfVxyXHIkKCgpID0+IHtcciAgICBhdHRhY2hIYW5kbGVycygpO1xyfSk7Il19
