(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports={
    "apiKey": "AIzaSyDPnnasZKi8ilO-e-Ksc4DHGQ0h99gP9Co",
    "authDomain": "cassette-52963.firebaseapp.com",
    "databaseURL": "https://cassette-52963.firebaseio.com",
    "storageBucket": "cassette-52963.appspot.com",
    "messagingSenderId": "930696706861"
};

},{}],2:[function(require,module,exports){
require('../../modules/es7.array.includes');
module.exports = require('../../modules/_core').Array.includes;
},{"../../modules/_core":8,"../../modules/es7.array.includes":32}],3:[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],4:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = require('./_wks')('unscopables')
  , ArrayProto  = Array.prototype;
if(ArrayProto[UNSCOPABLES] == undefined)require('./_hide')(ArrayProto, UNSCOPABLES, {});
module.exports = function(key){
  ArrayProto[UNSCOPABLES][key] = true;
};
},{"./_hide":17,"./_wks":31}],5:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./_is-object":20}],6:[function(require,module,exports){
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
},{"./_to-index":25,"./_to-iobject":27,"./_to-length":28}],7:[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],8:[function(require,module,exports){
var core = module.exports = {version: '2.4.0'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],9:[function(require,module,exports){
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
},{"./_a-function":3}],10:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],11:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_fails":14}],12:[function(require,module,exports){
var isObject = require('./_is-object')
  , document = require('./_global').document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./_global":15,"./_is-object":20}],13:[function(require,module,exports){
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
},{"./_core":8,"./_ctx":9,"./_global":15,"./_hide":17,"./_redefine":23}],14:[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],15:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],16:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],17:[function(require,module,exports){
var dP         = require('./_object-dp')
  , createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function(object, key, value){
  return dP.f(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./_descriptors":11,"./_object-dp":21,"./_property-desc":22}],18:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function(){
  return Object.defineProperty(require('./_dom-create')('div'), 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_descriptors":11,"./_dom-create":12,"./_fails":14}],19:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./_cof":7}],20:[function(require,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],21:[function(require,module,exports){
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
},{"./_an-object":5,"./_descriptors":11,"./_ie8-dom-define":18,"./_to-primitive":29}],22:[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],23:[function(require,module,exports){
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
},{"./_core":8,"./_global":15,"./_has":16,"./_hide":17,"./_uid":30}],24:[function(require,module,exports){
var global = require('./_global')
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./_global":15}],25:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , max       = Math.max
  , min       = Math.min;
module.exports = function(index, length){
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};
},{"./_to-integer":26}],26:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],27:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject')
  , defined = require('./_defined');
module.exports = function(it){
  return IObject(defined(it));
};
},{"./_defined":10,"./_iobject":19}],28:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer')
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"./_to-integer":26}],29:[function(require,module,exports){
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
},{"./_is-object":20}],30:[function(require,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],31:[function(require,module,exports){
var store      = require('./_shared')('wks')
  , uid        = require('./_uid')
  , Symbol     = require('./_global').Symbol
  , USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function(name){
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;
},{"./_global":15,"./_shared":24,"./_uid":30}],32:[function(require,module,exports){
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
},{"./_add-to-unscopables":4,"./_array-includes":6,"./_export":13}],33:[function(require,module,exports){
/*!
 * Draggabilly v2.1.1
 * Make that shiz draggable
 * http://draggabilly.desandro.com
 * MIT license
 */

/*jshint browser: true, strict: true, undef: true, unused: true */

( function( window, factory ) {
  // universal module definition
  /* jshint strict: false */ /*globals define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
        'get-size/get-size',
        'unidragger/unidragger'
      ],
      function( getSize, Unidragger ) {
        return factory( window, getSize, Unidragger );
      });
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      window,
      require('get-size'),
      require('unidragger')
    );
  } else {
    // browser global
    window.Draggabilly = factory(
      window,
      window.getSize,
      window.Unidragger
    );
  }

}( window, function factory( window, getSize, Unidragger ) {

'use strict';

// vars
var document = window.document;

function noop() {}

// -------------------------- helpers -------------------------- //

// extend objects
function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}

function isElement( obj ) {
  return obj instanceof HTMLElement;
}

// -------------------------- requestAnimationFrame -------------------------- //

// get rAF, prefixed, if present
var requestAnimationFrame = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

// fallback to setTimeout
var lastTime = 0;
if ( !requestAnimationFrame )  {
  requestAnimationFrame = function( callback ) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
    var id = setTimeout( callback, timeToCall );
    lastTime = currTime + timeToCall;
    return id;
  };
}

// -------------------------- support -------------------------- //

var docElem = document.documentElement;
var transformProperty = typeof docElem.style.transform == 'string' ?
  'transform' : 'WebkitTransform';

var jQuery = window.jQuery;

// --------------------------  -------------------------- //

function Draggabilly( element, options ) {
  // querySelector if string
  this.element = typeof element == 'string' ?
    document.querySelector( element ) : element;

  if ( jQuery ) {
    this.$element = jQuery( this.element );
  }

  // options
  this.options = extend( {}, this.constructor.defaults );
  this.option( options );

  this._create();
}

// inherit Unidragger methods
var proto = Draggabilly.prototype = Object.create( Unidragger.prototype );

Draggabilly.defaults = {
};

/**
 * set options
 * @param {Object} opts
 */
proto.option = function( opts ) {
  extend( this.options, opts );
};

// css position values that don't need to be set
var positionValues = {
  relative: true,
  absolute: true,
  fixed: true
};

proto._create = function() {

  // properties
  this.position = {};
  this._getPosition();

  this.startPoint = { x: 0, y: 0 };
  this.dragPoint = { x: 0, y: 0 };

  this.startPosition = extend( {}, this.position );

  // set relative positioning
  var style = getComputedStyle( this.element );
  if ( !positionValues[ style.position ] ) {
    this.element.style.position = 'relative';
  }

  this.enable();
  this.setHandles();

};

/**
 * set this.handles and bind start events to 'em
 */
proto.setHandles = function() {
  this.handles = this.options.handle ?
    this.element.querySelectorAll( this.options.handle ) : [ this.element ];

  this.bindHandles();
};

/**
 * emits events via EvEmitter and jQuery events
 * @param {String} type - name of event
 * @param {Event} event - original event
 * @param {Array} args - extra arguments
 */
proto.dispatchEvent = function( type, event, args ) {
  var emitArgs = [ event ].concat( args );
  this.emitEvent( type, emitArgs );
  var jQuery = window.jQuery;
  // trigger jQuery event
  if ( jQuery && this.$element ) {
    if ( event ) {
      // create jQuery event
      var $event = jQuery.Event( event );
      $event.type = type;
      this.$element.trigger( $event, args );
    } else {
      // just trigger with type if no event available
      this.$element.trigger( type, args );
    }
  }
};

// -------------------------- position -------------------------- //

// get x/y position from style
proto._getPosition = function() {
  var style = getComputedStyle( this.element );
  var x = this._getPositionCoord( style.left, 'width' );
  var y = this._getPositionCoord( style.top, 'height' );
  // clean up 'auto' or other non-integer values
  this.position.x = isNaN( x ) ? 0 : x;
  this.position.y = isNaN( y ) ? 0 : y;

  this._addTransformPosition( style );
};

proto._getPositionCoord = function( styleSide, measure ) {
  if ( styleSide.indexOf('%') != -1 ) {
    // convert percent into pixel for Safari, #75
    var parentSize = getSize( this.element.parentNode );
    // prevent not-in-DOM element throwing bug, #131
    return !parentSize ? 0 :
      ( parseFloat( styleSide ) / 100 ) * parentSize[ measure ];
  }
  return parseInt( styleSide, 10 );
};

// add transform: translate( x, y ) to position
proto._addTransformPosition = function( style ) {
  var transform = style[ transformProperty ];
  // bail out if value is 'none'
  if ( transform.indexOf('matrix') !== 0 ) {
    return;
  }
  // split matrix(1, 0, 0, 1, x, y)
  var matrixValues = transform.split(',');
  // translate X value is in 12th or 4th position
  var xIndex = transform.indexOf('matrix3d') === 0 ? 12 : 4;
  var translateX = parseInt( matrixValues[ xIndex ], 10 );
  // translate Y value is in 13th or 5th position
  var translateY = parseInt( matrixValues[ xIndex + 1 ], 10 );
  this.position.x += translateX;
  this.position.y += translateY;
};

// -------------------------- events -------------------------- //

/**
 * pointer start
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
proto.pointerDown = function( event, pointer ) {
  this._dragPointerDown( event, pointer );
  // kludge to blur focused inputs in dragger
  var focused = document.activeElement;
  // do not blur body for IE10, metafizzy/flickity#117
  if ( focused && focused.blur && focused != document.body ) {
    focused.blur();
  }
  // bind move and end events
  this._bindPostStartEvents( event );
  this.element.classList.add('is-pointer-down');
  this.dispatchEvent( 'pointerDown', event, [ pointer ] );
};

/**
 * drag move
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
proto.pointerMove = function( event, pointer ) {
  var moveVector = this._dragPointerMove( event, pointer );
  this.dispatchEvent( 'pointerMove', event, [ pointer, moveVector ] );
  this._dragMove( event, pointer, moveVector );
};

/**
 * drag start
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
proto.dragStart = function( event, pointer ) {
  if ( !this.isEnabled ) {
    return;
  }
  this._getPosition();
  this.measureContainment();
  // position _when_ drag began
  this.startPosition.x = this.position.x;
  this.startPosition.y = this.position.y;
  // reset left/top style
  this.setLeftTop();

  this.dragPoint.x = 0;
  this.dragPoint.y = 0;

  this.element.classList.add('is-dragging');
  this.dispatchEvent( 'dragStart', event, [ pointer ] );
  // start animation
  this.animate();
};

proto.measureContainment = function() {
  var containment = this.options.containment;
  if ( !containment ) {
    return;
  }

  // use element if element
  var container = isElement( containment ) ? containment :
    // fallback to querySelector if string
    typeof containment == 'string' ? document.querySelector( containment ) :
    // otherwise just `true`, use the parent
    this.element.parentNode;

  var elemSize = getSize( this.element );
  var containerSize = getSize( container );
  var elemRect = this.element.getBoundingClientRect();
  var containerRect = container.getBoundingClientRect();

  var borderSizeX = containerSize.borderLeftWidth + containerSize.borderRightWidth;
  var borderSizeY = containerSize.borderTopWidth + containerSize.borderBottomWidth;

  var position = this.relativeStartPosition = {
    x: elemRect.left - ( containerRect.left + containerSize.borderLeftWidth ),
    y: elemRect.top - ( containerRect.top + containerSize.borderTopWidth )
  };

  this.containSize = {
    width: ( containerSize.width - borderSizeX ) - position.x - elemSize.width,
    height: ( containerSize.height - borderSizeY ) - position.y - elemSize.height
  };
};

// ----- move event ----- //

/**
 * drag move
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
proto.dragMove = function( event, pointer, moveVector ) {
  if ( !this.isEnabled ) {
    return;
  }
  var dragX = moveVector.x;
  var dragY = moveVector.y;

  var grid = this.options.grid;
  var gridX = grid && grid[0];
  var gridY = grid && grid[1];

  dragX = applyGrid( dragX, gridX );
  dragY = applyGrid( dragY, gridY );

  dragX = this.containDrag( 'x', dragX, gridX );
  dragY = this.containDrag( 'y', dragY, gridY );

  // constrain to axis
  dragX = this.options.axis == 'y' ? 0 : dragX;
  dragY = this.options.axis == 'x' ? 0 : dragY;

  this.position.x = this.startPosition.x + dragX;
  this.position.y = this.startPosition.y + dragY;
  // set dragPoint properties
  this.dragPoint.x = dragX;
  this.dragPoint.y = dragY;

  this.dispatchEvent( 'dragMove', event, [ pointer, moveVector ] );
};

function applyGrid( value, grid, method ) {
  method = method || 'round';
  return grid ? Math[ method ]( value / grid ) * grid : value;
}

proto.containDrag = function( axis, drag, grid ) {
  if ( !this.options.containment ) {
    return drag;
  }
  var measure = axis == 'x' ? 'width' : 'height';

  var rel = this.relativeStartPosition[ axis ];
  var min = applyGrid( -rel, grid, 'ceil' );
  var max = this.containSize[ measure ];
  max = applyGrid( max, grid, 'floor' );
  return  Math.min( max, Math.max( min, drag ) );
};

// ----- end event ----- //

/**
 * pointer up
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
proto.pointerUp = function( event, pointer ) {
  this.element.classList.remove('is-pointer-down');
  this.dispatchEvent( 'pointerUp', event, [ pointer ] );
  this._dragPointerUp( event, pointer );
};

/**
 * drag end
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
proto.dragEnd = function( event, pointer ) {
  if ( !this.isEnabled ) {
    return;
  }
  // use top left position when complete
  if ( transformProperty ) {
    this.element.style[ transformProperty ] = '';
    this.setLeftTop();
  }
  this.element.classList.remove('is-dragging');
  this.dispatchEvent( 'dragEnd', event, [ pointer ] );
};

// -------------------------- animation -------------------------- //

proto.animate = function() {
  // only render and animate if dragging
  if ( !this.isDragging ) {
    return;
  }

  this.positionDrag();

  var _this = this;
  requestAnimationFrame( function animateFrame() {
    _this.animate();
  });

};

// left/top positioning
proto.setLeftTop = function() {
  this.element.style.left = this.position.x + 'px';
  this.element.style.top  = this.position.y + 'px';
};

proto.positionDrag = function() {
  this.element.style[ transformProperty ] = 'translate3d( ' + this.dragPoint.x +
    'px, ' + this.dragPoint.y + 'px, 0)';
};

// ----- staticClick ----- //

proto.staticClick = function( event, pointer ) {
  this.dispatchEvent( 'staticClick', event, [ pointer ] );
};

// ----- methods ----- //

proto.enable = function() {
  this.isEnabled = true;
};

proto.disable = function() {
  this.isEnabled = false;
  if ( this.isDragging ) {
    this.dragEnd();
  }
};

proto.destroy = function() {
  this.disable();
  // reset styles
  this.element.style[ transformProperty ] = '';
  this.element.style.left = '';
  this.element.style.top = '';
  this.element.style.position = '';
  // unbind handles
  this.unbindHandles();
  // remove jQuery data
  if ( this.$element ) {
    this.$element.removeData('draggabilly');
  }
};

// ----- jQuery bridget ----- //

// required for jQuery bridget
proto._init = noop;

if ( jQuery && jQuery.bridget ) {
  jQuery.bridget( 'draggabilly', Draggabilly );
}

// -----  ----- //

return Draggabilly;

}));

},{"get-size":36,"unidragger":40}],34:[function(require,module,exports){
/**
 * EvEmitter v1.0.3
 * Lil' event emitter
 * MIT License
 */

/* jshint unused: true, undef: true, strict: true */

( function( global, factory ) {
  // universal module definition
  /* jshint strict: false */ /* globals define, module, window */
  if ( typeof define == 'function' && define.amd ) {
    // AMD - RequireJS
    define( factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS - Browserify, Webpack
    module.exports = factory();
  } else {
    // Browser globals
    global.EvEmitter = factory();
  }

}( typeof window != 'undefined' ? window : this, function() {

"use strict";

function EvEmitter() {}

var proto = EvEmitter.prototype;

proto.on = function( eventName, listener ) {
  if ( !eventName || !listener ) {
    return;
  }
  // set events hash
  var events = this._events = this._events || {};
  // set listeners array
  var listeners = events[ eventName ] = events[ eventName ] || [];
  // only add once
  if ( listeners.indexOf( listener ) == -1 ) {
    listeners.push( listener );
  }

  return this;
};

proto.once = function( eventName, listener ) {
  if ( !eventName || !listener ) {
    return;
  }
  // add event
  this.on( eventName, listener );
  // set once flag
  // set onceEvents hash
  var onceEvents = this._onceEvents = this._onceEvents || {};
  // set onceListeners object
  var onceListeners = onceEvents[ eventName ] = onceEvents[ eventName ] || {};
  // set flag
  onceListeners[ listener ] = true;

  return this;
};

proto.off = function( eventName, listener ) {
  var listeners = this._events && this._events[ eventName ];
  if ( !listeners || !listeners.length ) {
    return;
  }
  var index = listeners.indexOf( listener );
  if ( index != -1 ) {
    listeners.splice( index, 1 );
  }

  return this;
};

proto.emitEvent = function( eventName, args ) {
  var listeners = this._events && this._events[ eventName ];
  if ( !listeners || !listeners.length ) {
    return;
  }
  var i = 0;
  var listener = listeners[i];
  args = args || [];
  // once stuff
  var onceListeners = this._onceEvents && this._onceEvents[ eventName ];

  while ( listener ) {
    var isOnce = onceListeners && onceListeners[ listener ];
    if ( isOnce ) {
      // remove listener
      // remove before trigger to prevent recursion
      this.off( eventName, listener );
      // unset once flag
      delete onceListeners[ listener ];
    }
    // trigger listener
    listener.apply( this, args );
    // get next listener
    i += isOnce ? 0 : 1;
    listener = listeners[i];
  }

  return this;
};

return EvEmitter;

}));

},{}],35:[function(require,module,exports){

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

},{}],36:[function(require,module,exports){
/*!
 * getSize v2.0.2
 * measure size of elements
 * MIT license
 */

/*jshint browser: true, strict: true, undef: true, unused: true */
/*global define: false, module: false, console: false */

( function( window, factory ) {
  'use strict';

  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( function() {
      return factory();
    });
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory();
  } else {
    // browser global
    window.getSize = factory();
  }

})( window, function factory() {
'use strict';

// -------------------------- helpers -------------------------- //

// get a number from a string, not a percentage
function getStyleSize( value ) {
  var num = parseFloat( value );
  // not a percent like '100%', and a number
  var isValid = value.indexOf('%') == -1 && !isNaN( num );
  return isValid && num;
}

function noop() {}

var logError = typeof console == 'undefined' ? noop :
  function( message ) {
    console.error( message );
  };

// -------------------------- measurements -------------------------- //

var measurements = [
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingBottom',
  'marginLeft',
  'marginRight',
  'marginTop',
  'marginBottom',
  'borderLeftWidth',
  'borderRightWidth',
  'borderTopWidth',
  'borderBottomWidth'
];

var measurementsLength = measurements.length;

function getZeroSize() {
  var size = {
    width: 0,
    height: 0,
    innerWidth: 0,
    innerHeight: 0,
    outerWidth: 0,
    outerHeight: 0
  };
  for ( var i=0; i < measurementsLength; i++ ) {
    var measurement = measurements[i];
    size[ measurement ] = 0;
  }
  return size;
}

// -------------------------- getStyle -------------------------- //

/**
 * getStyle, get style of element, check for Firefox bug
 * https://bugzilla.mozilla.org/show_bug.cgi?id=548397
 */
function getStyle( elem ) {
  var style = getComputedStyle( elem );
  if ( !style ) {
    logError( 'Style returned ' + style +
      '. Are you running this code in a hidden iframe on Firefox? ' +
      'See http://bit.ly/getsizebug1' );
  }
  return style;
}

// -------------------------- setup -------------------------- //

var isSetup = false;

var isBoxSizeOuter;

/**
 * setup
 * check isBoxSizerOuter
 * do on first getSize() rather than on page load for Firefox bug
 */
function setup() {
  // setup once
  if ( isSetup ) {
    return;
  }
  isSetup = true;

  // -------------------------- box sizing -------------------------- //

  /**
   * WebKit measures the outer-width on style.width on border-box elems
   * IE & Firefox<29 measures the inner-width
   */
  var div = document.createElement('div');
  div.style.width = '200px';
  div.style.padding = '1px 2px 3px 4px';
  div.style.borderStyle = 'solid';
  div.style.borderWidth = '1px 2px 3px 4px';
  div.style.boxSizing = 'border-box';

  var body = document.body || document.documentElement;
  body.appendChild( div );
  var style = getStyle( div );

  getSize.isBoxSizeOuter = isBoxSizeOuter = getStyleSize( style.width ) == 200;
  body.removeChild( div );

}

// -------------------------- getSize -------------------------- //

function getSize( elem ) {
  setup();

  // use querySeletor if elem is string
  if ( typeof elem == 'string' ) {
    elem = document.querySelector( elem );
  }

  // do not proceed on non-objects
  if ( !elem || typeof elem != 'object' || !elem.nodeType ) {
    return;
  }

  var style = getStyle( elem );

  // if hidden, everything is 0
  if ( style.display == 'none' ) {
    return getZeroSize();
  }

  var size = {};
  size.width = elem.offsetWidth;
  size.height = elem.offsetHeight;

  var isBorderBox = size.isBorderBox = style.boxSizing == 'border-box';

  // get all measurements
  for ( var i=0; i < measurementsLength; i++ ) {
    var measurement = measurements[i];
    var value = style[ measurement ];
    var num = parseFloat( value );
    // any 'auto', 'medium' value will be 0
    size[ measurement ] = !isNaN( num ) ? num : 0;
  }

  var paddingWidth = size.paddingLeft + size.paddingRight;
  var paddingHeight = size.paddingTop + size.paddingBottom;
  var marginWidth = size.marginLeft + size.marginRight;
  var marginHeight = size.marginTop + size.marginBottom;
  var borderWidth = size.borderLeftWidth + size.borderRightWidth;
  var borderHeight = size.borderTopWidth + size.borderBottomWidth;

  var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;

  // overwrite width and height if we can get it from style
  var styleWidth = getStyleSize( style.width );
  if ( styleWidth !== false ) {
    size.width = styleWidth +
      // add padding and border unless it's already including it
      ( isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth );
  }

  var styleHeight = getStyleSize( style.height );
  if ( styleHeight !== false ) {
    size.height = styleHeight +
      // add padding and border unless it's already including it
      ( isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight );
  }

  size.innerWidth = size.width - ( paddingWidth + borderWidth );
  size.innerHeight = size.height - ( paddingHeight + borderHeight );

  size.outerWidth = size.width + marginWidth;
  size.outerHeight = size.height + marginHeight;

  return size;
}

return getSize;

});

},{}],37:[function(require,module,exports){
module.exports = require('./lib/xpath')

},{"./lib/xpath":39}],38:[function(require,module,exports){
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

},{}],39:[function(require,module,exports){
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

},{"./dom-exception":38,"get-document":35}],40:[function(require,module,exports){
/*!
 * Unidragger v2.1.0
 * Draggable base class
 * MIT license
 */

/*jshint browser: true, unused: true, undef: true, strict: true */

( function( window, factory ) {
  // universal module definition
  /*jshint strict: false */ /*globals define, module, require */

  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
      'unipointer/unipointer'
    ], function( Unipointer ) {
      return factory( window, Unipointer );
    });
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      window,
      require('unipointer')
    );
  } else {
    // browser global
    window.Unidragger = factory(
      window,
      window.Unipointer
    );
  }

}( window, function factory( window, Unipointer ) {

'use strict';

// -----  ----- //

function noop() {}

// -------------------------- Unidragger -------------------------- //

function Unidragger() {}

// inherit Unipointer & EvEmitter
var proto = Unidragger.prototype = Object.create( Unipointer.prototype );

// ----- bind start ----- //

proto.bindHandles = function() {
  this._bindHandles( true );
};

proto.unbindHandles = function() {
  this._bindHandles( false );
};

var navigator = window.navigator;
/**
 * works as unbinder, as you can .bindHandles( false ) to unbind
 * @param {Boolean} isBind - will unbind if falsey
 */
proto._bindHandles = function( isBind ) {
  // munge isBind, default to true
  isBind = isBind === undefined ? true : !!isBind;
  // extra bind logic
  var binderExtra;
  if ( navigator.pointerEnabled ) {
    binderExtra = function( handle ) {
      // disable scrolling on the element
      handle.style.touchAction = isBind ? 'none' : '';
    };
  } else if ( navigator.msPointerEnabled ) {
    binderExtra = function( handle ) {
      // disable scrolling on the element
      handle.style.msTouchAction = isBind ? 'none' : '';
    };
  } else {
    binderExtra = noop;
  }
  // bind each handle
  var bindMethod = isBind ? 'addEventListener' : 'removeEventListener';
  for ( var i=0; i < this.handles.length; i++ ) {
    var handle = this.handles[i];
    this._bindStartEvent( handle, isBind );
    binderExtra( handle );
    handle[ bindMethod ]( 'click', this );
  }
};

// ----- start event ----- //

/**
 * pointer start
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
proto.pointerDown = function( event, pointer ) {
  // dismiss range sliders
  if ( event.target.nodeName == 'INPUT' && event.target.type == 'range' ) {
    // reset pointerDown logic
    this.isPointerDown = false;
    delete this.pointerIdentifier;
    return;
  }

  this._dragPointerDown( event, pointer );
  // kludge to blur focused inputs in dragger
  var focused = document.activeElement;
  if ( focused && focused.blur ) {
    focused.blur();
  }
  // bind move and end events
  this._bindPostStartEvents( event );
  this.emitEvent( 'pointerDown', [ event, pointer ] );
};

// base pointer down logic
proto._dragPointerDown = function( event, pointer ) {
  // track to see when dragging starts
  this.pointerDownPoint = Unipointer.getPointerPoint( pointer );

  var canPreventDefault = this.canPreventDefaultOnPointerDown( event, pointer );
  if ( canPreventDefault ) {
    event.preventDefault();
  }
};

// overwriteable method so Flickity can prevent for scrolling
proto.canPreventDefaultOnPointerDown = function( event ) {
  // prevent default, unless touchstart or <select>
  return event.target.nodeName != 'SELECT';
};

// ----- move event ----- //

/**
 * drag move
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
proto.pointerMove = function( event, pointer ) {
  var moveVector = this._dragPointerMove( event, pointer );
  this.emitEvent( 'pointerMove', [ event, pointer, moveVector ] );
  this._dragMove( event, pointer, moveVector );
};

// base pointer move logic
proto._dragPointerMove = function( event, pointer ) {
  var movePoint = Unipointer.getPointerPoint( pointer );
  var moveVector = {
    x: movePoint.x - this.pointerDownPoint.x,
    y: movePoint.y - this.pointerDownPoint.y
  };
  // start drag if pointer has moved far enough to start drag
  if ( !this.isDragging && this.hasDragStarted( moveVector ) ) {
    this._dragStart( event, pointer );
  }
  return moveVector;
};

// condition if pointer has moved far enough to start drag
proto.hasDragStarted = function( moveVector ) {
  return Math.abs( moveVector.x ) > 3 || Math.abs( moveVector.y ) > 3;
};


// ----- end event ----- //

/**
 * pointer up
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
proto.pointerUp = function( event, pointer ) {
  this.emitEvent( 'pointerUp', [ event, pointer ] );
  this._dragPointerUp( event, pointer );
};

proto._dragPointerUp = function( event, pointer ) {
  if ( this.isDragging ) {
    this._dragEnd( event, pointer );
  } else {
    // pointer didn't move enough for drag to start
    this._staticClick( event, pointer );
  }
};

// -------------------------- drag -------------------------- //

// dragStart
proto._dragStart = function( event, pointer ) {
  this.isDragging = true;
  this.dragStartPoint = Unipointer.getPointerPoint( pointer );
  // prevent clicks
  this.isPreventingClicks = true;

  this.dragStart( event, pointer );
};

proto.dragStart = function( event, pointer ) {
  this.emitEvent( 'dragStart', [ event, pointer ] );
};

// dragMove
proto._dragMove = function( event, pointer, moveVector ) {
  // do not drag if not dragging yet
  if ( !this.isDragging ) {
    return;
  }

  this.dragMove( event, pointer, moveVector );
};

proto.dragMove = function( event, pointer, moveVector ) {
  event.preventDefault();
  this.emitEvent( 'dragMove', [ event, pointer, moveVector ] );
};

// dragEnd
proto._dragEnd = function( event, pointer ) {
  // set flags
  this.isDragging = false;
  // re-enable clicking async
  setTimeout( function() {
    delete this.isPreventingClicks;
  }.bind( this ) );

  this.dragEnd( event, pointer );
};

proto.dragEnd = function( event, pointer ) {
  this.emitEvent( 'dragEnd', [ event, pointer ] );
};

// ----- onclick ----- //

// handle all clicks and prevent clicks when dragging
proto.onclick = function( event ) {
  if ( this.isPreventingClicks ) {
    event.preventDefault();
  }
};

// ----- staticClick ----- //

// triggered after pointer down & up with no/tiny movement
proto._staticClick = function( event, pointer ) {
  // ignore emulated mouse up clicks
  if ( this.isIgnoringMouseUp && event.type == 'mouseup' ) {
    return;
  }

  // allow click in <input>s and <textarea>s
  var nodeName = event.target.nodeName;
  if ( nodeName == 'INPUT' || nodeName == 'TEXTAREA' ) {
    event.target.focus();
  }
  this.staticClick( event, pointer );

  // set flag for emulated clicks 300ms after touchend
  if ( event.type != 'mouseup' ) {
    this.isIgnoringMouseUp = true;
    // reset flag after 300ms
    setTimeout( function() {
      delete this.isIgnoringMouseUp;
    }.bind( this ), 400 );
  }
};

proto.staticClick = function( event, pointer ) {
  this.emitEvent( 'staticClick', [ event, pointer ] );
};

// ----- utils ----- //

Unidragger.getPointerPoint = Unipointer.getPointerPoint;

// -----  ----- //

return Unidragger;

}));

},{"unipointer":41}],41:[function(require,module,exports){
/*!
 * Unipointer v2.1.0
 * base class for doing one thing with pointer event
 * MIT license
 */

/*jshint browser: true, undef: true, unused: true, strict: true */

( function( window, factory ) {
  // universal module definition
  /* jshint strict: false */ /*global define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
      'ev-emitter/ev-emitter'
    ], function( EvEmitter ) {
      return factory( window, EvEmitter );
    });
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      window,
      require('ev-emitter')
    );
  } else {
    // browser global
    window.Unipointer = factory(
      window,
      window.EvEmitter
    );
  }

}( window, function factory( window, EvEmitter ) {

'use strict';

function noop() {}

function Unipointer() {}

// inherit EvEmitter
var proto = Unipointer.prototype = Object.create( EvEmitter.prototype );

proto.bindStartEvent = function( elem ) {
  this._bindStartEvent( elem, true );
};

proto.unbindStartEvent = function( elem ) {
  this._bindStartEvent( elem, false );
};

/**
 * works as unbinder, as you can ._bindStart( false ) to unbind
 * @param {Boolean} isBind - will unbind if falsey
 */
proto._bindStartEvent = function( elem, isBind ) {
  // munge isBind, default to true
  isBind = isBind === undefined ? true : !!isBind;
  var bindMethod = isBind ? 'addEventListener' : 'removeEventListener';

  if ( window.navigator.pointerEnabled ) {
    // W3C Pointer Events, IE11. See https://coderwall.com/p/mfreca
    elem[ bindMethod ]( 'pointerdown', this );
  } else if ( window.navigator.msPointerEnabled ) {
    // IE10 Pointer Events
    elem[ bindMethod ]( 'MSPointerDown', this );
  } else {
    // listen for both, for devices like Chrome Pixel
    elem[ bindMethod ]( 'mousedown', this );
    elem[ bindMethod ]( 'touchstart', this );
  }
};

// trigger handler methods for events
proto.handleEvent = function( event ) {
  var method = 'on' + event.type;
  if ( this[ method ] ) {
    this[ method ]( event );
  }
};

// returns the touch that we're keeping track of
proto.getTouch = function( touches ) {
  for ( var i=0; i < touches.length; i++ ) {
    var touch = touches[i];
    if ( touch.identifier == this.pointerIdentifier ) {
      return touch;
    }
  }
};

// ----- start event ----- //

proto.onmousedown = function( event ) {
  // dismiss clicks from right or middle buttons
  var button = event.button;
  if ( button && ( button !== 0 && button !== 1 ) ) {
    return;
  }
  this._pointerDown( event, event );
};

proto.ontouchstart = function( event ) {
  this._pointerDown( event, event.changedTouches[0] );
};

proto.onMSPointerDown =
proto.onpointerdown = function( event ) {
  this._pointerDown( event, event );
};

/**
 * pointer start
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
proto._pointerDown = function( event, pointer ) {
  // dismiss other pointers
  if ( this.isPointerDown ) {
    return;
  }

  this.isPointerDown = true;
  // save pointer identifier to match up touch events
  this.pointerIdentifier = pointer.pointerId !== undefined ?
    // pointerId for pointer events, touch.indentifier for touch events
    pointer.pointerId : pointer.identifier;

  this.pointerDown( event, pointer );
};

proto.pointerDown = function( event, pointer ) {
  this._bindPostStartEvents( event );
  this.emitEvent( 'pointerDown', [ event, pointer ] );
};

// hash of events to be bound after start event
var postStartEvents = {
  mousedown: [ 'mousemove', 'mouseup' ],
  touchstart: [ 'touchmove', 'touchend', 'touchcancel' ],
  pointerdown: [ 'pointermove', 'pointerup', 'pointercancel' ],
  MSPointerDown: [ 'MSPointerMove', 'MSPointerUp', 'MSPointerCancel' ]
};

proto._bindPostStartEvents = function( event ) {
  if ( !event ) {
    return;
  }
  // get proper events to match start event
  var events = postStartEvents[ event.type ];
  // bind events to node
  events.forEach( function( eventName ) {
    window.addEventListener( eventName, this );
  }, this );
  // save these arguments
  this._boundPointerEvents = events;
};

proto._unbindPostStartEvents = function() {
  // check for _boundEvents, in case dragEnd triggered twice (old IE8 bug)
  if ( !this._boundPointerEvents ) {
    return;
  }
  this._boundPointerEvents.forEach( function( eventName ) {
    window.removeEventListener( eventName, this );
  }, this );

  delete this._boundPointerEvents;
};

// ----- move event ----- //

proto.onmousemove = function( event ) {
  this._pointerMove( event, event );
};

proto.onMSPointerMove =
proto.onpointermove = function( event ) {
  if ( event.pointerId == this.pointerIdentifier ) {
    this._pointerMove( event, event );
  }
};

proto.ontouchmove = function( event ) {
  var touch = this.getTouch( event.changedTouches );
  if ( touch ) {
    this._pointerMove( event, touch );
  }
};

/**
 * pointer move
 * @param {Event} event
 * @param {Event or Touch} pointer
 * @private
 */
proto._pointerMove = function( event, pointer ) {
  this.pointerMove( event, pointer );
};

// public
proto.pointerMove = function( event, pointer ) {
  this.emitEvent( 'pointerMove', [ event, pointer ] );
};

// ----- end event ----- //


proto.onmouseup = function( event ) {
  this._pointerUp( event, event );
};

proto.onMSPointerUp =
proto.onpointerup = function( event ) {
  if ( event.pointerId == this.pointerIdentifier ) {
    this._pointerUp( event, event );
  }
};

proto.ontouchend = function( event ) {
  var touch = this.getTouch( event.changedTouches );
  if ( touch ) {
    this._pointerUp( event, touch );
  }
};

/**
 * pointer up
 * @param {Event} event
 * @param {Event or Touch} pointer
 * @private
 */
proto._pointerUp = function( event, pointer ) {
  this._pointerDone();
  this.pointerUp( event, pointer );
};

// public
proto.pointerUp = function( event, pointer ) {
  this.emitEvent( 'pointerUp', [ event, pointer ] );
};

// ----- pointer done ----- //

// triggered on pointer up & pointer cancel
proto._pointerDone = function() {
  // reset properties
  this.isPointerDown = false;
  delete this.pointerIdentifier;
  // remove events
  this._unbindPostStartEvents();
  this.pointerDone();
};

proto.pointerDone = noop;

// ----- pointer cancel ----- //

proto.onMSPointerCancel =
proto.onpointercancel = function( event ) {
  if ( event.pointerId == this.pointerIdentifier ) {
    this._pointerCancel( event, event );
  }
};

proto.ontouchcancel = function( event ) {
  var touch = this.getTouch( event.changedTouches );
  if ( touch ) {
    this._pointerCancel( event, touch );
  }
};

/**
 * pointer cancel
 * @param {Event} event
 * @param {Event or Touch} pointer
 * @private
 */
proto._pointerCancel = function( event, pointer ) {
  this._pointerDone();
  this.pointerCancel( event, pointer );
};

// public
proto.pointerCancel = function( event, pointer ) {
  this.emitEvent( 'pointerCancel', [ event, pointer ] );
};

// -----  ----- //

// utility function for getting x/y coords from event
Unipointer.getPointerPoint = function( pointer ) {
  return {
    x: pointer.pageX,
    y: pointer.pageY
  };
};

// -----  ----- //

return Unipointer;

}));

},{"ev-emitter":34}],42:[function(require,module,exports){
/**
 * Within Viewport
 *
 * @description Determines whether an element is completely within the browser viewport
 * @author      Craig Patik, http://patik.com/
 * @version     1.0.0
 * @date        2015-08-02
 */
(function (root, name, factory) {
    // AMD
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    }
    // Node and CommonJS-like environments
    else if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = factory();
    }
    // Browser global
    else {
        root[name] = factory();
    }
}(this, 'withinviewport', function () {
    var canUseWindowDimensions = window.innerHeight !== undefined; // IE 8 and lower fail this

    /**
     * Determines whether an element is within the viewport
     * @param  {Object}  elem       DOM Element (required)
     * @param  {Object}  options    Optional settings
     * @return {Boolean}            Whether the element was completely within the viewport
    */
    var withinviewport = function withinviewport (elem, options) {
        var result = false;
        var metadata = {};
        var config = {};
        var settings;
        var isWithin;
        var elemBoundingRect;
        var sideNamesPattern;
        var sides;
        var side;
        var i;

        // If invoked by the jQuery plugin, get the actual DOM element
        if (typeof jQuery !== 'undefined' && elem instanceof jQuery) {
            elem = elem.get(0);
        }

        if (typeof elem !== 'object' || elem.nodeType !== 1) {
            throw new Error('First argument must be an element');
        }

        // Look for inline settings on the element
        if (elem.getAttribute('data-withinviewport-settings') && window.JSON) {
            metadata = JSON.parse(elem.getAttribute('data-withinviewport-settings'));
        }

        // Settings argument may be a simple string (`top`, `right`, etc)
        if (typeof options === 'string') {
            settings = {sides: options};
        }
        else {
            settings = options || {};
        }

        // Build configuration from defaults and user-provided settings and metadata
        config.container = settings.container || metadata.container || withinviewport.defaults.container || window;
        config.sides  = settings.sides  || metadata.sides  || withinviewport.defaults.sides  || 'all';
        config.top    = settings.top    || metadata.top    || withinviewport.defaults.top    || 0;
        config.right  = settings.right  || metadata.right  || withinviewport.defaults.right  || 0;
        config.bottom = settings.bottom || metadata.bottom || withinviewport.defaults.bottom || 0;
        config.left   = settings.left   || metadata.left   || withinviewport.defaults.left   || 0;

        // Use the window as the container if the user specified the body or a non-element
        if (config.container === document.body || !config.container.nodeType === 1) {
            config.container = window;
        }

        // Element testing methods
        isWithin = {
            // Element is below the top edge of the viewport
            top: function _isWithin_top () {
                return elemBoundingRect.top >= config.top;
            },

            // Element is to the left of the right edge of the viewport
            right: function _isWithin_right () {
                var containerWidth;

                if (canUseWindowDimensions || config.container !== window) {
                    containerWidth = config.container.innerWidth;
                }
                else {
                    containerWidth = document.documentElement.clientWidth;
                }

                // Note that `elemBoundingRect.right` is the distance from the *left* of the viewport to the element's far right edge
                return elemBoundingRect.right <= containerWidth - config.right;
            },

            // Element is above the bottom edge of the viewport
            bottom: function _isWithin_bottom () {
                var containerHeight;

                if (canUseWindowDimensions || config.container !== window) {
                    containerHeight = config.container.innerHeight;
                }
                else {
                    containerHeight = document.documentElement.clientHeight;
                }

                // Note that `elemBoundingRect.bottom` is the distance from the *top* of the viewport to the element's bottom edge
                return elemBoundingRect.bottom <= containerHeight - config.bottom;
            },

            // Element is to the right of the left edge of the viewport
            left: function _isWithin_left () {
                return elemBoundingRect.left >= config.left;
            },

            // Element is within all four boundaries
            all: function _isWithin_all () {
                // Test each boundary in order of most efficient and most likely to be false so that we can avoid running all four functions on most elements
                // Top: Quickest to calculate + most likely to be false
                // Bottom: Note quite as quick to calculate, but also very likely to be false
                // Left and right are both equally unlikely to be false since most sites only scroll vertically, but left is faster
                return (isWithin.top() && isWithin.bottom() && isWithin.left() && isWithin.right());
            }
        };

        // Get the element's bounding rectangle with respect to the viewport
        elemBoundingRect = elem.getBoundingClientRect();

        // Test the element against each side of the viewport that was requested
        sideNamesPattern = /^top$|^right$|^bottom$|^left$|^all$/;
        // Loop through all of the sides
        sides = config.sides.split(' ');
        i = sides.length;
        while (i--) {
            side = sides[i].toLowerCase();

            if (sideNamesPattern.test(side)) {
                if (isWithin[side]()) {
                    result = true;
                }
                else {
                    result = false;

                    // Quit as soon as the first failure is found
                    break;
                }
            }
        }

        return result;
    };

    // Default settings
    withinviewport.prototype.defaults = {
        container: document.body,
        sides: 'all',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    };

    withinviewport.defaults = withinviewport.prototype.defaults;

    /**
     * Optional enhancements and shortcuts
     *
     * @description Uncomment or comment these pieces as they apply to your project and coding preferences
     */

    // Shortcut methods for each side of the viewport
    // Example: `withinviewport.top(elem)` is the same as `withinviewport(elem, 'top')`
    withinviewport.prototype.top = function _withinviewport_top (element) {
        return withinviewport(element, 'top');
    };

    withinviewport.prototype.right = function _withinviewport_right (element) {
        return withinviewport(element, 'right');
    };

    withinviewport.prototype.bottom = function _withinviewport_bottom (element) {
        return withinviewport(element, 'bottom');
    };

    withinviewport.prototype.left = function _withinviewport_left (element) {
        return withinviewport(element, 'left');
    };

    return withinviewport;
}));

},{}],43:[function(require,module,exports){
'use strict';

var appConfig = require('../firebaseconfig.json');
firebase.initializeApp(appConfig);
var dbLocation = appConfig.databaseURL;
var newTapeRef = firebase.database().ref('tapes');

var storeTape = function storeTape(tape) {
    newTapeRef.push({
        'name': 'demo',
        'events': tape
    }).then(function (argument) {
        console.log('cool');
    });
};

var fetchTapes = function fetchTapes() {
    return fetch(dbLocation + '/tapes.json');
};

module.exports = {
    storeTape: storeTape,
    fetchTapes: fetchTapes
};

},{"../firebaseconfig.json":1}],44:[function(require,module,exports){
'use strict';

var draggabilly = require('draggabilly');

var show = function show() {
    $('body').append(html);
    var element = document.querySelector('.vhs-controls');
    new draggabilly(element);
};

var toggleRecordingState = function toggleRecordingState() {
    $('.vhs-record-circle').toggleClass('vhs-recording');
};

var togglePlayingState = function togglePlayingState() {
    $('.vhs-play-button').toggleClass('vhs-playing');
};

var styles = '<style>\n    .vhs-controls {\n        position: absolute;\n        top: 10px;\n        left: 10px;\n    }\n    .vhs-button {\n        width: 30px;\n        height: 30px;\n        background: #FFF;\n        border: 1px solid #DDD;\n        border-radius: 5px;\n        cursor: pointer;\n        display: inline-block;\n    }\n    .vhs-record-circle {\n        border-radius: 50%;\n        width: 10px;\n        height: 10px;\n        margin: 10px;\n        background: #FE3548;\n        display: inline-block;\n    }\n    .vhs-recording {\n        animation: vhs-recording-animation 2s infinite;\n    }\n    @keyframes vhs-recording-animation {\n        0%   {opacity: 1}\n        50%  {opacity: 0}\n        100% {opacity: 1}\n    }\n    .vhs-playing {\n        background: #00ADE9;\n        border-color: #00ADE9;\n    }\n    .vhs-playing .vhs-play-triangle {\n        background: #FFF;\n    }\n    .vhs-play-triangle {\n        background-color: #666;\n        display: inline-block;\n        margin: 12px;\n    }\n    .vhs-play-triangle:before,\n    .vhs-play-triangle:after {\n        content: \'\';\n        position: absolute;\n        background-color: inherit;\n    }\n    .vhs-play-triangle,\n    .vhs-play-triangle:before,\n    .vhs-play-triangle:after {\n        width:  6px;\n        height: 6px;\n        border-top-right-radius: 30%;\n    }\n    .vhs-play-triangle {\n        transform: rotate(30deg) skewX(-30deg) scale(1, .866);\n    }\n    .vhs-play-triangle:before {\n        transform: rotate(-135deg) skewX(-45deg) scale(1.414, .707) translate(0, -50%);\n    }\n    .vhs-play-triangle:after {\n        transform: rotate(135deg) skewY(-45deg) scale(.707, 1.414) translate(50%);\n    }\n</style>';

var html = '\n    <div class="vhs-controls">\n        ' + styles + '\n        <span class="vhs-button" onclick="vhs.toggleRecording()">\n            <span class="vhs-record-circle"></span>\n        </span>\n        <span class="vhs-button vhs-play-button" onclick="vhs.setupPlayback()">\n            <span class="vhs-play-triangle"></span>\n        </span>\n    </div>\n';

module.exports = {
    show: show,
    toggleRecordingState: toggleRecordingState,
    togglePlayingState: togglePlayingState
};

},{"draggabilly":33}],45:[function(require,module,exports){
'use strict';

var xpath = require('simple-xpath-position');
var visible = require('withinviewport');
window.visble = visible;
var bunker = require('./bunker');

var show = function show() {
    $('body').append(html);
};

var events = [];

var render = function render(eventsArray, lastEventIndex) {
    $('.vhs-sidebar-events').empty();
    events = eventsArray;
    for (var i = 0; i < events.length; i++) {
        addEvent(i, lastEventIndex);
    }followLogs();
};

var followLogs = function followLogs() {
    var latestPassedTest = $('.vhs-sidebar-event-passed').last();
    if (!latestPassedTest.length) return;

    if (!visible(latestPassedTest)) {
        var scrollTop = $('.vhs-sidebar').scrollTop();
        $('.vhs-sidebar').stop().animate({
            scrollTop: scrollTop + 500
        });
    }
};

var addEvent = function addEvent(index, lastEventIndex) {
    var event = events[index];

    event.status = index <= lastEventIndex ? 'passed' : 'pending';

    if (event.type === 'wait' && event.duration < 300) return;

    event.identifier = getPrettyIdentifier(event.path);

    if (event.which === 1) delete event.which; // click events
    if (event.which) event.key = getPrettyKey(event.which);

    // $('.vhs-sidebar-events').append(getNewEventHTML(event));
};

var addTapes = function addTapes() {
    var tapesPromise = bunker.fetchTapes();
    tapesPromise.then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                mountTapes(data);
            });
        } else {
            console.log('Errored');
        }
    });
};
addTapes();

