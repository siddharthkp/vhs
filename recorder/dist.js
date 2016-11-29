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
'use strict';

/* Lib to get xpath for a DOM node */
var xpath = require('simple-xpath-position');

/* Polyfill for Array.prototype.includes */
require('core-js/fn/array/includes');

/* Whitelist of DOM events that are recorded */
var eventTypes = ['click', 'keypress'];

/* Hacky events */
var specialEventTypes = ['keydown'];

var events = [];

/* Create event handlers for each event type - call `record` function */
var getEventHandlers = function getEventHandlers() {
    var handlers = {};
    eventTypes.map(function (type) {
        return handlers[type] = recordEvent;
    });
    specialEventTypes.map(function (type) {
        return handlers[type] = recordEvent;
    });
    return handlers;
};

var attachHandlers = function attachHandlers() {
    var handlers = getEventHandlers();
    $('html').on(handlers);
};

var detachHandlers = function detachHandlers() {
    var handlers = getEventHandlers();
    $('html').off(handlers);
};

var recordEvent = function recordEvent(event) {
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

    var syntheticEvent = {
        type: event.type,
        which: event.which,
        path: xpath.fromNode(event.target, document)
    };
    events.push(syntheticEvent);

    if (!event.hacky) playEvent(syntheticEvent);
};

var handleHacks = function handleHacks(event) {
    /* The keypress event does not catch back space key */
    if (event.type === 'keydown' && event.which === 8) backspaceHack(event);
};

var backspaceHack = function backspaceHack(_ref) {
    var which = _ref.which,
        target = _ref.target;

    var customEvent = {
        type: 'keypress',
        which: which,
        target: target,
        hacky: true
    };
    recordEvent(customEvent);
};

var lastEventTimestamp = void 0;
var getWaitEvent = function getWaitEvent() {
    var now = new Date().getTime();
    var event = {
        type: 'wait',
        /* Return time since last event */
        duration: now - lastEventTimestamp || 0
    };

    lastEventTimestamp = now;
    return event;
};

var getElement = function getElement(path) {
    return xpath.toNode(path, document);
};

