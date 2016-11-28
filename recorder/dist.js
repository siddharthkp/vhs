(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('../../modules/es7.array.includes');
module.exports = require('../../modules/_core').Array.includes;
},{"../../modules/_core":7,"../../modules/es7.array.includes":31}],2:[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],3:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = require('./_wks')('unscopables')
  , ArrayProto  = Array.prototype;
if(ArrayProto[UNSCOPABLES] == undefined)require('./_hide')(ArrayProto, UNSCOPABLES, {});
module.exports = function(key){
  ArrayProto[UNSCOPABLES][key] = true;
};
},{"./_hide":16,"./_wks":30}],4:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./_is-object":19}],5:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject')
  , toLength  = require('./_to-length')
  , toIndex   = require('./_to-index');
module.exports = function(IS_INCLUDES){
  return function($this, el, fromIndex){
    var O      = toIObject($this)
      , length = toLength(O.length)
      , index  = toIndex(fromIndex, length)
      , value;
    // Array#includes uses SameValueZero equality algorithm
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    // Array#toIndex ignores holes, Array#includes - not
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};
},{"./_to-index":24,"./_to-iobject":26,"./_to-length":27}],6:[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],7:[function(require,module,exports){
var core = module.exports = {version: '2.4.0'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],8:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};
},{"./_a-function":2}],9:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],10:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_fails":13}],11:[function(require,module,exports){
var isObject = require('./_is-object')
  , document = require('./_global').document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./_global":14,"./_is-object":19}],12:[function(require,module,exports){