var mountTapes = function mountTapes(tapesDump) {
    var tapes = Object.keys(tapesDump);
    var tapeHtml = '<ul>';
    tapes.forEach(function (tape) {
        tapeHtml += '<li>' + tape + ' <ul>';
        tapesDump[tape].events.forEach(function (ev) {
            tapeHtml += '<li>' + getNewEventHTML(ev) + '</li>';
        });
        tapeHtml += '</ul></li>';
    });
    tapeHtml += '</ul>';
    $('.vhs-sidebar-events').append(tapeHtml);
};

var getPrettyIdentifier = function getPrettyIdentifier(path) {
    var identifier = '';
    if (!path) return identifier;

    var element = xpath.toNode(path, document);
    if (!element) {
        return identifier;
    }

    identifier += element.tagName ? '' + element.tagName : '';
    identifier += element.id ? '#' + element.id : '';
    identifier += element.className ? '.' + element.className : '';
    identifier += element.text ? '(' + element.text + ')' : '';
    return identifier;
};

var getPrettyKey = function getPrettyKey(which) {
    var map = {
        8: '←',
        13: '↵',
        32: '_' //proxy for space
    };
    return map[which] || String.fromCharCode(which);
};

var styles = '<style>\n    .vhs-sidebar {\n        position: absolute;\n        top: 0;\n        right: 0;\n        width: 300px;\n        height: 100%;\n        z-index: 999;\n        background: #253447;\n        border-left: 1px solid #1C2939;\n        overflow-y: auto;\n        color: #FFF;\n        font-size: 14px;\n    }\n    .vhs-sidebar-header {\n        background: #1C2939;\n        padding: 20px 30px;\n        font-size: 18px;\n    }\n    .vhs-sidebar-event {\n        overflow: hidden;\n        padding: 10px;\n    }\n    .vhs-sidebar-event-type, .vhs-sidebar-event-key {\n        float: right;\n    }\n    .vhs-sidebar-event-key {\n        color: #D2426E;\n        background: #F7F7F9;\n        border: 1px solid #DDD;\n        border-radius: 3px;\n        padding: 0 3px;\n        margin-left: 5px;\n        display: inline;\n    }\n    .vhs-sidebar-status {\n        display: inline-block;\n        width: 7.5px;\n        height: 7.5px;\n        border-radius: 50%;\n        margin: 2px 5px;\n    }\n    .vhs-sidebar-event-pending {\n        color: #707C88;\n    }\n    .vhs-sidebar-event-pending .vhs-sidebar-status {\n        background-color: #707C88;\n    }\n    .vhs-sidebar-event-passed {\n        color: #2EAADE;\n    }\n    .vhs-sidebar-event-passed .vhs-sidebar-status {\n        background-color: #2EAADE;\n    }\n    .vhs-sidebar-event-failed .vhs-sidebar-status {\n        background-color: red;\n    }\n</style>';

var html = '\n    <div class="vhs-sidebar">\n        ' + styles + '\n        <div class="vhs-sidebar-header">\n            Events\n        </div>\n        <div class="vhs-sidebar-events">\n\n        </div>\n    </div>\n';

var getDetailHTML = function getDetailHTML(data, type) {
    console.log(data);
    if (!data) return '';
    if (type === 'duration') data = '&#128337; ' + data;
    return '<span class="vhs-sidebar-event-' + type + '">' + data + '</span>';
};

var getNewEventHTML = function getNewEventHTML(_ref) {
    var type = _ref.type,
        duration = _ref.duration,
        key = _ref.key,
        identifier = _ref.identifier,
        status = _ref.status;

    return '\n        <div class="vhs-sidebar-event vhs-sidebar-event-' + status + '">\n            <span class="vhs-sidebar-status"></span>\n            ' + getDetailHTML(identifier, 'identifier') + '\n            ' + getDetailHTML(duration, 'duration') + '\n\n            ' + getDetailHTML(key, 'key') + '\n            ' + getDetailHTML(type, 'type') + '\n        </div>\n    ';
};