/* Play an event */
var playEvent = function playEvent(event) {
    // TODO: Simplify this function with async-await
    return new Promise(function (resolve) {
        /*
         * Don't want synthetic events to be recorded while when we play them.
         * We will end up in an infinite loop otherwise
        */
        stopRecording();

        /*
        * All events return a promise which is resolved after
        * the event is completed. Useful for wait events
        */
        new Promise(function (resolve, reject) {
            var type = event.type;
            // TODO: Create an event map for events
            if (type === 'click') click(event, resolve);else if (type === 'keypress') keypress(event, resolve);else if (type === 'wait') wait(event, resolve);else reject(new Error('Unknown event type. Could not play'));
        }).then(function () {
            /* Re-attach handlers after event is played */
            resumeRecording(); //TODO: Don't attach in playback mode
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

var click = function click(_ref2, resolve) {
    var path = _ref2.path;

    var element = getElement(path);
    $(element).trigger('click');
    resolve();
};

var keypress = function keypress(_ref3, resolve) {
    var path = _ref3.path,
        which = _ref3.which;

    var element = getElement(path);
    var currentValue = $(element).val();
    if (which === 8) {
        /* Manually handle backspace */
        $(element).val(currentValue.substring(0, currentValue.length - 1));
    } else {
        var key = String.fromCharCode(which);
        /* Manually add charachter */
        $(element).val(currentValue + key);
    }
    /* Trigger event */
    $(element).trigger(jQuery.Event('keydown', { which: which }));
    $(element).trigger(jQuery.Event('keyup', { which: which }));
    resolve();
};

var wait = function wait(_ref4, resolve) {
    var duration = _ref4.duration;

    setTimeout(function () {
        return resolve();
    }, duration);
};

/* Play all recorded events */
var play = function play() {
    events = JSON.parse(localStorage.getItem('vhs')).events;
    playEventsRecursively(0);
};

var playEventsRecursively = function playEventsRecursively(index) {
    if (!events[index]) {
        return;
    }
    playEvent(events[index]).then(function () {
        return playEventsRecursively(++index);
    });
};

var isRecording = false;
var record = function record() {
    events = [];
    resumeRecording();
};

var stopRecording = function stopRecording() {
    detachHandlers();
    isRecording = false;
    localStorage.setItem('vhs', JSON.stringify({ events: events }));
};

var resumeRecording = function resumeRecording() {
    attachHandlers();
    isRecording = true;
};

$(function () {
    /* Expose public functions */
    window.vhs = {
        play: play,
        events: events,
        record: record,
        stop: stopRecording //TODO: Change ambiguous name
    };
});

},{"core-js/fn/array/includes":1,"simple-xpath-position":33}]},{},[36])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9mbi9hcnJheS9pbmNsdWRlcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2EtZnVuY3Rpb24uanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hZGQtdG8tdW5zY29wYWJsZXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hbi1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hcnJheS1pbmNsdWRlcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2NvZi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2NvcmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jdHguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19kZWZpbmVkLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZGVzY3JpcHRvcnMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19kb20tY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZXhwb3J0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZmFpbHMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19nbG9iYWwuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19oYXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19oaWRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faWU4LWRvbS1kZWZpbmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faXMtb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWRwLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fcHJvcGVydHktZGVzYy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3JlZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fc2hhcmVkLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8taW5kZXguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1pbnRlZ2VyLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8taW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3RvLWxlbmd0aC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3RvLXByaW1pdGl2ZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3VpZC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3drcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3LmFycmF5LmluY2x1ZGVzLmpzIiwibm9kZV9tb2R1bGVzL2dldC1kb2N1bWVudC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUteHBhdGgtcG9zaXRpb24vaW5kZXguanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXhwYXRoLXBvc2l0aW9uL3NyYy9kb20tZXhjZXB0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS14cGF0aC1wb3NpdGlvbi9zcmMveHBhdGguanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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O0FBQ0EsSUFBTSxTQUFTLFNBQVQsTUFBUyxHQUFNO0FBQ2pCLGFBQVMsRUFBVDtBQUNBO0FBQ0gsQ0FIRDs7QUFLQSxJQUFNLGdCQUFnQixTQUFoQixhQUFnQixHQUFNO0FBQ3hCO0FBQ0Esa0JBQWMsS0FBZDtBQUNBLGlCQUFhLE9BQWIsQ0FBcUIsS0FBckIsRUFBNEIsS0FBSyxTQUFMLENBQWUsRUFBQyxjQUFELEVBQWYsQ0FBNUI7QUFDSCxDQUpEOztBQU1BLElBQU0sa0JBQWtCLFNBQWxCLGVBQWtCLEdBQU07QUFDMUI7QUFDQSxrQkFBYyxJQUFkO0FBQ0gsQ0FIRDs7QUFLQSxFQUFFLFlBQU07QUFDSjtBQUNBLFdBQU8sR0FBUCxHQUFhO0FBQ1Qsa0JBRFM7QUFFVCxzQkFGUztBQUdULGdCQUFRLE1BSEM7QUFJVCxjQUFNLGFBSkcsQ0FJVztBQUpYLEtBQWI7QUFNSCxDQVJEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM3LmFycmF5LmluY2x1ZGVzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX2NvcmUnKS5BcnJheS5pbmNsdWRlczsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYodHlwZW9mIGl0ICE9ICdmdW5jdGlvbicpdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYSBmdW5jdGlvbiEnKTtcbiAgcmV0dXJuIGl0O1xufTsiLCIvLyAyMi4xLjMuMzEgQXJyYXkucHJvdG90eXBlW0BAdW5zY29wYWJsZXNdXG52YXIgVU5TQ09QQUJMRVMgPSByZXF1aXJlKCcuL193a3MnKSgndW5zY29wYWJsZXMnKVxuICAsIEFycmF5UHJvdG8gID0gQXJyYXkucHJvdG90eXBlO1xuaWYoQXJyYXlQcm90b1tVTlNDT1BBQkxFU10gPT0gdW5kZWZpbmVkKXJlcXVpcmUoJy4vX2hpZGUnKShBcnJheVByb3RvLCBVTlNDT1BBQkxFUywge30pO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihrZXkpe1xuICBBcnJheVByb3RvW1VOU0NPUEFCTEVTXVtrZXldID0gdHJ1ZTtcbn07IiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYoIWlzT2JqZWN0KGl0KSl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhbiBvYmplY3QhJyk7XG4gIHJldHVybiBpdDtcbn07IiwiLy8gZmFsc2UgLT4gQXJyYXkjaW5kZXhPZlxuLy8gdHJ1ZSAgLT4gQXJyYXkjaW5jbHVkZXNcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0JylcbiAgLCB0b0xlbmd0aCAgPSByZXF1aXJlKCcuL190by1sZW5ndGgnKVxuICAsIHRvSW5kZXggICA9IHJlcXVpcmUoJy4vX3RvLWluZGV4Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKElTX0lOQ0xVREVTKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKCR0aGlzLCBlbCwgZnJvbUluZGV4KXtcbiAgICB2YXIgTyAgICAgID0gdG9JT2JqZWN0KCR0aGlzKVxuICAgICAgLCBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aClcbiAgICAgICwgaW5kZXggID0gdG9JbmRleChmcm9tSW5kZXgsIGxlbmd0aClcbiAgICAgICwgdmFsdWU7XG4gICAgLy8gQXJyYXkjaW5jbHVkZXMgdXNlcyBTYW1lVmFsdWVaZXJvIGVxdWFsaXR5IGFsZ29yaXRobVxuICAgIGlmKElTX0lOQ0xVREVTICYmIGVsICE9IGVsKXdoaWxlKGxlbmd0aCA+IGluZGV4KXtcbiAgICAgIHZhbHVlID0gT1tpbmRleCsrXTtcbiAgICAgIGlmKHZhbHVlICE9IHZhbHVlKXJldHVybiB0cnVlO1xuICAgIC8vIEFycmF5I3RvSW5kZXggaWdub3JlcyBob2xlcywgQXJyYXkjaW5jbHVkZXMgLSBub3RcbiAgICB9IGVsc2UgZm9yKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKylpZihJU19JTkNMVURFUyB8fCBpbmRleCBpbiBPKXtcbiAgICAgIGlmKE9baW5kZXhdID09PSBlbClyZXR1cm4gSVNfSU5DTFVERVMgfHwgaW5kZXggfHwgMDtcbiAgICB9IHJldHVybiAhSVNfSU5DTFVERVMgJiYgLTE7XG4gIH07XG59OyIsInZhciB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoaXQpLnNsaWNlKDgsIC0xKTtcbn07IiwidmFyIGNvcmUgPSBtb2R1bGUuZXhwb3J0cyA9IHt2ZXJzaW9uOiAnMi40LjAnfTtcbmlmKHR5cGVvZiBfX2UgPT0gJ251bWJlcicpX19lID0gY29yZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZiIsIi8vIG9wdGlvbmFsIC8gc2ltcGxlIGNvbnRleHQgYmluZGluZ1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4vX2EtZnVuY3Rpb24nKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZm4sIHRoYXQsIGxlbmd0aCl7XG4gIGFGdW5jdGlvbihmbik7XG4gIGlmKHRoYXQgPT09IHVuZGVmaW5lZClyZXR1cm4gZm47XG4gIHN3aXRjaChsZW5ndGgpe1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uKGEpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSk7XG4gICAgfTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbihhLCBiKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIpO1xuICAgIH07XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24oYSwgYiwgYyl7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiLCBjKTtcbiAgICB9O1xuICB9XG4gIHJldHVybiBmdW5jdGlvbigvKiAuLi5hcmdzICovKXtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcbiAgfTtcbn07IiwiLy8gNy4yLjEgUmVxdWlyZU9iamVjdENvZXJjaWJsZShhcmd1bWVudClcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZihpdCA9PSB1bmRlZmluZWQpdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY2FsbCBtZXRob2Qgb24gIFwiICsgaXQpO1xuICByZXR1cm4gaXQ7XG59OyIsIi8vIFRoYW5rJ3MgSUU4IGZvciBoaXMgZnVubnkgZGVmaW5lUHJvcGVydHlcbm1vZHVsZS5leHBvcnRzID0gIXJlcXVpcmUoJy4vX2ZhaWxzJykoZnVuY3Rpb24oKXtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ2EnLCB7Z2V0OiBmdW5jdGlvbigpeyByZXR1cm4gNzsgfX0pLmEgIT0gNztcbn0pOyIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpXG4gICwgZG9jdW1lbnQgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5kb2N1bWVudFxuICAvLyBpbiBvbGQgSUUgdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgaXMgJ29iamVjdCdcbiAgLCBpcyA9IGlzT2JqZWN0KGRvY3VtZW50KSAmJiBpc09iamVjdChkb2N1bWVudC5jcmVhdGVFbGVtZW50KTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXMgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGl0KSA6IHt9O1xufTsiLCJ2YXIgZ2xvYmFsICAgID0gcmVxdWlyZSgnLi9fZ2xvYmFsJylcbiAgLCBjb3JlICAgICAgPSByZXF1aXJlKCcuL19jb3JlJylcbiAgLCBoaWRlICAgICAgPSByZXF1aXJlKCcuL19oaWRlJylcbiAgLCByZWRlZmluZSAgPSByZXF1aXJlKCcuL19yZWRlZmluZScpXG4gICwgY3R4ICAgICAgID0gcmVxdWlyZSgnLi9fY3R4JylcbiAgLCBQUk9UT1RZUEUgPSAncHJvdG90eXBlJztcblxudmFyICRleHBvcnQgPSBmdW5jdGlvbih0eXBlLCBuYW1lLCBzb3VyY2Upe1xuICB2YXIgSVNfRk9SQ0VEID0gdHlwZSAmICRleHBvcnQuRlxuICAgICwgSVNfR0xPQkFMID0gdHlwZSAmICRleHBvcnQuR1xuICAgICwgSVNfU1RBVElDID0gdHlwZSAmICRleHBvcnQuU1xuICAgICwgSVNfUFJPVE8gID0gdHlwZSAmICRleHBvcnQuUFxuICAgICwgSVNfQklORCAgID0gdHlwZSAmICRleHBvcnQuQlxuICAgICwgdGFyZ2V0ICAgID0gSVNfR0xPQkFMID8gZ2xvYmFsIDogSVNfU1RBVElDID8gZ2xvYmFsW25hbWVdIHx8IChnbG9iYWxbbmFtZV0gPSB7fSkgOiAoZ2xvYmFsW25hbWVdIHx8IHt9KVtQUk9UT1RZUEVdXG4gICAgLCBleHBvcnRzICAgPSBJU19HTE9CQUwgPyBjb3JlIDogY29yZVtuYW1lXSB8fCAoY29yZVtuYW1lXSA9IHt9KVxuICAgICwgZXhwUHJvdG8gID0gZXhwb3J0c1tQUk9UT1RZUEVdIHx8IChleHBvcnRzW1BST1RPVFlQRV0gPSB7fSlcbiAgICAsIGtleSwgb3duLCBvdXQsIGV4cDtcbiAgaWYoSVNfR0xPQkFMKXNvdXJjZSA9IG5hbWU7XG4gIGZvcihrZXkgaW4gc291cmNlKXtcbiAgICAvLyBjb250YWlucyBpbiBuYXRpdmVcbiAgICBvd24gPSAhSVNfRk9SQ0VEICYmIHRhcmdldCAmJiB0YXJnZXRba2V5XSAhPT0gdW5kZWZpbmVkO1xuICAgIC8vIGV4cG9ydCBuYXRpdmUgb3IgcGFzc2VkXG4gICAgb3V0ID0gKG93biA/IHRhcmdldCA6IHNvdXJjZSlba2V5XTtcbiAgICAvLyBiaW5kIHRpbWVycyB0byBnbG9iYWwgZm9yIGNhbGwgZnJvbSBleHBvcnQgY29udGV4dFxuICAgIGV4cCA9IElTX0JJTkQgJiYgb3duID8gY3R4KG91dCwgZ2xvYmFsKSA6IElTX1BST1RPICYmIHR5cGVvZiBvdXQgPT0gJ2Z1bmN0aW9uJyA/IGN0eChGdW5jdGlvbi5jYWxsLCBvdXQpIDogb3V0O1xuICAgIC8vIGV4dGVuZCBnbG9iYWxcbiAgICBpZih0YXJnZXQpcmVkZWZpbmUodGFyZ2V0LCBrZXksIG91dCwgdHlwZSAmICRleHBvcnQuVSk7XG4gICAgLy8gZXhwb3J0XG4gICAgaWYoZXhwb3J0c1trZXldICE9IG91dCloaWRlKGV4cG9ydHMsIGtleSwgZXhwKTtcbiAgICBpZihJU19QUk9UTyAmJiBleHBQcm90b1trZXldICE9IG91dClleHBQcm90b1trZXldID0gb3V0O1xuICB9XG59O1xuZ2xvYmFsLmNvcmUgPSBjb3JlO1xuLy8gdHlwZSBiaXRtYXBcbiRleHBvcnQuRiA9IDE7ICAgLy8gZm9yY2VkXG4kZXhwb3J0LkcgPSAyOyAgIC8vIGdsb2JhbFxuJGV4cG9ydC5TID0gNDsgICAvLyBzdGF0aWNcbiRleHBvcnQuUCA9IDg7ICAgLy8gcHJvdG9cbiRleHBvcnQuQiA9IDE2OyAgLy8gYmluZFxuJGV4cG9ydC5XID0gMzI7ICAvLyB3cmFwXG4kZXhwb3J0LlUgPSA2NDsgIC8vIHNhZmVcbiRleHBvcnQuUiA9IDEyODsgLy8gcmVhbCBwcm90byBtZXRob2QgZm9yIGBsaWJyYXJ5YCBcbm1vZHVsZS5leHBvcnRzID0gJGV4cG9ydDsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGV4ZWMpe1xuICB0cnkge1xuICAgIHJldHVybiAhIWV4ZWMoKTtcbiAgfSBjYXRjaChlKXtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTsiLCIvLyBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qcy9pc3N1ZXMvODYjaXNzdWVjb21tZW50LTExNTc1OTAyOFxudmFyIGdsb2JhbCA9IG1vZHVsZS5leHBvcnRzID0gdHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuTWF0aCA9PSBNYXRoXG4gID8gd2luZG93IDogdHlwZW9mIHNlbGYgIT0gJ3VuZGVmaW5lZCcgJiYgc2VsZi5NYXRoID09IE1hdGggPyBzZWxmIDogRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbmlmKHR5cGVvZiBfX2cgPT0gJ251bWJlcicpX19nID0gZ2xvYmFsOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmIiwidmFyIGhhc093blByb3BlcnR5ID0ge30uaGFzT3duUHJvcGVydHk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0LCBrZXkpe1xuICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChpdCwga2V5KTtcbn07IiwidmFyIGRQICAgICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKVxuICAsIGNyZWF0ZURlc2MgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBmdW5jdGlvbihvYmplY3QsIGtleSwgdmFsdWUpe1xuICByZXR1cm4gZFAuZihvYmplY3QsIGtleSwgY3JlYXRlRGVzYygxLCB2YWx1ZSkpO1xufSA6IGZ1bmN0aW9uKG9iamVjdCwga2V5LCB2YWx1ZSl7XG4gIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIHJldHVybiBvYmplY3Q7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gIXJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgJiYgIXJlcXVpcmUoJy4vX2ZhaWxzJykoZnVuY3Rpb24oKXtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShyZXF1aXJlKCcuL19kb20tY3JlYXRlJykoJ2RpdicpLCAnYScsIHtnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiA3OyB9fSkuYSAhPSA3O1xufSk7IiwiLy8gZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBhbmQgbm9uLWVudW1lcmFibGUgb2xkIFY4IHN0cmluZ3NcbnZhciBjb2YgPSByZXF1aXJlKCcuL19jb2YnKTtcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0KCd6JykucHJvcGVydHlJc0VudW1lcmFibGUoMCkgPyBPYmplY3QgOiBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBjb2YoaXQpID09ICdTdHJpbmcnID8gaXQuc3BsaXQoJycpIDogT2JqZWN0KGl0KTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiB0eXBlb2YgaXQgPT09ICdvYmplY3QnID8gaXQgIT09IG51bGwgOiB0eXBlb2YgaXQgPT09ICdmdW5jdGlvbic7XG59OyIsInZhciBhbk9iamVjdCAgICAgICA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpXG4gICwgSUU4X0RPTV9ERUZJTkUgPSByZXF1aXJlKCcuL19pZTgtZG9tLWRlZmluZScpXG4gICwgdG9QcmltaXRpdmUgICAgPSByZXF1aXJlKCcuL190by1wcmltaXRpdmUnKVxuICAsIGRQICAgICAgICAgICAgID0gT2JqZWN0LmRlZmluZVByb3BlcnR5O1xuXG5leHBvcnRzLmYgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gT2JqZWN0LmRlZmluZVByb3BlcnR5IDogZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcyl7XG4gIGFuT2JqZWN0KE8pO1xuICBQID0gdG9QcmltaXRpdmUoUCwgdHJ1ZSk7XG4gIGFuT2JqZWN0KEF0dHJpYnV0ZXMpO1xuICBpZihJRThfRE9NX0RFRklORSl0cnkge1xuICAgIHJldHVybiBkUChPLCBQLCBBdHRyaWJ1dGVzKTtcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuICBpZignZ2V0JyBpbiBBdHRyaWJ1dGVzIHx8ICdzZXQnIGluIEF0dHJpYnV0ZXMpdGhyb3cgVHlwZUVycm9yKCdBY2Nlc3NvcnMgbm90IHN1cHBvcnRlZCEnKTtcbiAgaWYoJ3ZhbHVlJyBpbiBBdHRyaWJ1dGVzKU9bUF0gPSBBdHRyaWJ1dGVzLnZhbHVlO1xuICByZXR1cm4gTztcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihiaXRtYXAsIHZhbHVlKXtcbiAgcmV0dXJuIHtcbiAgICBlbnVtZXJhYmxlICA6ICEoYml0bWFwICYgMSksXG4gICAgY29uZmlndXJhYmxlOiAhKGJpdG1hcCAmIDIpLFxuICAgIHdyaXRhYmxlICAgIDogIShiaXRtYXAgJiA0KSxcbiAgICB2YWx1ZSAgICAgICA6IHZhbHVlXG4gIH07XG59OyIsInZhciBnbG9iYWwgICAgPSByZXF1aXJlKCcuL19nbG9iYWwnKVxuICAsIGhpZGUgICAgICA9IHJlcXVpcmUoJy4vX2hpZGUnKVxuICAsIGhhcyAgICAgICA9IHJlcXVpcmUoJy4vX2hhcycpXG4gICwgU1JDICAgICAgID0gcmVxdWlyZSgnLi9fdWlkJykoJ3NyYycpXG4gICwgVE9fU1RSSU5HID0gJ3RvU3RyaW5nJ1xuICAsICR0b1N0cmluZyA9IEZ1bmN0aW9uW1RPX1NUUklOR11cbiAgLCBUUEwgICAgICAgPSAoJycgKyAkdG9TdHJpbmcpLnNwbGl0KFRPX1NUUklORyk7XG5cbnJlcXVpcmUoJy4vX2NvcmUnKS5pbnNwZWN0U291cmNlID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gJHRvU3RyaW5nLmNhbGwoaXQpO1xufTtcblxuKG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oTywga2V5LCB2YWwsIHNhZmUpe1xuICB2YXIgaXNGdW5jdGlvbiA9IHR5cGVvZiB2YWwgPT0gJ2Z1bmN0aW9uJztcbiAgaWYoaXNGdW5jdGlvbiloYXModmFsLCAnbmFtZScpIHx8IGhpZGUodmFsLCAnbmFtZScsIGtleSk7XG4gIGlmKE9ba2V5XSA9PT0gdmFsKXJldHVybjtcbiAgaWYoaXNGdW5jdGlvbiloYXModmFsLCBTUkMpIHx8IGhpZGUodmFsLCBTUkMsIE9ba2V5XSA/ICcnICsgT1trZXldIDogVFBMLmpvaW4oU3RyaW5nKGtleSkpKTtcbiAgaWYoTyA9PT0gZ2xvYmFsKXtcbiAgICBPW2tleV0gPSB2YWw7XG4gIH0gZWxzZSB7XG4gICAgaWYoIXNhZmUpe1xuICAgICAgZGVsZXRlIE9ba2V5XTtcbiAgICAgIGhpZGUoTywga2V5LCB2YWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZihPW2tleV0pT1trZXldID0gdmFsO1xuICAgICAgZWxzZSBoaWRlKE8sIGtleSwgdmFsKTtcbiAgICB9XG4gIH1cbi8vIGFkZCBmYWtlIEZ1bmN0aW9uI3RvU3RyaW5nIGZvciBjb3JyZWN0IHdvcmsgd3JhcHBlZCBtZXRob2RzIC8gY29uc3RydWN0b3JzIHdpdGggbWV0aG9kcyBsaWtlIExvRGFzaCBpc05hdGl2ZVxufSkoRnVuY3Rpb24ucHJvdG90eXBlLCBUT19TVFJJTkcsIGZ1bmN0aW9uIHRvU3RyaW5nKCl7XG4gIHJldHVybiB0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nICYmIHRoaXNbU1JDXSB8fCAkdG9TdHJpbmcuY2FsbCh0aGlzKTtcbn0pOyIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKVxuICAsIFNIQVJFRCA9ICdfX2NvcmUtanNfc2hhcmVkX18nXG4gICwgc3RvcmUgID0gZ2xvYmFsW1NIQVJFRF0gfHwgKGdsb2JhbFtTSEFSRURdID0ge30pO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihrZXkpe1xuICByZXR1cm4gc3RvcmVba2V5XSB8fCAoc3RvcmVba2V5XSA9IHt9KTtcbn07IiwidmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vX3RvLWludGVnZXInKVxuICAsIG1heCAgICAgICA9IE1hdGgubWF4XG4gICwgbWluICAgICAgID0gTWF0aC5taW47XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGluZGV4LCBsZW5ndGgpe1xuICBpbmRleCA9IHRvSW50ZWdlcihpbmRleCk7XG4gIHJldHVybiBpbmRleCA8IDAgPyBtYXgoaW5kZXggKyBsZW5ndGgsIDApIDogbWluKGluZGV4LCBsZW5ndGgpO1xufTsiLCIvLyA3LjEuNCBUb0ludGVnZXJcbnZhciBjZWlsICA9IE1hdGguY2VpbFxuICAsIGZsb29yID0gTWF0aC5mbG9vcjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXNOYU4oaXQgPSAraXQpID8gMCA6IChpdCA+IDAgPyBmbG9vciA6IGNlaWwpKGl0KTtcbn07IiwiLy8gdG8gaW5kZXhlZCBvYmplY3QsIHRvT2JqZWN0IHdpdGggZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBzdHJpbmdzXG52YXIgSU9iamVjdCA9IHJlcXVpcmUoJy4vX2lvYmplY3QnKVxuICAsIGRlZmluZWQgPSByZXF1aXJlKCcuL19kZWZpbmVkJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIElPYmplY3QoZGVmaW5lZChpdCkpO1xufTsiLCIvLyA3LjEuMTUgVG9MZW5ndGhcbnZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuL190by1pbnRlZ2VyJylcbiAgLCBtaW4gICAgICAgPSBNYXRoLm1pbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXQgPiAwID8gbWluKHRvSW50ZWdlcihpdCksIDB4MWZmZmZmZmZmZmZmZmYpIDogMDsgLy8gcG93KDIsIDUzKSAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MVxufTsiLCIvLyA3LjEuMSBUb1ByaW1pdGl2ZShpbnB1dCBbLCBQcmVmZXJyZWRUeXBlXSlcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xuLy8gaW5zdGVhZCBvZiB0aGUgRVM2IHNwZWMgdmVyc2lvbiwgd2UgZGlkbid0IGltcGxlbWVudCBAQHRvUHJpbWl0aXZlIGNhc2Vcbi8vIGFuZCB0aGUgc2Vjb25kIGFyZ3VtZW50IC0gZmxhZyAtIHByZWZlcnJlZCB0eXBlIGlzIGEgc3RyaW5nXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0LCBTKXtcbiAgaWYoIWlzT2JqZWN0KGl0KSlyZXR1cm4gaXQ7XG4gIHZhciBmbiwgdmFsO1xuICBpZihTICYmIHR5cGVvZiAoZm4gPSBpdC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKXJldHVybiB2YWw7XG4gIGlmKHR5cGVvZiAoZm4gPSBpdC52YWx1ZU9mKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpcmV0dXJuIHZhbDtcbiAgaWYoIVMgJiYgdHlwZW9mIChmbiA9IGl0LnRvU3RyaW5nKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpcmV0dXJuIHZhbDtcbiAgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY29udmVydCBvYmplY3QgdG8gcHJpbWl0aXZlIHZhbHVlXCIpO1xufTsiLCJ2YXIgaWQgPSAwXG4gICwgcHggPSBNYXRoLnJhbmRvbSgpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihrZXkpe1xuICByZXR1cm4gJ1N5bWJvbCgnLmNvbmNhdChrZXkgPT09IHVuZGVmaW5lZCA/ICcnIDoga2V5LCAnKV8nLCAoKytpZCArIHB4KS50b1N0cmluZygzNikpO1xufTsiLCJ2YXIgc3RvcmUgICAgICA9IHJlcXVpcmUoJy4vX3NoYXJlZCcpKCd3a3MnKVxuICAsIHVpZCAgICAgICAgPSByZXF1aXJlKCcuL191aWQnKVxuICAsIFN5bWJvbCAgICAgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5TeW1ib2xcbiAgLCBVU0VfU1lNQk9MID0gdHlwZW9mIFN5bWJvbCA9PSAnZnVuY3Rpb24nO1xuXG52YXIgJGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5hbWUpe1xuICByZXR1cm4gc3RvcmVbbmFtZV0gfHwgKHN0b3JlW25hbWVdID1cbiAgICBVU0VfU1lNQk9MICYmIFN5bWJvbFtuYW1lXSB8fCAoVVNFX1NZTUJPTCA/IFN5bWJvbCA6IHVpZCkoJ1N5bWJvbC4nICsgbmFtZSkpO1xufTtcblxuJGV4cG9ydHMuc3RvcmUgPSBzdG9yZTsiLCIndXNlIHN0cmljdCc7XG4vLyBodHRwczovL2dpdGh1Yi5jb20vdGMzOS9BcnJheS5wcm90b3R5cGUuaW5jbHVkZXNcbnZhciAkZXhwb3J0ICAgPSByZXF1aXJlKCcuL19leHBvcnQnKVxuICAsICRpbmNsdWRlcyA9IHJlcXVpcmUoJy4vX2FycmF5LWluY2x1ZGVzJykodHJ1ZSk7XG5cbiRleHBvcnQoJGV4cG9ydC5QLCAnQXJyYXknLCB7XG4gIGluY2x1ZGVzOiBmdW5jdGlvbiBpbmNsdWRlcyhlbCAvKiwgZnJvbUluZGV4ID0gMCAqLyl7XG4gICAgcmV0dXJuICRpbmNsdWRlcyh0aGlzLCBlbCwgYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWQpO1xuICB9XG59KTtcblxucmVxdWlyZSgnLi9fYWRkLXRvLXVuc2NvcGFibGVzJykoJ2luY2x1ZGVzJyk7IiwiXG4vKipcbiAqIE1vZHVsZSBleHBvcnRzLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0RG9jdW1lbnQ7XG5cbi8vIGRlZmluZWQgYnkgdzNjXG52YXIgRE9DVU1FTlRfTk9ERSA9IDk7XG5cbi8qKlxuICogUmV0dXJucyBgdHJ1ZWAgaWYgYHdgIGlzIGEgRG9jdW1lbnQgb2JqZWN0LCBvciBgZmFsc2VgIG90aGVyd2lzZS5cbiAqXG4gKiBAcGFyYW0gez99IGQgLSBEb2N1bWVudCBvYmplY3QsIG1heWJlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc0RvY3VtZW50IChkKSB7XG4gIHJldHVybiBkICYmIGQubm9kZVR5cGUgPT09IERPQ1VNRU5UX05PREU7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgYGRvY3VtZW50YCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBnaXZlbiBgbm9kZWAsIHdoaWNoIG1heSBiZVxuICogYSBET00gZWxlbWVudCwgdGhlIFdpbmRvdyBvYmplY3QsIGEgU2VsZWN0aW9uLCBhIFJhbmdlLiBCYXNpY2FsbHkgYW55IERPTVxuICogb2JqZWN0IHRoYXQgcmVmZXJlbmNlcyB0aGUgRG9jdW1lbnQgaW4gc29tZSB3YXksIHRoaXMgZnVuY3Rpb24gd2lsbCBmaW5kIGl0LlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IG5vZGUgLSBET00gbm9kZSwgc2VsZWN0aW9uLCBvciByYW5nZSBpbiB3aGljaCB0byBmaW5kIHRoZSBgZG9jdW1lbnRgIG9iamVjdFxuICogQHJldHVybiB7RG9jdW1lbnR9IHRoZSBgZG9jdW1lbnRgIG9iamVjdCBhc3NvY2lhdGVkIHdpdGggYG5vZGVgXG4gKiBAcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZ2V0RG9jdW1lbnQobm9kZSkge1xuICBpZiAoaXNEb2N1bWVudChub2RlKSkge1xuICAgIHJldHVybiBub2RlO1xuXG4gIH0gZWxzZSBpZiAoaXNEb2N1bWVudChub2RlLm93bmVyRG9jdW1lbnQpKSB7XG4gICAgcmV0dXJuIG5vZGUub3duZXJEb2N1bWVudDtcblxuICB9IGVsc2UgaWYgKGlzRG9jdW1lbnQobm9kZS5kb2N1bWVudCkpIHtcbiAgICByZXR1cm4gbm9kZS5kb2N1bWVudDtcblxuICB9IGVsc2UgaWYgKG5vZGUucGFyZW50Tm9kZSkge1xuICAgIHJldHVybiBnZXREb2N1bWVudChub2RlLnBhcmVudE5vZGUpO1xuXG4gIC8vIFJhbmdlIHN1cHBvcnRcbiAgfSBlbHNlIGlmIChub2RlLmNvbW1vbkFuY2VzdG9yQ29udGFpbmVyKSB7XG4gICAgcmV0dXJuIGdldERvY3VtZW50KG5vZGUuY29tbW9uQW5jZXN0b3JDb250YWluZXIpO1xuXG4gIH0gZWxzZSBpZiAobm9kZS5zdGFydENvbnRhaW5lcikge1xuICAgIHJldHVybiBnZXREb2N1bWVudChub2RlLnN0YXJ0Q29udGFpbmVyKTtcblxuICAvLyBTZWxlY3Rpb24gc3VwcG9ydFxuICB9IGVsc2UgaWYgKG5vZGUuYW5jaG9yTm9kZSkge1xuICAgIHJldHVybiBnZXREb2N1bWVudChub2RlLmFuY2hvck5vZGUpO1xuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL3hwYXRoJylcbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIERPTUV4Y2VwdGlvbiB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UsIG5hbWUpIHtcbiAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlXG4gICAgdGhpcy5uYW1lID0gbmFtZVxuICAgIHRoaXMuc3RhY2sgPSAobmV3IEVycm9yKCkpLnN0YWNrXG4gIH1cbn1cblxuRE9NRXhjZXB0aW9uLnByb3RvdHlwZSA9IG5ldyBFcnJvcigpXG5cbkRPTUV4Y2VwdGlvbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBgJHt0aGlzLm5hbWV9OiAke3RoaXMubWVzc2FnZX1gXG59XG4iLCJpbXBvcnQgZ2V0RG9jdW1lbnQgZnJvbSAnZ2V0LWRvY3VtZW50J1xuXG5pbXBvcnQgRE9NRXhjZXB0aW9uIGZyb20gJy4vZG9tLWV4Y2VwdGlvbidcblxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9YUGF0aFJlc3VsdFxuY29uc3QgRklSU1RfT1JERVJFRF9OT0RFX1RZUEUgPSA5XG5cbi8vIERlZmF1bHQgbmFtZXNwYWNlIGZvciBYSFRNTCBkb2N1bWVudHNcbmNvbnN0IEhUTUxfTkFNRVNQQUNFID0gJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwnXG5cblxuLyoqXG4gKiBDb21wdXRlIGFuIFhQYXRoIGV4cHJlc3Npb24gZm9yIHRoZSBnaXZlbiBub2RlLlxuICpcbiAqIElmIHRoZSBvcHRpb25hbCBwYXJhbWV0ZXIgYHJvb3RgIGlzIHN1cHBsaWVkLCB0aGUgY29tcHV0ZWQgWFBhdGggZXhwcmVzc2lvblxuICogd2lsbCBiZSByZWxhdGl2ZSB0byBpdC4gT3RoZXJ3aXNlLCB0aGUgcm9vdCBlbGVtZW50IGlzIHRoZSByb290IG9mIHRoZVxuICogZG9jdW1lbnQgdG8gd2hpY2ggYG5vZGVgIGJlbG9uZ3MuXG4gKlxuICogQHBhcmFtIHtOb2RlfSBub2RlIFRoZSBub2RlIGZvciB3aGljaCB0byBjb21wdXRlIGFuIFhQYXRoIGV4cHJlc3Npb24uXG4gKiBAcGFyYW0ge05vZGV9IFtyb290XSBUaGUgcm9vdCBjb250ZXh0IGZvciB0aGUgWFBhdGggZXhwcmVzc2lvbi5cbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tTm9kZShub2RlLCByb290ID0gbnVsbCkge1xuICBpZiAobm9kZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdtaXNzaW5nIHJlcXVpcmVkIHBhcmFtZXRlciBcIm5vZGVcIicpXG4gIH1cblxuICByb290ID0gcm9vdCB8fCBnZXREb2N1bWVudChub2RlKVxuXG4gIGxldCBwYXRoID0gJy8nXG4gIHdoaWxlIChub2RlICE9PSByb290KSB7XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICBsZXQgbWVzc2FnZSA9ICdUaGUgc3VwcGxpZWQgbm9kZSBpcyBub3QgY29udGFpbmVkIGJ5IHRoZSByb290IG5vZGUuJ1xuICAgICAgbGV0IG5hbWUgPSAnSW52YWxpZE5vZGVUeXBlRXJyb3InXG4gICAgICB0aHJvdyBuZXcgRE9NRXhjZXB0aW9uKG1lc3NhZ2UsIG5hbWUpXG4gICAgfVxuICAgIHBhdGggPSBgLyR7bm9kZU5hbWUobm9kZSl9WyR7bm9kZVBvc2l0aW9uKG5vZGUpfV0ke3BhdGh9YFxuICAgIG5vZGUgPSBub2RlLnBhcmVudE5vZGVcbiAgfVxuICByZXR1cm4gcGF0aC5yZXBsYWNlKC9cXC8kLywgJycpXG59XG5cblxuLyoqXG4gKiBGaW5kIGEgbm9kZSB1c2luZyBhbiBYUGF0aCByZWxhdGl2ZSB0byB0aGUgZ2l2ZW4gcm9vdCBub2RlLlxuICpcbiAqIFRoZSBYUGF0aCBleHByZXNzaW9ucyBhcmUgZXZhbHVhdGVkIHJlbGF0aXZlIHRvIHRoZSBOb2RlIGFyZ3VtZW50IGByb290YC5cbiAqXG4gKiBJZiB0aGUgb3B0aW9uYWwgcGFyYW1ldGVyIGByZXNvbHZlcmAgaXMgc3VwcGxpZWQsIGl0IHdpbGwgYmUgdXNlZCB0byByZXNvbHZlXG4gKiBhbnkgbmFtZXNwYWNlcyB3aXRoaW4gdGhlIFhQYXRoLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIEFuIFhQYXRoIFN0cmluZyB0byBldmFsdWF0ZS5cbiAqIEBwYXJhbSB7Tm9kZX0gcm9vdCBUaGUgcm9vdCBjb250ZXh0IGZvciB0aGUgWFBhdGggZXhwcmVzc2lvbi5cbiAqIEByZXR1cm5zIHtOb2RlfG51bGx9IFRoZSBmaXJzdCBtYXRjaGluZyBOb2RlIG9yIG51bGwgaWYgbm9uZSBpcyBmb3VuZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvTm9kZShwYXRoLCByb290LCByZXNvbHZlciA9IG51bGwpIHtcbiAgaWYgKHBhdGggPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFcnJvcignbWlzc2luZyByZXF1aXJlZCBwYXJhbWV0ZXIgXCJwYXRoXCInKVxuICB9XG4gIGlmIChyb290ID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ21pc3NpbmcgcmVxdWlyZWQgcGFyYW1ldGVyIFwicm9vdFwiJylcbiAgfVxuXG4gIC8vIE1ha2UgdGhlIHBhdGggcmVsYXRpdmUgdG8gdGhlIHJvb3QsIGlmIG5vdCB0aGUgZG9jdW1lbnQuXG4gIGxldCBkb2N1bWVudCA9IGdldERvY3VtZW50KHJvb3QpXG4gIGlmIChyb290ICE9PSBkb2N1bWVudCkgcGF0aCA9IHBhdGgucmVwbGFjZSgvXlxcLy8sICcuLycpXG5cbiAgLy8gTWFrZSBhIGRlZmF1bHQgcmVzb2x2ZXIuXG4gIGxldCBkb2N1bWVudEVsZW1lbnQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRcbiAgaWYgKHJlc29sdmVyID09PSBudWxsICYmIGRvY3VtZW50RWxlbWVudC5sb29rdXBOYW1lc3BhY2VVUkkpIHtcbiAgICBsZXQgZGVmYXVsdE5TID0gZG9jdW1lbnRFbGVtZW50Lmxvb2t1cE5hbWVzcGFjZVVSSShudWxsKSB8fCBIVE1MX05BTUVTUEFDRVxuICAgIHJlc29sdmVyID0gKHByZWZpeCkgPT4ge1xuICAgICAgbGV0IG5zID0geydfZGVmYXVsdF8nOiBkZWZhdWx0TlN9XG4gICAgICByZXR1cm4gbnNbcHJlZml4XSB8fCBkb2N1bWVudEVsZW1lbnQubG9va3VwTmFtZXNwYWNlVVJJKHByZWZpeClcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzb2x2ZShwYXRoLCByb290LCByZXNvbHZlcilcbn1cblxuXG4vLyBHZXQgdGhlIFhQYXRoIG5vZGUgbmFtZS5cbmZ1bmN0aW9uIG5vZGVOYW1lKG5vZGUpIHtcbiAgc3dpdGNoIChub2RlLm5vZGVOYW1lKSB7XG4gIGNhc2UgJyN0ZXh0JzogcmV0dXJuICd0ZXh0KCknXG4gIGNhc2UgJyNjb21tZW50JzogcmV0dXJuICdjb21tZW50KCknXG4gIGNhc2UgJyNjZGF0YS1zZWN0aW9uJzogcmV0dXJuICdjZGF0YS1zZWN0aW9uKCknXG4gIGRlZmF1bHQ6IHJldHVybiBub2RlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKClcbiAgfVxufVxuXG5cbi8vIEdldCB0aGUgb3JkaW5hbCBwb3NpdGlvbiBvZiB0aGlzIG5vZGUgYW1vbmcgaXRzIHNpYmxpbmdzIG9mIHRoZSBzYW1lIG5hbWUuXG5mdW5jdGlvbiBub2RlUG9zaXRpb24obm9kZSkge1xuICBsZXQgbmFtZSA9IG5vZGUubm9kZU5hbWVcbiAgbGV0IHBvc2l0aW9uID0gMVxuICB3aGlsZSAoKG5vZGUgPSBub2RlLnByZXZpb3VzU2libGluZykpIHtcbiAgICBpZiAobm9kZS5ub2RlTmFtZSA9PT0gbmFtZSkgcG9zaXRpb24gKz0gMVxuICB9XG4gIHJldHVybiBwb3NpdGlvblxufVxuXG5cbi8vIEZpbmQgYSBzaW5nbGUgbm9kZSB3aXRoIFhQYXRoIGBwYXRoYFxuZnVuY3Rpb24gcmVzb2x2ZShwYXRoLCByb290LCByZXNvbHZlcikge1xuICB0cnkge1xuICAgIC8vIEFkZCBhIGRlZmF1bHQgdmFsdWUgdG8gZWFjaCBwYXRoIHBhcnQgbGFja2luZyBhIHByZWZpeC5cbiAgICBsZXQgbnNwYXRoID0gcGF0aC5yZXBsYWNlKC9cXC8oPyFcXC4pKFteXFwvOlxcKF0rKSg/PVxcL3wkKS9nLCAnL19kZWZhdWx0XzokMScpXG4gICAgcmV0dXJuIHBsYXRmb3JtUmVzb2x2ZShuc3BhdGgsIHJvb3QsIHJlc29sdmVyKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gZmFsbGJhY2tSZXNvbHZlKHBhdGgsIHJvb3QpXG4gIH1cbn1cblxuXG4vLyBGaW5kIGEgc2luZ2xlIG5vZGUgd2l0aCBYUGF0aCBgcGF0aGAgdXNpbmcgdGhlIHNpbXBsZSwgYnVpbHQtaW4gZXZhbHVhdG9yLlxuZnVuY3Rpb24gZmFsbGJhY2tSZXNvbHZlKHBhdGgsIHJvb3QpIHtcbiAgbGV0IHN0ZXBzID0gcGF0aC5zcGxpdChcIi9cIilcbiAgbGV0IG5vZGUgPSByb290XG4gIHdoaWxlIChub2RlKSB7XG4gICAgbGV0IHN0ZXAgPSBzdGVwcy5zaGlmdCgpXG4gICAgaWYgKHN0ZXAgPT09IHVuZGVmaW5lZCkgYnJlYWtcbiAgICBpZiAoc3RlcCA9PT0gJy4nKSBjb250aW51ZVxuICAgIGxldCBbbmFtZSwgcG9zaXRpb25dID0gc3RlcC5zcGxpdCgvW1xcW1xcXV0vKVxuICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoJ19kZWZhdWx0XzonLCAnJylcbiAgICBwb3NpdGlvbiA9IHBvc2l0aW9uID8gcGFyc2VJbnQocG9zaXRpb24pIDogMVxuICAgIG5vZGUgPSBmaW5kQ2hpbGQobm9kZSwgbmFtZSwgcG9zaXRpb24pXG4gIH1cbiAgcmV0dXJuIG5vZGVcbn1cblxuXG4vLyBGaW5kIGEgc2luZ2xlIG5vZGUgd2l0aCBYUGF0aCBgcGF0aGAgdXNpbmcgYGRvY3VtZW50LmV2YWx1YXRlYC5cbmZ1bmN0aW9uIHBsYXRmb3JtUmVzb2x2ZShwYXRoLCByb290LCByZXNvbHZlcikge1xuICBsZXQgZG9jdW1lbnQgPSBnZXREb2N1bWVudChyb290KVxuICBsZXQgciA9IGRvY3VtZW50LmV2YWx1YXRlKHBhdGgsIHJvb3QsIHJlc29sdmVyLCBGSVJTVF9PUkRFUkVEX05PREVfVFlQRSwgbnVsbClcbiAgcmV0dXJuIHIuc2luZ2xlTm9kZVZhbHVlXG59XG5cblxuLy8gRmluZCB0aGUgY2hpbGQgb2YgdGhlIGdpdmVuIG5vZGUgYnkgbmFtZSBhbmQgb3JkaW5hbCBwb3NpdGlvbi5cbmZ1bmN0aW9uIGZpbmRDaGlsZChub2RlLCBuYW1lLCBwb3NpdGlvbikge1xuICBmb3IgKG5vZGUgPSBub2RlLmZpcnN0Q2hpbGQgOyBub2RlIDsgbm9kZSA9IG5vZGUubmV4dFNpYmxpbmcpIHtcbiAgICBpZiAobm9kZU5hbWUobm9kZSkgPT09IG5hbWUgJiYgLS1wb3NpdGlvbiA9PT0gMCkgYnJlYWtcbiAgfVxuICByZXR1cm4gbm9kZVxufVxuIiwiLyogTGliIHRvIGdldCB4cGF0aCBmb3IgYSBET00gbm9kZSAqL1xuY29uc3QgeHBhdGggPSByZXF1aXJlKCdzaW1wbGUteHBhdGgtcG9zaXRpb24nKTtcblxuLyogUG9seWZpbGwgZm9yIEFycmF5LnByb3RvdHlwZS5pbmNsdWRlcyAqL1xucmVxdWlyZSgnY29yZS1qcy9mbi9hcnJheS9pbmNsdWRlcycpO1xuXG4vKiBXaGl0ZWxpc3Qgb2YgRE9NIGV2ZW50cyB0aGF0IGFyZSByZWNvcmRlZCAqL1xuY29uc3QgZXZlbnRUeXBlcyA9IFsnY2xpY2snLCAna2V5cHJlc3MnXTtcblxuLyogSGFja3kgZXZlbnRzICovXG5jb25zdCBzcGVjaWFsRXZlbnRUeXBlcyA9IFsna2V5ZG93biddO1xuXG5sZXQgZXZlbnRzID0gW107XG5cbi8qIENyZWF0ZSBldmVudCBoYW5kbGVycyBmb3IgZWFjaCBldmVudCB0eXBlIC0gY2FsbCBgcmVjb3JkYCBmdW5jdGlvbiAqL1xuY29uc3QgZ2V0RXZlbnRIYW5kbGVycyA9ICgpID0+IHtcbiAgICBsZXQgaGFuZGxlcnMgPSB7fTtcbiAgICBldmVudFR5cGVzLm1hcCh0eXBlID0+IGhhbmRsZXJzW3R5cGVdID0gcmVjb3JkRXZlbnQpO1xuICAgIHNwZWNpYWxFdmVudFR5cGVzLm1hcCh0eXBlID0+IGhhbmRsZXJzW3R5cGVdID0gcmVjb3JkRXZlbnQpO1xuICAgIHJldHVybiBoYW5kbGVycztcbn07XG5cbmNvbnN0IGF0dGFjaEhhbmRsZXJzID0gKCkgPT4ge1xuICAgIGxldCBoYW5kbGVycyA9IGdldEV2ZW50SGFuZGxlcnMoKTtcbiAgICAkKCdodG1sJykub24oaGFuZGxlcnMpO1xufTtcblxuY29uc3QgZGV0YWNoSGFuZGxlcnMgPSAoKSA9PiB7XG4gICAgbGV0IGhhbmRsZXJzID0gZ2V0RXZlbnRIYW5kbGVycygpO1xuICAgICQoJ2h0bWwnKS5vZmYoaGFuZGxlcnMpO1xufTtcblxuY29uc3QgcmVjb3JkRXZlbnQgPSAoZXZlbnQpID0+IHtcbiAgICAvKiBPbmx5IHJlY29yZCB3aGl0ZWxpc3RlZCBldmVudCB0eXBlcyAqL1xuICAgIGlmICghZXZlbnRUeXBlcy5pbmNsdWRlcyhldmVudC50eXBlKSkge1xuICAgICAgICAvKiBTb21lIGV2ZW50cyBsaWtlIGtleWRvd24gbmVlZCBzcGVjaWFsIHRyZWF0bWVudCAqL1xuICAgICAgICBpZiAoc3BlY2lhbEV2ZW50VHlwZXMuaW5jbHVkZXMoZXZlbnQudHlwZSkpIGhhbmRsZUhhY2tzKGV2ZW50KTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogV2Ugd2FudCB0byBnZXQgdGhlIHhwYXRoIG9mIHRoZSBET00gZWxlbWVudC5cbiAgICAgKlxuICAgICAqIERlcGVuZGluZyBvbiB0aGUgaW50ZXJmYWNlLCB0aGUgZWxlbWVudCBtaWdodCBvclxuICAgICAqIG1pZ2h0IG5vdCBzdGF5IGluIHRoZSBET00gdHJlZSBhZnRlciB0aGUgZXZlbnQuXG4gICAgICpcbiAgICAgKiBXZSBuZWVkIHRvIGhpamFjayB0aGUgZXZlbnQsIHJ1biBvdXIgY29kZSBmaXJzdFxuICAgICAqIGFuZCB0aGVuIHBsYXkgdGhlIGV2ZW50LlxuICAgICAqL1xuICAgIGlmIChldmVudC5wcmV2ZW50RGVmYXVsdCkgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIC8qIEFkZGluZyBhIHdhaXQgYmVmb3JlIGVhY2ggdXNlciBldmVudCAqL1xuICAgIGV2ZW50cy5wdXNoKGdldFdhaXRFdmVudCgpKTtcblxuICAgIGxldCBzeW50aGV0aWNFdmVudCA9IHtcbiAgICAgICAgdHlwZTogZXZlbnQudHlwZSxcbiAgICAgICAgd2hpY2g6IGV2ZW50LndoaWNoLFxuICAgICAgICBwYXRoOiB4cGF0aC5mcm9tTm9kZShldmVudC50YXJnZXQsIGRvY3VtZW50KVxuICAgIH07XG4gICAgZXZlbnRzLnB1c2goc3ludGhldGljRXZlbnQpO1xuXG4gICAgaWYgKCFldmVudC5oYWNreSkgcGxheUV2ZW50KHN5bnRoZXRpY0V2ZW50KTtcbn07XG5cbmNvbnN0IGhhbmRsZUhhY2tzID0gKGV2ZW50KSA9PiB7XG4gICAgLyogVGhlIGtleXByZXNzIGV2ZW50IGRvZXMgbm90IGNhdGNoIGJhY2sgc3BhY2Uga2V5ICovXG4gICAgaWYgKGV2ZW50LnR5cGUgPT09ICdrZXlkb3duJyAmJiBldmVudC53aGljaCA9PT0gOCkgYmFja3NwYWNlSGFjayhldmVudCk7XG59O1xuXG5jb25zdCBiYWNrc3BhY2VIYWNrID0gKHt3aGljaCwgdGFyZ2V0fSkgPT4ge1xuICAgIGxldCBjdXN0b21FdmVudCA9IHtcbiAgICAgICAgdHlwZTogJ2tleXByZXNzJyxcbiAgICAgICAgd2hpY2gsXG4gICAgICAgIHRhcmdldCxcbiAgICAgICAgaGFja3k6IHRydWVcbiAgICB9O1xuICAgIHJlY29yZEV2ZW50KGN1c3RvbUV2ZW50KTtcbn07XG5cbmxldCBsYXN0RXZlbnRUaW1lc3RhbXA7XG5jb25zdCBnZXRXYWl0RXZlbnQgPSAoKSA9PiB7XG4gICAgbGV0IG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIGxldCBldmVudCA9IHtcbiAgICAgICAgdHlwZTogJ3dhaXQnLFxuICAgICAgICAvKiBSZXR1cm4gdGltZSBzaW5jZSBsYXN0IGV2ZW50ICovXG4gICAgICAgIGR1cmF0aW9uOiAobm93IC0gbGFzdEV2ZW50VGltZXN0YW1wKSB8fCAwXG4gICAgfTtcblxuICAgIGxhc3RFdmVudFRpbWVzdGFtcCA9IG5vdztcbiAgICByZXR1cm4gZXZlbnQ7XG59O1xuXG5jb25zdCBnZXRFbGVtZW50ID0gKHBhdGgpID0+IHtcbiAgICByZXR1cm4geHBhdGgudG9Ob2RlKHBhdGgsIGRvY3VtZW50KTtcbn07XG5cbi8qIFBsYXkgYW4gZXZlbnQgKi9cbmNvbnN0IHBsYXlFdmVudCA9IChldmVudCkgPT4ge1xuICAgIC8vIFRPRE86IFNpbXBsaWZ5IHRoaXMgZnVuY3Rpb24gd2l0aCBhc3luYy1hd2FpdFxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgLypcbiAgICAgICAgICogRG9uJ3Qgd2FudCBzeW50aGV0aWMgZXZlbnRzIHRvIGJlIHJlY29yZGVkIHdoaWxlIHdoZW4gd2UgcGxheSB0aGVtLlxuICAgICAgICAgKiBXZSB3aWxsIGVuZCB1cCBpbiBhbiBpbmZpbml0ZSBsb29wIG90aGVyd2lzZVxuICAgICAgICAqL1xuICAgICAgICBzdG9wUmVjb3JkaW5nKCk7XG5cbiAgICAgICAgLypcbiAgICAgICAgKiBBbGwgZXZlbnRzIHJldHVybiBhIHByb21pc2Ugd2hpY2ggaXMgcmVzb2x2ZWQgYWZ0ZXJcbiAgICAgICAgKiB0aGUgZXZlbnQgaXMgY29tcGxldGVkLiBVc2VmdWwgZm9yIHdhaXQgZXZlbnRzXG4gICAgICAgICovXG4gICAgICAgIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGxldCB0eXBlID0gZXZlbnQudHlwZTtcbiAgICAgICAgICAgIC8vIFRPRE86IENyZWF0ZSBhbiBldmVudCBtYXAgZm9yIGV2ZW50c1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdjbGljaycpIGNsaWNrKGV2ZW50LCByZXNvbHZlKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGUgPT09ICdrZXlwcmVzcycpIGtleXByZXNzKGV2ZW50LCByZXNvbHZlKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGUgPT09ICd3YWl0Jykgd2FpdChldmVudCwgcmVzb2x2ZSk7XG4gICAgICAgICAgICBlbHNlIHJlamVjdChuZXcgRXJyb3IoJ1Vua25vd24gZXZlbnQgdHlwZS4gQ291bGQgbm90IHBsYXknKSk7XG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLyogUmUtYXR0YWNoIGhhbmRsZXJzIGFmdGVyIGV2ZW50IGlzIHBsYXllZCAqL1xuICAgICAgICAgICAgcmVzdW1lUmVjb3JkaW5nKCk7IC8vVE9ETzogRG9uJ3QgYXR0YWNoIGluIHBsYXliYWNrIG1vZGVcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG4vKlxuICogU2ltdWxhdGUgZXZlbnRzXG4gKiBFYWNoIGhhbmRsZXIgZ2V0cyB0aGUgZXZlbnQgb2JqZWN0XG4gKiBhbmQgdGhlIHJlc29sdmUgZnVuY3Rpb24gZm9yIGl0J3MgcHJvbWlzZVxuICogcmVzb2x2ZSgpIG11c3QgYmUgY2FsbGVkIGF0IHRoZSBlbmQgb2YgdGhlIGZ1bmN0aW9uXG4gKi9cblxuY29uc3QgY2xpY2sgPSAoe3BhdGh9LCByZXNvbHZlKSA9PiB7XG4gICAgbGV0IGVsZW1lbnQgPSBnZXRFbGVtZW50KHBhdGgpO1xuICAgICQoZWxlbWVudCkudHJpZ2dlcignY2xpY2snKTtcbiAgICByZXNvbHZlKCk7XG59O1xuXG5jb25zdCBrZXlwcmVzcyA9ICh7cGF0aCwgd2hpY2h9LHJlc29sdmUpID0+IHtcbiAgICBsZXQgZWxlbWVudCA9IGdldEVsZW1lbnQocGF0aCk7XG4gICAgbGV0IGN1cnJlbnRWYWx1ZSA9ICQoZWxlbWVudCkudmFsKCk7XG4gICAgaWYgKHdoaWNoID09PSA4KSB7XG4gICAgICAgIC8qIE1hbnVhbGx5IGhhbmRsZSBiYWNrc3BhY2UgKi9cbiAgICAgICAgJChlbGVtZW50KS52YWwoY3VycmVudFZhbHVlLnN1YnN0cmluZygwLCBjdXJyZW50VmFsdWUubGVuZ3RoLTEpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsZXQga2V5ID0gU3RyaW5nLmZyb21DaGFyQ29kZSh3aGljaCk7XG4gICAgICAgIC8qIE1hbnVhbGx5IGFkZCBjaGFyYWNodGVyICovXG4gICAgICAgICQoZWxlbWVudCkudmFsKGN1cnJlbnRWYWx1ZSArIGtleSk7XG4gICAgfVxuICAgIC8qIFRyaWdnZXIgZXZlbnQgKi9cbiAgICAkKGVsZW1lbnQpLnRyaWdnZXIoalF1ZXJ5LkV2ZW50KCdrZXlkb3duJywge3doaWNofSkpO1xuICAgICQoZWxlbWVudCkudHJpZ2dlcihqUXVlcnkuRXZlbnQoJ2tleXVwJywge3doaWNofSkpO1xuICAgIHJlc29sdmUoKTtcbn07XG5cbmNvbnN0IHdhaXQgPSAoe2R1cmF0aW9ufSwgcmVzb2x2ZSkgPT4ge1xuICAgIHNldFRpbWVvdXQoKCkgPT4gcmVzb2x2ZSgpLCBkdXJhdGlvbik7XG59O1xuXG4vKiBQbGF5IGFsbCByZWNvcmRlZCBldmVudHMgKi9cbmNvbnN0IHBsYXkgPSAoKSA9PiB7XG4gICAgZXZlbnRzID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndmhzJykpLmV2ZW50cztcbiAgICBwbGF5RXZlbnRzUmVjdXJzaXZlbHkoMCk7XG59XG5cbmNvbnN0IHBsYXlFdmVudHNSZWN1cnNpdmVseSA9IChpbmRleCkgPT4ge1xuICAgIGlmICghZXZlbnRzW2luZGV4XSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHBsYXlFdmVudChldmVudHNbaW5kZXhdKS50aGVuKCgpID0+IHBsYXlFdmVudHNSZWN1cnNpdmVseSgrK2luZGV4KSk7XG59O1xuXG5sZXQgaXNSZWNvcmRpbmcgPSBmYWxzZTtcbmNvbnN0IHJlY29yZCA9ICgpID0+IHtcbiAgICBldmVudHMgPSBbXTtcbiAgICByZXN1bWVSZWNvcmRpbmcoKTtcbn07XG5cbmNvbnN0IHN0b3BSZWNvcmRpbmcgPSAoKSA9PiB7XG4gICAgZGV0YWNoSGFuZGxlcnMoKTtcbiAgICBpc1JlY29yZGluZyA9IGZhbHNlO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd2aHMnLCBKU09OLnN0cmluZ2lmeSh7ZXZlbnRzfSkpO1xufTtcblxuY29uc3QgcmVzdW1lUmVjb3JkaW5nID0gKCkgPT4ge1xuICAgIGF0dGFjaEhhbmRsZXJzKCk7XG4gICAgaXNSZWNvcmRpbmcgPSB0cnVlO1xufTtcblxuJCgoKSA9PiB7XG4gICAgLyogRXhwb3NlIHB1YmxpYyBmdW5jdGlvbnMgKi9cbiAgICB3aW5kb3cudmhzID0ge1xuICAgICAgICBwbGF5LFxuICAgICAgICBldmVudHMsXG4gICAgICAgIHJlY29yZDogcmVjb3JkLFxuICAgICAgICBzdG9wOiBzdG9wUmVjb3JkaW5nIC8vVE9ETzogQ2hhbmdlIGFtYmlndW91cyBuYW1lXG4gICAgfVxufSk7XG4iXX0=