var global    = require('./_global')
  , core      = require('./_core')
  , hide      = require('./_hide')
  , redefine  = require('./_redefine')
  , ctx       = require('./_ctx')
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE]
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , expProto  = exports[PROTOTYPE] || (exports[PROTOTYPE] = {})
    , key, own, out, exp;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if(target)redefine(target, key, out, type & $export.U);
    // export
    if(exports[key] != out)hide(exports, key, exp);
    if(IS_PROTO && expProto[key] != out)expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library` 
module.exports = $export;
},{"./_core":7,"./_ctx":8,"./_global":14,"./_hide":16,"./_redefine":22}],13:[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],14:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],15:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],16:[function(require,module,exports){
var dP         = require('./_object-dp')
  , createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function(object, key, value){
  return dP.f(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./_descriptors":10,"./_object-dp":20,"./_property-desc":21}],17:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function(){
  return Object.defineProperty(require('./_dom-create')('div'), 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_descriptors":10,"./_dom-create":11,"./_fails":13}],18:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./_cof":6}],19:[function(require,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],20:[function(require,module,exports){
var anObject       = require('./_an-object')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , toPrimitive    = require('./_to-primitive')
  , dP             = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes){
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if(IE8_DOM_DEFINE)try {
    return dP(O, P, Attributes);
  } catch(e){ /* empty */ }
  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
  if('value' in Attributes)O[P] = Attributes.value;
  return O;
};
},{"./_an-object":4,"./_descriptors":10,"./_ie8-dom-define":17,"./_to-primitive":28}],21:[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],22:[function(require,module,exports){
var global    = require('./_global')
  , hide      = require('./_hide')
  , has       = require('./_has')
  , SRC       = require('./_uid')('src')
  , TO_STRING = 'toString'
  , $toString = Function[TO_STRING]
  , TPL       = ('' + $toString).split(TO_STRING);

require('./_core').inspectSource = function(it){
  return $toString.call(it);
};

(module.exports = function(O, key, val, safe){
  var isFunction = typeof val == 'function';
  if(isFunction)has(val, 'name') || hide(val, 'name', key);
  if(O[key] === val)return;
  if(isFunction)has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if(O === global){
    O[key] = val;
  } else {
    if(!safe){
      delete O[key];
      hide(O, key, val);
    } else {
      if(O[key])O[key] = val;
      else hide(O, key, val);
    }
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString(){
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});
},{"./_core":7,"./_global":14,"./_has":15,"./_hide":16,"./_uid":29}],23:[function(require,module,exports){
var global = require('./_global')
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./_global":14}],24:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , max       = Math.max
  , min       = Math.min;
module.exports = function(index, length){
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};
},{"./_to-integer":25}],25:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],26:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject')
  , defined = require('./_defined');
module.exports = function(it){
  return IObject(defined(it));
};
},{"./_defined":9,"./_iobject":18}],27:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer')
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"./_to-integer":25}],28:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function(it, S){
  if(!isObject(it))return it;
  var fn, val;
  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to primitive value");
};
},{"./_is-object":19}],29:[function(require,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],30:[function(require,module,exports){
var store      = require('./_shared')('wks')
  , uid        = require('./_uid')
  , Symbol     = require('./_global').Symbol
  , USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function(name){
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;
},{"./_global":14,"./_shared":23,"./_uid":29}],31:[function(require,module,exports){
'use strict';
// https://github.com/tc39/Array.prototype.includes
var $export   = require('./_export')
  , $includes = require('./_array-includes')(true);

$export($export.P, 'Array', {
  includes: function includes(el /*, fromIndex = 0 */){
    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

require('./_add-to-unscopables')('includes');
},{"./_add-to-unscopables":3,"./_array-includes":5,"./_export":12}],32:[function(require,module,exports){

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

},{}],33:[function(require,module,exports){
module.exports = require('./lib/xpath')

},{"./lib/xpath":35}],34:[function(require,module,exports){
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

},{}],35:[function(require,module,exports){
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

},{"./dom-exception":34,"get-document":32}],36:[function(require,module,exports){
/* Lib to get xpath for a DOM node */
const xpath = require('simple-xpath-position');

/* Polyfill for Array.prototype.includes */
require('core-js/fn/array/includes');

/* Whitelist of DOM events that are recorded */
const eventTypes = ['click', 'keypress'];

/* Hacky events */
const specialEventTypes = ['keydown'];

const events = [];

/* Create event handlers for each event type - call `record` function */
const getEventHandlers = () => {
    let handlers = {};
    eventTypes.map(type => handlers[type] = record);
    specialEventTypes.map(type => handlers[type] = record);
    return handlers;
};

const attachHandlers = () => {
    let handlers = getEventHandlers();
    $('html').on(handlers);
};

const detachHandlers = () => {
    let handlers = getEventHandlers();
    $('html').off(handlers);
};

const record = event => {
    /* Only record whitelisted event types */
    if (!eventTypes.includes(event.type)) {
        /* Some events like keydown need special treatment */
        if (specialEventTypes.includes(event.type)) handleHacks(event);
        return;
    }

    /*
     * We want to get the xpath of the DOM element.
     *
     * Depending on the interface, the element might or
     * might not stay in the DOM tree after the event.
     *
     * We need to hijack the event, run our code first
     * and then play the event.
     */
    if (event.preventDefault) event.preventDefault();

    /* Adding a wait before each user event */
    events.push(getWaitEvent());

    let syntheticEvent = {
        type: event.type,
        which: event.which,
        path: xpath.fromNode(event.target, document)
    };
    events.push(syntheticEvent);

    if (!event.hacky) playEvent(syntheticEvent);
};

const handleHacks = event => {
    /* The keypress event does not catch back space key */
    if (event.type === 'keydown' && event.which === 8) backspaceHack(event);
};

const backspaceHack = ({ which, target }) => {
    let customEvent = {
        type: 'keypress',
        which,
        target,
        hacky: true
    };
    record(customEvent);
};

let lastEventTimestamp;
const getWaitEvent = () => {
    let now = new Date().getTime();
    let event = {
        type: 'wait',
        /* Return time since last event */
        duration: now - lastEventTimestamp || 0
    };

    lastEventTimestamp = now;
    return event;
};

const getElement = path => {
    return xpath.toNode(path, document);
};

/* Play an event */
const playEvent = event => {
    // TODO: Simplify this function with async-await
    return new Promise(resolve => {
        /*
         * Don't want synthetic events to be recorded while when we play them.
         * We will end up in an infinite loop otherwise
        */
        detachHandlers();

        /*
        * All events return a promise which is resolved after
        * the event is completed. Useful for wait events
        */
        new Promise((resolve, reject) => {
            let type = event.type;
            // TODO: Create an event map for events
            if (type === 'click') click(event, resolve);else if (type === 'keypress') keypress(event, resolve);else if (type === 'wait') wait(event, resolve);else reject(new Error('Unknown event type. Could not play'));
        }).then(() => {
            /* Re-attach handlers after event is played */
            attachHandlers(); //TODO: Don't attach in playback mode
            resolve();
        });
    });
};

/*
 * Simulate events
 * Each handler gets the event object
 * and the resolve function for it's promise
 * resolve() must be called at the end of the function
 */

const click = ({ path }, resolve) => {
    let element = getElement(path);
    $(element).trigger('click');
    resolve();
};

const keypress = ({ path, which }, resolve) => {
    let element = getElement(path);
    let currentValue = $(element).val();
    if (which === 8) {
        /* Manually handle backspace */
        $(element).val(currentValue.substring(0, currentValue.length - 1));
    } else {
        let key = String.fromCharCode(which);
        /* Manually add charachter */
        $(element).val(currentValue + key);
    }
    /* Trigger event */
    $(element).trigger(jQuery.Event('keydown', { which }));
    $(element).trigger(jQuery.Event('keyup', { which }));
    resolve();
};

const wait = ({ duration }, resolve) => {
    setTimeout(() => resolve(), duration);
};

/* Play all recorded events */
const play = () => playEventsRecursively(0);

const playEventsRecursively = index => {
    if (!events[index]) {
        return;
    }
    playEvent(events[index]).then(() => playEventsRecursively(++index));
};

$(() => {
    /* Expose public functions */
    window.vhs = {
        play,
        events,
        record: attachHandlers,
        stop: detachHandlers //TODO: Change ambiguous name
    };
});

},{"core-js/fn/array/includes":1,"simple-xpath-position":33}]},{},[36])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9mbi9hcnJheS9pbmNsdWRlcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2EtZnVuY3Rpb24uanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hZGQtdG8tdW5zY29wYWJsZXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hbi1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hcnJheS1pbmNsdWRlcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2NvZi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2NvcmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jdHguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19kZWZpbmVkLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZGVzY3JpcHRvcnMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19kb20tY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZXhwb3J0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZmFpbHMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19nbG9iYWwuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19oYXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19oaWRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faWU4LWRvbS1kZWZpbmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faXMtb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWRwLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fcHJvcGVydHktZGVzYy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3JlZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fc2hhcmVkLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8taW5kZXguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1pbnRlZ2VyLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8taW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3RvLWxlbmd0aC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3RvLXByaW1pdGl2ZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3VpZC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3drcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3LmFycmF5LmluY2x1ZGVzLmpzIiwibm9kZV9tb2R1bGVzL2dldC1kb2N1bWVudC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUteHBhdGgtcG9zaXRpb24vaW5kZXguanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXhwYXRoLXBvc2l0aW9uL3NyYy9kb20tZXhjZXB0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS14cGF0aC1wb3NpdGlvbi9zcmMveHBhdGguanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTs7Ozs7Ozs7SUNEcUIsWSxHQUNuQixzQkFBWSxPQUFaLEVBQXFCLElBQXJCLEVBQTJCO0FBQUE7O0FBQ3pCLE9BQUssT0FBTCxHQUFlLE9BQWY7QUFDQSxPQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0EsT0FBSyxLQUFMLEdBQWMsSUFBSSxLQUFKLEVBQUQsQ0FBYyxLQUEzQjtBQUNELEM7O3FCQUxrQixZOzs7QUFRckIsYUFBYSxTQUFiLEdBQXlCLElBQUksS0FBSixFQUF6Qjs7QUFFQSxhQUFhLFNBQWIsQ0FBdUIsUUFBdkIsR0FBa0MsWUFBWTtBQUM1QyxTQUFVLEtBQUssSUFBZixVQUF3QixLQUFLLE9BQTdCO0FBQ0QsQ0FGRDs7Ozs7O1FDWWdCLFEsR0FBQSxRO1FBaUNBLE0sR0FBQSxNOztBQXZEaEI7Ozs7QUFFQTs7Ozs7O0FBRUE7QUFDQSxJQUFNLDBCQUEwQixDQUFoQzs7QUFFQTtBQUNBLElBQU0saUJBQWlCLDhCQUF2Qjs7QUFHQTs7Ozs7Ozs7Ozs7QUFXTyxTQUFTLFFBQVQsQ0FBa0IsSUFBbEIsRUFBcUM7QUFBQSxNQUFiLElBQWEseURBQU4sSUFBTTs7QUFDMUMsTUFBSSxTQUFTLFNBQWIsRUFBd0I7QUFDdEIsVUFBTSxJQUFJLEtBQUosQ0FBVSxtQ0FBVixDQUFOO0FBQ0Q7O0FBRUQsU0FBTyxRQUFRLDhCQUFZLElBQVosQ0FBZjs7QUFFQSxNQUFJLE9BQU8sR0FBWDtBQUNBLFNBQU8sU0FBUyxJQUFoQixFQUFzQjtBQUNwQixRQUFJLENBQUMsSUFBTCxFQUFXO0FBQ1QsVUFBSSxVQUFVLHNEQUFkO0FBQ0EsVUFBSSxPQUFPLHNCQUFYO0FBQ0EsWUFBTSw4QkFBaUIsT0FBakIsRUFBMEIsSUFBMUIsQ0FBTjtBQUNEO0FBQ0QsaUJBQVcsU0FBUyxJQUFULENBQVgsU0FBNkIsYUFBYSxJQUFiLENBQTdCLFNBQW1ELElBQW5EO0FBQ0EsV0FBTyxLQUFLLFVBQVo7QUFDRDtBQUNELFNBQU8sS0FBSyxPQUFMLENBQWEsS0FBYixFQUFvQixFQUFwQixDQUFQO0FBQ0Q7O0FBR0Q7Ozs7Ozs7Ozs7OztBQVlPLFNBQVMsTUFBVCxDQUFnQixJQUFoQixFQUFzQixJQUF0QixFQUE2QztBQUFBLE1BQWpCLFFBQWlCLHlEQUFOLElBQU07O0FBQ2xELE1BQUksU0FBUyxTQUFiLEVBQXdCO0FBQ3RCLFVBQU0sSUFBSSxLQUFKLENBQVUsbUNBQVYsQ0FBTjtBQUNEO0FBQ0QsTUFBSSxTQUFTLFNBQWIsRUFBd0I7QUFDdEIsVUFBTSxJQUFJLEtBQUosQ0FBVSxtQ0FBVixDQUFOO0FBQ0Q7O0FBRUQ7QUFDQSxNQUFJLFdBQVcsOEJBQVksSUFBWixDQUFmO0FBQ0EsTUFBSSxTQUFTLFFBQWIsRUFBdUIsT0FBTyxLQUFLLE9BQUwsQ0FBYSxLQUFiLEVBQW9CLElBQXBCLENBQVA7O0FBRXZCO0FBQ0EsTUFBSSxrQkFBa0IsU0FBUyxlQUEvQjtBQUNBLE1BQUksYUFBYSxJQUFiLElBQXFCLGdCQUFnQixrQkFBekMsRUFBNkQ7QUFBQTtBQUMzRCxVQUFJLFlBQVksZ0JBQWdCLGtCQUFoQixDQUFtQyxJQUFuQyxLQUE0QyxjQUE1RDtBQUNBLGlCQUFXLGtCQUFDLE1BQUQsRUFBWTtBQUNyQixZQUFJLEtBQUssRUFBQyxhQUFhLFNBQWQsRUFBVDtBQUNBLGVBQU8sR0FBRyxNQUFILEtBQWMsZ0JBQWdCLGtCQUFoQixDQUFtQyxNQUFuQyxDQUFyQjtBQUNELE9BSEQ7QUFGMkQ7QUFNNUQ7O0FBRUQsU0FBTyxRQUFRLElBQVIsRUFBYyxJQUFkLEVBQW9CLFFBQXBCLENBQVA7QUFDRDs7QUFHRDtBQUNBLFNBQVMsUUFBVCxDQUFrQixJQUFsQixFQUF3QjtBQUN0QixVQUFRLEtBQUssUUFBYjtBQUNBLFNBQUssT0FBTDtBQUFjLGFBQU8sUUFBUDtBQUNkLFNBQUssVUFBTDtBQUFpQixhQUFPLFdBQVA7QUFDakIsU0FBSyxnQkFBTDtBQUF1QixhQUFPLGlCQUFQO0FBQ3ZCO0FBQVMsYUFBTyxLQUFLLFFBQUwsQ0FBYyxXQUFkLEVBQVA7QUFKVDtBQU1EOztBQUdEO0FBQ0EsU0FBUyxZQUFULENBQXNCLElBQXRCLEVBQTRCO0FBQzFCLE1BQUksT0FBTyxLQUFLLFFBQWhCO0FBQ0EsTUFBSSxXQUFXLENBQWY7QUFDQSxTQUFRLE9BQU8sS0FBSyxlQUFwQixFQUFzQztBQUNwQyxRQUFJLEtBQUssUUFBTCxLQUFrQixJQUF0QixFQUE0QixZQUFZLENBQVo7QUFDN0I7QUFDRCxTQUFPLFFBQVA7QUFDRDs7QUFHRDtBQUNBLFNBQVMsT0FBVCxDQUFpQixJQUFqQixFQUF1QixJQUF2QixFQUE2QixRQUE3QixFQUF1QztBQUNyQyxNQUFJO0FBQ0Y7QUFDQSxRQUFJLFNBQVMsS0FBSyxPQUFMLENBQWEsOEJBQWIsRUFBNkMsZUFBN0MsQ0FBYjtBQUNBLFdBQU8sZ0JBQWdCLE1BQWhCLEVBQXdCLElBQXhCLEVBQThCLFFBQTlCLENBQVA7QUFDRCxHQUpELENBSUUsT0FBTyxHQUFQLEVBQVk7QUFDWixXQUFPLGdCQUFnQixJQUFoQixFQUFzQixJQUF0QixDQUFQO0FBQ0Q7QUFDRjs7QUFHRDtBQUNBLFNBQVMsZUFBVCxDQUF5QixJQUF6QixFQUErQixJQUEvQixFQUFxQztBQUNuQyxNQUFJLFFBQVEsS0FBSyxLQUFMLENBQVcsR0FBWCxDQUFaO0FBQ0EsTUFBSSxPQUFPLElBQVg7QUFDQSxTQUFPLElBQVAsRUFBYTtBQUNYLFFBQUksT0FBTyxNQUFNLEtBQU4sRUFBWDtBQUNBLFFBQUksU0FBUyxTQUFiLEVBQXdCO0FBQ3hCLFFBQUksU0FBUyxHQUFiLEVBQWtCOztBQUhQLHNCQUlZLEtBQUssS0FBTCxDQUFXLFFBQVgsQ0FKWjs7QUFBQSxRQUlOLElBSk07QUFBQSxRQUlBLFFBSkE7O0FBS1gsV0FBTyxLQUFLLE9BQUwsQ0FBYSxZQUFiLEVBQTJCLEVBQTNCLENBQVA7QUFDQSxlQUFXLFdBQVcsU0FBUyxRQUFULENBQVgsR0FBZ0MsQ0FBM0M7QUFDQSxXQUFPLFVBQVUsSUFBVixFQUFnQixJQUFoQixFQUFzQixRQUF0QixDQUFQO0FBQ0Q7QUFDRCxTQUFPLElBQVA7QUFDRDs7QUFHRDtBQUNBLFNBQVMsZUFBVCxDQUF5QixJQUF6QixFQUErQixJQUEvQixFQUFxQyxRQUFyQyxFQUErQztBQUM3QyxNQUFJLFdBQVcsOEJBQVksSUFBWixDQUFmO0FBQ0EsTUFBSSxJQUFJLFNBQVMsUUFBVCxDQUFrQixJQUFsQixFQUF3QixJQUF4QixFQUE4QixRQUE5QixFQUF3Qyx1QkFBeEMsRUFBaUUsSUFBakUsQ0FBUjtBQUNBLFNBQU8sRUFBRSxlQUFUO0FBQ0Q7O0FBR0Q7QUFDQSxTQUFTLFNBQVQsQ0FBbUIsSUFBbkIsRUFBeUIsSUFBekIsRUFBK0IsUUFBL0IsRUFBeUM7QUFDdkMsT0FBSyxPQUFPLEtBQUssVUFBakIsRUFBOEIsSUFBOUIsRUFBcUMsT0FBTyxLQUFLLFdBQWpELEVBQThEO0FBQzVELFFBQUksU0FBUyxJQUFULE1BQW1CLElBQW5CLElBQTJCLEVBQUUsUUFBRixLQUFlLENBQTlDLEVBQWlEO0FBQ2xEO0FBQ0QsU0FBTyxJQUFQO0FBQ0Q7OztBQ2xKRDtBQUNBLE1BQU0sUUFBUSxRQUFRLHVCQUFSLENBQWQ7O0FBRUE7QUFDQSxRQUFRLDJCQUFSOztBQUVBO0FBQ0EsTUFBTSxhQUFhLENBQUMsT0FBRCxFQUFVLFVBQVYsQ0FBbkI7O0FBRUE7QUFDQSxNQUFNLG9CQUFvQixDQUFDLFNBQUQsQ0FBMUI7O0FBRUEsTUFBTSxTQUFTLEVBQWY7O0FBRUE7QUFDQSxNQUFNLG1CQUFtQixNQUFNO0FBQzNCLFFBQUksV0FBVyxFQUFmO0FBQ0EsZUFBVyxHQUFYLENBQWUsUUFBUSxTQUFTLElBQVQsSUFBaUIsTUFBeEM7QUFDQSxzQkFBa0IsR0FBbEIsQ0FBc0IsUUFBUSxTQUFTLElBQVQsSUFBaUIsTUFBL0M7QUFDQSxXQUFPLFFBQVA7QUFDSCxDQUxEOztBQU9BLE1BQU0saUJBQWlCLE1BQU07QUFDekIsUUFBSSxXQUFXLGtCQUFmO0FBQ0EsTUFBRSxNQUFGLEVBQVUsRUFBVixDQUFhLFFBQWI7QUFDSCxDQUhEOztBQUtBLE1BQU0saUJBQWlCLE1BQU07QUFDekIsUUFBSSxXQUFXLGtCQUFmO0FBQ0EsTUFBRSxNQUFGLEVBQVUsR0FBVixDQUFjLFFBQWQ7QUFDSCxDQUhEOztBQUtBLE1BQU0sU0FBVSxLQUFELElBQVc7QUFDdEI7QUFDQSxRQUFJLENBQUMsV0FBVyxRQUFYLENBQW9CLE1BQU0sSUFBMUIsQ0FBTCxFQUFzQztBQUNsQztBQUNBLFlBQUksa0JBQWtCLFFBQWxCLENBQTJCLE1BQU0sSUFBakMsQ0FBSixFQUE0QyxZQUFZLEtBQVo7QUFDNUM7QUFDSDs7QUFFRDs7Ozs7Ozs7O0FBU0EsUUFBSSxNQUFNLGNBQVYsRUFBMEIsTUFBTSxjQUFOOztBQUUxQjtBQUNBLFdBQU8sSUFBUCxDQUFZLGNBQVo7O0FBRUEsUUFBSSxpQkFBaUI7QUFDakIsY0FBTSxNQUFNLElBREs7QUFFakIsZUFBTyxNQUFNLEtBRkk7QUFHakIsY0FBTSxNQUFNLFFBQU4sQ0FBZSxNQUFNLE1BQXJCLEVBQTZCLFFBQTdCO0FBSFcsS0FBckI7QUFLQSxXQUFPLElBQVAsQ0FBWSxjQUFaOztBQUVBLFFBQUksQ0FBQyxNQUFNLEtBQVgsRUFBa0IsVUFBVSxjQUFWO0FBQ3JCLENBOUJEOztBQWdDQSxNQUFNLGNBQWUsS0FBRCxJQUFXO0FBQzNCO0FBQ0EsUUFBSSxNQUFNLElBQU4sS0FBZSxTQUFmLElBQTRCLE1BQU0sS0FBTixLQUFnQixDQUFoRCxFQUFtRCxjQUFjLEtBQWQ7QUFDdEQsQ0FIRDs7QUFLQSxNQUFNLGdCQUFnQixDQUFDLEVBQUMsS0FBRCxFQUFRLE1BQVIsRUFBRCxLQUFxQjtBQUN2QyxRQUFJLGNBQWM7QUFDZCxjQUFNLFVBRFE7QUFFZCxhQUZjO0FBR2QsY0FIYztBQUlkLGVBQU87QUFKTyxLQUFsQjtBQU1BLFdBQU8sV0FBUDtBQUNILENBUkQ7O0FBVUEsSUFBSSxrQkFBSjtBQUNBLE1BQU0sZUFBZSxNQUFNO0FBQ3ZCLFFBQUksTUFBTSxJQUFJLElBQUosR0FBVyxPQUFYLEVBQVY7QUFDQSxRQUFJLFFBQVE7QUFDUixjQUFNLE1BREU7QUFFUjtBQUNBLGtCQUFXLE1BQU0sa0JBQVAsSUFBOEI7QUFIaEMsS0FBWjs7QUFNQSx5QkFBcUIsR0FBckI7QUFDQSxXQUFPLEtBQVA7QUFDSCxDQVZEOztBQVlBLE1BQU0sYUFBYyxJQUFELElBQVU7QUFDekIsV0FBTyxNQUFNLE1BQU4sQ0FBYSxJQUFiLEVBQW1CLFFBQW5CLENBQVA7QUFDSCxDQUZEOztBQUlBO0FBQ0EsTUFBTSxZQUFhLEtBQUQsSUFBVztBQUN6QjtBQUNBLFdBQU8sSUFBSSxPQUFKLENBQVksV0FBVztBQUMxQjs7OztBQUlBOztBQUVBOzs7O0FBSUEsWUFBSSxPQUFKLENBQVksQ0FBQyxPQUFELEVBQVUsTUFBVixLQUFxQjtBQUM3QixnQkFBSSxPQUFPLE1BQU0sSUFBakI7QUFDQTtBQUNBLGdCQUFJLFNBQVMsT0FBYixFQUFzQixNQUFNLEtBQU4sRUFBYSxPQUFiLEVBQXRCLEtBQ0ssSUFBSSxTQUFTLFVBQWIsRUFBeUIsU0FBUyxLQUFULEVBQWdCLE9BQWhCLEVBQXpCLEtBQ0EsSUFBSSxTQUFTLE1BQWIsRUFBcUIsS0FBSyxLQUFMLEVBQVksT0FBWixFQUFyQixLQUNBLE9BQU8sSUFBSSxLQUFKLENBQVUsb0NBQVYsQ0FBUDtBQUNSLFNBUEQsRUFPRyxJQVBILENBT1EsTUFBTTtBQUNWO0FBQ0EsNkJBRlUsQ0FFUTtBQUNsQjtBQUNILFNBWEQ7QUFZSCxLQXZCTSxDQUFQO0FBd0JILENBMUJEOztBQTRCQTs7Ozs7OztBQU9BLE1BQU0sUUFBUSxDQUFDLEVBQUMsSUFBRCxFQUFELEVBQVMsT0FBVCxLQUFxQjtBQUMvQixRQUFJLFVBQVUsV0FBVyxJQUFYLENBQWQ7QUFDQSxNQUFFLE9BQUYsRUFBVyxPQUFYLENBQW1CLE9BQW5CO0FBQ0E7QUFDSCxDQUpEOztBQU1BLE1BQU0sV0FBVyxDQUFDLEVBQUMsSUFBRCxFQUFPLEtBQVAsRUFBRCxFQUFlLE9BQWYsS0FBMkI7QUFDeEMsUUFBSSxVQUFVLFdBQVcsSUFBWCxDQUFkO0FBQ0EsUUFBSSxlQUFlLEVBQUUsT0FBRixFQUFXLEdBQVgsRUFBbkI7QUFDQSxRQUFJLFVBQVUsQ0FBZCxFQUFpQjtBQUNiO0FBQ0EsVUFBRSxPQUFGLEVBQVcsR0FBWCxDQUFlLGFBQWEsU0FBYixDQUF1QixDQUF2QixFQUEwQixhQUFhLE1BQWIsR0FBb0IsQ0FBOUMsQ0FBZjtBQUNILEtBSEQsTUFHTztBQUNILFlBQUksTUFBTSxPQUFPLFlBQVAsQ0FBb0IsS0FBcEIsQ0FBVjtBQUNBO0FBQ0EsVUFBRSxPQUFGLEVBQVcsR0FBWCxDQUFlLGVBQWUsR0FBOUI7QUFDSDtBQUNEO0FBQ0EsTUFBRSxPQUFGLEVBQVcsT0FBWCxDQUFtQixPQUFPLEtBQVAsQ0FBYSxTQUFiLEVBQXdCLEVBQUMsS0FBRCxFQUF4QixDQUFuQjtBQUNBLE1BQUUsT0FBRixFQUFXLE9BQVgsQ0FBbUIsT0FBTyxLQUFQLENBQWEsT0FBYixFQUFzQixFQUFDLEtBQUQsRUFBdEIsQ0FBbkI7QUFDQTtBQUNILENBZkQ7O0FBaUJBLE1BQU0sT0FBTyxDQUFDLEVBQUMsUUFBRCxFQUFELEVBQWEsT0FBYixLQUF5QjtBQUNsQyxlQUFXLE1BQU0sU0FBakIsRUFBNEIsUUFBNUI7QUFDSCxDQUZEOztBQUlBO0FBQ0EsTUFBTSxPQUFPLE1BQU0sc0JBQXNCLENBQXRCLENBQW5COztBQUVBLE1BQU0sd0JBQXlCLEtBQUQsSUFBVztBQUNyQyxRQUFJLENBQUMsT0FBTyxLQUFQLENBQUwsRUFBb0I7QUFDaEI7QUFDSDtBQUNELGNBQVUsT0FBTyxLQUFQLENBQVYsRUFBeUIsSUFBekIsQ0FBOEIsTUFBTSxzQkFBc0IsRUFBRSxLQUF4QixDQUFwQztBQUNILENBTEQ7O0FBT0EsRUFBRSxNQUFNO0FBQ0o7QUFDQSxXQUFPLEdBQVAsR0FBYTtBQUNULFlBRFM7QUFFVCxjQUZTO0FBR1QsZ0JBQVEsY0FIQztBQUlULGNBQU0sY0FKRyxDQUlZO0FBSlosS0FBYjtBQU1ILENBUkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczcuYXJyYXkuaW5jbHVkZXMnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLkFycmF5LmluY2x1ZGVzOyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZih0eXBlb2YgaXQgIT0gJ2Z1bmN0aW9uJyl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uIScpO1xuICByZXR1cm4gaXQ7XG59OyIsIi8vIDIyLjEuMy4zMSBBcnJheS5wcm90b3R5cGVbQEB1bnNjb3BhYmxlc11cbnZhciBVTlNDT1BBQkxFUyA9IHJlcXVpcmUoJy4vX3drcycpKCd1bnNjb3BhYmxlcycpXG4gICwgQXJyYXlQcm90byAgPSBBcnJheS5wcm90b3R5cGU7XG5pZihBcnJheVByb3RvW1VOU0NPUEFCTEVTXSA9PSB1bmRlZmluZWQpcmVxdWlyZSgnLi9faGlkZScpKEFycmF5UHJvdG8sIFVOU0NPUEFCTEVTLCB7fSk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGtleSl7XG4gIEFycmF5UHJvdG9bVU5TQ09QQUJMRVNdW2tleV0gPSB0cnVlO1xufTsiLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZighaXNPYmplY3QoaXQpKXRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGFuIG9iamVjdCEnKTtcbiAgcmV0dXJuIGl0O1xufTsiLCIvLyBmYWxzZSAtPiBBcnJheSNpbmRleE9mXG4vLyB0cnVlICAtPiBBcnJheSNpbmNsdWRlc1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKVxuICAsIHRvTGVuZ3RoICA9IHJlcXVpcmUoJy4vX3RvLWxlbmd0aCcpXG4gICwgdG9JbmRleCAgID0gcmVxdWlyZSgnLi9fdG8taW5kZXgnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oSVNfSU5DTFVERVMpe1xuICByZXR1cm4gZnVuY3Rpb24oJHRoaXMsIGVsLCBmcm9tSW5kZXgpe1xuICAgIHZhciBPICAgICAgPSB0b0lPYmplY3QoJHRoaXMpXG4gICAgICAsIGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKVxuICAgICAgLCBpbmRleCAgPSB0b0luZGV4KGZyb21JbmRleCwgbGVuZ3RoKVxuICAgICAgLCB2YWx1ZTtcbiAgICAvLyBBcnJheSNpbmNsdWRlcyB1c2VzIFNhbWVWYWx1ZVplcm8gZXF1YWxpdHkgYWxnb3JpdGhtXG4gICAgaWYoSVNfSU5DTFVERVMgJiYgZWwgIT0gZWwpd2hpbGUobGVuZ3RoID4gaW5kZXgpe1xuICAgICAgdmFsdWUgPSBPW2luZGV4KytdO1xuICAgICAgaWYodmFsdWUgIT0gdmFsdWUpcmV0dXJuIHRydWU7XG4gICAgLy8gQXJyYXkjdG9JbmRleCBpZ25vcmVzIGhvbGVzLCBBcnJheSNpbmNsdWRlcyAtIG5vdFxuICAgIH0gZWxzZSBmb3IoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKWlmKElTX0lOQ0xVREVTIHx8IGluZGV4IGluIE8pe1xuICAgICAgaWYoT1tpbmRleF0gPT09IGVsKXJldHVybiBJU19JTkNMVURFUyB8fCBpbmRleCB8fCAwO1xuICAgIH0gcmV0dXJuICFJU19JTkNMVURFUyAmJiAtMTtcbiAgfTtcbn07IiwidmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbChpdCkuc2xpY2UoOCwgLTEpO1xufTsiLCJ2YXIgY29yZSA9IG1vZHVsZS5leHBvcnRzID0ge3ZlcnNpb246ICcyLjQuMCd9O1xuaWYodHlwZW9mIF9fZSA9PSAnbnVtYmVyJylfX2UgPSBjb3JlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmIiwiLy8gb3B0aW9uYWwgLyBzaW1wbGUgY29udGV4dCBiaW5kaW5nXG52YXIgYUZ1bmN0aW9uID0gcmVxdWlyZSgnLi9fYS1mdW5jdGlvbicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmbiwgdGhhdCwgbGVuZ3RoKXtcbiAgYUZ1bmN0aW9uKGZuKTtcbiAgaWYodGhhdCA9PT0gdW5kZWZpbmVkKXJldHVybiBmbjtcbiAgc3dpdGNoKGxlbmd0aCl7XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24oYSl7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhKTtcbiAgICB9O1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYik7XG4gICAgfTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbihhLCBiLCBjKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIsIGMpO1xuICAgIH07XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKC8qIC4uLmFyZ3MgKi8pe1xuICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xuICB9O1xufTsiLCIvLyA3LjIuMSBSZXF1aXJlT2JqZWN0Q29lcmNpYmxlKGFyZ3VtZW50KVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIGlmKGl0ID09IHVuZGVmaW5lZCl0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjYWxsIG1ldGhvZCBvbiAgXCIgKyBpdCk7XG4gIHJldHVybiBpdDtcbn07IiwiLy8gVGhhbmsncyBJRTggZm9yIGhpcyBmdW5ueSBkZWZpbmVQcm9wZXJ0eVxubW9kdWxlLmV4cG9ydHMgPSAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbigpe1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAnYScsIHtnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiA3OyB9fSkuYSAhPSA3O1xufSk7IiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0JylcbiAgLCBkb2N1bWVudCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLmRvY3VtZW50XG4gIC8vIGluIG9sZCBJRSB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBpcyAnb2JqZWN0J1xuICAsIGlzID0gaXNPYmplY3QoZG9jdW1lbnQpICYmIGlzT2JqZWN0KGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpcyA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoaXQpIDoge307XG59OyIsInZhciBnbG9iYWwgICAgPSByZXF1aXJlKCcuL19nbG9iYWwnKVxuICAsIGNvcmUgICAgICA9IHJlcXVpcmUoJy4vX2NvcmUnKVxuICAsIGhpZGUgICAgICA9IHJlcXVpcmUoJy4vX2hpZGUnKVxuICAsIHJlZGVmaW5lICA9IHJlcXVpcmUoJy4vX3JlZGVmaW5lJylcbiAgLCBjdHggICAgICAgPSByZXF1aXJlKCcuL19jdHgnKVxuICAsIFBST1RPVFlQRSA9ICdwcm90b3R5cGUnO1xuXG52YXIgJGV4cG9ydCA9IGZ1bmN0aW9uKHR5cGUsIG5hbWUsIHNvdXJjZSl7XG4gIHZhciBJU19GT1JDRUQgPSB0eXBlICYgJGV4cG9ydC5GXG4gICAgLCBJU19HTE9CQUwgPSB0eXBlICYgJGV4cG9ydC5HXG4gICAgLCBJU19TVEFUSUMgPSB0eXBlICYgJGV4cG9ydC5TXG4gICAgLCBJU19QUk9UTyAgPSB0eXBlICYgJGV4cG9ydC5QXG4gICAgLCBJU19CSU5EICAgPSB0eXBlICYgJGV4cG9ydC5CXG4gICAgLCB0YXJnZXQgICAgPSBJU19HTE9CQUwgPyBnbG9iYWwgOiBJU19TVEFUSUMgPyBnbG9iYWxbbmFtZV0gfHwgKGdsb2JhbFtuYW1lXSA9IHt9KSA6IChnbG9iYWxbbmFtZV0gfHwge30pW1BST1RPVFlQRV1cbiAgICAsIGV4cG9ydHMgICA9IElTX0dMT0JBTCA/IGNvcmUgOiBjb3JlW25hbWVdIHx8IChjb3JlW25hbWVdID0ge30pXG4gICAgLCBleHBQcm90byAgPSBleHBvcnRzW1BST1RPVFlQRV0gfHwgKGV4cG9ydHNbUFJPVE9UWVBFXSA9IHt9KVxuICAgICwga2V5LCBvd24sIG91dCwgZXhwO1xuICBpZihJU19HTE9CQUwpc291cmNlID0gbmFtZTtcbiAgZm9yKGtleSBpbiBzb3VyY2Upe1xuICAgIC8vIGNvbnRhaW5zIGluIG5hdGl2ZVxuICAgIG93biA9ICFJU19GT1JDRUQgJiYgdGFyZ2V0ICYmIHRhcmdldFtrZXldICE9PSB1bmRlZmluZWQ7XG4gICAgLy8gZXhwb3J0IG5hdGl2ZSBvciBwYXNzZWRcbiAgICBvdXQgPSAob3duID8gdGFyZ2V0IDogc291cmNlKVtrZXldO1xuICAgIC8vIGJpbmQgdGltZXJzIHRvIGdsb2JhbCBmb3IgY2FsbCBmcm9tIGV4cG9ydCBjb250ZXh0XG4gICAgZXhwID0gSVNfQklORCAmJiBvd24gPyBjdHgob3V0LCBnbG9iYWwpIDogSVNfUFJPVE8gJiYgdHlwZW9mIG91dCA9PSAnZnVuY3Rpb24nID8gY3R4KEZ1bmN0aW9uLmNhbGwsIG91dCkgOiBvdXQ7XG4gICAgLy8gZXh0ZW5kIGdsb2JhbFxuICAgIGlmKHRhcmdldClyZWRlZmluZSh0YXJnZXQsIGtleSwgb3V0LCB0eXBlICYgJGV4cG9ydC5VKTtcbiAgICAvLyBleHBvcnRcbiAgICBpZihleHBvcnRzW2tleV0gIT0gb3V0KWhpZGUoZXhwb3J0cywga2V5LCBleHApO1xuICAgIGlmKElTX1BST1RPICYmIGV4cFByb3RvW2tleV0gIT0gb3V0KWV4cFByb3RvW2tleV0gPSBvdXQ7XG4gIH1cbn07XG5nbG9iYWwuY29yZSA9IGNvcmU7XG4vLyB0eXBlIGJpdG1hcFxuJGV4cG9ydC5GID0gMTsgICAvLyBmb3JjZWRcbiRleHBvcnQuRyA9IDI7ICAgLy8gZ2xvYmFsXG4kZXhwb3J0LlMgPSA0OyAgIC8vIHN0YXRpY1xuJGV4cG9ydC5QID0gODsgICAvLyBwcm90b1xuJGV4cG9ydC5CID0gMTY7ICAvLyBiaW5kXG4kZXhwb3J0LlcgPSAzMjsgIC8vIHdyYXBcbiRleHBvcnQuVSA9IDY0OyAgLy8gc2FmZVxuJGV4cG9ydC5SID0gMTI4OyAvLyByZWFsIHByb3RvIG1ldGhvZCBmb3IgYGxpYnJhcnlgIFxubW9kdWxlLmV4cG9ydHMgPSAkZXhwb3J0OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZXhlYyl7XG4gIHRyeSB7XG4gICAgcmV0dXJuICEhZXhlYygpO1xuICB9IGNhdGNoKGUpe1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59OyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy84NiNpc3N1ZWNvbW1lbnQtMTE1NzU5MDI4XG52YXIgZ2xvYmFsID0gbW9kdWxlLmV4cG9ydHMgPSB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnICYmIHdpbmRvdy5NYXRoID09IE1hdGhcbiAgPyB3aW5kb3cgOiB0eXBlb2Ygc2VsZiAhPSAndW5kZWZpbmVkJyAmJiBzZWxmLk1hdGggPT0gTWF0aCA/IHNlbGYgOiBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuaWYodHlwZW9mIF9fZyA9PSAnbnVtYmVyJylfX2cgPSBnbG9iYWw7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWYiLCJ2YXIgaGFzT3duUHJvcGVydHkgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQsIGtleSl7XG4gIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGl0LCBrZXkpO1xufTsiLCJ2YXIgZFAgICAgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpXG4gICwgY3JlYXRlRGVzYyA9IHJlcXVpcmUoJy4vX3Byb3BlcnR5LWRlc2MnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IGZ1bmN0aW9uKG9iamVjdCwga2V5LCB2YWx1ZSl7XG4gIHJldHVybiBkUC5mKG9iamVjdCwga2V5LCBjcmVhdGVEZXNjKDEsIHZhbHVlKSk7XG59IDogZnVuY3Rpb24ob2JqZWN0LCBrZXksIHZhbHVlKXtcbiAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgcmV0dXJuIG9iamVjdDtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSAhcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSAmJiAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbigpe1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHJlcXVpcmUoJy4vX2RvbS1jcmVhdGUnKSgnZGl2JyksICdhJywge2dldDogZnVuY3Rpb24oKXsgcmV0dXJuIDc7IH19KS5hICE9IDc7XG59KTsiLCIvLyBmYWxsYmFjayBmb3Igbm9uLWFycmF5LWxpa2UgRVMzIGFuZCBub24tZW51bWVyYWJsZSBvbGQgVjggc3RyaW5nc1xudmFyIGNvZiA9IHJlcXVpcmUoJy4vX2NvZicpO1xubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QoJ3onKS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgwKSA/IE9iamVjdCA6IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGNvZihpdCkgPT0gJ1N0cmluZycgPyBpdC5zcGxpdCgnJykgOiBPYmplY3QoaXQpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PT0gJ29iamVjdCcgPyBpdCAhPT0gbnVsbCA6IHR5cGVvZiBpdCA9PT0gJ2Z1bmN0aW9uJztcbn07IiwidmFyIGFuT2JqZWN0ICAgICAgID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0JylcbiAgLCBJRThfRE9NX0RFRklORSA9IHJlcXVpcmUoJy4vX2llOC1kb20tZGVmaW5lJylcbiAgLCB0b1ByaW1pdGl2ZSAgICA9IHJlcXVpcmUoJy4vX3RvLXByaW1pdGl2ZScpXG4gICwgZFAgICAgICAgICAgICAgPSBPYmplY3QuZGVmaW5lUHJvcGVydHk7XG5cbmV4cG9ydHMuZiA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBPYmplY3QuZGVmaW5lUHJvcGVydHkgOiBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShPLCBQLCBBdHRyaWJ1dGVzKXtcbiAgYW5PYmplY3QoTyk7XG4gIFAgPSB0b1ByaW1pdGl2ZShQLCB0cnVlKTtcbiAgYW5PYmplY3QoQXR0cmlidXRlcyk7XG4gIGlmKElFOF9ET01fREVGSU5FKXRyeSB7XG4gICAgcmV0dXJuIGRQKE8sIFAsIEF0dHJpYnV0ZXMpO1xuICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG4gIGlmKCdnZXQnIGluIEF0dHJpYnV0ZXMgfHwgJ3NldCcgaW4gQXR0cmlidXRlcyl0aHJvdyBUeXBlRXJyb3IoJ0FjY2Vzc29ycyBub3Qgc3VwcG9ydGVkIScpO1xuICBpZigndmFsdWUnIGluIEF0dHJpYnV0ZXMpT1tQXSA9IEF0dHJpYnV0ZXMudmFsdWU7XG4gIHJldHVybiBPO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGJpdG1hcCwgdmFsdWUpe1xuICByZXR1cm4ge1xuICAgIGVudW1lcmFibGUgIDogIShiaXRtYXAgJiAxKSxcbiAgICBjb25maWd1cmFibGU6ICEoYml0bWFwICYgMiksXG4gICAgd3JpdGFibGUgICAgOiAhKGJpdG1hcCAmIDQpLFxuICAgIHZhbHVlICAgICAgIDogdmFsdWVcbiAgfTtcbn07IiwidmFyIGdsb2JhbCAgICA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpXG4gICwgaGlkZSAgICAgID0gcmVxdWlyZSgnLi9faGlkZScpXG4gICwgaGFzICAgICAgID0gcmVxdWlyZSgnLi9faGFzJylcbiAgLCBTUkMgICAgICAgPSByZXF1aXJlKCcuL191aWQnKSgnc3JjJylcbiAgLCBUT19TVFJJTkcgPSAndG9TdHJpbmcnXG4gICwgJHRvU3RyaW5nID0gRnVuY3Rpb25bVE9fU1RSSU5HXVxuICAsIFRQTCAgICAgICA9ICgnJyArICR0b1N0cmluZykuc3BsaXQoVE9fU1RSSU5HKTtcblxucmVxdWlyZSgnLi9fY29yZScpLmluc3BlY3RTb3VyY2UgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiAkdG9TdHJpbmcuY2FsbChpdCk7XG59O1xuXG4obW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihPLCBrZXksIHZhbCwgc2FmZSl7XG4gIHZhciBpc0Z1bmN0aW9uID0gdHlwZW9mIHZhbCA9PSAnZnVuY3Rpb24nO1xuICBpZihpc0Z1bmN0aW9uKWhhcyh2YWwsICduYW1lJykgfHwgaGlkZSh2YWwsICduYW1lJywga2V5KTtcbiAgaWYoT1trZXldID09PSB2YWwpcmV0dXJuO1xuICBpZihpc0Z1bmN0aW9uKWhhcyh2YWwsIFNSQykgfHwgaGlkZSh2YWwsIFNSQywgT1trZXldID8gJycgKyBPW2tleV0gOiBUUEwuam9pbihTdHJpbmcoa2V5KSkpO1xuICBpZihPID09PSBnbG9iYWwpe1xuICAgIE9ba2V5XSA9IHZhbDtcbiAgfSBlbHNlIHtcbiAgICBpZighc2FmZSl7XG4gICAgICBkZWxldGUgT1trZXldO1xuICAgICAgaGlkZShPLCBrZXksIHZhbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmKE9ba2V5XSlPW2tleV0gPSB2YWw7XG4gICAgICBlbHNlIGhpZGUoTywga2V5LCB2YWwpO1xuICAgIH1cbiAgfVxuLy8gYWRkIGZha2UgRnVuY3Rpb24jdG9TdHJpbmcgZm9yIGNvcnJlY3Qgd29yayB3cmFwcGVkIG1ldGhvZHMgLyBjb25zdHJ1Y3RvcnMgd2l0aCBtZXRob2RzIGxpa2UgTG9EYXNoIGlzTmF0aXZlXG59KShGdW5jdGlvbi5wcm90b3R5cGUsIFRPX1NUUklORywgZnVuY3Rpb24gdG9TdHJpbmcoKXtcbiAgcmV0dXJuIHR5cGVvZiB0aGlzID09ICdmdW5jdGlvbicgJiYgdGhpc1tTUkNdIHx8ICR0b1N0cmluZy5jYWxsKHRoaXMpO1xufSk7IiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpXG4gICwgU0hBUkVEID0gJ19fY29yZS1qc19zaGFyZWRfXydcbiAgLCBzdG9yZSAgPSBnbG9iYWxbU0hBUkVEXSB8fCAoZ2xvYmFsW1NIQVJFRF0gPSB7fSk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGtleSl7XG4gIHJldHVybiBzdG9yZVtrZXldIHx8IChzdG9yZVtrZXldID0ge30pO1xufTsiLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpXG4gICwgbWF4ICAgICAgID0gTWF0aC5tYXhcbiAgLCBtaW4gICAgICAgPSBNYXRoLm1pbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaW5kZXgsIGxlbmd0aCl7XG4gIGluZGV4ID0gdG9JbnRlZ2VyKGluZGV4KTtcbiAgcmV0dXJuIGluZGV4IDwgMCA/IG1heChpbmRleCArIGxlbmd0aCwgMCkgOiBtaW4oaW5kZXgsIGxlbmd0aCk7XG59OyIsIi8vIDcuMS40IFRvSW50ZWdlclxudmFyIGNlaWwgID0gTWF0aC5jZWlsXG4gICwgZmxvb3IgPSBNYXRoLmZsb29yO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpc05hTihpdCA9ICtpdCkgPyAwIDogKGl0ID4gMCA/IGZsb29yIDogY2VpbCkoaXQpO1xufTsiLCIvLyB0byBpbmRleGVkIG9iamVjdCwgdG9PYmplY3Qgd2l0aCBmYWxsYmFjayBmb3Igbm9uLWFycmF5LWxpa2UgRVMzIHN0cmluZ3NcbnZhciBJT2JqZWN0ID0gcmVxdWlyZSgnLi9faW9iamVjdCcpXG4gICwgZGVmaW5lZCA9IHJlcXVpcmUoJy4vX2RlZmluZWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gSU9iamVjdChkZWZpbmVkKGl0KSk7XG59OyIsIi8vIDcuMS4xNSBUb0xlbmd0aFxudmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vX3RvLWludGVnZXInKVxuICAsIG1pbiAgICAgICA9IE1hdGgubWluO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpdCA+IDAgPyBtaW4odG9JbnRlZ2VyKGl0KSwgMHgxZmZmZmZmZmZmZmZmZikgOiAwOyAvLyBwb3coMiwgNTMpIC0gMSA9PSA5MDA3MTk5MjU0NzQwOTkxXG59OyIsIi8vIDcuMS4xIFRvUHJpbWl0aXZlKGlucHV0IFssIFByZWZlcnJlZFR5cGVdKVxudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG4vLyBpbnN0ZWFkIG9mIHRoZSBFUzYgc3BlYyB2ZXJzaW9uLCB3ZSBkaWRuJ3QgaW1wbGVtZW50IEBAdG9QcmltaXRpdmUgY2FzZVxuLy8gYW5kIHRoZSBzZWNvbmQgYXJndW1lbnQgLSBmbGFnIC0gcHJlZmVycmVkIHR5cGUgaXMgYSBzdHJpbmdcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQsIFMpe1xuICBpZighaXNPYmplY3QoaXQpKXJldHVybiBpdDtcbiAgdmFyIGZuLCB2YWw7XG4gIGlmKFMgJiYgdHlwZW9mIChmbiA9IGl0LnRvU3RyaW5nKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpcmV0dXJuIHZhbDtcbiAgaWYodHlwZW9mIChmbiA9IGl0LnZhbHVlT2YpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSlyZXR1cm4gdmFsO1xuICBpZighUyAmJiB0eXBlb2YgKGZuID0gaXQudG9TdHJpbmcpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSlyZXR1cm4gdmFsO1xuICB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjb252ZXJ0IG9iamVjdCB0byBwcmltaXRpdmUgdmFsdWVcIik7XG59OyIsInZhciBpZCA9IDBcbiAgLCBweCA9IE1hdGgucmFuZG9tKCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGtleSl7XG4gIHJldHVybiAnU3ltYm9sKCcuY29uY2F0KGtleSA9PT0gdW5kZWZpbmVkID8gJycgOiBrZXksICcpXycsICgrK2lkICsgcHgpLnRvU3RyaW5nKDM2KSk7XG59OyIsInZhciBzdG9yZSAgICAgID0gcmVxdWlyZSgnLi9fc2hhcmVkJykoJ3drcycpXG4gICwgdWlkICAgICAgICA9IHJlcXVpcmUoJy4vX3VpZCcpXG4gICwgU3ltYm9sICAgICA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLlN5bWJvbFxuICAsIFVTRV9TWU1CT0wgPSB0eXBlb2YgU3ltYm9sID09ICdmdW5jdGlvbic7XG5cbnZhciAkZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmFtZSl7XG4gIHJldHVybiBzdG9yZVtuYW1lXSB8fCAoc3RvcmVbbmFtZV0gPVxuICAgIFVTRV9TWU1CT0wgJiYgU3ltYm9sW25hbWVdIHx8IChVU0VfU1lNQk9MID8gU3ltYm9sIDogdWlkKSgnU3ltYm9sLicgKyBuYW1lKSk7XG59O1xuXG4kZXhwb3J0cy5zdG9yZSA9IHN0b3JlOyIsIid1c2Ugc3RyaWN0Jztcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS90YzM5L0FycmF5LnByb3RvdHlwZS5pbmNsdWRlc1xudmFyICRleHBvcnQgICA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpXG4gICwgJGluY2x1ZGVzID0gcmVxdWlyZSgnLi9fYXJyYXktaW5jbHVkZXMnKSh0cnVlKTtcblxuJGV4cG9ydCgkZXhwb3J0LlAsICdBcnJheScsIHtcbiAgaW5jbHVkZXM6IGZ1bmN0aW9uIGluY2x1ZGVzKGVsIC8qLCBmcm9tSW5kZXggPSAwICovKXtcbiAgICByZXR1cm4gJGluY2x1ZGVzKHRoaXMsIGVsLCBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZCk7XG4gIH1cbn0pO1xuXG5yZXF1aXJlKCcuL19hZGQtdG8tdW5zY29wYWJsZXMnKSgnaW5jbHVkZXMnKTsiLCJcbi8qKlxuICogTW9kdWxlIGV4cG9ydHMuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBnZXREb2N1bWVudDtcblxuLy8gZGVmaW5lZCBieSB3M2NcbnZhciBET0NVTUVOVF9OT0RFID0gOTtcblxuLyoqXG4gKiBSZXR1cm5zIGB0cnVlYCBpZiBgd2AgaXMgYSBEb2N1bWVudCBvYmplY3QsIG9yIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICpcbiAqIEBwYXJhbSB7P30gZCAtIERvY3VtZW50IG9iamVjdCwgbWF5YmVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzRG9jdW1lbnQgKGQpIHtcbiAgcmV0dXJuIGQgJiYgZC5ub2RlVHlwZSA9PT0gRE9DVU1FTlRfTk9ERTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBgZG9jdW1lbnRgIG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIGBub2RlYCwgd2hpY2ggbWF5IGJlXG4gKiBhIERPTSBlbGVtZW50LCB0aGUgV2luZG93IG9iamVjdCwgYSBTZWxlY3Rpb24sIGEgUmFuZ2UuIEJhc2ljYWxseSBhbnkgRE9NXG4gKiBvYmplY3QgdGhhdCByZWZlcmVuY2VzIHRoZSBEb2N1bWVudCBpbiBzb21lIHdheSwgdGhpcyBmdW5jdGlvbiB3aWxsIGZpbmQgaXQuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gbm9kZSAtIERPTSBub2RlLCBzZWxlY3Rpb24sIG9yIHJhbmdlIGluIHdoaWNoIHRvIGZpbmQgdGhlIGBkb2N1bWVudGAgb2JqZWN0XG4gKiBAcmV0dXJuIHtEb2N1bWVudH0gdGhlIGBkb2N1bWVudGAgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCBgbm9kZWBcbiAqIEBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBnZXREb2N1bWVudChub2RlKSB7XG4gIGlmIChpc0RvY3VtZW50KG5vZGUpKSB7XG4gICAgcmV0dXJuIG5vZGU7XG5cbiAgfSBlbHNlIGlmIChpc0RvY3VtZW50KG5vZGUub3duZXJEb2N1bWVudCkpIHtcbiAgICByZXR1cm4gbm9kZS5vd25lckRvY3VtZW50O1xuXG4gIH0gZWxzZSBpZiAoaXNEb2N1bWVudChub2RlLmRvY3VtZW50KSkge1xuICAgIHJldHVybiBub2RlLmRvY3VtZW50O1xuXG4gIH0gZWxzZSBpZiAobm9kZS5wYXJlbnROb2RlKSB7XG4gICAgcmV0dXJuIGdldERvY3VtZW50KG5vZGUucGFyZW50Tm9kZSk7XG5cbiAgLy8gUmFuZ2Ugc3VwcG9ydFxuICB9IGVsc2UgaWYgKG5vZGUuY29tbW9uQW5jZXN0b3JDb250YWluZXIpIHtcbiAgICByZXR1cm4gZ2V0RG9jdW1lbnQobm9kZS5jb21tb25BbmNlc3RvckNvbnRhaW5lcik7XG5cbiAgfSBlbHNlIGlmIChub2RlLnN0YXJ0Q29udGFpbmVyKSB7XG4gICAgcmV0dXJuIGdldERvY3VtZW50KG5vZGUuc3RhcnRDb250YWluZXIpO1xuXG4gIC8vIFNlbGVjdGlvbiBzdXBwb3J0XG4gIH0gZWxzZSBpZiAobm9kZS5hbmNob3JOb2RlKSB7XG4gICAgcmV0dXJuIGdldERvY3VtZW50KG5vZGUuYW5jaG9yTm9kZSk7XG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIveHBhdGgnKVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgRE9NRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSwgbmFtZSkge1xuICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2VcbiAgICB0aGlzLm5hbWUgPSBuYW1lXG4gICAgdGhpcy5zdGFjayA9IChuZXcgRXJyb3IoKSkuc3RhY2tcbiAgfVxufVxuXG5ET01FeGNlcHRpb24ucHJvdG90eXBlID0gbmV3IEVycm9yKClcblxuRE9NRXhjZXB0aW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIGAke3RoaXMubmFtZX06ICR7dGhpcy5tZXNzYWdlfWBcbn1cbiIsImltcG9ydCBnZXREb2N1bWVudCBmcm9tICdnZXQtZG9jdW1lbnQnXG5cbmltcG9ydCBET01FeGNlcHRpb24gZnJvbSAnLi9kb20tZXhjZXB0aW9uJ1xuXG4vLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1hQYXRoUmVzdWx0XG5jb25zdCBGSVJTVF9PUkRFUkVEX05PREVfVFlQRSA9IDlcblxuLy8gRGVmYXVsdCBuYW1lc3BhY2UgZm9yIFhIVE1MIGRvY3VtZW50c1xuY29uc3QgSFRNTF9OQU1FU1BBQ0UgPSAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCdcblxuXG4vKipcbiAqIENvbXB1dGUgYW4gWFBhdGggZXhwcmVzc2lvbiBmb3IgdGhlIGdpdmVuIG5vZGUuXG4gKlxuICogSWYgdGhlIG9wdGlvbmFsIHBhcmFtZXRlciBgcm9vdGAgaXMgc3VwcGxpZWQsIHRoZSBjb21wdXRlZCBYUGF0aCBleHByZXNzaW9uXG4gKiB3aWxsIGJlIHJlbGF0aXZlIHRvIGl0LiBPdGhlcndpc2UsIHRoZSByb290IGVsZW1lbnQgaXMgdGhlIHJvb3Qgb2YgdGhlXG4gKiBkb2N1bWVudCB0byB3aGljaCBgbm9kZWAgYmVsb25ncy5cbiAqXG4gKiBAcGFyYW0ge05vZGV9IG5vZGUgVGhlIG5vZGUgZm9yIHdoaWNoIHRvIGNvbXB1dGUgYW4gWFBhdGggZXhwcmVzc2lvbi5cbiAqIEBwYXJhbSB7Tm9kZX0gW3Jvb3RdIFRoZSByb290IGNvbnRleHQgZm9yIHRoZSBYUGF0aCBleHByZXNzaW9uLlxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21Ob2RlKG5vZGUsIHJvb3QgPSBudWxsKSB7XG4gIGlmIChub2RlID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ21pc3NpbmcgcmVxdWlyZWQgcGFyYW1ldGVyIFwibm9kZVwiJylcbiAgfVxuXG4gIHJvb3QgPSByb290IHx8IGdldERvY3VtZW50KG5vZGUpXG5cbiAgbGV0IHBhdGggPSAnLydcbiAgd2hpbGUgKG5vZGUgIT09IHJvb3QpIHtcbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgIGxldCBtZXNzYWdlID0gJ1RoZSBzdXBwbGllZCBub2RlIGlzIG5vdCBjb250YWluZWQgYnkgdGhlIHJvb3Qgbm9kZS4nXG4gICAgICBsZXQgbmFtZSA9ICdJbnZhbGlkTm9kZVR5cGVFcnJvcidcbiAgICAgIHRocm93IG5ldyBET01FeGNlcHRpb24obWVzc2FnZSwgbmFtZSlcbiAgICB9XG4gICAgcGF0aCA9IGAvJHtub2RlTmFtZShub2RlKX1bJHtub2RlUG9zaXRpb24obm9kZSl9XSR7cGF0aH1gXG4gICAgbm9kZSA9IG5vZGUucGFyZW50Tm9kZVxuICB9XG4gIHJldHVybiBwYXRoLnJlcGxhY2UoL1xcLyQvLCAnJylcbn1cblxuXG4vKipcbiAqIEZpbmQgYSBub2RlIHVzaW5nIGFuIFhQYXRoIHJlbGF0aXZlIHRvIHRoZSBnaXZlbiByb290IG5vZGUuXG4gKlxuICogVGhlIFhQYXRoIGV4cHJlc3Npb25zIGFyZSBldmFsdWF0ZWQgcmVsYXRpdmUgdG8gdGhlIE5vZGUgYXJndW1lbnQgYHJvb3RgLlxuICpcbiAqIElmIHRoZSBvcHRpb25hbCBwYXJhbWV0ZXIgYHJlc29sdmVyYCBpcyBzdXBwbGllZCwgaXQgd2lsbCBiZSB1c2VkIHRvIHJlc29sdmVcbiAqIGFueSBuYW1lc3BhY2VzIHdpdGhpbiB0aGUgWFBhdGguXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhdGggQW4gWFBhdGggU3RyaW5nIHRvIGV2YWx1YXRlLlxuICogQHBhcmFtIHtOb2RlfSByb290IFRoZSByb290IGNvbnRleHQgZm9yIHRoZSBYUGF0aCBleHByZXNzaW9uLlxuICogQHJldHVybnMge05vZGV8bnVsbH0gVGhlIGZpcnN0IG1hdGNoaW5nIE5vZGUgb3IgbnVsbCBpZiBub25lIGlzIGZvdW5kLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9Ob2RlKHBhdGgsIHJvb3QsIHJlc29sdmVyID0gbnVsbCkge1xuICBpZiAocGF0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdtaXNzaW5nIHJlcXVpcmVkIHBhcmFtZXRlciBcInBhdGhcIicpXG4gIH1cbiAgaWYgKHJvb3QgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFcnJvcignbWlzc2luZyByZXF1aXJlZCBwYXJhbWV0ZXIgXCJyb290XCInKVxuICB9XG5cbiAgLy8gTWFrZSB0aGUgcGF0aCByZWxhdGl2ZSB0byB0aGUgcm9vdCwgaWYgbm90IHRoZSBkb2N1bWVudC5cbiAgbGV0IGRvY3VtZW50ID0gZ2V0RG9jdW1lbnQocm9vdClcbiAgaWYgKHJvb3QgIT09IGRvY3VtZW50KSBwYXRoID0gcGF0aC5yZXBsYWNlKC9eXFwvLywgJy4vJylcblxuICAvLyBNYWtlIGEgZGVmYXVsdCByZXNvbHZlci5cbiAgbGV0IGRvY3VtZW50RWxlbWVudCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudFxuICBpZiAocmVzb2x2ZXIgPT09IG51bGwgJiYgZG9jdW1lbnRFbGVtZW50Lmxvb2t1cE5hbWVzcGFjZVVSSSkge1xuICAgIGxldCBkZWZhdWx0TlMgPSBkb2N1bWVudEVsZW1lbnQubG9va3VwTmFtZXNwYWNlVVJJKG51bGwpIHx8IEhUTUxfTkFNRVNQQUNFXG4gICAgcmVzb2x2ZXIgPSAocHJlZml4KSA9PiB7XG4gICAgICBsZXQgbnMgPSB7J19kZWZhdWx0Xyc6IGRlZmF1bHROU31cbiAgICAgIHJldHVybiBuc1twcmVmaXhdIHx8IGRvY3VtZW50RWxlbWVudC5sb29rdXBOYW1lc3BhY2VVUkkocHJlZml4KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXNvbHZlKHBhdGgsIHJvb3QsIHJlc29sdmVyKVxufVxuXG5cbi8vIEdldCB0aGUgWFBhdGggbm9kZSBuYW1lLlxuZnVuY3Rpb24gbm9kZU5hbWUobm9kZSkge1xuICBzd2l0Y2ggKG5vZGUubm9kZU5hbWUpIHtcbiAgY2FzZSAnI3RleHQnOiByZXR1cm4gJ3RleHQoKSdcbiAgY2FzZSAnI2NvbW1lbnQnOiByZXR1cm4gJ2NvbW1lbnQoKSdcbiAgY2FzZSAnI2NkYXRhLXNlY3Rpb24nOiByZXR1cm4gJ2NkYXRhLXNlY3Rpb24oKSdcbiAgZGVmYXVsdDogcmV0dXJuIG5vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKVxuICB9XG59XG5cblxuLy8gR2V0IHRoZSBvcmRpbmFsIHBvc2l0aW9uIG9mIHRoaXMgbm9kZSBhbW9uZyBpdHMgc2libGluZ3Mgb2YgdGhlIHNhbWUgbmFtZS5cbmZ1bmN0aW9uIG5vZGVQb3NpdGlvbihub2RlKSB7XG4gIGxldCBuYW1lID0gbm9kZS5ub2RlTmFtZVxuICBsZXQgcG9zaXRpb24gPSAxXG4gIHdoaWxlICgobm9kZSA9IG5vZGUucHJldmlvdXNTaWJsaW5nKSkge1xuICAgIGlmIChub2RlLm5vZGVOYW1lID09PSBuYW1lKSBwb3NpdGlvbiArPSAxXG4gIH1cbiAgcmV0dXJuIHBvc2l0aW9uXG59XG5cblxuLy8gRmluZCBhIHNpbmdsZSBub2RlIHdpdGggWFBhdGggYHBhdGhgXG5mdW5jdGlvbiByZXNvbHZlKHBhdGgsIHJvb3QsIHJlc29sdmVyKSB7XG4gIHRyeSB7XG4gICAgLy8gQWRkIGEgZGVmYXVsdCB2YWx1ZSB0byBlYWNoIHBhdGggcGFydCBsYWNraW5nIGEgcHJlZml4LlxuICAgIGxldCBuc3BhdGggPSBwYXRoLnJlcGxhY2UoL1xcLyg/IVxcLikoW15cXC86XFwoXSspKD89XFwvfCQpL2csICcvX2RlZmF1bHRfOiQxJylcbiAgICByZXR1cm4gcGxhdGZvcm1SZXNvbHZlKG5zcGF0aCwgcm9vdCwgcmVzb2x2ZXIpXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBmYWxsYmFja1Jlc29sdmUocGF0aCwgcm9vdClcbiAgfVxufVxuXG5cbi8vIEZpbmQgYSBzaW5nbGUgbm9kZSB3aXRoIFhQYXRoIGBwYXRoYCB1c2luZyB0aGUgc2ltcGxlLCBidWlsdC1pbiBldmFsdWF0b3IuXG5mdW5jdGlvbiBmYWxsYmFja1Jlc29sdmUocGF0aCwgcm9vdCkge1xuICBsZXQgc3RlcHMgPSBwYXRoLnNwbGl0KFwiL1wiKVxuICBsZXQgbm9kZSA9IHJvb3RcbiAgd2hpbGUgKG5vZGUpIHtcbiAgICBsZXQgc3RlcCA9IHN0ZXBzLnNoaWZ0KClcbiAgICBpZiAoc3RlcCA9PT0gdW5kZWZpbmVkKSBicmVha1xuICAgIGlmIChzdGVwID09PSAnLicpIGNvbnRpbnVlXG4gICAgbGV0IFtuYW1lLCBwb3NpdGlvbl0gPSBzdGVwLnNwbGl0KC9bXFxbXFxdXS8pXG4gICAgbmFtZSA9IG5hbWUucmVwbGFjZSgnX2RlZmF1bHRfOicsICcnKVxuICAgIHBvc2l0aW9uID0gcG9zaXRpb24gPyBwYXJzZUludChwb3NpdGlvbikgOiAxXG4gICAgbm9kZSA9IGZpbmRDaGlsZChub2RlLCBuYW1lLCBwb3NpdGlvbilcbiAgfVxuICByZXR1cm4gbm9kZVxufVxuXG5cbi8vIEZpbmQgYSBzaW5nbGUgbm9kZSB3aXRoIFhQYXRoIGBwYXRoYCB1c2luZyBgZG9jdW1lbnQuZXZhbHVhdGVgLlxuZnVuY3Rpb24gcGxhdGZvcm1SZXNvbHZlKHBhdGgsIHJvb3QsIHJlc29sdmVyKSB7XG4gIGxldCBkb2N1bWVudCA9IGdldERvY3VtZW50KHJvb3QpXG4gIGxldCByID0gZG9jdW1lbnQuZXZhbHVhdGUocGF0aCwgcm9vdCwgcmVzb2x2ZXIsIEZJUlNUX09SREVSRURfTk9ERV9UWVBFLCBudWxsKVxuICByZXR1cm4gci5zaW5nbGVOb2RlVmFsdWVcbn1cblxuXG4vLyBGaW5kIHRoZSBjaGlsZCBvZiB0aGUgZ2l2ZW4gbm9kZSBieSBuYW1lIGFuZCBvcmRpbmFsIHBvc2l0aW9uLlxuZnVuY3Rpb24gZmluZENoaWxkKG5vZGUsIG5hbWUsIHBvc2l0aW9uKSB7XG4gIGZvciAobm9kZSA9IG5vZGUuZmlyc3RDaGlsZCA7IG5vZGUgOyBub2RlID0gbm9kZS5uZXh0U2libGluZykge1xuICAgIGlmIChub2RlTmFtZShub2RlKSA9PT0gbmFtZSAmJiAtLXBvc2l0aW9uID09PSAwKSBicmVha1xuICB9XG4gIHJldHVybiBub2RlXG59XG4iLCIvKiBMaWIgdG8gZ2V0IHhwYXRoIGZvciBhIERPTSBub2RlICovXG5jb25zdCB4cGF0aCA9IHJlcXVpcmUoJ3NpbXBsZS14cGF0aC1wb3NpdGlvbicpO1xuXG4vKiBQb2x5ZmlsbCBmb3IgQXJyYXkucHJvdG90eXBlLmluY2x1ZGVzICovXG5yZXF1aXJlKCdjb3JlLWpzL2ZuL2FycmF5L2luY2x1ZGVzJyk7XG5cbi8qIFdoaXRlbGlzdCBvZiBET00gZXZlbnRzIHRoYXQgYXJlIHJlY29yZGVkICovXG5jb25zdCBldmVudFR5cGVzID0gWydjbGljaycsICdrZXlwcmVzcyddO1xuXG4vKiBIYWNreSBldmVudHMgKi9cbmNvbnN0IHNwZWNpYWxFdmVudFR5cGVzID0gWydrZXlkb3duJ107XG5cbmNvbnN0IGV2ZW50cyA9IFtdO1xuXG4vKiBDcmVhdGUgZXZlbnQgaGFuZGxlcnMgZm9yIGVhY2ggZXZlbnQgdHlwZSAtIGNhbGwgYHJlY29yZGAgZnVuY3Rpb24gKi9cbmNvbnN0IGdldEV2ZW50SGFuZGxlcnMgPSAoKSA9PiB7XG4gICAgbGV0IGhhbmRsZXJzID0ge307XG4gICAgZXZlbnRUeXBlcy5tYXAodHlwZSA9PiBoYW5kbGVyc1t0eXBlXSA9IHJlY29yZCk7XG4gICAgc3BlY2lhbEV2ZW50VHlwZXMubWFwKHR5cGUgPT4gaGFuZGxlcnNbdHlwZV0gPSByZWNvcmQpO1xuICAgIHJldHVybiBoYW5kbGVycztcbn07XG5cbmNvbnN0IGF0dGFjaEhhbmRsZXJzID0gKCkgPT4ge1xuICAgIGxldCBoYW5kbGVycyA9IGdldEV2ZW50SGFuZGxlcnMoKTtcbiAgICAkKCdodG1sJykub24oaGFuZGxlcnMpO1xufTtcblxuY29uc3QgZGV0YWNoSGFuZGxlcnMgPSAoKSA9PiB7XG4gICAgbGV0IGhhbmRsZXJzID0gZ2V0RXZlbnRIYW5kbGVycygpO1xuICAgICQoJ2h0bWwnKS5vZmYoaGFuZGxlcnMpO1xufTtcblxuY29uc3QgcmVjb3JkID0gKGV2ZW50KSA9PiB7XG4gICAgLyogT25seSByZWNvcmQgd2hpdGVsaXN0ZWQgZXZlbnQgdHlwZXMgKi9cbiAgICBpZiAoIWV2ZW50VHlwZXMuaW5jbHVkZXMoZXZlbnQudHlwZSkpIHtcbiAgICAgICAgLyogU29tZSBldmVudHMgbGlrZSBrZXlkb3duIG5lZWQgc3BlY2lhbCB0cmVhdG1lbnQgKi9cbiAgICAgICAgaWYgKHNwZWNpYWxFdmVudFR5cGVzLmluY2x1ZGVzKGV2ZW50LnR5cGUpKSBoYW5kbGVIYWNrcyhldmVudCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIFdlIHdhbnQgdG8gZ2V0IHRoZSB4cGF0aCBvZiB0aGUgRE9NIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBEZXBlbmRpbmcgb24gdGhlIGludGVyZmFjZSwgdGhlIGVsZW1lbnQgbWlnaHQgb3JcbiAgICAgKiBtaWdodCBub3Qgc3RheSBpbiB0aGUgRE9NIHRyZWUgYWZ0ZXIgdGhlIGV2ZW50LlxuICAgICAqXG4gICAgICogV2UgbmVlZCB0byBoaWphY2sgdGhlIGV2ZW50LCBydW4gb3VyIGNvZGUgZmlyc3RcbiAgICAgKiBhbmQgdGhlbiBwbGF5IHRoZSBldmVudC5cbiAgICAgKi9cbiAgICBpZiAoZXZlbnQucHJldmVudERlZmF1bHQpIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAvKiBBZGRpbmcgYSB3YWl0IGJlZm9yZSBlYWNoIHVzZXIgZXZlbnQgKi9cbiAgICBldmVudHMucHVzaChnZXRXYWl0RXZlbnQoKSk7XG5cbiAgICBsZXQgc3ludGhldGljRXZlbnQgPSB7XG4gICAgICAgIHR5cGU6IGV2ZW50LnR5cGUsXG4gICAgICAgIHdoaWNoOiBldmVudC53aGljaCxcbiAgICAgICAgcGF0aDogeHBhdGguZnJvbU5vZGUoZXZlbnQudGFyZ2V0LCBkb2N1bWVudClcbiAgICB9O1xuICAgIGV2ZW50cy5wdXNoKHN5bnRoZXRpY0V2ZW50KTtcblxuICAgIGlmICghZXZlbnQuaGFja3kpIHBsYXlFdmVudChzeW50aGV0aWNFdmVudCk7XG59O1xuXG5jb25zdCBoYW5kbGVIYWNrcyA9IChldmVudCkgPT4ge1xuICAgIC8qIFRoZSBrZXlwcmVzcyBldmVudCBkb2VzIG5vdCBjYXRjaCBiYWNrIHNwYWNlIGtleSAqL1xuICAgIGlmIChldmVudC50eXBlID09PSAna2V5ZG93bicgJiYgZXZlbnQud2hpY2ggPT09IDgpIGJhY2tzcGFjZUhhY2soZXZlbnQpO1xufTtcblxuY29uc3QgYmFja3NwYWNlSGFjayA9ICh7d2hpY2gsIHRhcmdldH0pID0+IHtcbiAgICBsZXQgY3VzdG9tRXZlbnQgPSB7XG4gICAgICAgIHR5cGU6ICdrZXlwcmVzcycsXG4gICAgICAgIHdoaWNoLFxuICAgICAgICB0YXJnZXQsXG4gICAgICAgIGhhY2t5OiB0cnVlXG4gICAgfTtcbiAgICByZWNvcmQoY3VzdG9tRXZlbnQpO1xufTtcblxubGV0IGxhc3RFdmVudFRpbWVzdGFtcDtcbmNvbnN0IGdldFdhaXRFdmVudCA9ICgpID0+IHtcbiAgICBsZXQgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgbGV0IGV2ZW50ID0ge1xuICAgICAgICB0eXBlOiAnd2FpdCcsXG4gICAgICAgIC8qIFJldHVybiB0aW1lIHNpbmNlIGxhc3QgZXZlbnQgKi9cbiAgICAgICAgZHVyYXRpb246IChub3cgLSBsYXN0RXZlbnRUaW1lc3RhbXApIHx8IDBcbiAgICB9O1xuXG4gICAgbGFzdEV2ZW50VGltZXN0YW1wID0gbm93O1xuICAgIHJldHVybiBldmVudDtcbn07XG5cbmNvbnN0IGdldEVsZW1lbnQgPSAocGF0aCkgPT4ge1xuICAgIHJldHVybiB4cGF0aC50b05vZGUocGF0aCwgZG9jdW1lbnQpO1xufTtcblxuLyogUGxheSBhbiBldmVudCAqL1xuY29uc3QgcGxheUV2ZW50ID0gKGV2ZW50KSA9PiB7XG4gICAgLy8gVE9ETzogU2ltcGxpZnkgdGhpcyBmdW5jdGlvbiB3aXRoIGFzeW5jLWF3YWl0XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAvKlxuICAgICAgICAgKiBEb24ndCB3YW50IHN5bnRoZXRpYyBldmVudHMgdG8gYmUgcmVjb3JkZWQgd2hpbGUgd2hlbiB3ZSBwbGF5IHRoZW0uXG4gICAgICAgICAqIFdlIHdpbGwgZW5kIHVwIGluIGFuIGluZmluaXRlIGxvb3Agb3RoZXJ3aXNlXG4gICAgICAgICovXG4gICAgICAgIGRldGFjaEhhbmRsZXJzKCk7XG5cbiAgICAgICAgLypcbiAgICAgICAgKiBBbGwgZXZlbnRzIHJldHVybiBhIHByb21pc2Ugd2hpY2ggaXMgcmVzb2x2ZWQgYWZ0ZXJcbiAgICAgICAgKiB0aGUgZXZlbnQgaXMgY29tcGxldGVkLiBVc2VmdWwgZm9yIHdhaXQgZXZlbnRzXG4gICAgICAgICovXG4gICAgICAgIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGxldCB0eXBlID0gZXZlbnQudHlwZTtcbiAgICAgICAgICAgIC8vIFRPRE86IENyZWF0ZSBhbiBldmVudCBtYXAgZm9yIGV2ZW50c1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdjbGljaycpIGNsaWNrKGV2ZW50LCByZXNvbHZlKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGUgPT09ICdrZXlwcmVzcycpIGtleXByZXNzKGV2ZW50LCByZXNvbHZlKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGUgPT09ICd3YWl0Jykgd2FpdChldmVudCwgcmVzb2x2ZSk7XG4gICAgICAgICAgICBlbHNlIHJlamVjdChuZXcgRXJyb3IoJ1Vua25vd24gZXZlbnQgdHlwZS4gQ291bGQgbm90IHBsYXknKSk7XG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLyogUmUtYXR0YWNoIGhhbmRsZXJzIGFmdGVyIGV2ZW50IGlzIHBsYXllZCAqL1xuICAgICAgICAgICAgYXR0YWNoSGFuZGxlcnMoKTsgLy9UT0RPOiBEb24ndCBhdHRhY2ggaW4gcGxheWJhY2sgbW9kZVxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5cbi8qXG4gKiBTaW11bGF0ZSBldmVudHNcbiAqIEVhY2ggaGFuZGxlciBnZXRzIHRoZSBldmVudCBvYmplY3RcbiAqIGFuZCB0aGUgcmVzb2x2ZSBmdW5jdGlvbiBmb3IgaXQncyBwcm9taXNlXG4gKiByZXNvbHZlKCkgbXVzdCBiZSBjYWxsZWQgYXQgdGhlIGVuZCBvZiB0aGUgZnVuY3Rpb25cbiAqL1xuXG5jb25zdCBjbGljayA9ICh7cGF0aH0sIHJlc29sdmUpID0+IHtcbiAgICBsZXQgZWxlbWVudCA9IGdldEVsZW1lbnQocGF0aCk7XG4gICAgJChlbGVtZW50KS50cmlnZ2VyKCdjbGljaycpO1xuICAgIHJlc29sdmUoKTtcbn07XG5cbmNvbnN0IGtleXByZXNzID0gKHtwYXRoLCB3aGljaH0scmVzb2x2ZSkgPT4ge1xuICAgIGxldCBlbGVtZW50ID0gZ2V0RWxlbWVudChwYXRoKTtcbiAgICBsZXQgY3VycmVudFZhbHVlID0gJChlbGVtZW50KS52YWwoKTtcbiAgICBpZiAod2hpY2ggPT09IDgpIHtcbiAgICAgICAgLyogTWFudWFsbHkgaGFuZGxlIGJhY2tzcGFjZSAqL1xuICAgICAgICAkKGVsZW1lbnQpLnZhbChjdXJyZW50VmFsdWUuc3Vic3RyaW5nKDAsIGN1cnJlbnRWYWx1ZS5sZW5ndGgtMSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBrZXkgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHdoaWNoKTtcbiAgICAgICAgLyogTWFudWFsbHkgYWRkIGNoYXJhY2h0ZXIgKi9cbiAgICAgICAgJChlbGVtZW50KS52YWwoY3VycmVudFZhbHVlICsga2V5KTtcbiAgICB9XG4gICAgLyogVHJpZ2dlciBldmVudCAqL1xuICAgICQoZWxlbWVudCkudHJpZ2dlcihqUXVlcnkuRXZlbnQoJ2tleWRvd24nLCB7d2hpY2h9KSk7XG4gICAgJChlbGVtZW50KS50cmlnZ2VyKGpRdWVyeS5FdmVudCgna2V5dXAnLCB7d2hpY2h9KSk7XG4gICAgcmVzb2x2ZSgpO1xufTtcblxuY29uc3Qgd2FpdCA9ICh7ZHVyYXRpb259LCByZXNvbHZlKSA9PiB7XG4gICAgc2V0VGltZW91dCgoKSA9PiByZXNvbHZlKCksIGR1cmF0aW9uKTtcbn07XG5cbi8qIFBsYXkgYWxsIHJlY29yZGVkIGV2ZW50cyAqL1xuY29uc3QgcGxheSA9ICgpID0+IHBsYXlFdmVudHNSZWN1cnNpdmVseSgwKTtcblxuY29uc3QgcGxheUV2ZW50c1JlY3Vyc2l2ZWx5ID0gKGluZGV4KSA9PiB7XG4gICAgaWYgKCFldmVudHNbaW5kZXhdKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcGxheUV2ZW50KGV2ZW50c1tpbmRleF0pLnRoZW4oKCkgPT4gcGxheUV2ZW50c1JlY3Vyc2l2ZWx5KCsraW5kZXgpKTtcbn07XG5cbiQoKCkgPT4ge1xuICAgIC8qIEV4cG9zZSBwdWJsaWMgZnVuY3Rpb25zICovXG4gICAgd2luZG93LnZocyA9IHtcbiAgICAgICAgcGxheSxcbiAgICAgICAgZXZlbnRzLFxuICAgICAgICByZWNvcmQ6IGF0dGFjaEhhbmRsZXJzLFxuICAgICAgICBzdG9wOiBkZXRhY2hIYW5kbGVycyAvL1RPRE86IENoYW5nZSBhbWJpZ3VvdXMgbmFtZVxuICAgIH1cbn0pO1xuIl19
