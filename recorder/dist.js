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

},{"get-size":35,"unidragger":39}],33:[function(require,module,exports){
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

},{}],34:[function(require,module,exports){

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

},{}],35:[function(require,module,exports){
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

},{}],36:[function(require,module,exports){
module.exports = require('./lib/xpath')

},{"./lib/xpath":38}],37:[function(require,module,exports){
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

},{}],38:[function(require,module,exports){
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

},{"./dom-exception":37,"get-document":34}],39:[function(require,module,exports){
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

},{"unipointer":40}],40:[function(require,module,exports){
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

},{"ev-emitter":33}],41:[function(require,module,exports){
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

},{}],42:[function(require,module,exports){
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

},{"draggabilly":32}],43:[function(require,module,exports){
'use strict';

var xpath = require('simple-xpath-position');
var visible = require('withinviewport');
window.visble = visible;

var show = function show() {
    $('body').append(html);
};

var render = function render(events, lastEventIndex) {
    $('.vhs-sidebar-events').empty();
    for (var i = 0; i < events.length; i++) {
        addEvent(events[i], i <= lastEventIndex);
    }followLogs();
};

var followLogs = function followLogs() {
    var latestPassedTest = $('.vhs-sidebar-status-passed').last();
    if (!latestPassedTest.length) return;

    if (!visible(latestPassedTest)) {
        var scrollTop = $('.vhs-sidebar').scrollTop();
        $('.vhs-sidebar').stop().animate({
            scrollTop: scrollTop + 500
        });
    }
};

var addEvent = function addEvent(event, passed) {
    event.passed = passed;
    if (event.type === 'wait' && event.duration < 100) return;
    event.identifier = getPrettyIdentifier(event.path);
    if (event.which === 1) delete event.key; // click event
    else if (event.which === 13) event.key = '↵';else if (event.which === 8) event.key = '←';else if (event.which === 32) event.key = '_'; //proxy for space
        else if (event.which) event.key = String.fromCharCode(event.which);

    $('.vhs-sidebar-events').append(getNewEventHTML(event));
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

var styles = '<style>\n    .vhs-sidebar {\n        position: absolute;\n        top: 0;\n        right: 0;\n        width: 250px;\n        height: 100%;\n        z-index: 999;\n        background: #FFF;\n        border-left: 1px solid #DDD;\n        overflow-y: auto;\n    }\n    .vhs-sidebar-event {\n        overflow: hidden;\n        border-bottom: 1px solid #DDD;\n        padding: 10px;\n    }\n    .vhs-sidebar-event-type, .vhs-sidebar-event-key {\n        float: right;\n    }\n    .vhs-sidebar-event-key {\n        color: #D2426E;\n        background: #F7F7F9;\n        border: 1px solid #DDD;\n        border-radius: 3px;\n        padding: 0 3px;\n        margin-left: 5px;\n        display: inline;\n    }\n    .vhs-sidebar-status {\n        display: inline-block;\n        width: 7.5px;\n        height: 7.5px;\n        border-radius: 50%;\n        margin: 2px 5px;\n    }\n    .vhs-sidebar-status-pending {\n        background-color: orange;\n    }\n    .vhs-sidebar-status-passed {\n        background-color: green;\n    }\n    .vhs-sidebar-status-failed {\n        background-color: red;\n    }\n</style>';

var html = '\n    <div class="vhs-sidebar">\n        ' + styles + '\n        <div class="vhs-sidebar-events">\n\n        </div>\n    </div>\n';

var getStatusHTML = function getStatusHTML(passed) {
    var status = 'pending';
    if (passed) status = 'passed';
    return '<span class="vhs-sidebar-status vhs-sidebar-status-' + status + '"></span>';
};

var getDetailHTML = function getDetailHTML(data, type) {
    if (!data) return '';
    if (type === 'duration') data = '&#128337; ' + data;
    return '<span class="vhs-sidebar-event-' + type + '">' + data + '</span>';
};

var getNewEventHTML = function getNewEventHTML(_ref) {
    var type = _ref.type,
        duration = _ref.duration,
        key = _ref.key,
        identifier = _ref.identifier,
        passed = _ref.passed;

    return '\n        <div class="vhs-sidebar-event">\n            ' + getStatusHTML(passed) + '\n            ' + getDetailHTML(identifier, 'path') + '\n            ' + getDetailHTML(duration, 'duration') + '\n\n            ' + getDetailHTML(key, 'key') + '\n            ' + getDetailHTML(type, 'type') + '\n        </div>\n    ';
};

module.exports = {
    show: show,
    render: render
};

},{"simple-xpath-position":36,"withinviewport":41}],44:[function(require,module,exports){
'use strict';

/* Lib to get xpath for a DOM node */
var xpath = require('simple-xpath-position');

/* Polyfill for Array.prototype.includes */
require('core-js/fn/array/includes');

var controls = require('./controls');
var sidebar = require('./sidebar');

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
    if (isRecording) stopRecording();else record();
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

},{"./controls":42,"./sidebar":43,"core-js/fn/array/includes":1,"simple-xpath-position":36}]},{},[44])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9mbi9hcnJheS9pbmNsdWRlcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2EtZnVuY3Rpb24uanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hZGQtdG8tdW5zY29wYWJsZXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hbi1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hcnJheS1pbmNsdWRlcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2NvZi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2NvcmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jdHguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19kZWZpbmVkLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZGVzY3JpcHRvcnMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19kb20tY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZXhwb3J0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZmFpbHMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19nbG9iYWwuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19oYXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19oaWRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faWU4LWRvbS1kZWZpbmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faXMtb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWRwLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fcHJvcGVydHktZGVzYy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3JlZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fc2hhcmVkLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8taW5kZXguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1pbnRlZ2VyLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8taW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3RvLWxlbmd0aC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3RvLXByaW1pdGl2ZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3VpZC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3drcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3LmFycmF5LmluY2x1ZGVzLmpzIiwibm9kZV9tb2R1bGVzL2RyYWdnYWJpbGx5L2RyYWdnYWJpbGx5LmpzIiwibm9kZV9tb2R1bGVzL2V2LWVtaXR0ZXIvZXYtZW1pdHRlci5qcyIsIm5vZGVfbW9kdWxlcy9nZXQtZG9jdW1lbnQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZ2V0LXNpemUvZ2V0LXNpemUuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXhwYXRoLXBvc2l0aW9uL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS14cGF0aC1wb3NpdGlvbi9zcmMvZG9tLWV4Y2VwdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUteHBhdGgtcG9zaXRpb24vc3JjL3hwYXRoLmpzIiwibm9kZV9tb2R1bGVzL3VuaWRyYWdnZXIvdW5pZHJhZ2dlci5qcyIsIm5vZGVfbW9kdWxlcy91bmlwb2ludGVyL3VuaXBvaW50ZXIuanMiLCJub2RlX21vZHVsZXMvd2l0aGludmlld3BvcnQvd2l0aGludmlld3BvcnQuanMiLCJzcmMvY29udHJvbHMuanMiLCJzcmMvc2lkZWJhci5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1ZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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O0FBQ0Q7OztBQ2xKRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9TQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QThCO0FBQUEsZUFBTSxzQkFBc0IsRUFBRSxLQUF4QixDQUFOO0FBQUEsS0FBOUI7QUFDSCxDQWZEOztBQWlCQSxJQUFJLGNBQWMsS0FBbEI7QUFDQSxJQUFNLGtCQUFrQixTQUFsQixlQUFrQixHQUFNO0FBQzFCLFFBQUksV0FBSixFQUFpQixnQkFBakIsS0FDSztBQUNMLGFBQVMsb0JBQVQ7QUFDSCxDQUpEOztBQU1BLElBQU0sU0FBUyxTQUFULE1BQVMsR0FBTTtBQUNqQixhQUFTLEVBQVQ7QUFDQTtBQUNILENBSEQ7O0FBS0EsSUFBTSxnQkFBZ0IsU0FBaEIsYUFBZ0IsR0FBTTtBQUN4QjtBQUNBLGtCQUFjLEtBQWQ7QUFDQSxpQkFBYSxPQUFiLENBQXFCLEtBQXJCLEVBQTRCLEtBQUssU0FBTCxDQUFlLEVBQUMsY0FBRCxFQUFmLENBQTVCO0FBQ0gsQ0FKRDs7QUFNQSxJQUFNLGtCQUFrQixTQUFsQixlQUFrQixHQUFNO0FBQzFCO0FBQ0Esa0JBQWMsSUFBZDtBQUNILENBSEQ7O0FBS0EsRUFBRSxZQUFNO0FBQ0o7QUFDQSxXQUFPLEdBQVAsR0FBYTtBQUNULHNCQURTO0FBRVQsd0NBRlM7QUFHVDtBQUhTLEtBQWI7QUFLQTtBQUNBLGFBQVMsSUFBVDs7QUFFQSxRQUFJLFdBQVcsYUFBYSxPQUFiLENBQXFCLGNBQXJCLENBQWY7QUFDQSxRQUFJLFFBQUosRUFBYztBQUNqQixDQVpEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM3LmFycmF5LmluY2x1ZGVzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX2NvcmUnKS5BcnJheS5pbmNsdWRlczsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYodHlwZW9mIGl0ICE9ICdmdW5jdGlvbicpdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYSBmdW5jdGlvbiEnKTtcbiAgcmV0dXJuIGl0O1xufTsiLCIvLyAyMi4xLjMuMzEgQXJyYXkucHJvdG90eXBlW0BAdW5zY29wYWJsZXNdXG52YXIgVU5TQ09QQUJMRVMgPSByZXF1aXJlKCcuL193a3MnKSgndW5zY29wYWJsZXMnKVxuICAsIEFycmF5UHJvdG8gID0gQXJyYXkucHJvdG90eXBlO1xuaWYoQXJyYXlQcm90b1tVTlNDT1BBQkxFU10gPT0gdW5kZWZpbmVkKXJlcXVpcmUoJy4vX2hpZGUnKShBcnJheVByb3RvLCBVTlNDT1BBQkxFUywge30pO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihrZXkpe1xuICBBcnJheVByb3RvW1VOU0NPUEFCTEVTXVtrZXldID0gdHJ1ZTtcbn07IiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYoIWlzT2JqZWN0KGl0KSl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhbiBvYmplY3QhJyk7XG4gIHJldHVybiBpdDtcbn07IiwiLy8gZmFsc2UgLT4gQXJyYXkjaW5kZXhPZlxuLy8gdHJ1ZSAgLT4gQXJyYXkjaW5jbHVkZXNcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0JylcbiAgLCB0b0xlbmd0aCAgPSByZXF1aXJlKCcuL190by1sZW5ndGgnKVxuICAsIHRvSW5kZXggICA9IHJlcXVpcmUoJy4vX3RvLWluZGV4Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKElTX0lOQ0xVREVTKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKCR0aGlzLCBlbCwgZnJvbUluZGV4KXtcbiAgICB2YXIgTyAgICAgID0gdG9JT2JqZWN0KCR0aGlzKVxuICAgICAgLCBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aClcbiAgICAgICwgaW5kZXggID0gdG9JbmRleChmcm9tSW5kZXgsIGxlbmd0aClcbiAgICAgICwgdmFsdWU7XG4gICAgLy8gQXJyYXkjaW5jbHVkZXMgdXNlcyBTYW1lVmFsdWVaZXJvIGVxdWFsaXR5IGFsZ29yaXRobVxuICAgIGlmKElTX0lOQ0xVREVTICYmIGVsICE9IGVsKXdoaWxlKGxlbmd0aCA+IGluZGV4KXtcbiAgICAgIHZhbHVlID0gT1tpbmRleCsrXTtcbiAgICAgIGlmKHZhbHVlICE9IHZhbHVlKXJldHVybiB0cnVlO1xuICAgIC8vIEFycmF5I3RvSW5kZXggaWdub3JlcyBob2xlcywgQXJyYXkjaW5jbHVkZXMgLSBub3RcbiAgICB9IGVsc2UgZm9yKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKylpZihJU19JTkNMVURFUyB8fCBpbmRleCBpbiBPKXtcbiAgICAgIGlmKE9baW5kZXhdID09PSBlbClyZXR1cm4gSVNfSU5DTFVERVMgfHwgaW5kZXggfHwgMDtcbiAgICB9IHJldHVybiAhSVNfSU5DTFVERVMgJiYgLTE7XG4gIH07XG59OyIsInZhciB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoaXQpLnNsaWNlKDgsIC0xKTtcbn07IiwidmFyIGNvcmUgPSBtb2R1bGUuZXhwb3J0cyA9IHt2ZXJzaW9uOiAnMi40LjAnfTtcbmlmKHR5cGVvZiBfX2UgPT0gJ251bWJlcicpX19lID0gY29yZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZiIsIi8vIG9wdGlvbmFsIC8gc2ltcGxlIGNvbnRleHQgYmluZGluZ1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4vX2EtZnVuY3Rpb24nKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZm4sIHRoYXQsIGxlbmd0aCl7XG4gIGFGdW5jdGlvbihmbik7XG4gIGlmKHRoYXQgPT09IHVuZGVmaW5lZClyZXR1cm4gZm47XG4gIHN3aXRjaChsZW5ndGgpe1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uKGEpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSk7XG4gICAgfTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbihhLCBiKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIpO1xuICAgIH07XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24oYSwgYiwgYyl7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiLCBjKTtcbiAgICB9O1xuICB9XG4gIHJldHVybiBmdW5jdGlvbigvKiAuLi5hcmdzICovKXtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcbiAgfTtcbn07IiwiLy8gNy4yLjEgUmVxdWlyZU9iamVjdENvZXJjaWJsZShhcmd1bWVudClcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZihpdCA9PSB1bmRlZmluZWQpdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY2FsbCBtZXRob2Qgb24gIFwiICsgaXQpO1xuICByZXR1cm4gaXQ7XG59OyIsIi8vIFRoYW5rJ3MgSUU4IGZvciBoaXMgZnVubnkgZGVmaW5lUHJvcGVydHlcbm1vZHVsZS5leHBvcnRzID0gIXJlcXVpcmUoJy4vX2ZhaWxzJykoZnVuY3Rpb24oKXtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ2EnLCB7Z2V0OiBmdW5jdGlvbigpeyByZXR1cm4gNzsgfX0pLmEgIT0gNztcbn0pOyIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpXG4gICwgZG9jdW1lbnQgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5kb2N1bWVudFxuICAvLyBpbiBvbGQgSUUgdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgaXMgJ29iamVjdCdcbiAgLCBpcyA9IGlzT2JqZWN0KGRvY3VtZW50KSAmJiBpc09iamVjdChkb2N1bWVudC5jcmVhdGVFbGVtZW50KTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXMgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGl0KSA6IHt9O1xufTsiLCJ2YXIgZ2xvYmFsICAgID0gcmVxdWlyZSgnLi9fZ2xvYmFsJylcbiAgLCBjb3JlICAgICAgPSByZXF1aXJlKCcuL19jb3JlJylcbiAgLCBoaWRlICAgICAgPSByZXF1aXJlKCcuL19oaWRlJylcbiAgLCByZWRlZmluZSAgPSByZXF1aXJlKCcuL19yZWRlZmluZScpXG4gICwgY3R4ICAgICAgID0gcmVxdWlyZSgnLi9fY3R4JylcbiAgLCBQUk9UT1RZUEUgPSAncHJvdG90eXBlJztcblxudmFyICRleHBvcnQgPSBmdW5jdGlvbih0eXBlLCBuYW1lLCBzb3VyY2Upe1xuICB2YXIgSVNfRk9SQ0VEID0gdHlwZSAmICRleHBvcnQuRlxuICAgICwgSVNfR0xPQkFMID0gdHlwZSAmICRleHBvcnQuR1xuICAgICwgSVNfU1RBVElDID0gdHlwZSAmICRleHBvcnQuU1xuICAgICwgSVNfUFJPVE8gID0gdHlwZSAmICRleHBvcnQuUFxuICAgICwgSVNfQklORCAgID0gdHlwZSAmICRleHBvcnQuQlxuICAgICwgdGFyZ2V0ICAgID0gSVNfR0xPQkFMID8gZ2xvYmFsIDogSVNfU1RBVElDID8gZ2xvYmFsW25hbWVdIHx8IChnbG9iYWxbbmFtZV0gPSB7fSkgOiAoZ2xvYmFsW25hbWVdIHx8IHt9KVtQUk9UT1RZUEVdXG4gICAgLCBleHBvcnRzICAgPSBJU19HTE9CQUwgPyBjb3JlIDogY29yZVtuYW1lXSB8fCAoY29yZVtuYW1lXSA9IHt9KVxuICAgICwgZXhwUHJvdG8gID0gZXhwb3J0c1tQUk9UT1RZUEVdIHx8IChleHBvcnRzW1BST1RPVFlQRV0gPSB7fSlcbiAgICAsIGtleSwgb3duLCBvdXQsIGV4cDtcbiAgaWYoSVNfR0xPQkFMKXNvdXJjZSA9IG5hbWU7XG4gIGZvcihrZXkgaW4gc291cmNlKXtcbiAgICAvLyBjb250YWlucyBpbiBuYXRpdmVcbiAgICBvd24gPSAhSVNfRk9SQ0VEICYmIHRhcmdldCAmJiB0YXJnZXRba2V5XSAhPT0gdW5kZWZpbmVkO1xuICAgIC8vIGV4cG9ydCBuYXRpdmUgb3IgcGFzc2VkXG4gICAgb3V0ID0gKG93biA/IHRhcmdldCA6IHNvdXJjZSlba2V5XTtcbiAgICAvLyBiaW5kIHRpbWVycyB0byBnbG9iYWwgZm9yIGNhbGwgZnJvbSBleHBvcnQgY29udGV4dFxuICAgIGV4cCA9IElTX0JJTkQgJiYgb3duID8gY3R4KG91dCwgZ2xvYmFsKSA6IElTX1BST1RPICYmIHR5cGVvZiBvdXQgPT0gJ2Z1bmN0aW9uJyA/IGN0eChGdW5jdGlvbi5jYWxsLCBvdXQpIDogb3V0O1xuICAgIC8vIGV4dGVuZCBnbG9iYWxcbiAgICBpZih0YXJnZXQpcmVkZWZpbmUodGFyZ2V0LCBrZXksIG91dCwgdHlwZSAmICRleHBvcnQuVSk7XG4gICAgLy8gZXhwb3J0XG4gICAgaWYoZXhwb3J0c1trZXldICE9IG91dCloaWRlKGV4cG9ydHMsIGtleSwgZXhwKTtcbiAgICBpZihJU19QUk9UTyAmJiBleHBQcm90b1trZXldICE9IG91dClleHBQcm90b1trZXldID0gb3V0O1xuICB9XG59O1xuZ2xvYmFsLmNvcmUgPSBjb3JlO1xuLy8gdHlwZSBiaXRtYXBcbiRleHBvcnQuRiA9IDE7ICAgLy8gZm9yY2VkXG4kZXhwb3J0LkcgPSAyOyAgIC8vIGdsb2JhbFxuJGV4cG9ydC5TID0gNDsgICAvLyBzdGF0aWNcbiRleHBvcnQuUCA9IDg7ICAgLy8gcHJvdG9cbiRleHBvcnQuQiA9IDE2OyAgLy8gYmluZFxuJGV4cG9ydC5XID0gMzI7ICAvLyB3cmFwXG4kZXhwb3J0LlUgPSA2NDsgIC8vIHNhZmVcbiRleHBvcnQuUiA9IDEyODsgLy8gcmVhbCBwcm90byBtZXRob2QgZm9yIGBsaWJyYXJ5YCBcbm1vZHVsZS5leHBvcnRzID0gJGV4cG9ydDsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGV4ZWMpe1xuICB0cnkge1xuICAgIHJldHVybiAhIWV4ZWMoKTtcbiAgfSBjYXRjaChlKXtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTsiLCIvLyBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qcy9pc3N1ZXMvODYjaXNzdWVjb21tZW50LTExNTc1OTAyOFxudmFyIGdsb2JhbCA9IG1vZHVsZS5leHBvcnRzID0gdHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuTWF0aCA9PSBNYXRoXG4gID8gd2luZG93IDogdHlwZW9mIHNlbGYgIT0gJ3VuZGVmaW5lZCcgJiYgc2VsZi5NYXRoID09IE1hdGggPyBzZWxmIDogRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbmlmKHR5cGVvZiBfX2cgPT0gJ251bWJlcicpX19nID0gZ2xvYmFsOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmIiwidmFyIGhhc093blByb3BlcnR5ID0ge30uaGFzT3duUHJvcGVydHk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0LCBrZXkpe1xuICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChpdCwga2V5KTtcbn07IiwidmFyIGRQICAgICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKVxuICAsIGNyZWF0ZURlc2MgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBmdW5jdGlvbihvYmplY3QsIGtleSwgdmFsdWUpe1xuICByZXR1cm4gZFAuZihvYmplY3QsIGtleSwgY3JlYXRlRGVzYygxLCB2YWx1ZSkpO1xufSA6IGZ1bmN0aW9uKG9iamVjdCwga2V5LCB2YWx1ZSl7XG4gIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIHJldHVybiBvYmplY3Q7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gIXJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgJiYgIXJlcXVpcmUoJy4vX2ZhaWxzJykoZnVuY3Rpb24oKXtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShyZXF1aXJlKCcuL19kb20tY3JlYXRlJykoJ2RpdicpLCAnYScsIHtnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiA3OyB9fSkuYSAhPSA3O1xufSk7IiwiLy8gZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBhbmQgbm9uLWVudW1lcmFibGUgb2xkIFY4IHN0cmluZ3NcbnZhciBjb2YgPSByZXF1aXJlKCcuL19jb2YnKTtcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0KCd6JykucHJvcGVydHlJc0VudW1lcmFibGUoMCkgPyBPYmplY3QgOiBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBjb2YoaXQpID09ICdTdHJpbmcnID8gaXQuc3BsaXQoJycpIDogT2JqZWN0KGl0KTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiB0eXBlb2YgaXQgPT09ICdvYmplY3QnID8gaXQgIT09IG51bGwgOiB0eXBlb2YgaXQgPT09ICdmdW5jdGlvbic7XG59OyIsInZhciBhbk9iamVjdCAgICAgICA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpXG4gICwgSUU4X0RPTV9ERUZJTkUgPSByZXF1aXJlKCcuL19pZTgtZG9tLWRlZmluZScpXG4gICwgdG9QcmltaXRpdmUgICAgPSByZXF1aXJlKCcuL190by1wcmltaXRpdmUnKVxuICAsIGRQICAgICAgICAgICAgID0gT2JqZWN0LmRlZmluZVByb3BlcnR5O1xuXG5leHBvcnRzLmYgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gT2JqZWN0LmRlZmluZVByb3BlcnR5IDogZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcyl7XG4gIGFuT2JqZWN0KE8pO1xuICBQID0gdG9QcmltaXRpdmUoUCwgdHJ1ZSk7XG4gIGFuT2JqZWN0KEF0dHJpYnV0ZXMpO1xuICBpZihJRThfRE9NX0RFRklORSl0cnkge1xuICAgIHJldHVybiBkUChPLCBQLCBBdHRyaWJ1dGVzKTtcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuICBpZignZ2V0JyBpbiBBdHRyaWJ1dGVzIHx8ICdzZXQnIGluIEF0dHJpYnV0ZXMpdGhyb3cgVHlwZUVycm9yKCdBY2Nlc3NvcnMgbm90IHN1cHBvcnRlZCEnKTtcbiAgaWYoJ3ZhbHVlJyBpbiBBdHRyaWJ1dGVzKU9bUF0gPSBBdHRyaWJ1dGVzLnZhbHVlO1xuICByZXR1cm4gTztcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihiaXRtYXAsIHZhbHVlKXtcbiAgcmV0dXJuIHtcbiAgICBlbnVtZXJhYmxlICA6ICEoYml0bWFwICYgMSksXG4gICAgY29uZmlndXJhYmxlOiAhKGJpdG1hcCAmIDIpLFxuICAgIHdyaXRhYmxlICAgIDogIShiaXRtYXAgJiA0KSxcbiAgICB2YWx1ZSAgICAgICA6IHZhbHVlXG4gIH07XG59OyIsInZhciBnbG9iYWwgICAgPSByZXF1aXJlKCcuL19nbG9iYWwnKVxuICAsIGhpZGUgICAgICA9IHJlcXVpcmUoJy4vX2hpZGUnKVxuICAsIGhhcyAgICAgICA9IHJlcXVpcmUoJy4vX2hhcycpXG4gICwgU1JDICAgICAgID0gcmVxdWlyZSgnLi9fdWlkJykoJ3NyYycpXG4gICwgVE9fU1RSSU5HID0gJ3RvU3RyaW5nJ1xuICAsICR0b1N0cmluZyA9IEZ1bmN0aW9uW1RPX1NUUklOR11cbiAgLCBUUEwgICAgICAgPSAoJycgKyAkdG9TdHJpbmcpLnNwbGl0KFRPX1NUUklORyk7XG5cbnJlcXVpcmUoJy4vX2NvcmUnKS5pbnNwZWN0U291cmNlID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gJHRvU3RyaW5nLmNhbGwoaXQpO1xufTtcblxuKG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oTywga2V5LCB2YWwsIHNhZmUpe1xuICB2YXIgaXNGdW5jdGlvbiA9IHR5cGVvZiB2YWwgPT0gJ2Z1bmN0aW9uJztcbiAgaWYoaXNGdW5jdGlvbiloYXModmFsLCAnbmFtZScpIHx8IGhpZGUodmFsLCAnbmFtZScsIGtleSk7XG4gIGlmKE9ba2V5XSA9PT0gdmFsKXJldHVybjtcbiAgaWYoaXNGdW5jdGlvbiloYXModmFsLCBTUkMpIHx8IGhpZGUodmFsLCBTUkMsIE9ba2V5XSA/ICcnICsgT1trZXldIDogVFBMLmpvaW4oU3RyaW5nKGtleSkpKTtcbiAgaWYoTyA9PT0gZ2xvYmFsKXtcbiAgICBPW2tleV0gPSB2YWw7XG4gIH0gZWxzZSB7XG4gICAgaWYoIXNhZmUpe1xuICAgICAgZGVsZXRlIE9ba2V5XTtcbiAgICAgIGhpZGUoTywga2V5LCB2YWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZihPW2tleV0pT1trZXldID0gdmFsO1xuICAgICAgZWxzZSBoaWRlKE8sIGtleSwgdmFsKTtcbiAgICB9XG4gIH1cbi8vIGFkZCBmYWtlIEZ1bmN0aW9uI3RvU3RyaW5nIGZvciBjb3JyZWN0IHdvcmsgd3JhcHBlZCBtZXRob2RzIC8gY29uc3RydWN0b3JzIHdpdGggbWV0aG9kcyBsaWtlIExvRGFzaCBpc05hdGl2ZVxufSkoRnVuY3Rpb24ucHJvdG90eXBlLCBUT19TVFJJTkcsIGZ1bmN0aW9uIHRvU3RyaW5nKCl7XG4gIHJldHVybiB0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nICYmIHRoaXNbU1JDXSB8fCAkdG9TdHJpbmcuY2FsbCh0aGlzKTtcbn0pOyIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKVxuICAsIFNIQVJFRCA9ICdfX2NvcmUtanNfc2hhcmVkX18nXG4gICwgc3RvcmUgID0gZ2xvYmFsW1NIQVJFRF0gfHwgKGdsb2JhbFtTSEFSRURdID0ge30pO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihrZXkpe1xuICByZXR1cm4gc3RvcmVba2V5XSB8fCAoc3RvcmVba2V5XSA9IHt9KTtcbn07IiwidmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vX3RvLWludGVnZXInKVxuICAsIG1heCAgICAgICA9IE1hdGgubWF4XG4gICwgbWluICAgICAgID0gTWF0aC5taW47XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGluZGV4LCBsZW5ndGgpe1xuICBpbmRleCA9IHRvSW50ZWdlcihpbmRleCk7XG4gIHJldHVybiBpbmRleCA8IDAgPyBtYXgoaW5kZXggKyBsZW5ndGgsIDApIDogbWluKGluZGV4LCBsZW5ndGgpO1xufTsiLCIvLyA3LjEuNCBUb0ludGVnZXJcbnZhciBjZWlsICA9IE1hdGguY2VpbFxuICAsIGZsb29yID0gTWF0aC5mbG9vcjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXNOYU4oaXQgPSAraXQpID8gMCA6IChpdCA+IDAgPyBmbG9vciA6IGNlaWwpKGl0KTtcbn07IiwiLy8gdG8gaW5kZXhlZCBvYmplY3QsIHRvT2JqZWN0IHdpdGggZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBzdHJpbmdzXG52YXIgSU9iamVjdCA9IHJlcXVpcmUoJy4vX2lvYmplY3QnKVxuICAsIGRlZmluZWQgPSByZXF1aXJlKCcuL19kZWZpbmVkJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIElPYmplY3QoZGVmaW5lZChpdCkpO1xufTsiLCIvLyA3LjEuMTUgVG9MZW5ndGhcbnZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuL190by1pbnRlZ2VyJylcbiAgLCBtaW4gICAgICAgPSBNYXRoLm1pbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXQgPiAwID8gbWluKHRvSW50ZWdlcihpdCksIDB4MWZmZmZmZmZmZmZmZmYpIDogMDsgLy8gcG93KDIsIDUzKSAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MVxufTsiLCIvLyA3LjEuMSBUb1ByaW1pdGl2ZShpbnB1dCBbLCBQcmVmZXJyZWRUeXBlXSlcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xuLy8gaW5zdGVhZCBvZiB0aGUgRVM2IHNwZWMgdmVyc2lvbiwgd2UgZGlkbid0IGltcGxlbWVudCBAQHRvUHJpbWl0aXZlIGNhc2Vcbi8vIGFuZCB0aGUgc2Vjb25kIGFyZ3VtZW50IC0gZmxhZyAtIHByZWZlcnJlZCB0eXBlIGlzIGEgc3RyaW5nXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0LCBTKXtcbiAgaWYoIWlzT2JqZWN0KGl0KSlyZXR1cm4gaXQ7XG4gIHZhciBmbiwgdmFsO1xuICBpZihTICYmIHR5cGVvZiAoZm4gPSBpdC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKXJldHVybiB2YWw7XG4gIGlmKHR5cGVvZiAoZm4gPSBpdC52YWx1ZU9mKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpcmV0dXJuIHZhbDtcbiAgaWYoIVMgJiYgdHlwZW9mIChmbiA9IGl0LnRvU3RyaW5nKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpcmV0dXJuIHZhbDtcbiAgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY29udmVydCBvYmplY3QgdG8gcHJpbWl0aXZlIHZhbHVlXCIpO1xufTsiLCJ2YXIgaWQgPSAwXG4gICwgcHggPSBNYXRoLnJhbmRvbSgpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihrZXkpe1xuICByZXR1cm4gJ1N5bWJvbCgnLmNvbmNhdChrZXkgPT09IHVuZGVmaW5lZCA/ICcnIDoga2V5LCAnKV8nLCAoKytpZCArIHB4KS50b1N0cmluZygzNikpO1xufTsiLCJ2YXIgc3RvcmUgICAgICA9IHJlcXVpcmUoJy4vX3NoYXJlZCcpKCd3a3MnKVxuICAsIHVpZCAgICAgICAgPSByZXF1aXJlKCcuL191aWQnKVxuICAsIFN5bWJvbCAgICAgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5TeW1ib2xcbiAgLCBVU0VfU1lNQk9MID0gdHlwZW9mIFN5bWJvbCA9PSAnZnVuY3Rpb24nO1xuXG52YXIgJGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5hbWUpe1xuICByZXR1cm4gc3RvcmVbbmFtZV0gfHwgKHN0b3JlW25hbWVdID1cbiAgICBVU0VfU1lNQk9MICYmIFN5bWJvbFtuYW1lXSB8fCAoVVNFX1NZTUJPTCA/IFN5bWJvbCA6IHVpZCkoJ1N5bWJvbC4nICsgbmFtZSkpO1xufTtcblxuJGV4cG9ydHMuc3RvcmUgPSBzdG9yZTsiLCIndXNlIHN0cmljdCc7XG4vLyBodHRwczovL2dpdGh1Yi5jb20vdGMzOS9BcnJheS5wcm90b3R5cGUuaW5jbHVkZXNcbnZhciAkZXhwb3J0ICAgPSByZXF1aXJlKCcuL19leHBvcnQnKVxuICAsICRpbmNsdWRlcyA9IHJlcXVpcmUoJy4vX2FycmF5LWluY2x1ZGVzJykodHJ1ZSk7XG5cbiRleHBvcnQoJGV4cG9ydC5QLCAnQXJyYXknLCB7XG4gIGluY2x1ZGVzOiBmdW5jdGlvbiBpbmNsdWRlcyhlbCAvKiwgZnJvbUluZGV4ID0gMCAqLyl7XG4gICAgcmV0dXJuICRpbmNsdWRlcyh0aGlzLCBlbCwgYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWQpO1xuICB9XG59KTtcblxucmVxdWlyZSgnLi9fYWRkLXRvLXVuc2NvcGFibGVzJykoJ2luY2x1ZGVzJyk7IiwiLyohXG4gKiBEcmFnZ2FiaWxseSB2Mi4xLjFcbiAqIE1ha2UgdGhhdCBzaGl6IGRyYWdnYWJsZVxuICogaHR0cDovL2RyYWdnYWJpbGx5LmRlc2FuZHJvLmNvbVxuICogTUlUIGxpY2Vuc2VcbiAqL1xuXG4vKmpzaGludCBicm93c2VyOiB0cnVlLCBzdHJpY3Q6IHRydWUsIHVuZGVmOiB0cnVlLCB1bnVzZWQ6IHRydWUgKi9cblxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLyoganNoaW50IHN0cmljdDogZmFsc2UgKi8gLypnbG9iYWxzIGRlZmluZSwgbW9kdWxlLCByZXF1aXJlICovXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EXG4gICAgZGVmaW5lKCBbXG4gICAgICAgICdnZXQtc2l6ZS9nZXQtc2l6ZScsXG4gICAgICAgICd1bmlkcmFnZ2VyL3VuaWRyYWdnZXInXG4gICAgICBdLFxuICAgICAgZnVuY3Rpb24oIGdldFNpemUsIFVuaWRyYWdnZXIgKSB7XG4gICAgICAgIHJldHVybiBmYWN0b3J5KCB3aW5kb3csIGdldFNpemUsIFVuaWRyYWdnZXIgKTtcbiAgICAgIH0pO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgcmVxdWlyZSgnZ2V0LXNpemUnKSxcbiAgICAgIHJlcXVpcmUoJ3VuaWRyYWdnZXInKVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICB3aW5kb3cuRHJhZ2dhYmlsbHkgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgd2luZG93LmdldFNpemUsXG4gICAgICB3aW5kb3cuVW5pZHJhZ2dlclxuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIGdldFNpemUsIFVuaWRyYWdnZXIgKSB7XG5cbid1c2Ugc3RyaWN0JztcblxuLy8gdmFyc1xudmFyIGRvY3VtZW50ID0gd2luZG93LmRvY3VtZW50O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gaGVscGVycyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vLyBleHRlbmQgb2JqZWN0c1xuZnVuY3Rpb24gZXh0ZW5kKCBhLCBiICkge1xuICBmb3IgKCB2YXIgcHJvcCBpbiBiICkge1xuICAgIGFbIHByb3AgXSA9IGJbIHByb3AgXTtcbiAgfVxuICByZXR1cm4gYTtcbn1cblxuZnVuY3Rpb24gaXNFbGVtZW50KCBvYmogKSB7XG4gIHJldHVybiBvYmogaW5zdGFuY2VvZiBIVE1MRWxlbWVudDtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8vIGdldCByQUYsIHByZWZpeGVkLCBpZiBwcmVzZW50XG52YXIgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cbi8vIGZhbGxiYWNrIHRvIHNldFRpbWVvdXRcbnZhciBsYXN0VGltZSA9IDA7XG5pZiAoICFyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgKSAge1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbiggY2FsbGJhY2sgKSB7XG4gICAgdmFyIGN1cnJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgdmFyIHRpbWVUb0NhbGwgPSBNYXRoLm1heCggMCwgMTYgLSAoIGN1cnJUaW1lIC0gbGFzdFRpbWUgKSApO1xuICAgIHZhciBpZCA9IHNldFRpbWVvdXQoIGNhbGxiYWNrLCB0aW1lVG9DYWxsICk7XG4gICAgbGFzdFRpbWUgPSBjdXJyVGltZSArIHRpbWVUb0NhbGw7XG4gICAgcmV0dXJuIGlkO1xuICB9O1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBzdXBwb3J0IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnZhciBkb2NFbGVtID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xudmFyIHRyYW5zZm9ybVByb3BlcnR5ID0gdHlwZW9mIGRvY0VsZW0uc3R5bGUudHJhbnNmb3JtID09ICdzdHJpbmcnID9cbiAgJ3RyYW5zZm9ybScgOiAnV2Via2l0VHJhbnNmb3JtJztcblxudmFyIGpRdWVyeSA9IHdpbmRvdy5qUXVlcnk7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5mdW5jdGlvbiBEcmFnZ2FiaWxseSggZWxlbWVudCwgb3B0aW9ucyApIHtcbiAgLy8gcXVlcnlTZWxlY3RvciBpZiBzdHJpbmdcbiAgdGhpcy5lbGVtZW50ID0gdHlwZW9mIGVsZW1lbnQgPT0gJ3N0cmluZycgP1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIGVsZW1lbnQgKSA6IGVsZW1lbnQ7XG5cbiAgaWYgKCBqUXVlcnkgKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGpRdWVyeSggdGhpcy5lbGVtZW50ICk7XG4gIH1cblxuICAvLyBvcHRpb25zXG4gIHRoaXMub3B0aW9ucyA9IGV4dGVuZCgge30sIHRoaXMuY29uc3RydWN0b3IuZGVmYXVsdHMgKTtcbiAgdGhpcy5vcHRpb24oIG9wdGlvbnMgKTtcblxuICB0aGlzLl9jcmVhdGUoKTtcbn1cblxuLy8gaW5oZXJpdCBVbmlkcmFnZ2VyIG1ldGhvZHNcbnZhciBwcm90byA9IERyYWdnYWJpbGx5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFVuaWRyYWdnZXIucHJvdG90eXBlICk7XG5cbkRyYWdnYWJpbGx5LmRlZmF1bHRzID0ge1xufTtcblxuLyoqXG4gKiBzZXQgb3B0aW9uc1xuICogQHBhcmFtIHtPYmplY3R9IG9wdHNcbiAqL1xucHJvdG8ub3B0aW9uID0gZnVuY3Rpb24oIG9wdHMgKSB7XG4gIGV4dGVuZCggdGhpcy5vcHRpb25zLCBvcHRzICk7XG59O1xuXG4vLyBjc3MgcG9zaXRpb24gdmFsdWVzIHRoYXQgZG9uJ3QgbmVlZCB0byBiZSBzZXRcbnZhciBwb3NpdGlvblZhbHVlcyA9IHtcbiAgcmVsYXRpdmU6IHRydWUsXG4gIGFic29sdXRlOiB0cnVlLFxuICBmaXhlZDogdHJ1ZVxufTtcblxucHJvdG8uX2NyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuXG4gIC8vIHByb3BlcnRpZXNcbiAgdGhpcy5wb3NpdGlvbiA9IHt9O1xuICB0aGlzLl9nZXRQb3NpdGlvbigpO1xuXG4gIHRoaXMuc3RhcnRQb2ludCA9IHsgeDogMCwgeTogMCB9O1xuICB0aGlzLmRyYWdQb2ludCA9IHsgeDogMCwgeTogMCB9O1xuXG4gIHRoaXMuc3RhcnRQb3NpdGlvbiA9IGV4dGVuZCgge30sIHRoaXMucG9zaXRpb24gKTtcblxuICAvLyBzZXQgcmVsYXRpdmUgcG9zaXRpb25pbmdcbiAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZSggdGhpcy5lbGVtZW50ICk7XG4gIGlmICggIXBvc2l0aW9uVmFsdWVzWyBzdHlsZS5wb3NpdGlvbiBdICkge1xuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdyZWxhdGl2ZSc7XG4gIH1cblxuICB0aGlzLmVuYWJsZSgpO1xuICB0aGlzLnNldEhhbmRsZXMoKTtcblxufTtcblxuLyoqXG4gKiBzZXQgdGhpcy5oYW5kbGVzIGFuZCBiaW5kIHN0YXJ0IGV2ZW50cyB0byAnZW1cbiAqL1xucHJvdG8uc2V0SGFuZGxlcyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmhhbmRsZXMgPSB0aGlzLm9wdGlvbnMuaGFuZGxlID9cbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCggdGhpcy5vcHRpb25zLmhhbmRsZSApIDogWyB0aGlzLmVsZW1lbnQgXTtcblxuICB0aGlzLmJpbmRIYW5kbGVzKCk7XG59O1xuXG4vKipcbiAqIGVtaXRzIGV2ZW50cyB2aWEgRXZFbWl0dGVyIGFuZCBqUXVlcnkgZXZlbnRzXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZSAtIG5hbWUgb2YgZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gb3JpZ2luYWwgZXZlbnRcbiAqIEBwYXJhbSB7QXJyYXl9IGFyZ3MgLSBleHRyYSBhcmd1bWVudHNcbiAqL1xucHJvdG8uZGlzcGF0Y2hFdmVudCA9IGZ1bmN0aW9uKCB0eXBlLCBldmVudCwgYXJncyApIHtcbiAgdmFyIGVtaXRBcmdzID0gWyBldmVudCBdLmNvbmNhdCggYXJncyApO1xuICB0aGlzLmVtaXRFdmVudCggdHlwZSwgZW1pdEFyZ3MgKTtcbiAgdmFyIGpRdWVyeSA9IHdpbmRvdy5qUXVlcnk7XG4gIC8vIHRyaWdnZXIgalF1ZXJ5IGV2ZW50XG4gIGlmICggalF1ZXJ5ICYmIHRoaXMuJGVsZW1lbnQgKSB7XG4gICAgaWYgKCBldmVudCApIHtcbiAgICAgIC8vIGNyZWF0ZSBqUXVlcnkgZXZlbnRcbiAgICAgIHZhciAkZXZlbnQgPSBqUXVlcnkuRXZlbnQoIGV2ZW50ICk7XG4gICAgICAkZXZlbnQudHlwZSA9IHR5cGU7XG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoICRldmVudCwgYXJncyApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBqdXN0IHRyaWdnZXIgd2l0aCB0eXBlIGlmIG5vIGV2ZW50IGF2YWlsYWJsZVxuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCB0eXBlLCBhcmdzICk7XG4gICAgfVxuICB9XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBwb3NpdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vLyBnZXQgeC95IHBvc2l0aW9uIGZyb20gc3R5bGVcbnByb3RvLl9nZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKCB0aGlzLmVsZW1lbnQgKTtcbiAgdmFyIHggPSB0aGlzLl9nZXRQb3NpdGlvbkNvb3JkKCBzdHlsZS5sZWZ0LCAnd2lkdGgnICk7XG4gIHZhciB5ID0gdGhpcy5fZ2V0UG9zaXRpb25Db29yZCggc3R5bGUudG9wLCAnaGVpZ2h0JyApO1xuICAvLyBjbGVhbiB1cCAnYXV0bycgb3Igb3RoZXIgbm9uLWludGVnZXIgdmFsdWVzXG4gIHRoaXMucG9zaXRpb24ueCA9IGlzTmFOKCB4ICkgPyAwIDogeDtcbiAgdGhpcy5wb3NpdGlvbi55ID0gaXNOYU4oIHkgKSA/IDAgOiB5O1xuXG4gIHRoaXMuX2FkZFRyYW5zZm9ybVBvc2l0aW9uKCBzdHlsZSApO1xufTtcblxucHJvdG8uX2dldFBvc2l0aW9uQ29vcmQgPSBmdW5jdGlvbiggc3R5bGVTaWRlLCBtZWFzdXJlICkge1xuICBpZiAoIHN0eWxlU2lkZS5pbmRleE9mKCclJykgIT0gLTEgKSB7XG4gICAgLy8gY29udmVydCBwZXJjZW50IGludG8gcGl4ZWwgZm9yIFNhZmFyaSwgIzc1XG4gICAgdmFyIHBhcmVudFNpemUgPSBnZXRTaXplKCB0aGlzLmVsZW1lbnQucGFyZW50Tm9kZSApO1xuICAgIC8vIHByZXZlbnQgbm90LWluLURPTSBlbGVtZW50IHRocm93aW5nIGJ1ZywgIzEzMVxuICAgIHJldHVybiAhcGFyZW50U2l6ZSA/IDAgOlxuICAgICAgKCBwYXJzZUZsb2F0KCBzdHlsZVNpZGUgKSAvIDEwMCApICogcGFyZW50U2l6ZVsgbWVhc3VyZSBdO1xuICB9XG4gIHJldHVybiBwYXJzZUludCggc3R5bGVTaWRlLCAxMCApO1xufTtcblxuLy8gYWRkIHRyYW5zZm9ybTogdHJhbnNsYXRlKCB4LCB5ICkgdG8gcG9zaXRpb25cbnByb3RvLl9hZGRUcmFuc2Zvcm1Qb3NpdGlvbiA9IGZ1bmN0aW9uKCBzdHlsZSApIHtcbiAgdmFyIHRyYW5zZm9ybSA9IHN0eWxlWyB0cmFuc2Zvcm1Qcm9wZXJ0eSBdO1xuICAvLyBiYWlsIG91dCBpZiB2YWx1ZSBpcyAnbm9uZSdcbiAgaWYgKCB0cmFuc2Zvcm0uaW5kZXhPZignbWF0cml4JykgIT09IDAgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIHNwbGl0IG1hdHJpeCgxLCAwLCAwLCAxLCB4LCB5KVxuICB2YXIgbWF0cml4VmFsdWVzID0gdHJhbnNmb3JtLnNwbGl0KCcsJyk7XG4gIC8vIHRyYW5zbGF0ZSBYIHZhbHVlIGlzIGluIDEydGggb3IgNHRoIHBvc2l0aW9uXG4gIHZhciB4SW5kZXggPSB0cmFuc2Zvcm0uaW5kZXhPZignbWF0cml4M2QnKSA9PT0gMCA/IDEyIDogNDtcbiAgdmFyIHRyYW5zbGF0ZVggPSBwYXJzZUludCggbWF0cml4VmFsdWVzWyB4SW5kZXggXSwgMTAgKTtcbiAgLy8gdHJhbnNsYXRlIFkgdmFsdWUgaXMgaW4gMTN0aCBvciA1dGggcG9zaXRpb25cbiAgdmFyIHRyYW5zbGF0ZVkgPSBwYXJzZUludCggbWF0cml4VmFsdWVzWyB4SW5kZXggKyAxIF0sIDEwICk7XG4gIHRoaXMucG9zaXRpb24ueCArPSB0cmFuc2xhdGVYO1xuICB0aGlzLnBvc2l0aW9uLnkgKz0gdHJhbnNsYXRlWTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGV2ZW50cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vKipcbiAqIHBvaW50ZXIgc3RhcnRcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50IG9yIFRvdWNofSBwb2ludGVyXG4gKi9cbnByb3RvLnBvaW50ZXJEb3duID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLl9kcmFnUG9pbnRlckRvd24oIGV2ZW50LCBwb2ludGVyICk7XG4gIC8vIGtsdWRnZSB0byBibHVyIGZvY3VzZWQgaW5wdXRzIGluIGRyYWdnZXJcbiAgdmFyIGZvY3VzZWQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICAvLyBkbyBub3QgYmx1ciBib2R5IGZvciBJRTEwLCBtZXRhZml6enkvZmxpY2tpdHkjMTE3XG4gIGlmICggZm9jdXNlZCAmJiBmb2N1c2VkLmJsdXIgJiYgZm9jdXNlZCAhPSBkb2N1bWVudC5ib2R5ICkge1xuICAgIGZvY3VzZWQuYmx1cigpO1xuICB9XG4gIC8vIGJpbmQgbW92ZSBhbmQgZW5kIGV2ZW50c1xuICB0aGlzLl9iaW5kUG9zdFN0YXJ0RXZlbnRzKCBldmVudCApO1xuICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtcG9pbnRlci1kb3duJyk7XG4gIHRoaXMuZGlzcGF0Y2hFdmVudCggJ3BvaW50ZXJEb3duJywgZXZlbnQsIFsgcG9pbnRlciBdICk7XG59O1xuXG4vKipcbiAqIGRyYWcgbW92ZVxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgb3IgVG91Y2h9IHBvaW50ZXJcbiAqL1xucHJvdG8ucG9pbnRlck1vdmUgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHZhciBtb3ZlVmVjdG9yID0gdGhpcy5fZHJhZ1BvaW50ZXJNb3ZlKCBldmVudCwgcG9pbnRlciApO1xuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdwb2ludGVyTW92ZScsIGV2ZW50LCBbIHBvaW50ZXIsIG1vdmVWZWN0b3IgXSApO1xuICB0aGlzLl9kcmFnTW92ZSggZXZlbnQsIHBvaW50ZXIsIG1vdmVWZWN0b3IgKTtcbn07XG5cbi8qKlxuICogZHJhZyBzdGFydFxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgb3IgVG91Y2h9IHBvaW50ZXJcbiAqL1xucHJvdG8uZHJhZ1N0YXJ0ID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICBpZiAoICF0aGlzLmlzRW5hYmxlZCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5fZ2V0UG9zaXRpb24oKTtcbiAgdGhpcy5tZWFzdXJlQ29udGFpbm1lbnQoKTtcbiAgLy8gcG9zaXRpb24gX3doZW5fIGRyYWcgYmVnYW5cbiAgdGhpcy5zdGFydFBvc2l0aW9uLnggPSB0aGlzLnBvc2l0aW9uLng7XG4gIHRoaXMuc3RhcnRQb3NpdGlvbi55ID0gdGhpcy5wb3NpdGlvbi55O1xuICAvLyByZXNldCBsZWZ0L3RvcCBzdHlsZVxuICB0aGlzLnNldExlZnRUb3AoKTtcblxuICB0aGlzLmRyYWdQb2ludC54ID0gMDtcbiAgdGhpcy5kcmFnUG9pbnQueSA9IDA7XG5cbiAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lzLWRyYWdnaW5nJyk7XG4gIHRoaXMuZGlzcGF0Y2hFdmVudCggJ2RyYWdTdGFydCcsIGV2ZW50LCBbIHBvaW50ZXIgXSApO1xuICAvLyBzdGFydCBhbmltYXRpb25cbiAgdGhpcy5hbmltYXRlKCk7XG59O1xuXG5wcm90by5tZWFzdXJlQ29udGFpbm1lbnQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGNvbnRhaW5tZW50ID0gdGhpcy5vcHRpb25zLmNvbnRhaW5tZW50O1xuICBpZiAoICFjb250YWlubWVudCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyB1c2UgZWxlbWVudCBpZiBlbGVtZW50XG4gIHZhciBjb250YWluZXIgPSBpc0VsZW1lbnQoIGNvbnRhaW5tZW50ICkgPyBjb250YWlubWVudCA6XG4gICAgLy8gZmFsbGJhY2sgdG8gcXVlcnlTZWxlY3RvciBpZiBzdHJpbmdcbiAgICB0eXBlb2YgY29udGFpbm1lbnQgPT0gJ3N0cmluZycgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCBjb250YWlubWVudCApIDpcbiAgICAvLyBvdGhlcndpc2UganVzdCBgdHJ1ZWAsIHVzZSB0aGUgcGFyZW50XG4gICAgdGhpcy5lbGVtZW50LnBhcmVudE5vZGU7XG5cbiAgdmFyIGVsZW1TaXplID0gZ2V0U2l6ZSggdGhpcy5lbGVtZW50ICk7XG4gIHZhciBjb250YWluZXJTaXplID0gZ2V0U2l6ZSggY29udGFpbmVyICk7XG4gIHZhciBlbGVtUmVjdCA9IHRoaXMuZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgdmFyIGNvbnRhaW5lclJlY3QgPSBjb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgdmFyIGJvcmRlclNpemVYID0gY29udGFpbmVyU2l6ZS5ib3JkZXJMZWZ0V2lkdGggKyBjb250YWluZXJTaXplLmJvcmRlclJpZ2h0V2lkdGg7XG4gIHZhciBib3JkZXJTaXplWSA9IGNvbnRhaW5lclNpemUuYm9yZGVyVG9wV2lkdGggKyBjb250YWluZXJTaXplLmJvcmRlckJvdHRvbVdpZHRoO1xuXG4gIHZhciBwb3NpdGlvbiA9IHRoaXMucmVsYXRpdmVTdGFydFBvc2l0aW9uID0ge1xuICAgIHg6IGVsZW1SZWN0LmxlZnQgLSAoIGNvbnRhaW5lclJlY3QubGVmdCArIGNvbnRhaW5lclNpemUuYm9yZGVyTGVmdFdpZHRoICksXG4gICAgeTogZWxlbVJlY3QudG9wIC0gKCBjb250YWluZXJSZWN0LnRvcCArIGNvbnRhaW5lclNpemUuYm9yZGVyVG9wV2lkdGggKVxuICB9O1xuXG4gIHRoaXMuY29udGFpblNpemUgPSB7XG4gICAgd2lkdGg6ICggY29udGFpbmVyU2l6ZS53aWR0aCAtIGJvcmRlclNpemVYICkgLSBwb3NpdGlvbi54IC0gZWxlbVNpemUud2lkdGgsXG4gICAgaGVpZ2h0OiAoIGNvbnRhaW5lclNpemUuaGVpZ2h0IC0gYm9yZGVyU2l6ZVkgKSAtIHBvc2l0aW9uLnkgLSBlbGVtU2l6ZS5oZWlnaHRcbiAgfTtcbn07XG5cbi8vIC0tLS0tIG1vdmUgZXZlbnQgLS0tLS0gLy9cblxuLyoqXG4gKiBkcmFnIG1vdmVcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50IG9yIFRvdWNofSBwb2ludGVyXG4gKi9cbnByb3RvLmRyYWdNb3ZlID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyLCBtb3ZlVmVjdG9yICkge1xuICBpZiAoICF0aGlzLmlzRW5hYmxlZCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGRyYWdYID0gbW92ZVZlY3Rvci54O1xuICB2YXIgZHJhZ1kgPSBtb3ZlVmVjdG9yLnk7XG5cbiAgdmFyIGdyaWQgPSB0aGlzLm9wdGlvbnMuZ3JpZDtcbiAgdmFyIGdyaWRYID0gZ3JpZCAmJiBncmlkWzBdO1xuICB2YXIgZ3JpZFkgPSBncmlkICYmIGdyaWRbMV07XG5cbiAgZHJhZ1ggPSBhcHBseUdyaWQoIGRyYWdYLCBncmlkWCApO1xuICBkcmFnWSA9IGFwcGx5R3JpZCggZHJhZ1ksIGdyaWRZICk7XG5cbiAgZHJhZ1ggPSB0aGlzLmNvbnRhaW5EcmFnKCAneCcsIGRyYWdYLCBncmlkWCApO1xuICBkcmFnWSA9IHRoaXMuY29udGFpbkRyYWcoICd5JywgZHJhZ1ksIGdyaWRZICk7XG5cbiAgLy8gY29uc3RyYWluIHRvIGF4aXNcbiAgZHJhZ1ggPSB0aGlzLm9wdGlvbnMuYXhpcyA9PSAneScgPyAwIDogZHJhZ1g7XG4gIGRyYWdZID0gdGhpcy5vcHRpb25zLmF4aXMgPT0gJ3gnID8gMCA6IGRyYWdZO1xuXG4gIHRoaXMucG9zaXRpb24ueCA9IHRoaXMuc3RhcnRQb3NpdGlvbi54ICsgZHJhZ1g7XG4gIHRoaXMucG9zaXRpb24ueSA9IHRoaXMuc3RhcnRQb3NpdGlvbi55ICsgZHJhZ1k7XG4gIC8vIHNldCBkcmFnUG9pbnQgcHJvcGVydGllc1xuICB0aGlzLmRyYWdQb2ludC54ID0gZHJhZ1g7XG4gIHRoaXMuZHJhZ1BvaW50LnkgPSBkcmFnWTtcblxuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdkcmFnTW92ZScsIGV2ZW50LCBbIHBvaW50ZXIsIG1vdmVWZWN0b3IgXSApO1xufTtcblxuZnVuY3Rpb24gYXBwbHlHcmlkKCB2YWx1ZSwgZ3JpZCwgbWV0aG9kICkge1xuICBtZXRob2QgPSBtZXRob2QgfHwgJ3JvdW5kJztcbiAgcmV0dXJuIGdyaWQgPyBNYXRoWyBtZXRob2QgXSggdmFsdWUgLyBncmlkICkgKiBncmlkIDogdmFsdWU7XG59XG5cbnByb3RvLmNvbnRhaW5EcmFnID0gZnVuY3Rpb24oIGF4aXMsIGRyYWcsIGdyaWQgKSB7XG4gIGlmICggIXRoaXMub3B0aW9ucy5jb250YWlubWVudCApIHtcbiAgICByZXR1cm4gZHJhZztcbiAgfVxuICB2YXIgbWVhc3VyZSA9IGF4aXMgPT0gJ3gnID8gJ3dpZHRoJyA6ICdoZWlnaHQnO1xuXG4gIHZhciByZWwgPSB0aGlzLnJlbGF0aXZlU3RhcnRQb3NpdGlvblsgYXhpcyBdO1xuICB2YXIgbWluID0gYXBwbHlHcmlkKCAtcmVsLCBncmlkLCAnY2VpbCcgKTtcbiAgdmFyIG1heCA9IHRoaXMuY29udGFpblNpemVbIG1lYXN1cmUgXTtcbiAgbWF4ID0gYXBwbHlHcmlkKCBtYXgsIGdyaWQsICdmbG9vcicgKTtcbiAgcmV0dXJuICBNYXRoLm1pbiggbWF4LCBNYXRoLm1heCggbWluLCBkcmFnICkgKTtcbn07XG5cbi8vIC0tLS0tIGVuZCBldmVudCAtLS0tLSAvL1xuXG4vKipcbiAqIHBvaW50ZXIgdXBcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50IG9yIFRvdWNofSBwb2ludGVyXG4gKi9cbnByb3RvLnBvaW50ZXJVcCA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXBvaW50ZXItZG93bicpO1xuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdwb2ludGVyVXAnLCBldmVudCwgWyBwb2ludGVyIF0gKTtcbiAgdGhpcy5fZHJhZ1BvaW50ZXJVcCggZXZlbnQsIHBvaW50ZXIgKTtcbn07XG5cbi8qKlxuICogZHJhZyBlbmRcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50IG9yIFRvdWNofSBwb2ludGVyXG4gKi9cbnByb3RvLmRyYWdFbmQgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIGlmICggIXRoaXMuaXNFbmFibGVkICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyB1c2UgdG9wIGxlZnQgcG9zaXRpb24gd2hlbiBjb21wbGV0ZVxuICBpZiAoIHRyYW5zZm9ybVByb3BlcnR5ICkge1xuICAgIHRoaXMuZWxlbWVudC5zdHlsZVsgdHJhbnNmb3JtUHJvcGVydHkgXSA9ICcnO1xuICAgIHRoaXMuc2V0TGVmdFRvcCgpO1xuICB9XG4gIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1kcmFnZ2luZycpO1xuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdkcmFnRW5kJywgZXZlbnQsIFsgcG9pbnRlciBdICk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBhbmltYXRpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxucHJvdG8uYW5pbWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAvLyBvbmx5IHJlbmRlciBhbmQgYW5pbWF0ZSBpZiBkcmFnZ2luZ1xuICBpZiAoICF0aGlzLmlzRHJhZ2dpbmcgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5wb3NpdGlvbkRyYWcoKTtcblxuICB2YXIgX3RoaXMgPSB0aGlzO1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIGZ1bmN0aW9uIGFuaW1hdGVGcmFtZSgpIHtcbiAgICBfdGhpcy5hbmltYXRlKCk7XG4gIH0pO1xuXG59O1xuXG4vLyBsZWZ0L3RvcCBwb3NpdGlvbmluZ1xucHJvdG8uc2V0TGVmdFRvcCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IHRoaXMucG9zaXRpb24ueCArICdweCc7XG4gIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgID0gdGhpcy5wb3NpdGlvbi55ICsgJ3B4Jztcbn07XG5cbnByb3RvLnBvc2l0aW9uRHJhZyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmVsZW1lbnQuc3R5bGVbIHRyYW5zZm9ybVByb3BlcnR5IF0gPSAndHJhbnNsYXRlM2QoICcgKyB0aGlzLmRyYWdQb2ludC54ICtcbiAgICAncHgsICcgKyB0aGlzLmRyYWdQb2ludC55ICsgJ3B4LCAwKSc7XG59O1xuXG4vLyAtLS0tLSBzdGF0aWNDbGljayAtLS0tLSAvL1xuXG5wcm90by5zdGF0aWNDbGljayA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5kaXNwYXRjaEV2ZW50KCAnc3RhdGljQ2xpY2snLCBldmVudCwgWyBwb2ludGVyIF0gKTtcbn07XG5cbi8vIC0tLS0tIG1ldGhvZHMgLS0tLS0gLy9cblxucHJvdG8uZW5hYmxlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaXNFbmFibGVkID0gdHJ1ZTtcbn07XG5cbnByb3RvLmRpc2FibGUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pc0VuYWJsZWQgPSBmYWxzZTtcbiAgaWYgKCB0aGlzLmlzRHJhZ2dpbmcgKSB7XG4gICAgdGhpcy5kcmFnRW5kKCk7XG4gIH1cbn07XG5cbnByb3RvLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5kaXNhYmxlKCk7XG4gIC8vIHJlc2V0IHN0eWxlc1xuICB0aGlzLmVsZW1lbnQuc3R5bGVbIHRyYW5zZm9ybVByb3BlcnR5IF0gPSAnJztcbiAgdGhpcy5lbGVtZW50LnN0eWxlLmxlZnQgPSAnJztcbiAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCA9ICcnO1xuICB0aGlzLmVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnJztcbiAgLy8gdW5iaW5kIGhhbmRsZXNcbiAgdGhpcy51bmJpbmRIYW5kbGVzKCk7XG4gIC8vIHJlbW92ZSBqUXVlcnkgZGF0YVxuICBpZiAoIHRoaXMuJGVsZW1lbnQgKSB7XG4gICAgdGhpcy4kZWxlbWVudC5yZW1vdmVEYXRhKCdkcmFnZ2FiaWxseScpO1xuICB9XG59O1xuXG4vLyAtLS0tLSBqUXVlcnkgYnJpZGdldCAtLS0tLSAvL1xuXG4vLyByZXF1aXJlZCBmb3IgalF1ZXJ5IGJyaWRnZXRcbnByb3RvLl9pbml0ID0gbm9vcDtcblxuaWYgKCBqUXVlcnkgJiYgalF1ZXJ5LmJyaWRnZXQgKSB7XG4gIGpRdWVyeS5icmlkZ2V0KCAnZHJhZ2dhYmlsbHknLCBEcmFnZ2FiaWxseSApO1xufVxuXG4vLyAtLS0tLSAgLS0tLS0gLy9cblxucmV0dXJuIERyYWdnYWJpbGx5O1xuXG59KSk7XG4iLCIvKipcbiAqIEV2RW1pdHRlciB2MS4wLjNcbiAqIExpbCcgZXZlbnQgZW1pdHRlclxuICogTUlUIExpY2Vuc2VcbiAqL1xuXG4vKiBqc2hpbnQgdW51c2VkOiB0cnVlLCB1bmRlZjogdHJ1ZSwgc3RyaWN0OiB0cnVlICovXG5cbiggZnVuY3Rpb24oIGdsb2JhbCwgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIC8qIGpzaGludCBzdHJpY3Q6IGZhbHNlICovIC8qIGdsb2JhbHMgZGVmaW5lLCBtb2R1bGUsIHdpbmRvdyAqL1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRCAtIFJlcXVpcmVKU1xuICAgIGRlZmluZSggZmFjdG9yeSApO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTIC0gQnJvd3NlcmlmeSwgV2VicGFja1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFsc1xuICAgIGdsb2JhbC5FdkVtaXR0ZXIgPSBmYWN0b3J5KCk7XG4gIH1cblxufSggdHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHRoaXMsIGZ1bmN0aW9uKCkge1xuXG5cInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gRXZFbWl0dGVyKCkge31cblxudmFyIHByb3RvID0gRXZFbWl0dGVyLnByb3RvdHlwZTtcblxucHJvdG8ub24gPSBmdW5jdGlvbiggZXZlbnROYW1lLCBsaXN0ZW5lciApIHtcbiAgaWYgKCAhZXZlbnROYW1lIHx8ICFsaXN0ZW5lciApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gc2V0IGV2ZW50cyBoYXNoXG4gIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIC8vIHNldCBsaXN0ZW5lcnMgYXJyYXlcbiAgdmFyIGxpc3RlbmVycyA9IGV2ZW50c1sgZXZlbnROYW1lIF0gPSBldmVudHNbIGV2ZW50TmFtZSBdIHx8IFtdO1xuICAvLyBvbmx5IGFkZCBvbmNlXG4gIGlmICggbGlzdGVuZXJzLmluZGV4T2YoIGxpc3RlbmVyICkgPT0gLTEgKSB7XG4gICAgbGlzdGVuZXJzLnB1c2goIGxpc3RlbmVyICk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbnByb3RvLm9uY2UgPSBmdW5jdGlvbiggZXZlbnROYW1lLCBsaXN0ZW5lciApIHtcbiAgaWYgKCAhZXZlbnROYW1lIHx8ICFsaXN0ZW5lciApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gYWRkIGV2ZW50XG4gIHRoaXMub24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKTtcbiAgLy8gc2V0IG9uY2UgZmxhZ1xuICAvLyBzZXQgb25jZUV2ZW50cyBoYXNoXG4gIHZhciBvbmNlRXZlbnRzID0gdGhpcy5fb25jZUV2ZW50cyA9IHRoaXMuX29uY2VFdmVudHMgfHwge307XG4gIC8vIHNldCBvbmNlTGlzdGVuZXJzIG9iamVjdFxuICB2YXIgb25jZUxpc3RlbmVycyA9IG9uY2VFdmVudHNbIGV2ZW50TmFtZSBdID0gb25jZUV2ZW50c1sgZXZlbnROYW1lIF0gfHwge307XG4gIC8vIHNldCBmbGFnXG4gIG9uY2VMaXN0ZW5lcnNbIGxpc3RlbmVyIF0gPSB0cnVlO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxucHJvdG8ub2ZmID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKSB7XG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHMgJiYgdGhpcy5fZXZlbnRzWyBldmVudE5hbWUgXTtcbiAgaWYgKCAhbGlzdGVuZXJzIHx8ICFsaXN0ZW5lcnMubGVuZ3RoICkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgaW5kZXggPSBsaXN0ZW5lcnMuaW5kZXhPZiggbGlzdGVuZXIgKTtcbiAgaWYgKCBpbmRleCAhPSAtMSApIHtcbiAgICBsaXN0ZW5lcnMuc3BsaWNlKCBpbmRleCwgMSApO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5wcm90by5lbWl0RXZlbnQgPSBmdW5jdGlvbiggZXZlbnROYW1lLCBhcmdzICkge1xuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1sgZXZlbnROYW1lIF07XG4gIGlmICggIWxpc3RlbmVycyB8fCAhbGlzdGVuZXJzLmxlbmd0aCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGkgPSAwO1xuICB2YXIgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbaV07XG4gIGFyZ3MgPSBhcmdzIHx8IFtdO1xuICAvLyBvbmNlIHN0dWZmXG4gIHZhciBvbmNlTGlzdGVuZXJzID0gdGhpcy5fb25jZUV2ZW50cyAmJiB0aGlzLl9vbmNlRXZlbnRzWyBldmVudE5hbWUgXTtcblxuICB3aGlsZSAoIGxpc3RlbmVyICkge1xuICAgIHZhciBpc09uY2UgPSBvbmNlTGlzdGVuZXJzICYmIG9uY2VMaXN0ZW5lcnNbIGxpc3RlbmVyIF07XG4gICAgaWYgKCBpc09uY2UgKSB7XG4gICAgICAvLyByZW1vdmUgbGlzdGVuZXJcbiAgICAgIC8vIHJlbW92ZSBiZWZvcmUgdHJpZ2dlciB0byBwcmV2ZW50IHJlY3Vyc2lvblxuICAgICAgdGhpcy5vZmYoIGV2ZW50TmFtZSwgbGlzdGVuZXIgKTtcbiAgICAgIC8vIHVuc2V0IG9uY2UgZmxhZ1xuICAgICAgZGVsZXRlIG9uY2VMaXN0ZW5lcnNbIGxpc3RlbmVyIF07XG4gICAgfVxuICAgIC8vIHRyaWdnZXIgbGlzdGVuZXJcbiAgICBsaXN0ZW5lci5hcHBseSggdGhpcywgYXJncyApO1xuICAgIC8vIGdldCBuZXh0IGxpc3RlbmVyXG4gICAgaSArPSBpc09uY2UgPyAwIDogMTtcbiAgICBsaXN0ZW5lciA9IGxpc3RlbmVyc1tpXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxucmV0dXJuIEV2RW1pdHRlcjtcblxufSkpO1xuIiwiXG4vKipcbiAqIE1vZHVsZSBleHBvcnRzLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0RG9jdW1lbnQ7XG5cbi8vIGRlZmluZWQgYnkgdzNjXG52YXIgRE9DVU1FTlRfTk9ERSA9IDk7XG5cbi8qKlxuICogUmV0dXJucyBgdHJ1ZWAgaWYgYHdgIGlzIGEgRG9jdW1lbnQgb2JqZWN0LCBvciBgZmFsc2VgIG90aGVyd2lzZS5cbiAqXG4gKiBAcGFyYW0gez99IGQgLSBEb2N1bWVudCBvYmplY3QsIG1heWJlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc0RvY3VtZW50IChkKSB7XG4gIHJldHVybiBkICYmIGQubm9kZVR5cGUgPT09IERPQ1VNRU5UX05PREU7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgYGRvY3VtZW50YCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBnaXZlbiBgbm9kZWAsIHdoaWNoIG1heSBiZVxuICogYSBET00gZWxlbWVudCwgdGhlIFdpbmRvdyBvYmplY3QsIGEgU2VsZWN0aW9uLCBhIFJhbmdlLiBCYXNpY2FsbHkgYW55IERPTVxuICogb2JqZWN0IHRoYXQgcmVmZXJlbmNlcyB0aGUgRG9jdW1lbnQgaW4gc29tZSB3YXksIHRoaXMgZnVuY3Rpb24gd2lsbCBmaW5kIGl0LlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IG5vZGUgLSBET00gbm9kZSwgc2VsZWN0aW9uLCBvciByYW5nZSBpbiB3aGljaCB0byBmaW5kIHRoZSBgZG9jdW1lbnRgIG9iamVjdFxuICogQHJldHVybiB7RG9jdW1lbnR9IHRoZSBgZG9jdW1lbnRgIG9iamVjdCBhc3NvY2lhdGVkIHdpdGggYG5vZGVgXG4gKiBAcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZ2V0RG9jdW1lbnQobm9kZSkge1xuICBpZiAoaXNEb2N1bWVudChub2RlKSkge1xuICAgIHJldHVybiBub2RlO1xuXG4gIH0gZWxzZSBpZiAoaXNEb2N1bWVudChub2RlLm93bmVyRG9jdW1lbnQpKSB7XG4gICAgcmV0dXJuIG5vZGUub3duZXJEb2N1bWVudDtcblxuICB9IGVsc2UgaWYgKGlzRG9jdW1lbnQobm9kZS5kb2N1bWVudCkpIHtcbiAgICByZXR1cm4gbm9kZS5kb2N1bWVudDtcblxuICB9IGVsc2UgaWYgKG5vZGUucGFyZW50Tm9kZSkge1xuICAgIHJldHVybiBnZXREb2N1bWVudChub2RlLnBhcmVudE5vZGUpO1xuXG4gIC8vIFJhbmdlIHN1cHBvcnRcbiAgfSBlbHNlIGlmIChub2RlLmNvbW1vbkFuY2VzdG9yQ29udGFpbmVyKSB7XG4gICAgcmV0dXJuIGdldERvY3VtZW50KG5vZGUuY29tbW9uQW5jZXN0b3JDb250YWluZXIpO1xuXG4gIH0gZWxzZSBpZiAobm9kZS5zdGFydENvbnRhaW5lcikge1xuICAgIHJldHVybiBnZXREb2N1bWVudChub2RlLnN0YXJ0Q29udGFpbmVyKTtcblxuICAvLyBTZWxlY3Rpb24gc3VwcG9ydFxuICB9IGVsc2UgaWYgKG5vZGUuYW5jaG9yTm9kZSkge1xuICAgIHJldHVybiBnZXREb2N1bWVudChub2RlLmFuY2hvck5vZGUpO1xuICB9XG59XG4iLCIvKiFcbiAqIGdldFNpemUgdjIuMC4yXG4gKiBtZWFzdXJlIHNpemUgb2YgZWxlbWVudHNcbiAqIE1JVCBsaWNlbnNlXG4gKi9cblxuLypqc2hpbnQgYnJvd3NlcjogdHJ1ZSwgc3RyaWN0OiB0cnVlLCB1bmRlZjogdHJ1ZSwgdW51c2VkOiB0cnVlICovXG4vKmdsb2JhbCBkZWZpbmU6IGZhbHNlLCBtb2R1bGU6IGZhbHNlLCBjb25zb2xlOiBmYWxzZSAqL1xuXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeSgpO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICB3aW5kb3cuZ2V0U2l6ZSA9IGZhY3RvcnkoKTtcbiAgfVxuXG59KSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCkge1xuJ3VzZSBzdHJpY3QnO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBoZWxwZXJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8vIGdldCBhIG51bWJlciBmcm9tIGEgc3RyaW5nLCBub3QgYSBwZXJjZW50YWdlXG5mdW5jdGlvbiBnZXRTdHlsZVNpemUoIHZhbHVlICkge1xuICB2YXIgbnVtID0gcGFyc2VGbG9hdCggdmFsdWUgKTtcbiAgLy8gbm90IGEgcGVyY2VudCBsaWtlICcxMDAlJywgYW5kIGEgbnVtYmVyXG4gIHZhciBpc1ZhbGlkID0gdmFsdWUuaW5kZXhPZignJScpID09IC0xICYmICFpc05hTiggbnVtICk7XG4gIHJldHVybiBpc1ZhbGlkICYmIG51bTtcbn1cblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnZhciBsb2dFcnJvciA9IHR5cGVvZiBjb25zb2xlID09ICd1bmRlZmluZWQnID8gbm9vcCA6XG4gIGZ1bmN0aW9uKCBtZXNzYWdlICkge1xuICAgIGNvbnNvbGUuZXJyb3IoIG1lc3NhZ2UgKTtcbiAgfTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gbWVhc3VyZW1lbnRzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnZhciBtZWFzdXJlbWVudHMgPSBbXG4gICdwYWRkaW5nTGVmdCcsXG4gICdwYWRkaW5nUmlnaHQnLFxuICAncGFkZGluZ1RvcCcsXG4gICdwYWRkaW5nQm90dG9tJyxcbiAgJ21hcmdpbkxlZnQnLFxuICAnbWFyZ2luUmlnaHQnLFxuICAnbWFyZ2luVG9wJyxcbiAgJ21hcmdpbkJvdHRvbScsXG4gICdib3JkZXJMZWZ0V2lkdGgnLFxuICAnYm9yZGVyUmlnaHRXaWR0aCcsXG4gICdib3JkZXJUb3BXaWR0aCcsXG4gICdib3JkZXJCb3R0b21XaWR0aCdcbl07XG5cbnZhciBtZWFzdXJlbWVudHNMZW5ndGggPSBtZWFzdXJlbWVudHMubGVuZ3RoO1xuXG5mdW5jdGlvbiBnZXRaZXJvU2l6ZSgpIHtcbiAgdmFyIHNpemUgPSB7XG4gICAgd2lkdGg6IDAsXG4gICAgaGVpZ2h0OiAwLFxuICAgIGlubmVyV2lkdGg6IDAsXG4gICAgaW5uZXJIZWlnaHQ6IDAsXG4gICAgb3V0ZXJXaWR0aDogMCxcbiAgICBvdXRlckhlaWdodDogMFxuICB9O1xuICBmb3IgKCB2YXIgaT0wOyBpIDwgbWVhc3VyZW1lbnRzTGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIG1lYXN1cmVtZW50ID0gbWVhc3VyZW1lbnRzW2ldO1xuICAgIHNpemVbIG1lYXN1cmVtZW50IF0gPSAwO1xuICB9XG4gIHJldHVybiBzaXplO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBnZXRTdHlsZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vKipcbiAqIGdldFN0eWxlLCBnZXQgc3R5bGUgb2YgZWxlbWVudCwgY2hlY2sgZm9yIEZpcmVmb3ggYnVnXG4gKiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD01NDgzOTdcbiAqL1xuZnVuY3Rpb24gZ2V0U3R5bGUoIGVsZW0gKSB7XG4gIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoIGVsZW0gKTtcbiAgaWYgKCAhc3R5bGUgKSB7XG4gICAgbG9nRXJyb3IoICdTdHlsZSByZXR1cm5lZCAnICsgc3R5bGUgK1xuICAgICAgJy4gQXJlIHlvdSBydW5uaW5nIHRoaXMgY29kZSBpbiBhIGhpZGRlbiBpZnJhbWUgb24gRmlyZWZveD8gJyArXG4gICAgICAnU2VlIGh0dHA6Ly9iaXQubHkvZ2V0c2l6ZWJ1ZzEnICk7XG4gIH1cbiAgcmV0dXJuIHN0eWxlO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBzZXR1cCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG52YXIgaXNTZXR1cCA9IGZhbHNlO1xuXG52YXIgaXNCb3hTaXplT3V0ZXI7XG5cbi8qKlxuICogc2V0dXBcbiAqIGNoZWNrIGlzQm94U2l6ZXJPdXRlclxuICogZG8gb24gZmlyc3QgZ2V0U2l6ZSgpIHJhdGhlciB0aGFuIG9uIHBhZ2UgbG9hZCBmb3IgRmlyZWZveCBidWdcbiAqL1xuZnVuY3Rpb24gc2V0dXAoKSB7XG4gIC8vIHNldHVwIG9uY2VcbiAgaWYgKCBpc1NldHVwICkge1xuICAgIHJldHVybjtcbiAgfVxuICBpc1NldHVwID0gdHJ1ZTtcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBib3ggc2l6aW5nIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbiAgLyoqXG4gICAqIFdlYktpdCBtZWFzdXJlcyB0aGUgb3V0ZXItd2lkdGggb24gc3R5bGUud2lkdGggb24gYm9yZGVyLWJveCBlbGVtc1xuICAgKiBJRSAmIEZpcmVmb3g8MjkgbWVhc3VyZXMgdGhlIGlubmVyLXdpZHRoXG4gICAqL1xuICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGRpdi5zdHlsZS53aWR0aCA9ICcyMDBweCc7XG4gIGRpdi5zdHlsZS5wYWRkaW5nID0gJzFweCAycHggM3B4IDRweCc7XG4gIGRpdi5zdHlsZS5ib3JkZXJTdHlsZSA9ICdzb2xpZCc7XG4gIGRpdi5zdHlsZS5ib3JkZXJXaWR0aCA9ICcxcHggMnB4IDNweCA0cHgnO1xuICBkaXYuc3R5bGUuYm94U2l6aW5nID0gJ2JvcmRlci1ib3gnO1xuXG4gIHZhciBib2R5ID0gZG9jdW1lbnQuYm9keSB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gIGJvZHkuYXBwZW5kQ2hpbGQoIGRpdiApO1xuICB2YXIgc3R5bGUgPSBnZXRTdHlsZSggZGl2ICk7XG5cbiAgZ2V0U2l6ZS5pc0JveFNpemVPdXRlciA9IGlzQm94U2l6ZU91dGVyID0gZ2V0U3R5bGVTaXplKCBzdHlsZS53aWR0aCApID09IDIwMDtcbiAgYm9keS5yZW1vdmVDaGlsZCggZGl2ICk7XG5cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gZ2V0U2l6ZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5mdW5jdGlvbiBnZXRTaXplKCBlbGVtICkge1xuICBzZXR1cCgpO1xuXG4gIC8vIHVzZSBxdWVyeVNlbGV0b3IgaWYgZWxlbSBpcyBzdHJpbmdcbiAgaWYgKCB0eXBlb2YgZWxlbSA9PSAnc3RyaW5nJyApIHtcbiAgICBlbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciggZWxlbSApO1xuICB9XG5cbiAgLy8gZG8gbm90IHByb2NlZWQgb24gbm9uLW9iamVjdHNcbiAgaWYgKCAhZWxlbSB8fCB0eXBlb2YgZWxlbSAhPSAnb2JqZWN0JyB8fCAhZWxlbS5ub2RlVHlwZSApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgc3R5bGUgPSBnZXRTdHlsZSggZWxlbSApO1xuXG4gIC8vIGlmIGhpZGRlbiwgZXZlcnl0aGluZyBpcyAwXG4gIGlmICggc3R5bGUuZGlzcGxheSA9PSAnbm9uZScgKSB7XG4gICAgcmV0dXJuIGdldFplcm9TaXplKCk7XG4gIH1cblxuICB2YXIgc2l6ZSA9IHt9O1xuICBzaXplLndpZHRoID0gZWxlbS5vZmZzZXRXaWR0aDtcbiAgc2l6ZS5oZWlnaHQgPSBlbGVtLm9mZnNldEhlaWdodDtcblxuICB2YXIgaXNCb3JkZXJCb3ggPSBzaXplLmlzQm9yZGVyQm94ID0gc3R5bGUuYm94U2l6aW5nID09ICdib3JkZXItYm94JztcblxuICAvLyBnZXQgYWxsIG1lYXN1cmVtZW50c1xuICBmb3IgKCB2YXIgaT0wOyBpIDwgbWVhc3VyZW1lbnRzTGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIG1lYXN1cmVtZW50ID0gbWVhc3VyZW1lbnRzW2ldO1xuICAgIHZhciB2YWx1ZSA9IHN0eWxlWyBtZWFzdXJlbWVudCBdO1xuICAgIHZhciBudW0gPSBwYXJzZUZsb2F0KCB2YWx1ZSApO1xuICAgIC8vIGFueSAnYXV0bycsICdtZWRpdW0nIHZhbHVlIHdpbGwgYmUgMFxuICAgIHNpemVbIG1lYXN1cmVtZW50IF0gPSAhaXNOYU4oIG51bSApID8gbnVtIDogMDtcbiAgfVxuXG4gIHZhciBwYWRkaW5nV2lkdGggPSBzaXplLnBhZGRpbmdMZWZ0ICsgc2l6ZS5wYWRkaW5nUmlnaHQ7XG4gIHZhciBwYWRkaW5nSGVpZ2h0ID0gc2l6ZS5wYWRkaW5nVG9wICsgc2l6ZS5wYWRkaW5nQm90dG9tO1xuICB2YXIgbWFyZ2luV2lkdGggPSBzaXplLm1hcmdpbkxlZnQgKyBzaXplLm1hcmdpblJpZ2h0O1xuICB2YXIgbWFyZ2luSGVpZ2h0ID0gc2l6ZS5tYXJnaW5Ub3AgKyBzaXplLm1hcmdpbkJvdHRvbTtcbiAgdmFyIGJvcmRlcldpZHRoID0gc2l6ZS5ib3JkZXJMZWZ0V2lkdGggKyBzaXplLmJvcmRlclJpZ2h0V2lkdGg7XG4gIHZhciBib3JkZXJIZWlnaHQgPSBzaXplLmJvcmRlclRvcFdpZHRoICsgc2l6ZS5ib3JkZXJCb3R0b21XaWR0aDtcblxuICB2YXIgaXNCb3JkZXJCb3hTaXplT3V0ZXIgPSBpc0JvcmRlckJveCAmJiBpc0JveFNpemVPdXRlcjtcblxuICAvLyBvdmVyd3JpdGUgd2lkdGggYW5kIGhlaWdodCBpZiB3ZSBjYW4gZ2V0IGl0IGZyb20gc3R5bGVcbiAgdmFyIHN0eWxlV2lkdGggPSBnZXRTdHlsZVNpemUoIHN0eWxlLndpZHRoICk7XG4gIGlmICggc3R5bGVXaWR0aCAhPT0gZmFsc2UgKSB7XG4gICAgc2l6ZS53aWR0aCA9IHN0eWxlV2lkdGggK1xuICAgICAgLy8gYWRkIHBhZGRpbmcgYW5kIGJvcmRlciB1bmxlc3MgaXQncyBhbHJlYWR5IGluY2x1ZGluZyBpdFxuICAgICAgKCBpc0JvcmRlckJveFNpemVPdXRlciA/IDAgOiBwYWRkaW5nV2lkdGggKyBib3JkZXJXaWR0aCApO1xuICB9XG5cbiAgdmFyIHN0eWxlSGVpZ2h0ID0gZ2V0U3R5bGVTaXplKCBzdHlsZS5oZWlnaHQgKTtcbiAgaWYgKCBzdHlsZUhlaWdodCAhPT0gZmFsc2UgKSB7XG4gICAgc2l6ZS5oZWlnaHQgPSBzdHlsZUhlaWdodCArXG4gICAgICAvLyBhZGQgcGFkZGluZyBhbmQgYm9yZGVyIHVubGVzcyBpdCdzIGFscmVhZHkgaW5jbHVkaW5nIGl0XG4gICAgICAoIGlzQm9yZGVyQm94U2l6ZU91dGVyID8gMCA6IHBhZGRpbmdIZWlnaHQgKyBib3JkZXJIZWlnaHQgKTtcbiAgfVxuXG4gIHNpemUuaW5uZXJXaWR0aCA9IHNpemUud2lkdGggLSAoIHBhZGRpbmdXaWR0aCArIGJvcmRlcldpZHRoICk7XG4gIHNpemUuaW5uZXJIZWlnaHQgPSBzaXplLmhlaWdodCAtICggcGFkZGluZ0hlaWdodCArIGJvcmRlckhlaWdodCApO1xuXG4gIHNpemUub3V0ZXJXaWR0aCA9IHNpemUud2lkdGggKyBtYXJnaW5XaWR0aDtcbiAgc2l6ZS5vdXRlckhlaWdodCA9IHNpemUuaGVpZ2h0ICsgbWFyZ2luSGVpZ2h0O1xuXG4gIHJldHVybiBzaXplO1xufVxuXG5yZXR1cm4gZ2V0U2l6ZTtcblxufSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL3hwYXRoJylcbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIERPTUV4Y2VwdGlvbiB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UsIG5hbWUpIHtcbiAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlXG4gICAgdGhpcy5uYW1lID0gbmFtZVxuICAgIHRoaXMuc3RhY2sgPSAobmV3IEVycm9yKCkpLnN0YWNrXG4gIH1cbn1cblxuRE9NRXhjZXB0aW9uLnByb3RvdHlwZSA9IG5ldyBFcnJvcigpXG5cbkRPTUV4Y2VwdGlvbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBgJHt0aGlzLm5hbWV9OiAke3RoaXMubWVzc2FnZX1gXG59XG4iLCJpbXBvcnQgZ2V0RG9jdW1lbnQgZnJvbSAnZ2V0LWRvY3VtZW50J1xuXG5pbXBvcnQgRE9NRXhjZXB0aW9uIGZyb20gJy4vZG9tLWV4Y2VwdGlvbidcblxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9YUGF0aFJlc3VsdFxuY29uc3QgRklSU1RfT1JERVJFRF9OT0RFX1RZUEUgPSA5XG5cbi8vIERlZmF1bHQgbmFtZXNwYWNlIGZvciBYSFRNTCBkb2N1bWVudHNcbmNvbnN0IEhUTUxfTkFNRVNQQUNFID0gJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwnXG5cblxuLyoqXG4gKiBDb21wdXRlIGFuIFhQYXRoIGV4cHJlc3Npb24gZm9yIHRoZSBnaXZlbiBub2RlLlxuICpcbiAqIElmIHRoZSBvcHRpb25hbCBwYXJhbWV0ZXIgYHJvb3RgIGlzIHN1cHBsaWVkLCB0aGUgY29tcHV0ZWQgWFBhdGggZXhwcmVzc2lvblxuICogd2lsbCBiZSByZWxhdGl2ZSB0byBpdC4gT3RoZXJ3aXNlLCB0aGUgcm9vdCBlbGVtZW50IGlzIHRoZSByb290IG9mIHRoZVxuICogZG9jdW1lbnQgdG8gd2hpY2ggYG5vZGVgIGJlbG9uZ3MuXG4gKlxuICogQHBhcmFtIHtOb2RlfSBub2RlIFRoZSBub2RlIGZvciB3aGljaCB0byBjb21wdXRlIGFuIFhQYXRoIGV4cHJlc3Npb24uXG4gKiBAcGFyYW0ge05vZGV9IFtyb290XSBUaGUgcm9vdCBjb250ZXh0IGZvciB0aGUgWFBhdGggZXhwcmVzc2lvbi5cbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tTm9kZShub2RlLCByb290ID0gbnVsbCkge1xuICBpZiAobm9kZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdtaXNzaW5nIHJlcXVpcmVkIHBhcmFtZXRlciBcIm5vZGVcIicpXG4gIH1cblxuICByb290ID0gcm9vdCB8fCBnZXREb2N1bWVudChub2RlKVxuXG4gIGxldCBwYXRoID0gJy8nXG4gIHdoaWxlIChub2RlICE9PSByb290KSB7XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICBsZXQgbWVzc2FnZSA9ICdUaGUgc3VwcGxpZWQgbm9kZSBpcyBub3QgY29udGFpbmVkIGJ5IHRoZSByb290IG5vZGUuJ1xuICAgICAgbGV0IG5hbWUgPSAnSW52YWxpZE5vZGVUeXBlRXJyb3InXG4gICAgICB0aHJvdyBuZXcgRE9NRXhjZXB0aW9uKG1lc3NhZ2UsIG5hbWUpXG4gICAgfVxuICAgIHBhdGggPSBgLyR7bm9kZU5hbWUobm9kZSl9WyR7bm9kZVBvc2l0aW9uKG5vZGUpfV0ke3BhdGh9YFxuICAgIG5vZGUgPSBub2RlLnBhcmVudE5vZGVcbiAgfVxuICByZXR1cm4gcGF0aC5yZXBsYWNlKC9cXC8kLywgJycpXG59XG5cblxuLyoqXG4gKiBGaW5kIGEgbm9kZSB1c2luZyBhbiBYUGF0aCByZWxhdGl2ZSB0byB0aGUgZ2l2ZW4gcm9vdCBub2RlLlxuICpcbiAqIFRoZSBYUGF0aCBleHByZXNzaW9ucyBhcmUgZXZhbHVhdGVkIHJlbGF0aXZlIHRvIHRoZSBOb2RlIGFyZ3VtZW50IGByb290YC5cbiAqXG4gKiBJZiB0aGUgb3B0aW9uYWwgcGFyYW1ldGVyIGByZXNvbHZlcmAgaXMgc3VwcGxpZWQsIGl0IHdpbGwgYmUgdXNlZCB0byByZXNvbHZlXG4gKiBhbnkgbmFtZXNwYWNlcyB3aXRoaW4gdGhlIFhQYXRoLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIEFuIFhQYXRoIFN0cmluZyB0byBldmFsdWF0ZS5cbiAqIEBwYXJhbSB7Tm9kZX0gcm9vdCBUaGUgcm9vdCBjb250ZXh0IGZvciB0aGUgWFBhdGggZXhwcmVzc2lvbi5cbiAqIEByZXR1cm5zIHtOb2RlfG51bGx9IFRoZSBmaXJzdCBtYXRjaGluZyBOb2RlIG9yIG51bGwgaWYgbm9uZSBpcyBmb3VuZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvTm9kZShwYXRoLCByb290LCByZXNvbHZlciA9IG51bGwpIHtcbiAgaWYgKHBhdGggPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFcnJvcignbWlzc2luZyByZXF1aXJlZCBwYXJhbWV0ZXIgXCJwYXRoXCInKVxuICB9XG4gIGlmIChyb290ID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ21pc3NpbmcgcmVxdWlyZWQgcGFyYW1ldGVyIFwicm9vdFwiJylcbiAgfVxuXG4gIC8vIE1ha2UgdGhlIHBhdGggcmVsYXRpdmUgdG8gdGhlIHJvb3QsIGlmIG5vdCB0aGUgZG9jdW1lbnQuXG4gIGxldCBkb2N1bWVudCA9IGdldERvY3VtZW50KHJvb3QpXG4gIGlmIChyb290ICE9PSBkb2N1bWVudCkgcGF0aCA9IHBhdGgucmVwbGFjZSgvXlxcLy8sICcuLycpXG5cbiAgLy8gTWFrZSBhIGRlZmF1bHQgcmVzb2x2ZXIuXG4gIGxldCBkb2N1bWVudEVsZW1lbnQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRcbiAgaWYgKHJlc29sdmVyID09PSBudWxsICYmIGRvY3VtZW50RWxlbWVudC5sb29rdXBOYW1lc3BhY2VVUkkpIHtcbiAgICBsZXQgZGVmYXVsdE5TID0gZG9jdW1lbnRFbGVtZW50Lmxvb2t1cE5hbWVzcGFjZVVSSShudWxsKSB8fCBIVE1MX05BTUVTUEFDRVxuICAgIHJlc29sdmVyID0gKHByZWZpeCkgPT4ge1xuICAgICAgbGV0IG5zID0geydfZGVmYXVsdF8nOiBkZWZhdWx0TlN9XG4gICAgICByZXR1cm4gbnNbcHJlZml4XSB8fCBkb2N1bWVudEVsZW1lbnQubG9va3VwTmFtZXNwYWNlVVJJKHByZWZpeClcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzb2x2ZShwYXRoLCByb290LCByZXNvbHZlcilcbn1cblxuXG4vLyBHZXQgdGhlIFhQYXRoIG5vZGUgbmFtZS5cbmZ1bmN0aW9uIG5vZGVOYW1lKG5vZGUpIHtcbiAgc3dpdGNoIChub2RlLm5vZGVOYW1lKSB7XG4gIGNhc2UgJyN0ZXh0JzogcmV0dXJuICd0ZXh0KCknXG4gIGNhc2UgJyNjb21tZW50JzogcmV0dXJuICdjb21tZW50KCknXG4gIGNhc2UgJyNjZGF0YS1zZWN0aW9uJzogcmV0dXJuICdjZGF0YS1zZWN0aW9uKCknXG4gIGRlZmF1bHQ6IHJldHVybiBub2RlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKClcbiAgfVxufVxuXG5cbi8vIEdldCB0aGUgb3JkaW5hbCBwb3NpdGlvbiBvZiB0aGlzIG5vZGUgYW1vbmcgaXRzIHNpYmxpbmdzIG9mIHRoZSBzYW1lIG5hbWUuXG5mdW5jdGlvbiBub2RlUG9zaXRpb24obm9kZSkge1xuICBsZXQgbmFtZSA9IG5vZGUubm9kZU5hbWVcbiAgbGV0IHBvc2l0aW9uID0gMVxuICB3aGlsZSAoKG5vZGUgPSBub2RlLnByZXZpb3VzU2libGluZykpIHtcbiAgICBpZiAobm9kZS5ub2RlTmFtZSA9PT0gbmFtZSkgcG9zaXRpb24gKz0gMVxuICB9XG4gIHJldHVybiBwb3NpdGlvblxufVxuXG5cbi8vIEZpbmQgYSBzaW5nbGUgbm9kZSB3aXRoIFhQYXRoIGBwYXRoYFxuZnVuY3Rpb24gcmVzb2x2ZShwYXRoLCByb290LCByZXNvbHZlcikge1xuICB0cnkge1xuICAgIC8vIEFkZCBhIGRlZmF1bHQgdmFsdWUgdG8gZWFjaCBwYXRoIHBhcnQgbGFja2luZyBhIHByZWZpeC5cbiAgICBsZXQgbnNwYXRoID0gcGF0aC5yZXBsYWNlKC9cXC8oPyFcXC4pKFteXFwvOlxcKF0rKSg/PVxcL3wkKS9nLCAnL19kZWZhdWx0XzokMScpXG4gICAgcmV0dXJuIHBsYXRmb3JtUmVzb2x2ZShuc3BhdGgsIHJvb3QsIHJlc29sdmVyKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gZmFsbGJhY2tSZXNvbHZlKHBhdGgsIHJvb3QpXG4gIH1cbn1cblxuXG4vLyBGaW5kIGEgc2luZ2xlIG5vZGUgd2l0aCBYUGF0aCBgcGF0aGAgdXNpbmcgdGhlIHNpbXBsZSwgYnVpbHQtaW4gZXZhbHVhdG9yLlxuZnVuY3Rpb24gZmFsbGJhY2tSZXNvbHZlKHBhdGgsIHJvb3QpIHtcbiAgbGV0IHN0ZXBzID0gcGF0aC5zcGxpdChcIi9cIilcbiAgbGV0IG5vZGUgPSByb290XG4gIHdoaWxlIChub2RlKSB7XG4gICAgbGV0IHN0ZXAgPSBzdGVwcy5zaGlmdCgpXG4gICAgaWYgKHN0ZXAgPT09IHVuZGVmaW5lZCkgYnJlYWtcbiAgICBpZiAoc3RlcCA9PT0gJy4nKSBjb250aW51ZVxuICAgIGxldCBbbmFtZSwgcG9zaXRpb25dID0gc3RlcC5zcGxpdCgvW1xcW1xcXV0vKVxuICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoJ19kZWZhdWx0XzonLCAnJylcbiAgICBwb3NpdGlvbiA9IHBvc2l0aW9uID8gcGFyc2VJbnQocG9zaXRpb24pIDogMVxuICAgIG5vZGUgPSBmaW5kQ2hpbGQobm9kZSwgbmFtZSwgcG9zaXRpb24pXG4gIH1cbiAgcmV0dXJuIG5vZGVcbn1cblxuXG4vLyBGaW5kIGEgc2luZ2xlIG5vZGUgd2l0aCBYUGF0aCBgcGF0aGAgdXNpbmcgYGRvY3VtZW50LmV2YWx1YXRlYC5cbmZ1bmN0aW9uIHBsYXRmb3JtUmVzb2x2ZShwYXRoLCByb290LCByZXNvbHZlcikge1xuICBsZXQgZG9jdW1lbnQgPSBnZXREb2N1bWVudChyb290KVxuICBsZXQgciA9IGRvY3VtZW50LmV2YWx1YXRlKHBhdGgsIHJvb3QsIHJlc29sdmVyLCBGSVJTVF9PUkRFUkVEX05PREVfVFlQRSwgbnVsbClcbiAgcmV0dXJuIHIuc2luZ2xlTm9kZVZhbHVlXG59XG5cblxuLy8gRmluZCB0aGUgY2hpbGQgb2YgdGhlIGdpdmVuIG5vZGUgYnkgbmFtZSBhbmQgb3JkaW5hbCBwb3NpdGlvbi5cbmZ1bmN0aW9uIGZpbmRDaGlsZChub2RlLCBuYW1lLCBwb3NpdGlvbikge1xuICBmb3IgKG5vZGUgPSBub2RlLmZpcnN0Q2hpbGQgOyBub2RlIDsgbm9kZSA9IG5vZGUubmV4dFNpYmxpbmcpIHtcbiAgICBpZiAobm9kZU5hbWUobm9kZSkgPT09IG5hbWUgJiYgLS1wb3NpdGlvbiA9PT0gMCkgYnJlYWtcbiAgfVxuICByZXR1cm4gbm9kZVxufVxuIiwiLyohXG4gKiBVbmlkcmFnZ2VyIHYyLjEuMFxuICogRHJhZ2dhYmxlIGJhc2UgY2xhc3NcbiAqIE1JVCBsaWNlbnNlXG4gKi9cblxuLypqc2hpbnQgYnJvd3NlcjogdHJ1ZSwgdW51c2VkOiB0cnVlLCB1bmRlZjogdHJ1ZSwgc3RyaWN0OiB0cnVlICovXG5cbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIC8qanNoaW50IHN0cmljdDogZmFsc2UgKi8gLypnbG9iYWxzIGRlZmluZSwgbW9kdWxlLCByZXF1aXJlICovXG5cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIFtcbiAgICAgICd1bmlwb2ludGVyL3VuaXBvaW50ZXInXG4gICAgXSwgZnVuY3Rpb24oIFVuaXBvaW50ZXIgKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeSggd2luZG93LCBVbmlwb2ludGVyICk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICByZXF1aXJlKCd1bmlwb2ludGVyJylcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgd2luZG93LlVuaWRyYWdnZXIgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgd2luZG93LlVuaXBvaW50ZXJcbiAgICApO1xuICB9XG5cbn0oIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSggd2luZG93LCBVbmlwb2ludGVyICkge1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG5mdW5jdGlvbiBub29wKCkge31cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gVW5pZHJhZ2dlciAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5mdW5jdGlvbiBVbmlkcmFnZ2VyKCkge31cblxuLy8gaW5oZXJpdCBVbmlwb2ludGVyICYgRXZFbWl0dGVyXG52YXIgcHJvdG8gPSBVbmlkcmFnZ2VyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFVuaXBvaW50ZXIucHJvdG90eXBlICk7XG5cbi8vIC0tLS0tIGJpbmQgc3RhcnQgLS0tLS0gLy9cblxucHJvdG8uYmluZEhhbmRsZXMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fYmluZEhhbmRsZXMoIHRydWUgKTtcbn07XG5cbnByb3RvLnVuYmluZEhhbmRsZXMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fYmluZEhhbmRsZXMoIGZhbHNlICk7XG59O1xuXG52YXIgbmF2aWdhdG9yID0gd2luZG93Lm5hdmlnYXRvcjtcbi8qKlxuICogd29ya3MgYXMgdW5iaW5kZXIsIGFzIHlvdSBjYW4gLmJpbmRIYW5kbGVzKCBmYWxzZSApIHRvIHVuYmluZFxuICogQHBhcmFtIHtCb29sZWFufSBpc0JpbmQgLSB3aWxsIHVuYmluZCBpZiBmYWxzZXlcbiAqL1xucHJvdG8uX2JpbmRIYW5kbGVzID0gZnVuY3Rpb24oIGlzQmluZCApIHtcbiAgLy8gbXVuZ2UgaXNCaW5kLCBkZWZhdWx0IHRvIHRydWVcbiAgaXNCaW5kID0gaXNCaW5kID09PSB1bmRlZmluZWQgPyB0cnVlIDogISFpc0JpbmQ7XG4gIC8vIGV4dHJhIGJpbmQgbG9naWNcbiAgdmFyIGJpbmRlckV4dHJhO1xuICBpZiAoIG5hdmlnYXRvci5wb2ludGVyRW5hYmxlZCApIHtcbiAgICBiaW5kZXJFeHRyYSA9IGZ1bmN0aW9uKCBoYW5kbGUgKSB7XG4gICAgICAvLyBkaXNhYmxlIHNjcm9sbGluZyBvbiB0aGUgZWxlbWVudFxuICAgICAgaGFuZGxlLnN0eWxlLnRvdWNoQWN0aW9uID0gaXNCaW5kID8gJ25vbmUnIDogJyc7XG4gICAgfTtcbiAgfSBlbHNlIGlmICggbmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQgKSB7XG4gICAgYmluZGVyRXh0cmEgPSBmdW5jdGlvbiggaGFuZGxlICkge1xuICAgICAgLy8gZGlzYWJsZSBzY3JvbGxpbmcgb24gdGhlIGVsZW1lbnRcbiAgICAgIGhhbmRsZS5zdHlsZS5tc1RvdWNoQWN0aW9uID0gaXNCaW5kID8gJ25vbmUnIDogJyc7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBiaW5kZXJFeHRyYSA9IG5vb3A7XG4gIH1cbiAgLy8gYmluZCBlYWNoIGhhbmRsZVxuICB2YXIgYmluZE1ldGhvZCA9IGlzQmluZCA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgZm9yICggdmFyIGk9MDsgaSA8IHRoaXMuaGFuZGxlcy5sZW5ndGg7IGkrKyApIHtcbiAgICB2YXIgaGFuZGxlID0gdGhpcy5oYW5kbGVzW2ldO1xuICAgIHRoaXMuX2JpbmRTdGFydEV2ZW50KCBoYW5kbGUsIGlzQmluZCApO1xuICAgIGJpbmRlckV4dHJhKCBoYW5kbGUgKTtcbiAgICBoYW5kbGVbIGJpbmRNZXRob2QgXSggJ2NsaWNrJywgdGhpcyApO1xuICB9XG59O1xuXG4vLyAtLS0tLSBzdGFydCBldmVudCAtLS0tLSAvL1xuXG4vKipcbiAqIHBvaW50ZXIgc3RhcnRcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50IG9yIFRvdWNofSBwb2ludGVyXG4gKi9cbnByb3RvLnBvaW50ZXJEb3duID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICAvLyBkaXNtaXNzIHJhbmdlIHNsaWRlcnNcbiAgaWYgKCBldmVudC50YXJnZXQubm9kZU5hbWUgPT0gJ0lOUFVUJyAmJiBldmVudC50YXJnZXQudHlwZSA9PSAncmFuZ2UnICkge1xuICAgIC8vIHJlc2V0IHBvaW50ZXJEb3duIGxvZ2ljXG4gICAgdGhpcy5pc1BvaW50ZXJEb3duID0gZmFsc2U7XG4gICAgZGVsZXRlIHRoaXMucG9pbnRlcklkZW50aWZpZXI7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5fZHJhZ1BvaW50ZXJEb3duKCBldmVudCwgcG9pbnRlciApO1xuICAvLyBrbHVkZ2UgdG8gYmx1ciBmb2N1c2VkIGlucHV0cyBpbiBkcmFnZ2VyXG4gIHZhciBmb2N1c2VkID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgaWYgKCBmb2N1c2VkICYmIGZvY3VzZWQuYmx1ciApIHtcbiAgICBmb2N1c2VkLmJsdXIoKTtcbiAgfVxuICAvLyBiaW5kIG1vdmUgYW5kIGVuZCBldmVudHNcbiAgdGhpcy5fYmluZFBvc3RTdGFydEV2ZW50cyggZXZlbnQgKTtcbiAgdGhpcy5lbWl0RXZlbnQoICdwb2ludGVyRG93bicsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xufTtcblxuLy8gYmFzZSBwb2ludGVyIGRvd24gbG9naWNcbnByb3RvLl9kcmFnUG9pbnRlckRvd24gPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIC8vIHRyYWNrIHRvIHNlZSB3aGVuIGRyYWdnaW5nIHN0YXJ0c1xuICB0aGlzLnBvaW50ZXJEb3duUG9pbnQgPSBVbmlwb2ludGVyLmdldFBvaW50ZXJQb2ludCggcG9pbnRlciApO1xuXG4gIHZhciBjYW5QcmV2ZW50RGVmYXVsdCA9IHRoaXMuY2FuUHJldmVudERlZmF1bHRPblBvaW50ZXJEb3duKCBldmVudCwgcG9pbnRlciApO1xuICBpZiAoIGNhblByZXZlbnREZWZhdWx0ICkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH1cbn07XG5cbi8vIG92ZXJ3cml0ZWFibGUgbWV0aG9kIHNvIEZsaWNraXR5IGNhbiBwcmV2ZW50IGZvciBzY3JvbGxpbmdcbnByb3RvLmNhblByZXZlbnREZWZhdWx0T25Qb2ludGVyRG93biA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgLy8gcHJldmVudCBkZWZhdWx0LCB1bmxlc3MgdG91Y2hzdGFydCBvciA8c2VsZWN0PlxuICByZXR1cm4gZXZlbnQudGFyZ2V0Lm5vZGVOYW1lICE9ICdTRUxFQ1QnO1xufTtcblxuLy8gLS0tLS0gbW92ZSBldmVudCAtLS0tLSAvL1xuXG4vKipcbiAqIGRyYWcgbW92ZVxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgb3IgVG91Y2h9IHBvaW50ZXJcbiAqL1xucHJvdG8ucG9pbnRlck1vdmUgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHZhciBtb3ZlVmVjdG9yID0gdGhpcy5fZHJhZ1BvaW50ZXJNb3ZlKCBldmVudCwgcG9pbnRlciApO1xuICB0aGlzLmVtaXRFdmVudCggJ3BvaW50ZXJNb3ZlJywgWyBldmVudCwgcG9pbnRlciwgbW92ZVZlY3RvciBdICk7XG4gIHRoaXMuX2RyYWdNb3ZlKCBldmVudCwgcG9pbnRlciwgbW92ZVZlY3RvciApO1xufTtcblxuLy8gYmFzZSBwb2ludGVyIG1vdmUgbG9naWNcbnByb3RvLl9kcmFnUG9pbnRlck1vdmUgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHZhciBtb3ZlUG9pbnQgPSBVbmlwb2ludGVyLmdldFBvaW50ZXJQb2ludCggcG9pbnRlciApO1xuICB2YXIgbW92ZVZlY3RvciA9IHtcbiAgICB4OiBtb3ZlUG9pbnQueCAtIHRoaXMucG9pbnRlckRvd25Qb2ludC54LFxuICAgIHk6IG1vdmVQb2ludC55IC0gdGhpcy5wb2ludGVyRG93blBvaW50LnlcbiAgfTtcbiAgLy8gc3RhcnQgZHJhZyBpZiBwb2ludGVyIGhhcyBtb3ZlZCBmYXIgZW5vdWdoIHRvIHN0YXJ0IGRyYWdcbiAgaWYgKCAhdGhpcy5pc0RyYWdnaW5nICYmIHRoaXMuaGFzRHJhZ1N0YXJ0ZWQoIG1vdmVWZWN0b3IgKSApIHtcbiAgICB0aGlzLl9kcmFnU3RhcnQoIGV2ZW50LCBwb2ludGVyICk7XG4gIH1cbiAgcmV0dXJuIG1vdmVWZWN0b3I7XG59O1xuXG4vLyBjb25kaXRpb24gaWYgcG9pbnRlciBoYXMgbW92ZWQgZmFyIGVub3VnaCB0byBzdGFydCBkcmFnXG5wcm90by5oYXNEcmFnU3RhcnRlZCA9IGZ1bmN0aW9uKCBtb3ZlVmVjdG9yICkge1xuICByZXR1cm4gTWF0aC5hYnMoIG1vdmVWZWN0b3IueCApID4gMyB8fCBNYXRoLmFicyggbW92ZVZlY3Rvci55ICkgPiAzO1xufTtcblxuXG4vLyAtLS0tLSBlbmQgZXZlbnQgLS0tLS0gLy9cblxuLyoqXG4gKiBwb2ludGVyIHVwXG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICogQHBhcmFtIHtFdmVudCBvciBUb3VjaH0gcG9pbnRlclxuICovXG5wcm90by5wb2ludGVyVXAgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMuZW1pdEV2ZW50KCAncG9pbnRlclVwJywgWyBldmVudCwgcG9pbnRlciBdICk7XG4gIHRoaXMuX2RyYWdQb2ludGVyVXAoIGV2ZW50LCBwb2ludGVyICk7XG59O1xuXG5wcm90by5fZHJhZ1BvaW50ZXJVcCA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgaWYgKCB0aGlzLmlzRHJhZ2dpbmcgKSB7XG4gICAgdGhpcy5fZHJhZ0VuZCggZXZlbnQsIHBvaW50ZXIgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBwb2ludGVyIGRpZG4ndCBtb3ZlIGVub3VnaCBmb3IgZHJhZyB0byBzdGFydFxuICAgIHRoaXMuX3N0YXRpY0NsaWNrKCBldmVudCwgcG9pbnRlciApO1xuICB9XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBkcmFnIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8vIGRyYWdTdGFydFxucHJvdG8uX2RyYWdTdGFydCA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5pc0RyYWdnaW5nID0gdHJ1ZTtcbiAgdGhpcy5kcmFnU3RhcnRQb2ludCA9IFVuaXBvaW50ZXIuZ2V0UG9pbnRlclBvaW50KCBwb2ludGVyICk7XG4gIC8vIHByZXZlbnQgY2xpY2tzXG4gIHRoaXMuaXNQcmV2ZW50aW5nQ2xpY2tzID0gdHJ1ZTtcblxuICB0aGlzLmRyYWdTdGFydCggZXZlbnQsIHBvaW50ZXIgKTtcbn07XG5cbnByb3RvLmRyYWdTdGFydCA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5lbWl0RXZlbnQoICdkcmFnU3RhcnQnLCBbIGV2ZW50LCBwb2ludGVyIF0gKTtcbn07XG5cbi8vIGRyYWdNb3ZlXG5wcm90by5fZHJhZ01vdmUgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIsIG1vdmVWZWN0b3IgKSB7XG4gIC8vIGRvIG5vdCBkcmFnIGlmIG5vdCBkcmFnZ2luZyB5ZXRcbiAgaWYgKCAhdGhpcy5pc0RyYWdnaW5nICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMuZHJhZ01vdmUoIGV2ZW50LCBwb2ludGVyLCBtb3ZlVmVjdG9yICk7XG59O1xuXG5wcm90by5kcmFnTW92ZSA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciwgbW92ZVZlY3RvciApIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgdGhpcy5lbWl0RXZlbnQoICdkcmFnTW92ZScsIFsgZXZlbnQsIHBvaW50ZXIsIG1vdmVWZWN0b3IgXSApO1xufTtcblxuLy8gZHJhZ0VuZFxucHJvdG8uX2RyYWdFbmQgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIC8vIHNldCBmbGFnc1xuICB0aGlzLmlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgLy8gcmUtZW5hYmxlIGNsaWNraW5nIGFzeW5jXG4gIHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuICAgIGRlbGV0ZSB0aGlzLmlzUHJldmVudGluZ0NsaWNrcztcbiAgfS5iaW5kKCB0aGlzICkgKTtcblxuICB0aGlzLmRyYWdFbmQoIGV2ZW50LCBwb2ludGVyICk7XG59O1xuXG5wcm90by5kcmFnRW5kID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLmVtaXRFdmVudCggJ2RyYWdFbmQnLCBbIGV2ZW50LCBwb2ludGVyIF0gKTtcbn07XG5cbi8vIC0tLS0tIG9uY2xpY2sgLS0tLS0gLy9cblxuLy8gaGFuZGxlIGFsbCBjbGlja3MgYW5kIHByZXZlbnQgY2xpY2tzIHdoZW4gZHJhZ2dpbmdcbnByb3RvLm9uY2xpY2sgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIGlmICggdGhpcy5pc1ByZXZlbnRpbmdDbGlja3MgKSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgfVxufTtcblxuLy8gLS0tLS0gc3RhdGljQ2xpY2sgLS0tLS0gLy9cblxuLy8gdHJpZ2dlcmVkIGFmdGVyIHBvaW50ZXIgZG93biAmIHVwIHdpdGggbm8vdGlueSBtb3ZlbWVudFxucHJvdG8uX3N0YXRpY0NsaWNrID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICAvLyBpZ25vcmUgZW11bGF0ZWQgbW91c2UgdXAgY2xpY2tzXG4gIGlmICggdGhpcy5pc0lnbm9yaW5nTW91c2VVcCAmJiBldmVudC50eXBlID09ICdtb3VzZXVwJyApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBhbGxvdyBjbGljayBpbiA8aW5wdXQ+cyBhbmQgPHRleHRhcmVhPnNcbiAgdmFyIG5vZGVOYW1lID0gZXZlbnQudGFyZ2V0Lm5vZGVOYW1lO1xuICBpZiAoIG5vZGVOYW1lID09ICdJTlBVVCcgfHwgbm9kZU5hbWUgPT0gJ1RFWFRBUkVBJyApIHtcbiAgICBldmVudC50YXJnZXQuZm9jdXMoKTtcbiAgfVxuICB0aGlzLnN0YXRpY0NsaWNrKCBldmVudCwgcG9pbnRlciApO1xuXG4gIC8vIHNldCBmbGFnIGZvciBlbXVsYXRlZCBjbGlja3MgMzAwbXMgYWZ0ZXIgdG91Y2hlbmRcbiAgaWYgKCBldmVudC50eXBlICE9ICdtb3VzZXVwJyApIHtcbiAgICB0aGlzLmlzSWdub3JpbmdNb3VzZVVwID0gdHJ1ZTtcbiAgICAvLyByZXNldCBmbGFnIGFmdGVyIDMwMG1zXG4gICAgc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG4gICAgICBkZWxldGUgdGhpcy5pc0lnbm9yaW5nTW91c2VVcDtcbiAgICB9LmJpbmQoIHRoaXMgKSwgNDAwICk7XG4gIH1cbn07XG5cbnByb3RvLnN0YXRpY0NsaWNrID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLmVtaXRFdmVudCggJ3N0YXRpY0NsaWNrJywgWyBldmVudCwgcG9pbnRlciBdICk7XG59O1xuXG4vLyAtLS0tLSB1dGlscyAtLS0tLSAvL1xuXG5VbmlkcmFnZ2VyLmdldFBvaW50ZXJQb2ludCA9IFVuaXBvaW50ZXIuZ2V0UG9pbnRlclBvaW50O1xuXG4vLyAtLS0tLSAgLS0tLS0gLy9cblxucmV0dXJuIFVuaWRyYWdnZXI7XG5cbn0pKTtcbiIsIi8qIVxuICogVW5pcG9pbnRlciB2Mi4xLjBcbiAqIGJhc2UgY2xhc3MgZm9yIGRvaW5nIG9uZSB0aGluZyB3aXRoIHBvaW50ZXIgZXZlbnRcbiAqIE1JVCBsaWNlbnNlXG4gKi9cblxuLypqc2hpbnQgYnJvd3NlcjogdHJ1ZSwgdW5kZWY6IHRydWUsIHVudXNlZDogdHJ1ZSwgc3RyaWN0OiB0cnVlICovXG5cbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIC8qIGpzaGludCBzdHJpY3Q6IGZhbHNlICovIC8qZ2xvYmFsIGRlZmluZSwgbW9kdWxlLCByZXF1aXJlICovXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EXG4gICAgZGVmaW5lKCBbXG4gICAgICAnZXYtZW1pdHRlci9ldi1lbWl0dGVyJ1xuICAgIF0sIGZ1bmN0aW9uKCBFdkVtaXR0ZXIgKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeSggd2luZG93LCBFdkVtaXR0ZXIgKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHJlcXVpcmUoJ2V2LWVtaXR0ZXInKVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICB3aW5kb3cuVW5pcG9pbnRlciA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICB3aW5kb3cuRXZFbWl0dGVyXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgRXZFbWl0dGVyICkge1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5mdW5jdGlvbiBVbmlwb2ludGVyKCkge31cblxuLy8gaW5oZXJpdCBFdkVtaXR0ZXJcbnZhciBwcm90byA9IFVuaXBvaW50ZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXZFbWl0dGVyLnByb3RvdHlwZSApO1xuXG5wcm90by5iaW5kU3RhcnRFdmVudCA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICB0aGlzLl9iaW5kU3RhcnRFdmVudCggZWxlbSwgdHJ1ZSApO1xufTtcblxucHJvdG8udW5iaW5kU3RhcnRFdmVudCA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICB0aGlzLl9iaW5kU3RhcnRFdmVudCggZWxlbSwgZmFsc2UgKTtcbn07XG5cbi8qKlxuICogd29ya3MgYXMgdW5iaW5kZXIsIGFzIHlvdSBjYW4gLl9iaW5kU3RhcnQoIGZhbHNlICkgdG8gdW5iaW5kXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlzQmluZCAtIHdpbGwgdW5iaW5kIGlmIGZhbHNleVxuICovXG5wcm90by5fYmluZFN0YXJ0RXZlbnQgPSBmdW5jdGlvbiggZWxlbSwgaXNCaW5kICkge1xuICAvLyBtdW5nZSBpc0JpbmQsIGRlZmF1bHQgdG8gdHJ1ZVxuICBpc0JpbmQgPSBpc0JpbmQgPT09IHVuZGVmaW5lZCA/IHRydWUgOiAhIWlzQmluZDtcbiAgdmFyIGJpbmRNZXRob2QgPSBpc0JpbmQgPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG5cbiAgaWYgKCB3aW5kb3cubmF2aWdhdG9yLnBvaW50ZXJFbmFibGVkICkge1xuICAgIC8vIFczQyBQb2ludGVyIEV2ZW50cywgSUUxMS4gU2VlIGh0dHBzOi8vY29kZXJ3YWxsLmNvbS9wL21mcmVjYVxuICAgIGVsZW1bIGJpbmRNZXRob2QgXSggJ3BvaW50ZXJkb3duJywgdGhpcyApO1xuICB9IGVsc2UgaWYgKCB3aW5kb3cubmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQgKSB7XG4gICAgLy8gSUUxMCBQb2ludGVyIEV2ZW50c1xuICAgIGVsZW1bIGJpbmRNZXRob2QgXSggJ01TUG9pbnRlckRvd24nLCB0aGlzICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gbGlzdGVuIGZvciBib3RoLCBmb3IgZGV2aWNlcyBsaWtlIENocm9tZSBQaXhlbFxuICAgIGVsZW1bIGJpbmRNZXRob2QgXSggJ21vdXNlZG93bicsIHRoaXMgKTtcbiAgICBlbGVtWyBiaW5kTWV0aG9kIF0oICd0b3VjaHN0YXJ0JywgdGhpcyApO1xuICB9XG59O1xuXG4vLyB0cmlnZ2VyIGhhbmRsZXIgbWV0aG9kcyBmb3IgZXZlbnRzXG5wcm90by5oYW5kbGVFdmVudCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdmFyIG1ldGhvZCA9ICdvbicgKyBldmVudC50eXBlO1xuICBpZiAoIHRoaXNbIG1ldGhvZCBdICkge1xuICAgIHRoaXNbIG1ldGhvZCBdKCBldmVudCApO1xuICB9XG59O1xuXG4vLyByZXR1cm5zIHRoZSB0b3VjaCB0aGF0IHdlJ3JlIGtlZXBpbmcgdHJhY2sgb2ZcbnByb3RvLmdldFRvdWNoID0gZnVuY3Rpb24oIHRvdWNoZXMgKSB7XG4gIGZvciAoIHZhciBpPTA7IGkgPCB0b3VjaGVzLmxlbmd0aDsgaSsrICkge1xuICAgIHZhciB0b3VjaCA9IHRvdWNoZXNbaV07XG4gICAgaWYgKCB0b3VjaC5pZGVudGlmaWVyID09IHRoaXMucG9pbnRlcklkZW50aWZpZXIgKSB7XG4gICAgICByZXR1cm4gdG91Y2g7XG4gICAgfVxuICB9XG59O1xuXG4vLyAtLS0tLSBzdGFydCBldmVudCAtLS0tLSAvL1xuXG5wcm90by5vbm1vdXNlZG93biA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgLy8gZGlzbWlzcyBjbGlja3MgZnJvbSByaWdodCBvciBtaWRkbGUgYnV0dG9uc1xuICB2YXIgYnV0dG9uID0gZXZlbnQuYnV0dG9uO1xuICBpZiAoIGJ1dHRvbiAmJiAoIGJ1dHRvbiAhPT0gMCAmJiBidXR0b24gIT09IDEgKSApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5fcG9pbnRlckRvd24oIGV2ZW50LCBldmVudCApO1xufTtcblxucHJvdG8ub250b3VjaHN0YXJ0ID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB0aGlzLl9wb2ludGVyRG93biggZXZlbnQsIGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdICk7XG59O1xuXG5wcm90by5vbk1TUG9pbnRlckRvd24gPVxucHJvdG8ub25wb2ludGVyZG93biA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdGhpcy5fcG9pbnRlckRvd24oIGV2ZW50LCBldmVudCApO1xufTtcblxuLyoqXG4gKiBwb2ludGVyIHN0YXJ0XG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICogQHBhcmFtIHtFdmVudCBvciBUb3VjaH0gcG9pbnRlclxuICovXG5wcm90by5fcG9pbnRlckRvd24gPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIC8vIGRpc21pc3Mgb3RoZXIgcG9pbnRlcnNcbiAgaWYgKCB0aGlzLmlzUG9pbnRlckRvd24gKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5pc1BvaW50ZXJEb3duID0gdHJ1ZTtcbiAgLy8gc2F2ZSBwb2ludGVyIGlkZW50aWZpZXIgdG8gbWF0Y2ggdXAgdG91Y2ggZXZlbnRzXG4gIHRoaXMucG9pbnRlcklkZW50aWZpZXIgPSBwb2ludGVyLnBvaW50ZXJJZCAhPT0gdW5kZWZpbmVkID9cbiAgICAvLyBwb2ludGVySWQgZm9yIHBvaW50ZXIgZXZlbnRzLCB0b3VjaC5pbmRlbnRpZmllciBmb3IgdG91Y2ggZXZlbnRzXG4gICAgcG9pbnRlci5wb2ludGVySWQgOiBwb2ludGVyLmlkZW50aWZpZXI7XG5cbiAgdGhpcy5wb2ludGVyRG93biggZXZlbnQsIHBvaW50ZXIgKTtcbn07XG5cbnByb3RvLnBvaW50ZXJEb3duID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLl9iaW5kUG9zdFN0YXJ0RXZlbnRzKCBldmVudCApO1xuICB0aGlzLmVtaXRFdmVudCggJ3BvaW50ZXJEb3duJywgWyBldmVudCwgcG9pbnRlciBdICk7XG59O1xuXG4vLyBoYXNoIG9mIGV2ZW50cyB0byBiZSBib3VuZCBhZnRlciBzdGFydCBldmVudFxudmFyIHBvc3RTdGFydEV2ZW50cyA9IHtcbiAgbW91c2Vkb3duOiBbICdtb3VzZW1vdmUnLCAnbW91c2V1cCcgXSxcbiAgdG91Y2hzdGFydDogWyAndG91Y2htb3ZlJywgJ3RvdWNoZW5kJywgJ3RvdWNoY2FuY2VsJyBdLFxuICBwb2ludGVyZG93bjogWyAncG9pbnRlcm1vdmUnLCAncG9pbnRlcnVwJywgJ3BvaW50ZXJjYW5jZWwnIF0sXG4gIE1TUG9pbnRlckRvd246IFsgJ01TUG9pbnRlck1vdmUnLCAnTVNQb2ludGVyVXAnLCAnTVNQb2ludGVyQ2FuY2VsJyBdXG59O1xuXG5wcm90by5fYmluZFBvc3RTdGFydEV2ZW50cyA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgaWYgKCAhZXZlbnQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIGdldCBwcm9wZXIgZXZlbnRzIHRvIG1hdGNoIHN0YXJ0IGV2ZW50XG4gIHZhciBldmVudHMgPSBwb3N0U3RhcnRFdmVudHNbIGV2ZW50LnR5cGUgXTtcbiAgLy8gYmluZCBldmVudHMgdG8gbm9kZVxuICBldmVudHMuZm9yRWFjaCggZnVuY3Rpb24oIGV2ZW50TmFtZSApIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggZXZlbnROYW1lLCB0aGlzICk7XG4gIH0sIHRoaXMgKTtcbiAgLy8gc2F2ZSB0aGVzZSBhcmd1bWVudHNcbiAgdGhpcy5fYm91bmRQb2ludGVyRXZlbnRzID0gZXZlbnRzO1xufTtcblxucHJvdG8uX3VuYmluZFBvc3RTdGFydEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAvLyBjaGVjayBmb3IgX2JvdW5kRXZlbnRzLCBpbiBjYXNlIGRyYWdFbmQgdHJpZ2dlcmVkIHR3aWNlIChvbGQgSUU4IGJ1ZylcbiAgaWYgKCAhdGhpcy5fYm91bmRQb2ludGVyRXZlbnRzICkge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLl9ib3VuZFBvaW50ZXJFdmVudHMuZm9yRWFjaCggZnVuY3Rpb24oIGV2ZW50TmFtZSApIHtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggZXZlbnROYW1lLCB0aGlzICk7XG4gIH0sIHRoaXMgKTtcblxuICBkZWxldGUgdGhpcy5fYm91bmRQb2ludGVyRXZlbnRzO1xufTtcblxuLy8gLS0tLS0gbW92ZSBldmVudCAtLS0tLSAvL1xuXG5wcm90by5vbm1vdXNlbW92ZSA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdGhpcy5fcG9pbnRlck1vdmUoIGV2ZW50LCBldmVudCApO1xufTtcblxucHJvdG8ub25NU1BvaW50ZXJNb3ZlID1cbnByb3RvLm9ucG9pbnRlcm1vdmUgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIGlmICggZXZlbnQucG9pbnRlcklkID09IHRoaXMucG9pbnRlcklkZW50aWZpZXIgKSB7XG4gICAgdGhpcy5fcG9pbnRlck1vdmUoIGV2ZW50LCBldmVudCApO1xuICB9XG59O1xuXG5wcm90by5vbnRvdWNobW92ZSA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdmFyIHRvdWNoID0gdGhpcy5nZXRUb3VjaCggZXZlbnQuY2hhbmdlZFRvdWNoZXMgKTtcbiAgaWYgKCB0b3VjaCApIHtcbiAgICB0aGlzLl9wb2ludGVyTW92ZSggZXZlbnQsIHRvdWNoICk7XG4gIH1cbn07XG5cbi8qKlxuICogcG9pbnRlciBtb3ZlXG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICogQHBhcmFtIHtFdmVudCBvciBUb3VjaH0gcG9pbnRlclxuICogQHByaXZhdGVcbiAqL1xucHJvdG8uX3BvaW50ZXJNb3ZlID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLnBvaW50ZXJNb3ZlKCBldmVudCwgcG9pbnRlciApO1xufTtcblxuLy8gcHVibGljXG5wcm90by5wb2ludGVyTW92ZSA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5lbWl0RXZlbnQoICdwb2ludGVyTW92ZScsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xufTtcblxuLy8gLS0tLS0gZW5kIGV2ZW50IC0tLS0tIC8vXG5cblxucHJvdG8ub25tb3VzZXVwID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB0aGlzLl9wb2ludGVyVXAoIGV2ZW50LCBldmVudCApO1xufTtcblxucHJvdG8ub25NU1BvaW50ZXJVcCA9XG5wcm90by5vbnBvaW50ZXJ1cCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgaWYgKCBldmVudC5wb2ludGVySWQgPT0gdGhpcy5wb2ludGVySWRlbnRpZmllciApIHtcbiAgICB0aGlzLl9wb2ludGVyVXAoIGV2ZW50LCBldmVudCApO1xuICB9XG59O1xuXG5wcm90by5vbnRvdWNoZW5kID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB2YXIgdG91Y2ggPSB0aGlzLmdldFRvdWNoKCBldmVudC5jaGFuZ2VkVG91Y2hlcyApO1xuICBpZiAoIHRvdWNoICkge1xuICAgIHRoaXMuX3BvaW50ZXJVcCggZXZlbnQsIHRvdWNoICk7XG4gIH1cbn07XG5cbi8qKlxuICogcG9pbnRlciB1cFxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgb3IgVG91Y2h9IHBvaW50ZXJcbiAqIEBwcml2YXRlXG4gKi9cbnByb3RvLl9wb2ludGVyVXAgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMuX3BvaW50ZXJEb25lKCk7XG4gIHRoaXMucG9pbnRlclVwKCBldmVudCwgcG9pbnRlciApO1xufTtcblxuLy8gcHVibGljXG5wcm90by5wb2ludGVyVXAgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMuZW1pdEV2ZW50KCAncG9pbnRlclVwJywgWyBldmVudCwgcG9pbnRlciBdICk7XG59O1xuXG4vLyAtLS0tLSBwb2ludGVyIGRvbmUgLS0tLS0gLy9cblxuLy8gdHJpZ2dlcmVkIG9uIHBvaW50ZXIgdXAgJiBwb2ludGVyIGNhbmNlbFxucHJvdG8uX3BvaW50ZXJEb25lID0gZnVuY3Rpb24oKSB7XG4gIC8vIHJlc2V0IHByb3BlcnRpZXNcbiAgdGhpcy5pc1BvaW50ZXJEb3duID0gZmFsc2U7XG4gIGRlbGV0ZSB0aGlzLnBvaW50ZXJJZGVudGlmaWVyO1xuICAvLyByZW1vdmUgZXZlbnRzXG4gIHRoaXMuX3VuYmluZFBvc3RTdGFydEV2ZW50cygpO1xuICB0aGlzLnBvaW50ZXJEb25lKCk7XG59O1xuXG5wcm90by5wb2ludGVyRG9uZSA9IG5vb3A7XG5cbi8vIC0tLS0tIHBvaW50ZXIgY2FuY2VsIC0tLS0tIC8vXG5cbnByb3RvLm9uTVNQb2ludGVyQ2FuY2VsID1cbnByb3RvLm9ucG9pbnRlcmNhbmNlbCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgaWYgKCBldmVudC5wb2ludGVySWQgPT0gdGhpcy5wb2ludGVySWRlbnRpZmllciApIHtcbiAgICB0aGlzLl9wb2ludGVyQ2FuY2VsKCBldmVudCwgZXZlbnQgKTtcbiAgfVxufTtcblxucHJvdG8ub250b3VjaGNhbmNlbCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdmFyIHRvdWNoID0gdGhpcy5nZXRUb3VjaCggZXZlbnQuY2hhbmdlZFRvdWNoZXMgKTtcbiAgaWYgKCB0b3VjaCApIHtcbiAgICB0aGlzLl9wb2ludGVyQ2FuY2VsKCBldmVudCwgdG91Y2ggKTtcbiAgfVxufTtcblxuLyoqXG4gKiBwb2ludGVyIGNhbmNlbFxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgb3IgVG91Y2h9IHBvaW50ZXJcbiAqIEBwcml2YXRlXG4gKi9cbnByb3RvLl9wb2ludGVyQ2FuY2VsID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLl9wb2ludGVyRG9uZSgpO1xuICB0aGlzLnBvaW50ZXJDYW5jZWwoIGV2ZW50LCBwb2ludGVyICk7XG59O1xuXG4vLyBwdWJsaWNcbnByb3RvLnBvaW50ZXJDYW5jZWwgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMuZW1pdEV2ZW50KCAncG9pbnRlckNhbmNlbCcsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xufTtcblxuLy8gLS0tLS0gIC0tLS0tIC8vXG5cbi8vIHV0aWxpdHkgZnVuY3Rpb24gZm9yIGdldHRpbmcgeC95IGNvb3JkcyBmcm9tIGV2ZW50XG5Vbmlwb2ludGVyLmdldFBvaW50ZXJQb2ludCA9IGZ1bmN0aW9uKCBwb2ludGVyICkge1xuICByZXR1cm4ge1xuICAgIHg6IHBvaW50ZXIucGFnZVgsXG4gICAgeTogcG9pbnRlci5wYWdlWVxuICB9O1xufTtcblxuLy8gLS0tLS0gIC0tLS0tIC8vXG5cbnJldHVybiBVbmlwb2ludGVyO1xuXG59KSk7XG4iLCIvKipcbiAqIFdpdGhpbiBWaWV3cG9ydFxuICpcbiAqIEBkZXNjcmlwdGlvbiBEZXRlcm1pbmVzIHdoZXRoZXIgYW4gZWxlbWVudCBpcyBjb21wbGV0ZWx5IHdpdGhpbiB0aGUgYnJvd3NlciB2aWV3cG9ydFxuICogQGF1dGhvciAgICAgIENyYWlnIFBhdGlrLCBodHRwOi8vcGF0aWsuY29tL1xuICogQHZlcnNpb24gICAgIDEuMC4wXG4gKiBAZGF0ZSAgICAgICAgMjAxNS0wOC0wMlxuICovXG4oZnVuY3Rpb24gKHJvb3QsIG5hbWUsIGZhY3RvcnkpIHtcbiAgICAvLyBBTURcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXSwgZmFjdG9yeSk7XG4gICAgfVxuICAgIC8vIE5vZGUgYW5kIENvbW1vbkpTLWxpa2UgZW52aXJvbm1lbnRzXG4gICAgZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICAgIH1cbiAgICAvLyBCcm93c2VyIGdsb2JhbFxuICAgIGVsc2Uge1xuICAgICAgICByb290W25hbWVdID0gZmFjdG9yeSgpO1xuICAgIH1cbn0odGhpcywgJ3dpdGhpbnZpZXdwb3J0JywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5Vc2VXaW5kb3dEaW1lbnNpb25zID0gd2luZG93LmlubmVySGVpZ2h0ICE9PSB1bmRlZmluZWQ7IC8vIElFIDggYW5kIGxvd2VyIGZhaWwgdGhpc1xuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIGFuIGVsZW1lbnQgaXMgd2l0aGluIHRoZSB2aWV3cG9ydFxuICAgICAqIEBwYXJhbSAge09iamVjdH0gIGVsZW0gICAgICAgRE9NIEVsZW1lbnQgKHJlcXVpcmVkKVxuICAgICAqIEBwYXJhbSAge09iamVjdH0gIG9wdGlvbnMgICAgT3B0aW9uYWwgc2V0dGluZ3NcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufSAgICAgICAgICAgIFdoZXRoZXIgdGhlIGVsZW1lbnQgd2FzIGNvbXBsZXRlbHkgd2l0aGluIHRoZSB2aWV3cG9ydFxuICAgICovXG4gICAgdmFyIHdpdGhpbnZpZXdwb3J0ID0gZnVuY3Rpb24gd2l0aGludmlld3BvcnQgKGVsZW0sIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgICB2YXIgbWV0YWRhdGEgPSB7fTtcbiAgICAgICAgdmFyIGNvbmZpZyA9IHt9O1xuICAgICAgICB2YXIgc2V0dGluZ3M7XG4gICAgICAgIHZhciBpc1dpdGhpbjtcbiAgICAgICAgdmFyIGVsZW1Cb3VuZGluZ1JlY3Q7XG4gICAgICAgIHZhciBzaWRlTmFtZXNQYXR0ZXJuO1xuICAgICAgICB2YXIgc2lkZXM7XG4gICAgICAgIHZhciBzaWRlO1xuICAgICAgICB2YXIgaTtcblxuICAgICAgICAvLyBJZiBpbnZva2VkIGJ5IHRoZSBqUXVlcnkgcGx1Z2luLCBnZXQgdGhlIGFjdHVhbCBET00gZWxlbWVudFxuICAgICAgICBpZiAodHlwZW9mIGpRdWVyeSAhPT0gJ3VuZGVmaW5lZCcgJiYgZWxlbSBpbnN0YW5jZW9mIGpRdWVyeSkge1xuICAgICAgICAgICAgZWxlbSA9IGVsZW0uZ2V0KDApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBlbGVtICE9PSAnb2JqZWN0JyB8fCBlbGVtLm5vZGVUeXBlICE9PSAxKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG11c3QgYmUgYW4gZWxlbWVudCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTG9vayBmb3IgaW5saW5lIHNldHRpbmdzIG9uIHRoZSBlbGVtZW50XG4gICAgICAgIGlmIChlbGVtLmdldEF0dHJpYnV0ZSgnZGF0YS13aXRoaW52aWV3cG9ydC1zZXR0aW5ncycpICYmIHdpbmRvdy5KU09OKSB7XG4gICAgICAgICAgICBtZXRhZGF0YSA9IEpTT04ucGFyc2UoZWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtd2l0aGludmlld3BvcnQtc2V0dGluZ3MnKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXR0aW5ncyBhcmd1bWVudCBtYXkgYmUgYSBzaW1wbGUgc3RyaW5nIChgdG9wYCwgYHJpZ2h0YCwgZXRjKVxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBzZXR0aW5ncyA9IHtzaWRlczogb3B0aW9uc307XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzZXR0aW5ncyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIH1cblxuICAgICAgICAvLyBCdWlsZCBjb25maWd1cmF0aW9uIGZyb20gZGVmYXVsdHMgYW5kIHVzZXItcHJvdmlkZWQgc2V0dGluZ3MgYW5kIG1ldGFkYXRhXG4gICAgICAgIGNvbmZpZy5jb250YWluZXIgPSBzZXR0aW5ncy5jb250YWluZXIgfHwgbWV0YWRhdGEuY29udGFpbmVyIHx8IHdpdGhpbnZpZXdwb3J0LmRlZmF1bHRzLmNvbnRhaW5lciB8fCB3aW5kb3c7XG4gICAgICAgIGNvbmZpZy5zaWRlcyAgPSBzZXR0aW5ncy5zaWRlcyAgfHwgbWV0YWRhdGEuc2lkZXMgIHx8IHdpdGhpbnZpZXdwb3J0LmRlZmF1bHRzLnNpZGVzICB8fCAnYWxsJztcbiAgICAgICAgY29uZmlnLnRvcCAgICA9IHNldHRpbmdzLnRvcCAgICB8fCBtZXRhZGF0YS50b3AgICAgfHwgd2l0aGludmlld3BvcnQuZGVmYXVsdHMudG9wICAgIHx8IDA7XG4gICAgICAgIGNvbmZpZy5yaWdodCAgPSBzZXR0aW5ncy5yaWdodCAgfHwgbWV0YWRhdGEucmlnaHQgIHx8IHdpdGhpbnZpZXdwb3J0LmRlZmF1bHRzLnJpZ2h0ICB8fCAwO1xuICAgICAgICBjb25maWcuYm90dG9tID0gc2V0dGluZ3MuYm90dG9tIHx8IG1ldGFkYXRhLmJvdHRvbSB8fCB3aXRoaW52aWV3cG9ydC5kZWZhdWx0cy5ib3R0b20gfHwgMDtcbiAgICAgICAgY29uZmlnLmxlZnQgICA9IHNldHRpbmdzLmxlZnQgICB8fCBtZXRhZGF0YS5sZWZ0ICAgfHwgd2l0aGludmlld3BvcnQuZGVmYXVsdHMubGVmdCAgIHx8IDA7XG5cbiAgICAgICAgLy8gVXNlIHRoZSB3aW5kb3cgYXMgdGhlIGNvbnRhaW5lciBpZiB0aGUgdXNlciBzcGVjaWZpZWQgdGhlIGJvZHkgb3IgYSBub24tZWxlbWVudFxuICAgICAgICBpZiAoY29uZmlnLmNvbnRhaW5lciA9PT0gZG9jdW1lbnQuYm9keSB8fCAhY29uZmlnLmNvbnRhaW5lci5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgICAgY29uZmlnLmNvbnRhaW5lciA9IHdpbmRvdztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEVsZW1lbnQgdGVzdGluZyBtZXRob2RzXG4gICAgICAgIGlzV2l0aGluID0ge1xuICAgICAgICAgICAgLy8gRWxlbWVudCBpcyBiZWxvdyB0aGUgdG9wIGVkZ2Ugb2YgdGhlIHZpZXdwb3J0XG4gICAgICAgICAgICB0b3A6IGZ1bmN0aW9uIF9pc1dpdGhpbl90b3AgKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtQm91bmRpbmdSZWN0LnRvcCA+PSBjb25maWcudG9wO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy8gRWxlbWVudCBpcyB0byB0aGUgbGVmdCBvZiB0aGUgcmlnaHQgZWRnZSBvZiB0aGUgdmlld3BvcnRcbiAgICAgICAgICAgIHJpZ2h0OiBmdW5jdGlvbiBfaXNXaXRoaW5fcmlnaHQgKCkge1xuICAgICAgICAgICAgICAgIHZhciBjb250YWluZXJXaWR0aDtcblxuICAgICAgICAgICAgICAgIGlmIChjYW5Vc2VXaW5kb3dEaW1lbnNpb25zIHx8IGNvbmZpZy5jb250YWluZXIgIT09IHdpbmRvdykge1xuICAgICAgICAgICAgICAgICAgICBjb250YWluZXJXaWR0aCA9IGNvbmZpZy5jb250YWluZXIuaW5uZXJXaWR0aDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lcldpZHRoID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIE5vdGUgdGhhdCBgZWxlbUJvdW5kaW5nUmVjdC5yaWdodGAgaXMgdGhlIGRpc3RhbmNlIGZyb20gdGhlICpsZWZ0KiBvZiB0aGUgdmlld3BvcnQgdG8gdGhlIGVsZW1lbnQncyBmYXIgcmlnaHQgZWRnZVxuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtQm91bmRpbmdSZWN0LnJpZ2h0IDw9IGNvbnRhaW5lcldpZHRoIC0gY29uZmlnLnJpZ2h0O1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy8gRWxlbWVudCBpcyBhYm92ZSB0aGUgYm90dG9tIGVkZ2Ugb2YgdGhlIHZpZXdwb3J0XG4gICAgICAgICAgICBib3R0b206IGZ1bmN0aW9uIF9pc1dpdGhpbl9ib3R0b20gKCkge1xuICAgICAgICAgICAgICAgIHZhciBjb250YWluZXJIZWlnaHQ7XG5cbiAgICAgICAgICAgICAgICBpZiAoY2FuVXNlV2luZG93RGltZW5zaW9ucyB8fCBjb25maWcuY29udGFpbmVyICE9PSB3aW5kb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVySGVpZ2h0ID0gY29uZmlnLmNvbnRhaW5lci5pbm5lckhlaWdodDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lckhlaWdodCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gTm90ZSB0aGF0IGBlbGVtQm91bmRpbmdSZWN0LmJvdHRvbWAgaXMgdGhlIGRpc3RhbmNlIGZyb20gdGhlICp0b3AqIG9mIHRoZSB2aWV3cG9ydCB0byB0aGUgZWxlbWVudCdzIGJvdHRvbSBlZGdlXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1Cb3VuZGluZ1JlY3QuYm90dG9tIDw9IGNvbnRhaW5lckhlaWdodCAtIGNvbmZpZy5ib3R0b207XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvLyBFbGVtZW50IGlzIHRvIHRoZSByaWdodCBvZiB0aGUgbGVmdCBlZGdlIG9mIHRoZSB2aWV3cG9ydFxuICAgICAgICAgICAgbGVmdDogZnVuY3Rpb24gX2lzV2l0aGluX2xlZnQgKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtQm91bmRpbmdSZWN0LmxlZnQgPj0gY29uZmlnLmxlZnQ7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvLyBFbGVtZW50IGlzIHdpdGhpbiBhbGwgZm91ciBib3VuZGFyaWVzXG4gICAgICAgICAgICBhbGw6IGZ1bmN0aW9uIF9pc1dpdGhpbl9hbGwgKCkge1xuICAgICAgICAgICAgICAgIC8vIFRlc3QgZWFjaCBib3VuZGFyeSBpbiBvcmRlciBvZiBtb3N0IGVmZmljaWVudCBhbmQgbW9zdCBsaWtlbHkgdG8gYmUgZmFsc2Ugc28gdGhhdCB3ZSBjYW4gYXZvaWQgcnVubmluZyBhbGwgZm91ciBmdW5jdGlvbnMgb24gbW9zdCBlbGVtZW50c1xuICAgICAgICAgICAgICAgIC8vIFRvcDogUXVpY2tlc3QgdG8gY2FsY3VsYXRlICsgbW9zdCBsaWtlbHkgdG8gYmUgZmFsc2VcbiAgICAgICAgICAgICAgICAvLyBCb3R0b206IE5vdGUgcXVpdGUgYXMgcXVpY2sgdG8gY2FsY3VsYXRlLCBidXQgYWxzbyB2ZXJ5IGxpa2VseSB0byBiZSBmYWxzZVxuICAgICAgICAgICAgICAgIC8vIExlZnQgYW5kIHJpZ2h0IGFyZSBib3RoIGVxdWFsbHkgdW5saWtlbHkgdG8gYmUgZmFsc2Ugc2luY2UgbW9zdCBzaXRlcyBvbmx5IHNjcm9sbCB2ZXJ0aWNhbGx5LCBidXQgbGVmdCBpcyBmYXN0ZXJcbiAgICAgICAgICAgICAgICByZXR1cm4gKGlzV2l0aGluLnRvcCgpICYmIGlzV2l0aGluLmJvdHRvbSgpICYmIGlzV2l0aGluLmxlZnQoKSAmJiBpc1dpdGhpbi5yaWdodCgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBHZXQgdGhlIGVsZW1lbnQncyBib3VuZGluZyByZWN0YW5nbGUgd2l0aCByZXNwZWN0IHRvIHRoZSB2aWV3cG9ydFxuICAgICAgICBlbGVtQm91bmRpbmdSZWN0ID0gZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICAvLyBUZXN0IHRoZSBlbGVtZW50IGFnYWluc3QgZWFjaCBzaWRlIG9mIHRoZSB2aWV3cG9ydCB0aGF0IHdhcyByZXF1ZXN0ZWRcbiAgICAgICAgc2lkZU5hbWVzUGF0dGVybiA9IC9edG9wJHxecmlnaHQkfF5ib3R0b20kfF5sZWZ0JHxeYWxsJC87XG4gICAgICAgIC8vIExvb3AgdGhyb3VnaCBhbGwgb2YgdGhlIHNpZGVzXG4gICAgICAgIHNpZGVzID0gY29uZmlnLnNpZGVzLnNwbGl0KCcgJyk7XG4gICAgICAgIGkgPSBzaWRlcy5sZW5ndGg7XG4gICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICAgIHNpZGUgPSBzaWRlc1tpXS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgICAgICBpZiAoc2lkZU5hbWVzUGF0dGVybi50ZXN0KHNpZGUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzV2l0aGluW3NpZGVdKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFF1aXQgYXMgc29vbiBhcyB0aGUgZmlyc3QgZmFpbHVyZSBpcyBmb3VuZFxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICAvLyBEZWZhdWx0IHNldHRpbmdzXG4gICAgd2l0aGludmlld3BvcnQucHJvdG90eXBlLmRlZmF1bHRzID0ge1xuICAgICAgICBjb250YWluZXI6IGRvY3VtZW50LmJvZHksXG4gICAgICAgIHNpZGVzOiAnYWxsJyxcbiAgICAgICAgdG9wOiAwLFxuICAgICAgICByaWdodDogMCxcbiAgICAgICAgYm90dG9tOiAwLFxuICAgICAgICBsZWZ0OiAwXG4gICAgfTtcblxuICAgIHdpdGhpbnZpZXdwb3J0LmRlZmF1bHRzID0gd2l0aGludmlld3BvcnQucHJvdG90eXBlLmRlZmF1bHRzO1xuXG4gICAgLyoqXG4gICAgICogT3B0aW9uYWwgZW5oYW5jZW1lbnRzIGFuZCBzaG9ydGN1dHNcbiAgICAgKlxuICAgICAqIEBkZXNjcmlwdGlvbiBVbmNvbW1lbnQgb3IgY29tbWVudCB0aGVzZSBwaWVjZXMgYXMgdGhleSBhcHBseSB0byB5b3VyIHByb2plY3QgYW5kIGNvZGluZyBwcmVmZXJlbmNlc1xuICAgICAqL1xuXG4gICAgLy8gU2hvcnRjdXQgbWV0aG9kcyBmb3IgZWFjaCBzaWRlIG9mIHRoZSB2aWV3cG9ydFxuICAgIC8vIEV4YW1wbGU6IGB3aXRoaW52aWV3cG9ydC50b3AoZWxlbSlgIGlzIHRoZSBzYW1lIGFzIGB3aXRoaW52aWV3cG9ydChlbGVtLCAndG9wJylgXG4gICAgd2l0aGludmlld3BvcnQucHJvdG90eXBlLnRvcCA9IGZ1bmN0aW9uIF93aXRoaW52aWV3cG9ydF90b3AgKGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIHdpdGhpbnZpZXdwb3J0KGVsZW1lbnQsICd0b3AnKTtcbiAgICB9O1xuXG4gICAgd2l0aGludmlld3BvcnQucHJvdG90eXBlLnJpZ2h0ID0gZnVuY3Rpb24gX3dpdGhpbnZpZXdwb3J0X3JpZ2h0IChlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiB3aXRoaW52aWV3cG9ydChlbGVtZW50LCAncmlnaHQnKTtcbiAgICB9O1xuXG4gICAgd2l0aGludmlld3BvcnQucHJvdG90eXBlLmJvdHRvbSA9IGZ1bmN0aW9uIF93aXRoaW52aWV3cG9ydF9ib3R0b20gKGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIHdpdGhpbnZpZXdwb3J0KGVsZW1lbnQsICdib3R0b20nKTtcbiAgICB9O1xuXG4gICAgd2l0aGludmlld3BvcnQucHJvdG90eXBlLmxlZnQgPSBmdW5jdGlvbiBfd2l0aGludmlld3BvcnRfbGVmdCAoZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gd2l0aGludmlld3BvcnQoZWxlbWVudCwgJ2xlZnQnKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHdpdGhpbnZpZXdwb3J0O1xufSkpO1xuIiwiY29uc3QgZHJhZ2dhYmlsbHkgPSByZXF1aXJlKCdkcmFnZ2FiaWxseScpO1xuXG5jb25zdCBzaG93ID0gKCkgPT4ge1xuICAgICQoJ2JvZHknKS5hcHBlbmQoaHRtbCk7XG4gICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy52aHMtY29udHJvbHMnKTtcbiAgICBuZXcgZHJhZ2dhYmlsbHkoZWxlbWVudCk7XG59O1xuXG5jb25zdCB0b2dnbGVSZWNvcmRpbmdTdGF0ZSA9ICgpID0+IHtcbiAgICAkKCcudmhzLXJlY29yZC1jaXJjbGUnKS50b2dnbGVDbGFzcygndmhzLXJlY29yZGluZycpO1xufTtcblxuY29uc3QgdG9nZ2xlUGxheWluZ1N0YXRlID0gKCkgPT4ge1xuICAgICQoJy52aHMtcGxheS1idXR0b24nKS50b2dnbGVDbGFzcygndmhzLXBsYXlpbmcnKTtcbn07XG5cbmNvbnN0IHN0eWxlcyA9IGA8c3R5bGU+XG4gICAgLnZocy1jb250cm9scyB7XG4gICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgdG9wOiAxMHB4O1xuICAgICAgICBsZWZ0OiAxMHB4O1xuICAgIH1cbiAgICAudmhzLWJ1dHRvbiB7XG4gICAgICAgIHdpZHRoOiAzMHB4O1xuICAgICAgICBoZWlnaHQ6IDMwcHg7XG4gICAgICAgIGJhY2tncm91bmQ6ICNGRkY7XG4gICAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNEREQ7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDVweDtcbiAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgfVxuICAgIC52aHMtcmVjb3JkLWNpcmNsZSB7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgICAgd2lkdGg6IDEwcHg7XG4gICAgICAgIGhlaWdodDogMTBweDtcbiAgICAgICAgbWFyZ2luOiAxMHB4O1xuICAgICAgICBiYWNrZ3JvdW5kOiAjRkUzNTQ4O1xuICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgfVxuICAgIC52aHMtcmVjb3JkaW5nIHtcbiAgICAgICAgYW5pbWF0aW9uOiB2aHMtcmVjb3JkaW5nLWFuaW1hdGlvbiAycyBpbmZpbml0ZTtcbiAgICB9XG4gICAgQGtleWZyYW1lcyB2aHMtcmVjb3JkaW5nLWFuaW1hdGlvbiB7XG4gICAgICAgIDAlICAge29wYWNpdHk6IDF9XG4gICAgICAgIDUwJSAge29wYWNpdHk6IDB9XG4gICAgICAgIDEwMCUge29wYWNpdHk6IDF9XG4gICAgfVxuICAgIC52aHMtcGxheWluZyB7XG4gICAgICAgIGJhY2tncm91bmQ6ICMwMEFERTk7XG4gICAgICAgIGJvcmRlci1jb2xvcjogIzAwQURFOTtcbiAgICB9XG4gICAgLnZocy1wbGF5aW5nIC52aHMtcGxheS10cmlhbmdsZSB7XG4gICAgICAgIGJhY2tncm91bmQ6ICNGRkY7XG4gICAgfVxuICAgIC52aHMtcGxheS10cmlhbmdsZSB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICM2NjY7XG4gICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICAgICAgbWFyZ2luOiAxMnB4O1xuICAgIH1cbiAgICAudmhzLXBsYXktdHJpYW5nbGU6YmVmb3JlLFxuICAgIC52aHMtcGxheS10cmlhbmdsZTphZnRlciB7XG4gICAgICAgIGNvbnRlbnQ6ICcnO1xuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IGluaGVyaXQ7XG4gICAgfVxuICAgIC52aHMtcGxheS10cmlhbmdsZSxcbiAgICAudmhzLXBsYXktdHJpYW5nbGU6YmVmb3JlLFxuICAgIC52aHMtcGxheS10cmlhbmdsZTphZnRlciB7XG4gICAgICAgIHdpZHRoOiAgNnB4O1xuICAgICAgICBoZWlnaHQ6IDZweDtcbiAgICAgICAgYm9yZGVyLXRvcC1yaWdodC1yYWRpdXM6IDMwJTtcbiAgICB9XG4gICAgLnZocy1wbGF5LXRyaWFuZ2xlIHtcbiAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMzBkZWcpIHNrZXdYKC0zMGRlZykgc2NhbGUoMSwgLjg2Nik7XG4gICAgfVxuICAgIC52aHMtcGxheS10cmlhbmdsZTpiZWZvcmUge1xuICAgICAgICB0cmFuc2Zvcm06IHJvdGF0ZSgtMTM1ZGVnKSBza2V3WCgtNDVkZWcpIHNjYWxlKDEuNDE0LCAuNzA3KSB0cmFuc2xhdGUoMCwgLTUwJSk7XG4gICAgfVxuICAgIC52aHMtcGxheS10cmlhbmdsZTphZnRlciB7XG4gICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDEzNWRlZykgc2tld1koLTQ1ZGVnKSBzY2FsZSguNzA3LCAxLjQxNCkgdHJhbnNsYXRlKDUwJSk7XG4gICAgfVxuPC9zdHlsZT5gO1xuXG5jb25zdCBodG1sID0gYFxuICAgIDxkaXYgY2xhc3M9XCJ2aHMtY29udHJvbHNcIj5cbiAgICAgICAgJHtzdHlsZXN9XG4gICAgICAgIDxzcGFuIGNsYXNzPVwidmhzLWJ1dHRvblwiIG9uY2xpY2s9XCJ2aHMudG9nZ2xlUmVjb3JkaW5nKClcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidmhzLXJlY29yZC1jaXJjbGVcIj48L3NwYW4+XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJ2aHMtYnV0dG9uIHZocy1wbGF5LWJ1dHRvblwiIG9uY2xpY2s9XCJ2aHMuc2V0dXBQbGF5YmFjaygpXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInZocy1wbGF5LXRyaWFuZ2xlXCI+PC9zcGFuPlxuICAgICAgICA8L3NwYW4+XG4gICAgPC9kaXY+XG5gO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzaG93LFxuICAgIHRvZ2dsZVJlY29yZGluZ1N0YXRlLFxuICAgIHRvZ2dsZVBsYXlpbmdTdGF0ZVxufVxuIiwiY29uc3QgeHBhdGggPSByZXF1aXJlKCdzaW1wbGUteHBhdGgtcG9zaXRpb24nKTtcbmNvbnN0IHZpc2libGUgPSByZXF1aXJlKCd3aXRoaW52aWV3cG9ydCcpO1xud2luZG93LnZpc2JsZSA9IHZpc2libGU7XG5cbmNvbnN0IHNob3cgPSAoKSA9PiB7XG4gICAgJCgnYm9keScpLmFwcGVuZChodG1sKTtcbn07XG5cbmNvbnN0IHJlbmRlciA9IChldmVudHMsIGxhc3RFdmVudEluZGV4KSA9PiB7XG4gICAgJCgnLnZocy1zaWRlYmFyLWV2ZW50cycpLmVtcHR5KCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyBpKyspIGFkZEV2ZW50KGV2ZW50c1tpXSwgaSA8PSBsYXN0RXZlbnRJbmRleCk7XG4gICAgZm9sbG93TG9ncygpO1xufTtcblxuY29uc3QgZm9sbG93TG9ncyA9ICgpID0+IHtcbiAgICBsZXQgbGF0ZXN0UGFzc2VkVGVzdCA9ICQoJy52aHMtc2lkZWJhci1zdGF0dXMtcGFzc2VkJykubGFzdCgpO1xuICAgIGlmICghbGF0ZXN0UGFzc2VkVGVzdC5sZW5ndGgpIHJldHVybjtcblxuICAgIGlmICghdmlzaWJsZShsYXRlc3RQYXNzZWRUZXN0KSkge1xuICAgICAgICBsZXQgc2Nyb2xsVG9wICA9ICQoJy52aHMtc2lkZWJhcicpLnNjcm9sbFRvcCgpO1xuICAgICAgICAkKCcudmhzLXNpZGViYXInKS5zdG9wKCkuYW5pbWF0ZSh7XG4gICAgICAgICAgICBzY3JvbGxUb3A6IHNjcm9sbFRvcCArIDUwMFxuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5jb25zdCBhZGRFdmVudCA9IChldmVudCwgcGFzc2VkKSA9PiB7XG4gICAgZXZlbnQucGFzc2VkID0gcGFzc2VkO1xuICAgIGlmIChldmVudC50eXBlID09PSAnd2FpdCcgJiYgZXZlbnQuZHVyYXRpb24gPCAxMDApIHJldHVybjtcbiAgICBldmVudC5pZGVudGlmaWVyID0gZ2V0UHJldHR5SWRlbnRpZmllcihldmVudC5wYXRoKTtcbiAgICBpZiAoZXZlbnQud2hpY2ggPT09IDEpIGRlbGV0ZSBldmVudC5rZXk7IC8vIGNsaWNrIGV2ZW50XG4gICAgZWxzZSBpZiAoZXZlbnQud2hpY2ggPT09IDEzKSBldmVudC5rZXkgPSAn4oa1JztcbiAgICBlbHNlIGlmIChldmVudC53aGljaCA9PT0gOCkgZXZlbnQua2V5ID0gJ+KGkCc7XG4gICAgZWxzZSBpZiAoZXZlbnQud2hpY2ggPT09IDMyKSBldmVudC5rZXkgPSAnXyc7IC8vcHJveHkgZm9yIHNwYWNlXG4gICAgZWxzZSBpZiAoZXZlbnQud2hpY2gpIGV2ZW50LmtleSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoZXZlbnQud2hpY2gpO1xuXG4gICAgJCgnLnZocy1zaWRlYmFyLWV2ZW50cycpLmFwcGVuZChnZXROZXdFdmVudEhUTUwoZXZlbnQpKTtcbn07XG5cbmNvbnN0IGdldFByZXR0eUlkZW50aWZpZXIgPSAocGF0aCkgPT4ge1xuICAgIGxldCBpZGVudGlmaWVyID0gJyc7XG4gICAgaWYgKCFwYXRoKSByZXR1cm4gaWRlbnRpZmllcjtcblxuICAgIGxldCBlbGVtZW50ID0geHBhdGgudG9Ob2RlKHBhdGgsIGRvY3VtZW50KTtcbiAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIGlkZW50aWZpZXI7XG4gICAgfVxuXG4gICAgaWRlbnRpZmllciArPSBlbGVtZW50LnRhZ05hbWUgPyBgJHtlbGVtZW50LnRhZ05hbWV9YDogJyc7XG4gICAgaWRlbnRpZmllciArPSBlbGVtZW50LmlkID8gYCMke2VsZW1lbnQuaWR9YDogJyc7XG4gICAgaWRlbnRpZmllciArPSBlbGVtZW50LmNsYXNzTmFtZSA/IGAuJHtlbGVtZW50LmNsYXNzTmFtZX1gOiAnJztcbiAgICBpZGVudGlmaWVyICs9IGVsZW1lbnQudGV4dCA/IGAoJHtlbGVtZW50LnRleHR9KWA6ICcnO1xuICAgIHJldHVybiBpZGVudGlmaWVyO1xufTtcblxuY29uc3Qgc3R5bGVzID0gYDxzdHlsZT5cbiAgICAudmhzLXNpZGViYXIge1xuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgIHRvcDogMDtcbiAgICAgICAgcmlnaHQ6IDA7XG4gICAgICAgIHdpZHRoOiAyNTBweDtcbiAgICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgICAgICB6LWluZGV4OiA5OTk7XG4gICAgICAgIGJhY2tncm91bmQ6ICNGRkY7XG4gICAgICAgIGJvcmRlci1sZWZ0OiAxcHggc29saWQgI0RERDtcbiAgICAgICAgb3ZlcmZsb3cteTogYXV0bztcbiAgICB9XG4gICAgLnZocy1zaWRlYmFyLWV2ZW50IHtcbiAgICAgICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNEREQ7XG4gICAgICAgIHBhZGRpbmc6IDEwcHg7XG4gICAgfVxuICAgIC52aHMtc2lkZWJhci1ldmVudC10eXBlLCAudmhzLXNpZGViYXItZXZlbnQta2V5IHtcbiAgICAgICAgZmxvYXQ6IHJpZ2h0O1xuICAgIH1cbiAgICAudmhzLXNpZGViYXItZXZlbnQta2V5IHtcbiAgICAgICAgY29sb3I6ICNEMjQyNkU7XG4gICAgICAgIGJhY2tncm91bmQ6ICNGN0Y3Rjk7XG4gICAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNEREQ7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDNweDtcbiAgICAgICAgcGFkZGluZzogMCAzcHg7XG4gICAgICAgIG1hcmdpbi1sZWZ0OiA1cHg7XG4gICAgICAgIGRpc3BsYXk6IGlubGluZTtcbiAgICB9XG4gICAgLnZocy1zaWRlYmFyLXN0YXR1cyB7XG4gICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICAgICAgd2lkdGg6IDcuNXB4O1xuICAgICAgICBoZWlnaHQ6IDcuNXB4O1xuICAgICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICAgIG1hcmdpbjogMnB4IDVweDtcbiAgICB9XG4gICAgLnZocy1zaWRlYmFyLXN0YXR1cy1wZW5kaW5nIHtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogb3JhbmdlO1xuICAgIH1cbiAgICAudmhzLXNpZGViYXItc3RhdHVzLXBhc3NlZCB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IGdyZWVuO1xuICAgIH1cbiAgICAudmhzLXNpZGViYXItc3RhdHVzLWZhaWxlZCB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJlZDtcbiAgICB9XG48L3N0eWxlPmA7XG5cbmNvbnN0IGh0bWwgPSBgXG4gICAgPGRpdiBjbGFzcz1cInZocy1zaWRlYmFyXCI+XG4gICAgICAgICR7c3R5bGVzfVxuICAgICAgICA8ZGl2IGNsYXNzPVwidmhzLXNpZGViYXItZXZlbnRzXCI+XG5cbiAgICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG5gO1xuXG5jb25zdCBnZXRTdGF0dXNIVE1MID0gKHBhc3NlZCkgPT4ge1xuICAgIGxldCBzdGF0dXMgPSAncGVuZGluZyc7XG4gICAgaWYgKHBhc3NlZCkgc3RhdHVzID0gJ3Bhc3NlZCc7XG4gICAgcmV0dXJuIGA8c3BhbiBjbGFzcz1cInZocy1zaWRlYmFyLXN0YXR1cyB2aHMtc2lkZWJhci1zdGF0dXMtJHtzdGF0dXN9XCI+PC9zcGFuPmA7XG59O1xuXG5jb25zdCBnZXREZXRhaWxIVE1MID0gKGRhdGEsIHR5cGUpID0+IHtcbiAgICBpZiAoIWRhdGEpIHJldHVybiBgYDtcbiAgICBpZiAodHlwZSA9PT0gJ2R1cmF0aW9uJykgZGF0YSA9IGAmIzEyODMzNzsgJHtkYXRhfWA7XG4gICAgcmV0dXJuIGA8c3BhbiBjbGFzcz1cInZocy1zaWRlYmFyLWV2ZW50LSR7dHlwZX1cIj4ke2RhdGF9PC9zcGFuPmA7XG59O1xuXG5jb25zdCBnZXROZXdFdmVudEhUTUwgPSAoe3R5cGUsIGR1cmF0aW9uLCBrZXksIGlkZW50aWZpZXIsIHBhc3NlZH0pID0+IHtcbiAgICByZXR1cm4gYFxuICAgICAgICA8ZGl2IGNsYXNzPVwidmhzLXNpZGViYXItZXZlbnRcIj5cbiAgICAgICAgICAgICR7Z2V0U3RhdHVzSFRNTChwYXNzZWQpfVxuICAgICAgICAgICAgJHtnZXREZXRhaWxIVE1MKGlkZW50aWZpZXIsICdwYXRoJyl9XG4gICAgICAgICAgICAke2dldERldGFpbEhUTUwoZHVyYXRpb24sICdkdXJhdGlvbicpfVxuXG4gICAgICAgICAgICAke2dldERldGFpbEhUTUwoa2V5LCAna2V5Jyl9XG4gICAgICAgICAgICAke2dldERldGFpbEhUTUwodHlwZSwgJ3R5cGUnKX1cbiAgICAgICAgPC9kaXY+XG4gICAgYDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHNob3csXG4gICAgcmVuZGVyXG59XG4iLCIvKiBMaWIgdG8gZ2V0IHhwYXRoIGZvciBhIERPTSBub2RlICovXG5jb25zdCB4cGF0aCA9IHJlcXVpcmUoJ3NpbXBsZS14cGF0aC1wb3NpdGlvbicpO1xuXG4vKiBQb2x5ZmlsbCBmb3IgQXJyYXkucHJvdG90eXBlLmluY2x1ZGVzICovXG5yZXF1aXJlKCdjb3JlLWpzL2ZuL2FycmF5L2luY2x1ZGVzJyk7XG5cbmNvbnN0IGNvbnRyb2xzID0gcmVxdWlyZSgnLi9jb250cm9scycpO1xuY29uc3Qgc2lkZWJhciA9IHJlcXVpcmUoJy4vc2lkZWJhcicpO1xuXG4vKiBXaGl0ZWxpc3Qgb2YgRE9NIGV2ZW50cyB0aGF0IGFyZSByZWNvcmRlZCAqL1xuY29uc3QgZXZlbnRUeXBlcyA9IFsnY2xpY2snLCAna2V5cHJlc3MnLCAnZGJsY2xpY2snXTtcblxuLyogSGFja3kgZXZlbnRzICovXG5jb25zdCBzcGVjaWFsRXZlbnRUeXBlcyA9IFsna2V5ZG93biddO1xuXG5sZXQgZXZlbnRzID0gW107XG5cbi8qIENyZWF0ZSBldmVudCBoYW5kbGVycyBmb3IgZWFjaCBldmVudCB0eXBlIC0gY2FsbCBgcmVjb3JkYCBmdW5jdGlvbiAqL1xuY29uc3QgZ2V0RXZlbnRIYW5kbGVycyA9ICgpID0+IHtcbiAgICBsZXQgaGFuZGxlcnMgPSB7fTtcbiAgICBldmVudFR5cGVzLm1hcCh0eXBlID0+IGhhbmRsZXJzW3R5cGVdID0gcmVjb3JkRXZlbnQpO1xuICAgIHNwZWNpYWxFdmVudFR5cGVzLm1hcCh0eXBlID0+IGhhbmRsZXJzW3R5cGVdID0gcmVjb3JkRXZlbnQpO1xuICAgIHJldHVybiBoYW5kbGVycztcbn07XG5cbmNvbnN0IHdyYXBCb2R5SW5SZWNvcmRhYmxlID0gKCkgPT4ge1xuICAgICQoJ2JvZHknKS53cmFwSW5uZXIoJzxkaXYgY2xhc3M9XCJ2aHMtcmVjb3JkYWJsZVwiPjwvZGl2PicpXG59O1xuXG5jb25zdCBhdHRhY2hIYW5kbGVycyA9ICgpID0+IHtcbiAgICBsZXQgaGFuZGxlcnMgPSBnZXRFdmVudEhhbmRsZXJzKCk7XG4gICAgJCgnLnZocy1yZWNvcmRhYmxlJykub24oaGFuZGxlcnMpO1xufTtcblxuY29uc3QgZGV0YWNoSGFuZGxlcnMgPSAoKSA9PiB7XG4gICAgbGV0IGhhbmRsZXJzID0gZ2V0RXZlbnRIYW5kbGVycygpO1xuICAgICQoJy52aHMtcmVjb3JkYWJsZScpLm9mZihoYW5kbGVycyk7XG59O1xuXG5jb25zdCByZWNvcmRFdmVudCA9IChldmVudCkgPT4ge1xuICAgIC8qIE9ubHkgcmVjb3JkIHdoaXRlbGlzdGVkIGV2ZW50IHR5cGVzICovXG4gICAgaWYgKCFldmVudFR5cGVzLmluY2x1ZGVzKGV2ZW50LnR5cGUpKSB7XG4gICAgICAgIC8qIFNvbWUgZXZlbnRzIGxpa2Uga2V5ZG93biBuZWVkIHNwZWNpYWwgdHJlYXRtZW50ICovXG4gICAgICAgIGlmIChzcGVjaWFsRXZlbnRUeXBlcy5pbmNsdWRlcyhldmVudC50eXBlKSkgaGFuZGxlSGFja3MoZXZlbnQpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBXZSB3YW50IHRvIGdldCB0aGUgeHBhdGggb2YgdGhlIERPTSBlbGVtZW50LlxuICAgICAqXG4gICAgICogRGVwZW5kaW5nIG9uIHRoZSBpbnRlcmZhY2UsIHRoZSBlbGVtZW50IG1pZ2h0IG9yXG4gICAgICogbWlnaHQgbm90IHN0YXkgaW4gdGhlIERPTSB0cmVlIGFmdGVyIHRoZSBldmVudC5cbiAgICAgKlxuICAgICAqIFdlIG5lZWQgdG8gaGlqYWNrIHRoZSBldmVudCwgcnVuIG91ciBjb2RlIGZpcnN0XG4gICAgICogYW5kIHRoZW4gcGxheSB0aGUgZXZlbnQuXG4gICAgICovXG4gICAgaWYgKGV2ZW50LnByZXZlbnREZWZhdWx0KSBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgLyogQWRkaW5nIGEgd2FpdCBiZWZvcmUgZWFjaCB1c2VyIGV2ZW50ICovXG4gICAgZXZlbnRzLnB1c2goZ2V0V2FpdEV2ZW50KCkpO1xuXG4gICAgbGV0IHN5bnRoZXRpY0V2ZW50ID0ge1xuICAgICAgICB0eXBlOiBldmVudC50eXBlLFxuICAgICAgICB3aGljaDogZXZlbnQud2hpY2gsXG4gICAgICAgIHBhdGg6IHhwYXRoLmZyb21Ob2RlKGV2ZW50LnRhcmdldCwgZG9jdW1lbnQpXG4gICAgfTtcbiAgICBldmVudHMucHVzaChzeW50aGV0aWNFdmVudCk7XG5cbiAgICBpZiAoIWV2ZW50LmhhY2t5KSBwbGF5RXZlbnQoc3ludGhldGljRXZlbnQpO1xufTtcblxuY29uc3QgaGFuZGxlSGFja3MgPSAoZXZlbnQpID0+IHtcbiAgICAvKiBUaGUga2V5cHJlc3MgZXZlbnQgZG9lcyBub3QgY2F0Y2ggYmFjayBzcGFjZSBrZXkgKi9cbiAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ2tleWRvd24nICYmIGV2ZW50LndoaWNoID09PSA4KSBiYWNrc3BhY2VIYWNrKGV2ZW50KTtcbn07XG5cbmNvbnN0IGJhY2tzcGFjZUhhY2sgPSAoe3doaWNoLCB0YXJnZXR9KSA9PiB7XG4gICAgbGV0IGN1c3RvbUV2ZW50ID0ge1xuICAgICAgICB0eXBlOiAna2V5cHJlc3MnLFxuICAgICAgICB3aGljaCxcbiAgICAgICAgdGFyZ2V0LFxuICAgICAgICBoYWNreTogdHJ1ZVxuICAgIH07XG4gICAgcmVjb3JkRXZlbnQoY3VzdG9tRXZlbnQpO1xufTtcblxubGV0IGxhc3RFdmVudFRpbWVzdGFtcDtcbmNvbnN0IGdldFdhaXRFdmVudCA9ICgpID0+IHtcbiAgICBsZXQgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgbGV0IGV2ZW50ID0ge1xuICAgICAgICB0eXBlOiAnd2FpdCcsXG4gICAgICAgIC8qIFJldHVybiB0aW1lIHNpbmNlIGxhc3QgZXZlbnQgKi9cbiAgICAgICAgZHVyYXRpb246IChub3cgLSBsYXN0RXZlbnRUaW1lc3RhbXApIHx8IDBcbiAgICB9O1xuXG4gICAgbGFzdEV2ZW50VGltZXN0YW1wID0gbm93O1xuICAgIHJldHVybiBldmVudDtcbn07XG5cbmNvbnN0IGdldEVsZW1lbnQgPSAocGF0aCkgPT4ge1xuICAgIHJldHVybiB4cGF0aC50b05vZGUocGF0aCwgZG9jdW1lbnQpO1xufTtcblxuLyogUGxheSBhbiBldmVudCAqL1xuY29uc3QgcGxheUV2ZW50ID0gKGV2ZW50KSA9PiB7XG4gICAgLy8gVE9ETzogU2ltcGxpZnkgdGhpcyBmdW5jdGlvbiB3aXRoIGFzeW5jLWF3YWl0XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAvKlxuICAgICAgICAgKiBEb24ndCB3YW50IHN5bnRoZXRpYyBldmVudHMgdG8gYmUgcmVjb3JkZWQgd2hpbGUgd2hlbiB3ZSBwbGF5IHRoZW0uXG4gICAgICAgICAqIFdlIHdpbGwgZW5kIHVwIGluIGFuIGluZmluaXRlIGxvb3Agb3RoZXJ3aXNlXG4gICAgICAgICovXG4gICAgICAgIHN0b3BSZWNvcmRpbmcoKTtcblxuICAgICAgICAvKlxuICAgICAgICAqIEFsbCBldmVudHMgcmV0dXJuIGEgcHJvbWlzZSB3aGljaCBpcyByZXNvbHZlZCBhZnRlclxuICAgICAgICAqIHRoZSBldmVudCBpcyBjb21wbGV0ZWQuIFVzZWZ1bCBmb3Igd2FpdCBldmVudHNcbiAgICAgICAgKi9cbiAgICAgICAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbGV0IHR5cGUgPSBldmVudC50eXBlO1xuICAgICAgICAgICAgLy8gVE9ETzogQ3JlYXRlIGFuIGV2ZW50IG1hcCBmb3IgZXZlbnRzXG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ2NsaWNrJykgY2xpY2soZXZlbnQsIHJlc29sdmUpO1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdkYmxjbGljaycpIGRibGNsaWNrKGV2ZW50LCByZXNvbHZlKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGUgPT09ICdrZXlwcmVzcycpIGtleXByZXNzKGV2ZW50LCByZXNvbHZlKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGUgPT09ICd3YWl0Jykgd2FpdChldmVudCwgcmVzb2x2ZSk7XG4gICAgICAgICAgICBlbHNlIHJlamVjdChuZXcgRXJyb3IoJ1Vua25vd24gZXZlbnQgdHlwZS4gQ291bGQgbm90IHBsYXknKSk7XG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLyogUmUtYXR0YWNoIGhhbmRsZXJzIGFmdGVyIGV2ZW50IGlzIHBsYXllZCAqL1xuICAgICAgICAgICAgcmVzdW1lUmVjb3JkaW5nKCk7IC8vVE9ETzogRG9uJ3QgYXR0YWNoIGluIHBsYXliYWNrIG1vZGVcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG4vKlxuICogU2ltdWxhdGUgZXZlbnRzXG4gKiBFYWNoIGhhbmRsZXIgZ2V0cyB0aGUgZXZlbnQgb2JqZWN0XG4gKiBhbmQgdGhlIHJlc29sdmUgZnVuY3Rpb24gZm9yIGl0J3MgcHJvbWlzZVxuICogcmVzb2x2ZSgpIG11c3QgYmUgY2FsbGVkIGF0IHRoZSBlbmQgb2YgdGhlIGZ1bmN0aW9uXG4gKi9cblxuY29uc3QgY2xpY2sgPSAoe3BhdGh9LCByZXNvbHZlKSA9PiB7XG4gICAgbGV0IGVsZW1lbnQgPSBnZXRFbGVtZW50KHBhdGgpO1xuICAgICQoZWxlbWVudCkudHJpZ2dlcignY2xpY2snKTtcbiAgICByZXNvbHZlKCk7XG59O1xuXG5jb25zdCBkYmxjbGljayA9ICh7cGF0aH0sIHJlc29sdmUpID0+IHtcbiAgICBsZXQgZWxlbWVudCA9IGdldEVsZW1lbnQocGF0aCk7XG4gICAgJChlbGVtZW50KS50cmlnZ2VyKCdkYmxjbGljaycpO1xuICAgIHJlc29sdmUoKTtcbn07XG5cbmNvbnN0IGtleXByZXNzID0gKHtwYXRoLCB3aGljaH0scmVzb2x2ZSkgPT4ge1xuICAgIGxldCBlbGVtZW50ID0gZ2V0RWxlbWVudChwYXRoKTtcbiAgICBsZXQgY3VycmVudFZhbHVlID0gJChlbGVtZW50KS52YWwoKTtcbiAgICBpZiAod2hpY2ggPT09IDgpIHtcbiAgICAgICAgLyogTWFudWFsbHkgaGFuZGxlIGJhY2tzcGFjZSAqL1xuICAgICAgICAkKGVsZW1lbnQpLnZhbChjdXJyZW50VmFsdWUuc3Vic3RyaW5nKDAsIGN1cnJlbnRWYWx1ZS5sZW5ndGgtMSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBrZXkgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHdoaWNoKTtcbiAgICAgICAgLyogTWFudWFsbHkgYWRkIGNoYXJhY2h0ZXIgKi9cbiAgICAgICAgJChlbGVtZW50KS52YWwoY3VycmVudFZhbHVlICsga2V5KTtcbiAgICB9XG4gICAgLyogVHJpZ2dlciBldmVudCAqL1xuICAgICQoZWxlbWVudCkudHJpZ2dlcihqUXVlcnkuRXZlbnQoJ2tleWRvd24nLCB7d2hpY2h9KSk7XG4gICAgJChlbGVtZW50KS50cmlnZ2VyKGpRdWVyeS5FdmVudCgna2V5dXAnLCB7d2hpY2h9KSk7XG4gICAgcmVzb2x2ZSgpO1xufTtcblxuY29uc3Qgd2FpdCA9ICh7ZHVyYXRpb259LCByZXNvbHZlKSA9PiB7XG4gICAgc2V0VGltZW91dCgoKSA9PiByZXNvbHZlKCksIGR1cmF0aW9uKTtcbn07XG5cbi8qIFBsYXkgYWxsIHJlY29yZGVkIGV2ZW50cyAqL1xuY29uc3QgcGxheSA9ICgpID0+IHtcbiAgICBjb250cm9scy50b2dnbGVQbGF5aW5nU3RhdGUoKTtcbiAgICBwbGF5RXZlbnRzUmVjdXJzaXZlbHkoMCk7XG59XG5cbmNvbnN0IHNldHVwUGxheWJhY2sgPSAoKSA9PiB7XG4gICAgaWYgKGlzUmVjb3JkaW5nKSB0b2dnbGVSZWNvcmRpbmcoKTtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndmhzLXBsYXliYWNrJywgdHJ1ZSk7XG4gICAgbG9jYXRpb24ucmVsb2FkKCk7XG59O1xuXG5jb25zdCBpbml0UGxheWJhY2sgPSAoKSA9PiB7XG4gICAgZXZlbnRzID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndmhzJykpLmV2ZW50cztcbiAgICBzaWRlYmFyLnNob3coKTtcbiAgICBzaWRlYmFyLnJlbmRlcihldmVudHMpO1xuICAgIHBsYXkoKTtcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndmhzLXBsYXliYWNrJyk7XG59O1xuXG5jb25zdCBwbGF5RXZlbnRzUmVjdXJzaXZlbHkgPSAoaW5kZXgpID0+IHtcbiAgICBpZiAoIWV2ZW50c1tpbmRleF0pIHtcbiAgICAgICAgY29udHJvbHMudG9nZ2xlUGxheWluZ1N0YXRlKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLypcbiAgICAgKiBJdCdzIHVzZWZ1bCB0byByZS1yZW5kZXIgdGhlIHNpZGViYXIgYmVjYXVzZVxuICAgICAqIHRoZSBlbGVtZW50IGluIGFuIGV2ZW50IG1pZ2h0IG9ubHkgZW50ZXIgdGhlIERPTVxuICAgICAqIGFmdGVyIGl0J3MgcHJldmlvdXMgZXZlbnQuXG4gICAgICogUGFzc2luZyBsYXN0IGV2ZW50IGluZGV4IGZvciBtYXJraW5nIHByb2dyZXNzXG4gICAgICovXG4gICAgc2lkZWJhci5yZW5kZXIoZXZlbnRzLCBpbmRleCk7XG5cbiAgICAvKiBQbGF5IGV2ZW50ICovXG4gICAgcGxheUV2ZW50KGV2ZW50c1tpbmRleF0pLnRoZW4oKCkgPT4gcGxheUV2ZW50c1JlY3Vyc2l2ZWx5KCsraW5kZXgpKTtcbn07XG5cbmxldCBpc1JlY29yZGluZyA9IGZhbHNlO1xuY29uc3QgdG9nZ2xlUmVjb3JkaW5nID0gKCkgPT4ge1xuICAgIGlmIChpc1JlY29yZGluZykgc3RvcFJlY29yZGluZygpO1xuICAgIGVsc2UgcmVjb3JkKCk7XG4gICAgY29udHJvbHMudG9nZ2xlUmVjb3JkaW5nU3RhdGUoKTtcbn07XG5cbmNvbnN0IHJlY29yZCA9ICgpID0+IHtcbiAgICBldmVudHMgPSBbXTtcbiAgICByZXN1bWVSZWNvcmRpbmcoKTtcbn07XG5cbmNvbnN0IHN0b3BSZWNvcmRpbmcgPSAoKSA9PiB7XG4gICAgZGV0YWNoSGFuZGxlcnMoKTtcbiAgICBpc1JlY29yZGluZyA9IGZhbHNlO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd2aHMnLCBKU09OLnN0cmluZ2lmeSh7ZXZlbnRzfSkpO1xufTtcblxuY29uc3QgcmVzdW1lUmVjb3JkaW5nID0gKCkgPT4ge1xuICAgIGF0dGFjaEhhbmRsZXJzKCk7XG4gICAgaXNSZWNvcmRpbmcgPSB0cnVlO1xufTtcblxuJCgoKSA9PiB7XG4gICAgLyogRXhwb3NlIHB1YmxpYyBmdW5jdGlvbnMgKi9cbiAgICB3aW5kb3cudmhzID0ge1xuICAgICAgICBldmVudHMsXG4gICAgICAgIHRvZ2dsZVJlY29yZGluZyxcbiAgICAgICAgc2V0dXBQbGF5YmFja1xuICAgIH1cbiAgICB3cmFwQm9keUluUmVjb3JkYWJsZSgpO1xuICAgIGNvbnRyb2xzLnNob3coKTtcblxuICAgIGxldCBwbGF5YmFjayA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd2aHMtcGxheWJhY2snKTtcbiAgICBpZiAocGxheWJhY2spIGluaXRQbGF5YmFjaygpO1xufSk7XG4iXX0=