module.exports = {
    show: show,
    render: render
};

},{"./bunker":43,"simple-xpath-position":37,"withinviewport":42}],46:[function(require,module,exports){
'use strict';

/* Lib to get xpath for a DOM node */
var xpath = require('simple-xpath-position');

/* Polyfill for Array.prototype.includes */
require('core-js/fn/array/includes');

var controls = require('./controls');
var sidebar = require('./sidebar');
var bunker = require('./bunker');

/* Whitelist of DOM events that are recorded */
var eventTypes = ['click', 'keypress', 'dblclick'];

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

var wrapBodyInRecordable = function wrapBodyInRecordable() {
    $('body').wrapInner('<div class="vhs-recordable"></div>');
};

var attachHandlers = function attachHandlers() {
    var handlers = getEventHandlers();
    $('.vhs-recordable').on(handlers);
};

var detachHandlers = function detachHandlers() {
    var handlers = getEventHandlers();
    $('.vhs-recordable').off(handlers);
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
            if (type === 'click') click(event, resolve);
            if (type === 'dblclick') dblclick(event, resolve);else if (type === 'keypress') keypress(event, resolve);else if (type === 'wait') wait(event, resolve);else reject(new Error('Unknown event type. Could not play'));
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

var dblclick = function dblclick(_ref3, resolve) {
    var path = _ref3.path;

    var element = getElement(path);
    $(element).trigger('dblclick');
    resolve();
};

var keypress = function keypress(_ref4, resolve) {
    var path = _ref4.path,
        which = _ref4.which;

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

var wait = function wait(_ref5, resolve) {
    var duration = _ref5.duration;

    setTimeout(function () {
        return resolve();
    }, duration);
};

/* Play all recorded events */
var play = function play() {
    controls.togglePlayingState();
    playEventsRecursively(0);
};

var setupPlayback = function setupPlayback() {
    if (isRecording) toggleRecording();
    localStorage.setItem('vhs-playback', true);
    location.reload();
};
sidebar.show();
var initPlayback = function initPlayback() {
    events = JSON.parse(localStorage.getItem('vhs')).events;
    sidebar.show();
    sidebar.render(events);
    play();
    localStorage.removeItem('vhs-playback');
};

var playEventsRecursively = function playEventsRecursively(index) {
    if (!events[index]) {
        controls.togglePlayingState();
        return;
    }
    /*
     * It's useful to re-render the sidebar because
     * the element in an event might only enter the DOM
     * after it's previous event.
     * Passing last event index for marking progress
     */
    sidebar.render(events, index);

    /* Play event */
    playEvent(events[index]).then(function () {
        return playEventsRecursively(++index);
    });
};

var isRecording = false;
var toggleRecording = function toggleRecording() {
    if (isRecording) {
        stopRecording();
        bunker.storeTape(events);
    } else record();
    controls.toggleRecordingState();
};

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
        events: events,
        toggleRecording: toggleRecording,
        setupPlayback: setupPlayback
    };
    wrapBodyInRecordable();
    controls.show();

    var playback = localStorage.getItem('vhs-playback');
    if (playback) initPlayback();
});

},{"./bunker":43,"./controls":44,"./sidebar":45,"core-js/fn/array/includes":2,"simple-xpath-position":37}]},{},[46])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJmaXJlYmFzZWNvbmZpZy5qc29uIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvZm4vYXJyYXkvaW5jbHVkZXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hLWZ1bmN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fYWRkLXRvLXVuc2NvcGFibGVzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fYW4tb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fYXJyYXktaW5jbHVkZXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jb2YuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jb3JlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fY3R4LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZGVmaW5lZC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2Rlc2NyaXB0b3JzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZG9tLWNyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2V4cG9ydC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2ZhaWxzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZ2xvYmFsLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faGFzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faGlkZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2llOC1kb20tZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2lzLW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1kcC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3Byb3BlcnR5LWRlc2MuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19yZWRlZmluZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3NoYXJlZC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3RvLWluZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8taW50ZWdlci5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3RvLWlvYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1sZW5ndGguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1wcmltaXRpdmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL191aWQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL193a3MuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5hcnJheS5pbmNsdWRlcy5qcyIsIm5vZGVfbW9kdWxlcy9kcmFnZ2FiaWxseS9kcmFnZ2FiaWxseS5qcyIsIm5vZGVfbW9kdWxlcy9ldi1lbWl0dGVyL2V2LWVtaXR0ZXIuanMiLCJub2RlX21vZHVsZXMvZ2V0LWRvY3VtZW50L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2dldC1zaXplL2dldC1zaXplLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS14cGF0aC1wb3NpdGlvbi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUteHBhdGgtcG9zaXRpb24vc3JjL2RvbS1leGNlcHRpb24uanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXhwYXRoLXBvc2l0aW9uL3NyYy94cGF0aC5qcyIsIm5vZGVfbW9kdWxlcy91bmlkcmFnZ2VyL3VuaWRyYWdnZXIuanMiLCJub2RlX21vZHVsZXMvdW5pcG9pbnRlci91bmlwb2ludGVyLmpzIiwibm9kZV9tb2R1bGVzL3dpdGhpbnZpZXdwb3J0L3dpdGhpbnZpZXdwb3J0LmpzIiwic3JjL2J1bmtlci5qcyIsInNyYy9jb250cm9scy5qcyIsInNyYy9zaWRlYmFyLmpzIiwiaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDak5BO0FBQ0E7Ozs7Ozs7O0lDRHFCLFksR0FDbkIsc0JBQVksT0FBWixFQUFxQixJQUFyQixFQUEyQjtBQUFBOztBQUN6QixPQUFLLE9BQUwsR0FBZSxPQUFmO0FBQ0EsT0FBSyxJQUFMLEdBQVksSUFBWjtBQUNBLE9BQUssS0FBTCxHQUFjLElBQUksS0FBSixFQUFELENBQWMsS0FBM0I7QUFDRCxDOztxQkFMa0IsWTs7O0FBUXJCLGFBQWEsU0FBYixHQUF5QixJQUFJLEtBQUosRUFBekI7O0FBRUEsYUFBYSxTQUFiLENBQXVCLFFBQXZCLEdBQWtDLFlBQVk7QUFDNUMsU0FBVSxLQUFLLElBQWYsVUFBd0IsS0FBSyxPQUE3QjtBQUNELENBRkQ7Ozs7OztRQ1lnQixRLEdBQUEsUTtRQWlDQSxNLEdBQUEsTTs7QUF2RGhCOzs7O0FBRUE7Ozs7OztBQUVBO0FBQ0EsSUFBTSwwQkFBMEIsQ0FBaEM7O0FBRUE7QUFDQSxJQUFNLGlCQUFpQiw4QkFBdkI7O0FBR0E7Ozs7Ozs7Ozs7O0FBV08sU0FBUyxRQUFULENBQWtCLElBQWxCLEVBQXFDO0FBQUEsTUFBYixJQUFhLHlEQUFOLElBQU07O0FBQzFDLE1BQUksU0FBUyxTQUFiLEVBQXdCO0FBQ3RCLFVBQU0sSUFBSSxLQUFKLENBQVUsbUNBQVYsQ0FBTjtBQUNEOztBQUVELFNBQU8sUUFBUSw4QkFBWSxJQUFaLENBQWY7O0FBRUEsTUFBSSxPQUFPLEdBQVg7QUFDQSxTQUFPLFNBQVMsSUFBaEIsRUFBc0I7QUFDcEIsUUFBSSxDQUFDLElBQUwsRUFBVztBQUNULFVBQUksVUFBVSxzREFBZDtBQUNBLFVBQUksT0FBTyxzQkFBWDtBQUNBLFlBQU0sOEJBQWlCLE9BQWpCLEVBQTBCLElBQTFCLENBQU47QUFDRDtBQUNELGlCQUFXLFNBQVMsSUFBVCxDQUFYLFNBQTZCLGFBQWEsSUFBYixDQUE3QixTQUFtRCxJQUFuRDtBQUNBLFdBQU8sS0FBSyxVQUFaO0FBQ0Q7QUFDRCxTQUFPLEtBQUssT0FBTCxDQUFhLEtBQWIsRUFBb0IsRUFBcEIsQ0FBUDtBQUNEOztBQUdEOzs7Ozs7Ozs7Ozs7QUFZTyxTQUFTLE1BQVQsQ0FBZ0IsSUFBaEIsRUFBc0IsSUFBdEIsRUFBNkM7QUFBQSxNQUFqQixRQUFpQix5REFBTixJQUFNOztBQUNsRCxNQUFJLFNBQVMsU0FBYixFQUF3QjtBQUN0QixVQUFNLElBQUksS0FBSixDQUFVLG1DQUFWLENBQU47QUFDRDtBQUNELE1BQUksU0FBUyxTQUFiLEVBQXdCO0FBQ3RCLFVBQU0sSUFBSSxLQUFKLENBQVUsbUNBQVYsQ0FBTjtBQUNEOztBQUVEO0FBQ0EsTUFBSSxXQUFXLDhCQUFZLElBQVosQ0FBZjtBQUNBLE1BQUksU0FBUyxRQUFiLEVBQXVCLE9BQU8sS0FBSyxPQUFMLENBQWEsS0FBYixFQUFvQixJQUFwQixDQUFQOztBQUV2QjtBQUNBLE1BQUksa0JBQWtCLFNBQVMsZUFBL0I7QUFDQSxNQUFJLGFBQWEsSUFBYixJQUFxQixnQkFBZ0Isa0JBQXpDLEVBQTZEO0FBQUE7QUFDM0QsVUFBSSxZQUFZLGdCQUFnQixrQkFBaEIsQ0FBbUMsSUFBbkMsS0FBNEMsY0FBNUQ7QUFDQSxpQkFBVyxrQkFBQyxNQUFELEVBQVk7QUFDckIsWUFBSSxLQUFLLEVBQUMsYUFBYSxTQUFkLEVBQVQ7QUFDQSxlQUFPLEdBQUcsTUFBSCxLQUFjLGdCQUFnQixrQkFBaEIsQ0FBbUMsTUFBbkMsQ0FBckI7QUFDRCxPQUhEO0FBRjJEO0FBTTVEOztBQUVELFNBQU8sUUFBUSxJQUFSLEVBQWMsSUFBZCxFQUFvQixRQUFwQixDQUFQO0FBQ0Q7O0FBR0Q7QUFDQSxTQUFTLFFBQVQsQ0FBa0IsSUFBbEIsRUFBd0I7QUFDdEIsVUFBUSxLQUFLLFFBQWI7QUFDQSxTQUFLLE9BQUw7QUFBYyxhQUFPLFFBQVA7QUFDZCxTQUFLLFVBQUw7QUFBaUIsYUFBTyxXQUFQO0FBQ2pCLFNBQUssZ0JBQUw7QUFBdUIsYUFBTyxpQkFBUDtBQUN2QjtBQUFTLGFBQU8sS0FBSyxRQUFMLENBQWMsV0FBZCxFQUFQO0FBSlQ7QUFNRDs7QUFHRDtBQUNBLFNBQVMsWUFBVCxDQUFzQixJQUF0QixFQUE0QjtBQUMxQixNQUFJLE9BQU8sS0FBSyxRQUFoQjtBQUNBLE1BQUksV0FBVyxDQUFmO0FBQ0EsU0FBUSxPQUFPLEtBQUssZUFBcEIsRUFBc0M7QUFDcEMsUUFBSSxLQUFLLFFBQUwsS0FBa0IsSUFBdEIsRUFBNEIsWUFBWSxDQUFaO0FBQzdCO0FBQ0QsU0FBTyxRQUFQO0FBQ0Q7O0FBR0Q7QUFDQSxTQUFTLE9BQVQsQ0FBaUIsSUFBakIsRUFBdUIsSUFBdkIsRUFBNkIsUUFBN0IsRUFBdUM7QUFDckMsTUFBSTtBQUNGO0FBQ0EsUUFBSSxTQUFTLEtBQUssT0FBTCxDQUFhLDhCQUFiLEVBQTZDLGVBQTdDLENBQWI7QUFDQSxXQUFPLGdCQUFnQixNQUFoQixFQUF3QixJQUF4QixFQUE4QixRQUE5QixDQUFQO0FBQ0QsR0FKRCxDQUlFLE9BQU8sR0FBUCxFQUFZO0FBQ1osV0FBTyxnQkFBZ0IsSUFBaEIsRUFBc0IsSUFBdEIsQ0FBUDtBQUNEO0FBQ0Y7O0FBR0Q7QUFDQSxTQUFTLGVBQVQsQ0FBeUIsSUFBekIsRUFBK0IsSUFBL0IsRUFBcUM7QUFDbkMsTUFBSSxRQUFRLEtBQUssS0FBTCxDQUFXLEdBQVgsQ0FBWjtBQUNBLE1BQUksT0FBTyxJQUFYO0FBQ0EsU0FBTyxJQUFQLEVBQWE7QUFDWCxRQUFJLE9BQU8sTUFBTSxLQUFOLEVBQVg7QUFDQSxRQUFJLFNBQVMsU0FBYixFQUF3QjtBQUN4QixRQUFJLFNBQVMsR0FBYixFQUFrQjs7QUFIUCxzQkFJWSxLQUFLLEtBQUwsQ0FBVyxRQUFYLENBSlo7O0FBQUEsUUFJTixJQUpNO0FBQUEsUUFJQSxRQUpBOztBQUtYLFdBQU8sS0FBSyxPQUFMLENBQWEsWUFBYixFQUEyQixFQUEzQixDQUFQO0FBQ0EsZUFBVyxXQUFXLFNBQVMsUUFBVCxDQUFYLEdBQWdDLENBQTNDO0FBQ0EsV0FBTyxVQUFVLElBQVYsRUFBZ0IsSUFBaEIsRUFBc0IsUUFBdEIsQ0FBUDtBQUNEO0FBQ0QsU0FBTyxJQUFQO0FBQ0Q7O0FBR0Q7QUFDQSxTQUFTLGVBQVQsQ0FBeUIsSUFBekIsRUFBK0IsSUFBL0IsRUFBcUMsUUFBckMsRUFBK0M7QUFDN0MsTUFBSSxXQUFXLDhCQUFZLElBQVosQ0FBZjtBQUNBLE1BQUksSUFBSSxTQUFTLFFBQVQsQ0FBa0IsSUFBbEIsRUFBd0IsSUFBeEIsRUFBOEIsUUFBOUIsRUFBd0MsdUJBQXhDLEVBQWlFLElBQWpFLENBQVI7QUFDQSxTQUFPLEVBQUUsZUFBVDtBQUNEOztBQUdEO0FBQ0EsU0FBUyxTQUFULENBQW1CLElBQW5CLEVBQXlCLElBQXpCLEVBQStCLFFBQS9CLEVBQXlDO0FBQ3ZDLE9BQUssT0FBTyxLQUFLLFVBQWpCLEVBQThCLElBQTlCLEVBQXFDLE9BQU8sS0FBSyxXQUFqRCxFQUE4RDtBQUM1RCxRQUFJLFNBQVMsSUFBVCxNQUFtQixJQUFuQixJQUEyQixFQUFFLFFBQUYsS0FBZSxDQUE5QyxFQUFpRDtBQUNsRDtBQUNELFNBQU8sSUFBUDtBQUNEOzs7QUNsSkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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UUFBSSxDQUFDLE9BQU8sS0FBUCxDQUFMLEVBQW9CO0FBQ2hCLGlCQUFTLGtCQUFUO0FBQ0E7QUFDSDtBQUNEOzs7Ozs7QUFNQSxZQUFRLE1BQVIsQ0FBZSxNQUFmLEVBQXVCLEtBQXZCOztBQUVBO0FBQ0EsY0FBVSxPQUFPLEtBQVAsQ0FBVixFQUF5QixJQUF6QixDQUE4QjtBQUFBLGVBQU0sc0JBQXNCLEVBQUUsS0FBeEIsQ0FBTjtBQUFBLEtBQTlCO0FBQ0gsQ0FmRDs7QUFpQkEsSUFBSSxjQUFjLEtBQWxCO0FBQ0EsSUFBTSxrQkFBa0IsU0FBbEIsZUFBa0IsR0FBTTtBQUMxQixRQUFJLFdBQUosRUFBaUI7QUFDYjtBQUNBLGVBQU8sU0FBUCxDQUFpQixNQUFqQjtBQUNILEtBSEQsTUFLSztBQUNMLGFBQVMsb0JBQVQ7QUFDSCxDQVJEOztBQVVBLElBQU0sU0FBUyxTQUFULE1BQVMsR0FBTTtBQUNqQixhQUFTLEVBQVQ7QUFDQTtBQUNILENBSEQ7O0FBS0EsSUFBTSxnQkFBZ0IsU0FBaEIsYUFBZ0IsR0FBTTtBQUN4QjtBQUNBLGtCQUFjLEtBQWQ7QUFDQSxpQkFBYSxPQUFiLENBQXFCLEtBQXJCLEVBQTRCLEtBQUssU0FBTCxDQUFlLEVBQUMsY0FBRCxFQUFmLENBQTVCO0FBQ0gsQ0FKRDs7QUFNQSxJQUFNLGtCQUFrQixTQUFsQixlQUFrQixHQUFNO0FBQzFCO0FBQ0Esa0JBQWMsSUFBZDtBQUNILENBSEQ7O0FBS0EsRUFBRSxZQUFNO0FBQ0o7QUFDQSxXQUFPLEdBQVAsR0FBYTtBQUNULHNCQURTO0FBRVQsd0NBRlM7QUFHVDtBQUhTLEtBQWI7QUFLQTtBQUNBLGFBQVMsSUFBVDs7QUFFQSxRQUFJLFdBQVcsYUFBYSxPQUFiLENBQXFCLGNBQXJCLENBQWY7QUFDQSxRQUFJLFFBQUosRUFBYztBQUNqQixDQVpEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzPXtcbiAgICBcImFwaUtleVwiOiBcIkFJemFTeURQbm5hc1pLaThpbE8tZS1Lc2M0REhHUTBoOTlnUDlDb1wiLFxuICAgIFwiYXV0aERvbWFpblwiOiBcImNhc3NldHRlLTUyOTYzLmZpcmViYXNlYXBwLmNvbVwiLFxuICAgIFwiZGF0YWJhc2VVUkxcIjogXCJodHRwczovL2Nhc3NldHRlLTUyOTYzLmZpcmViYXNlaW8uY29tXCIsXG4gICAgXCJzdG9yYWdlQnVja2V0XCI6IFwiY2Fzc2V0dGUtNTI5NjMuYXBwc3BvdC5jb21cIixcbiAgICBcIm1lc3NhZ2luZ1NlbmRlcklkXCI6IFwiOTMwNjk2NzA2ODYxXCJcbn07XG4iLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNy5hcnJheS5pbmNsdWRlcycpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzL19jb3JlJykuQXJyYXkuaW5jbHVkZXM7IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIGlmKHR5cGVvZiBpdCAhPSAnZnVuY3Rpb24nKXRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGEgZnVuY3Rpb24hJyk7XG4gIHJldHVybiBpdDtcbn07IiwiLy8gMjIuMS4zLjMxIEFycmF5LnByb3RvdHlwZVtAQHVuc2NvcGFibGVzXVxudmFyIFVOU0NPUEFCTEVTID0gcmVxdWlyZSgnLi9fd2tzJykoJ3Vuc2NvcGFibGVzJylcbiAgLCBBcnJheVByb3RvICA9IEFycmF5LnByb3RvdHlwZTtcbmlmKEFycmF5UHJvdG9bVU5TQ09QQUJMRVNdID09IHVuZGVmaW5lZClyZXF1aXJlKCcuL19oaWRlJykoQXJyYXlQcm90bywgVU5TQ09QQUJMRVMsIHt9KTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5KXtcbiAgQXJyYXlQcm90b1tVTlNDT1BBQkxFU11ba2V5XSA9IHRydWU7XG59OyIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIGlmKCFpc09iamVjdChpdCkpdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYW4gb2JqZWN0IScpO1xuICByZXR1cm4gaXQ7XG59OyIsIi8vIGZhbHNlIC0+IEFycmF5I2luZGV4T2Zcbi8vIHRydWUgIC0+IEFycmF5I2luY2x1ZGVzXG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpXG4gICwgdG9MZW5ndGggID0gcmVxdWlyZSgnLi9fdG8tbGVuZ3RoJylcbiAgLCB0b0luZGV4ICAgPSByZXF1aXJlKCcuL190by1pbmRleCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihJU19JTkNMVURFUyl7XG4gIHJldHVybiBmdW5jdGlvbigkdGhpcywgZWwsIGZyb21JbmRleCl7XG4gICAgdmFyIE8gICAgICA9IHRvSU9iamVjdCgkdGhpcylcbiAgICAgICwgbGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpXG4gICAgICAsIGluZGV4ICA9IHRvSW5kZXgoZnJvbUluZGV4LCBsZW5ndGgpXG4gICAgICAsIHZhbHVlO1xuICAgIC8vIEFycmF5I2luY2x1ZGVzIHVzZXMgU2FtZVZhbHVlWmVybyBlcXVhbGl0eSBhbGdvcml0aG1cbiAgICBpZihJU19JTkNMVURFUyAmJiBlbCAhPSBlbCl3aGlsZShsZW5ndGggPiBpbmRleCl7XG4gICAgICB2YWx1ZSA9IE9baW5kZXgrK107XG4gICAgICBpZih2YWx1ZSAhPSB2YWx1ZSlyZXR1cm4gdHJ1ZTtcbiAgICAvLyBBcnJheSN0b0luZGV4IGlnbm9yZXMgaG9sZXMsIEFycmF5I2luY2x1ZGVzIC0gbm90XG4gICAgfSBlbHNlIGZvcig7bGVuZ3RoID4gaW5kZXg7IGluZGV4KyspaWYoSVNfSU5DTFVERVMgfHwgaW5kZXggaW4gTyl7XG4gICAgICBpZihPW2luZGV4XSA9PT0gZWwpcmV0dXJuIElTX0lOQ0xVREVTIHx8IGluZGV4IHx8IDA7XG4gICAgfSByZXR1cm4gIUlTX0lOQ0xVREVTICYmIC0xO1xuICB9O1xufTsiLCJ2YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGl0KS5zbGljZSg4LCAtMSk7XG59OyIsInZhciBjb3JlID0gbW9kdWxlLmV4cG9ydHMgPSB7dmVyc2lvbjogJzIuNC4wJ307XG5pZih0eXBlb2YgX19lID09ICdudW1iZXInKV9fZSA9IGNvcmU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWYiLCIvLyBvcHRpb25hbCAvIHNpbXBsZSBjb250ZXh0IGJpbmRpbmdcbnZhciBhRnVuY3Rpb24gPSByZXF1aXJlKCcuL19hLWZ1bmN0aW9uJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGZuLCB0aGF0LCBsZW5ndGgpe1xuICBhRnVuY3Rpb24oZm4pO1xuICBpZih0aGF0ID09PSB1bmRlZmluZWQpcmV0dXJuIGZuO1xuICBzd2l0Y2gobGVuZ3RoKXtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbihhKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEpO1xuICAgIH07XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24oYSwgYil7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiKTtcbiAgICB9O1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKGEsIGIsIGMpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYiwgYyk7XG4gICAgfTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24oLyogLi4uYXJncyAqLyl7XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoYXQsIGFyZ3VtZW50cyk7XG4gIH07XG59OyIsIi8vIDcuMi4xIFJlcXVpcmVPYmplY3RDb2VyY2libGUoYXJndW1lbnQpXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYoaXQgPT0gdW5kZWZpbmVkKXRocm93IFR5cGVFcnJvcihcIkNhbid0IGNhbGwgbWV0aG9kIG9uICBcIiArIGl0KTtcbiAgcmV0dXJuIGl0O1xufTsiLCIvLyBUaGFuaydzIElFOCBmb3IgaGlzIGZ1bm55IGRlZmluZVByb3BlcnR5XG5tb2R1bGUuZXhwb3J0cyA9ICFyZXF1aXJlKCcuL19mYWlscycpKGZ1bmN0aW9uKCl7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdhJywge2dldDogZnVuY3Rpb24oKXsgcmV0dXJuIDc7IH19KS5hICE9IDc7XG59KTsiLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKVxuICAsIGRvY3VtZW50ID0gcmVxdWlyZSgnLi9fZ2xvYmFsJykuZG9jdW1lbnRcbiAgLy8gaW4gb2xkIElFIHR5cGVvZiBkb2N1bWVudC5jcmVhdGVFbGVtZW50IGlzICdvYmplY3QnXG4gICwgaXMgPSBpc09iamVjdChkb2N1bWVudCkgJiYgaXNPYmplY3QoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGlzID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChpdCkgOiB7fTtcbn07IiwidmFyIGdsb2JhbCAgICA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpXG4gICwgY29yZSAgICAgID0gcmVxdWlyZSgnLi9fY29yZScpXG4gICwgaGlkZSAgICAgID0gcmVxdWlyZSgnLi9faGlkZScpXG4gICwgcmVkZWZpbmUgID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUnKVxuICAsIGN0eCAgICAgICA9IHJlcXVpcmUoJy4vX2N0eCcpXG4gICwgUFJPVE9UWVBFID0gJ3Byb3RvdHlwZSc7XG5cbnZhciAkZXhwb3J0ID0gZnVuY3Rpb24odHlwZSwgbmFtZSwgc291cmNlKXtcbiAgdmFyIElTX0ZPUkNFRCA9IHR5cGUgJiAkZXhwb3J0LkZcbiAgICAsIElTX0dMT0JBTCA9IHR5cGUgJiAkZXhwb3J0LkdcbiAgICAsIElTX1NUQVRJQyA9IHR5cGUgJiAkZXhwb3J0LlNcbiAgICAsIElTX1BST1RPICA9IHR5cGUgJiAkZXhwb3J0LlBcbiAgICAsIElTX0JJTkQgICA9IHR5cGUgJiAkZXhwb3J0LkJcbiAgICAsIHRhcmdldCAgICA9IElTX0dMT0JBTCA/IGdsb2JhbCA6IElTX1NUQVRJQyA/IGdsb2JhbFtuYW1lXSB8fCAoZ2xvYmFsW25hbWVdID0ge30pIDogKGdsb2JhbFtuYW1lXSB8fCB7fSlbUFJPVE9UWVBFXVxuICAgICwgZXhwb3J0cyAgID0gSVNfR0xPQkFMID8gY29yZSA6IGNvcmVbbmFtZV0gfHwgKGNvcmVbbmFtZV0gPSB7fSlcbiAgICAsIGV4cFByb3RvICA9IGV4cG9ydHNbUFJPVE9UWVBFXSB8fCAoZXhwb3J0c1tQUk9UT1RZUEVdID0ge30pXG4gICAgLCBrZXksIG93biwgb3V0LCBleHA7XG4gIGlmKElTX0dMT0JBTClzb3VyY2UgPSBuYW1lO1xuICBmb3Ioa2V5IGluIHNvdXJjZSl7XG4gICAgLy8gY29udGFpbnMgaW4gbmF0aXZlXG4gICAgb3duID0gIUlTX0ZPUkNFRCAmJiB0YXJnZXQgJiYgdGFyZ2V0W2tleV0gIT09IHVuZGVmaW5lZDtcbiAgICAvLyBleHBvcnQgbmF0aXZlIG9yIHBhc3NlZFxuICAgIG91dCA9IChvd24gPyB0YXJnZXQgOiBzb3VyY2UpW2tleV07XG4gICAgLy8gYmluZCB0aW1lcnMgdG8gZ2xvYmFsIGZvciBjYWxsIGZyb20gZXhwb3J0IGNvbnRleHRcbiAgICBleHAgPSBJU19CSU5EICYmIG93biA/IGN0eChvdXQsIGdsb2JhbCkgOiBJU19QUk9UTyAmJiB0eXBlb2Ygb3V0ID09ICdmdW5jdGlvbicgPyBjdHgoRnVuY3Rpb24uY2FsbCwgb3V0KSA6IG91dDtcbiAgICAvLyBleHRlbmQgZ2xvYmFsXG4gICAgaWYodGFyZ2V0KXJlZGVmaW5lKHRhcmdldCwga2V5LCBvdXQsIHR5cGUgJiAkZXhwb3J0LlUpO1xuICAgIC8vIGV4cG9ydFxuICAgIGlmKGV4cG9ydHNba2V5XSAhPSBvdXQpaGlkZShleHBvcnRzLCBrZXksIGV4cCk7XG4gICAgaWYoSVNfUFJPVE8gJiYgZXhwUHJvdG9ba2V5XSAhPSBvdXQpZXhwUHJvdG9ba2V5XSA9IG91dDtcbiAgfVxufTtcbmdsb2JhbC5jb3JlID0gY29yZTtcbi8vIHR5cGUgYml0bWFwXG4kZXhwb3J0LkYgPSAxOyAgIC8vIGZvcmNlZFxuJGV4cG9ydC5HID0gMjsgICAvLyBnbG9iYWxcbiRleHBvcnQuUyA9IDQ7ICAgLy8gc3RhdGljXG4kZXhwb3J0LlAgPSA4OyAgIC8vIHByb3RvXG4kZXhwb3J0LkIgPSAxNjsgIC8vIGJpbmRcbiRleHBvcnQuVyA9IDMyOyAgLy8gd3JhcFxuJGV4cG9ydC5VID0gNjQ7ICAvLyBzYWZlXG4kZXhwb3J0LlIgPSAxMjg7IC8vIHJlYWwgcHJvdG8gbWV0aG9kIGZvciBgbGlicmFyeWAgXG5tb2R1bGUuZXhwb3J0cyA9ICRleHBvcnQ7IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihleGVjKXtcbiAgdHJ5IHtcbiAgICByZXR1cm4gISFleGVjKCk7XG4gIH0gY2F0Y2goZSl7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07IiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL3psb2lyb2NrL2NvcmUtanMvaXNzdWVzLzg2I2lzc3VlY29tbWVudC0xMTU3NTkwMjhcbnZhciBnbG9iYWwgPSBtb2R1bGUuZXhwb3J0cyA9IHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93Lk1hdGggPT0gTWF0aFxuICA/IHdpbmRvdyA6IHR5cGVvZiBzZWxmICE9ICd1bmRlZmluZWQnICYmIHNlbGYuTWF0aCA9PSBNYXRoID8gc2VsZiA6IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5pZih0eXBlb2YgX19nID09ICdudW1iZXInKV9fZyA9IGdsb2JhbDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZiIsInZhciBoYXNPd25Qcm9wZXJ0eSA9IHt9Lmhhc093blByb3BlcnR5O1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCwga2V5KXtcbiAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwoaXQsIGtleSk7XG59OyIsInZhciBkUCAgICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJylcbiAgLCBjcmVhdGVEZXNjID0gcmVxdWlyZSgnLi9fcHJvcGVydHktZGVzYycpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gZnVuY3Rpb24ob2JqZWN0LCBrZXksIHZhbHVlKXtcbiAgcmV0dXJuIGRQLmYob2JqZWN0LCBrZXksIGNyZWF0ZURlc2MoMSwgdmFsdWUpKTtcbn0gOiBmdW5jdGlvbihvYmplY3QsIGtleSwgdmFsdWUpe1xuICBvYmplY3Rba2V5XSA9IHZhbHVlO1xuICByZXR1cm4gb2JqZWN0O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9ICFyZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpICYmICFyZXF1aXJlKCcuL19mYWlscycpKGZ1bmN0aW9uKCl7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkocmVxdWlyZSgnLi9fZG9tLWNyZWF0ZScpKCdkaXYnKSwgJ2EnLCB7Z2V0OiBmdW5jdGlvbigpeyByZXR1cm4gNzsgfX0pLmEgIT0gNztcbn0pOyIsIi8vIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgYW5kIG5vbi1lbnVtZXJhYmxlIG9sZCBWOCBzdHJpbmdzXG52YXIgY29mID0gcmVxdWlyZSgnLi9fY29mJyk7XG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdCgneicpLnByb3BlcnR5SXNFbnVtZXJhYmxlKDApID8gT2JqZWN0IDogZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gY29mKGl0KSA9PSAnU3RyaW5nJyA/IGl0LnNwbGl0KCcnKSA6IE9iamVjdChpdCk7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gdHlwZW9mIGl0ID09PSAnb2JqZWN0JyA/IGl0ICE9PSBudWxsIDogdHlwZW9mIGl0ID09PSAnZnVuY3Rpb24nO1xufTsiLCJ2YXIgYW5PYmplY3QgICAgICAgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKVxuICAsIElFOF9ET01fREVGSU5FID0gcmVxdWlyZSgnLi9faWU4LWRvbS1kZWZpbmUnKVxuICAsIHRvUHJpbWl0aXZlICAgID0gcmVxdWlyZSgnLi9fdG8tcHJpbWl0aXZlJylcbiAgLCBkUCAgICAgICAgICAgICA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcblxuZXhwb3J0cy5mID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSA6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpe1xuICBhbk9iamVjdChPKTtcbiAgUCA9IHRvUHJpbWl0aXZlKFAsIHRydWUpO1xuICBhbk9iamVjdChBdHRyaWJ1dGVzKTtcbiAgaWYoSUU4X0RPTV9ERUZJTkUpdHJ5IHtcbiAgICByZXR1cm4gZFAoTywgUCwgQXR0cmlidXRlcyk7XG4gIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cbiAgaWYoJ2dldCcgaW4gQXR0cmlidXRlcyB8fCAnc2V0JyBpbiBBdHRyaWJ1dGVzKXRocm93IFR5cGVFcnJvcignQWNjZXNzb3JzIG5vdCBzdXBwb3J0ZWQhJyk7XG4gIGlmKCd2YWx1ZScgaW4gQXR0cmlidXRlcylPW1BdID0gQXR0cmlidXRlcy52YWx1ZTtcbiAgcmV0dXJuIE87XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYml0bWFwLCB2YWx1ZSl7XG4gIHJldHVybiB7XG4gICAgZW51bWVyYWJsZSAgOiAhKGJpdG1hcCAmIDEpLFxuICAgIGNvbmZpZ3VyYWJsZTogIShiaXRtYXAgJiAyKSxcbiAgICB3cml0YWJsZSAgICA6ICEoYml0bWFwICYgNCksXG4gICAgdmFsdWUgICAgICAgOiB2YWx1ZVxuICB9O1xufTsiLCJ2YXIgZ2xvYmFsICAgID0gcmVxdWlyZSgnLi9fZ2xvYmFsJylcbiAgLCBoaWRlICAgICAgPSByZXF1aXJlKCcuL19oaWRlJylcbiAgLCBoYXMgICAgICAgPSByZXF1aXJlKCcuL19oYXMnKVxuICAsIFNSQyAgICAgICA9IHJlcXVpcmUoJy4vX3VpZCcpKCdzcmMnKVxuICAsIFRPX1NUUklORyA9ICd0b1N0cmluZydcbiAgLCAkdG9TdHJpbmcgPSBGdW5jdGlvbltUT19TVFJJTkddXG4gICwgVFBMICAgICAgID0gKCcnICsgJHRvU3RyaW5nKS5zcGxpdChUT19TVFJJTkcpO1xuXG5yZXF1aXJlKCcuL19jb3JlJykuaW5zcGVjdFNvdXJjZSA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuICR0b1N0cmluZy5jYWxsKGl0KTtcbn07XG5cbihtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKE8sIGtleSwgdmFsLCBzYWZlKXtcbiAgdmFyIGlzRnVuY3Rpb24gPSB0eXBlb2YgdmFsID09ICdmdW5jdGlvbic7XG4gIGlmKGlzRnVuY3Rpb24paGFzKHZhbCwgJ25hbWUnKSB8fCBoaWRlKHZhbCwgJ25hbWUnLCBrZXkpO1xuICBpZihPW2tleV0gPT09IHZhbClyZXR1cm47XG4gIGlmKGlzRnVuY3Rpb24paGFzKHZhbCwgU1JDKSB8fCBoaWRlKHZhbCwgU1JDLCBPW2tleV0gPyAnJyArIE9ba2V5XSA6IFRQTC5qb2luKFN0cmluZyhrZXkpKSk7XG4gIGlmKE8gPT09IGdsb2JhbCl7XG4gICAgT1trZXldID0gdmFsO1xuICB9IGVsc2Uge1xuICAgIGlmKCFzYWZlKXtcbiAgICAgIGRlbGV0ZSBPW2tleV07XG4gICAgICBoaWRlKE8sIGtleSwgdmFsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYoT1trZXldKU9ba2V5XSA9IHZhbDtcbiAgICAgIGVsc2UgaGlkZShPLCBrZXksIHZhbCk7XG4gICAgfVxuICB9XG4vLyBhZGQgZmFrZSBGdW5jdGlvbiN0b1N0cmluZyBmb3IgY29ycmVjdCB3b3JrIHdyYXBwZWQgbWV0aG9kcyAvIGNvbnN0cnVjdG9ycyB3aXRoIG1ldGhvZHMgbGlrZSBMb0Rhc2ggaXNOYXRpdmVcbn0pKEZ1bmN0aW9uLnByb3RvdHlwZSwgVE9fU1RSSU5HLCBmdW5jdGlvbiB0b1N0cmluZygpe1xuICByZXR1cm4gdHlwZW9mIHRoaXMgPT0gJ2Z1bmN0aW9uJyAmJiB0aGlzW1NSQ10gfHwgJHRvU3RyaW5nLmNhbGwodGhpcyk7XG59KTsiLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJylcbiAgLCBTSEFSRUQgPSAnX19jb3JlLWpzX3NoYXJlZF9fJ1xuICAsIHN0b3JlICA9IGdsb2JhbFtTSEFSRURdIHx8IChnbG9iYWxbU0hBUkVEXSA9IHt9KTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5KXtcbiAgcmV0dXJuIHN0b3JlW2tleV0gfHwgKHN0b3JlW2tleV0gPSB7fSk7XG59OyIsInZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuL190by1pbnRlZ2VyJylcbiAgLCBtYXggICAgICAgPSBNYXRoLm1heFxuICAsIG1pbiAgICAgICA9IE1hdGgubWluO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpbmRleCwgbGVuZ3RoKXtcbiAgaW5kZXggPSB0b0ludGVnZXIoaW5kZXgpO1xuICByZXR1cm4gaW5kZXggPCAwID8gbWF4KGluZGV4ICsgbGVuZ3RoLCAwKSA6IG1pbihpbmRleCwgbGVuZ3RoKTtcbn07IiwiLy8gNy4xLjQgVG9JbnRlZ2VyXG52YXIgY2VpbCAgPSBNYXRoLmNlaWxcbiAgLCBmbG9vciA9IE1hdGguZmxvb3I7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGlzTmFOKGl0ID0gK2l0KSA/IDAgOiAoaXQgPiAwID8gZmxvb3IgOiBjZWlsKShpdCk7XG59OyIsIi8vIHRvIGluZGV4ZWQgb2JqZWN0LCB0b09iamVjdCB3aXRoIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgc3RyaW5nc1xudmFyIElPYmplY3QgPSByZXF1aXJlKCcuL19pb2JqZWN0JylcbiAgLCBkZWZpbmVkID0gcmVxdWlyZSgnLi9fZGVmaW5lZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBJT2JqZWN0KGRlZmluZWQoaXQpKTtcbn07IiwiLy8gNy4xLjE1IFRvTGVuZ3RoXG52YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpXG4gICwgbWluICAgICAgID0gTWF0aC5taW47XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGl0ID4gMCA/IG1pbih0b0ludGVnZXIoaXQpLCAweDFmZmZmZmZmZmZmZmZmKSA6IDA7IC8vIHBvdygyLCA1MykgLSAxID09IDkwMDcxOTkyNTQ3NDA5OTFcbn07IiwiLy8gNy4xLjEgVG9QcmltaXRpdmUoaW5wdXQgWywgUHJlZmVycmVkVHlwZV0pXG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbi8vIGluc3RlYWQgb2YgdGhlIEVTNiBzcGVjIHZlcnNpb24sIHdlIGRpZG4ndCBpbXBsZW1lbnQgQEB0b1ByaW1pdGl2ZSBjYXNlXG4vLyBhbmQgdGhlIHNlY29uZCBhcmd1bWVudCAtIGZsYWcgLSBwcmVmZXJyZWQgdHlwZSBpcyBhIHN0cmluZ1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCwgUyl7XG4gIGlmKCFpc09iamVjdChpdCkpcmV0dXJuIGl0O1xuICB2YXIgZm4sIHZhbDtcbiAgaWYoUyAmJiB0eXBlb2YgKGZuID0gaXQudG9TdHJpbmcpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSlyZXR1cm4gdmFsO1xuICBpZih0eXBlb2YgKGZuID0gaXQudmFsdWVPZikgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKXJldHVybiB2YWw7XG4gIGlmKCFTICYmIHR5cGVvZiAoZm4gPSBpdC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKXJldHVybiB2YWw7XG4gIHRocm93IFR5cGVFcnJvcihcIkNhbid0IGNvbnZlcnQgb2JqZWN0IHRvIHByaW1pdGl2ZSB2YWx1ZVwiKTtcbn07IiwidmFyIGlkID0gMFxuICAsIHB4ID0gTWF0aC5yYW5kb20oKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5KXtcbiAgcmV0dXJuICdTeW1ib2woJy5jb25jYXQoa2V5ID09PSB1bmRlZmluZWQgPyAnJyA6IGtleSwgJylfJywgKCsraWQgKyBweCkudG9TdHJpbmcoMzYpKTtcbn07IiwidmFyIHN0b3JlICAgICAgPSByZXF1aXJlKCcuL19zaGFyZWQnKSgnd2tzJylcbiAgLCB1aWQgICAgICAgID0gcmVxdWlyZSgnLi9fdWlkJylcbiAgLCBTeW1ib2wgICAgID0gcmVxdWlyZSgnLi9fZ2xvYmFsJykuU3ltYm9sXG4gICwgVVNFX1NZTUJPTCA9IHR5cGVvZiBTeW1ib2wgPT0gJ2Z1bmN0aW9uJztcblxudmFyICRleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuYW1lKXtcbiAgcmV0dXJuIHN0b3JlW25hbWVdIHx8IChzdG9yZVtuYW1lXSA9XG4gICAgVVNFX1NZTUJPTCAmJiBTeW1ib2xbbmFtZV0gfHwgKFVTRV9TWU1CT0wgPyBTeW1ib2wgOiB1aWQpKCdTeW1ib2wuJyArIG5hbWUpKTtcbn07XG5cbiRleHBvcnRzLnN0b3JlID0gc3RvcmU7IiwiJ3VzZSBzdHJpY3QnO1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL3RjMzkvQXJyYXkucHJvdG90eXBlLmluY2x1ZGVzXG52YXIgJGV4cG9ydCAgID0gcmVxdWlyZSgnLi9fZXhwb3J0JylcbiAgLCAkaW5jbHVkZXMgPSByZXF1aXJlKCcuL19hcnJheS1pbmNsdWRlcycpKHRydWUpO1xuXG4kZXhwb3J0KCRleHBvcnQuUCwgJ0FycmF5Jywge1xuICBpbmNsdWRlczogZnVuY3Rpb24gaW5jbHVkZXMoZWwgLyosIGZyb21JbmRleCA9IDAgKi8pe1xuICAgIHJldHVybiAkaW5jbHVkZXModGhpcywgZWwsIGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdW5kZWZpbmVkKTtcbiAgfVxufSk7XG5cbnJlcXVpcmUoJy4vX2FkZC10by11bnNjb3BhYmxlcycpKCdpbmNsdWRlcycpOyIsIi8qIVxuICogRHJhZ2dhYmlsbHkgdjIuMS4xXG4gKiBNYWtlIHRoYXQgc2hpeiBkcmFnZ2FibGVcbiAqIGh0dHA6Ly9kcmFnZ2FiaWxseS5kZXNhbmRyby5jb21cbiAqIE1JVCBsaWNlbnNlXG4gKi9cblxuLypqc2hpbnQgYnJvd3NlcjogdHJ1ZSwgc3RyaWN0OiB0cnVlLCB1bmRlZjogdHJ1ZSwgdW51c2VkOiB0cnVlICovXG5cbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIC8qIGpzaGludCBzdHJpY3Q6IGZhbHNlICovIC8qZ2xvYmFscyBkZWZpbmUsIG1vZHVsZSwgcmVxdWlyZSAqL1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggW1xuICAgICAgICAnZ2V0LXNpemUvZ2V0LXNpemUnLFxuICAgICAgICAndW5pZHJhZ2dlci91bmlkcmFnZ2VyJ1xuICAgICAgXSxcbiAgICAgIGZ1bmN0aW9uKCBnZXRTaXplLCBVbmlkcmFnZ2VyICkge1xuICAgICAgICByZXR1cm4gZmFjdG9yeSggd2luZG93LCBnZXRTaXplLCBVbmlkcmFnZ2VyICk7XG4gICAgICB9KTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHJlcXVpcmUoJ2dldC1zaXplJyksXG4gICAgICByZXF1aXJlKCd1bmlkcmFnZ2VyJylcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgd2luZG93LkRyYWdnYWJpbGx5ID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHdpbmRvdy5nZXRTaXplLFxuICAgICAgd2luZG93LlVuaWRyYWdnZXJcbiAgICApO1xuICB9XG5cbn0oIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSggd2luZG93LCBnZXRTaXplLCBVbmlkcmFnZ2VyICkge1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIHZhcnNcbnZhciBkb2N1bWVudCA9IHdpbmRvdy5kb2N1bWVudDtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGhlbHBlcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLy8gZXh0ZW5kIG9iamVjdHNcbmZ1bmN0aW9uIGV4dGVuZCggYSwgYiApIHtcbiAgZm9yICggdmFyIHByb3AgaW4gYiApIHtcbiAgICBhWyBwcm9wIF0gPSBiWyBwcm9wIF07XG4gIH1cbiAgcmV0dXJuIGE7XG59XG5cbmZ1bmN0aW9uIGlzRWxlbWVudCggb2JqICkge1xuICByZXR1cm4gb2JqIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQ7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHJlcXVlc3RBbmltYXRpb25GcmFtZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vLyBnZXQgckFGLCBwcmVmaXhlZCwgaWYgcHJlc2VudFxudmFyIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuXG4vLyBmYWxsYmFjayB0byBzZXRUaW1lb3V0XG52YXIgbGFzdFRpbWUgPSAwO1xuaWYgKCAhcmVxdWVzdEFuaW1hdGlvbkZyYW1lICkgIHtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oIGNhbGxiYWNrICkge1xuICAgIHZhciBjdXJyVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHZhciB0aW1lVG9DYWxsID0gTWF0aC5tYXgoIDAsIDE2IC0gKCBjdXJyVGltZSAtIGxhc3RUaW1lICkgKTtcbiAgICB2YXIgaWQgPSBzZXRUaW1lb3V0KCBjYWxsYmFjaywgdGltZVRvQ2FsbCApO1xuICAgIGxhc3RUaW1lID0gY3VyclRpbWUgKyB0aW1lVG9DYWxsO1xuICAgIHJldHVybiBpZDtcbiAgfTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gc3VwcG9ydCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG52YXIgZG9jRWxlbSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbnZhciB0cmFuc2Zvcm1Qcm9wZXJ0eSA9IHR5cGVvZiBkb2NFbGVtLnN0eWxlLnRyYW5zZm9ybSA9PSAnc3RyaW5nJyA/XG4gICd0cmFuc2Zvcm0nIDogJ1dlYmtpdFRyYW5zZm9ybSc7XG5cbnZhciBqUXVlcnkgPSB3aW5kb3cualF1ZXJ5O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuZnVuY3Rpb24gRHJhZ2dhYmlsbHkoIGVsZW1lbnQsIG9wdGlvbnMgKSB7XG4gIC8vIHF1ZXJ5U2VsZWN0b3IgaWYgc3RyaW5nXG4gIHRoaXMuZWxlbWVudCA9IHR5cGVvZiBlbGVtZW50ID09ICdzdHJpbmcnID9cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCBlbGVtZW50ICkgOiBlbGVtZW50O1xuXG4gIGlmICggalF1ZXJ5ICkge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBqUXVlcnkoIHRoaXMuZWxlbWVudCApO1xuICB9XG5cbiAgLy8gb3B0aW9uc1xuICB0aGlzLm9wdGlvbnMgPSBleHRlbmQoIHt9LCB0aGlzLmNvbnN0cnVjdG9yLmRlZmF1bHRzICk7XG4gIHRoaXMub3B0aW9uKCBvcHRpb25zICk7XG5cbiAgdGhpcy5fY3JlYXRlKCk7XG59XG5cbi8vIGluaGVyaXQgVW5pZHJhZ2dlciBtZXRob2RzXG52YXIgcHJvdG8gPSBEcmFnZ2FiaWxseS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBVbmlkcmFnZ2VyLnByb3RvdHlwZSApO1xuXG5EcmFnZ2FiaWxseS5kZWZhdWx0cyA9IHtcbn07XG5cbi8qKlxuICogc2V0IG9wdGlvbnNcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzXG4gKi9cbnByb3RvLm9wdGlvbiA9IGZ1bmN0aW9uKCBvcHRzICkge1xuICBleHRlbmQoIHRoaXMub3B0aW9ucywgb3B0cyApO1xufTtcblxuLy8gY3NzIHBvc2l0aW9uIHZhbHVlcyB0aGF0IGRvbid0IG5lZWQgdG8gYmUgc2V0XG52YXIgcG9zaXRpb25WYWx1ZXMgPSB7XG4gIHJlbGF0aXZlOiB0cnVlLFxuICBhYnNvbHV0ZTogdHJ1ZSxcbiAgZml4ZWQ6IHRydWVcbn07XG5cbnByb3RvLl9jcmVhdGUgPSBmdW5jdGlvbigpIHtcblxuICAvLyBwcm9wZXJ0aWVzXG4gIHRoaXMucG9zaXRpb24gPSB7fTtcbiAgdGhpcy5fZ2V0UG9zaXRpb24oKTtcblxuICB0aGlzLnN0YXJ0UG9pbnQgPSB7IHg6IDAsIHk6IDAgfTtcbiAgdGhpcy5kcmFnUG9pbnQgPSB7IHg6IDAsIHk6IDAgfTtcblxuICB0aGlzLnN0YXJ0UG9zaXRpb24gPSBleHRlbmQoIHt9LCB0aGlzLnBvc2l0aW9uICk7XG5cbiAgLy8gc2V0IHJlbGF0aXZlIHBvc2l0aW9uaW5nXG4gIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoIHRoaXMuZWxlbWVudCApO1xuICBpZiAoICFwb3NpdGlvblZhbHVlc1sgc3R5bGUucG9zaXRpb24gXSApIHtcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnO1xuICB9XG5cbiAgdGhpcy5lbmFibGUoKTtcbiAgdGhpcy5zZXRIYW5kbGVzKCk7XG5cbn07XG5cbi8qKlxuICogc2V0IHRoaXMuaGFuZGxlcyBhbmQgYmluZCBzdGFydCBldmVudHMgdG8gJ2VtXG4gKi9cbnByb3RvLnNldEhhbmRsZXMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5oYW5kbGVzID0gdGhpcy5vcHRpb25zLmhhbmRsZSA/XG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoIHRoaXMub3B0aW9ucy5oYW5kbGUgKSA6IFsgdGhpcy5lbGVtZW50IF07XG5cbiAgdGhpcy5iaW5kSGFuZGxlcygpO1xufTtcblxuLyoqXG4gKiBlbWl0cyBldmVudHMgdmlhIEV2RW1pdHRlciBhbmQgalF1ZXJ5IGV2ZW50c1xuICogQHBhcmFtIHtTdHJpbmd9IHR5cGUgLSBuYW1lIG9mIGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIG9yaWdpbmFsIGV2ZW50XG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzIC0gZXh0cmEgYXJndW1lbnRzXG4gKi9cbnByb3RvLmRpc3BhdGNoRXZlbnQgPSBmdW5jdGlvbiggdHlwZSwgZXZlbnQsIGFyZ3MgKSB7XG4gIHZhciBlbWl0QXJncyA9IFsgZXZlbnQgXS5jb25jYXQoIGFyZ3MgKTtcbiAgdGhpcy5lbWl0RXZlbnQoIHR5cGUsIGVtaXRBcmdzICk7XG4gIHZhciBqUXVlcnkgPSB3aW5kb3cualF1ZXJ5O1xuICAvLyB0cmlnZ2VyIGpRdWVyeSBldmVudFxuICBpZiAoIGpRdWVyeSAmJiB0aGlzLiRlbGVtZW50ICkge1xuICAgIGlmICggZXZlbnQgKSB7XG4gICAgICAvLyBjcmVhdGUgalF1ZXJ5IGV2ZW50XG4gICAgICB2YXIgJGV2ZW50ID0galF1ZXJ5LkV2ZW50KCBldmVudCApO1xuICAgICAgJGV2ZW50LnR5cGUgPSB0eXBlO1xuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCAkZXZlbnQsIGFyZ3MgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8ganVzdCB0cmlnZ2VyIHdpdGggdHlwZSBpZiBubyBldmVudCBhdmFpbGFibGVcbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlciggdHlwZSwgYXJncyApO1xuICAgIH1cbiAgfVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gcG9zaXRpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLy8gZ2V0IHgveSBwb3NpdGlvbiBmcm9tIHN0eWxlXG5wcm90by5fZ2V0UG9zaXRpb24gPSBmdW5jdGlvbigpIHtcbiAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZSggdGhpcy5lbGVtZW50ICk7XG4gIHZhciB4ID0gdGhpcy5fZ2V0UG9zaXRpb25Db29yZCggc3R5bGUubGVmdCwgJ3dpZHRoJyApO1xuICB2YXIgeSA9IHRoaXMuX2dldFBvc2l0aW9uQ29vcmQoIHN0eWxlLnRvcCwgJ2hlaWdodCcgKTtcbiAgLy8gY2xlYW4gdXAgJ2F1dG8nIG9yIG90aGVyIG5vbi1pbnRlZ2VyIHZhbHVlc1xuICB0aGlzLnBvc2l0aW9uLnggPSBpc05hTiggeCApID8gMCA6IHg7XG4gIHRoaXMucG9zaXRpb24ueSA9IGlzTmFOKCB5ICkgPyAwIDogeTtcblxuICB0aGlzLl9hZGRUcmFuc2Zvcm1Qb3NpdGlvbiggc3R5bGUgKTtcbn07XG5cbnByb3RvLl9nZXRQb3NpdGlvbkNvb3JkID0gZnVuY3Rpb24oIHN0eWxlU2lkZSwgbWVhc3VyZSApIHtcbiAgaWYgKCBzdHlsZVNpZGUuaW5kZXhPZignJScpICE9IC0xICkge1xuICAgIC8vIGNvbnZlcnQgcGVyY2VudCBpbnRvIHBpeGVsIGZvciBTYWZhcmksICM3NVxuICAgIHZhciBwYXJlbnRTaXplID0gZ2V0U2l6ZSggdGhpcy5lbGVtZW50LnBhcmVudE5vZGUgKTtcbiAgICAvLyBwcmV2ZW50IG5vdC1pbi1ET00gZWxlbWVudCB0aHJvd2luZyBidWcsICMxMzFcbiAgICByZXR1cm4gIXBhcmVudFNpemUgPyAwIDpcbiAgICAgICggcGFyc2VGbG9hdCggc3R5bGVTaWRlICkgLyAxMDAgKSAqIHBhcmVudFNpemVbIG1lYXN1cmUgXTtcbiAgfVxuICByZXR1cm4gcGFyc2VJbnQoIHN0eWxlU2lkZSwgMTAgKTtcbn07XG5cbi8vIGFkZCB0cmFuc2Zvcm06IHRyYW5zbGF0ZSggeCwgeSApIHRvIHBvc2l0aW9uXG5wcm90by5fYWRkVHJhbnNmb3JtUG9zaXRpb24gPSBmdW5jdGlvbiggc3R5bGUgKSB7XG4gIHZhciB0cmFuc2Zvcm0gPSBzdHlsZVsgdHJhbnNmb3JtUHJvcGVydHkgXTtcbiAgLy8gYmFpbCBvdXQgaWYgdmFsdWUgaXMgJ25vbmUnXG4gIGlmICggdHJhbnNmb3JtLmluZGV4T2YoJ21hdHJpeCcpICE9PSAwICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBzcGxpdCBtYXRyaXgoMSwgMCwgMCwgMSwgeCwgeSlcbiAgdmFyIG1hdHJpeFZhbHVlcyA9IHRyYW5zZm9ybS5zcGxpdCgnLCcpO1xuICAvLyB0cmFuc2xhdGUgWCB2YWx1ZSBpcyBpbiAxMnRoIG9yIDR0aCBwb3NpdGlvblxuICB2YXIgeEluZGV4ID0gdHJhbnNmb3JtLmluZGV4T2YoJ21hdHJpeDNkJykgPT09IDAgPyAxMiA6IDQ7XG4gIHZhciB0cmFuc2xhdGVYID0gcGFyc2VJbnQoIG1hdHJpeFZhbHVlc1sgeEluZGV4IF0sIDEwICk7XG4gIC8vIHRyYW5zbGF0ZSBZIHZhbHVlIGlzIGluIDEzdGggb3IgNXRoIHBvc2l0aW9uXG4gIHZhciB0cmFuc2xhdGVZID0gcGFyc2VJbnQoIG1hdHJpeFZhbHVlc1sgeEluZGV4ICsgMSBdLCAxMCApO1xuICB0aGlzLnBvc2l0aW9uLnggKz0gdHJhbnNsYXRlWDtcbiAgdGhpcy5wb3NpdGlvbi55ICs9IHRyYW5zbGF0ZVk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBldmVudHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLyoqXG4gKiBwb2ludGVyIHN0YXJ0XG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICogQHBhcmFtIHtFdmVudCBvciBUb3VjaH0gcG9pbnRlclxuICovXG5wcm90by5wb2ludGVyRG93biA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5fZHJhZ1BvaW50ZXJEb3duKCBldmVudCwgcG9pbnRlciApO1xuICAvLyBrbHVkZ2UgdG8gYmx1ciBmb2N1c2VkIGlucHV0cyBpbiBkcmFnZ2VyXG4gIHZhciBmb2N1c2VkID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgLy8gZG8gbm90IGJsdXIgYm9keSBmb3IgSUUxMCwgbWV0YWZpenp5L2ZsaWNraXR5IzExN1xuICBpZiAoIGZvY3VzZWQgJiYgZm9jdXNlZC5ibHVyICYmIGZvY3VzZWQgIT0gZG9jdW1lbnQuYm9keSApIHtcbiAgICBmb2N1c2VkLmJsdXIoKTtcbiAgfVxuICAvLyBiaW5kIG1vdmUgYW5kIGVuZCBldmVudHNcbiAgdGhpcy5fYmluZFBvc3RTdGFydEV2ZW50cyggZXZlbnQgKTtcbiAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lzLXBvaW50ZXItZG93bicpO1xuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdwb2ludGVyRG93bicsIGV2ZW50LCBbIHBvaW50ZXIgXSApO1xufTtcblxuLyoqXG4gKiBkcmFnIG1vdmVcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50IG9yIFRvdWNofSBwb2ludGVyXG4gKi9cbnByb3RvLnBvaW50ZXJNb3ZlID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB2YXIgbW92ZVZlY3RvciA9IHRoaXMuX2RyYWdQb2ludGVyTW92ZSggZXZlbnQsIHBvaW50ZXIgKTtcbiAgdGhpcy5kaXNwYXRjaEV2ZW50KCAncG9pbnRlck1vdmUnLCBldmVudCwgWyBwb2ludGVyLCBtb3ZlVmVjdG9yIF0gKTtcbiAgdGhpcy5fZHJhZ01vdmUoIGV2ZW50LCBwb2ludGVyLCBtb3ZlVmVjdG9yICk7XG59O1xuXG4vKipcbiAqIGRyYWcgc3RhcnRcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50IG9yIFRvdWNofSBwb2ludGVyXG4gKi9cbnByb3RvLmRyYWdTdGFydCA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgaWYgKCAhdGhpcy5pc0VuYWJsZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMuX2dldFBvc2l0aW9uKCk7XG4gIHRoaXMubWVhc3VyZUNvbnRhaW5tZW50KCk7XG4gIC8vIHBvc2l0aW9uIF93aGVuXyBkcmFnIGJlZ2FuXG4gIHRoaXMuc3RhcnRQb3NpdGlvbi54ID0gdGhpcy5wb3NpdGlvbi54O1xuICB0aGlzLnN0YXJ0UG9zaXRpb24ueSA9IHRoaXMucG9zaXRpb24ueTtcbiAgLy8gcmVzZXQgbGVmdC90b3Agc3R5bGVcbiAgdGhpcy5zZXRMZWZ0VG9wKCk7XG5cbiAgdGhpcy5kcmFnUG9pbnQueCA9IDA7XG4gIHRoaXMuZHJhZ1BvaW50LnkgPSAwO1xuXG4gIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpcy1kcmFnZ2luZycpO1xuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdkcmFnU3RhcnQnLCBldmVudCwgWyBwb2ludGVyIF0gKTtcbiAgLy8gc3RhcnQgYW5pbWF0aW9uXG4gIHRoaXMuYW5pbWF0ZSgpO1xufTtcblxucHJvdG8ubWVhc3VyZUNvbnRhaW5tZW50ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBjb250YWlubWVudCA9IHRoaXMub3B0aW9ucy5jb250YWlubWVudDtcbiAgaWYgKCAhY29udGFpbm1lbnQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gdXNlIGVsZW1lbnQgaWYgZWxlbWVudFxuICB2YXIgY29udGFpbmVyID0gaXNFbGVtZW50KCBjb250YWlubWVudCApID8gY29udGFpbm1lbnQgOlxuICAgIC8vIGZhbGxiYWNrIHRvIHF1ZXJ5U2VsZWN0b3IgaWYgc3RyaW5nXG4gICAgdHlwZW9mIGNvbnRhaW5tZW50ID09ICdzdHJpbmcnID8gZG9jdW1lbnQucXVlcnlTZWxlY3RvciggY29udGFpbm1lbnQgKSA6XG4gICAgLy8gb3RoZXJ3aXNlIGp1c3QgYHRydWVgLCB1c2UgdGhlIHBhcmVudFxuICAgIHRoaXMuZWxlbWVudC5wYXJlbnROb2RlO1xuXG4gIHZhciBlbGVtU2l6ZSA9IGdldFNpemUoIHRoaXMuZWxlbWVudCApO1xuICB2YXIgY29udGFpbmVyU2l6ZSA9IGdldFNpemUoIGNvbnRhaW5lciApO1xuICB2YXIgZWxlbVJlY3QgPSB0aGlzLmVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHZhciBjb250YWluZXJSZWN0ID0gY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gIHZhciBib3JkZXJTaXplWCA9IGNvbnRhaW5lclNpemUuYm9yZGVyTGVmdFdpZHRoICsgY29udGFpbmVyU2l6ZS5ib3JkZXJSaWdodFdpZHRoO1xuICB2YXIgYm9yZGVyU2l6ZVkgPSBjb250YWluZXJTaXplLmJvcmRlclRvcFdpZHRoICsgY29udGFpbmVyU2l6ZS5ib3JkZXJCb3R0b21XaWR0aDtcblxuICB2YXIgcG9zaXRpb24gPSB0aGlzLnJlbGF0aXZlU3RhcnRQb3NpdGlvbiA9IHtcbiAgICB4OiBlbGVtUmVjdC5sZWZ0IC0gKCBjb250YWluZXJSZWN0LmxlZnQgKyBjb250YWluZXJTaXplLmJvcmRlckxlZnRXaWR0aCApLFxuICAgIHk6IGVsZW1SZWN0LnRvcCAtICggY29udGFpbmVyUmVjdC50b3AgKyBjb250YWluZXJTaXplLmJvcmRlclRvcFdpZHRoIClcbiAgfTtcblxuICB0aGlzLmNvbnRhaW5TaXplID0ge1xuICAgIHdpZHRoOiAoIGNvbnRhaW5lclNpemUud2lkdGggLSBib3JkZXJTaXplWCApIC0gcG9zaXRpb24ueCAtIGVsZW1TaXplLndpZHRoLFxuICAgIGhlaWdodDogKCBjb250YWluZXJTaXplLmhlaWdodCAtIGJvcmRlclNpemVZICkgLSBwb3NpdGlvbi55IC0gZWxlbVNpemUuaGVpZ2h0XG4gIH07XG59O1xuXG4vLyAtLS0tLSBtb3ZlIGV2ZW50IC0tLS0tIC8vXG5cbi8qKlxuICogZHJhZyBtb3ZlXG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICogQHBhcmFtIHtFdmVudCBvciBUb3VjaH0gcG9pbnRlclxuICovXG5wcm90by5kcmFnTW92ZSA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciwgbW92ZVZlY3RvciApIHtcbiAgaWYgKCAhdGhpcy5pc0VuYWJsZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBkcmFnWCA9IG1vdmVWZWN0b3IueDtcbiAgdmFyIGRyYWdZID0gbW92ZVZlY3Rvci55O1xuXG4gIHZhciBncmlkID0gdGhpcy5vcHRpb25zLmdyaWQ7XG4gIHZhciBncmlkWCA9IGdyaWQgJiYgZ3JpZFswXTtcbiAgdmFyIGdyaWRZID0gZ3JpZCAmJiBncmlkWzFdO1xuXG4gIGRyYWdYID0gYXBwbHlHcmlkKCBkcmFnWCwgZ3JpZFggKTtcbiAgZHJhZ1kgPSBhcHBseUdyaWQoIGRyYWdZLCBncmlkWSApO1xuXG4gIGRyYWdYID0gdGhpcy5jb250YWluRHJhZyggJ3gnLCBkcmFnWCwgZ3JpZFggKTtcbiAgZHJhZ1kgPSB0aGlzLmNvbnRhaW5EcmFnKCAneScsIGRyYWdZLCBncmlkWSApO1xuXG4gIC8vIGNvbnN0cmFpbiB0byBheGlzXG4gIGRyYWdYID0gdGhpcy5vcHRpb25zLmF4aXMgPT0gJ3knID8gMCA6IGRyYWdYO1xuICBkcmFnWSA9IHRoaXMub3B0aW9ucy5heGlzID09ICd4JyA/IDAgOiBkcmFnWTtcblxuICB0aGlzLnBvc2l0aW9uLnggPSB0aGlzLnN0YXJ0UG9zaXRpb24ueCArIGRyYWdYO1xuICB0aGlzLnBvc2l0aW9uLnkgPSB0aGlzLnN0YXJ0UG9zaXRpb24ueSArIGRyYWdZO1xuICAvLyBzZXQgZHJhZ1BvaW50IHByb3BlcnRpZXNcbiAgdGhpcy5kcmFnUG9pbnQueCA9IGRyYWdYO1xuICB0aGlzLmRyYWdQb2ludC55ID0gZHJhZ1k7XG5cbiAgdGhpcy5kaXNwYXRjaEV2ZW50KCAnZHJhZ01vdmUnLCBldmVudCwgWyBwb2ludGVyLCBtb3ZlVmVjdG9yIF0gKTtcbn07XG5cbmZ1bmN0aW9uIGFwcGx5R3JpZCggdmFsdWUsIGdyaWQsIG1ldGhvZCApIHtcbiAgbWV0aG9kID0gbWV0aG9kIHx8ICdyb3VuZCc7XG4gIHJldHVybiBncmlkID8gTWF0aFsgbWV0aG9kIF0oIHZhbHVlIC8gZ3JpZCApICogZ3JpZCA6IHZhbHVlO1xufVxuXG5wcm90by5jb250YWluRHJhZyA9IGZ1bmN0aW9uKCBheGlzLCBkcmFnLCBncmlkICkge1xuICBpZiAoICF0aGlzLm9wdGlvbnMuY29udGFpbm1lbnQgKSB7XG4gICAgcmV0dXJuIGRyYWc7XG4gIH1cbiAgdmFyIG1lYXN1cmUgPSBheGlzID09ICd4JyA/ICd3aWR0aCcgOiAnaGVpZ2h0JztcblxuICB2YXIgcmVsID0gdGhpcy5yZWxhdGl2ZVN0YXJ0UG9zaXRpb25bIGF4aXMgXTtcbiAgdmFyIG1pbiA9IGFwcGx5R3JpZCggLXJlbCwgZ3JpZCwgJ2NlaWwnICk7XG4gIHZhciBtYXggPSB0aGlzLmNvbnRhaW5TaXplWyBtZWFzdXJlIF07XG4gIG1heCA9IGFwcGx5R3JpZCggbWF4LCBncmlkLCAnZmxvb3InICk7XG4gIHJldHVybiAgTWF0aC5taW4oIG1heCwgTWF0aC5tYXgoIG1pbiwgZHJhZyApICk7XG59O1xuXG4vLyAtLS0tLSBlbmQgZXZlbnQgLS0tLS0gLy9cblxuLyoqXG4gKiBwb2ludGVyIHVwXG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICogQHBhcmFtIHtFdmVudCBvciBUb3VjaH0gcG9pbnRlclxuICovXG5wcm90by5wb2ludGVyVXAgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1wb2ludGVyLWRvd24nKTtcbiAgdGhpcy5kaXNwYXRjaEV2ZW50KCAncG9pbnRlclVwJywgZXZlbnQsIFsgcG9pbnRlciBdICk7XG4gIHRoaXMuX2RyYWdQb2ludGVyVXAoIGV2ZW50LCBwb2ludGVyICk7XG59O1xuXG4vKipcbiAqIGRyYWcgZW5kXG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICogQHBhcmFtIHtFdmVudCBvciBUb3VjaH0gcG9pbnRlclxuICovXG5wcm90by5kcmFnRW5kID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICBpZiAoICF0aGlzLmlzRW5hYmxlZCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gdXNlIHRvcCBsZWZ0IHBvc2l0aW9uIHdoZW4gY29tcGxldGVcbiAgaWYgKCB0cmFuc2Zvcm1Qcm9wZXJ0eSApIHtcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGVbIHRyYW5zZm9ybVByb3BlcnR5IF0gPSAnJztcbiAgICB0aGlzLnNldExlZnRUb3AoKTtcbiAgfVxuICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtZHJhZ2dpbmcnKTtcbiAgdGhpcy5kaXNwYXRjaEV2ZW50KCAnZHJhZ0VuZCcsIGV2ZW50LCBbIHBvaW50ZXIgXSApO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gYW5pbWF0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnByb3RvLmFuaW1hdGUgPSBmdW5jdGlvbigpIHtcbiAgLy8gb25seSByZW5kZXIgYW5kIGFuaW1hdGUgaWYgZHJhZ2dpbmdcbiAgaWYgKCAhdGhpcy5pc0RyYWdnaW5nICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMucG9zaXRpb25EcmFnKCk7XG5cbiAgdmFyIF90aGlzID0gdGhpcztcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCBmdW5jdGlvbiBhbmltYXRlRnJhbWUoKSB7XG4gICAgX3RoaXMuYW5pbWF0ZSgpO1xuICB9KTtcblxufTtcblxuLy8gbGVmdC90b3AgcG9zaXRpb25pbmdcbnByb3RvLnNldExlZnRUb3AgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5lbGVtZW50LnN0eWxlLmxlZnQgPSB0aGlzLnBvc2l0aW9uLnggKyAncHgnO1xuICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wICA9IHRoaXMucG9zaXRpb24ueSArICdweCc7XG59O1xuXG5wcm90by5wb3NpdGlvbkRyYWcgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5lbGVtZW50LnN0eWxlWyB0cmFuc2Zvcm1Qcm9wZXJ0eSBdID0gJ3RyYW5zbGF0ZTNkKCAnICsgdGhpcy5kcmFnUG9pbnQueCArXG4gICAgJ3B4LCAnICsgdGhpcy5kcmFnUG9pbnQueSArICdweCwgMCknO1xufTtcblxuLy8gLS0tLS0gc3RhdGljQ2xpY2sgLS0tLS0gLy9cblxucHJvdG8uc3RhdGljQ2xpY2sgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMuZGlzcGF0Y2hFdmVudCggJ3N0YXRpY0NsaWNrJywgZXZlbnQsIFsgcG9pbnRlciBdICk7XG59O1xuXG4vLyAtLS0tLSBtZXRob2RzIC0tLS0tIC8vXG5cbnByb3RvLmVuYWJsZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmlzRW5hYmxlZCA9IHRydWU7XG59O1xuXG5wcm90by5kaXNhYmxlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaXNFbmFibGVkID0gZmFsc2U7XG4gIGlmICggdGhpcy5pc0RyYWdnaW5nICkge1xuICAgIHRoaXMuZHJhZ0VuZCgpO1xuICB9XG59O1xuXG5wcm90by5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZGlzYWJsZSgpO1xuICAvLyByZXNldCBzdHlsZXNcbiAgdGhpcy5lbGVtZW50LnN0eWxlWyB0cmFuc2Zvcm1Qcm9wZXJ0eSBdID0gJyc7XG4gIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gJyc7XG4gIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSAnJztcbiAgdGhpcy5lbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJyc7XG4gIC8vIHVuYmluZCBoYW5kbGVzXG4gIHRoaXMudW5iaW5kSGFuZGxlcygpO1xuICAvLyByZW1vdmUgalF1ZXJ5IGRhdGFcbiAgaWYgKCB0aGlzLiRlbGVtZW50ICkge1xuICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlRGF0YSgnZHJhZ2dhYmlsbHknKTtcbiAgfVxufTtcblxuLy8gLS0tLS0galF1ZXJ5IGJyaWRnZXQgLS0tLS0gLy9cblxuLy8gcmVxdWlyZWQgZm9yIGpRdWVyeSBicmlkZ2V0XG5wcm90by5faW5pdCA9IG5vb3A7XG5cbmlmICggalF1ZXJ5ICYmIGpRdWVyeS5icmlkZ2V0ICkge1xuICBqUXVlcnkuYnJpZGdldCggJ2RyYWdnYWJpbGx5JywgRHJhZ2dhYmlsbHkgKTtcbn1cblxuLy8gLS0tLS0gIC0tLS0tIC8vXG5cbnJldHVybiBEcmFnZ2FiaWxseTtcblxufSkpO1xuIiwiLyoqXG4gKiBFdkVtaXR0ZXIgdjEuMC4zXG4gKiBMaWwnIGV2ZW50IGVtaXR0ZXJcbiAqIE1JVCBMaWNlbnNlXG4gKi9cblxuLyoganNoaW50IHVudXNlZDogdHJ1ZSwgdW5kZWY6IHRydWUsIHN0cmljdDogdHJ1ZSAqL1xuXG4oIGZ1bmN0aW9uKCBnbG9iYWwsIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICAvKiBqc2hpbnQgc3RyaWN0OiBmYWxzZSAqLyAvKiBnbG9iYWxzIGRlZmluZSwgbW9kdWxlLCB3aW5kb3cgKi9cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTUQgLSBSZXF1aXJlSlNcbiAgICBkZWZpbmUoIGZhY3RvcnkgKTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KUyAtIEJyb3dzZXJpZnksIFdlYnBhY2tcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHNcbiAgICBnbG9iYWwuRXZFbWl0dGVyID0gZmFjdG9yeSgpO1xuICB9XG5cbn0oIHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB0aGlzLCBmdW5jdGlvbigpIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIEV2RW1pdHRlcigpIHt9XG5cbnZhciBwcm90byA9IEV2RW1pdHRlci5wcm90b3R5cGU7XG5cbnByb3RvLm9uID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKSB7XG4gIGlmICggIWV2ZW50TmFtZSB8fCAhbGlzdGVuZXIgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIHNldCBldmVudHMgaGFzaFxuICB2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICAvLyBzZXQgbGlzdGVuZXJzIGFycmF5XG4gIHZhciBsaXN0ZW5lcnMgPSBldmVudHNbIGV2ZW50TmFtZSBdID0gZXZlbnRzWyBldmVudE5hbWUgXSB8fCBbXTtcbiAgLy8gb25seSBhZGQgb25jZVxuICBpZiAoIGxpc3RlbmVycy5pbmRleE9mKCBsaXN0ZW5lciApID09IC0xICkge1xuICAgIGxpc3RlbmVycy5wdXNoKCBsaXN0ZW5lciApO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5wcm90by5vbmNlID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKSB7XG4gIGlmICggIWV2ZW50TmFtZSB8fCAhbGlzdGVuZXIgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIGFkZCBldmVudFxuICB0aGlzLm9uKCBldmVudE5hbWUsIGxpc3RlbmVyICk7XG4gIC8vIHNldCBvbmNlIGZsYWdcbiAgLy8gc2V0IG9uY2VFdmVudHMgaGFzaFxuICB2YXIgb25jZUV2ZW50cyA9IHRoaXMuX29uY2VFdmVudHMgPSB0aGlzLl9vbmNlRXZlbnRzIHx8IHt9O1xuICAvLyBzZXQgb25jZUxpc3RlbmVycyBvYmplY3RcbiAgdmFyIG9uY2VMaXN0ZW5lcnMgPSBvbmNlRXZlbnRzWyBldmVudE5hbWUgXSA9IG9uY2VFdmVudHNbIGV2ZW50TmFtZSBdIHx8IHt9O1xuICAvLyBzZXQgZmxhZ1xuICBvbmNlTGlzdGVuZXJzWyBsaXN0ZW5lciBdID0gdHJ1ZTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbnByb3RvLm9mZiA9IGZ1bmN0aW9uKCBldmVudE5hbWUsIGxpc3RlbmVyICkge1xuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1sgZXZlbnROYW1lIF07XG4gIGlmICggIWxpc3RlbmVycyB8fCAhbGlzdGVuZXJzLmxlbmd0aCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGluZGV4ID0gbGlzdGVuZXJzLmluZGV4T2YoIGxpc3RlbmVyICk7XG4gIGlmICggaW5kZXggIT0gLTEgKSB7XG4gICAgbGlzdGVuZXJzLnNwbGljZSggaW5kZXgsIDEgKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxucHJvdG8uZW1pdEV2ZW50ID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgYXJncyApIHtcbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbIGV2ZW50TmFtZSBdO1xuICBpZiAoICFsaXN0ZW5lcnMgfHwgIWxpc3RlbmVycy5sZW5ndGggKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBpID0gMDtcbiAgdmFyIGxpc3RlbmVyID0gbGlzdGVuZXJzW2ldO1xuICBhcmdzID0gYXJncyB8fCBbXTtcbiAgLy8gb25jZSBzdHVmZlxuICB2YXIgb25jZUxpc3RlbmVycyA9IHRoaXMuX29uY2VFdmVudHMgJiYgdGhpcy5fb25jZUV2ZW50c1sgZXZlbnROYW1lIF07XG5cbiAgd2hpbGUgKCBsaXN0ZW5lciApIHtcbiAgICB2YXIgaXNPbmNlID0gb25jZUxpc3RlbmVycyAmJiBvbmNlTGlzdGVuZXJzWyBsaXN0ZW5lciBdO1xuICAgIGlmICggaXNPbmNlICkge1xuICAgICAgLy8gcmVtb3ZlIGxpc3RlbmVyXG4gICAgICAvLyByZW1vdmUgYmVmb3JlIHRyaWdnZXIgdG8gcHJldmVudCByZWN1cnNpb25cbiAgICAgIHRoaXMub2ZmKCBldmVudE5hbWUsIGxpc3RlbmVyICk7XG4gICAgICAvLyB1bnNldCBvbmNlIGZsYWdcbiAgICAgIGRlbGV0ZSBvbmNlTGlzdGVuZXJzWyBsaXN0ZW5lciBdO1xuICAgIH1cbiAgICAvLyB0cmlnZ2VyIGxpc3RlbmVyXG4gICAgbGlzdGVuZXIuYXBwbHkoIHRoaXMsIGFyZ3MgKTtcbiAgICAvLyBnZXQgbmV4dCBsaXN0ZW5lclxuICAgIGkgKz0gaXNPbmNlID8gMCA6IDE7XG4gICAgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbaV07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbnJldHVybiBFdkVtaXR0ZXI7XG5cbn0pKTtcbiIsIlxuLyoqXG4gKiBNb2R1bGUgZXhwb3J0cy5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdldERvY3VtZW50O1xuXG4vLyBkZWZpbmVkIGJ5IHczY1xudmFyIERPQ1VNRU5UX05PREUgPSA5O1xuXG4vKipcbiAqIFJldHVybnMgYHRydWVgIGlmIGB3YCBpcyBhIERvY3VtZW50IG9iamVjdCwgb3IgYGZhbHNlYCBvdGhlcndpc2UuXG4gKlxuICogQHBhcmFtIHs/fSBkIC0gRG9jdW1lbnQgb2JqZWN0LCBtYXliZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNEb2N1bWVudCAoZCkge1xuICByZXR1cm4gZCAmJiBkLm5vZGVUeXBlID09PSBET0NVTUVOVF9OT0RFO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGBkb2N1bWVudGAgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCB0aGUgZ2l2ZW4gYG5vZGVgLCB3aGljaCBtYXkgYmVcbiAqIGEgRE9NIGVsZW1lbnQsIHRoZSBXaW5kb3cgb2JqZWN0LCBhIFNlbGVjdGlvbiwgYSBSYW5nZS4gQmFzaWNhbGx5IGFueSBET01cbiAqIG9iamVjdCB0aGF0IHJlZmVyZW5jZXMgdGhlIERvY3VtZW50IGluIHNvbWUgd2F5LCB0aGlzIGZ1bmN0aW9uIHdpbGwgZmluZCBpdC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSBub2RlIC0gRE9NIG5vZGUsIHNlbGVjdGlvbiwgb3IgcmFuZ2UgaW4gd2hpY2ggdG8gZmluZCB0aGUgYGRvY3VtZW50YCBvYmplY3RcbiAqIEByZXR1cm4ge0RvY3VtZW50fSB0aGUgYGRvY3VtZW50YCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIGBub2RlYFxuICogQHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGdldERvY3VtZW50KG5vZGUpIHtcbiAgaWYgKGlzRG9jdW1lbnQobm9kZSkpIHtcbiAgICByZXR1cm4gbm9kZTtcblxuICB9IGVsc2UgaWYgKGlzRG9jdW1lbnQobm9kZS5vd25lckRvY3VtZW50KSkge1xuICAgIHJldHVybiBub2RlLm93bmVyRG9jdW1lbnQ7XG5cbiAgfSBlbHNlIGlmIChpc0RvY3VtZW50KG5vZGUuZG9jdW1lbnQpKSB7XG4gICAgcmV0dXJuIG5vZGUuZG9jdW1lbnQ7XG5cbiAgfSBlbHNlIGlmIChub2RlLnBhcmVudE5vZGUpIHtcbiAgICByZXR1cm4gZ2V0RG9jdW1lbnQobm9kZS5wYXJlbnROb2RlKTtcblxuICAvLyBSYW5nZSBzdXBwb3J0XG4gIH0gZWxzZSBpZiAobm9kZS5jb21tb25BbmNlc3RvckNvbnRhaW5lcikge1xuICAgIHJldHVybiBnZXREb2N1bWVudChub2RlLmNvbW1vbkFuY2VzdG9yQ29udGFpbmVyKTtcblxuICB9IGVsc2UgaWYgKG5vZGUuc3RhcnRDb250YWluZXIpIHtcbiAgICByZXR1cm4gZ2V0RG9jdW1lbnQobm9kZS5zdGFydENvbnRhaW5lcik7XG5cbiAgLy8gU2VsZWN0aW9uIHN1cHBvcnRcbiAgfSBlbHNlIGlmIChub2RlLmFuY2hvck5vZGUpIHtcbiAgICByZXR1cm4gZ2V0RG9jdW1lbnQobm9kZS5hbmNob3JOb2RlKTtcbiAgfVxufVxuIiwiLyohXG4gKiBnZXRTaXplIHYyLjAuMlxuICogbWVhc3VyZSBzaXplIG9mIGVsZW1lbnRzXG4gKiBNSVQgbGljZW5zZVxuICovXG5cbi8qanNoaW50IGJyb3dzZXI6IHRydWUsIHN0cmljdDogdHJ1ZSwgdW5kZWY6IHRydWUsIHVudXNlZDogdHJ1ZSAqL1xuLypnbG9iYWwgZGVmaW5lOiBmYWxzZSwgbW9kdWxlOiBmYWxzZSwgY29uc29sZTogZmFsc2UgKi9cblxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZhY3RvcnkoKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgd2luZG93LmdldFNpemUgPSBmYWN0b3J5KCk7XG4gIH1cblxufSkoIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSgpIHtcbid1c2Ugc3RyaWN0JztcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gaGVscGVycyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vLyBnZXQgYSBudW1iZXIgZnJvbSBhIHN0cmluZywgbm90IGEgcGVyY2VudGFnZVxuZnVuY3Rpb24gZ2V0U3R5bGVTaXplKCB2YWx1ZSApIHtcbiAgdmFyIG51bSA9IHBhcnNlRmxvYXQoIHZhbHVlICk7XG4gIC8vIG5vdCBhIHBlcmNlbnQgbGlrZSAnMTAwJScsIGFuZCBhIG51bWJlclxuICB2YXIgaXNWYWxpZCA9IHZhbHVlLmluZGV4T2YoJyUnKSA9PSAtMSAmJiAhaXNOYU4oIG51bSApO1xuICByZXR1cm4gaXNWYWxpZCAmJiBudW07XG59XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG52YXIgbG9nRXJyb3IgPSB0eXBlb2YgY29uc29sZSA9PSAndW5kZWZpbmVkJyA/IG5vb3AgOlxuICBmdW5jdGlvbiggbWVzc2FnZSApIHtcbiAgICBjb25zb2xlLmVycm9yKCBtZXNzYWdlICk7XG4gIH07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIG1lYXN1cmVtZW50cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG52YXIgbWVhc3VyZW1lbnRzID0gW1xuICAncGFkZGluZ0xlZnQnLFxuICAncGFkZGluZ1JpZ2h0JyxcbiAgJ3BhZGRpbmdUb3AnLFxuICAncGFkZGluZ0JvdHRvbScsXG4gICdtYXJnaW5MZWZ0JyxcbiAgJ21hcmdpblJpZ2h0JyxcbiAgJ21hcmdpblRvcCcsXG4gICdtYXJnaW5Cb3R0b20nLFxuICAnYm9yZGVyTGVmdFdpZHRoJyxcbiAgJ2JvcmRlclJpZ2h0V2lkdGgnLFxuICAnYm9yZGVyVG9wV2lkdGgnLFxuICAnYm9yZGVyQm90dG9tV2lkdGgnXG5dO1xuXG52YXIgbWVhc3VyZW1lbnRzTGVuZ3RoID0gbWVhc3VyZW1lbnRzLmxlbmd0aDtcblxuZnVuY3Rpb24gZ2V0WmVyb1NpemUoKSB7XG4gIHZhciBzaXplID0ge1xuICAgIHdpZHRoOiAwLFxuICAgIGhlaWdodDogMCxcbiAgICBpbm5lcldpZHRoOiAwLFxuICAgIGlubmVySGVpZ2h0OiAwLFxuICAgIG91dGVyV2lkdGg6IDAsXG4gICAgb3V0ZXJIZWlnaHQ6IDBcbiAgfTtcbiAgZm9yICggdmFyIGk9MDsgaSA8IG1lYXN1cmVtZW50c0xlbmd0aDsgaSsrICkge1xuICAgIHZhciBtZWFzdXJlbWVudCA9IG1lYXN1cmVtZW50c1tpXTtcbiAgICBzaXplWyBtZWFzdXJlbWVudCBdID0gMDtcbiAgfVxuICByZXR1cm4gc2l6ZTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gZ2V0U3R5bGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLyoqXG4gKiBnZXRTdHlsZSwgZ2V0IHN0eWxlIG9mIGVsZW1lbnQsIGNoZWNrIGZvciBGaXJlZm94IGJ1Z1xuICogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9NTQ4Mzk3XG4gKi9cbmZ1bmN0aW9uIGdldFN0eWxlKCBlbGVtICkge1xuICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKCBlbGVtICk7XG4gIGlmICggIXN0eWxlICkge1xuICAgIGxvZ0Vycm9yKCAnU3R5bGUgcmV0dXJuZWQgJyArIHN0eWxlICtcbiAgICAgICcuIEFyZSB5b3UgcnVubmluZyB0aGlzIGNvZGUgaW4gYSBoaWRkZW4gaWZyYW1lIG9uIEZpcmVmb3g/ICcgK1xuICAgICAgJ1NlZSBodHRwOi8vYml0Lmx5L2dldHNpemVidWcxJyApO1xuICB9XG4gIHJldHVybiBzdHlsZTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gc2V0dXAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxudmFyIGlzU2V0dXAgPSBmYWxzZTtcblxudmFyIGlzQm94U2l6ZU91dGVyO1xuXG4vKipcbiAqIHNldHVwXG4gKiBjaGVjayBpc0JveFNpemVyT3V0ZXJcbiAqIGRvIG9uIGZpcnN0IGdldFNpemUoKSByYXRoZXIgdGhhbiBvbiBwYWdlIGxvYWQgZm9yIEZpcmVmb3ggYnVnXG4gKi9cbmZ1bmN0aW9uIHNldHVwKCkge1xuICAvLyBzZXR1cCBvbmNlXG4gIGlmICggaXNTZXR1cCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaXNTZXR1cCA9IHRydWU7XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gYm94IHNpemluZyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4gIC8qKlxuICAgKiBXZWJLaXQgbWVhc3VyZXMgdGhlIG91dGVyLXdpZHRoIG9uIHN0eWxlLndpZHRoIG9uIGJvcmRlci1ib3ggZWxlbXNcbiAgICogSUUgJiBGaXJlZm94PDI5IG1lYXN1cmVzIHRoZSBpbm5lci13aWR0aFxuICAgKi9cbiAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBkaXYuc3R5bGUud2lkdGggPSAnMjAwcHgnO1xuICBkaXYuc3R5bGUucGFkZGluZyA9ICcxcHggMnB4IDNweCA0cHgnO1xuICBkaXYuc3R5bGUuYm9yZGVyU3R5bGUgPSAnc29saWQnO1xuICBkaXYuc3R5bGUuYm9yZGVyV2lkdGggPSAnMXB4IDJweCAzcHggNHB4JztcbiAgZGl2LnN0eWxlLmJveFNpemluZyA9ICdib3JkZXItYm94JztcblxuICB2YXIgYm9keSA9IGRvY3VtZW50LmJvZHkgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuICBib2R5LmFwcGVuZENoaWxkKCBkaXYgKTtcbiAgdmFyIHN0eWxlID0gZ2V0U3R5bGUoIGRpdiApO1xuXG4gIGdldFNpemUuaXNCb3hTaXplT3V0ZXIgPSBpc0JveFNpemVPdXRlciA9IGdldFN0eWxlU2l6ZSggc3R5bGUud2lkdGggKSA9PSAyMDA7XG4gIGJvZHkucmVtb3ZlQ2hpbGQoIGRpdiApO1xuXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGdldFNpemUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuZnVuY3Rpb24gZ2V0U2l6ZSggZWxlbSApIHtcbiAgc2V0dXAoKTtcblxuICAvLyB1c2UgcXVlcnlTZWxldG9yIGlmIGVsZW0gaXMgc3RyaW5nXG4gIGlmICggdHlwZW9mIGVsZW0gPT0gJ3N0cmluZycgKSB7XG4gICAgZWxlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIGVsZW0gKTtcbiAgfVxuXG4gIC8vIGRvIG5vdCBwcm9jZWVkIG9uIG5vbi1vYmplY3RzXG4gIGlmICggIWVsZW0gfHwgdHlwZW9mIGVsZW0gIT0gJ29iamVjdCcgfHwgIWVsZW0ubm9kZVR5cGUgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIHN0eWxlID0gZ2V0U3R5bGUoIGVsZW0gKTtcblxuICAvLyBpZiBoaWRkZW4sIGV2ZXJ5dGhpbmcgaXMgMFxuICBpZiAoIHN0eWxlLmRpc3BsYXkgPT0gJ25vbmUnICkge1xuICAgIHJldHVybiBnZXRaZXJvU2l6ZSgpO1xuICB9XG5cbiAgdmFyIHNpemUgPSB7fTtcbiAgc2l6ZS53aWR0aCA9IGVsZW0ub2Zmc2V0V2lkdGg7XG4gIHNpemUuaGVpZ2h0ID0gZWxlbS5vZmZzZXRIZWlnaHQ7XG5cbiAgdmFyIGlzQm9yZGVyQm94ID0gc2l6ZS5pc0JvcmRlckJveCA9IHN0eWxlLmJveFNpemluZyA9PSAnYm9yZGVyLWJveCc7XG5cbiAgLy8gZ2V0IGFsbCBtZWFzdXJlbWVudHNcbiAgZm9yICggdmFyIGk9MDsgaSA8IG1lYXN1cmVtZW50c0xlbmd0aDsgaSsrICkge1xuICAgIHZhciBtZWFzdXJlbWVudCA9IG1lYXN1cmVtZW50c1tpXTtcbiAgICB2YXIgdmFsdWUgPSBzdHlsZVsgbWVhc3VyZW1lbnQgXTtcbiAgICB2YXIgbnVtID0gcGFyc2VGbG9hdCggdmFsdWUgKTtcbiAgICAvLyBhbnkgJ2F1dG8nLCAnbWVkaXVtJyB2YWx1ZSB3aWxsIGJlIDBcbiAgICBzaXplWyBtZWFzdXJlbWVudCBdID0gIWlzTmFOKCBudW0gKSA/IG51bSA6IDA7XG4gIH1cblxuICB2YXIgcGFkZGluZ1dpZHRoID0gc2l6ZS5wYWRkaW5nTGVmdCArIHNpemUucGFkZGluZ1JpZ2h0O1xuICB2YXIgcGFkZGluZ0hlaWdodCA9IHNpemUucGFkZGluZ1RvcCArIHNpemUucGFkZGluZ0JvdHRvbTtcbiAgdmFyIG1hcmdpbldpZHRoID0gc2l6ZS5tYXJnaW5MZWZ0ICsgc2l6ZS5tYXJnaW5SaWdodDtcbiAgdmFyIG1hcmdpbkhlaWdodCA9IHNpemUubWFyZ2luVG9wICsgc2l6ZS5tYXJnaW5Cb3R0b207XG4gIHZhciBib3JkZXJXaWR0aCA9IHNpemUuYm9yZGVyTGVmdFdpZHRoICsgc2l6ZS5ib3JkZXJSaWdodFdpZHRoO1xuICB2YXIgYm9yZGVySGVpZ2h0ID0gc2l6ZS5ib3JkZXJUb3BXaWR0aCArIHNpemUuYm9yZGVyQm90dG9tV2lkdGg7XG5cbiAgdmFyIGlzQm9yZGVyQm94U2l6ZU91dGVyID0gaXNCb3JkZXJCb3ggJiYgaXNCb3hTaXplT3V0ZXI7XG5cbiAgLy8gb3ZlcndyaXRlIHdpZHRoIGFuZCBoZWlnaHQgaWYgd2UgY2FuIGdldCBpdCBmcm9tIHN0eWxlXG4gIHZhciBzdHlsZVdpZHRoID0gZ2V0U3R5bGVTaXplKCBzdHlsZS53aWR0aCApO1xuICBpZiAoIHN0eWxlV2lkdGggIT09IGZhbHNlICkge1xuICAgIHNpemUud2lkdGggPSBzdHlsZVdpZHRoICtcbiAgICAgIC8vIGFkZCBwYWRkaW5nIGFuZCBib3JkZXIgdW5sZXNzIGl0J3MgYWxyZWFkeSBpbmNsdWRpbmcgaXRcbiAgICAgICggaXNCb3JkZXJCb3hTaXplT3V0ZXIgPyAwIDogcGFkZGluZ1dpZHRoICsgYm9yZGVyV2lkdGggKTtcbiAgfVxuXG4gIHZhciBzdHlsZUhlaWdodCA9IGdldFN0eWxlU2l6ZSggc3R5bGUuaGVpZ2h0ICk7XG4gIGlmICggc3R5bGVIZWlnaHQgIT09IGZhbHNlICkge1xuICAgIHNpemUuaGVpZ2h0ID0gc3R5bGVIZWlnaHQgK1xuICAgICAgLy8gYWRkIHBhZGRpbmcgYW5kIGJvcmRlciB1bmxlc3MgaXQncyBhbHJlYWR5IGluY2x1ZGluZyBpdFxuICAgICAgKCBpc0JvcmRlckJveFNpemVPdXRlciA/IDAgOiBwYWRkaW5nSGVpZ2h0ICsgYm9yZGVySGVpZ2h0ICk7XG4gIH1cblxuICBzaXplLmlubmVyV2lkdGggPSBzaXplLndpZHRoIC0gKCBwYWRkaW5nV2lkdGggKyBib3JkZXJXaWR0aCApO1xuICBzaXplLmlubmVySGVpZ2h0ID0gc2l6ZS5oZWlnaHQgLSAoIHBhZGRpbmdIZWlnaHQgKyBib3JkZXJIZWlnaHQgKTtcblxuICBzaXplLm91dGVyV2lkdGggPSBzaXplLndpZHRoICsgbWFyZ2luV2lkdGg7XG4gIHNpemUub3V0ZXJIZWlnaHQgPSBzaXplLmhlaWdodCArIG1hcmdpbkhlaWdodDtcblxuICByZXR1cm4gc2l6ZTtcbn1cblxucmV0dXJuIGdldFNpemU7XG5cbn0pO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi94cGF0aCcpXG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBET01FeGNlcHRpb24ge1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlLCBuYW1lKSB7XG4gICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZVxuICAgIHRoaXMubmFtZSA9IG5hbWVcbiAgICB0aGlzLnN0YWNrID0gKG5ldyBFcnJvcigpKS5zdGFja1xuICB9XG59XG5cbkRPTUV4Y2VwdGlvbi5wcm90b3R5cGUgPSBuZXcgRXJyb3IoKVxuXG5ET01FeGNlcHRpb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gYCR7dGhpcy5uYW1lfTogJHt0aGlzLm1lc3NhZ2V9YFxufVxuIiwiaW1wb3J0IGdldERvY3VtZW50IGZyb20gJ2dldC1kb2N1bWVudCdcblxuaW1wb3J0IERPTUV4Y2VwdGlvbiBmcm9tICcuL2RvbS1leGNlcHRpb24nXG5cbi8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvWFBhdGhSZXN1bHRcbmNvbnN0IEZJUlNUX09SREVSRURfTk9ERV9UWVBFID0gOVxuXG4vLyBEZWZhdWx0IG5hbWVzcGFjZSBmb3IgWEhUTUwgZG9jdW1lbnRzXG5jb25zdCBIVE1MX05BTUVTUEFDRSA9ICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJ1xuXG5cbi8qKlxuICogQ29tcHV0ZSBhbiBYUGF0aCBleHByZXNzaW9uIGZvciB0aGUgZ2l2ZW4gbm9kZS5cbiAqXG4gKiBJZiB0aGUgb3B0aW9uYWwgcGFyYW1ldGVyIGByb290YCBpcyBzdXBwbGllZCwgdGhlIGNvbXB1dGVkIFhQYXRoIGV4cHJlc3Npb25cbiAqIHdpbGwgYmUgcmVsYXRpdmUgdG8gaXQuIE90aGVyd2lzZSwgdGhlIHJvb3QgZWxlbWVudCBpcyB0aGUgcm9vdCBvZiB0aGVcbiAqIGRvY3VtZW50IHRvIHdoaWNoIGBub2RlYCBiZWxvbmdzLlxuICpcbiAqIEBwYXJhbSB7Tm9kZX0gbm9kZSBUaGUgbm9kZSBmb3Igd2hpY2ggdG8gY29tcHV0ZSBhbiBYUGF0aCBleHByZXNzaW9uLlxuICogQHBhcmFtIHtOb2RlfSBbcm9vdF0gVGhlIHJvb3QgY29udGV4dCBmb3IgdGhlIFhQYXRoIGV4cHJlc3Npb24uXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbU5vZGUobm9kZSwgcm9vdCA9IG51bGwpIHtcbiAgaWYgKG5vZGUgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFcnJvcignbWlzc2luZyByZXF1aXJlZCBwYXJhbWV0ZXIgXCJub2RlXCInKVxuICB9XG5cbiAgcm9vdCA9IHJvb3QgfHwgZ2V0RG9jdW1lbnQobm9kZSlcblxuICBsZXQgcGF0aCA9ICcvJ1xuICB3aGlsZSAobm9kZSAhPT0gcm9vdCkge1xuICAgIGlmICghbm9kZSkge1xuICAgICAgbGV0IG1lc3NhZ2UgPSAnVGhlIHN1cHBsaWVkIG5vZGUgaXMgbm90IGNvbnRhaW5lZCBieSB0aGUgcm9vdCBub2RlLidcbiAgICAgIGxldCBuYW1lID0gJ0ludmFsaWROb2RlVHlwZUVycm9yJ1xuICAgICAgdGhyb3cgbmV3IERPTUV4Y2VwdGlvbihtZXNzYWdlLCBuYW1lKVxuICAgIH1cbiAgICBwYXRoID0gYC8ke25vZGVOYW1lKG5vZGUpfVske25vZGVQb3NpdGlvbihub2RlKX1dJHtwYXRofWBcbiAgICBub2RlID0gbm9kZS5wYXJlbnROb2RlXG4gIH1cbiAgcmV0dXJuIHBhdGgucmVwbGFjZSgvXFwvJC8sICcnKVxufVxuXG5cbi8qKlxuICogRmluZCBhIG5vZGUgdXNpbmcgYW4gWFBhdGggcmVsYXRpdmUgdG8gdGhlIGdpdmVuIHJvb3Qgbm9kZS5cbiAqXG4gKiBUaGUgWFBhdGggZXhwcmVzc2lvbnMgYXJlIGV2YWx1YXRlZCByZWxhdGl2ZSB0byB0aGUgTm9kZSBhcmd1bWVudCBgcm9vdGAuXG4gKlxuICogSWYgdGhlIG9wdGlvbmFsIHBhcmFtZXRlciBgcmVzb2x2ZXJgIGlzIHN1cHBsaWVkLCBpdCB3aWxsIGJlIHVzZWQgdG8gcmVzb2x2ZVxuICogYW55IG5hbWVzcGFjZXMgd2l0aGluIHRoZSBYUGF0aC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aCBBbiBYUGF0aCBTdHJpbmcgdG8gZXZhbHVhdGUuXG4gKiBAcGFyYW0ge05vZGV9IHJvb3QgVGhlIHJvb3QgY29udGV4dCBmb3IgdGhlIFhQYXRoIGV4cHJlc3Npb24uXG4gKiBAcmV0dXJucyB7Tm9kZXxudWxsfSBUaGUgZmlyc3QgbWF0Y2hpbmcgTm9kZSBvciBudWxsIGlmIG5vbmUgaXMgZm91bmQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b05vZGUocGF0aCwgcm9vdCwgcmVzb2x2ZXIgPSBudWxsKSB7XG4gIGlmIChwYXRoID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ21pc3NpbmcgcmVxdWlyZWQgcGFyYW1ldGVyIFwicGF0aFwiJylcbiAgfVxuICBpZiAocm9vdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdtaXNzaW5nIHJlcXVpcmVkIHBhcmFtZXRlciBcInJvb3RcIicpXG4gIH1cblxuICAvLyBNYWtlIHRoZSBwYXRoIHJlbGF0aXZlIHRvIHRoZSByb290LCBpZiBub3QgdGhlIGRvY3VtZW50LlxuICBsZXQgZG9jdW1lbnQgPSBnZXREb2N1bWVudChyb290KVxuICBpZiAocm9vdCAhPT0gZG9jdW1lbnQpIHBhdGggPSBwYXRoLnJlcGxhY2UoL15cXC8vLCAnLi8nKVxuXG4gIC8vIE1ha2UgYSBkZWZhdWx0IHJlc29sdmVyLlxuICBsZXQgZG9jdW1lbnRFbGVtZW50ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XG4gIGlmIChyZXNvbHZlciA9PT0gbnVsbCAmJiBkb2N1bWVudEVsZW1lbnQubG9va3VwTmFtZXNwYWNlVVJJKSB7XG4gICAgbGV0IGRlZmF1bHROUyA9IGRvY3VtZW50RWxlbWVudC5sb29rdXBOYW1lc3BhY2VVUkkobnVsbCkgfHwgSFRNTF9OQU1FU1BBQ0VcbiAgICByZXNvbHZlciA9IChwcmVmaXgpID0+IHtcbiAgICAgIGxldCBucyA9IHsnX2RlZmF1bHRfJzogZGVmYXVsdE5TfVxuICAgICAgcmV0dXJuIG5zW3ByZWZpeF0gfHwgZG9jdW1lbnRFbGVtZW50Lmxvb2t1cE5hbWVzcGFjZVVSSShwcmVmaXgpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc29sdmUocGF0aCwgcm9vdCwgcmVzb2x2ZXIpXG59XG5cblxuLy8gR2V0IHRoZSBYUGF0aCBub2RlIG5hbWUuXG5mdW5jdGlvbiBub2RlTmFtZShub2RlKSB7XG4gIHN3aXRjaCAobm9kZS5ub2RlTmFtZSkge1xuICBjYXNlICcjdGV4dCc6IHJldHVybiAndGV4dCgpJ1xuICBjYXNlICcjY29tbWVudCc6IHJldHVybiAnY29tbWVudCgpJ1xuICBjYXNlICcjY2RhdGEtc2VjdGlvbic6IHJldHVybiAnY2RhdGEtc2VjdGlvbigpJ1xuICBkZWZhdWx0OiByZXR1cm4gbm9kZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpXG4gIH1cbn1cblxuXG4vLyBHZXQgdGhlIG9yZGluYWwgcG9zaXRpb24gb2YgdGhpcyBub2RlIGFtb25nIGl0cyBzaWJsaW5ncyBvZiB0aGUgc2FtZSBuYW1lLlxuZnVuY3Rpb24gbm9kZVBvc2l0aW9uKG5vZGUpIHtcbiAgbGV0IG5hbWUgPSBub2RlLm5vZGVOYW1lXG4gIGxldCBwb3NpdGlvbiA9IDFcbiAgd2hpbGUgKChub2RlID0gbm9kZS5wcmV2aW91c1NpYmxpbmcpKSB7XG4gICAgaWYgKG5vZGUubm9kZU5hbWUgPT09IG5hbWUpIHBvc2l0aW9uICs9IDFcbiAgfVxuICByZXR1cm4gcG9zaXRpb25cbn1cblxuXG4vLyBGaW5kIGEgc2luZ2xlIG5vZGUgd2l0aCBYUGF0aCBgcGF0aGBcbmZ1bmN0aW9uIHJlc29sdmUocGF0aCwgcm9vdCwgcmVzb2x2ZXIpIHtcbiAgdHJ5IHtcbiAgICAvLyBBZGQgYSBkZWZhdWx0IHZhbHVlIHRvIGVhY2ggcGF0aCBwYXJ0IGxhY2tpbmcgYSBwcmVmaXguXG4gICAgbGV0IG5zcGF0aCA9IHBhdGgucmVwbGFjZSgvXFwvKD8hXFwuKShbXlxcLzpcXChdKykoPz1cXC98JCkvZywgJy9fZGVmYXVsdF86JDEnKVxuICAgIHJldHVybiBwbGF0Zm9ybVJlc29sdmUobnNwYXRoLCByb290LCByZXNvbHZlcilcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIGZhbGxiYWNrUmVzb2x2ZShwYXRoLCByb290KVxuICB9XG59XG5cblxuLy8gRmluZCBhIHNpbmdsZSBub2RlIHdpdGggWFBhdGggYHBhdGhgIHVzaW5nIHRoZSBzaW1wbGUsIGJ1aWx0LWluIGV2YWx1YXRvci5cbmZ1bmN0aW9uIGZhbGxiYWNrUmVzb2x2ZShwYXRoLCByb290KSB7XG4gIGxldCBzdGVwcyA9IHBhdGguc3BsaXQoXCIvXCIpXG4gIGxldCBub2RlID0gcm9vdFxuICB3aGlsZSAobm9kZSkge1xuICAgIGxldCBzdGVwID0gc3RlcHMuc2hpZnQoKVxuICAgIGlmIChzdGVwID09PSB1bmRlZmluZWQpIGJyZWFrXG4gICAgaWYgKHN0ZXAgPT09ICcuJykgY29udGludWVcbiAgICBsZXQgW25hbWUsIHBvc2l0aW9uXSA9IHN0ZXAuc3BsaXQoL1tcXFtcXF1dLylcbiAgICBuYW1lID0gbmFtZS5yZXBsYWNlKCdfZGVmYXVsdF86JywgJycpXG4gICAgcG9zaXRpb24gPSBwb3NpdGlvbiA/IHBhcnNlSW50KHBvc2l0aW9uKSA6IDFcbiAgICBub2RlID0gZmluZENoaWxkKG5vZGUsIG5hbWUsIHBvc2l0aW9uKVxuICB9XG4gIHJldHVybiBub2RlXG59XG5cblxuLy8gRmluZCBhIHNpbmdsZSBub2RlIHdpdGggWFBhdGggYHBhdGhgIHVzaW5nIGBkb2N1bWVudC5ldmFsdWF0ZWAuXG5mdW5jdGlvbiBwbGF0Zm9ybVJlc29sdmUocGF0aCwgcm9vdCwgcmVzb2x2ZXIpIHtcbiAgbGV0IGRvY3VtZW50ID0gZ2V0RG9jdW1lbnQocm9vdClcbiAgbGV0IHIgPSBkb2N1bWVudC5ldmFsdWF0ZShwYXRoLCByb290LCByZXNvbHZlciwgRklSU1RfT1JERVJFRF9OT0RFX1RZUEUsIG51bGwpXG4gIHJldHVybiByLnNpbmdsZU5vZGVWYWx1ZVxufVxuXG5cbi8vIEZpbmQgdGhlIGNoaWxkIG9mIHRoZSBnaXZlbiBub2RlIGJ5IG5hbWUgYW5kIG9yZGluYWwgcG9zaXRpb24uXG5mdW5jdGlvbiBmaW5kQ2hpbGQobm9kZSwgbmFtZSwgcG9zaXRpb24pIHtcbiAgZm9yIChub2RlID0gbm9kZS5maXJzdENoaWxkIDsgbm9kZSA7IG5vZGUgPSBub2RlLm5leHRTaWJsaW5nKSB7XG4gICAgaWYgKG5vZGVOYW1lKG5vZGUpID09PSBuYW1lICYmIC0tcG9zaXRpb24gPT09IDApIGJyZWFrXG4gIH1cbiAgcmV0dXJuIG5vZGVcbn1cbiIsIi8qIVxuICogVW5pZHJhZ2dlciB2Mi4xLjBcbiAqIERyYWdnYWJsZSBiYXNlIGNsYXNzXG4gKiBNSVQgbGljZW5zZVxuICovXG5cbi8qanNoaW50IGJyb3dzZXI6IHRydWUsIHVudXNlZDogdHJ1ZSwgdW5kZWY6IHRydWUsIHN0cmljdDogdHJ1ZSAqL1xuXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICAvKmpzaGludCBzdHJpY3Q6IGZhbHNlICovIC8qZ2xvYmFscyBkZWZpbmUsIG1vZHVsZSwgcmVxdWlyZSAqL1xuXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EXG4gICAgZGVmaW5lKCBbXG4gICAgICAndW5pcG9pbnRlci91bmlwb2ludGVyJ1xuICAgIF0sIGZ1bmN0aW9uKCBVbmlwb2ludGVyICkge1xuICAgICAgcmV0dXJuIGZhY3RvcnkoIHdpbmRvdywgVW5pcG9pbnRlciApO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgcmVxdWlyZSgndW5pcG9pbnRlcicpXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHdpbmRvdy5VbmlkcmFnZ2VyID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHdpbmRvdy5Vbmlwb2ludGVyXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgVW5pcG9pbnRlciApIHtcblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyAtLS0tLSAgLS0tLS0gLy9cblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFVuaWRyYWdnZXIgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuZnVuY3Rpb24gVW5pZHJhZ2dlcigpIHt9XG5cbi8vIGluaGVyaXQgVW5pcG9pbnRlciAmIEV2RW1pdHRlclxudmFyIHByb3RvID0gVW5pZHJhZ2dlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBVbmlwb2ludGVyLnByb3RvdHlwZSApO1xuXG4vLyAtLS0tLSBiaW5kIHN0YXJ0IC0tLS0tIC8vXG5cbnByb3RvLmJpbmRIYW5kbGVzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2JpbmRIYW5kbGVzKCB0cnVlICk7XG59O1xuXG5wcm90by51bmJpbmRIYW5kbGVzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2JpbmRIYW5kbGVzKCBmYWxzZSApO1xufTtcblxudmFyIG5hdmlnYXRvciA9IHdpbmRvdy5uYXZpZ2F0b3I7XG4vKipcbiAqIHdvcmtzIGFzIHVuYmluZGVyLCBhcyB5b3UgY2FuIC5iaW5kSGFuZGxlcyggZmFsc2UgKSB0byB1bmJpbmRcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNCaW5kIC0gd2lsbCB1bmJpbmQgaWYgZmFsc2V5XG4gKi9cbnByb3RvLl9iaW5kSGFuZGxlcyA9IGZ1bmN0aW9uKCBpc0JpbmQgKSB7XG4gIC8vIG11bmdlIGlzQmluZCwgZGVmYXVsdCB0byB0cnVlXG4gIGlzQmluZCA9IGlzQmluZCA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6ICEhaXNCaW5kO1xuICAvLyBleHRyYSBiaW5kIGxvZ2ljXG4gIHZhciBiaW5kZXJFeHRyYTtcbiAgaWYgKCBuYXZpZ2F0b3IucG9pbnRlckVuYWJsZWQgKSB7XG4gICAgYmluZGVyRXh0cmEgPSBmdW5jdGlvbiggaGFuZGxlICkge1xuICAgICAgLy8gZGlzYWJsZSBzY3JvbGxpbmcgb24gdGhlIGVsZW1lbnRcbiAgICAgIGhhbmRsZS5zdHlsZS50b3VjaEFjdGlvbiA9IGlzQmluZCA/ICdub25lJyA6ICcnO1xuICAgIH07XG4gIH0gZWxzZSBpZiAoIG5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkICkge1xuICAgIGJpbmRlckV4dHJhID0gZnVuY3Rpb24oIGhhbmRsZSApIHtcbiAgICAgIC8vIGRpc2FibGUgc2Nyb2xsaW5nIG9uIHRoZSBlbGVtZW50XG4gICAgICBoYW5kbGUuc3R5bGUubXNUb3VjaEFjdGlvbiA9IGlzQmluZCA/ICdub25lJyA6ICcnO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgYmluZGVyRXh0cmEgPSBub29wO1xuICB9XG4gIC8vIGJpbmQgZWFjaCBoYW5kbGVcbiAgdmFyIGJpbmRNZXRob2QgPSBpc0JpbmQgPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gIGZvciAoIHZhciBpPTA7IGkgPCB0aGlzLmhhbmRsZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIGhhbmRsZSA9IHRoaXMuaGFuZGxlc1tpXTtcbiAgICB0aGlzLl9iaW5kU3RhcnRFdmVudCggaGFuZGxlLCBpc0JpbmQgKTtcbiAgICBiaW5kZXJFeHRyYSggaGFuZGxlICk7XG4gICAgaGFuZGxlWyBiaW5kTWV0aG9kIF0oICdjbGljaycsIHRoaXMgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0gc3RhcnQgZXZlbnQgLS0tLS0gLy9cblxuLyoqXG4gKiBwb2ludGVyIHN0YXJ0XG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICogQHBhcmFtIHtFdmVudCBvciBUb3VjaH0gcG9pbnRlclxuICovXG5wcm90by5wb2ludGVyRG93biA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgLy8gZGlzbWlzcyByYW5nZSBzbGlkZXJzXG4gIGlmICggZXZlbnQudGFyZ2V0Lm5vZGVOYW1lID09ICdJTlBVVCcgJiYgZXZlbnQudGFyZ2V0LnR5cGUgPT0gJ3JhbmdlJyApIHtcbiAgICAvLyByZXNldCBwb2ludGVyRG93biBsb2dpY1xuICAgIHRoaXMuaXNQb2ludGVyRG93biA9IGZhbHNlO1xuICAgIGRlbGV0ZSB0aGlzLnBvaW50ZXJJZGVudGlmaWVyO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMuX2RyYWdQb2ludGVyRG93biggZXZlbnQsIHBvaW50ZXIgKTtcbiAgLy8ga2x1ZGdlIHRvIGJsdXIgZm9jdXNlZCBpbnB1dHMgaW4gZHJhZ2dlclxuICB2YXIgZm9jdXNlZCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gIGlmICggZm9jdXNlZCAmJiBmb2N1c2VkLmJsdXIgKSB7XG4gICAgZm9jdXNlZC5ibHVyKCk7XG4gIH1cbiAgLy8gYmluZCBtb3ZlIGFuZCBlbmQgZXZlbnRzXG4gIHRoaXMuX2JpbmRQb3N0U3RhcnRFdmVudHMoIGV2ZW50ICk7XG4gIHRoaXMuZW1pdEV2ZW50KCAncG9pbnRlckRvd24nLCBbIGV2ZW50LCBwb2ludGVyIF0gKTtcbn07XG5cbi8vIGJhc2UgcG9pbnRlciBkb3duIGxvZ2ljXG5wcm90by5fZHJhZ1BvaW50ZXJEb3duID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICAvLyB0cmFjayB0byBzZWUgd2hlbiBkcmFnZ2luZyBzdGFydHNcbiAgdGhpcy5wb2ludGVyRG93blBvaW50ID0gVW5pcG9pbnRlci5nZXRQb2ludGVyUG9pbnQoIHBvaW50ZXIgKTtcblxuICB2YXIgY2FuUHJldmVudERlZmF1bHQgPSB0aGlzLmNhblByZXZlbnREZWZhdWx0T25Qb2ludGVyRG93biggZXZlbnQsIHBvaW50ZXIgKTtcbiAgaWYgKCBjYW5QcmV2ZW50RGVmYXVsdCApIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB9XG59O1xuXG4vLyBvdmVyd3JpdGVhYmxlIG1ldGhvZCBzbyBGbGlja2l0eSBjYW4gcHJldmVudCBmb3Igc2Nyb2xsaW5nXG5wcm90by5jYW5QcmV2ZW50RGVmYXVsdE9uUG9pbnRlckRvd24gPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIC8vIHByZXZlbnQgZGVmYXVsdCwgdW5sZXNzIHRvdWNoc3RhcnQgb3IgPHNlbGVjdD5cbiAgcmV0dXJuIGV2ZW50LnRhcmdldC5ub2RlTmFtZSAhPSAnU0VMRUNUJztcbn07XG5cbi8vIC0tLS0tIG1vdmUgZXZlbnQgLS0tLS0gLy9cblxuLyoqXG4gKiBkcmFnIG1vdmVcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50IG9yIFRvdWNofSBwb2ludGVyXG4gKi9cbnByb3RvLnBvaW50ZXJNb3ZlID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB2YXIgbW92ZVZlY3RvciA9IHRoaXMuX2RyYWdQb2ludGVyTW92ZSggZXZlbnQsIHBvaW50ZXIgKTtcbiAgdGhpcy5lbWl0RXZlbnQoICdwb2ludGVyTW92ZScsIFsgZXZlbnQsIHBvaW50ZXIsIG1vdmVWZWN0b3IgXSApO1xuICB0aGlzLl9kcmFnTW92ZSggZXZlbnQsIHBvaW50ZXIsIG1vdmVWZWN0b3IgKTtcbn07XG5cbi8vIGJhc2UgcG9pbnRlciBtb3ZlIGxvZ2ljXG5wcm90by5fZHJhZ1BvaW50ZXJNb3ZlID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB2YXIgbW92ZVBvaW50ID0gVW5pcG9pbnRlci5nZXRQb2ludGVyUG9pbnQoIHBvaW50ZXIgKTtcbiAgdmFyIG1vdmVWZWN0b3IgPSB7XG4gICAgeDogbW92ZVBvaW50LnggLSB0aGlzLnBvaW50ZXJEb3duUG9pbnQueCxcbiAgICB5OiBtb3ZlUG9pbnQueSAtIHRoaXMucG9pbnRlckRvd25Qb2ludC55XG4gIH07XG4gIC8vIHN0YXJ0IGRyYWcgaWYgcG9pbnRlciBoYXMgbW92ZWQgZmFyIGVub3VnaCB0byBzdGFydCBkcmFnXG4gIGlmICggIXRoaXMuaXNEcmFnZ2luZyAmJiB0aGlzLmhhc0RyYWdTdGFydGVkKCBtb3ZlVmVjdG9yICkgKSB7XG4gICAgdGhpcy5fZHJhZ1N0YXJ0KCBldmVudCwgcG9pbnRlciApO1xuICB9XG4gIHJldHVybiBtb3ZlVmVjdG9yO1xufTtcblxuLy8gY29uZGl0aW9uIGlmIHBvaW50ZXIgaGFzIG1vdmVkIGZhciBlbm91Z2ggdG8gc3RhcnQgZHJhZ1xucHJvdG8uaGFzRHJhZ1N0YXJ0ZWQgPSBmdW5jdGlvbiggbW92ZVZlY3RvciApIHtcbiAgcmV0dXJuIE1hdGguYWJzKCBtb3ZlVmVjdG9yLnggKSA+IDMgfHwgTWF0aC5hYnMoIG1vdmVWZWN0b3IueSApID4gMztcbn07XG5cblxuLy8gLS0tLS0gZW5kIGV2ZW50IC0tLS0tIC8vXG5cbi8qKlxuICogcG9pbnRlciB1cFxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgb3IgVG91Y2h9IHBvaW50ZXJcbiAqL1xucHJvdG8ucG9pbnRlclVwID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLmVtaXRFdmVudCggJ3BvaW50ZXJVcCcsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xuICB0aGlzLl9kcmFnUG9pbnRlclVwKCBldmVudCwgcG9pbnRlciApO1xufTtcblxucHJvdG8uX2RyYWdQb2ludGVyVXAgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIGlmICggdGhpcy5pc0RyYWdnaW5nICkge1xuICAgIHRoaXMuX2RyYWdFbmQoIGV2ZW50LCBwb2ludGVyICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gcG9pbnRlciBkaWRuJ3QgbW92ZSBlbm91Z2ggZm9yIGRyYWcgdG8gc3RhcnRcbiAgICB0aGlzLl9zdGF0aWNDbGljayggZXZlbnQsIHBvaW50ZXIgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gZHJhZyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vLyBkcmFnU3RhcnRcbnByb3RvLl9kcmFnU3RhcnQgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMuaXNEcmFnZ2luZyA9IHRydWU7XG4gIHRoaXMuZHJhZ1N0YXJ0UG9pbnQgPSBVbmlwb2ludGVyLmdldFBvaW50ZXJQb2ludCggcG9pbnRlciApO1xuICAvLyBwcmV2ZW50IGNsaWNrc1xuICB0aGlzLmlzUHJldmVudGluZ0NsaWNrcyA9IHRydWU7XG5cbiAgdGhpcy5kcmFnU3RhcnQoIGV2ZW50LCBwb2ludGVyICk7XG59O1xuXG5wcm90by5kcmFnU3RhcnQgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMuZW1pdEV2ZW50KCAnZHJhZ1N0YXJ0JywgWyBldmVudCwgcG9pbnRlciBdICk7XG59O1xuXG4vLyBkcmFnTW92ZVxucHJvdG8uX2RyYWdNb3ZlID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyLCBtb3ZlVmVjdG9yICkge1xuICAvLyBkbyBub3QgZHJhZyBpZiBub3QgZHJhZ2dpbmcgeWV0XG4gIGlmICggIXRoaXMuaXNEcmFnZ2luZyApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLmRyYWdNb3ZlKCBldmVudCwgcG9pbnRlciwgbW92ZVZlY3RvciApO1xufTtcblxucHJvdG8uZHJhZ01vdmUgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIsIG1vdmVWZWN0b3IgKSB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIHRoaXMuZW1pdEV2ZW50KCAnZHJhZ01vdmUnLCBbIGV2ZW50LCBwb2ludGVyLCBtb3ZlVmVjdG9yIF0gKTtcbn07XG5cbi8vIGRyYWdFbmRcbnByb3RvLl9kcmFnRW5kID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICAvLyBzZXQgZmxhZ3NcbiAgdGhpcy5pc0RyYWdnaW5nID0gZmFsc2U7XG4gIC8vIHJlLWVuYWJsZSBjbGlja2luZyBhc3luY1xuICBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcbiAgICBkZWxldGUgdGhpcy5pc1ByZXZlbnRpbmdDbGlja3M7XG4gIH0uYmluZCggdGhpcyApICk7XG5cbiAgdGhpcy5kcmFnRW5kKCBldmVudCwgcG9pbnRlciApO1xufTtcblxucHJvdG8uZHJhZ0VuZCA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5lbWl0RXZlbnQoICdkcmFnRW5kJywgWyBldmVudCwgcG9pbnRlciBdICk7XG59O1xuXG4vLyAtLS0tLSBvbmNsaWNrIC0tLS0tIC8vXG5cbi8vIGhhbmRsZSBhbGwgY2xpY2tzIGFuZCBwcmV2ZW50IGNsaWNrcyB3aGVuIGRyYWdnaW5nXG5wcm90by5vbmNsaWNrID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICBpZiAoIHRoaXMuaXNQcmV2ZW50aW5nQ2xpY2tzICkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH1cbn07XG5cbi8vIC0tLS0tIHN0YXRpY0NsaWNrIC0tLS0tIC8vXG5cbi8vIHRyaWdnZXJlZCBhZnRlciBwb2ludGVyIGRvd24gJiB1cCB3aXRoIG5vL3RpbnkgbW92ZW1lbnRcbnByb3RvLl9zdGF0aWNDbGljayA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgLy8gaWdub3JlIGVtdWxhdGVkIG1vdXNlIHVwIGNsaWNrc1xuICBpZiAoIHRoaXMuaXNJZ25vcmluZ01vdXNlVXAgJiYgZXZlbnQudHlwZSA9PSAnbW91c2V1cCcgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gYWxsb3cgY2xpY2sgaW4gPGlucHV0PnMgYW5kIDx0ZXh0YXJlYT5zXG4gIHZhciBub2RlTmFtZSA9IGV2ZW50LnRhcmdldC5ub2RlTmFtZTtcbiAgaWYgKCBub2RlTmFtZSA9PSAnSU5QVVQnIHx8IG5vZGVOYW1lID09ICdURVhUQVJFQScgKSB7XG4gICAgZXZlbnQudGFyZ2V0LmZvY3VzKCk7XG4gIH1cbiAgdGhpcy5zdGF0aWNDbGljayggZXZlbnQsIHBvaW50ZXIgKTtcblxuICAvLyBzZXQgZmxhZyBmb3IgZW11bGF0ZWQgY2xpY2tzIDMwMG1zIGFmdGVyIHRvdWNoZW5kXG4gIGlmICggZXZlbnQudHlwZSAhPSAnbW91c2V1cCcgKSB7XG4gICAgdGhpcy5pc0lnbm9yaW5nTW91c2VVcCA9IHRydWU7XG4gICAgLy8gcmVzZXQgZmxhZyBhZnRlciAzMDBtc1xuICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuICAgICAgZGVsZXRlIHRoaXMuaXNJZ25vcmluZ01vdXNlVXA7XG4gICAgfS5iaW5kKCB0aGlzICksIDQwMCApO1xuICB9XG59O1xuXG5wcm90by5zdGF0aWNDbGljayA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5lbWl0RXZlbnQoICdzdGF0aWNDbGljaycsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xufTtcblxuLy8gLS0tLS0gdXRpbHMgLS0tLS0gLy9cblxuVW5pZHJhZ2dlci5nZXRQb2ludGVyUG9pbnQgPSBVbmlwb2ludGVyLmdldFBvaW50ZXJQb2ludDtcblxuLy8gLS0tLS0gIC0tLS0tIC8vXG5cbnJldHVybiBVbmlkcmFnZ2VyO1xuXG59KSk7XG4iLCIvKiFcbiAqIFVuaXBvaW50ZXIgdjIuMS4wXG4gKiBiYXNlIGNsYXNzIGZvciBkb2luZyBvbmUgdGhpbmcgd2l0aCBwb2ludGVyIGV2ZW50XG4gKiBNSVQgbGljZW5zZVxuICovXG5cbi8qanNoaW50IGJyb3dzZXI6IHRydWUsIHVuZGVmOiB0cnVlLCB1bnVzZWQ6IHRydWUsIHN0cmljdDogdHJ1ZSAqL1xuXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICAvKiBqc2hpbnQgc3RyaWN0OiBmYWxzZSAqLyAvKmdsb2JhbCBkZWZpbmUsIG1vZHVsZSwgcmVxdWlyZSAqL1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggW1xuICAgICAgJ2V2LWVtaXR0ZXIvZXYtZW1pdHRlcidcbiAgICBdLCBmdW5jdGlvbiggRXZFbWl0dGVyICkge1xuICAgICAgcmV0dXJuIGZhY3RvcnkoIHdpbmRvdywgRXZFbWl0dGVyICk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICByZXF1aXJlKCdldi1lbWl0dGVyJylcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgd2luZG93LlVuaXBvaW50ZXIgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgd2luZG93LkV2RW1pdHRlclxuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIEV2RW1pdHRlciApIHtcblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxuZnVuY3Rpb24gVW5pcG9pbnRlcigpIHt9XG5cbi8vIGluaGVyaXQgRXZFbWl0dGVyXG52YXIgcHJvdG8gPSBVbmlwb2ludGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV2RW1pdHRlci5wcm90b3R5cGUgKTtcblxucHJvdG8uYmluZFN0YXJ0RXZlbnQgPSBmdW5jdGlvbiggZWxlbSApIHtcbiAgdGhpcy5fYmluZFN0YXJ0RXZlbnQoIGVsZW0sIHRydWUgKTtcbn07XG5cbnByb3RvLnVuYmluZFN0YXJ0RXZlbnQgPSBmdW5jdGlvbiggZWxlbSApIHtcbiAgdGhpcy5fYmluZFN0YXJ0RXZlbnQoIGVsZW0sIGZhbHNlICk7XG59O1xuXG4vKipcbiAqIHdvcmtzIGFzIHVuYmluZGVyLCBhcyB5b3UgY2FuIC5fYmluZFN0YXJ0KCBmYWxzZSApIHRvIHVuYmluZFxuICogQHBhcmFtIHtCb29sZWFufSBpc0JpbmQgLSB3aWxsIHVuYmluZCBpZiBmYWxzZXlcbiAqL1xucHJvdG8uX2JpbmRTdGFydEV2ZW50ID0gZnVuY3Rpb24oIGVsZW0sIGlzQmluZCApIHtcbiAgLy8gbXVuZ2UgaXNCaW5kLCBkZWZhdWx0IHRvIHRydWVcbiAgaXNCaW5kID0gaXNCaW5kID09PSB1bmRlZmluZWQgPyB0cnVlIDogISFpc0JpbmQ7XG4gIHZhciBiaW5kTWV0aG9kID0gaXNCaW5kID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuXG4gIGlmICggd2luZG93Lm5hdmlnYXRvci5wb2ludGVyRW5hYmxlZCApIHtcbiAgICAvLyBXM0MgUG9pbnRlciBFdmVudHMsIElFMTEuIFNlZSBodHRwczovL2NvZGVyd2FsbC5jb20vcC9tZnJlY2FcbiAgICBlbGVtWyBiaW5kTWV0aG9kIF0oICdwb2ludGVyZG93bicsIHRoaXMgKTtcbiAgfSBlbHNlIGlmICggd2luZG93Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkICkge1xuICAgIC8vIElFMTAgUG9pbnRlciBFdmVudHNcbiAgICBlbGVtWyBiaW5kTWV0aG9kIF0oICdNU1BvaW50ZXJEb3duJywgdGhpcyApO1xuICB9IGVsc2Uge1xuICAgIC8vIGxpc3RlbiBmb3IgYm90aCwgZm9yIGRldmljZXMgbGlrZSBDaHJvbWUgUGl4ZWxcbiAgICBlbGVtWyBiaW5kTWV0aG9kIF0oICdtb3VzZWRvd24nLCB0aGlzICk7XG4gICAgZWxlbVsgYmluZE1ldGhvZCBdKCAndG91Y2hzdGFydCcsIHRoaXMgKTtcbiAgfVxufTtcblxuLy8gdHJpZ2dlciBoYW5kbGVyIG1ldGhvZHMgZm9yIGV2ZW50c1xucHJvdG8uaGFuZGxlRXZlbnQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHZhciBtZXRob2QgPSAnb24nICsgZXZlbnQudHlwZTtcbiAgaWYgKCB0aGlzWyBtZXRob2QgXSApIHtcbiAgICB0aGlzWyBtZXRob2QgXSggZXZlbnQgKTtcbiAgfVxufTtcblxuLy8gcmV0dXJucyB0aGUgdG91Y2ggdGhhdCB3ZSdyZSBrZWVwaW5nIHRyYWNrIG9mXG5wcm90by5nZXRUb3VjaCA9IGZ1bmN0aW9uKCB0b3VjaGVzICkge1xuICBmb3IgKCB2YXIgaT0wOyBpIDwgdG91Y2hlcy5sZW5ndGg7IGkrKyApIHtcbiAgICB2YXIgdG91Y2ggPSB0b3VjaGVzW2ldO1xuICAgIGlmICggdG91Y2guaWRlbnRpZmllciA9PSB0aGlzLnBvaW50ZXJJZGVudGlmaWVyICkge1xuICAgICAgcmV0dXJuIHRvdWNoO1xuICAgIH1cbiAgfVxufTtcblxuLy8gLS0tLS0gc3RhcnQgZXZlbnQgLS0tLS0gLy9cblxucHJvdG8ub25tb3VzZWRvd24gPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIC8vIGRpc21pc3MgY2xpY2tzIGZyb20gcmlnaHQgb3IgbWlkZGxlIGJ1dHRvbnNcbiAgdmFyIGJ1dHRvbiA9IGV2ZW50LmJ1dHRvbjtcbiAgaWYgKCBidXR0b24gJiYgKCBidXR0b24gIT09IDAgJiYgYnV0dG9uICE9PSAxICkgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMuX3BvaW50ZXJEb3duKCBldmVudCwgZXZlbnQgKTtcbn07XG5cbnByb3RvLm9udG91Y2hzdGFydCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdGhpcy5fcG9pbnRlckRvd24oIGV2ZW50LCBldmVudC5jaGFuZ2VkVG91Y2hlc1swXSApO1xufTtcblxucHJvdG8ub25NU1BvaW50ZXJEb3duID1cbnByb3RvLm9ucG9pbnRlcmRvd24gPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHRoaXMuX3BvaW50ZXJEb3duKCBldmVudCwgZXZlbnQgKTtcbn07XG5cbi8qKlxuICogcG9pbnRlciBzdGFydFxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgb3IgVG91Y2h9IHBvaW50ZXJcbiAqL1xucHJvdG8uX3BvaW50ZXJEb3duID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICAvLyBkaXNtaXNzIG90aGVyIHBvaW50ZXJzXG4gIGlmICggdGhpcy5pc1BvaW50ZXJEb3duICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMuaXNQb2ludGVyRG93biA9IHRydWU7XG4gIC8vIHNhdmUgcG9pbnRlciBpZGVudGlmaWVyIHRvIG1hdGNoIHVwIHRvdWNoIGV2ZW50c1xuICB0aGlzLnBvaW50ZXJJZGVudGlmaWVyID0gcG9pbnRlci5wb2ludGVySWQgIT09IHVuZGVmaW5lZCA/XG4gICAgLy8gcG9pbnRlcklkIGZvciBwb2ludGVyIGV2ZW50cywgdG91Y2guaW5kZW50aWZpZXIgZm9yIHRvdWNoIGV2ZW50c1xuICAgIHBvaW50ZXIucG9pbnRlcklkIDogcG9pbnRlci5pZGVudGlmaWVyO1xuXG4gIHRoaXMucG9pbnRlckRvd24oIGV2ZW50LCBwb2ludGVyICk7XG59O1xuXG5wcm90by5wb2ludGVyRG93biA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5fYmluZFBvc3RTdGFydEV2ZW50cyggZXZlbnQgKTtcbiAgdGhpcy5lbWl0RXZlbnQoICdwb2ludGVyRG93bicsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xufTtcblxuLy8gaGFzaCBvZiBldmVudHMgdG8gYmUgYm91bmQgYWZ0ZXIgc3RhcnQgZXZlbnRcbnZhciBwb3N0U3RhcnRFdmVudHMgPSB7XG4gIG1vdXNlZG93bjogWyAnbW91c2Vtb3ZlJywgJ21vdXNldXAnIF0sXG4gIHRvdWNoc3RhcnQ6IFsgJ3RvdWNobW92ZScsICd0b3VjaGVuZCcsICd0b3VjaGNhbmNlbCcgXSxcbiAgcG9pbnRlcmRvd246IFsgJ3BvaW50ZXJtb3ZlJywgJ3BvaW50ZXJ1cCcsICdwb2ludGVyY2FuY2VsJyBdLFxuICBNU1BvaW50ZXJEb3duOiBbICdNU1BvaW50ZXJNb3ZlJywgJ01TUG9pbnRlclVwJywgJ01TUG9pbnRlckNhbmNlbCcgXVxufTtcblxucHJvdG8uX2JpbmRQb3N0U3RhcnRFdmVudHMgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIGlmICggIWV2ZW50ICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBnZXQgcHJvcGVyIGV2ZW50cyB0byBtYXRjaCBzdGFydCBldmVudFxuICB2YXIgZXZlbnRzID0gcG9zdFN0YXJ0RXZlbnRzWyBldmVudC50eXBlIF07XG4gIC8vIGJpbmQgZXZlbnRzIHRvIG5vZGVcbiAgZXZlbnRzLmZvckVhY2goIGZ1bmN0aW9uKCBldmVudE5hbWUgKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoIGV2ZW50TmFtZSwgdGhpcyApO1xuICB9LCB0aGlzICk7XG4gIC8vIHNhdmUgdGhlc2UgYXJndW1lbnRzXG4gIHRoaXMuX2JvdW5kUG9pbnRlckV2ZW50cyA9IGV2ZW50cztcbn07XG5cbnByb3RvLl91bmJpbmRQb3N0U3RhcnRFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgLy8gY2hlY2sgZm9yIF9ib3VuZEV2ZW50cywgaW4gY2FzZSBkcmFnRW5kIHRyaWdnZXJlZCB0d2ljZSAob2xkIElFOCBidWcpXG4gIGlmICggIXRoaXMuX2JvdW5kUG9pbnRlckV2ZW50cyApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5fYm91bmRQb2ludGVyRXZlbnRzLmZvckVhY2goIGZ1bmN0aW9uKCBldmVudE5hbWUgKSB7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoIGV2ZW50TmFtZSwgdGhpcyApO1xuICB9LCB0aGlzICk7XG5cbiAgZGVsZXRlIHRoaXMuX2JvdW5kUG9pbnRlckV2ZW50cztcbn07XG5cbi8vIC0tLS0tIG1vdmUgZXZlbnQgLS0tLS0gLy9cblxucHJvdG8ub25tb3VzZW1vdmUgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHRoaXMuX3BvaW50ZXJNb3ZlKCBldmVudCwgZXZlbnQgKTtcbn07XG5cbnByb3RvLm9uTVNQb2ludGVyTW92ZSA9XG5wcm90by5vbnBvaW50ZXJtb3ZlID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICBpZiAoIGV2ZW50LnBvaW50ZXJJZCA9PSB0aGlzLnBvaW50ZXJJZGVudGlmaWVyICkge1xuICAgIHRoaXMuX3BvaW50ZXJNb3ZlKCBldmVudCwgZXZlbnQgKTtcbiAgfVxufTtcblxucHJvdG8ub250b3VjaG1vdmUgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHZhciB0b3VjaCA9IHRoaXMuZ2V0VG91Y2goIGV2ZW50LmNoYW5nZWRUb3VjaGVzICk7XG4gIGlmICggdG91Y2ggKSB7XG4gICAgdGhpcy5fcG9pbnRlck1vdmUoIGV2ZW50LCB0b3VjaCApO1xuICB9XG59O1xuXG4vKipcbiAqIHBvaW50ZXIgbW92ZVxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgb3IgVG91Y2h9IHBvaW50ZXJcbiAqIEBwcml2YXRlXG4gKi9cbnByb3RvLl9wb2ludGVyTW92ZSA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5wb2ludGVyTW92ZSggZXZlbnQsIHBvaW50ZXIgKTtcbn07XG5cbi8vIHB1YmxpY1xucHJvdG8ucG9pbnRlck1vdmUgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMuZW1pdEV2ZW50KCAncG9pbnRlck1vdmUnLCBbIGV2ZW50LCBwb2ludGVyIF0gKTtcbn07XG5cbi8vIC0tLS0tIGVuZCBldmVudCAtLS0tLSAvL1xuXG5cbnByb3RvLm9ubW91c2V1cCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdGhpcy5fcG9pbnRlclVwKCBldmVudCwgZXZlbnQgKTtcbn07XG5cbnByb3RvLm9uTVNQb2ludGVyVXAgPVxucHJvdG8ub25wb2ludGVydXAgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIGlmICggZXZlbnQucG9pbnRlcklkID09IHRoaXMucG9pbnRlcklkZW50aWZpZXIgKSB7XG4gICAgdGhpcy5fcG9pbnRlclVwKCBldmVudCwgZXZlbnQgKTtcbiAgfVxufTtcblxucHJvdG8ub250b3VjaGVuZCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdmFyIHRvdWNoID0gdGhpcy5nZXRUb3VjaCggZXZlbnQuY2hhbmdlZFRvdWNoZXMgKTtcbiAgaWYgKCB0b3VjaCApIHtcbiAgICB0aGlzLl9wb2ludGVyVXAoIGV2ZW50LCB0b3VjaCApO1xuICB9XG59O1xuXG4vKipcbiAqIHBvaW50ZXIgdXBcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50IG9yIFRvdWNofSBwb2ludGVyXG4gKiBAcHJpdmF0ZVxuICovXG5wcm90by5fcG9pbnRlclVwID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLl9wb2ludGVyRG9uZSgpO1xuICB0aGlzLnBvaW50ZXJVcCggZXZlbnQsIHBvaW50ZXIgKTtcbn07XG5cbi8vIHB1YmxpY1xucHJvdG8ucG9pbnRlclVwID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLmVtaXRFdmVudCggJ3BvaW50ZXJVcCcsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xufTtcblxuLy8gLS0tLS0gcG9pbnRlciBkb25lIC0tLS0tIC8vXG5cbi8vIHRyaWdnZXJlZCBvbiBwb2ludGVyIHVwICYgcG9pbnRlciBjYW5jZWxcbnByb3RvLl9wb2ludGVyRG9uZSA9IGZ1bmN0aW9uKCkge1xuICAvLyByZXNldCBwcm9wZXJ0aWVzXG4gIHRoaXMuaXNQb2ludGVyRG93biA9IGZhbHNlO1xuICBkZWxldGUgdGhpcy5wb2ludGVySWRlbnRpZmllcjtcbiAgLy8gcmVtb3ZlIGV2ZW50c1xuICB0aGlzLl91bmJpbmRQb3N0U3RhcnRFdmVudHMoKTtcbiAgdGhpcy5wb2ludGVyRG9uZSgpO1xufTtcblxucHJvdG8ucG9pbnRlckRvbmUgPSBub29wO1xuXG4vLyAtLS0tLSBwb2ludGVyIGNhbmNlbCAtLS0tLSAvL1xuXG5wcm90by5vbk1TUG9pbnRlckNhbmNlbCA9XG5wcm90by5vbnBvaW50ZXJjYW5jZWwgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIGlmICggZXZlbnQucG9pbnRlcklkID09IHRoaXMucG9pbnRlcklkZW50aWZpZXIgKSB7XG4gICAgdGhpcy5fcG9pbnRlckNhbmNlbCggZXZlbnQsIGV2ZW50ICk7XG4gIH1cbn07XG5cbnByb3RvLm9udG91Y2hjYW5jZWwgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHZhciB0b3VjaCA9IHRoaXMuZ2V0VG91Y2goIGV2ZW50LmNoYW5nZWRUb3VjaGVzICk7XG4gIGlmICggdG91Y2ggKSB7XG4gICAgdGhpcy5fcG9pbnRlckNhbmNlbCggZXZlbnQsIHRvdWNoICk7XG4gIH1cbn07XG5cbi8qKlxuICogcG9pbnRlciBjYW5jZWxcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50IG9yIFRvdWNofSBwb2ludGVyXG4gKiBAcHJpdmF0ZVxuICovXG5wcm90by5fcG9pbnRlckNhbmNlbCA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5fcG9pbnRlckRvbmUoKTtcbiAgdGhpcy5wb2ludGVyQ2FuY2VsKCBldmVudCwgcG9pbnRlciApO1xufTtcblxuLy8gcHVibGljXG5wcm90by5wb2ludGVyQ2FuY2VsID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLmVtaXRFdmVudCggJ3BvaW50ZXJDYW5jZWwnLCBbIGV2ZW50LCBwb2ludGVyIF0gKTtcbn07XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG4vLyB1dGlsaXR5IGZ1bmN0aW9uIGZvciBnZXR0aW5nIHgveSBjb29yZHMgZnJvbSBldmVudFxuVW5pcG9pbnRlci5nZXRQb2ludGVyUG9pbnQgPSBmdW5jdGlvbiggcG9pbnRlciApIHtcbiAgcmV0dXJuIHtcbiAgICB4OiBwb2ludGVyLnBhZ2VYLFxuICAgIHk6IHBvaW50ZXIucGFnZVlcbiAgfTtcbn07XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG5yZXR1cm4gVW5pcG9pbnRlcjtcblxufSkpO1xuIiwiLyoqXG4gKiBXaXRoaW4gVmlld3BvcnRcbiAqXG4gKiBAZGVzY3JpcHRpb24gRGV0ZXJtaW5lcyB3aGV0aGVyIGFuIGVsZW1lbnQgaXMgY29tcGxldGVseSB3aXRoaW4gdGhlIGJyb3dzZXIgdmlld3BvcnRcbiAqIEBhdXRob3IgICAgICBDcmFpZyBQYXRpaywgaHR0cDovL3BhdGlrLmNvbS9cbiAqIEB2ZXJzaW9uICAgICAxLjAuMFxuICogQGRhdGUgICAgICAgIDIwMTUtMDgtMDJcbiAqL1xuKGZ1bmN0aW9uIChyb290LCBuYW1lLCBmYWN0b3J5KSB7XG4gICAgLy8gQU1EXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW10sIGZhY3RvcnkpO1xuICAgIH1cbiAgICAvLyBOb2RlIGFuZCBDb21tb25KUy1saWtlIGVudmlyb25tZW50c1xuICAgIGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgICB9XG4gICAgLy8gQnJvd3NlciBnbG9iYWxcbiAgICBlbHNlIHtcbiAgICAgICAgcm9vdFtuYW1lXSA9IGZhY3RvcnkoKTtcbiAgICB9XG59KHRoaXMsICd3aXRoaW52aWV3cG9ydCcsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuVXNlV2luZG93RGltZW5zaW9ucyA9IHdpbmRvdy5pbm5lckhlaWdodCAhPT0gdW5kZWZpbmVkOyAvLyBJRSA4IGFuZCBsb3dlciBmYWlsIHRoaXNcblxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgd2hldGhlciBhbiBlbGVtZW50IGlzIHdpdGhpbiB0aGUgdmlld3BvcnRcbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9ICBlbGVtICAgICAgIERPTSBFbGVtZW50IChyZXF1aXJlZClcbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9ICBvcHRpb25zICAgIE9wdGlvbmFsIHNldHRpbmdzXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn0gICAgICAgICAgICBXaGV0aGVyIHRoZSBlbGVtZW50IHdhcyBjb21wbGV0ZWx5IHdpdGhpbiB0aGUgdmlld3BvcnRcbiAgICAqL1xuICAgIHZhciB3aXRoaW52aWV3cG9ydCA9IGZ1bmN0aW9uIHdpdGhpbnZpZXdwb3J0IChlbGVtLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBmYWxzZTtcbiAgICAgICAgdmFyIG1ldGFkYXRhID0ge307XG4gICAgICAgIHZhciBjb25maWcgPSB7fTtcbiAgICAgICAgdmFyIHNldHRpbmdzO1xuICAgICAgICB2YXIgaXNXaXRoaW47XG4gICAgICAgIHZhciBlbGVtQm91bmRpbmdSZWN0O1xuICAgICAgICB2YXIgc2lkZU5hbWVzUGF0dGVybjtcbiAgICAgICAgdmFyIHNpZGVzO1xuICAgICAgICB2YXIgc2lkZTtcbiAgICAgICAgdmFyIGk7XG5cbiAgICAgICAgLy8gSWYgaW52b2tlZCBieSB0aGUgalF1ZXJ5IHBsdWdpbiwgZ2V0IHRoZSBhY3R1YWwgRE9NIGVsZW1lbnRcbiAgICAgICAgaWYgKHR5cGVvZiBqUXVlcnkgIT09ICd1bmRlZmluZWQnICYmIGVsZW0gaW5zdGFuY2VvZiBqUXVlcnkpIHtcbiAgICAgICAgICAgIGVsZW0gPSBlbGVtLmdldCgwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgZWxlbSAhPT0gJ29iamVjdCcgfHwgZWxlbS5ub2RlVHlwZSAhPT0gMSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCBtdXN0IGJlIGFuIGVsZW1lbnQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExvb2sgZm9yIGlubGluZSBzZXR0aW5ncyBvbiB0aGUgZWxlbWVudFxuICAgICAgICBpZiAoZWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtd2l0aGludmlld3BvcnQtc2V0dGluZ3MnKSAmJiB3aW5kb3cuSlNPTikge1xuICAgICAgICAgICAgbWV0YWRhdGEgPSBKU09OLnBhcnNlKGVsZW0uZ2V0QXR0cmlidXRlKCdkYXRhLXdpdGhpbnZpZXdwb3J0LXNldHRpbmdzJykpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0dGluZ3MgYXJndW1lbnQgbWF5IGJlIGEgc2ltcGxlIHN0cmluZyAoYHRvcGAsIGByaWdodGAsIGV0YylcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgc2V0dGluZ3MgPSB7c2lkZXM6IG9wdGlvbnN9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgc2V0dGluZ3MgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQnVpbGQgY29uZmlndXJhdGlvbiBmcm9tIGRlZmF1bHRzIGFuZCB1c2VyLXByb3ZpZGVkIHNldHRpbmdzIGFuZCBtZXRhZGF0YVxuICAgICAgICBjb25maWcuY29udGFpbmVyID0gc2V0dGluZ3MuY29udGFpbmVyIHx8IG1ldGFkYXRhLmNvbnRhaW5lciB8fCB3aXRoaW52aWV3cG9ydC5kZWZhdWx0cy5jb250YWluZXIgfHwgd2luZG93O1xuICAgICAgICBjb25maWcuc2lkZXMgID0gc2V0dGluZ3Muc2lkZXMgIHx8IG1ldGFkYXRhLnNpZGVzICB8fCB3aXRoaW52aWV3cG9ydC5kZWZhdWx0cy5zaWRlcyAgfHwgJ2FsbCc7XG4gICAgICAgIGNvbmZpZy50b3AgICAgPSBzZXR0aW5ncy50b3AgICAgfHwgbWV0YWRhdGEudG9wICAgIHx8IHdpdGhpbnZpZXdwb3J0LmRlZmF1bHRzLnRvcCAgICB8fCAwO1xuICAgICAgICBjb25maWcucmlnaHQgID0gc2V0dGluZ3MucmlnaHQgIHx8IG1ldGFkYXRhLnJpZ2h0ICB8fCB3aXRoaW52aWV3cG9ydC5kZWZhdWx0cy5yaWdodCAgfHwgMDtcbiAgICAgICAgY29uZmlnLmJvdHRvbSA9IHNldHRpbmdzLmJvdHRvbSB8fCBtZXRhZGF0YS5ib3R0b20gfHwgd2l0aGludmlld3BvcnQuZGVmYXVsdHMuYm90dG9tIHx8IDA7XG4gICAgICAgIGNvbmZpZy5sZWZ0ICAgPSBzZXR0aW5ncy5sZWZ0ICAgfHwgbWV0YWRhdGEubGVmdCAgIHx8IHdpdGhpbnZpZXdwb3J0LmRlZmF1bHRzLmxlZnQgICB8fCAwO1xuXG4gICAgICAgIC8vIFVzZSB0aGUgd2luZG93IGFzIHRoZSBjb250YWluZXIgaWYgdGhlIHVzZXIgc3BlY2lmaWVkIHRoZSBib2R5IG9yIGEgbm9uLWVsZW1lbnRcbiAgICAgICAgaWYgKGNvbmZpZy5jb250YWluZXIgPT09IGRvY3VtZW50LmJvZHkgfHwgIWNvbmZpZy5jb250YWluZXIubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgIGNvbmZpZy5jb250YWluZXIgPSB3aW5kb3c7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFbGVtZW50IHRlc3RpbmcgbWV0aG9kc1xuICAgICAgICBpc1dpdGhpbiA9IHtcbiAgICAgICAgICAgIC8vIEVsZW1lbnQgaXMgYmVsb3cgdGhlIHRvcCBlZGdlIG9mIHRoZSB2aWV3cG9ydFxuICAgICAgICAgICAgdG9wOiBmdW5jdGlvbiBfaXNXaXRoaW5fdG9wICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbUJvdW5kaW5nUmVjdC50b3AgPj0gY29uZmlnLnRvcDtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8vIEVsZW1lbnQgaXMgdG8gdGhlIGxlZnQgb2YgdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIHZpZXdwb3J0XG4gICAgICAgICAgICByaWdodDogZnVuY3Rpb24gX2lzV2l0aGluX3JpZ2h0ICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29udGFpbmVyV2lkdGg7XG5cbiAgICAgICAgICAgICAgICBpZiAoY2FuVXNlV2luZG93RGltZW5zaW9ucyB8fCBjb25maWcuY29udGFpbmVyICE9PSB3aW5kb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyV2lkdGggPSBjb25maWcuY29udGFpbmVyLmlubmVyV2lkdGg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb250YWluZXJXaWR0aCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBOb3RlIHRoYXQgYGVsZW1Cb3VuZGluZ1JlY3QucmlnaHRgIGlzIHRoZSBkaXN0YW5jZSBmcm9tIHRoZSAqbGVmdCogb2YgdGhlIHZpZXdwb3J0IHRvIHRoZSBlbGVtZW50J3MgZmFyIHJpZ2h0IGVkZ2VcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbUJvdW5kaW5nUmVjdC5yaWdodCA8PSBjb250YWluZXJXaWR0aCAtIGNvbmZpZy5yaWdodDtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8vIEVsZW1lbnQgaXMgYWJvdmUgdGhlIGJvdHRvbSBlZGdlIG9mIHRoZSB2aWV3cG9ydFxuICAgICAgICAgICAgYm90dG9tOiBmdW5jdGlvbiBfaXNXaXRoaW5fYm90dG9tICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29udGFpbmVySGVpZ2h0O1xuXG4gICAgICAgICAgICAgICAgaWYgKGNhblVzZVdpbmRvd0RpbWVuc2lvbnMgfHwgY29uZmlnLmNvbnRhaW5lciAhPT0gd2luZG93KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lckhlaWdodCA9IGNvbmZpZy5jb250YWluZXIuaW5uZXJIZWlnaHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb250YWluZXJIZWlnaHQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIE5vdGUgdGhhdCBgZWxlbUJvdW5kaW5nUmVjdC5ib3R0b21gIGlzIHRoZSBkaXN0YW5jZSBmcm9tIHRoZSAqdG9wKiBvZiB0aGUgdmlld3BvcnQgdG8gdGhlIGVsZW1lbnQncyBib3R0b20gZWRnZVxuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtQm91bmRpbmdSZWN0LmJvdHRvbSA8PSBjb250YWluZXJIZWlnaHQgLSBjb25maWcuYm90dG9tO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy8gRWxlbWVudCBpcyB0byB0aGUgcmlnaHQgb2YgdGhlIGxlZnQgZWRnZSBvZiB0aGUgdmlld3BvcnRcbiAgICAgICAgICAgIGxlZnQ6IGZ1bmN0aW9uIF9pc1dpdGhpbl9sZWZ0ICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbUJvdW5kaW5nUmVjdC5sZWZ0ID49IGNvbmZpZy5sZWZ0O1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy8gRWxlbWVudCBpcyB3aXRoaW4gYWxsIGZvdXIgYm91bmRhcmllc1xuICAgICAgICAgICAgYWxsOiBmdW5jdGlvbiBfaXNXaXRoaW5fYWxsICgpIHtcbiAgICAgICAgICAgICAgICAvLyBUZXN0IGVhY2ggYm91bmRhcnkgaW4gb3JkZXIgb2YgbW9zdCBlZmZpY2llbnQgYW5kIG1vc3QgbGlrZWx5IHRvIGJlIGZhbHNlIHNvIHRoYXQgd2UgY2FuIGF2b2lkIHJ1bm5pbmcgYWxsIGZvdXIgZnVuY3Rpb25zIG9uIG1vc3QgZWxlbWVudHNcbiAgICAgICAgICAgICAgICAvLyBUb3A6IFF1aWNrZXN0IHRvIGNhbGN1bGF0ZSArIG1vc3QgbGlrZWx5IHRvIGJlIGZhbHNlXG4gICAgICAgICAgICAgICAgLy8gQm90dG9tOiBOb3RlIHF1aXRlIGFzIHF1aWNrIHRvIGNhbGN1bGF0ZSwgYnV0IGFsc28gdmVyeSBsaWtlbHkgdG8gYmUgZmFsc2VcbiAgICAgICAgICAgICAgICAvLyBMZWZ0IGFuZCByaWdodCBhcmUgYm90aCBlcXVhbGx5IHVubGlrZWx5IHRvIGJlIGZhbHNlIHNpbmNlIG1vc3Qgc2l0ZXMgb25seSBzY3JvbGwgdmVydGljYWxseSwgYnV0IGxlZnQgaXMgZmFzdGVyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChpc1dpdGhpbi50b3AoKSAmJiBpc1dpdGhpbi5ib3R0b20oKSAmJiBpc1dpdGhpbi5sZWZ0KCkgJiYgaXNXaXRoaW4ucmlnaHQoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gR2V0IHRoZSBlbGVtZW50J3MgYm91bmRpbmcgcmVjdGFuZ2xlIHdpdGggcmVzcGVjdCB0byB0aGUgdmlld3BvcnRcbiAgICAgICAgZWxlbUJvdW5kaW5nUmVjdCA9IGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgLy8gVGVzdCB0aGUgZWxlbWVudCBhZ2FpbnN0IGVhY2ggc2lkZSBvZiB0aGUgdmlld3BvcnQgdGhhdCB3YXMgcmVxdWVzdGVkXG4gICAgICAgIHNpZGVOYW1lc1BhdHRlcm4gPSAvXnRvcCR8XnJpZ2h0JHxeYm90dG9tJHxebGVmdCR8XmFsbCQvO1xuICAgICAgICAvLyBMb29wIHRocm91Z2ggYWxsIG9mIHRoZSBzaWRlc1xuICAgICAgICBzaWRlcyA9IGNvbmZpZy5zaWRlcy5zcGxpdCgnICcpO1xuICAgICAgICBpID0gc2lkZXMubGVuZ3RoO1xuICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgICBzaWRlID0gc2lkZXNbaV0udG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAgICAgaWYgKHNpZGVOYW1lc1BhdHRlcm4udGVzdChzaWRlKSkge1xuICAgICAgICAgICAgICAgIGlmIChpc1dpdGhpbltzaWRlXSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBRdWl0IGFzIHNvb24gYXMgdGhlIGZpcnN0IGZhaWx1cmUgaXMgZm91bmRcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgLy8gRGVmYXVsdCBzZXR0aW5nc1xuICAgIHdpdGhpbnZpZXdwb3J0LnByb3RvdHlwZS5kZWZhdWx0cyA9IHtcbiAgICAgICAgY29udGFpbmVyOiBkb2N1bWVudC5ib2R5LFxuICAgICAgICBzaWRlczogJ2FsbCcsXG4gICAgICAgIHRvcDogMCxcbiAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgIGJvdHRvbTogMCxcbiAgICAgICAgbGVmdDogMFxuICAgIH07XG5cbiAgICB3aXRoaW52aWV3cG9ydC5kZWZhdWx0cyA9IHdpdGhpbnZpZXdwb3J0LnByb3RvdHlwZS5kZWZhdWx0cztcblxuICAgIC8qKlxuICAgICAqIE9wdGlvbmFsIGVuaGFuY2VtZW50cyBhbmQgc2hvcnRjdXRzXG4gICAgICpcbiAgICAgKiBAZGVzY3JpcHRpb24gVW5jb21tZW50IG9yIGNvbW1lbnQgdGhlc2UgcGllY2VzIGFzIHRoZXkgYXBwbHkgdG8geW91ciBwcm9qZWN0IGFuZCBjb2RpbmcgcHJlZmVyZW5jZXNcbiAgICAgKi9cblxuICAgIC8vIFNob3J0Y3V0IG1ldGhvZHMgZm9yIGVhY2ggc2lkZSBvZiB0aGUgdmlld3BvcnRcbiAgICAvLyBFeGFtcGxlOiBgd2l0aGludmlld3BvcnQudG9wKGVsZW0pYCBpcyB0aGUgc2FtZSBhcyBgd2l0aGludmlld3BvcnQoZWxlbSwgJ3RvcCcpYFxuICAgIHdpdGhpbnZpZXdwb3J0LnByb3RvdHlwZS50b3AgPSBmdW5jdGlvbiBfd2l0aGludmlld3BvcnRfdG9wIChlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiB3aXRoaW52aWV3cG9ydChlbGVtZW50LCAndG9wJyk7XG4gICAgfTtcblxuICAgIHdpdGhpbnZpZXdwb3J0LnByb3RvdHlwZS5yaWdodCA9IGZ1bmN0aW9uIF93aXRoaW52aWV3cG9ydF9yaWdodCAoZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gd2l0aGludmlld3BvcnQoZWxlbWVudCwgJ3JpZ2h0Jyk7XG4gICAgfTtcblxuICAgIHdpdGhpbnZpZXdwb3J0LnByb3RvdHlwZS5ib3R0b20gPSBmdW5jdGlvbiBfd2l0aGludmlld3BvcnRfYm90dG9tIChlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiB3aXRoaW52aWV3cG9ydChlbGVtZW50LCAnYm90dG9tJyk7XG4gICAgfTtcblxuICAgIHdpdGhpbnZpZXdwb3J0LnByb3RvdHlwZS5sZWZ0ID0gZnVuY3Rpb24gX3dpdGhpbnZpZXdwb3J0X2xlZnQgKGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIHdpdGhpbnZpZXdwb3J0KGVsZW1lbnQsICdsZWZ0Jyk7XG4gICAgfTtcblxuICAgIHJldHVybiB3aXRoaW52aWV3cG9ydDtcbn0pKTtcbiIsImNvbnN0IGFwcENvbmZpZyA9IHJlcXVpcmUoJy4uL2ZpcmViYXNlY29uZmlnLmpzb24nKTtcbmZpcmViYXNlLmluaXRpYWxpemVBcHAoYXBwQ29uZmlnKTtcbmNvbnN0IGRiTG9jYXRpb24gPSBhcHBDb25maWcuZGF0YWJhc2VVUkw7XG5jb25zdCBuZXdUYXBlUmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoJ3RhcGVzJyk7XG5cbmNvbnN0IHN0b3JlVGFwZSA9ICh0YXBlKSA9PiB7XG4gICAgbmV3VGFwZVJlZi5wdXNoKHtcbiAgICAgICAgJ25hbWUnOiAnZGVtbycsXG4gICAgICAgICdldmVudHMnOiB0YXBlXG4gICAgfSkudGhlbihmdW5jdGlvbiAoYXJndW1lbnQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2Nvb2wnKTtcbiAgICB9KTtcbn1cblxuY29uc3QgZmV0Y2hUYXBlcyA9ICgpID0+IHtcbiAgICByZXR1cm4gZmV0Y2goYCR7ZGJMb2NhdGlvbn0vdGFwZXMuanNvbmApOyBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc3RvcmVUYXBlLFxuICAgIGZldGNoVGFwZXNcbn0iLCJjb25zdCBkcmFnZ2FiaWxseSA9IHJlcXVpcmUoJ2RyYWdnYWJpbGx5Jyk7XG5cbmNvbnN0IHNob3cgPSAoKSA9PiB7XG4gICAgJCgnYm9keScpLmFwcGVuZChodG1sKTtcbiAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnZocy1jb250cm9scycpO1xuICAgIG5ldyBkcmFnZ2FiaWxseShlbGVtZW50KTtcbn07XG5cbmNvbnN0IHRvZ2dsZVJlY29yZGluZ1N0YXRlID0gKCkgPT4ge1xuICAgICQoJy52aHMtcmVjb3JkLWNpcmNsZScpLnRvZ2dsZUNsYXNzKCd2aHMtcmVjb3JkaW5nJyk7XG59O1xuXG5jb25zdCB0b2dnbGVQbGF5aW5nU3RhdGUgPSAoKSA9PiB7XG4gICAgJCgnLnZocy1wbGF5LWJ1dHRvbicpLnRvZ2dsZUNsYXNzKCd2aHMtcGxheWluZycpO1xufTtcblxuY29uc3Qgc3R5bGVzID0gYDxzdHlsZT5cbiAgICAudmhzLWNvbnRyb2xzIHtcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICB0b3A6IDEwcHg7XG4gICAgICAgIGxlZnQ6IDEwcHg7XG4gICAgfVxuICAgIC52aHMtYnV0dG9uIHtcbiAgICAgICAgd2lkdGg6IDMwcHg7XG4gICAgICAgIGhlaWdodDogMzBweDtcbiAgICAgICAgYmFja2dyb3VuZDogI0ZGRjtcbiAgICAgICAgYm9yZGVyOiAxcHggc29saWQgI0RERDtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogNXB4O1xuICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICB9XG4gICAgLnZocy1yZWNvcmQtY2lyY2xlIHtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgICB3aWR0aDogMTBweDtcbiAgICAgICAgaGVpZ2h0OiAxMHB4O1xuICAgICAgICBtYXJnaW46IDEwcHg7XG4gICAgICAgIGJhY2tncm91bmQ6ICNGRTM1NDg7XG4gICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICB9XG4gICAgLnZocy1yZWNvcmRpbmcge1xuICAgICAgICBhbmltYXRpb246IHZocy1yZWNvcmRpbmctYW5pbWF0aW9uIDJzIGluZmluaXRlO1xuICAgIH1cbiAgICBAa2V5ZnJhbWVzIHZocy1yZWNvcmRpbmctYW5pbWF0aW9uIHtcbiAgICAgICAgMCUgICB7b3BhY2l0eTogMX1cbiAgICAgICAgNTAlICB7b3BhY2l0eTogMH1cbiAgICAgICAgMTAwJSB7b3BhY2l0eTogMX1cbiAgICB9XG4gICAgLnZocy1wbGF5aW5nIHtcbiAgICAgICAgYmFja2dyb3VuZDogIzAwQURFOTtcbiAgICAgICAgYm9yZGVyLWNvbG9yOiAjMDBBREU5O1xuICAgIH1cbiAgICAudmhzLXBsYXlpbmcgLnZocy1wbGF5LXRyaWFuZ2xlIHtcbiAgICAgICAgYmFja2dyb3VuZDogI0ZGRjtcbiAgICB9XG4gICAgLnZocy1wbGF5LXRyaWFuZ2xlIHtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzY2NjtcbiAgICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgICAgICBtYXJnaW46IDEycHg7XG4gICAgfVxuICAgIC52aHMtcGxheS10cmlhbmdsZTpiZWZvcmUsXG4gICAgLnZocy1wbGF5LXRyaWFuZ2xlOmFmdGVyIHtcbiAgICAgICAgY29udGVudDogJyc7XG4gICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogaW5oZXJpdDtcbiAgICB9XG4gICAgLnZocy1wbGF5LXRyaWFuZ2xlLFxuICAgIC52aHMtcGxheS10cmlhbmdsZTpiZWZvcmUsXG4gICAgLnZocy1wbGF5LXRyaWFuZ2xlOmFmdGVyIHtcbiAgICAgICAgd2lkdGg6ICA2cHg7XG4gICAgICAgIGhlaWdodDogNnB4O1xuICAgICAgICBib3JkZXItdG9wLXJpZ2h0LXJhZGl1czogMzAlO1xuICAgIH1cbiAgICAudmhzLXBsYXktdHJpYW5nbGUge1xuICAgICAgICB0cmFuc2Zvcm06IHJvdGF0ZSgzMGRlZykgc2tld1goLTMwZGVnKSBzY2FsZSgxLCAuODY2KTtcbiAgICB9XG4gICAgLnZocy1wbGF5LXRyaWFuZ2xlOmJlZm9yZSB7XG4gICAgICAgIHRyYW5zZm9ybTogcm90YXRlKC0xMzVkZWcpIHNrZXdYKC00NWRlZykgc2NhbGUoMS40MTQsIC43MDcpIHRyYW5zbGF0ZSgwLCAtNTAlKTtcbiAgICB9XG4gICAgLnZocy1wbGF5LXRyaWFuZ2xlOmFmdGVyIHtcbiAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMTM1ZGVnKSBza2V3WSgtNDVkZWcpIHNjYWxlKC43MDcsIDEuNDE0KSB0cmFuc2xhdGUoNTAlKTtcbiAgICB9XG48L3N0eWxlPmA7XG5cbmNvbnN0IGh0bWwgPSBgXG4gICAgPGRpdiBjbGFzcz1cInZocy1jb250cm9sc1wiPlxuICAgICAgICAke3N0eWxlc31cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJ2aHMtYnV0dG9uXCIgb25jbGljaz1cInZocy50b2dnbGVSZWNvcmRpbmcoKVwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ2aHMtcmVjb3JkLWNpcmNsZVwiPjwvc3Bhbj5cbiAgICAgICAgPC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz1cInZocy1idXR0b24gdmhzLXBsYXktYnV0dG9uXCIgb25jbGljaz1cInZocy5zZXR1cFBsYXliYWNrKClcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidmhzLXBsYXktdHJpYW5nbGVcIj48L3NwYW4+XG4gICAgICAgIDwvc3Bhbj5cbiAgICA8L2Rpdj5cbmA7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHNob3csXG4gICAgdG9nZ2xlUmVjb3JkaW5nU3RhdGUsXG4gICAgdG9nZ2xlUGxheWluZ1N0YXRlXG59XG4iLCJjb25zdCB4cGF0aCA9IHJlcXVpcmUoJ3NpbXBsZS14cGF0aC1wb3NpdGlvbicpO1xuY29uc3QgdmlzaWJsZSA9IHJlcXVpcmUoJ3dpdGhpbnZpZXdwb3J0Jyk7XG53aW5kb3cudmlzYmxlID0gdmlzaWJsZTtcbmNvbnN0IGJ1bmtlciA9IHJlcXVpcmUoJy4vYnVua2VyJyk7XG5cbmNvbnN0IHNob3cgPSAoKSA9PiB7XG4gICAgJCgnYm9keScpLmFwcGVuZChodG1sKTtcbn07XG5cbmxldCBldmVudHMgPSBbXTtcblxuY29uc3QgcmVuZGVyID0gKGV2ZW50c0FycmF5LCBsYXN0RXZlbnRJbmRleCkgPT4ge1xuICAgICQoJy52aHMtc2lkZWJhci1ldmVudHMnKS5lbXB0eSgpO1xuICAgIGV2ZW50cyA9IGV2ZW50c0FycmF5O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXZlbnRzLmxlbmd0aDsgaSsrKSBhZGRFdmVudChpLCBsYXN0RXZlbnRJbmRleCk7XG4gICAgZm9sbG93TG9ncygpO1xufTtcblxuY29uc3QgZm9sbG93TG9ncyA9ICgpID0+IHtcbiAgICBsZXQgbGF0ZXN0UGFzc2VkVGVzdCA9ICQoJy52aHMtc2lkZWJhci1ldmVudC1wYXNzZWQnKS5sYXN0KCk7XG4gICAgaWYgKCFsYXRlc3RQYXNzZWRUZXN0Lmxlbmd0aCkgcmV0dXJuO1xuXG4gICAgaWYgKCF2aXNpYmxlKGxhdGVzdFBhc3NlZFRlc3QpKSB7XG4gICAgICAgIGxldCBzY3JvbGxUb3AgID0gJCgnLnZocy1zaWRlYmFyJykuc2Nyb2xsVG9wKCk7XG4gICAgICAgICQoJy52aHMtc2lkZWJhcicpLnN0b3AoKS5hbmltYXRlKHtcbiAgICAgICAgICAgIHNjcm9sbFRvcDogc2Nyb2xsVG9wICsgNTAwXG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbmNvbnN0IGFkZEV2ZW50ID0gKGluZGV4LCBsYXN0RXZlbnRJbmRleCkgPT4ge1xuICAgIGxldCBldmVudCA9IGV2ZW50c1tpbmRleF07XG5cbiAgICBldmVudC5zdGF0dXMgPSBpbmRleCA8PSBsYXN0RXZlbnRJbmRleCA/ICdwYXNzZWQnOiAncGVuZGluZyc7XG5cbiAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ3dhaXQnICYmIGV2ZW50LmR1cmF0aW9uIDwgMzAwKSByZXR1cm47XG5cbiAgICBldmVudC5pZGVudGlmaWVyID0gZ2V0UHJldHR5SWRlbnRpZmllcihldmVudC5wYXRoKTtcblxuICAgIGlmIChldmVudC53aGljaCA9PT0gMSkgZGVsZXRlIGV2ZW50LndoaWNoOyAvLyBjbGljayBldmVudHNcbiAgICBpZiAoZXZlbnQud2hpY2gpIGV2ZW50LmtleSA9IGdldFByZXR0eUtleShldmVudC53aGljaCk7XG5cbiAgICAvLyAkKCcudmhzLXNpZGViYXItZXZlbnRzJykuYXBwZW5kKGdldE5ld0V2ZW50SFRNTChldmVudCkpO1xufTtcblxuY29uc3QgYWRkVGFwZXMgPSAoKSA9PiB7XG4gICAgbGV0IHRhcGVzUHJvbWlzZSA9IGJ1bmtlci5mZXRjaFRhcGVzKCk7IFxuICAgIHRhcGVzUHJvbWlzZS50aGVuKCByZXNwb25zZSA9PiB7XG4gICAgICAgIGlmIChyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgcmVzcG9uc2UuanNvbigpLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBtb3VudFRhcGVzKGRhdGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRXJyb3JlZCcpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5hZGRUYXBlcygpO1xuXG5jb25zdCBtb3VudFRhcGVzID0gKHRhcGVzRHVtcCkgPT4ge1xuICAgIGxldCB0YXBlcyA9IE9iamVjdC5rZXlzKHRhcGVzRHVtcCk7XG4gICAgbGV0IHRhcGVIdG1sID0gYDx1bD5gXG4gICAgdGFwZXMuZm9yRWFjaCh0YXBlID0+IHtcbiAgICAgICAgdGFwZUh0bWwgKz0gYDxsaT4ke3RhcGV9IDx1bD5gO1xuICAgICAgICB0YXBlc0R1bXBbdGFwZV0uZXZlbnRzLmZvckVhY2goZXYgPT4ge1xuICAgICAgICAgICAgdGFwZUh0bWwgKz0gYDxsaT4ke2dldE5ld0V2ZW50SFRNTChldil9PC9saT5gO1xuICAgICAgICB9KTtcbiAgICAgICAgdGFwZUh0bWwgKz0gYDwvdWw+PC9saT5gO1xuICAgIH0pO1xuICAgIHRhcGVIdG1sICs9IGA8L3VsPmA7XG4gICAgJCgnLnZocy1zaWRlYmFyLWV2ZW50cycpLmFwcGVuZCh0YXBlSHRtbCk7XG59XG5cbmNvbnN0IGdldFByZXR0eUlkZW50aWZpZXIgPSAocGF0aCkgPT4ge1xuICAgIGxldCBpZGVudGlmaWVyID0gJyc7XG4gICAgaWYgKCFwYXRoKSByZXR1cm4gaWRlbnRpZmllcjtcblxuICAgIGxldCBlbGVtZW50ID0geHBhdGgudG9Ob2RlKHBhdGgsIGRvY3VtZW50KTtcbiAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIGlkZW50aWZpZXI7XG4gICAgfVxuXG4gICAgaWRlbnRpZmllciArPSBlbGVtZW50LnRhZ05hbWUgPyBgJHtlbGVtZW50LnRhZ05hbWV9YDogJyc7XG4gICAgaWRlbnRpZmllciArPSBlbGVtZW50LmlkID8gYCMke2VsZW1lbnQuaWR9YDogJyc7XG4gICAgaWRlbnRpZmllciArPSBlbGVtZW50LmNsYXNzTmFtZSA/IGAuJHtlbGVtZW50LmNsYXNzTmFtZX1gOiAnJztcbiAgICBpZGVudGlmaWVyICs9IGVsZW1lbnQudGV4dCA/IGAoJHtlbGVtZW50LnRleHR9KWA6ICcnO1xuICAgIHJldHVybiBpZGVudGlmaWVyO1xufTtcblxuY29uc3QgZ2V0UHJldHR5S2V5ID0gKHdoaWNoKSA9PiB7XG4gICAgbGV0IG1hcCA9IHtcbiAgICAgICAgODogJ+KGkCcsXG4gICAgICAgIDEzOiAn4oa1JyxcbiAgICAgICAgMzI6ICdfJyAvL3Byb3h5IGZvciBzcGFjZVxuICAgIH1cbiAgICByZXR1cm4gbWFwW3doaWNoXSB8fCBTdHJpbmcuZnJvbUNoYXJDb2RlKHdoaWNoKTtcbn07XG5cbmNvbnN0IHN0eWxlcyA9IGA8c3R5bGU+XG4gICAgLnZocy1zaWRlYmFyIHtcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICB0b3A6IDA7XG4gICAgICAgIHJpZ2h0OiAwO1xuICAgICAgICB3aWR0aDogMzAwcHg7XG4gICAgICAgIGhlaWdodDogMTAwJTtcbiAgICAgICAgei1pbmRleDogOTk5O1xuICAgICAgICBiYWNrZ3JvdW5kOiAjMjUzNDQ3O1xuICAgICAgICBib3JkZXItbGVmdDogMXB4IHNvbGlkICMxQzI5Mzk7XG4gICAgICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgICAgIGNvbG9yOiAjRkZGO1xuICAgICAgICBmb250LXNpemU6IDE0cHg7XG4gICAgfVxuICAgIC52aHMtc2lkZWJhci1oZWFkZXIge1xuICAgICAgICBiYWNrZ3JvdW5kOiAjMUMyOTM5O1xuICAgICAgICBwYWRkaW5nOiAyMHB4IDMwcHg7XG4gICAgICAgIGZvbnQtc2l6ZTogMThweDtcbiAgICB9XG4gICAgLnZocy1zaWRlYmFyLWV2ZW50IHtcbiAgICAgICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICAgICAgcGFkZGluZzogMTBweDtcbiAgICB9XG4gICAgLnZocy1zaWRlYmFyLWV2ZW50LXR5cGUsIC52aHMtc2lkZWJhci1ldmVudC1rZXkge1xuICAgICAgICBmbG9hdDogcmlnaHQ7XG4gICAgfVxuICAgIC52aHMtc2lkZWJhci1ldmVudC1rZXkge1xuICAgICAgICBjb2xvcjogI0QyNDI2RTtcbiAgICAgICAgYmFja2dyb3VuZDogI0Y3RjdGOTtcbiAgICAgICAgYm9yZGVyOiAxcHggc29saWQgI0RERDtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogM3B4O1xuICAgICAgICBwYWRkaW5nOiAwIDNweDtcbiAgICAgICAgbWFyZ2luLWxlZnQ6IDVweDtcbiAgICAgICAgZGlzcGxheTogaW5saW5lO1xuICAgIH1cbiAgICAudmhzLXNpZGViYXItc3RhdHVzIHtcbiAgICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgICAgICB3aWR0aDogNy41cHg7XG4gICAgICAgIGhlaWdodDogNy41cHg7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgICAgbWFyZ2luOiAycHggNXB4O1xuICAgIH1cbiAgICAudmhzLXNpZGViYXItZXZlbnQtcGVuZGluZyB7XG4gICAgICAgIGNvbG9yOiAjNzA3Qzg4O1xuICAgIH1cbiAgICAudmhzLXNpZGViYXItZXZlbnQtcGVuZGluZyAudmhzLXNpZGViYXItc3RhdHVzIHtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzcwN0M4ODtcbiAgICB9XG4gICAgLnZocy1zaWRlYmFyLWV2ZW50LXBhc3NlZCB7XG4gICAgICAgIGNvbG9yOiAjMkVBQURFO1xuICAgIH1cbiAgICAudmhzLXNpZGViYXItZXZlbnQtcGFzc2VkIC52aHMtc2lkZWJhci1zdGF0dXMge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMkVBQURFO1xuICAgIH1cbiAgICAudmhzLXNpZGViYXItZXZlbnQtZmFpbGVkIC52aHMtc2lkZWJhci1zdGF0dXMge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZWQ7XG4gICAgfVxuPC9zdHlsZT5gO1xuXG5jb25zdCBodG1sID0gYFxuICAgIDxkaXYgY2xhc3M9XCJ2aHMtc2lkZWJhclwiPlxuICAgICAgICAke3N0eWxlc31cbiAgICAgICAgPGRpdiBjbGFzcz1cInZocy1zaWRlYmFyLWhlYWRlclwiPlxuICAgICAgICAgICAgRXZlbnRzXG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwidmhzLXNpZGViYXItZXZlbnRzXCI+XG5cbiAgICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG5gO1xuXG5jb25zdCBnZXREZXRhaWxIVE1MID0gKGRhdGEsIHR5cGUpID0+IHtcbiAgICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgICBpZiAoIWRhdGEpIHJldHVybiBgYDtcbiAgICBpZiAodHlwZSA9PT0gJ2R1cmF0aW9uJykgZGF0YSA9IGAmIzEyODMzNzsgJHtkYXRhfWA7XG4gICAgcmV0dXJuIGA8c3BhbiBjbGFzcz1cInZocy1zaWRlYmFyLWV2ZW50LSR7dHlwZX1cIj4ke2RhdGF9PC9zcGFuPmA7XG59O1xuXG5jb25zdCBnZXROZXdFdmVudEhUTUwgPSAoe3R5cGUsIGR1cmF0aW9uLCBrZXksIGlkZW50aWZpZXIsIHN0YXR1c30pID0+IHtcbiAgICByZXR1cm4gYFxuICAgICAgICA8ZGl2IGNsYXNzPVwidmhzLXNpZGViYXItZXZlbnQgdmhzLXNpZGViYXItZXZlbnQtJHtzdGF0dXN9XCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInZocy1zaWRlYmFyLXN0YXR1c1wiPjwvc3Bhbj5cbiAgICAgICAgICAgICR7Z2V0RGV0YWlsSFRNTChpZGVudGlmaWVyLCAnaWRlbnRpZmllcicpfVxuICAgICAgICAgICAgJHtnZXREZXRhaWxIVE1MKGR1cmF0aW9uLCAnZHVyYXRpb24nKX1cblxuICAgICAgICAgICAgJHtnZXREZXRhaWxIVE1MKGtleSwgJ2tleScpfVxuICAgICAgICAgICAgJHtnZXREZXRhaWxIVE1MKHR5cGUsICd0eXBlJyl9XG4gICAgICAgIDwvZGl2PlxuICAgIGA7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzaG93LFxuICAgIHJlbmRlclxufVxuIiwiLyogTGliIHRvIGdldCB4cGF0aCBmb3IgYSBET00gbm9kZSAqL1xuY29uc3QgeHBhdGggPSByZXF1aXJlKCdzaW1wbGUteHBhdGgtcG9zaXRpb24nKTtcblxuLyogUG9seWZpbGwgZm9yIEFycmF5LnByb3RvdHlwZS5pbmNsdWRlcyAqL1xucmVxdWlyZSgnY29yZS1qcy9mbi9hcnJheS9pbmNsdWRlcycpO1xuXG5jb25zdCBjb250cm9scyA9IHJlcXVpcmUoJy4vY29udHJvbHMnKTtcbmNvbnN0IHNpZGViYXIgPSByZXF1aXJlKCcuL3NpZGViYXInKTtcbmNvbnN0IGJ1bmtlciA9IHJlcXVpcmUoJy4vYnVua2VyJyk7XG5cbi8qIFdoaXRlbGlzdCBvZiBET00gZXZlbnRzIHRoYXQgYXJlIHJlY29yZGVkICovXG5jb25zdCBldmVudFR5cGVzID0gWydjbGljaycsICdrZXlwcmVzcycsICdkYmxjbGljayddO1xuXG4vKiBIYWNreSBldmVudHMgKi9cbmNvbnN0IHNwZWNpYWxFdmVudFR5cGVzID0gWydrZXlkb3duJ107XG5cbmxldCBldmVudHMgPSBbXTtcblxuLyogQ3JlYXRlIGV2ZW50IGhhbmRsZXJzIGZvciBlYWNoIGV2ZW50IHR5cGUgLSBjYWxsIGByZWNvcmRgIGZ1bmN0aW9uICovXG5jb25zdCBnZXRFdmVudEhhbmRsZXJzID0gKCkgPT4ge1xuICAgIGxldCBoYW5kbGVycyA9IHt9O1xuICAgIGV2ZW50VHlwZXMubWFwKHR5cGUgPT4gaGFuZGxlcnNbdHlwZV0gPSByZWNvcmRFdmVudCk7XG4gICAgc3BlY2lhbEV2ZW50VHlwZXMubWFwKHR5cGUgPT4gaGFuZGxlcnNbdHlwZV0gPSByZWNvcmRFdmVudCk7XG4gICAgcmV0dXJuIGhhbmRsZXJzO1xufTtcblxuY29uc3Qgd3JhcEJvZHlJblJlY29yZGFibGUgPSAoKSA9PiB7XG4gICAgJCgnYm9keScpLndyYXBJbm5lcignPGRpdiBjbGFzcz1cInZocy1yZWNvcmRhYmxlXCI+PC9kaXY+Jylcbn07XG5cbmNvbnN0IGF0dGFjaEhhbmRsZXJzID0gKCkgPT4ge1xuICAgIGxldCBoYW5kbGVycyA9IGdldEV2ZW50SGFuZGxlcnMoKTtcbiAgICAkKCcudmhzLXJlY29yZGFibGUnKS5vbihoYW5kbGVycyk7XG59O1xuXG5jb25zdCBkZXRhY2hIYW5kbGVycyA9ICgpID0+IHtcbiAgICBsZXQgaGFuZGxlcnMgPSBnZXRFdmVudEhhbmRsZXJzKCk7XG4gICAgJCgnLnZocy1yZWNvcmRhYmxlJykub2ZmKGhhbmRsZXJzKTtcbn07XG5cbmNvbnN0IHJlY29yZEV2ZW50ID0gKGV2ZW50KSA9PiB7XG4gICAgLyogT25seSByZWNvcmQgd2hpdGVsaXN0ZWQgZXZlbnQgdHlwZXMgKi9cbiAgICBpZiAoIWV2ZW50VHlwZXMuaW5jbHVkZXMoZXZlbnQudHlwZSkpIHtcbiAgICAgICAgLyogU29tZSBldmVudHMgbGlrZSBrZXlkb3duIG5lZWQgc3BlY2lhbCB0cmVhdG1lbnQgKi9cbiAgICAgICAgaWYgKHNwZWNpYWxFdmVudFR5cGVzLmluY2x1ZGVzKGV2ZW50LnR5cGUpKSBoYW5kbGVIYWNrcyhldmVudCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIFdlIHdhbnQgdG8gZ2V0IHRoZSB4cGF0aCBvZiB0aGUgRE9NIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBEZXBlbmRpbmcgb24gdGhlIGludGVyZmFjZSwgdGhlIGVsZW1lbnQgbWlnaHQgb3JcbiAgICAgKiBtaWdodCBub3Qgc3RheSBpbiB0aGUgRE9NIHRyZWUgYWZ0ZXIgdGhlIGV2ZW50LlxuICAgICAqXG4gICAgICogV2UgbmVlZCB0byBoaWphY2sgdGhlIGV2ZW50LCBydW4gb3VyIGNvZGUgZmlyc3RcbiAgICAgKiBhbmQgdGhlbiBwbGF5IHRoZSBldmVudC5cbiAgICAgKi9cbiAgICBpZiAoZXZlbnQucHJldmVudERlZmF1bHQpIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAvKiBBZGRpbmcgYSB3YWl0IGJlZm9yZSBlYWNoIHVzZXIgZXZlbnQgKi9cbiAgICBldmVudHMucHVzaChnZXRXYWl0RXZlbnQoKSk7XG5cbiAgICBsZXQgc3ludGhldGljRXZlbnQgPSB7XG4gICAgICAgIHR5cGU6IGV2ZW50LnR5cGUsXG4gICAgICAgIHdoaWNoOiBldmVudC53aGljaCxcbiAgICAgICAgcGF0aDogeHBhdGguZnJvbU5vZGUoZXZlbnQudGFyZ2V0LCBkb2N1bWVudClcbiAgICB9O1xuICAgIGV2ZW50cy5wdXNoKHN5bnRoZXRpY0V2ZW50KTtcblxuICAgIGlmICghZXZlbnQuaGFja3kpIHBsYXlFdmVudChzeW50aGV0aWNFdmVudCk7XG59O1xuXG5jb25zdCBoYW5kbGVIYWNrcyA9IChldmVudCkgPT4ge1xuICAgIC8qIFRoZSBrZXlwcmVzcyBldmVudCBkb2VzIG5vdCBjYXRjaCBiYWNrIHNwYWNlIGtleSAqL1xuICAgIGlmIChldmVudC50eXBlID09PSAna2V5ZG93bicgJiYgZXZlbnQud2hpY2ggPT09IDgpIGJhY2tzcGFjZUhhY2soZXZlbnQpO1xufTtcblxuY29uc3QgYmFja3NwYWNlSGFjayA9ICh7d2hpY2gsIHRhcmdldH0pID0+IHtcbiAgICBsZXQgY3VzdG9tRXZlbnQgPSB7XG4gICAgICAgIHR5cGU6ICdrZXlwcmVzcycsXG4gICAgICAgIHdoaWNoLFxuICAgICAgICB0YXJnZXQsXG4gICAgICAgIGhhY2t5OiB0cnVlXG4gICAgfTtcbiAgICByZWNvcmRFdmVudChjdXN0b21FdmVudCk7XG59O1xuXG5sZXQgbGFzdEV2ZW50VGltZXN0YW1wO1xuY29uc3QgZ2V0V2FpdEV2ZW50ID0gKCkgPT4ge1xuICAgIGxldCBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICBsZXQgZXZlbnQgPSB7XG4gICAgICAgIHR5cGU6ICd3YWl0JyxcbiAgICAgICAgLyogUmV0dXJuIHRpbWUgc2luY2UgbGFzdCBldmVudCAqL1xuICAgICAgICBkdXJhdGlvbjogKG5vdyAtIGxhc3RFdmVudFRpbWVzdGFtcCkgfHwgMFxuICAgIH07XG5cbiAgICBsYXN0RXZlbnRUaW1lc3RhbXAgPSBub3c7XG4gICAgcmV0dXJuIGV2ZW50O1xufTtcblxuY29uc3QgZ2V0RWxlbWVudCA9IChwYXRoKSA9PiB7XG4gICAgcmV0dXJuIHhwYXRoLnRvTm9kZShwYXRoLCBkb2N1bWVudCk7XG59O1xuXG4vKiBQbGF5IGFuIGV2ZW50ICovXG5jb25zdCBwbGF5RXZlbnQgPSAoZXZlbnQpID0+IHtcbiAgICAvLyBUT0RPOiBTaW1wbGlmeSB0aGlzIGZ1bmN0aW9uIHdpdGggYXN5bmMtYXdhaXRcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgIC8qXG4gICAgICAgICAqIERvbid0IHdhbnQgc3ludGhldGljIGV2ZW50cyB0byBiZSByZWNvcmRlZCB3aGlsZSB3aGVuIHdlIHBsYXkgdGhlbS5cbiAgICAgICAgICogV2Ugd2lsbCBlbmQgdXAgaW4gYW4gaW5maW5pdGUgbG9vcCBvdGhlcndpc2VcbiAgICAgICAgKi9cbiAgICAgICAgc3RvcFJlY29yZGluZygpO1xuXG4gICAgICAgIC8qXG4gICAgICAgICogQWxsIGV2ZW50cyByZXR1cm4gYSBwcm9taXNlIHdoaWNoIGlzIHJlc29sdmVkIGFmdGVyXG4gICAgICAgICogdGhlIGV2ZW50IGlzIGNvbXBsZXRlZC4gVXNlZnVsIGZvciB3YWl0IGV2ZW50c1xuICAgICAgICAqL1xuICAgICAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBsZXQgdHlwZSA9IGV2ZW50LnR5cGU7XG4gICAgICAgICAgICAvLyBUT0RPOiBDcmVhdGUgYW4gZXZlbnQgbWFwIGZvciBldmVudHNcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAnY2xpY2snKSBjbGljayhldmVudCwgcmVzb2x2ZSk7XG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ2RibGNsaWNrJykgZGJsY2xpY2soZXZlbnQsIHJlc29sdmUpO1xuICAgICAgICAgICAgZWxzZSBpZiAodHlwZSA9PT0gJ2tleXByZXNzJykga2V5cHJlc3MoZXZlbnQsIHJlc29sdmUpO1xuICAgICAgICAgICAgZWxzZSBpZiAodHlwZSA9PT0gJ3dhaXQnKSB3YWl0KGV2ZW50LCByZXNvbHZlKTtcbiAgICAgICAgICAgIGVsc2UgcmVqZWN0KG5ldyBFcnJvcignVW5rbm93biBldmVudCB0eXBlLiBDb3VsZCBub3QgcGxheScpKTtcbiAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvKiBSZS1hdHRhY2ggaGFuZGxlcnMgYWZ0ZXIgZXZlbnQgaXMgcGxheWVkICovXG4gICAgICAgICAgICByZXN1bWVSZWNvcmRpbmcoKTsgLy9UT0RPOiBEb24ndCBhdHRhY2ggaW4gcGxheWJhY2sgbW9kZVxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5cbi8qXG4gKiBTaW11bGF0ZSBldmVudHNcbiAqIEVhY2ggaGFuZGxlciBnZXRzIHRoZSBldmVudCBvYmplY3RcbiAqIGFuZCB0aGUgcmVzb2x2ZSBmdW5jdGlvbiBmb3IgaXQncyBwcm9taXNlXG4gKiByZXNvbHZlKCkgbXVzdCBiZSBjYWxsZWQgYXQgdGhlIGVuZCBvZiB0aGUgZnVuY3Rpb25cbiAqL1xuXG5jb25zdCBjbGljayA9ICh7cGF0aH0sIHJlc29sdmUpID0+IHtcbiAgICBsZXQgZWxlbWVudCA9IGdldEVsZW1lbnQocGF0aCk7XG4gICAgJChlbGVtZW50KS50cmlnZ2VyKCdjbGljaycpO1xuICAgIHJlc29sdmUoKTtcbn07XG5cbmNvbnN0IGRibGNsaWNrID0gKHtwYXRofSwgcmVzb2x2ZSkgPT4ge1xuICAgIGxldCBlbGVtZW50ID0gZ2V0RWxlbWVudChwYXRoKTtcbiAgICAkKGVsZW1lbnQpLnRyaWdnZXIoJ2RibGNsaWNrJyk7XG4gICAgcmVzb2x2ZSgpO1xufTtcblxuY29uc3Qga2V5cHJlc3MgPSAoe3BhdGgsIHdoaWNofSxyZXNvbHZlKSA9PiB7XG4gICAgbGV0IGVsZW1lbnQgPSBnZXRFbGVtZW50KHBhdGgpO1xuICAgIGxldCBjdXJyZW50VmFsdWUgPSAkKGVsZW1lbnQpLnZhbCgpO1xuICAgIGlmICh3aGljaCA9PT0gOCkge1xuICAgICAgICAvKiBNYW51YWxseSBoYW5kbGUgYmFja3NwYWNlICovXG4gICAgICAgICQoZWxlbWVudCkudmFsKGN1cnJlbnRWYWx1ZS5zdWJzdHJpbmcoMCwgY3VycmVudFZhbHVlLmxlbmd0aC0xKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGtleSA9IFN0cmluZy5mcm9tQ2hhckNvZGUod2hpY2gpO1xuICAgICAgICAvKiBNYW51YWxseSBhZGQgY2hhcmFjaHRlciAqL1xuICAgICAgICAkKGVsZW1lbnQpLnZhbChjdXJyZW50VmFsdWUgKyBrZXkpO1xuICAgIH1cbiAgICAvKiBUcmlnZ2VyIGV2ZW50ICovXG4gICAgJChlbGVtZW50KS50cmlnZ2VyKGpRdWVyeS5FdmVudCgna2V5ZG93bicsIHt3aGljaH0pKTtcbiAgICAkKGVsZW1lbnQpLnRyaWdnZXIoalF1ZXJ5LkV2ZW50KCdrZXl1cCcsIHt3aGljaH0pKTtcbiAgICByZXNvbHZlKCk7XG59O1xuXG5jb25zdCB3YWl0ID0gKHtkdXJhdGlvbn0sIHJlc29sdmUpID0+IHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHJlc29sdmUoKSwgZHVyYXRpb24pO1xufTtcblxuLyogUGxheSBhbGwgcmVjb3JkZWQgZXZlbnRzICovXG5jb25zdCBwbGF5ID0gKCkgPT4ge1xuICAgIGNvbnRyb2xzLnRvZ2dsZVBsYXlpbmdTdGF0ZSgpO1xuICAgIHBsYXlFdmVudHNSZWN1cnNpdmVseSgwKTtcbn1cblxuY29uc3Qgc2V0dXBQbGF5YmFjayA9ICgpID0+IHtcbiAgICBpZiAoaXNSZWNvcmRpbmcpIHRvZ2dsZVJlY29yZGluZygpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd2aHMtcGxheWJhY2snLCB0cnVlKTtcbiAgICBsb2NhdGlvbi5yZWxvYWQoKTtcbn07XG5zaWRlYmFyLnNob3coKTtcbmNvbnN0IGluaXRQbGF5YmFjayA9ICgpID0+IHtcbiAgICBldmVudHMgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd2aHMnKSkuZXZlbnRzO1xuICAgIHNpZGViYXIuc2hvdygpO1xuICAgIHNpZGViYXIucmVuZGVyKGV2ZW50cyk7XG4gICAgcGxheSgpO1xuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd2aHMtcGxheWJhY2snKTtcbn07XG5cbmNvbnN0IHBsYXlFdmVudHNSZWN1cnNpdmVseSA9IChpbmRleCkgPT4ge1xuICAgIGlmICghZXZlbnRzW2luZGV4XSkge1xuICAgICAgICBjb250cm9scy50b2dnbGVQbGF5aW5nU3RhdGUoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvKlxuICAgICAqIEl0J3MgdXNlZnVsIHRvIHJlLXJlbmRlciB0aGUgc2lkZWJhciBiZWNhdXNlXG4gICAgICogdGhlIGVsZW1lbnQgaW4gYW4gZXZlbnQgbWlnaHQgb25seSBlbnRlciB0aGUgRE9NXG4gICAgICogYWZ0ZXIgaXQncyBwcmV2aW91cyBldmVudC5cbiAgICAgKiBQYXNzaW5nIGxhc3QgZXZlbnQgaW5kZXggZm9yIG1hcmtpbmcgcHJvZ3Jlc3NcbiAgICAgKi9cbiAgICBzaWRlYmFyLnJlbmRlcihldmVudHMsIGluZGV4KTtcblxuICAgIC8qIFBsYXkgZXZlbnQgKi9cbiAgICBwbGF5RXZlbnQoZXZlbnRzW2luZGV4XSkudGhlbigoKSA9PiBwbGF5RXZlbnRzUmVjdXJzaXZlbHkoKytpbmRleCkpO1xufTtcblxubGV0IGlzUmVjb3JkaW5nID0gZmFsc2U7XG5jb25zdCB0b2dnbGVSZWNvcmRpbmcgPSAoKSA9PiB7XG4gICAgaWYgKGlzUmVjb3JkaW5nKSB7XG4gICAgICAgIHN0b3BSZWNvcmRpbmcoKVxuICAgICAgICBidW5rZXIuc3RvcmVUYXBlKGV2ZW50cyk7XG4gICAgfVxuXG4gICAgZWxzZSByZWNvcmQoKTtcbiAgICBjb250cm9scy50b2dnbGVSZWNvcmRpbmdTdGF0ZSgpO1xufTtcblxuY29uc3QgcmVjb3JkID0gKCkgPT4ge1xuICAgIGV2ZW50cyA9IFtdO1xuICAgIHJlc3VtZVJlY29yZGluZygpO1xufTtcblxuY29uc3Qgc3RvcFJlY29yZGluZyA9ICgpID0+IHtcbiAgICBkZXRhY2hIYW5kbGVycygpO1xuICAgIGlzUmVjb3JkaW5nID0gZmFsc2U7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3ZocycsIEpTT04uc3RyaW5naWZ5KHtldmVudHN9KSk7XG59O1xuXG5jb25zdCByZXN1bWVSZWNvcmRpbmcgPSAoKSA9PiB7XG4gICAgYXR0YWNoSGFuZGxlcnMoKTtcbiAgICBpc1JlY29yZGluZyA9IHRydWU7XG59O1xuXG4kKCgpID0+IHtcbiAgICAvKiBFeHBvc2UgcHVibGljIGZ1bmN0aW9ucyAqL1xuICAgIHdpbmRvdy52aHMgPSB7XG4gICAgICAgIGV2ZW50cyxcbiAgICAgICAgdG9nZ2xlUmVjb3JkaW5nLFxuICAgICAgICBzZXR1cFBsYXliYWNrXG4gICAgfVxuICAgIHdyYXBCb2R5SW5SZWNvcmRhYmxlKCk7XG4gICAgY29udHJvbHMuc2hvdygpO1xuXG4gICAgbGV0IHBsYXliYWNrID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Zocy1wbGF5YmFjaycpO1xuICAgIGlmIChwbGF5YmFjaykgaW5pdFBsYXliYWNrKCk7XG59KTtcbiJdfQ==
