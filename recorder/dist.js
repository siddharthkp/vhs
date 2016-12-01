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
    event.index = index;

    event.status = index <= lastEventIndex ? 'passed' : 'pending';

    if (event.type === 'wait' && event.duration < 300) return;

    event.identifier = getPrettyIdentifier(event.path);

    if (event.which === 1) delete event.which; // click events
    if (event.which) event.key = getPrettyKey(event.which);

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
    if (!data) return '';
    if (type === 'duration') data = '&#128337; ' + data;
    return '<span class="vhs-sidebar-event-' + type + '">' + data + '</span>';
};

var getNewEventHTML = function getNewEventHTML(_ref) {
    var type = _ref.type,
        duration = _ref.duration,
        key = _ref.key,
        identifier = _ref.identifier,
        status = _ref.status,
        index = _ref.index;

    return '\n        <div\n            class="vhs-sidebar-event vhs-sidebar-event-' + status + '"\n            data-index=' + index + '\n            >\n            <span class="vhs-sidebar-status"></span>\n            ' + getDetailHTML(identifier, 'identifier') + '\n            ' + getDetailHTML(duration, 'duration') + '\n\n            ' + getDetailHTML(key, 'key') + '\n            ' + getDetailHTML(type, 'type') + '\n        </div>\n    ';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9mbi9hcnJheS9pbmNsdWRlcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2EtZnVuY3Rpb24uanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hZGQtdG8tdW5zY29wYWJsZXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hbi1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hcnJheS1pbmNsdWRlcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2NvZi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2NvcmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jdHguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19kZWZpbmVkLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZGVzY3JpcHRvcnMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19kb20tY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZXhwb3J0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZmFpbHMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19nbG9iYWwuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19oYXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19oaWRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faWU4LWRvbS1kZWZpbmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faXMtb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWRwLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fcHJvcGVydHktZGVzYy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3JlZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fc2hhcmVkLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8taW5kZXguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1pbnRlZ2VyLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8taW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3RvLWxlbmd0aC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3RvLXByaW1pdGl2ZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3VpZC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3drcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3LmFycmF5LmluY2x1ZGVzLmpzIiwibm9kZV9tb2R1bGVzL2RyYWdnYWJpbGx5L2RyYWdnYWJpbGx5LmpzIiwibm9kZV9tb2R1bGVzL2V2LWVtaXR0ZXIvZXYtZW1pdHRlci5qcyIsIm5vZGVfbW9kdWxlcy9nZXQtZG9jdW1lbnQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZ2V0LXNpemUvZ2V0LXNpemUuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXhwYXRoLXBvc2l0aW9uL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS14cGF0aC1wb3NpdGlvbi9zcmMvZG9tLWV4Y2VwdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUteHBhdGgtcG9zaXRpb24vc3JjL3hwYXRoLmpzIiwibm9kZV9tb2R1bGVzL3VuaWRyYWdnZXIvdW5pZHJhZ2dlci5qcyIsIm5vZGVfbW9kdWxlcy91bmlwb2ludGVyL3VuaXBvaW50ZXIuanMiLCJub2RlX21vZHVsZXMvd2l0aGludmlld3BvcnQvd2l0aGludmlld3BvcnQuanMiLCJzcmMvY29udHJvbHMuanMiLCJzcmMvc2lkZWJhci5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1ZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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O0FBQ0Q7OztBQ2xKRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9TQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNsTUEsSUFBTSxjQUFjLFFBQVEsYUFBUixDQUFwQjs7QUFFQSxJQUFNLE9BQU8sU0FBUCxJQUFPLEdBQU07QUFDZixNQUFFLE1BQUYsRUFBVSxNQUFWLENBQWlCLElBQWpCO0FBQ0EsUUFBTSxVQUFVLFNBQVMsYUFBVCxDQUF1QixlQUF2QixDQUFoQjtBQUNBLFFBQUksV0FBSixDQUFnQixPQUFoQjtBQUNILENBSkQ7O0FBTUEsSUFBTSx1QkFBdUIsU0FBdkIsb0JBQXVCLEdBQU07QUFDL0IsTUFBRSxvQkFBRixFQUF3QixXQUF4QixDQUFvQyxlQUFwQztBQUNILENBRkQ7O0FBSUEsSUFBTSxxQkFBcUIsU0FBckIsa0JBQXFCLEdBQU07QUFDN0IsTUFBRSxrQkFBRixFQUFzQixXQUF0QixDQUFrQyxhQUFsQztBQUNILENBRkQ7O0FBSUEsSUFBTSwyckRBQU47O0FBbUVBLElBQU0sc0RBRUksTUFGSixtVEFBTjs7QUFZQSxPQUFPLE9BQVAsR0FBaUI7QUFDYixjQURhO0FBRWIsOENBRmE7QUFHYjtBQUhhLENBQWpCOzs7OztBQy9GQSxJQUFNLFFBQVEsUUFBUSx1QkFBUixDQUFkO0FBQ0EsSUFBTSxVQUFVLFFBQVEsZ0JBQVIsQ0FBaEI7QUFDQSxPQUFPLE1BQVAsR0FBZ0IsT0FBaEI7O0FBRUEsSUFBTSxPQUFPLFNBQVAsSUFBTyxHQUFNO0FBQ2YsTUFBRSxNQUFGLEVBQVUsTUFBVixDQUFpQixJQUFqQjtBQUNILENBRkQ7O0FBSUEsSUFBSSxTQUFTLEVBQWI7O0FBRUEsSUFBTSxTQUFTLFNBQVQsTUFBUyxDQUFDLFdBQUQsRUFBYyxjQUFkLEVBQWlDO0FBQzVDLE1BQUUscUJBQUYsRUFBeUIsS0FBekI7QUFDQSxhQUFTLFdBQVQ7QUFDQSxTQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksT0FBTyxNQUEzQixFQUFtQyxHQUFuQztBQUF3QyxpQkFBUyxDQUFULEVBQVksY0FBWjtBQUF4QyxLQUNBO0FBQ0gsQ0FMRDs7QUFPQSxJQUFNLGFBQWEsU0FBYixVQUFhLEdBQU07QUFDckIsUUFBSSxtQkFBbUIsRUFBRSwyQkFBRixFQUErQixJQUEvQixFQUF2QjtBQUNBLFFBQUksQ0FBQyxpQkFBaUIsTUFBdEIsRUFBOEI7O0FBRTlCLFFBQUksQ0FBQyxRQUFRLGdCQUFSLENBQUwsRUFBZ0M7QUFDNUIsWUFBSSxZQUFhLEVBQUUsY0FBRixFQUFrQixTQUFsQixFQUFqQjtBQUNBLFVBQUUsY0FBRixFQUFrQixJQUFsQixHQUF5QixPQUF6QixDQUFpQztBQUM3Qix1QkFBVyxZQUFZO0FBRE0sU0FBakM7QUFHSDtBQUNKLENBVkQ7O0FBWUEsSUFBTSxXQUFXLFNBQVgsUUFBVyxDQUFDLEtBQUQsRUFBUSxjQUFSLEVBQTJCO0FBQ3hDLFFBQUksUUFBUSxPQUFPLEtBQVAsQ0FBWjtBQUNBLFVBQU0sS0FBTixHQUFjLEtBQWQ7O0FBRUEsVUFBTSxNQUFOLEdBQWUsU0FBUyxjQUFULEdBQTBCLFFBQTFCLEdBQW9DLFNBQW5EOztBQUVBLFFBQUksTUFBTSxJQUFOLEtBQWUsTUFBZixJQUF5QixNQUFNLFFBQU4sR0FBaUIsR0FBOUMsRUFBbUQ7O0FBRW5ELFVBQU0sVUFBTixHQUFtQixvQkFBb0IsTUFBTSxJQUExQixDQUFuQjs7QUFFQSxRQUFJLE1BQU0sS0FBTixLQUFnQixDQUFwQixFQUF1QixPQUFPLE1BQU0sS0FBYixDQVZpQixDQVVHO0FBQzNDLFFBQUksTUFBTSxLQUFWLEVBQWlCLE1BQU0sR0FBTixHQUFZLGFBQWEsTUFBTSxLQUFuQixDQUFaOztBQUVqQixNQUFFLHFCQUFGLEVBQXlCLE1BQXpCLENBQWdDLGdCQUFnQixLQUFoQixDQUFoQztBQUNILENBZEQ7O0FBZ0JBLElBQU0sc0JBQXNCLFNBQXRCLG1CQUFzQixDQUFDLElBQUQsRUFBVTtBQUNsQyxRQUFJLGFBQWEsRUFBakI7QUFDQSxRQUFJLENBQUMsSUFBTCxFQUFXLE9BQU8sVUFBUDs7QUFFWCxRQUFJLFVBQVUsTUFBTSxNQUFOLENBQWEsSUFBYixFQUFtQixRQUFuQixDQUFkO0FBQ0EsUUFBSSxDQUFDLE9BQUwsRUFBYztBQUNWLGVBQU8sVUFBUDtBQUNIOztBQUVELGtCQUFjLFFBQVEsT0FBUixRQUFxQixRQUFRLE9BQTdCLEdBQXdDLEVBQXREO0FBQ0Esa0JBQWMsUUFBUSxFQUFSLFNBQWlCLFFBQVEsRUFBekIsR0FBK0IsRUFBN0M7QUFDQSxrQkFBYyxRQUFRLFNBQVIsU0FBd0IsUUFBUSxTQUFoQyxHQUE2QyxFQUEzRDtBQUNBLGtCQUFjLFFBQVEsSUFBUixTQUFtQixRQUFRLElBQTNCLFNBQW9DLEVBQWxEO0FBQ0EsV0FBTyxVQUFQO0FBQ0gsQ0FkRDs7QUFnQkEsSUFBTSxlQUFlLFNBQWYsWUFBZSxDQUFDLEtBQUQsRUFBVztBQUM1QixRQUFJLE1BQU07QUFDTixXQUFHLEdBREc7QUFFTixZQUFJLEdBRkU7QUFHTixZQUFJLEdBSEUsQ0FHRTtBQUhGLEtBQVY7QUFLQSxXQUFPLElBQUksS0FBSixLQUFjLE9BQU8sWUFBUCxDQUFvQixLQUFwQixDQUFyQjtBQUNILENBUEQ7O0FBU0EsSUFBTSwrNUNBQU47O0FBMkRBLElBQU0scURBRUksTUFGSiw2SkFBTjs7QUFZQSxJQUFNLGdCQUFnQixTQUFoQixhQUFnQixDQUFDLElBQUQsRUFBTyxJQUFQLEVBQWdCO0FBQ2xDLFFBQUksQ0FBQyxJQUFMLEVBQVc7QUFDWCxRQUFJLFNBQVMsVUFBYixFQUF5QixzQkFBb0IsSUFBcEI7QUFDekIsK0NBQXlDLElBQXpDLFVBQWtELElBQWxEO0FBQ0gsQ0FKRDs7QUFNQSxJQUFNLGtCQUFrQixTQUFsQixlQUFrQixPQUFzRDtBQUFBLFFBQXBELElBQW9ELFFBQXBELElBQW9EO0FBQUEsUUFBOUMsUUFBOEMsUUFBOUMsUUFBOEM7QUFBQSxRQUFwQyxHQUFvQyxRQUFwQyxHQUFvQztBQUFBLFFBQS9CLFVBQStCLFFBQS9CLFVBQStCO0FBQUEsUUFBbkIsTUFBbUIsUUFBbkIsTUFBbUI7QUFBQSxRQUFYLEtBQVcsUUFBWCxLQUFXOztBQUMxRSx1RkFFcUQsTUFGckQsa0NBR3FCLEtBSHJCLDJGQU1VLGNBQWMsVUFBZCxFQUEwQixZQUExQixDQU5WLHNCQU9VLGNBQWMsUUFBZCxFQUF3QixVQUF4QixDQVBWLHdCQVNVLGNBQWMsR0FBZCxFQUFtQixLQUFuQixDQVRWLHNCQVVVLGNBQWMsSUFBZCxFQUFvQixNQUFwQixDQVZWO0FBYUgsQ0FkRDs7QUFnQkEsT0FBTyxPQUFQLEdBQWlCO0FBQ2IsY0FEYTtBQUViO0FBRmEsQ0FBakI7Ozs7O0FDbktBO0FBQ0EsSUFBTSxRQUFRLFFBQVEsdUJBQVIsQ0FBZDs7QUFFQTtBQUNBLFFBQVEsMkJBQVI7O0FBRUEsSUFBTSxXQUFXLFFBQVEsWUFBUixDQUFqQjtBQUNBLElBQU0sVUFBVSxRQUFRLFdBQVIsQ0FBaEI7O0FBRUE7QUFDQSxJQUFNLGFBQWEsQ0FBQyxPQUFELEVBQVUsVUFBVixFQUFzQixVQUF0QixDQUFuQjs7QUFFQTtBQUNBLElBQU0sb0JBQW9CLENBQUMsU0FBRCxDQUExQjs7QUFFQSxJQUFJLFNBQVMsRUFBYjs7QUFFQTtBQUNBLElBQU0sbUJBQW1CLFNBQW5CLGdCQUFtQixHQUFNO0FBQzNCLFFBQUksV0FBVyxFQUFmO0FBQ0EsZUFBVyxHQUFYLENBQWU7QUFBQSxlQUFRLFNBQVMsSUFBVCxJQUFpQixXQUF6QjtBQUFBLEtBQWY7QUFDQSxzQkFBa0IsR0FBbEIsQ0FBc0I7QUFBQSxlQUFRLFNBQVMsSUFBVCxJQUFpQixXQUF6QjtBQUFBLEtBQXRCO0FBQ0EsV0FBTyxRQUFQO0FBQ0gsQ0FMRDs7QUFPQSxJQUFNLHVCQUF1QixTQUF2QixvQkFBdUIsR0FBTTtBQUMvQixNQUFFLE1BQUYsRUFBVSxTQUFWLENBQW9CLG9DQUFwQjtBQUNILENBRkQ7O0FBSUEsSUFBTSxpQkFBaUIsU0FBakIsY0FBaUIsR0FBTTtBQUN6QixRQUFJLFdBQVcsa0JBQWY7QUFDQSxNQUFFLGlCQUFGLEVBQXFCLEVBQXJCLENBQXdCLFFBQXhCO0FBQ0gsQ0FIRDs7QUFLQSxJQUFNLGlCQUFpQixTQUFqQixjQUFpQixHQUFNO0FBQ3pCLFFBQUksV0FBVyxrQkFBZjtBQUNBLE1BQUUsaUJBQUYsRUFBcUIsR0FBckIsQ0FBeUIsUUFBekI7QUFDSCxDQUhEOztBQUtBLElBQU0sY0FBYyxTQUFkLFdBQWMsQ0FBQyxLQUFELEVBQVc7QUFDM0I7QUFDQSxRQUFJLENBQUMsV0FBVyxRQUFYLENBQW9CLE1BQU0sSUFBMUIsQ0FBTCxFQUFzQztBQUNsQztBQUNBLFlBQUksa0JBQWtCLFFBQWxCLENBQTJCLE1BQU0sSUFBakMsQ0FBSixFQUE0QyxZQUFZLEtBQVo7QUFDNUM7QUFDSDs7QUFFRDs7Ozs7Ozs7O0FBU0EsUUFBSSxNQUFNLGNBQVYsRUFBMEIsTUFBTSxjQUFOOztBQUUxQjtBQUNBLFdBQU8sSUFBUCxDQUFZLGNBQVo7O0FBRUEsUUFBSSxpQkFBaUI7QUFDakIsY0FBTSxNQUFNLElBREs7QUFFakIsZUFBTyxNQUFNLEtBRkk7QUFHakIsY0FBTSxNQUFNLFFBQU4sQ0FBZSxNQUFNLE1BQXJCLEVBQTZCLFFBQTdCO0FBSFcsS0FBckI7QUFLQSxXQUFPLElBQVAsQ0FBWSxjQUFaOztBQUVBLFFBQUksQ0FBQyxNQUFNLEtBQVgsRUFBa0IsVUFBVSxjQUFWO0FBQ3JCLENBOUJEOztBQWdDQSxJQUFNLGNBQWMsU0FBZCxXQUFjLENBQUMsS0FBRCxFQUFXO0FBQzNCO0FBQ0EsUUFBSSxNQUFNLElBQU4sS0FBZSxTQUFmLElBQTRCLE1BQU0sS0FBTixLQUFnQixDQUFoRCxFQUFtRCxjQUFjLEtBQWQ7QUFDdEQsQ0FIRDs7QUFLQSxJQUFNLGdCQUFnQixTQUFoQixhQUFnQixPQUFxQjtBQUFBLFFBQW5CLEtBQW1CLFFBQW5CLEtBQW1CO0FBQUEsUUFBWixNQUFZLFFBQVosTUFBWTs7QUFDdkMsUUFBSSxjQUFjO0FBQ2QsY0FBTSxVQURRO0FBRWQsb0JBRmM7QUFHZCxzQkFIYztBQUlkLGVBQU87QUFKTyxLQUFsQjtBQU1BLGdCQUFZLFdBQVo7QUFDSCxDQVJEOztBQVVBLElBQUksMkJBQUo7QUFDQSxJQUFNLGVBQWUsU0FBZixZQUFlLEdBQU07QUFDdkIsUUFBSSxNQUFNLElBQUksSUFBSixHQUFXLE9BQVgsRUFBVjtBQUNBLFFBQUksUUFBUTtBQUNSLGNBQU0sTUFERTtBQUVSO0FBQ0Esa0JBQVcsTUFBTSxrQkFBUCxJQUE4QjtBQUhoQyxLQUFaOztBQU1BLHlCQUFxQixHQUFyQjtBQUNBLFdBQU8sS0FBUDtBQUNILENBVkQ7O0FBWUEsSUFBTSxhQUFhLFNBQWIsVUFBYSxDQUFDLElBQUQsRUFBVTtBQUN6QixXQUFPLE1BQU0sTUFBTixDQUFhLElBQWIsRUFBbUIsUUFBbkIsQ0FBUDtBQUNILENBRkQ7O0FBSUE7QUFDQSxJQUFNLFlBQVksU0FBWixTQUFZLENBQUMsS0FBRCxFQUFXO0FBQ3pCO0FBQ0EsV0FBTyxJQUFJLE9BQUosQ0FBWSxtQkFBVztBQUMxQjs7OztBQUlBOztBQUVBOzs7O0FBSUEsWUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQVUsTUFBVixFQUFxQjtBQUM3QixnQkFBSSxPQUFPLE1BQU0sSUFBakI7QUFDQTtBQUNBLGdCQUFJLFNBQVMsT0FBYixFQUFzQixNQUFNLEtBQU4sRUFBYSxPQUFiO0FBQ3RCLGdCQUFJLFNBQVMsVUFBYixFQUF5QixTQUFTLEtBQVQsRUFBZ0IsT0FBaEIsRUFBekIsS0FDSyxJQUFJLFNBQVMsVUFBYixFQUF5QixTQUFTLEtBQVQsRUFBZ0IsT0FBaEIsRUFBekIsS0FDQSxJQUFJLFNBQVMsTUFBYixFQUFxQixLQUFLLEtBQUwsRUFBWSxPQUFaLEVBQXJCLEtBQ0EsT0FBTyxJQUFJLEtBQUosQ0FBVSxvQ0FBVixDQUFQO0FBQ1IsU0FSRCxFQVFHLElBUkgsQ0FRUSxZQUFNO0FBQ1Y7QUFDQSw4QkFGVSxDQUVTO0FBQ25CO0FBQ0gsU0FaRDtBQWFILEtBeEJNLENBQVA7QUF5QkgsQ0EzQkQ7O0FBNkJBOzs7Ozs7O0FBT0EsSUFBTSxRQUFRLFNBQVIsS0FBUSxRQUFTLE9BQVQsRUFBcUI7QUFBQSxRQUFuQixJQUFtQixTQUFuQixJQUFtQjs7QUFDL0IsUUFBSSxVQUFVLFdBQVcsSUFBWCxDQUFkO0FBQ0EsTUFBRSxPQUFGLEVBQVcsT0FBWCxDQUFtQixPQUFuQjtBQUNBO0FBQ0gsQ0FKRDs7QUFNQSxJQUFNLFdBQVcsU0FBWCxRQUFXLFFBQVMsT0FBVCxFQUFxQjtBQUFBLFFBQW5CLElBQW1CLFNBQW5CLElBQW1COztBQUNsQyxRQUFJLFVBQVUsV0FBVyxJQUFYLENBQWQ7QUFDQSxNQUFFLE9BQUYsRUFBVyxPQUFYLENBQW1CLFVBQW5CO0FBQ0E7QUFDSCxDQUpEOztBQU1BLElBQU0sV0FBVyxTQUFYLFFBQVcsUUFBZSxPQUFmLEVBQTJCO0FBQUEsUUFBekIsSUFBeUIsU0FBekIsSUFBeUI7QUFBQSxRQUFuQixLQUFtQixTQUFuQixLQUFtQjs7QUFDeEMsUUFBSSxVQUFVLFdBQVcsSUFBWCxDQUFkO0FBQ0EsUUFBSSxlQUFlLEVBQUUsT0FBRixFQUFXLEdBQVgsRUFBbkI7QUFDQSxRQUFJLFVBQVUsQ0FBZCxFQUFpQjtBQUNiO0FBQ0EsVUFBRSxPQUFGLEVBQVcsR0FBWCxDQUFlLGFBQWEsU0FBYixDQUF1QixDQUF2QixFQUEwQixhQUFhLE1BQWIsR0FBb0IsQ0FBOUMsQ0FBZjtBQUNILEtBSEQsTUFHTztBQUNILFlBQUksTUFBTSxPQUFPLFlBQVAsQ0FBb0IsS0FBcEIsQ0FBVjtBQUNBO0FBQ0EsVUFBRSxPQUFGLEVBQVcsR0FBWCxDQUFlLGVBQWUsR0FBOUI7QUFDSDtBQUNEO0FBQ0EsTUFBRSxPQUFGLEVBQVcsT0FBWCxDQUFtQixPQUFPLEtBQVAsQ0FBYSxTQUFiLEVBQXdCLEVBQUMsWUFBRCxFQUF4QixDQUFuQjtBQUNBLE1BQUUsT0FBRixFQUFXLE9BQVgsQ0FBbUIsT0FBTyxLQUFQLENBQWEsT0FBYixFQUFzQixFQUFDLFlBQUQsRUFBdEIsQ0FBbkI7QUFDQTtBQUNILENBZkQ7O0FBaUJBLElBQU0sT0FBTyxTQUFQLElBQU8sUUFBYSxPQUFiLEVBQXlCO0FBQUEsUUFBdkIsUUFBdUIsU0FBdkIsUUFBdUI7O0FBQ2xDLGVBQVc7QUFBQSxlQUFNLFNBQU47QUFBQSxLQUFYLEVBQTRCLFFBQTVCO0FBQ0gsQ0FGRDs7QUFJQTtBQUNBLElBQU0sT0FBTyxTQUFQLElBQU8sR0FBTTtBQUNmLGFBQVMsa0JBQVQ7QUFDQSwwQkFBc0IsQ0FBdEI7QUFDSCxDQUhEOztBQUtBLElBQU0sZ0JBQWdCLFNBQWhCLGFBQWdCLEdBQU07QUFDeEIsUUFBSSxXQUFKLEVBQWlCO0FBQ2pCLGlCQUFhLE9BQWIsQ0FBcUIsY0FBckIsRUFBcUMsSUFBckM7QUFDQSxhQUFTLE1BQVQ7QUFDSCxDQUpEOztBQU1BLElBQU0sZUFBZSxTQUFmLFlBQWUsR0FBTTtBQUN2QixhQUFTLEtBQUssS0FBTCxDQUFXLGFBQWEsT0FBYixDQUFxQixLQUFyQixDQUFYLEVBQXdDLE1BQWpEO0FBQ0EsWUFBUSxJQUFSO0FBQ0EsWUFBUSxNQUFSLENBQWUsTUFBZjtBQUNBO0FBQ0EsaUJBQWEsVUFBYixDQUF3QixjQUF4QjtBQUNILENBTkQ7O0FBUUEsSUFBTSx3QkFBd0IsU0FBeEIscUJBQXdCLENBQUMsS0FBRCxFQUFXO0FBQ3JDLFFBQUksQ0FBQyxPQUFPLEtBQVAsQ0FBTCxFQUFvQjtBQUNoQixpQkFBUyxrQkFBVDtBQUNBO0FBQ0g7QUFDRDs7Ozs7O0FBTUEsWUFBUSxNQUFSLENBQWUsTUFBZixFQUF1QixLQUF2Qjs7QUFFQTtBQUNBLGNBQVUsT0FBTyxLQUFQLENBQVYsRUFBeUIsSUFBekIsQ0FBOEI7QUFBQSxlQUFNLHNCQUFzQixFQUFFLEtBQXhCLENBQU47QUFBQSxLQUE5QjtBQUNILENBZkQ7O0FBaUJBLElBQUksY0FBYyxLQUFsQjtBQUNBLElBQU0sa0JBQWtCLFNBQWxCLGVBQWtCLEdBQU07QUFDMUIsUUFBSSxXQUFKLEVBQWlCLGdCQUFqQixLQUNLO0FBQ0wsYUFBUyxvQkFBVDtBQUNILENBSkQ7O0FBTUEsSUFBTSxTQUFTLFNBQVQsTUFBUyxHQUFNO0FBQ2pCLGFBQVMsRUFBVDtBQUNBO0FBQ0gsQ0FIRDs7QUFLQSxJQUFNLGdCQUFnQixTQUFoQixhQUFnQixHQUFNO0FBQ3hCO0FBQ0Esa0JBQWMsS0FBZDtBQUNBLGlCQUFhLE9BQWIsQ0FBcUIsS0FBckIsRUFBNEIsS0FBSyxTQUFMLENBQWUsRUFBQyxjQUFELEVBQWYsQ0FBNUI7QUFDSCxDQUpEOztBQU1BLElBQU0sa0JBQWtCLFNBQWxCLGVBQWtCLEdBQU07QUFDMUI7QUFDQSxrQkFBYyxJQUFkO0FBQ0gsQ0FIRDs7QUFLQSxFQUFFLFlBQU07QUFDSjtBQUNBLFdBQU8sR0FBUCxHQUFhO0FBQ1Qsc0JBRFM7QUFFVCx3Q0FGUztBQUdUO0FBSFMsS0FBYjtBQUtBO0FBQ0EsYUFBUyxJQUFUOztBQUVBLFFBQUksV0FBVyxhQUFhLE9BQWIsQ0FBcUIsY0FBckIsQ0FBZjtBQUNBLFFBQUksUUFBSixFQUFjO0FBQ2pCLENBWkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczcuYXJyYXkuaW5jbHVkZXMnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLkFycmF5LmluY2x1ZGVzOyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZih0eXBlb2YgaXQgIT0gJ2Z1bmN0aW9uJyl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uIScpO1xuICByZXR1cm4gaXQ7XG59OyIsIi8vIDIyLjEuMy4zMSBBcnJheS5wcm90b3R5cGVbQEB1bnNjb3BhYmxlc11cbnZhciBVTlNDT1BBQkxFUyA9IHJlcXVpcmUoJy4vX3drcycpKCd1bnNjb3BhYmxlcycpXG4gICwgQXJyYXlQcm90byAgPSBBcnJheS5wcm90b3R5cGU7XG5pZihBcnJheVByb3RvW1VOU0NPUEFCTEVTXSA9PSB1bmRlZmluZWQpcmVxdWlyZSgnLi9faGlkZScpKEFycmF5UHJvdG8sIFVOU0NPUEFCTEVTLCB7fSk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGtleSl7XG4gIEFycmF5UHJvdG9bVU5TQ09QQUJMRVNdW2tleV0gPSB0cnVlO1xufTsiLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZighaXNPYmplY3QoaXQpKXRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGFuIG9iamVjdCEnKTtcbiAgcmV0dXJuIGl0O1xufTsiLCIvLyBmYWxzZSAtPiBBcnJheSNpbmRleE9mXG4vLyB0cnVlICAtPiBBcnJheSNpbmNsdWRlc1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKVxuICAsIHRvTGVuZ3RoICA9IHJlcXVpcmUoJy4vX3RvLWxlbmd0aCcpXG4gICwgdG9JbmRleCAgID0gcmVxdWlyZSgnLi9fdG8taW5kZXgnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oSVNfSU5DTFVERVMpe1xuICByZXR1cm4gZnVuY3Rpb24oJHRoaXMsIGVsLCBmcm9tSW5kZXgpe1xuICAgIHZhciBPICAgICAgPSB0b0lPYmplY3QoJHRoaXMpXG4gICAgICAsIGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKVxuICAgICAgLCBpbmRleCAgPSB0b0luZGV4KGZyb21JbmRleCwgbGVuZ3RoKVxuICAgICAgLCB2YWx1ZTtcbiAgICAvLyBBcnJheSNpbmNsdWRlcyB1c2VzIFNhbWVWYWx1ZVplcm8gZXF1YWxpdHkgYWxnb3JpdGhtXG4gICAgaWYoSVNfSU5DTFVERVMgJiYgZWwgIT0gZWwpd2hpbGUobGVuZ3RoID4gaW5kZXgpe1xuICAgICAgdmFsdWUgPSBPW2luZGV4KytdO1xuICAgICAgaWYodmFsdWUgIT0gdmFsdWUpcmV0dXJuIHRydWU7XG4gICAgLy8gQXJyYXkjdG9JbmRleCBpZ25vcmVzIGhvbGVzLCBBcnJheSNpbmNsdWRlcyAtIG5vdFxuICAgIH0gZWxzZSBmb3IoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKWlmKElTX0lOQ0xVREVTIHx8IGluZGV4IGluIE8pe1xuICAgICAgaWYoT1tpbmRleF0gPT09IGVsKXJldHVybiBJU19JTkNMVURFUyB8fCBpbmRleCB8fCAwO1xuICAgIH0gcmV0dXJuICFJU19JTkNMVURFUyAmJiAtMTtcbiAgfTtcbn07IiwidmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbChpdCkuc2xpY2UoOCwgLTEpO1xufTsiLCJ2YXIgY29yZSA9IG1vZHVsZS5leHBvcnRzID0ge3ZlcnNpb246ICcyLjQuMCd9O1xuaWYodHlwZW9mIF9fZSA9PSAnbnVtYmVyJylfX2UgPSBjb3JlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmIiwiLy8gb3B0aW9uYWwgLyBzaW1wbGUgY29udGV4dCBiaW5kaW5nXG52YXIgYUZ1bmN0aW9uID0gcmVxdWlyZSgnLi9fYS1mdW5jdGlvbicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmbiwgdGhhdCwgbGVuZ3RoKXtcbiAgYUZ1bmN0aW9uKGZuKTtcbiAgaWYodGhhdCA9PT0gdW5kZWZpbmVkKXJldHVybiBmbjtcbiAgc3dpdGNoKGxlbmd0aCl7XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24oYSl7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhKTtcbiAgICB9O1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYik7XG4gICAgfTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbihhLCBiLCBjKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIsIGMpO1xuICAgIH07XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKC8qIC4uLmFyZ3MgKi8pe1xuICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xuICB9O1xufTsiLCIvLyA3LjIuMSBSZXF1aXJlT2JqZWN0Q29lcmNpYmxlKGFyZ3VtZW50KVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIGlmKGl0ID09IHVuZGVmaW5lZCl0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjYWxsIG1ldGhvZCBvbiAgXCIgKyBpdCk7XG4gIHJldHVybiBpdDtcbn07IiwiLy8gVGhhbmsncyBJRTggZm9yIGhpcyBmdW5ueSBkZWZpbmVQcm9wZXJ0eVxubW9kdWxlLmV4cG9ydHMgPSAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbigpe1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAnYScsIHtnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiA3OyB9fSkuYSAhPSA3O1xufSk7IiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0JylcbiAgLCBkb2N1bWVudCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLmRvY3VtZW50XG4gIC8vIGluIG9sZCBJRSB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBpcyAnb2JqZWN0J1xuICAsIGlzID0gaXNPYmplY3QoZG9jdW1lbnQpICYmIGlzT2JqZWN0KGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpcyA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoaXQpIDoge307XG59OyIsInZhciBnbG9iYWwgICAgPSByZXF1aXJlKCcuL19nbG9iYWwnKVxuICAsIGNvcmUgICAgICA9IHJlcXVpcmUoJy4vX2NvcmUnKVxuICAsIGhpZGUgICAgICA9IHJlcXVpcmUoJy4vX2hpZGUnKVxuICAsIHJlZGVmaW5lICA9IHJlcXVpcmUoJy4vX3JlZGVmaW5lJylcbiAgLCBjdHggICAgICAgPSByZXF1aXJlKCcuL19jdHgnKVxuICAsIFBST1RPVFlQRSA9ICdwcm90b3R5cGUnO1xuXG52YXIgJGV4cG9ydCA9IGZ1bmN0aW9uKHR5cGUsIG5hbWUsIHNvdXJjZSl7XG4gIHZhciBJU19GT1JDRUQgPSB0eXBlICYgJGV4cG9ydC5GXG4gICAgLCBJU19HTE9CQUwgPSB0eXBlICYgJGV4cG9ydC5HXG4gICAgLCBJU19TVEFUSUMgPSB0eXBlICYgJGV4cG9ydC5TXG4gICAgLCBJU19QUk9UTyAgPSB0eXBlICYgJGV4cG9ydC5QXG4gICAgLCBJU19CSU5EICAgPSB0eXBlICYgJGV4cG9ydC5CXG4gICAgLCB0YXJnZXQgICAgPSBJU19HTE9CQUwgPyBnbG9iYWwgOiBJU19TVEFUSUMgPyBnbG9iYWxbbmFtZV0gfHwgKGdsb2JhbFtuYW1lXSA9IHt9KSA6IChnbG9iYWxbbmFtZV0gfHwge30pW1BST1RPVFlQRV1cbiAgICAsIGV4cG9ydHMgICA9IElTX0dMT0JBTCA/IGNvcmUgOiBjb3JlW25hbWVdIHx8IChjb3JlW25hbWVdID0ge30pXG4gICAgLCBleHBQcm90byAgPSBleHBvcnRzW1BST1RPVFlQRV0gfHwgKGV4cG9ydHNbUFJPVE9UWVBFXSA9IHt9KVxuICAgICwga2V5LCBvd24sIG91dCwgZXhwO1xuICBpZihJU19HTE9CQUwpc291cmNlID0gbmFtZTtcbiAgZm9yKGtleSBpbiBzb3VyY2Upe1xuICAgIC8vIGNvbnRhaW5zIGluIG5hdGl2ZVxuICAgIG93biA9ICFJU19GT1JDRUQgJiYgdGFyZ2V0ICYmIHRhcmdldFtrZXldICE9PSB1bmRlZmluZWQ7XG4gICAgLy8gZXhwb3J0IG5hdGl2ZSBvciBwYXNzZWRcbiAgICBvdXQgPSAob3duID8gdGFyZ2V0IDogc291cmNlKVtrZXldO1xuICAgIC8vIGJpbmQgdGltZXJzIHRvIGdsb2JhbCBmb3IgY2FsbCBmcm9tIGV4cG9ydCBjb250ZXh0XG4gICAgZXhwID0gSVNfQklORCAmJiBvd24gPyBjdHgob3V0LCBnbG9iYWwpIDogSVNfUFJPVE8gJiYgdHlwZW9mIG91dCA9PSAnZnVuY3Rpb24nID8gY3R4KEZ1bmN0aW9uLmNhbGwsIG91dCkgOiBvdXQ7XG4gICAgLy8gZXh0ZW5kIGdsb2JhbFxuICAgIGlmKHRhcmdldClyZWRlZmluZSh0YXJnZXQsIGtleSwgb3V0LCB0eXBlICYgJGV4cG9ydC5VKTtcbiAgICAvLyBleHBvcnRcbiAgICBpZihleHBvcnRzW2tleV0gIT0gb3V0KWhpZGUoZXhwb3J0cywga2V5LCBleHApO1xuICAgIGlmKElTX1BST1RPICYmIGV4cFByb3RvW2tleV0gIT0gb3V0KWV4cFByb3RvW2tleV0gPSBvdXQ7XG4gIH1cbn07XG5nbG9iYWwuY29yZSA9IGNvcmU7XG4vLyB0eXBlIGJpdG1hcFxuJGV4cG9ydC5GID0gMTsgICAvLyBmb3JjZWRcbiRleHBvcnQuRyA9IDI7ICAgLy8gZ2xvYmFsXG4kZXhwb3J0LlMgPSA0OyAgIC8vIHN0YXRpY1xuJGV4cG9ydC5QID0gODsgICAvLyBwcm90b1xuJGV4cG9ydC5CID0gMTY7ICAvLyBiaW5kXG4kZXhwb3J0LlcgPSAzMjsgIC8vIHdyYXBcbiRleHBvcnQuVSA9IDY0OyAgLy8gc2FmZVxuJGV4cG9ydC5SID0gMTI4OyAvLyByZWFsIHByb3RvIG1ldGhvZCBmb3IgYGxpYnJhcnlgIFxubW9kdWxlLmV4cG9ydHMgPSAkZXhwb3J0OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZXhlYyl7XG4gIHRyeSB7XG4gICAgcmV0dXJuICEhZXhlYygpO1xuICB9IGNhdGNoKGUpe1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59OyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy84NiNpc3N1ZWNvbW1lbnQtMTE1NzU5MDI4XG52YXIgZ2xvYmFsID0gbW9kdWxlLmV4cG9ydHMgPSB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnICYmIHdpbmRvdy5NYXRoID09IE1hdGhcbiAgPyB3aW5kb3cgOiB0eXBlb2Ygc2VsZiAhPSAndW5kZWZpbmVkJyAmJiBzZWxmLk1hdGggPT0gTWF0aCA/IHNlbGYgOiBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuaWYodHlwZW9mIF9fZyA9PSAnbnVtYmVyJylfX2cgPSBnbG9iYWw7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWYiLCJ2YXIgaGFzT3duUHJvcGVydHkgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQsIGtleSl7XG4gIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGl0LCBrZXkpO1xufTsiLCJ2YXIgZFAgICAgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpXG4gICwgY3JlYXRlRGVzYyA9IHJlcXVpcmUoJy4vX3Byb3BlcnR5LWRlc2MnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IGZ1bmN0aW9uKG9iamVjdCwga2V5LCB2YWx1ZSl7XG4gIHJldHVybiBkUC5mKG9iamVjdCwga2V5LCBjcmVhdGVEZXNjKDEsIHZhbHVlKSk7XG59IDogZnVuY3Rpb24ob2JqZWN0LCBrZXksIHZhbHVlKXtcbiAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgcmV0dXJuIG9iamVjdDtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSAhcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSAmJiAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbigpe1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHJlcXVpcmUoJy4vX2RvbS1jcmVhdGUnKSgnZGl2JyksICdhJywge2dldDogZnVuY3Rpb24oKXsgcmV0dXJuIDc7IH19KS5hICE9IDc7XG59KTsiLCIvLyBmYWxsYmFjayBmb3Igbm9uLWFycmF5LWxpa2UgRVMzIGFuZCBub24tZW51bWVyYWJsZSBvbGQgVjggc3RyaW5nc1xudmFyIGNvZiA9IHJlcXVpcmUoJy4vX2NvZicpO1xubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QoJ3onKS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgwKSA/IE9iamVjdCA6IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGNvZihpdCkgPT0gJ1N0cmluZycgPyBpdC5zcGxpdCgnJykgOiBPYmplY3QoaXQpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PT0gJ29iamVjdCcgPyBpdCAhPT0gbnVsbCA6IHR5cGVvZiBpdCA9PT0gJ2Z1bmN0aW9uJztcbn07IiwidmFyIGFuT2JqZWN0ICAgICAgID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0JylcbiAgLCBJRThfRE9NX0RFRklORSA9IHJlcXVpcmUoJy4vX2llOC1kb20tZGVmaW5lJylcbiAgLCB0b1ByaW1pdGl2ZSAgICA9IHJlcXVpcmUoJy4vX3RvLXByaW1pdGl2ZScpXG4gICwgZFAgICAgICAgICAgICAgPSBPYmplY3QuZGVmaW5lUHJvcGVydHk7XG5cbmV4cG9ydHMuZiA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBPYmplY3QuZGVmaW5lUHJvcGVydHkgOiBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShPLCBQLCBBdHRyaWJ1dGVzKXtcbiAgYW5PYmplY3QoTyk7XG4gIFAgPSB0b1ByaW1pdGl2ZShQLCB0cnVlKTtcbiAgYW5PYmplY3QoQXR0cmlidXRlcyk7XG4gIGlmKElFOF9ET01fREVGSU5FKXRyeSB7XG4gICAgcmV0dXJuIGRQKE8sIFAsIEF0dHJpYnV0ZXMpO1xuICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG4gIGlmKCdnZXQnIGluIEF0dHJpYnV0ZXMgfHwgJ3NldCcgaW4gQXR0cmlidXRlcyl0aHJvdyBUeXBlRXJyb3IoJ0FjY2Vzc29ycyBub3Qgc3VwcG9ydGVkIScpO1xuICBpZigndmFsdWUnIGluIEF0dHJpYnV0ZXMpT1tQXSA9IEF0dHJpYnV0ZXMudmFsdWU7XG4gIHJldHVybiBPO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGJpdG1hcCwgdmFsdWUpe1xuICByZXR1cm4ge1xuICAgIGVudW1lcmFibGUgIDogIShiaXRtYXAgJiAxKSxcbiAgICBjb25maWd1cmFibGU6ICEoYml0bWFwICYgMiksXG4gICAgd3JpdGFibGUgICAgOiAhKGJpdG1hcCAmIDQpLFxuICAgIHZhbHVlICAgICAgIDogdmFsdWVcbiAgfTtcbn07IiwidmFyIGdsb2JhbCAgICA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpXG4gICwgaGlkZSAgICAgID0gcmVxdWlyZSgnLi9faGlkZScpXG4gICwgaGFzICAgICAgID0gcmVxdWlyZSgnLi9faGFzJylcbiAgLCBTUkMgICAgICAgPSByZXF1aXJlKCcuL191aWQnKSgnc3JjJylcbiAgLCBUT19TVFJJTkcgPSAndG9TdHJpbmcnXG4gICwgJHRvU3RyaW5nID0gRnVuY3Rpb25bVE9fU1RSSU5HXVxuICAsIFRQTCAgICAgICA9ICgnJyArICR0b1N0cmluZykuc3BsaXQoVE9fU1RSSU5HKTtcblxucmVxdWlyZSgnLi9fY29yZScpLmluc3BlY3RTb3VyY2UgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiAkdG9TdHJpbmcuY2FsbChpdCk7XG59O1xuXG4obW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihPLCBrZXksIHZhbCwgc2FmZSl7XG4gIHZhciBpc0Z1bmN0aW9uID0gdHlwZW9mIHZhbCA9PSAnZnVuY3Rpb24nO1xuICBpZihpc0Z1bmN0aW9uKWhhcyh2YWwsICduYW1lJykgfHwgaGlkZSh2YWwsICduYW1lJywga2V5KTtcbiAgaWYoT1trZXldID09PSB2YWwpcmV0dXJuO1xuICBpZihpc0Z1bmN0aW9uKWhhcyh2YWwsIFNSQykgfHwgaGlkZSh2YWwsIFNSQywgT1trZXldID8gJycgKyBPW2tleV0gOiBUUEwuam9pbihTdHJpbmcoa2V5KSkpO1xuICBpZihPID09PSBnbG9iYWwpe1xuICAgIE9ba2V5XSA9IHZhbDtcbiAgfSBlbHNlIHtcbiAgICBpZighc2FmZSl7XG4gICAgICBkZWxldGUgT1trZXldO1xuICAgICAgaGlkZShPLCBrZXksIHZhbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmKE9ba2V5XSlPW2tleV0gPSB2YWw7XG4gICAgICBlbHNlIGhpZGUoTywga2V5LCB2YWwpO1xuICAgIH1cbiAgfVxuLy8gYWRkIGZha2UgRnVuY3Rpb24jdG9TdHJpbmcgZm9yIGNvcnJlY3Qgd29yayB3cmFwcGVkIG1ldGhvZHMgLyBjb25zdHJ1Y3RvcnMgd2l0aCBtZXRob2RzIGxpa2UgTG9EYXNoIGlzTmF0aXZlXG59KShGdW5jdGlvbi5wcm90b3R5cGUsIFRPX1NUUklORywgZnVuY3Rpb24gdG9TdHJpbmcoKXtcbiAgcmV0dXJuIHR5cGVvZiB0aGlzID09ICdmdW5jdGlvbicgJiYgdGhpc1tTUkNdIHx8ICR0b1N0cmluZy5jYWxsKHRoaXMpO1xufSk7IiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpXG4gICwgU0hBUkVEID0gJ19fY29yZS1qc19zaGFyZWRfXydcbiAgLCBzdG9yZSAgPSBnbG9iYWxbU0hBUkVEXSB8fCAoZ2xvYmFsW1NIQVJFRF0gPSB7fSk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGtleSl7XG4gIHJldHVybiBzdG9yZVtrZXldIHx8IChzdG9yZVtrZXldID0ge30pO1xufTsiLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpXG4gICwgbWF4ICAgICAgID0gTWF0aC5tYXhcbiAgLCBtaW4gICAgICAgPSBNYXRoLm1pbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaW5kZXgsIGxlbmd0aCl7XG4gIGluZGV4ID0gdG9JbnRlZ2VyKGluZGV4KTtcbiAgcmV0dXJuIGluZGV4IDwgMCA/IG1heChpbmRleCArIGxlbmd0aCwgMCkgOiBtaW4oaW5kZXgsIGxlbmd0aCk7XG59OyIsIi8vIDcuMS40IFRvSW50ZWdlclxudmFyIGNlaWwgID0gTWF0aC5jZWlsXG4gICwgZmxvb3IgPSBNYXRoLmZsb29yO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpc05hTihpdCA9ICtpdCkgPyAwIDogKGl0ID4gMCA/IGZsb29yIDogY2VpbCkoaXQpO1xufTsiLCIvLyB0byBpbmRleGVkIG9iamVjdCwgdG9PYmplY3Qgd2l0aCBmYWxsYmFjayBmb3Igbm9uLWFycmF5LWxpa2UgRVMzIHN0cmluZ3NcbnZhciBJT2JqZWN0ID0gcmVxdWlyZSgnLi9faW9iamVjdCcpXG4gICwgZGVmaW5lZCA9IHJlcXVpcmUoJy4vX2RlZmluZWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gSU9iamVjdChkZWZpbmVkKGl0KSk7XG59OyIsIi8vIDcuMS4xNSBUb0xlbmd0aFxudmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vX3RvLWludGVnZXInKVxuICAsIG1pbiAgICAgICA9IE1hdGgubWluO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpdCA+IDAgPyBtaW4odG9JbnRlZ2VyKGl0KSwgMHgxZmZmZmZmZmZmZmZmZikgOiAwOyAvLyBwb3coMiwgNTMpIC0gMSA9PSA5MDA3MTk5MjU0NzQwOTkxXG59OyIsIi8vIDcuMS4xIFRvUHJpbWl0aXZlKGlucHV0IFssIFByZWZlcnJlZFR5cGVdKVxudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG4vLyBpbnN0ZWFkIG9mIHRoZSBFUzYgc3BlYyB2ZXJzaW9uLCB3ZSBkaWRuJ3QgaW1wbGVtZW50IEBAdG9QcmltaXRpdmUgY2FzZVxuLy8gYW5kIHRoZSBzZWNvbmQgYXJndW1lbnQgLSBmbGFnIC0gcHJlZmVycmVkIHR5cGUgaXMgYSBzdHJpbmdcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQsIFMpe1xuICBpZighaXNPYmplY3QoaXQpKXJldHVybiBpdDtcbiAgdmFyIGZuLCB2YWw7XG4gIGlmKFMgJiYgdHlwZW9mIChmbiA9IGl0LnRvU3RyaW5nKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpcmV0dXJuIHZhbDtcbiAgaWYodHlwZW9mIChmbiA9IGl0LnZhbHVlT2YpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSlyZXR1cm4gdmFsO1xuICBpZighUyAmJiB0eXBlb2YgKGZuID0gaXQudG9TdHJpbmcpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSlyZXR1cm4gdmFsO1xuICB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjb252ZXJ0IG9iamVjdCB0byBwcmltaXRpdmUgdmFsdWVcIik7XG59OyIsInZhciBpZCA9IDBcbiAgLCBweCA9IE1hdGgucmFuZG9tKCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGtleSl7XG4gIHJldHVybiAnU3ltYm9sKCcuY29uY2F0KGtleSA9PT0gdW5kZWZpbmVkID8gJycgOiBrZXksICcpXycsICgrK2lkICsgcHgpLnRvU3RyaW5nKDM2KSk7XG59OyIsInZhciBzdG9yZSAgICAgID0gcmVxdWlyZSgnLi9fc2hhcmVkJykoJ3drcycpXG4gICwgdWlkICAgICAgICA9IHJlcXVpcmUoJy4vX3VpZCcpXG4gICwgU3ltYm9sICAgICA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLlN5bWJvbFxuICAsIFVTRV9TWU1CT0wgPSB0eXBlb2YgU3ltYm9sID09ICdmdW5jdGlvbic7XG5cbnZhciAkZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmFtZSl7XG4gIHJldHVybiBzdG9yZVtuYW1lXSB8fCAoc3RvcmVbbmFtZV0gPVxuICAgIFVTRV9TWU1CT0wgJiYgU3ltYm9sW25hbWVdIHx8IChVU0VfU1lNQk9MID8gU3ltYm9sIDogdWlkKSgnU3ltYm9sLicgKyBuYW1lKSk7XG59O1xuXG4kZXhwb3J0cy5zdG9yZSA9IHN0b3JlOyIsIid1c2Ugc3RyaWN0Jztcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS90YzM5L0FycmF5LnByb3RvdHlwZS5pbmNsdWRlc1xudmFyICRleHBvcnQgICA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpXG4gICwgJGluY2x1ZGVzID0gcmVxdWlyZSgnLi9fYXJyYXktaW5jbHVkZXMnKSh0cnVlKTtcblxuJGV4cG9ydCgkZXhwb3J0LlAsICdBcnJheScsIHtcbiAgaW5jbHVkZXM6IGZ1bmN0aW9uIGluY2x1ZGVzKGVsIC8qLCBmcm9tSW5kZXggPSAwICovKXtcbiAgICByZXR1cm4gJGluY2x1ZGVzKHRoaXMsIGVsLCBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZCk7XG4gIH1cbn0pO1xuXG5yZXF1aXJlKCcuL19hZGQtdG8tdW5zY29wYWJsZXMnKSgnaW5jbHVkZXMnKTsiLCIvKiFcbiAqIERyYWdnYWJpbGx5IHYyLjEuMVxuICogTWFrZSB0aGF0IHNoaXogZHJhZ2dhYmxlXG4gKiBodHRwOi8vZHJhZ2dhYmlsbHkuZGVzYW5kcm8uY29tXG4gKiBNSVQgbGljZW5zZVxuICovXG5cbi8qanNoaW50IGJyb3dzZXI6IHRydWUsIHN0cmljdDogdHJ1ZSwgdW5kZWY6IHRydWUsIHVudXNlZDogdHJ1ZSAqL1xuXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICAvKiBqc2hpbnQgc3RyaWN0OiBmYWxzZSAqLyAvKmdsb2JhbHMgZGVmaW5lLCBtb2R1bGUsIHJlcXVpcmUgKi9cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIFtcbiAgICAgICAgJ2dldC1zaXplL2dldC1zaXplJyxcbiAgICAgICAgJ3VuaWRyYWdnZXIvdW5pZHJhZ2dlcidcbiAgICAgIF0sXG4gICAgICBmdW5jdGlvbiggZ2V0U2l6ZSwgVW5pZHJhZ2dlciApIHtcbiAgICAgICAgcmV0dXJuIGZhY3RvcnkoIHdpbmRvdywgZ2V0U2l6ZSwgVW5pZHJhZ2dlciApO1xuICAgICAgfSk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICByZXF1aXJlKCdnZXQtc2l6ZScpLFxuICAgICAgcmVxdWlyZSgndW5pZHJhZ2dlcicpXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHdpbmRvdy5EcmFnZ2FiaWxseSA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICB3aW5kb3cuZ2V0U2l6ZSxcbiAgICAgIHdpbmRvdy5VbmlkcmFnZ2VyXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgZ2V0U2l6ZSwgVW5pZHJhZ2dlciApIHtcblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyB2YXJzXG52YXIgZG9jdW1lbnQgPSB3aW5kb3cuZG9jdW1lbnQ7XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBoZWxwZXJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8vIGV4dGVuZCBvYmplY3RzXG5mdW5jdGlvbiBleHRlbmQoIGEsIGIgKSB7XG4gIGZvciAoIHZhciBwcm9wIGluIGIgKSB7XG4gICAgYVsgcHJvcCBdID0gYlsgcHJvcCBdO1xuICB9XG4gIHJldHVybiBhO1xufVxuXG5mdW5jdGlvbiBpc0VsZW1lbnQoIG9iaiApIHtcbiAgcmV0dXJuIG9iaiBpbnN0YW5jZW9mIEhUTUxFbGVtZW50O1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLy8gZ2V0IHJBRiwgcHJlZml4ZWQsIGlmIHByZXNlbnRcbnZhciByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gIHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZTtcblxuLy8gZmFsbGJhY2sgdG8gc2V0VGltZW91dFxudmFyIGxhc3RUaW1lID0gMDtcbmlmICggIXJlcXVlc3RBbmltYXRpb25GcmFtZSApICB7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKCBjYWxsYmFjayApIHtcbiAgICB2YXIgY3VyclRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB2YXIgdGltZVRvQ2FsbCA9IE1hdGgubWF4KCAwLCAxNiAtICggY3VyclRpbWUgLSBsYXN0VGltZSApICk7XG4gICAgdmFyIGlkID0gc2V0VGltZW91dCggY2FsbGJhY2ssIHRpbWVUb0NhbGwgKTtcbiAgICBsYXN0VGltZSA9IGN1cnJUaW1lICsgdGltZVRvQ2FsbDtcbiAgICByZXR1cm4gaWQ7XG4gIH07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHN1cHBvcnQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxudmFyIGRvY0VsZW0gPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG52YXIgdHJhbnNmb3JtUHJvcGVydHkgPSB0eXBlb2YgZG9jRWxlbS5zdHlsZS50cmFuc2Zvcm0gPT0gJ3N0cmluZycgP1xuICAndHJhbnNmb3JtJyA6ICdXZWJraXRUcmFuc2Zvcm0nO1xuXG52YXIgalF1ZXJ5ID0gd2luZG93LmpRdWVyeTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbmZ1bmN0aW9uIERyYWdnYWJpbGx5KCBlbGVtZW50LCBvcHRpb25zICkge1xuICAvLyBxdWVyeVNlbGVjdG9yIGlmIHN0cmluZ1xuICB0aGlzLmVsZW1lbnQgPSB0eXBlb2YgZWxlbWVudCA9PSAnc3RyaW5nJyA/XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvciggZWxlbWVudCApIDogZWxlbWVudDtcblxuICBpZiAoIGpRdWVyeSApIHtcbiAgICB0aGlzLiRlbGVtZW50ID0galF1ZXJ5KCB0aGlzLmVsZW1lbnQgKTtcbiAgfVxuXG4gIC8vIG9wdGlvbnNcbiAgdGhpcy5vcHRpb25zID0gZXh0ZW5kKCB7fSwgdGhpcy5jb25zdHJ1Y3Rvci5kZWZhdWx0cyApO1xuICB0aGlzLm9wdGlvbiggb3B0aW9ucyApO1xuXG4gIHRoaXMuX2NyZWF0ZSgpO1xufVxuXG4vLyBpbmhlcml0IFVuaWRyYWdnZXIgbWV0aG9kc1xudmFyIHByb3RvID0gRHJhZ2dhYmlsbHkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVW5pZHJhZ2dlci5wcm90b3R5cGUgKTtcblxuRHJhZ2dhYmlsbHkuZGVmYXVsdHMgPSB7XG59O1xuXG4vKipcbiAqIHNldCBvcHRpb25zXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0c1xuICovXG5wcm90by5vcHRpb24gPSBmdW5jdGlvbiggb3B0cyApIHtcbiAgZXh0ZW5kKCB0aGlzLm9wdGlvbnMsIG9wdHMgKTtcbn07XG5cbi8vIGNzcyBwb3NpdGlvbiB2YWx1ZXMgdGhhdCBkb24ndCBuZWVkIHRvIGJlIHNldFxudmFyIHBvc2l0aW9uVmFsdWVzID0ge1xuICByZWxhdGl2ZTogdHJ1ZSxcbiAgYWJzb2x1dGU6IHRydWUsXG4gIGZpeGVkOiB0cnVlXG59O1xuXG5wcm90by5fY3JlYXRlID0gZnVuY3Rpb24oKSB7XG5cbiAgLy8gcHJvcGVydGllc1xuICB0aGlzLnBvc2l0aW9uID0ge307XG4gIHRoaXMuX2dldFBvc2l0aW9uKCk7XG5cbiAgdGhpcy5zdGFydFBvaW50ID0geyB4OiAwLCB5OiAwIH07XG4gIHRoaXMuZHJhZ1BvaW50ID0geyB4OiAwLCB5OiAwIH07XG5cbiAgdGhpcy5zdGFydFBvc2l0aW9uID0gZXh0ZW5kKCB7fSwgdGhpcy5wb3NpdGlvbiApO1xuXG4gIC8vIHNldCByZWxhdGl2ZSBwb3NpdGlvbmluZ1xuICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKCB0aGlzLmVsZW1lbnQgKTtcbiAgaWYgKCAhcG9zaXRpb25WYWx1ZXNbIHN0eWxlLnBvc2l0aW9uIF0gKSB7XG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ3JlbGF0aXZlJztcbiAgfVxuXG4gIHRoaXMuZW5hYmxlKCk7XG4gIHRoaXMuc2V0SGFuZGxlcygpO1xuXG59O1xuXG4vKipcbiAqIHNldCB0aGlzLmhhbmRsZXMgYW5kIGJpbmQgc3RhcnQgZXZlbnRzIHRvICdlbVxuICovXG5wcm90by5zZXRIYW5kbGVzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaGFuZGxlcyA9IHRoaXMub3B0aW9ucy5oYW5kbGUgP1xuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCB0aGlzLm9wdGlvbnMuaGFuZGxlICkgOiBbIHRoaXMuZWxlbWVudCBdO1xuXG4gIHRoaXMuYmluZEhhbmRsZXMoKTtcbn07XG5cbi8qKlxuICogZW1pdHMgZXZlbnRzIHZpYSBFdkVtaXR0ZXIgYW5kIGpRdWVyeSBldmVudHNcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIC0gbmFtZSBvZiBldmVudFxuICogQHBhcmFtIHtFdmVudH0gZXZlbnQgLSBvcmlnaW5hbCBldmVudFxuICogQHBhcmFtIHtBcnJheX0gYXJncyAtIGV4dHJhIGFyZ3VtZW50c1xuICovXG5wcm90by5kaXNwYXRjaEV2ZW50ID0gZnVuY3Rpb24oIHR5cGUsIGV2ZW50LCBhcmdzICkge1xuICB2YXIgZW1pdEFyZ3MgPSBbIGV2ZW50IF0uY29uY2F0KCBhcmdzICk7XG4gIHRoaXMuZW1pdEV2ZW50KCB0eXBlLCBlbWl0QXJncyApO1xuICB2YXIgalF1ZXJ5ID0gd2luZG93LmpRdWVyeTtcbiAgLy8gdHJpZ2dlciBqUXVlcnkgZXZlbnRcbiAgaWYgKCBqUXVlcnkgJiYgdGhpcy4kZWxlbWVudCApIHtcbiAgICBpZiAoIGV2ZW50ICkge1xuICAgICAgLy8gY3JlYXRlIGpRdWVyeSBldmVudFxuICAgICAgdmFyICRldmVudCA9IGpRdWVyeS5FdmVudCggZXZlbnQgKTtcbiAgICAgICRldmVudC50eXBlID0gdHlwZTtcbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlciggJGV2ZW50LCBhcmdzICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGp1c3QgdHJpZ2dlciB3aXRoIHR5cGUgaWYgbm8gZXZlbnQgYXZhaWxhYmxlXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoIHR5cGUsIGFyZ3MgKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHBvc2l0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8vIGdldCB4L3kgcG9zaXRpb24gZnJvbSBzdHlsZVxucHJvdG8uX2dldFBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoIHRoaXMuZWxlbWVudCApO1xuICB2YXIgeCA9IHRoaXMuX2dldFBvc2l0aW9uQ29vcmQoIHN0eWxlLmxlZnQsICd3aWR0aCcgKTtcbiAgdmFyIHkgPSB0aGlzLl9nZXRQb3NpdGlvbkNvb3JkKCBzdHlsZS50b3AsICdoZWlnaHQnICk7XG4gIC8vIGNsZWFuIHVwICdhdXRvJyBvciBvdGhlciBub24taW50ZWdlciB2YWx1ZXNcbiAgdGhpcy5wb3NpdGlvbi54ID0gaXNOYU4oIHggKSA/IDAgOiB4O1xuICB0aGlzLnBvc2l0aW9uLnkgPSBpc05hTiggeSApID8gMCA6IHk7XG5cbiAgdGhpcy5fYWRkVHJhbnNmb3JtUG9zaXRpb24oIHN0eWxlICk7XG59O1xuXG5wcm90by5fZ2V0UG9zaXRpb25Db29yZCA9IGZ1bmN0aW9uKCBzdHlsZVNpZGUsIG1lYXN1cmUgKSB7XG4gIGlmICggc3R5bGVTaWRlLmluZGV4T2YoJyUnKSAhPSAtMSApIHtcbiAgICAvLyBjb252ZXJ0IHBlcmNlbnQgaW50byBwaXhlbCBmb3IgU2FmYXJpLCAjNzVcbiAgICB2YXIgcGFyZW50U2l6ZSA9IGdldFNpemUoIHRoaXMuZWxlbWVudC5wYXJlbnROb2RlICk7XG4gICAgLy8gcHJldmVudCBub3QtaW4tRE9NIGVsZW1lbnQgdGhyb3dpbmcgYnVnLCAjMTMxXG4gICAgcmV0dXJuICFwYXJlbnRTaXplID8gMCA6XG4gICAgICAoIHBhcnNlRmxvYXQoIHN0eWxlU2lkZSApIC8gMTAwICkgKiBwYXJlbnRTaXplWyBtZWFzdXJlIF07XG4gIH1cbiAgcmV0dXJuIHBhcnNlSW50KCBzdHlsZVNpZGUsIDEwICk7XG59O1xuXG4vLyBhZGQgdHJhbnNmb3JtOiB0cmFuc2xhdGUoIHgsIHkgKSB0byBwb3NpdGlvblxucHJvdG8uX2FkZFRyYW5zZm9ybVBvc2l0aW9uID0gZnVuY3Rpb24oIHN0eWxlICkge1xuICB2YXIgdHJhbnNmb3JtID0gc3R5bGVbIHRyYW5zZm9ybVByb3BlcnR5IF07XG4gIC8vIGJhaWwgb3V0IGlmIHZhbHVlIGlzICdub25lJ1xuICBpZiAoIHRyYW5zZm9ybS5pbmRleE9mKCdtYXRyaXgnKSAhPT0gMCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gc3BsaXQgbWF0cml4KDEsIDAsIDAsIDEsIHgsIHkpXG4gIHZhciBtYXRyaXhWYWx1ZXMgPSB0cmFuc2Zvcm0uc3BsaXQoJywnKTtcbiAgLy8gdHJhbnNsYXRlIFggdmFsdWUgaXMgaW4gMTJ0aCBvciA0dGggcG9zaXRpb25cbiAgdmFyIHhJbmRleCA9IHRyYW5zZm9ybS5pbmRleE9mKCdtYXRyaXgzZCcpID09PSAwID8gMTIgOiA0O1xuICB2YXIgdHJhbnNsYXRlWCA9IHBhcnNlSW50KCBtYXRyaXhWYWx1ZXNbIHhJbmRleCBdLCAxMCApO1xuICAvLyB0cmFuc2xhdGUgWSB2YWx1ZSBpcyBpbiAxM3RoIG9yIDV0aCBwb3NpdGlvblxuICB2YXIgdHJhbnNsYXRlWSA9IHBhcnNlSW50KCBtYXRyaXhWYWx1ZXNbIHhJbmRleCArIDEgXSwgMTAgKTtcbiAgdGhpcy5wb3NpdGlvbi54ICs9IHRyYW5zbGF0ZVg7XG4gIHRoaXMucG9zaXRpb24ueSArPSB0cmFuc2xhdGVZO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gZXZlbnRzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8qKlxuICogcG9pbnRlciBzdGFydFxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgb3IgVG91Y2h9IHBvaW50ZXJcbiAqL1xucHJvdG8ucG9pbnRlckRvd24gPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMuX2RyYWdQb2ludGVyRG93biggZXZlbnQsIHBvaW50ZXIgKTtcbiAgLy8ga2x1ZGdlIHRvIGJsdXIgZm9jdXNlZCBpbnB1dHMgaW4gZHJhZ2dlclxuICB2YXIgZm9jdXNlZCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gIC8vIGRvIG5vdCBibHVyIGJvZHkgZm9yIElFMTAsIG1ldGFmaXp6eS9mbGlja2l0eSMxMTdcbiAgaWYgKCBmb2N1c2VkICYmIGZvY3VzZWQuYmx1ciAmJiBmb2N1c2VkICE9IGRvY3VtZW50LmJvZHkgKSB7XG4gICAgZm9jdXNlZC5ibHVyKCk7XG4gIH1cbiAgLy8gYmluZCBtb3ZlIGFuZCBlbmQgZXZlbnRzXG4gIHRoaXMuX2JpbmRQb3N0U3RhcnRFdmVudHMoIGV2ZW50ICk7XG4gIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpcy1wb2ludGVyLWRvd24nKTtcbiAgdGhpcy5kaXNwYXRjaEV2ZW50KCAncG9pbnRlckRvd24nLCBldmVudCwgWyBwb2ludGVyIF0gKTtcbn07XG5cbi8qKlxuICogZHJhZyBtb3ZlXG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICogQHBhcmFtIHtFdmVudCBvciBUb3VjaH0gcG9pbnRlclxuICovXG5wcm90by5wb2ludGVyTW92ZSA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdmFyIG1vdmVWZWN0b3IgPSB0aGlzLl9kcmFnUG9pbnRlck1vdmUoIGV2ZW50LCBwb2ludGVyICk7XG4gIHRoaXMuZGlzcGF0Y2hFdmVudCggJ3BvaW50ZXJNb3ZlJywgZXZlbnQsIFsgcG9pbnRlciwgbW92ZVZlY3RvciBdICk7XG4gIHRoaXMuX2RyYWdNb3ZlKCBldmVudCwgcG9pbnRlciwgbW92ZVZlY3RvciApO1xufTtcblxuLyoqXG4gKiBkcmFnIHN0YXJ0XG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICogQHBhcmFtIHtFdmVudCBvciBUb3VjaH0gcG9pbnRlclxuICovXG5wcm90by5kcmFnU3RhcnQgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIGlmICggIXRoaXMuaXNFbmFibGVkICkge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLl9nZXRQb3NpdGlvbigpO1xuICB0aGlzLm1lYXN1cmVDb250YWlubWVudCgpO1xuICAvLyBwb3NpdGlvbiBfd2hlbl8gZHJhZyBiZWdhblxuICB0aGlzLnN0YXJ0UG9zaXRpb24ueCA9IHRoaXMucG9zaXRpb24ueDtcbiAgdGhpcy5zdGFydFBvc2l0aW9uLnkgPSB0aGlzLnBvc2l0aW9uLnk7XG4gIC8vIHJlc2V0IGxlZnQvdG9wIHN0eWxlXG4gIHRoaXMuc2V0TGVmdFRvcCgpO1xuXG4gIHRoaXMuZHJhZ1BvaW50LnggPSAwO1xuICB0aGlzLmRyYWdQb2ludC55ID0gMDtcblxuICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtZHJhZ2dpbmcnKTtcbiAgdGhpcy5kaXNwYXRjaEV2ZW50KCAnZHJhZ1N0YXJ0JywgZXZlbnQsIFsgcG9pbnRlciBdICk7XG4gIC8vIHN0YXJ0IGFuaW1hdGlvblxuICB0aGlzLmFuaW1hdGUoKTtcbn07XG5cbnByb3RvLm1lYXN1cmVDb250YWlubWVudCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgY29udGFpbm1lbnQgPSB0aGlzLm9wdGlvbnMuY29udGFpbm1lbnQ7XG4gIGlmICggIWNvbnRhaW5tZW50ICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIHVzZSBlbGVtZW50IGlmIGVsZW1lbnRcbiAgdmFyIGNvbnRhaW5lciA9IGlzRWxlbWVudCggY29udGFpbm1lbnQgKSA/IGNvbnRhaW5tZW50IDpcbiAgICAvLyBmYWxsYmFjayB0byBxdWVyeVNlbGVjdG9yIGlmIHN0cmluZ1xuICAgIHR5cGVvZiBjb250YWlubWVudCA9PSAnc3RyaW5nJyA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIGNvbnRhaW5tZW50ICkgOlxuICAgIC8vIG90aGVyd2lzZSBqdXN0IGB0cnVlYCwgdXNlIHRoZSBwYXJlbnRcbiAgICB0aGlzLmVsZW1lbnQucGFyZW50Tm9kZTtcblxuICB2YXIgZWxlbVNpemUgPSBnZXRTaXplKCB0aGlzLmVsZW1lbnQgKTtcbiAgdmFyIGNvbnRhaW5lclNpemUgPSBnZXRTaXplKCBjb250YWluZXIgKTtcbiAgdmFyIGVsZW1SZWN0ID0gdGhpcy5lbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB2YXIgY29udGFpbmVyUmVjdCA9IGNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICB2YXIgYm9yZGVyU2l6ZVggPSBjb250YWluZXJTaXplLmJvcmRlckxlZnRXaWR0aCArIGNvbnRhaW5lclNpemUuYm9yZGVyUmlnaHRXaWR0aDtcbiAgdmFyIGJvcmRlclNpemVZID0gY29udGFpbmVyU2l6ZS5ib3JkZXJUb3BXaWR0aCArIGNvbnRhaW5lclNpemUuYm9yZGVyQm90dG9tV2lkdGg7XG5cbiAgdmFyIHBvc2l0aW9uID0gdGhpcy5yZWxhdGl2ZVN0YXJ0UG9zaXRpb24gPSB7XG4gICAgeDogZWxlbVJlY3QubGVmdCAtICggY29udGFpbmVyUmVjdC5sZWZ0ICsgY29udGFpbmVyU2l6ZS5ib3JkZXJMZWZ0V2lkdGggKSxcbiAgICB5OiBlbGVtUmVjdC50b3AgLSAoIGNvbnRhaW5lclJlY3QudG9wICsgY29udGFpbmVyU2l6ZS5ib3JkZXJUb3BXaWR0aCApXG4gIH07XG5cbiAgdGhpcy5jb250YWluU2l6ZSA9IHtcbiAgICB3aWR0aDogKCBjb250YWluZXJTaXplLndpZHRoIC0gYm9yZGVyU2l6ZVggKSAtIHBvc2l0aW9uLnggLSBlbGVtU2l6ZS53aWR0aCxcbiAgICBoZWlnaHQ6ICggY29udGFpbmVyU2l6ZS5oZWlnaHQgLSBib3JkZXJTaXplWSApIC0gcG9zaXRpb24ueSAtIGVsZW1TaXplLmhlaWdodFxuICB9O1xufTtcblxuLy8gLS0tLS0gbW92ZSBldmVudCAtLS0tLSAvL1xuXG4vKipcbiAqIGRyYWcgbW92ZVxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgb3IgVG91Y2h9IHBvaW50ZXJcbiAqL1xucHJvdG8uZHJhZ01vdmUgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIsIG1vdmVWZWN0b3IgKSB7XG4gIGlmICggIXRoaXMuaXNFbmFibGVkICkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgZHJhZ1ggPSBtb3ZlVmVjdG9yLng7XG4gIHZhciBkcmFnWSA9IG1vdmVWZWN0b3IueTtcblxuICB2YXIgZ3JpZCA9IHRoaXMub3B0aW9ucy5ncmlkO1xuICB2YXIgZ3JpZFggPSBncmlkICYmIGdyaWRbMF07XG4gIHZhciBncmlkWSA9IGdyaWQgJiYgZ3JpZFsxXTtcblxuICBkcmFnWCA9IGFwcGx5R3JpZCggZHJhZ1gsIGdyaWRYICk7XG4gIGRyYWdZID0gYXBwbHlHcmlkKCBkcmFnWSwgZ3JpZFkgKTtcblxuICBkcmFnWCA9IHRoaXMuY29udGFpbkRyYWcoICd4JywgZHJhZ1gsIGdyaWRYICk7XG4gIGRyYWdZID0gdGhpcy5jb250YWluRHJhZyggJ3knLCBkcmFnWSwgZ3JpZFkgKTtcblxuICAvLyBjb25zdHJhaW4gdG8gYXhpc1xuICBkcmFnWCA9IHRoaXMub3B0aW9ucy5heGlzID09ICd5JyA/IDAgOiBkcmFnWDtcbiAgZHJhZ1kgPSB0aGlzLm9wdGlvbnMuYXhpcyA9PSAneCcgPyAwIDogZHJhZ1k7XG5cbiAgdGhpcy5wb3NpdGlvbi54ID0gdGhpcy5zdGFydFBvc2l0aW9uLnggKyBkcmFnWDtcbiAgdGhpcy5wb3NpdGlvbi55ID0gdGhpcy5zdGFydFBvc2l0aW9uLnkgKyBkcmFnWTtcbiAgLy8gc2V0IGRyYWdQb2ludCBwcm9wZXJ0aWVzXG4gIHRoaXMuZHJhZ1BvaW50LnggPSBkcmFnWDtcbiAgdGhpcy5kcmFnUG9pbnQueSA9IGRyYWdZO1xuXG4gIHRoaXMuZGlzcGF0Y2hFdmVudCggJ2RyYWdNb3ZlJywgZXZlbnQsIFsgcG9pbnRlciwgbW92ZVZlY3RvciBdICk7XG59O1xuXG5mdW5jdGlvbiBhcHBseUdyaWQoIHZhbHVlLCBncmlkLCBtZXRob2QgKSB7XG4gIG1ldGhvZCA9IG1ldGhvZCB8fCAncm91bmQnO1xuICByZXR1cm4gZ3JpZCA/IE1hdGhbIG1ldGhvZCBdKCB2YWx1ZSAvIGdyaWQgKSAqIGdyaWQgOiB2YWx1ZTtcbn1cblxucHJvdG8uY29udGFpbkRyYWcgPSBmdW5jdGlvbiggYXhpcywgZHJhZywgZ3JpZCApIHtcbiAgaWYgKCAhdGhpcy5vcHRpb25zLmNvbnRhaW5tZW50ICkge1xuICAgIHJldHVybiBkcmFnO1xuICB9XG4gIHZhciBtZWFzdXJlID0gYXhpcyA9PSAneCcgPyAnd2lkdGgnIDogJ2hlaWdodCc7XG5cbiAgdmFyIHJlbCA9IHRoaXMucmVsYXRpdmVTdGFydFBvc2l0aW9uWyBheGlzIF07XG4gIHZhciBtaW4gPSBhcHBseUdyaWQoIC1yZWwsIGdyaWQsICdjZWlsJyApO1xuICB2YXIgbWF4ID0gdGhpcy5jb250YWluU2l6ZVsgbWVhc3VyZSBdO1xuICBtYXggPSBhcHBseUdyaWQoIG1heCwgZ3JpZCwgJ2Zsb29yJyApO1xuICByZXR1cm4gIE1hdGgubWluKCBtYXgsIE1hdGgubWF4KCBtaW4sIGRyYWcgKSApO1xufTtcblxuLy8gLS0tLS0gZW5kIGV2ZW50IC0tLS0tIC8vXG5cbi8qKlxuICogcG9pbnRlciB1cFxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgb3IgVG91Y2h9IHBvaW50ZXJcbiAqL1xucHJvdG8ucG9pbnRlclVwID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcG9pbnRlci1kb3duJyk7XG4gIHRoaXMuZGlzcGF0Y2hFdmVudCggJ3BvaW50ZXJVcCcsIGV2ZW50LCBbIHBvaW50ZXIgXSApO1xuICB0aGlzLl9kcmFnUG9pbnRlclVwKCBldmVudCwgcG9pbnRlciApO1xufTtcblxuLyoqXG4gKiBkcmFnIGVuZFxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgb3IgVG91Y2h9IHBvaW50ZXJcbiAqL1xucHJvdG8uZHJhZ0VuZCA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgaWYgKCAhdGhpcy5pc0VuYWJsZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIHVzZSB0b3AgbGVmdCBwb3NpdGlvbiB3aGVuIGNvbXBsZXRlXG4gIGlmICggdHJhbnNmb3JtUHJvcGVydHkgKSB7XG4gICAgdGhpcy5lbGVtZW50LnN0eWxlWyB0cmFuc2Zvcm1Qcm9wZXJ0eSBdID0gJyc7XG4gICAgdGhpcy5zZXRMZWZ0VG9wKCk7XG4gIH1cbiAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWRyYWdnaW5nJyk7XG4gIHRoaXMuZGlzcGF0Y2hFdmVudCggJ2RyYWdFbmQnLCBldmVudCwgWyBwb2ludGVyIF0gKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGFuaW1hdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5wcm90by5hbmltYXRlID0gZnVuY3Rpb24oKSB7XG4gIC8vIG9ubHkgcmVuZGVyIGFuZCBhbmltYXRlIGlmIGRyYWdnaW5nXG4gIGlmICggIXRoaXMuaXNEcmFnZ2luZyApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLnBvc2l0aW9uRHJhZygpO1xuXG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSggZnVuY3Rpb24gYW5pbWF0ZUZyYW1lKCkge1xuICAgIF90aGlzLmFuaW1hdGUoKTtcbiAgfSk7XG5cbn07XG5cbi8vIGxlZnQvdG9wIHBvc2l0aW9uaW5nXG5wcm90by5zZXRMZWZ0VG9wID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gdGhpcy5wb3NpdGlvbi54ICsgJ3B4JztcbiAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCAgPSB0aGlzLnBvc2l0aW9uLnkgKyAncHgnO1xufTtcblxucHJvdG8ucG9zaXRpb25EcmFnID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZWxlbWVudC5zdHlsZVsgdHJhbnNmb3JtUHJvcGVydHkgXSA9ICd0cmFuc2xhdGUzZCggJyArIHRoaXMuZHJhZ1BvaW50LnggK1xuICAgICdweCwgJyArIHRoaXMuZHJhZ1BvaW50LnkgKyAncHgsIDApJztcbn07XG5cbi8vIC0tLS0tIHN0YXRpY0NsaWNrIC0tLS0tIC8vXG5cbnByb3RvLnN0YXRpY0NsaWNrID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdzdGF0aWNDbGljaycsIGV2ZW50LCBbIHBvaW50ZXIgXSApO1xufTtcblxuLy8gLS0tLS0gbWV0aG9kcyAtLS0tLSAvL1xuXG5wcm90by5lbmFibGUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pc0VuYWJsZWQgPSB0cnVlO1xufTtcblxucHJvdG8uZGlzYWJsZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmlzRW5hYmxlZCA9IGZhbHNlO1xuICBpZiAoIHRoaXMuaXNEcmFnZ2luZyApIHtcbiAgICB0aGlzLmRyYWdFbmQoKTtcbiAgfVxufTtcblxucHJvdG8uZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmRpc2FibGUoKTtcbiAgLy8gcmVzZXQgc3R5bGVzXG4gIHRoaXMuZWxlbWVudC5zdHlsZVsgdHJhbnNmb3JtUHJvcGVydHkgXSA9ICcnO1xuICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9ICcnO1xuICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gJyc7XG4gIHRoaXMuZWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICcnO1xuICAvLyB1bmJpbmQgaGFuZGxlc1xuICB0aGlzLnVuYmluZEhhbmRsZXMoKTtcbiAgLy8gcmVtb3ZlIGpRdWVyeSBkYXRhXG4gIGlmICggdGhpcy4kZWxlbWVudCApIHtcbiAgICB0aGlzLiRlbGVtZW50LnJlbW92ZURhdGEoJ2RyYWdnYWJpbGx5Jyk7XG4gIH1cbn07XG5cbi8vIC0tLS0tIGpRdWVyeSBicmlkZ2V0IC0tLS0tIC8vXG5cbi8vIHJlcXVpcmVkIGZvciBqUXVlcnkgYnJpZGdldFxucHJvdG8uX2luaXQgPSBub29wO1xuXG5pZiAoIGpRdWVyeSAmJiBqUXVlcnkuYnJpZGdldCApIHtcbiAgalF1ZXJ5LmJyaWRnZXQoICdkcmFnZ2FiaWxseScsIERyYWdnYWJpbGx5ICk7XG59XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG5yZXR1cm4gRHJhZ2dhYmlsbHk7XG5cbn0pKTtcbiIsIi8qKlxuICogRXZFbWl0dGVyIHYxLjAuM1xuICogTGlsJyBldmVudCBlbWl0dGVyXG4gKiBNSVQgTGljZW5zZVxuICovXG5cbi8qIGpzaGludCB1bnVzZWQ6IHRydWUsIHVuZGVmOiB0cnVlLCBzdHJpY3Q6IHRydWUgKi9cblxuKCBmdW5jdGlvbiggZ2xvYmFsLCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLyoganNoaW50IHN0cmljdDogZmFsc2UgKi8gLyogZ2xvYmFscyBkZWZpbmUsIG1vZHVsZSwgd2luZG93ICovXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EIC0gUmVxdWlyZUpTXG4gICAgZGVmaW5lKCBmYWN0b3J5ICk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlMgLSBCcm93c2VyaWZ5LCBXZWJwYWNrXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgZ2xvYmFsLkV2RW1pdHRlciA9IGZhY3RvcnkoKTtcbiAgfVxuXG59KCB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnID8gd2luZG93IDogdGhpcywgZnVuY3Rpb24oKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBFdkVtaXR0ZXIoKSB7fVxuXG52YXIgcHJvdG8gPSBFdkVtaXR0ZXIucHJvdG90eXBlO1xuXG5wcm90by5vbiA9IGZ1bmN0aW9uKCBldmVudE5hbWUsIGxpc3RlbmVyICkge1xuICBpZiAoICFldmVudE5hbWUgfHwgIWxpc3RlbmVyICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBzZXQgZXZlbnRzIGhhc2hcbiAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgLy8gc2V0IGxpc3RlbmVycyBhcnJheVxuICB2YXIgbGlzdGVuZXJzID0gZXZlbnRzWyBldmVudE5hbWUgXSA9IGV2ZW50c1sgZXZlbnROYW1lIF0gfHwgW107XG4gIC8vIG9ubHkgYWRkIG9uY2VcbiAgaWYgKCBsaXN0ZW5lcnMuaW5kZXhPZiggbGlzdGVuZXIgKSA9PSAtMSApIHtcbiAgICBsaXN0ZW5lcnMucHVzaCggbGlzdGVuZXIgKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxucHJvdG8ub25jZSA9IGZ1bmN0aW9uKCBldmVudE5hbWUsIGxpc3RlbmVyICkge1xuICBpZiAoICFldmVudE5hbWUgfHwgIWxpc3RlbmVyICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBhZGQgZXZlbnRcbiAgdGhpcy5vbiggZXZlbnROYW1lLCBsaXN0ZW5lciApO1xuICAvLyBzZXQgb25jZSBmbGFnXG4gIC8vIHNldCBvbmNlRXZlbnRzIGhhc2hcbiAgdmFyIG9uY2VFdmVudHMgPSB0aGlzLl9vbmNlRXZlbnRzID0gdGhpcy5fb25jZUV2ZW50cyB8fCB7fTtcbiAgLy8gc2V0IG9uY2VMaXN0ZW5lcnMgb2JqZWN0XG4gIHZhciBvbmNlTGlzdGVuZXJzID0gb25jZUV2ZW50c1sgZXZlbnROYW1lIF0gPSBvbmNlRXZlbnRzWyBldmVudE5hbWUgXSB8fCB7fTtcbiAgLy8gc2V0IGZsYWdcbiAgb25jZUxpc3RlbmVyc1sgbGlzdGVuZXIgXSA9IHRydWU7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5wcm90by5vZmYgPSBmdW5jdGlvbiggZXZlbnROYW1lLCBsaXN0ZW5lciApIHtcbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbIGV2ZW50TmFtZSBdO1xuICBpZiAoICFsaXN0ZW5lcnMgfHwgIWxpc3RlbmVycy5sZW5ndGggKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBpbmRleCA9IGxpc3RlbmVycy5pbmRleE9mKCBsaXN0ZW5lciApO1xuICBpZiAoIGluZGV4ICE9IC0xICkge1xuICAgIGxpc3RlbmVycy5zcGxpY2UoIGluZGV4LCAxICk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbnByb3RvLmVtaXRFdmVudCA9IGZ1bmN0aW9uKCBldmVudE5hbWUsIGFyZ3MgKSB7XG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHMgJiYgdGhpcy5fZXZlbnRzWyBldmVudE5hbWUgXTtcbiAgaWYgKCAhbGlzdGVuZXJzIHx8ICFsaXN0ZW5lcnMubGVuZ3RoICkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgaSA9IDA7XG4gIHZhciBsaXN0ZW5lciA9IGxpc3RlbmVyc1tpXTtcbiAgYXJncyA9IGFyZ3MgfHwgW107XG4gIC8vIG9uY2Ugc3R1ZmZcbiAgdmFyIG9uY2VMaXN0ZW5lcnMgPSB0aGlzLl9vbmNlRXZlbnRzICYmIHRoaXMuX29uY2VFdmVudHNbIGV2ZW50TmFtZSBdO1xuXG4gIHdoaWxlICggbGlzdGVuZXIgKSB7XG4gICAgdmFyIGlzT25jZSA9IG9uY2VMaXN0ZW5lcnMgJiYgb25jZUxpc3RlbmVyc1sgbGlzdGVuZXIgXTtcbiAgICBpZiAoIGlzT25jZSApIHtcbiAgICAgIC8vIHJlbW92ZSBsaXN0ZW5lclxuICAgICAgLy8gcmVtb3ZlIGJlZm9yZSB0cmlnZ2VyIHRvIHByZXZlbnQgcmVjdXJzaW9uXG4gICAgICB0aGlzLm9mZiggZXZlbnROYW1lLCBsaXN0ZW5lciApO1xuICAgICAgLy8gdW5zZXQgb25jZSBmbGFnXG4gICAgICBkZWxldGUgb25jZUxpc3RlbmVyc1sgbGlzdGVuZXIgXTtcbiAgICB9XG4gICAgLy8gdHJpZ2dlciBsaXN0ZW5lclxuICAgIGxpc3RlbmVyLmFwcGx5KCB0aGlzLCBhcmdzICk7XG4gICAgLy8gZ2V0IG5leHQgbGlzdGVuZXJcbiAgICBpICs9IGlzT25jZSA/IDAgOiAxO1xuICAgIGxpc3RlbmVyID0gbGlzdGVuZXJzW2ldO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5yZXR1cm4gRXZFbWl0dGVyO1xuXG59KSk7XG4iLCJcbi8qKlxuICogTW9kdWxlIGV4cG9ydHMuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBnZXREb2N1bWVudDtcblxuLy8gZGVmaW5lZCBieSB3M2NcbnZhciBET0NVTUVOVF9OT0RFID0gOTtcblxuLyoqXG4gKiBSZXR1cm5zIGB0cnVlYCBpZiBgd2AgaXMgYSBEb2N1bWVudCBvYmplY3QsIG9yIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICpcbiAqIEBwYXJhbSB7P30gZCAtIERvY3VtZW50IG9iamVjdCwgbWF5YmVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzRG9jdW1lbnQgKGQpIHtcbiAgcmV0dXJuIGQgJiYgZC5ub2RlVHlwZSA9PT0gRE9DVU1FTlRfTk9ERTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBgZG9jdW1lbnRgIG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIGBub2RlYCwgd2hpY2ggbWF5IGJlXG4gKiBhIERPTSBlbGVtZW50LCB0aGUgV2luZG93IG9iamVjdCwgYSBTZWxlY3Rpb24sIGEgUmFuZ2UuIEJhc2ljYWxseSBhbnkgRE9NXG4gKiBvYmplY3QgdGhhdCByZWZlcmVuY2VzIHRoZSBEb2N1bWVudCBpbiBzb21lIHdheSwgdGhpcyBmdW5jdGlvbiB3aWxsIGZpbmQgaXQuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gbm9kZSAtIERPTSBub2RlLCBzZWxlY3Rpb24sIG9yIHJhbmdlIGluIHdoaWNoIHRvIGZpbmQgdGhlIGBkb2N1bWVudGAgb2JqZWN0XG4gKiBAcmV0dXJuIHtEb2N1bWVudH0gdGhlIGBkb2N1bWVudGAgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCBgbm9kZWBcbiAqIEBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBnZXREb2N1bWVudChub2RlKSB7XG4gIGlmIChpc0RvY3VtZW50KG5vZGUpKSB7XG4gICAgcmV0dXJuIG5vZGU7XG5cbiAgfSBlbHNlIGlmIChpc0RvY3VtZW50KG5vZGUub3duZXJEb2N1bWVudCkpIHtcbiAgICByZXR1cm4gbm9kZS5vd25lckRvY3VtZW50O1xuXG4gIH0gZWxzZSBpZiAoaXNEb2N1bWVudChub2RlLmRvY3VtZW50KSkge1xuICAgIHJldHVybiBub2RlLmRvY3VtZW50O1xuXG4gIH0gZWxzZSBpZiAobm9kZS5wYXJlbnROb2RlKSB7XG4gICAgcmV0dXJuIGdldERvY3VtZW50KG5vZGUucGFyZW50Tm9kZSk7XG5cbiAgLy8gUmFuZ2Ugc3VwcG9ydFxuICB9IGVsc2UgaWYgKG5vZGUuY29tbW9uQW5jZXN0b3JDb250YWluZXIpIHtcbiAgICByZXR1cm4gZ2V0RG9jdW1lbnQobm9kZS5jb21tb25BbmNlc3RvckNvbnRhaW5lcik7XG5cbiAgfSBlbHNlIGlmIChub2RlLnN0YXJ0Q29udGFpbmVyKSB7XG4gICAgcmV0dXJuIGdldERvY3VtZW50KG5vZGUuc3RhcnRDb250YWluZXIpO1xuXG4gIC8vIFNlbGVjdGlvbiBzdXBwb3J0XG4gIH0gZWxzZSBpZiAobm9kZS5hbmNob3JOb2RlKSB7XG4gICAgcmV0dXJuIGdldERvY3VtZW50KG5vZGUuYW5jaG9yTm9kZSk7XG4gIH1cbn1cbiIsIi8qIVxuICogZ2V0U2l6ZSB2Mi4wLjJcbiAqIG1lYXN1cmUgc2l6ZSBvZiBlbGVtZW50c1xuICogTUlUIGxpY2Vuc2VcbiAqL1xuXG4vKmpzaGludCBicm93c2VyOiB0cnVlLCBzdHJpY3Q6IHRydWUsIHVuZGVmOiB0cnVlLCB1bnVzZWQ6IHRydWUgKi9cbi8qZ2xvYmFsIGRlZmluZTogZmFsc2UsIG1vZHVsZTogZmFsc2UsIGNvbnNvbGU6IGZhbHNlICovXG5cbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EXG4gICAgZGVmaW5lKCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBmYWN0b3J5KCk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHdpbmRvdy5nZXRTaXplID0gZmFjdG9yeSgpO1xuICB9XG5cbn0pKCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoKSB7XG4ndXNlIHN0cmljdCc7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGhlbHBlcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLy8gZ2V0IGEgbnVtYmVyIGZyb20gYSBzdHJpbmcsIG5vdCBhIHBlcmNlbnRhZ2VcbmZ1bmN0aW9uIGdldFN0eWxlU2l6ZSggdmFsdWUgKSB7XG4gIHZhciBudW0gPSBwYXJzZUZsb2F0KCB2YWx1ZSApO1xuICAvLyBub3QgYSBwZXJjZW50IGxpa2UgJzEwMCUnLCBhbmQgYSBudW1iZXJcbiAgdmFyIGlzVmFsaWQgPSB2YWx1ZS5pbmRleE9mKCclJykgPT0gLTEgJiYgIWlzTmFOKCBudW0gKTtcbiAgcmV0dXJuIGlzVmFsaWQgJiYgbnVtO1xufVxuXG5mdW5jdGlvbiBub29wKCkge31cblxudmFyIGxvZ0Vycm9yID0gdHlwZW9mIGNvbnNvbGUgPT0gJ3VuZGVmaW5lZCcgPyBub29wIDpcbiAgZnVuY3Rpb24oIG1lc3NhZ2UgKSB7XG4gICAgY29uc29sZS5lcnJvciggbWVzc2FnZSApO1xuICB9O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBtZWFzdXJlbWVudHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxudmFyIG1lYXN1cmVtZW50cyA9IFtcbiAgJ3BhZGRpbmdMZWZ0JyxcbiAgJ3BhZGRpbmdSaWdodCcsXG4gICdwYWRkaW5nVG9wJyxcbiAgJ3BhZGRpbmdCb3R0b20nLFxuICAnbWFyZ2luTGVmdCcsXG4gICdtYXJnaW5SaWdodCcsXG4gICdtYXJnaW5Ub3AnLFxuICAnbWFyZ2luQm90dG9tJyxcbiAgJ2JvcmRlckxlZnRXaWR0aCcsXG4gICdib3JkZXJSaWdodFdpZHRoJyxcbiAgJ2JvcmRlclRvcFdpZHRoJyxcbiAgJ2JvcmRlckJvdHRvbVdpZHRoJ1xuXTtcblxudmFyIG1lYXN1cmVtZW50c0xlbmd0aCA9IG1lYXN1cmVtZW50cy5sZW5ndGg7XG5cbmZ1bmN0aW9uIGdldFplcm9TaXplKCkge1xuICB2YXIgc2l6ZSA9IHtcbiAgICB3aWR0aDogMCxcbiAgICBoZWlnaHQ6IDAsXG4gICAgaW5uZXJXaWR0aDogMCxcbiAgICBpbm5lckhlaWdodDogMCxcbiAgICBvdXRlcldpZHRoOiAwLFxuICAgIG91dGVySGVpZ2h0OiAwXG4gIH07XG4gIGZvciAoIHZhciBpPTA7IGkgPCBtZWFzdXJlbWVudHNMZW5ndGg7IGkrKyApIHtcbiAgICB2YXIgbWVhc3VyZW1lbnQgPSBtZWFzdXJlbWVudHNbaV07XG4gICAgc2l6ZVsgbWVhc3VyZW1lbnQgXSA9IDA7XG4gIH1cbiAgcmV0dXJuIHNpemU7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGdldFN0eWxlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8qKlxuICogZ2V0U3R5bGUsIGdldCBzdHlsZSBvZiBlbGVtZW50LCBjaGVjayBmb3IgRmlyZWZveCBidWdcbiAqIGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTU0ODM5N1xuICovXG5mdW5jdGlvbiBnZXRTdHlsZSggZWxlbSApIHtcbiAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZSggZWxlbSApO1xuICBpZiAoICFzdHlsZSApIHtcbiAgICBsb2dFcnJvciggJ1N0eWxlIHJldHVybmVkICcgKyBzdHlsZSArXG4gICAgICAnLiBBcmUgeW91IHJ1bm5pbmcgdGhpcyBjb2RlIGluIGEgaGlkZGVuIGlmcmFtZSBvbiBGaXJlZm94PyAnICtcbiAgICAgICdTZWUgaHR0cDovL2JpdC5seS9nZXRzaXplYnVnMScgKTtcbiAgfVxuICByZXR1cm4gc3R5bGU7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHNldHVwIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnZhciBpc1NldHVwID0gZmFsc2U7XG5cbnZhciBpc0JveFNpemVPdXRlcjtcblxuLyoqXG4gKiBzZXR1cFxuICogY2hlY2sgaXNCb3hTaXplck91dGVyXG4gKiBkbyBvbiBmaXJzdCBnZXRTaXplKCkgcmF0aGVyIHRoYW4gb24gcGFnZSBsb2FkIGZvciBGaXJlZm94IGJ1Z1xuICovXG5mdW5jdGlvbiBzZXR1cCgpIHtcbiAgLy8gc2V0dXAgb25jZVxuICBpZiAoIGlzU2V0dXAgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlzU2V0dXAgPSB0cnVlO1xuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGJveCBzaXppbmcgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuICAvKipcbiAgICogV2ViS2l0IG1lYXN1cmVzIHRoZSBvdXRlci13aWR0aCBvbiBzdHlsZS53aWR0aCBvbiBib3JkZXItYm94IGVsZW1zXG4gICAqIElFICYgRmlyZWZveDwyOSBtZWFzdXJlcyB0aGUgaW5uZXItd2lkdGhcbiAgICovXG4gIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgZGl2LnN0eWxlLndpZHRoID0gJzIwMHB4JztcbiAgZGl2LnN0eWxlLnBhZGRpbmcgPSAnMXB4IDJweCAzcHggNHB4JztcbiAgZGl2LnN0eWxlLmJvcmRlclN0eWxlID0gJ3NvbGlkJztcbiAgZGl2LnN0eWxlLmJvcmRlcldpZHRoID0gJzFweCAycHggM3B4IDRweCc7XG4gIGRpdi5zdHlsZS5ib3hTaXppbmcgPSAnYm9yZGVyLWJveCc7XG5cbiAgdmFyIGJvZHkgPSBkb2N1bWVudC5ib2R5IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgYm9keS5hcHBlbmRDaGlsZCggZGl2ICk7XG4gIHZhciBzdHlsZSA9IGdldFN0eWxlKCBkaXYgKTtcblxuICBnZXRTaXplLmlzQm94U2l6ZU91dGVyID0gaXNCb3hTaXplT3V0ZXIgPSBnZXRTdHlsZVNpemUoIHN0eWxlLndpZHRoICkgPT0gMjAwO1xuICBib2R5LnJlbW92ZUNoaWxkKCBkaXYgKTtcblxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBnZXRTaXplIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbmZ1bmN0aW9uIGdldFNpemUoIGVsZW0gKSB7XG4gIHNldHVwKCk7XG5cbiAgLy8gdXNlIHF1ZXJ5U2VsZXRvciBpZiBlbGVtIGlzIHN0cmluZ1xuICBpZiAoIHR5cGVvZiBlbGVtID09ICdzdHJpbmcnICkge1xuICAgIGVsZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCBlbGVtICk7XG4gIH1cblxuICAvLyBkbyBub3QgcHJvY2VlZCBvbiBub24tb2JqZWN0c1xuICBpZiAoICFlbGVtIHx8IHR5cGVvZiBlbGVtICE9ICdvYmplY3QnIHx8ICFlbGVtLm5vZGVUeXBlICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBzdHlsZSA9IGdldFN0eWxlKCBlbGVtICk7XG5cbiAgLy8gaWYgaGlkZGVuLCBldmVyeXRoaW5nIGlzIDBcbiAgaWYgKCBzdHlsZS5kaXNwbGF5ID09ICdub25lJyApIHtcbiAgICByZXR1cm4gZ2V0WmVyb1NpemUoKTtcbiAgfVxuXG4gIHZhciBzaXplID0ge307XG4gIHNpemUud2lkdGggPSBlbGVtLm9mZnNldFdpZHRoO1xuICBzaXplLmhlaWdodCA9IGVsZW0ub2Zmc2V0SGVpZ2h0O1xuXG4gIHZhciBpc0JvcmRlckJveCA9IHNpemUuaXNCb3JkZXJCb3ggPSBzdHlsZS5ib3hTaXppbmcgPT0gJ2JvcmRlci1ib3gnO1xuXG4gIC8vIGdldCBhbGwgbWVhc3VyZW1lbnRzXG4gIGZvciAoIHZhciBpPTA7IGkgPCBtZWFzdXJlbWVudHNMZW5ndGg7IGkrKyApIHtcbiAgICB2YXIgbWVhc3VyZW1lbnQgPSBtZWFzdXJlbWVudHNbaV07XG4gICAgdmFyIHZhbHVlID0gc3R5bGVbIG1lYXN1cmVtZW50IF07XG4gICAgdmFyIG51bSA9IHBhcnNlRmxvYXQoIHZhbHVlICk7XG4gICAgLy8gYW55ICdhdXRvJywgJ21lZGl1bScgdmFsdWUgd2lsbCBiZSAwXG4gICAgc2l6ZVsgbWVhc3VyZW1lbnQgXSA9ICFpc05hTiggbnVtICkgPyBudW0gOiAwO1xuICB9XG5cbiAgdmFyIHBhZGRpbmdXaWR0aCA9IHNpemUucGFkZGluZ0xlZnQgKyBzaXplLnBhZGRpbmdSaWdodDtcbiAgdmFyIHBhZGRpbmdIZWlnaHQgPSBzaXplLnBhZGRpbmdUb3AgKyBzaXplLnBhZGRpbmdCb3R0b207XG4gIHZhciBtYXJnaW5XaWR0aCA9IHNpemUubWFyZ2luTGVmdCArIHNpemUubWFyZ2luUmlnaHQ7XG4gIHZhciBtYXJnaW5IZWlnaHQgPSBzaXplLm1hcmdpblRvcCArIHNpemUubWFyZ2luQm90dG9tO1xuICB2YXIgYm9yZGVyV2lkdGggPSBzaXplLmJvcmRlckxlZnRXaWR0aCArIHNpemUuYm9yZGVyUmlnaHRXaWR0aDtcbiAgdmFyIGJvcmRlckhlaWdodCA9IHNpemUuYm9yZGVyVG9wV2lkdGggKyBzaXplLmJvcmRlckJvdHRvbVdpZHRoO1xuXG4gIHZhciBpc0JvcmRlckJveFNpemVPdXRlciA9IGlzQm9yZGVyQm94ICYmIGlzQm94U2l6ZU91dGVyO1xuXG4gIC8vIG92ZXJ3cml0ZSB3aWR0aCBhbmQgaGVpZ2h0IGlmIHdlIGNhbiBnZXQgaXQgZnJvbSBzdHlsZVxuICB2YXIgc3R5bGVXaWR0aCA9IGdldFN0eWxlU2l6ZSggc3R5bGUud2lkdGggKTtcbiAgaWYgKCBzdHlsZVdpZHRoICE9PSBmYWxzZSApIHtcbiAgICBzaXplLndpZHRoID0gc3R5bGVXaWR0aCArXG4gICAgICAvLyBhZGQgcGFkZGluZyBhbmQgYm9yZGVyIHVubGVzcyBpdCdzIGFscmVhZHkgaW5jbHVkaW5nIGl0XG4gICAgICAoIGlzQm9yZGVyQm94U2l6ZU91dGVyID8gMCA6IHBhZGRpbmdXaWR0aCArIGJvcmRlcldpZHRoICk7XG4gIH1cblxuICB2YXIgc3R5bGVIZWlnaHQgPSBnZXRTdHlsZVNpemUoIHN0eWxlLmhlaWdodCApO1xuICBpZiAoIHN0eWxlSGVpZ2h0ICE9PSBmYWxzZSApIHtcbiAgICBzaXplLmhlaWdodCA9IHN0eWxlSGVpZ2h0ICtcbiAgICAgIC8vIGFkZCBwYWRkaW5nIGFuZCBib3JkZXIgdW5sZXNzIGl0J3MgYWxyZWFkeSBpbmNsdWRpbmcgaXRcbiAgICAgICggaXNCb3JkZXJCb3hTaXplT3V0ZXIgPyAwIDogcGFkZGluZ0hlaWdodCArIGJvcmRlckhlaWdodCApO1xuICB9XG5cbiAgc2l6ZS5pbm5lcldpZHRoID0gc2l6ZS53aWR0aCAtICggcGFkZGluZ1dpZHRoICsgYm9yZGVyV2lkdGggKTtcbiAgc2l6ZS5pbm5lckhlaWdodCA9IHNpemUuaGVpZ2h0IC0gKCBwYWRkaW5nSGVpZ2h0ICsgYm9yZGVySGVpZ2h0ICk7XG5cbiAgc2l6ZS5vdXRlcldpZHRoID0gc2l6ZS53aWR0aCArIG1hcmdpbldpZHRoO1xuICBzaXplLm91dGVySGVpZ2h0ID0gc2l6ZS5oZWlnaHQgKyBtYXJnaW5IZWlnaHQ7XG5cbiAgcmV0dXJuIHNpemU7XG59XG5cbnJldHVybiBnZXRTaXplO1xuXG59KTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIveHBhdGgnKVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgRE9NRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSwgbmFtZSkge1xuICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2VcbiAgICB0aGlzLm5hbWUgPSBuYW1lXG4gICAgdGhpcy5zdGFjayA9IChuZXcgRXJyb3IoKSkuc3RhY2tcbiAgfVxufVxuXG5ET01FeGNlcHRpb24ucHJvdG90eXBlID0gbmV3IEVycm9yKClcblxuRE9NRXhjZXB0aW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIGAke3RoaXMubmFtZX06ICR7dGhpcy5tZXNzYWdlfWBcbn1cbiIsImltcG9ydCBnZXREb2N1bWVudCBmcm9tICdnZXQtZG9jdW1lbnQnXG5cbmltcG9ydCBET01FeGNlcHRpb24gZnJvbSAnLi9kb20tZXhjZXB0aW9uJ1xuXG4vLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1hQYXRoUmVzdWx0XG5jb25zdCBGSVJTVF9PUkRFUkVEX05PREVfVFlQRSA9IDlcblxuLy8gRGVmYXVsdCBuYW1lc3BhY2UgZm9yIFhIVE1MIGRvY3VtZW50c1xuY29uc3QgSFRNTF9OQU1FU1BBQ0UgPSAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCdcblxuXG4vKipcbiAqIENvbXB1dGUgYW4gWFBhdGggZXhwcmVzc2lvbiBmb3IgdGhlIGdpdmVuIG5vZGUuXG4gKlxuICogSWYgdGhlIG9wdGlvbmFsIHBhcmFtZXRlciBgcm9vdGAgaXMgc3VwcGxpZWQsIHRoZSBjb21wdXRlZCBYUGF0aCBleHByZXNzaW9uXG4gKiB3aWxsIGJlIHJlbGF0aXZlIHRvIGl0LiBPdGhlcndpc2UsIHRoZSByb290IGVsZW1lbnQgaXMgdGhlIHJvb3Qgb2YgdGhlXG4gKiBkb2N1bWVudCB0byB3aGljaCBgbm9kZWAgYmVsb25ncy5cbiAqXG4gKiBAcGFyYW0ge05vZGV9IG5vZGUgVGhlIG5vZGUgZm9yIHdoaWNoIHRvIGNvbXB1dGUgYW4gWFBhdGggZXhwcmVzc2lvbi5cbiAqIEBwYXJhbSB7Tm9kZX0gW3Jvb3RdIFRoZSByb290IGNvbnRleHQgZm9yIHRoZSBYUGF0aCBleHByZXNzaW9uLlxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21Ob2RlKG5vZGUsIHJvb3QgPSBudWxsKSB7XG4gIGlmIChub2RlID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ21pc3NpbmcgcmVxdWlyZWQgcGFyYW1ldGVyIFwibm9kZVwiJylcbiAgfVxuXG4gIHJvb3QgPSByb290IHx8IGdldERvY3VtZW50KG5vZGUpXG5cbiAgbGV0IHBhdGggPSAnLydcbiAgd2hpbGUgKG5vZGUgIT09IHJvb3QpIHtcbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgIGxldCBtZXNzYWdlID0gJ1RoZSBzdXBwbGllZCBub2RlIGlzIG5vdCBjb250YWluZWQgYnkgdGhlIHJvb3Qgbm9kZS4nXG4gICAgICBsZXQgbmFtZSA9ICdJbnZhbGlkTm9kZVR5cGVFcnJvcidcbiAgICAgIHRocm93IG5ldyBET01FeGNlcHRpb24obWVzc2FnZSwgbmFtZSlcbiAgICB9XG4gICAgcGF0aCA9IGAvJHtub2RlTmFtZShub2RlKX1bJHtub2RlUG9zaXRpb24obm9kZSl9XSR7cGF0aH1gXG4gICAgbm9kZSA9IG5vZGUucGFyZW50Tm9kZVxuICB9XG4gIHJldHVybiBwYXRoLnJlcGxhY2UoL1xcLyQvLCAnJylcbn1cblxuXG4vKipcbiAqIEZpbmQgYSBub2RlIHVzaW5nIGFuIFhQYXRoIHJlbGF0aXZlIHRvIHRoZSBnaXZlbiByb290IG5vZGUuXG4gKlxuICogVGhlIFhQYXRoIGV4cHJlc3Npb25zIGFyZSBldmFsdWF0ZWQgcmVsYXRpdmUgdG8gdGhlIE5vZGUgYXJndW1lbnQgYHJvb3RgLlxuICpcbiAqIElmIHRoZSBvcHRpb25hbCBwYXJhbWV0ZXIgYHJlc29sdmVyYCBpcyBzdXBwbGllZCwgaXQgd2lsbCBiZSB1c2VkIHRvIHJlc29sdmVcbiAqIGFueSBuYW1lc3BhY2VzIHdpdGhpbiB0aGUgWFBhdGguXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhdGggQW4gWFBhdGggU3RyaW5nIHRvIGV2YWx1YXRlLlxuICogQHBhcmFtIHtOb2RlfSByb290IFRoZSByb290IGNvbnRleHQgZm9yIHRoZSBYUGF0aCBleHByZXNzaW9uLlxuICogQHJldHVybnMge05vZGV8bnVsbH0gVGhlIGZpcnN0IG1hdGNoaW5nIE5vZGUgb3IgbnVsbCBpZiBub25lIGlzIGZvdW5kLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9Ob2RlKHBhdGgsIHJvb3QsIHJlc29sdmVyID0gbnVsbCkge1xuICBpZiAocGF0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdtaXNzaW5nIHJlcXVpcmVkIHBhcmFtZXRlciBcInBhdGhcIicpXG4gIH1cbiAgaWYgKHJvb3QgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFcnJvcignbWlzc2luZyByZXF1aXJlZCBwYXJhbWV0ZXIgXCJyb290XCInKVxuICB9XG5cbiAgLy8gTWFrZSB0aGUgcGF0aCByZWxhdGl2ZSB0byB0aGUgcm9vdCwgaWYgbm90IHRoZSBkb2N1bWVudC5cbiAgbGV0IGRvY3VtZW50ID0gZ2V0RG9jdW1lbnQocm9vdClcbiAgaWYgKHJvb3QgIT09IGRvY3VtZW50KSBwYXRoID0gcGF0aC5yZXBsYWNlKC9eXFwvLywgJy4vJylcblxuICAvLyBNYWtlIGEgZGVmYXVsdCByZXNvbHZlci5cbiAgbGV0IGRvY3VtZW50RWxlbWVudCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudFxuICBpZiAocmVzb2x2ZXIgPT09IG51bGwgJiYgZG9jdW1lbnRFbGVtZW50Lmxvb2t1cE5hbWVzcGFjZVVSSSkge1xuICAgIGxldCBkZWZhdWx0TlMgPSBkb2N1bWVudEVsZW1lbnQubG9va3VwTmFtZXNwYWNlVVJJKG51bGwpIHx8IEhUTUxfTkFNRVNQQUNFXG4gICAgcmVzb2x2ZXIgPSAocHJlZml4KSA9PiB7XG4gICAgICBsZXQgbnMgPSB7J19kZWZhdWx0Xyc6IGRlZmF1bHROU31cbiAgICAgIHJldHVybiBuc1twcmVmaXhdIHx8IGRvY3VtZW50RWxlbWVudC5sb29rdXBOYW1lc3BhY2VVUkkocHJlZml4KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXNvbHZlKHBhdGgsIHJvb3QsIHJlc29sdmVyKVxufVxuXG5cbi8vIEdldCB0aGUgWFBhdGggbm9kZSBuYW1lLlxuZnVuY3Rpb24gbm9kZU5hbWUobm9kZSkge1xuICBzd2l0Y2ggKG5vZGUubm9kZU5hbWUpIHtcbiAgY2FzZSAnI3RleHQnOiByZXR1cm4gJ3RleHQoKSdcbiAgY2FzZSAnI2NvbW1lbnQnOiByZXR1cm4gJ2NvbW1lbnQoKSdcbiAgY2FzZSAnI2NkYXRhLXNlY3Rpb24nOiByZXR1cm4gJ2NkYXRhLXNlY3Rpb24oKSdcbiAgZGVmYXVsdDogcmV0dXJuIG5vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKVxuICB9XG59XG5cblxuLy8gR2V0IHRoZSBvcmRpbmFsIHBvc2l0aW9uIG9mIHRoaXMgbm9kZSBhbW9uZyBpdHMgc2libGluZ3Mgb2YgdGhlIHNhbWUgbmFtZS5cbmZ1bmN0aW9uIG5vZGVQb3NpdGlvbihub2RlKSB7XG4gIGxldCBuYW1lID0gbm9kZS5ub2RlTmFtZVxuICBsZXQgcG9zaXRpb24gPSAxXG4gIHdoaWxlICgobm9kZSA9IG5vZGUucHJldmlvdXNTaWJsaW5nKSkge1xuICAgIGlmIChub2RlLm5vZGVOYW1lID09PSBuYW1lKSBwb3NpdGlvbiArPSAxXG4gIH1cbiAgcmV0dXJuIHBvc2l0aW9uXG59XG5cblxuLy8gRmluZCBhIHNpbmdsZSBub2RlIHdpdGggWFBhdGggYHBhdGhgXG5mdW5jdGlvbiByZXNvbHZlKHBhdGgsIHJvb3QsIHJlc29sdmVyKSB7XG4gIHRyeSB7XG4gICAgLy8gQWRkIGEgZGVmYXVsdCB2YWx1ZSB0byBlYWNoIHBhdGggcGFydCBsYWNraW5nIGEgcHJlZml4LlxuICAgIGxldCBuc3BhdGggPSBwYXRoLnJlcGxhY2UoL1xcLyg/IVxcLikoW15cXC86XFwoXSspKD89XFwvfCQpL2csICcvX2RlZmF1bHRfOiQxJylcbiAgICByZXR1cm4gcGxhdGZvcm1SZXNvbHZlKG5zcGF0aCwgcm9vdCwgcmVzb2x2ZXIpXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBmYWxsYmFja1Jlc29sdmUocGF0aCwgcm9vdClcbiAgfVxufVxuXG5cbi8vIEZpbmQgYSBzaW5nbGUgbm9kZSB3aXRoIFhQYXRoIGBwYXRoYCB1c2luZyB0aGUgc2ltcGxlLCBidWlsdC1pbiBldmFsdWF0b3IuXG5mdW5jdGlvbiBmYWxsYmFja1Jlc29sdmUocGF0aCwgcm9vdCkge1xuICBsZXQgc3RlcHMgPSBwYXRoLnNwbGl0KFwiL1wiKVxuICBsZXQgbm9kZSA9IHJvb3RcbiAgd2hpbGUgKG5vZGUpIHtcbiAgICBsZXQgc3RlcCA9IHN0ZXBzLnNoaWZ0KClcbiAgICBpZiAoc3RlcCA9PT0gdW5kZWZpbmVkKSBicmVha1xuICAgIGlmIChzdGVwID09PSAnLicpIGNvbnRpbnVlXG4gICAgbGV0IFtuYW1lLCBwb3NpdGlvbl0gPSBzdGVwLnNwbGl0KC9bXFxbXFxdXS8pXG4gICAgbmFtZSA9IG5hbWUucmVwbGFjZSgnX2RlZmF1bHRfOicsICcnKVxuICAgIHBvc2l0aW9uID0gcG9zaXRpb24gPyBwYXJzZUludChwb3NpdGlvbikgOiAxXG4gICAgbm9kZSA9IGZpbmRDaGlsZChub2RlLCBuYW1lLCBwb3NpdGlvbilcbiAgfVxuICByZXR1cm4gbm9kZVxufVxuXG5cbi8vIEZpbmQgYSBzaW5nbGUgbm9kZSB3aXRoIFhQYXRoIGBwYXRoYCB1c2luZyBgZG9jdW1lbnQuZXZhbHVhdGVgLlxuZnVuY3Rpb24gcGxhdGZvcm1SZXNvbHZlKHBhdGgsIHJvb3QsIHJlc29sdmVyKSB7XG4gIGxldCBkb2N1bWVudCA9IGdldERvY3VtZW50KHJvb3QpXG4gIGxldCByID0gZG9jdW1lbnQuZXZhbHVhdGUocGF0aCwgcm9vdCwgcmVzb2x2ZXIsIEZJUlNUX09SREVSRURfTk9ERV9UWVBFLCBudWxsKVxuICByZXR1cm4gci5zaW5nbGVOb2RlVmFsdWVcbn1cblxuXG4vLyBGaW5kIHRoZSBjaGlsZCBvZiB0aGUgZ2l2ZW4gbm9kZSBieSBuYW1lIGFuZCBvcmRpbmFsIHBvc2l0aW9uLlxuZnVuY3Rpb24gZmluZENoaWxkKG5vZGUsIG5hbWUsIHBvc2l0aW9uKSB7XG4gIGZvciAobm9kZSA9IG5vZGUuZmlyc3RDaGlsZCA7IG5vZGUgOyBub2RlID0gbm9kZS5uZXh0U2libGluZykge1xuICAgIGlmIChub2RlTmFtZShub2RlKSA9PT0gbmFtZSAmJiAtLXBvc2l0aW9uID09PSAwKSBicmVha1xuICB9XG4gIHJldHVybiBub2RlXG59XG4iLCIvKiFcbiAqIFVuaWRyYWdnZXIgdjIuMS4wXG4gKiBEcmFnZ2FibGUgYmFzZSBjbGFzc1xuICogTUlUIGxpY2Vuc2VcbiAqL1xuXG4vKmpzaGludCBicm93c2VyOiB0cnVlLCB1bnVzZWQ6IHRydWUsIHVuZGVmOiB0cnVlLCBzdHJpY3Q6IHRydWUgKi9cblxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLypqc2hpbnQgc3RyaWN0OiBmYWxzZSAqLyAvKmdsb2JhbHMgZGVmaW5lLCBtb2R1bGUsIHJlcXVpcmUgKi9cblxuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggW1xuICAgICAgJ3VuaXBvaW50ZXIvdW5pcG9pbnRlcidcbiAgICBdLCBmdW5jdGlvbiggVW5pcG9pbnRlciApIHtcbiAgICAgIHJldHVybiBmYWN0b3J5KCB3aW5kb3csIFVuaXBvaW50ZXIgKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHJlcXVpcmUoJ3VuaXBvaW50ZXInKVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICB3aW5kb3cuVW5pZHJhZ2dlciA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICB3aW5kb3cuVW5pcG9pbnRlclxuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIFVuaXBvaW50ZXIgKSB7XG5cbid1c2Ugc3RyaWN0JztcblxuLy8gLS0tLS0gIC0tLS0tIC8vXG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBVbmlkcmFnZ2VyIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbmZ1bmN0aW9uIFVuaWRyYWdnZXIoKSB7fVxuXG4vLyBpbmhlcml0IFVuaXBvaW50ZXIgJiBFdkVtaXR0ZXJcbnZhciBwcm90byA9IFVuaWRyYWdnZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVW5pcG9pbnRlci5wcm90b3R5cGUgKTtcblxuLy8gLS0tLS0gYmluZCBzdGFydCAtLS0tLSAvL1xuXG5wcm90by5iaW5kSGFuZGxlcyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9iaW5kSGFuZGxlcyggdHJ1ZSApO1xufTtcblxucHJvdG8udW5iaW5kSGFuZGxlcyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9iaW5kSGFuZGxlcyggZmFsc2UgKTtcbn07XG5cbnZhciBuYXZpZ2F0b3IgPSB3aW5kb3cubmF2aWdhdG9yO1xuLyoqXG4gKiB3b3JrcyBhcyB1bmJpbmRlciwgYXMgeW91IGNhbiAuYmluZEhhbmRsZXMoIGZhbHNlICkgdG8gdW5iaW5kXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlzQmluZCAtIHdpbGwgdW5iaW5kIGlmIGZhbHNleVxuICovXG5wcm90by5fYmluZEhhbmRsZXMgPSBmdW5jdGlvbiggaXNCaW5kICkge1xuICAvLyBtdW5nZSBpc0JpbmQsIGRlZmF1bHQgdG8gdHJ1ZVxuICBpc0JpbmQgPSBpc0JpbmQgPT09IHVuZGVmaW5lZCA/IHRydWUgOiAhIWlzQmluZDtcbiAgLy8gZXh0cmEgYmluZCBsb2dpY1xuICB2YXIgYmluZGVyRXh0cmE7XG4gIGlmICggbmF2aWdhdG9yLnBvaW50ZXJFbmFibGVkICkge1xuICAgIGJpbmRlckV4dHJhID0gZnVuY3Rpb24oIGhhbmRsZSApIHtcbiAgICAgIC8vIGRpc2FibGUgc2Nyb2xsaW5nIG9uIHRoZSBlbGVtZW50XG4gICAgICBoYW5kbGUuc3R5bGUudG91Y2hBY3Rpb24gPSBpc0JpbmQgPyAnbm9uZScgOiAnJztcbiAgICB9O1xuICB9IGVsc2UgaWYgKCBuYXZpZ2F0b3IubXNQb2ludGVyRW5hYmxlZCApIHtcbiAgICBiaW5kZXJFeHRyYSA9IGZ1bmN0aW9uKCBoYW5kbGUgKSB7XG4gICAgICAvLyBkaXNhYmxlIHNjcm9sbGluZyBvbiB0aGUgZWxlbWVudFxuICAgICAgaGFuZGxlLnN0eWxlLm1zVG91Y2hBY3Rpb24gPSBpc0JpbmQgPyAnbm9uZScgOiAnJztcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIGJpbmRlckV4dHJhID0gbm9vcDtcbiAgfVxuICAvLyBiaW5kIGVhY2ggaGFuZGxlXG4gIHZhciBiaW5kTWV0aG9kID0gaXNCaW5kID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuICBmb3IgKCB2YXIgaT0wOyBpIDwgdGhpcy5oYW5kbGVzLmxlbmd0aDsgaSsrICkge1xuICAgIHZhciBoYW5kbGUgPSB0aGlzLmhhbmRsZXNbaV07XG4gICAgdGhpcy5fYmluZFN0YXJ0RXZlbnQoIGhhbmRsZSwgaXNCaW5kICk7XG4gICAgYmluZGVyRXh0cmEoIGhhbmRsZSApO1xuICAgIGhhbmRsZVsgYmluZE1ldGhvZCBdKCAnY2xpY2snLCB0aGlzICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tIHN0YXJ0IGV2ZW50IC0tLS0tIC8vXG5cbi8qKlxuICogcG9pbnRlciBzdGFydFxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgb3IgVG91Y2h9IHBvaW50ZXJcbiAqL1xucHJvdG8ucG9pbnRlckRvd24gPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIC8vIGRpc21pc3MgcmFuZ2Ugc2xpZGVyc1xuICBpZiAoIGV2ZW50LnRhcmdldC5ub2RlTmFtZSA9PSAnSU5QVVQnICYmIGV2ZW50LnRhcmdldC50eXBlID09ICdyYW5nZScgKSB7XG4gICAgLy8gcmVzZXQgcG9pbnRlckRvd24gbG9naWNcbiAgICB0aGlzLmlzUG9pbnRlckRvd24gPSBmYWxzZTtcbiAgICBkZWxldGUgdGhpcy5wb2ludGVySWRlbnRpZmllcjtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLl9kcmFnUG9pbnRlckRvd24oIGV2ZW50LCBwb2ludGVyICk7XG4gIC8vIGtsdWRnZSB0byBibHVyIGZvY3VzZWQgaW5wdXRzIGluIGRyYWdnZXJcbiAgdmFyIGZvY3VzZWQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICBpZiAoIGZvY3VzZWQgJiYgZm9jdXNlZC5ibHVyICkge1xuICAgIGZvY3VzZWQuYmx1cigpO1xuICB9XG4gIC8vIGJpbmQgbW92ZSBhbmQgZW5kIGV2ZW50c1xuICB0aGlzLl9iaW5kUG9zdFN0YXJ0RXZlbnRzKCBldmVudCApO1xuICB0aGlzLmVtaXRFdmVudCggJ3BvaW50ZXJEb3duJywgWyBldmVudCwgcG9pbnRlciBdICk7XG59O1xuXG4vLyBiYXNlIHBvaW50ZXIgZG93biBsb2dpY1xucHJvdG8uX2RyYWdQb2ludGVyRG93biA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgLy8gdHJhY2sgdG8gc2VlIHdoZW4gZHJhZ2dpbmcgc3RhcnRzXG4gIHRoaXMucG9pbnRlckRvd25Qb2ludCA9IFVuaXBvaW50ZXIuZ2V0UG9pbnRlclBvaW50KCBwb2ludGVyICk7XG5cbiAgdmFyIGNhblByZXZlbnREZWZhdWx0ID0gdGhpcy5jYW5QcmV2ZW50RGVmYXVsdE9uUG9pbnRlckRvd24oIGV2ZW50LCBwb2ludGVyICk7XG4gIGlmICggY2FuUHJldmVudERlZmF1bHQgKSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgfVxufTtcblxuLy8gb3ZlcndyaXRlYWJsZSBtZXRob2Qgc28gRmxpY2tpdHkgY2FuIHByZXZlbnQgZm9yIHNjcm9sbGluZ1xucHJvdG8uY2FuUHJldmVudERlZmF1bHRPblBvaW50ZXJEb3duID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICAvLyBwcmV2ZW50IGRlZmF1bHQsIHVubGVzcyB0b3VjaHN0YXJ0IG9yIDxzZWxlY3Q+XG4gIHJldHVybiBldmVudC50YXJnZXQubm9kZU5hbWUgIT0gJ1NFTEVDVCc7XG59O1xuXG4vLyAtLS0tLSBtb3ZlIGV2ZW50IC0tLS0tIC8vXG5cbi8qKlxuICogZHJhZyBtb3ZlXG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICogQHBhcmFtIHtFdmVudCBvciBUb3VjaH0gcG9pbnRlclxuICovXG5wcm90by5wb2ludGVyTW92ZSA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdmFyIG1vdmVWZWN0b3IgPSB0aGlzLl9kcmFnUG9pbnRlck1vdmUoIGV2ZW50LCBwb2ludGVyICk7XG4gIHRoaXMuZW1pdEV2ZW50KCAncG9pbnRlck1vdmUnLCBbIGV2ZW50LCBwb2ludGVyLCBtb3ZlVmVjdG9yIF0gKTtcbiAgdGhpcy5fZHJhZ01vdmUoIGV2ZW50LCBwb2ludGVyLCBtb3ZlVmVjdG9yICk7XG59O1xuXG4vLyBiYXNlIHBvaW50ZXIgbW92ZSBsb2dpY1xucHJvdG8uX2RyYWdQb2ludGVyTW92ZSA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdmFyIG1vdmVQb2ludCA9IFVuaXBvaW50ZXIuZ2V0UG9pbnRlclBvaW50KCBwb2ludGVyICk7XG4gIHZhciBtb3ZlVmVjdG9yID0ge1xuICAgIHg6IG1vdmVQb2ludC54IC0gdGhpcy5wb2ludGVyRG93blBvaW50LngsXG4gICAgeTogbW92ZVBvaW50LnkgLSB0aGlzLnBvaW50ZXJEb3duUG9pbnQueVxuICB9O1xuICAvLyBzdGFydCBkcmFnIGlmIHBvaW50ZXIgaGFzIG1vdmVkIGZhciBlbm91Z2ggdG8gc3RhcnQgZHJhZ1xuICBpZiAoICF0aGlzLmlzRHJhZ2dpbmcgJiYgdGhpcy5oYXNEcmFnU3RhcnRlZCggbW92ZVZlY3RvciApICkge1xuICAgIHRoaXMuX2RyYWdTdGFydCggZXZlbnQsIHBvaW50ZXIgKTtcbiAgfVxuICByZXR1cm4gbW92ZVZlY3Rvcjtcbn07XG5cbi8vIGNvbmRpdGlvbiBpZiBwb2ludGVyIGhhcyBtb3ZlZCBmYXIgZW5vdWdoIHRvIHN0YXJ0IGRyYWdcbnByb3RvLmhhc0RyYWdTdGFydGVkID0gZnVuY3Rpb24oIG1vdmVWZWN0b3IgKSB7XG4gIHJldHVybiBNYXRoLmFicyggbW92ZVZlY3Rvci54ICkgPiAzIHx8IE1hdGguYWJzKCBtb3ZlVmVjdG9yLnkgKSA+IDM7XG59O1xuXG5cbi8vIC0tLS0tIGVuZCBldmVudCAtLS0tLSAvL1xuXG4vKipcbiAqIHBvaW50ZXIgdXBcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50IG9yIFRvdWNofSBwb2ludGVyXG4gKi9cbnByb3RvLnBvaW50ZXJVcCA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5lbWl0RXZlbnQoICdwb2ludGVyVXAnLCBbIGV2ZW50LCBwb2ludGVyIF0gKTtcbiAgdGhpcy5fZHJhZ1BvaW50ZXJVcCggZXZlbnQsIHBvaW50ZXIgKTtcbn07XG5cbnByb3RvLl9kcmFnUG9pbnRlclVwID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICBpZiAoIHRoaXMuaXNEcmFnZ2luZyApIHtcbiAgICB0aGlzLl9kcmFnRW5kKCBldmVudCwgcG9pbnRlciApO1xuICB9IGVsc2Uge1xuICAgIC8vIHBvaW50ZXIgZGlkbid0IG1vdmUgZW5vdWdoIGZvciBkcmFnIHRvIHN0YXJ0XG4gICAgdGhpcy5fc3RhdGljQ2xpY2soIGV2ZW50LCBwb2ludGVyICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGRyYWcgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLy8gZHJhZ1N0YXJ0XG5wcm90by5fZHJhZ1N0YXJ0ID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLmlzRHJhZ2dpbmcgPSB0cnVlO1xuICB0aGlzLmRyYWdTdGFydFBvaW50ID0gVW5pcG9pbnRlci5nZXRQb2ludGVyUG9pbnQoIHBvaW50ZXIgKTtcbiAgLy8gcHJldmVudCBjbGlja3NcbiAgdGhpcy5pc1ByZXZlbnRpbmdDbGlja3MgPSB0cnVlO1xuXG4gIHRoaXMuZHJhZ1N0YXJ0KCBldmVudCwgcG9pbnRlciApO1xufTtcblxucHJvdG8uZHJhZ1N0YXJ0ID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLmVtaXRFdmVudCggJ2RyYWdTdGFydCcsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xufTtcblxuLy8gZHJhZ01vdmVcbnByb3RvLl9kcmFnTW92ZSA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciwgbW92ZVZlY3RvciApIHtcbiAgLy8gZG8gbm90IGRyYWcgaWYgbm90IGRyYWdnaW5nIHlldFxuICBpZiAoICF0aGlzLmlzRHJhZ2dpbmcgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5kcmFnTW92ZSggZXZlbnQsIHBvaW50ZXIsIG1vdmVWZWN0b3IgKTtcbn07XG5cbnByb3RvLmRyYWdNb3ZlID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyLCBtb3ZlVmVjdG9yICkge1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB0aGlzLmVtaXRFdmVudCggJ2RyYWdNb3ZlJywgWyBldmVudCwgcG9pbnRlciwgbW92ZVZlY3RvciBdICk7XG59O1xuXG4vLyBkcmFnRW5kXG5wcm90by5fZHJhZ0VuZCA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgLy8gc2V0IGZsYWdzXG4gIHRoaXMuaXNEcmFnZ2luZyA9IGZhbHNlO1xuICAvLyByZS1lbmFibGUgY2xpY2tpbmcgYXN5bmNcbiAgc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG4gICAgZGVsZXRlIHRoaXMuaXNQcmV2ZW50aW5nQ2xpY2tzO1xuICB9LmJpbmQoIHRoaXMgKSApO1xuXG4gIHRoaXMuZHJhZ0VuZCggZXZlbnQsIHBvaW50ZXIgKTtcbn07XG5cbnByb3RvLmRyYWdFbmQgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMuZW1pdEV2ZW50KCAnZHJhZ0VuZCcsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xufTtcblxuLy8gLS0tLS0gb25jbGljayAtLS0tLSAvL1xuXG4vLyBoYW5kbGUgYWxsIGNsaWNrcyBhbmQgcHJldmVudCBjbGlja3Mgd2hlbiBkcmFnZ2luZ1xucHJvdG8ub25jbGljayA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgaWYgKCB0aGlzLmlzUHJldmVudGluZ0NsaWNrcyApIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB9XG59O1xuXG4vLyAtLS0tLSBzdGF0aWNDbGljayAtLS0tLSAvL1xuXG4vLyB0cmlnZ2VyZWQgYWZ0ZXIgcG9pbnRlciBkb3duICYgdXAgd2l0aCBuby90aW55IG1vdmVtZW50XG5wcm90by5fc3RhdGljQ2xpY2sgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIC8vIGlnbm9yZSBlbXVsYXRlZCBtb3VzZSB1cCBjbGlja3NcbiAgaWYgKCB0aGlzLmlzSWdub3JpbmdNb3VzZVVwICYmIGV2ZW50LnR5cGUgPT0gJ21vdXNldXAnICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIGFsbG93IGNsaWNrIGluIDxpbnB1dD5zIGFuZCA8dGV4dGFyZWE+c1xuICB2YXIgbm9kZU5hbWUgPSBldmVudC50YXJnZXQubm9kZU5hbWU7XG4gIGlmICggbm9kZU5hbWUgPT0gJ0lOUFVUJyB8fCBub2RlTmFtZSA9PSAnVEVYVEFSRUEnICkge1xuICAgIGV2ZW50LnRhcmdldC5mb2N1cygpO1xuICB9XG4gIHRoaXMuc3RhdGljQ2xpY2soIGV2ZW50LCBwb2ludGVyICk7XG5cbiAgLy8gc2V0IGZsYWcgZm9yIGVtdWxhdGVkIGNsaWNrcyAzMDBtcyBhZnRlciB0b3VjaGVuZFxuICBpZiAoIGV2ZW50LnR5cGUgIT0gJ21vdXNldXAnICkge1xuICAgIHRoaXMuaXNJZ25vcmluZ01vdXNlVXAgPSB0cnVlO1xuICAgIC8vIHJlc2V0IGZsYWcgYWZ0ZXIgMzAwbXNcbiAgICBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLmlzSWdub3JpbmdNb3VzZVVwO1xuICAgIH0uYmluZCggdGhpcyApLCA0MDAgKTtcbiAgfVxufTtcblxucHJvdG8uc3RhdGljQ2xpY2sgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMuZW1pdEV2ZW50KCAnc3RhdGljQ2xpY2snLCBbIGV2ZW50LCBwb2ludGVyIF0gKTtcbn07XG5cbi8vIC0tLS0tIHV0aWxzIC0tLS0tIC8vXG5cblVuaWRyYWdnZXIuZ2V0UG9pbnRlclBvaW50ID0gVW5pcG9pbnRlci5nZXRQb2ludGVyUG9pbnQ7XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG5yZXR1cm4gVW5pZHJhZ2dlcjtcblxufSkpO1xuIiwiLyohXG4gKiBVbmlwb2ludGVyIHYyLjEuMFxuICogYmFzZSBjbGFzcyBmb3IgZG9pbmcgb25lIHRoaW5nIHdpdGggcG9pbnRlciBldmVudFxuICogTUlUIGxpY2Vuc2VcbiAqL1xuXG4vKmpzaGludCBicm93c2VyOiB0cnVlLCB1bmRlZjogdHJ1ZSwgdW51c2VkOiB0cnVlLCBzdHJpY3Q6IHRydWUgKi9cblxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLyoganNoaW50IHN0cmljdDogZmFsc2UgKi8gLypnbG9iYWwgZGVmaW5lLCBtb2R1bGUsIHJlcXVpcmUgKi9cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIFtcbiAgICAgICdldi1lbWl0dGVyL2V2LWVtaXR0ZXInXG4gICAgXSwgZnVuY3Rpb24oIEV2RW1pdHRlciApIHtcbiAgICAgIHJldHVybiBmYWN0b3J5KCB3aW5kb3csIEV2RW1pdHRlciApO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgcmVxdWlyZSgnZXYtZW1pdHRlcicpXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHdpbmRvdy5Vbmlwb2ludGVyID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHdpbmRvdy5FdkVtaXR0ZXJcbiAgICApO1xuICB9XG5cbn0oIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSggd2luZG93LCBFdkVtaXR0ZXIgKSB7XG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbmZ1bmN0aW9uIFVuaXBvaW50ZXIoKSB7fVxuXG4vLyBpbmhlcml0IEV2RW1pdHRlclxudmFyIHByb3RvID0gVW5pcG9pbnRlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFdkVtaXR0ZXIucHJvdG90eXBlICk7XG5cbnByb3RvLmJpbmRTdGFydEV2ZW50ID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIHRoaXMuX2JpbmRTdGFydEV2ZW50KCBlbGVtLCB0cnVlICk7XG59O1xuXG5wcm90by51bmJpbmRTdGFydEV2ZW50ID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIHRoaXMuX2JpbmRTdGFydEV2ZW50KCBlbGVtLCBmYWxzZSApO1xufTtcblxuLyoqXG4gKiB3b3JrcyBhcyB1bmJpbmRlciwgYXMgeW91IGNhbiAuX2JpbmRTdGFydCggZmFsc2UgKSB0byB1bmJpbmRcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNCaW5kIC0gd2lsbCB1bmJpbmQgaWYgZmFsc2V5XG4gKi9cbnByb3RvLl9iaW5kU3RhcnRFdmVudCA9IGZ1bmN0aW9uKCBlbGVtLCBpc0JpbmQgKSB7XG4gIC8vIG11bmdlIGlzQmluZCwgZGVmYXVsdCB0byB0cnVlXG4gIGlzQmluZCA9IGlzQmluZCA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6ICEhaXNCaW5kO1xuICB2YXIgYmluZE1ldGhvZCA9IGlzQmluZCA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcblxuICBpZiAoIHdpbmRvdy5uYXZpZ2F0b3IucG9pbnRlckVuYWJsZWQgKSB7XG4gICAgLy8gVzNDIFBvaW50ZXIgRXZlbnRzLCBJRTExLiBTZWUgaHR0cHM6Ly9jb2RlcndhbGwuY29tL3AvbWZyZWNhXG4gICAgZWxlbVsgYmluZE1ldGhvZCBdKCAncG9pbnRlcmRvd24nLCB0aGlzICk7XG4gIH0gZWxzZSBpZiAoIHdpbmRvdy5uYXZpZ2F0b3IubXNQb2ludGVyRW5hYmxlZCApIHtcbiAgICAvLyBJRTEwIFBvaW50ZXIgRXZlbnRzXG4gICAgZWxlbVsgYmluZE1ldGhvZCBdKCAnTVNQb2ludGVyRG93bicsIHRoaXMgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBsaXN0ZW4gZm9yIGJvdGgsIGZvciBkZXZpY2VzIGxpa2UgQ2hyb21lIFBpeGVsXG4gICAgZWxlbVsgYmluZE1ldGhvZCBdKCAnbW91c2Vkb3duJywgdGhpcyApO1xuICAgIGVsZW1bIGJpbmRNZXRob2QgXSggJ3RvdWNoc3RhcnQnLCB0aGlzICk7XG4gIH1cbn07XG5cbi8vIHRyaWdnZXIgaGFuZGxlciBtZXRob2RzIGZvciBldmVudHNcbnByb3RvLmhhbmRsZUV2ZW50ID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB2YXIgbWV0aG9kID0gJ29uJyArIGV2ZW50LnR5cGU7XG4gIGlmICggdGhpc1sgbWV0aG9kIF0gKSB7XG4gICAgdGhpc1sgbWV0aG9kIF0oIGV2ZW50ICk7XG4gIH1cbn07XG5cbi8vIHJldHVybnMgdGhlIHRvdWNoIHRoYXQgd2UncmUga2VlcGluZyB0cmFjayBvZlxucHJvdG8uZ2V0VG91Y2ggPSBmdW5jdGlvbiggdG91Y2hlcyApIHtcbiAgZm9yICggdmFyIGk9MDsgaSA8IHRvdWNoZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIHRvdWNoID0gdG91Y2hlc1tpXTtcbiAgICBpZiAoIHRvdWNoLmlkZW50aWZpZXIgPT0gdGhpcy5wb2ludGVySWRlbnRpZmllciApIHtcbiAgICAgIHJldHVybiB0b3VjaDtcbiAgICB9XG4gIH1cbn07XG5cbi8vIC0tLS0tIHN0YXJ0IGV2ZW50IC0tLS0tIC8vXG5cbnByb3RvLm9ubW91c2Vkb3duID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICAvLyBkaXNtaXNzIGNsaWNrcyBmcm9tIHJpZ2h0IG9yIG1pZGRsZSBidXR0b25zXG4gIHZhciBidXR0b24gPSBldmVudC5idXR0b247XG4gIGlmICggYnV0dG9uICYmICggYnV0dG9uICE9PSAwICYmIGJ1dHRvbiAhPT0gMSApICkge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLl9wb2ludGVyRG93biggZXZlbnQsIGV2ZW50ICk7XG59O1xuXG5wcm90by5vbnRvdWNoc3RhcnQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHRoaXMuX3BvaW50ZXJEb3duKCBldmVudCwgZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0gKTtcbn07XG5cbnByb3RvLm9uTVNQb2ludGVyRG93biA9XG5wcm90by5vbnBvaW50ZXJkb3duID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB0aGlzLl9wb2ludGVyRG93biggZXZlbnQsIGV2ZW50ICk7XG59O1xuXG4vKipcbiAqIHBvaW50ZXIgc3RhcnRcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50IG9yIFRvdWNofSBwb2ludGVyXG4gKi9cbnByb3RvLl9wb2ludGVyRG93biA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgLy8gZGlzbWlzcyBvdGhlciBwb2ludGVyc1xuICBpZiAoIHRoaXMuaXNQb2ludGVyRG93biApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLmlzUG9pbnRlckRvd24gPSB0cnVlO1xuICAvLyBzYXZlIHBvaW50ZXIgaWRlbnRpZmllciB0byBtYXRjaCB1cCB0b3VjaCBldmVudHNcbiAgdGhpcy5wb2ludGVySWRlbnRpZmllciA9IHBvaW50ZXIucG9pbnRlcklkICE9PSB1bmRlZmluZWQgP1xuICAgIC8vIHBvaW50ZXJJZCBmb3IgcG9pbnRlciBldmVudHMsIHRvdWNoLmluZGVudGlmaWVyIGZvciB0b3VjaCBldmVudHNcbiAgICBwb2ludGVyLnBvaW50ZXJJZCA6IHBvaW50ZXIuaWRlbnRpZmllcjtcblxuICB0aGlzLnBvaW50ZXJEb3duKCBldmVudCwgcG9pbnRlciApO1xufTtcblxucHJvdG8ucG9pbnRlckRvd24gPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMuX2JpbmRQb3N0U3RhcnRFdmVudHMoIGV2ZW50ICk7XG4gIHRoaXMuZW1pdEV2ZW50KCAncG9pbnRlckRvd24nLCBbIGV2ZW50LCBwb2ludGVyIF0gKTtcbn07XG5cbi8vIGhhc2ggb2YgZXZlbnRzIHRvIGJlIGJvdW5kIGFmdGVyIHN0YXJ0IGV2ZW50XG52YXIgcG9zdFN0YXJ0RXZlbnRzID0ge1xuICBtb3VzZWRvd246IFsgJ21vdXNlbW92ZScsICdtb3VzZXVwJyBdLFxuICB0b3VjaHN0YXJ0OiBbICd0b3VjaG1vdmUnLCAndG91Y2hlbmQnLCAndG91Y2hjYW5jZWwnIF0sXG4gIHBvaW50ZXJkb3duOiBbICdwb2ludGVybW92ZScsICdwb2ludGVydXAnLCAncG9pbnRlcmNhbmNlbCcgXSxcbiAgTVNQb2ludGVyRG93bjogWyAnTVNQb2ludGVyTW92ZScsICdNU1BvaW50ZXJVcCcsICdNU1BvaW50ZXJDYW5jZWwnIF1cbn07XG5cbnByb3RvLl9iaW5kUG9zdFN0YXJ0RXZlbnRzID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICBpZiAoICFldmVudCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gZ2V0IHByb3BlciBldmVudHMgdG8gbWF0Y2ggc3RhcnQgZXZlbnRcbiAgdmFyIGV2ZW50cyA9IHBvc3RTdGFydEV2ZW50c1sgZXZlbnQudHlwZSBdO1xuICAvLyBiaW5kIGV2ZW50cyB0byBub2RlXG4gIGV2ZW50cy5mb3JFYWNoKCBmdW5jdGlvbiggZXZlbnROYW1lICkge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCBldmVudE5hbWUsIHRoaXMgKTtcbiAgfSwgdGhpcyApO1xuICAvLyBzYXZlIHRoZXNlIGFyZ3VtZW50c1xuICB0aGlzLl9ib3VuZFBvaW50ZXJFdmVudHMgPSBldmVudHM7XG59O1xuXG5wcm90by5fdW5iaW5kUG9zdFN0YXJ0RXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gIC8vIGNoZWNrIGZvciBfYm91bmRFdmVudHMsIGluIGNhc2UgZHJhZ0VuZCB0cmlnZ2VyZWQgdHdpY2UgKG9sZCBJRTggYnVnKVxuICBpZiAoICF0aGlzLl9ib3VuZFBvaW50ZXJFdmVudHMgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMuX2JvdW5kUG9pbnRlckV2ZW50cy5mb3JFYWNoKCBmdW5jdGlvbiggZXZlbnROYW1lICkge1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCBldmVudE5hbWUsIHRoaXMgKTtcbiAgfSwgdGhpcyApO1xuXG4gIGRlbGV0ZSB0aGlzLl9ib3VuZFBvaW50ZXJFdmVudHM7XG59O1xuXG4vLyAtLS0tLSBtb3ZlIGV2ZW50IC0tLS0tIC8vXG5cbnByb3RvLm9ubW91c2Vtb3ZlID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB0aGlzLl9wb2ludGVyTW92ZSggZXZlbnQsIGV2ZW50ICk7XG59O1xuXG5wcm90by5vbk1TUG9pbnRlck1vdmUgPVxucHJvdG8ub25wb2ludGVybW92ZSA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgaWYgKCBldmVudC5wb2ludGVySWQgPT0gdGhpcy5wb2ludGVySWRlbnRpZmllciApIHtcbiAgICB0aGlzLl9wb2ludGVyTW92ZSggZXZlbnQsIGV2ZW50ICk7XG4gIH1cbn07XG5cbnByb3RvLm9udG91Y2htb3ZlID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB2YXIgdG91Y2ggPSB0aGlzLmdldFRvdWNoKCBldmVudC5jaGFuZ2VkVG91Y2hlcyApO1xuICBpZiAoIHRvdWNoICkge1xuICAgIHRoaXMuX3BvaW50ZXJNb3ZlKCBldmVudCwgdG91Y2ggKTtcbiAgfVxufTtcblxuLyoqXG4gKiBwb2ludGVyIG1vdmVcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50IG9yIFRvdWNofSBwb2ludGVyXG4gKiBAcHJpdmF0ZVxuICovXG5wcm90by5fcG9pbnRlck1vdmUgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMucG9pbnRlck1vdmUoIGV2ZW50LCBwb2ludGVyICk7XG59O1xuXG4vLyBwdWJsaWNcbnByb3RvLnBvaW50ZXJNb3ZlID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLmVtaXRFdmVudCggJ3BvaW50ZXJNb3ZlJywgWyBldmVudCwgcG9pbnRlciBdICk7XG59O1xuXG4vLyAtLS0tLSBlbmQgZXZlbnQgLS0tLS0gLy9cblxuXG5wcm90by5vbm1vdXNldXAgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHRoaXMuX3BvaW50ZXJVcCggZXZlbnQsIGV2ZW50ICk7XG59O1xuXG5wcm90by5vbk1TUG9pbnRlclVwID1cbnByb3RvLm9ucG9pbnRlcnVwID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICBpZiAoIGV2ZW50LnBvaW50ZXJJZCA9PSB0aGlzLnBvaW50ZXJJZGVudGlmaWVyICkge1xuICAgIHRoaXMuX3BvaW50ZXJVcCggZXZlbnQsIGV2ZW50ICk7XG4gIH1cbn07XG5cbnByb3RvLm9udG91Y2hlbmQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHZhciB0b3VjaCA9IHRoaXMuZ2V0VG91Y2goIGV2ZW50LmNoYW5nZWRUb3VjaGVzICk7XG4gIGlmICggdG91Y2ggKSB7XG4gICAgdGhpcy5fcG9pbnRlclVwKCBldmVudCwgdG91Y2ggKTtcbiAgfVxufTtcblxuLyoqXG4gKiBwb2ludGVyIHVwXG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICogQHBhcmFtIHtFdmVudCBvciBUb3VjaH0gcG9pbnRlclxuICogQHByaXZhdGVcbiAqL1xucHJvdG8uX3BvaW50ZXJVcCA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5fcG9pbnRlckRvbmUoKTtcbiAgdGhpcy5wb2ludGVyVXAoIGV2ZW50LCBwb2ludGVyICk7XG59O1xuXG4vLyBwdWJsaWNcbnByb3RvLnBvaW50ZXJVcCA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5lbWl0RXZlbnQoICdwb2ludGVyVXAnLCBbIGV2ZW50LCBwb2ludGVyIF0gKTtcbn07XG5cbi8vIC0tLS0tIHBvaW50ZXIgZG9uZSAtLS0tLSAvL1xuXG4vLyB0cmlnZ2VyZWQgb24gcG9pbnRlciB1cCAmIHBvaW50ZXIgY2FuY2VsXG5wcm90by5fcG9pbnRlckRvbmUgPSBmdW5jdGlvbigpIHtcbiAgLy8gcmVzZXQgcHJvcGVydGllc1xuICB0aGlzLmlzUG9pbnRlckRvd24gPSBmYWxzZTtcbiAgZGVsZXRlIHRoaXMucG9pbnRlcklkZW50aWZpZXI7XG4gIC8vIHJlbW92ZSBldmVudHNcbiAgdGhpcy5fdW5iaW5kUG9zdFN0YXJ0RXZlbnRzKCk7XG4gIHRoaXMucG9pbnRlckRvbmUoKTtcbn07XG5cbnByb3RvLnBvaW50ZXJEb25lID0gbm9vcDtcblxuLy8gLS0tLS0gcG9pbnRlciBjYW5jZWwgLS0tLS0gLy9cblxucHJvdG8ub25NU1BvaW50ZXJDYW5jZWwgPVxucHJvdG8ub25wb2ludGVyY2FuY2VsID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICBpZiAoIGV2ZW50LnBvaW50ZXJJZCA9PSB0aGlzLnBvaW50ZXJJZGVudGlmaWVyICkge1xuICAgIHRoaXMuX3BvaW50ZXJDYW5jZWwoIGV2ZW50LCBldmVudCApO1xuICB9XG59O1xuXG5wcm90by5vbnRvdWNoY2FuY2VsID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB2YXIgdG91Y2ggPSB0aGlzLmdldFRvdWNoKCBldmVudC5jaGFuZ2VkVG91Y2hlcyApO1xuICBpZiAoIHRvdWNoICkge1xuICAgIHRoaXMuX3BvaW50ZXJDYW5jZWwoIGV2ZW50LCB0b3VjaCApO1xuICB9XG59O1xuXG4vKipcbiAqIHBvaW50ZXIgY2FuY2VsXG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICogQHBhcmFtIHtFdmVudCBvciBUb3VjaH0gcG9pbnRlclxuICogQHByaXZhdGVcbiAqL1xucHJvdG8uX3BvaW50ZXJDYW5jZWwgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMuX3BvaW50ZXJEb25lKCk7XG4gIHRoaXMucG9pbnRlckNhbmNlbCggZXZlbnQsIHBvaW50ZXIgKTtcbn07XG5cbi8vIHB1YmxpY1xucHJvdG8ucG9pbnRlckNhbmNlbCA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5lbWl0RXZlbnQoICdwb2ludGVyQ2FuY2VsJywgWyBldmVudCwgcG9pbnRlciBdICk7XG59O1xuXG4vLyAtLS0tLSAgLS0tLS0gLy9cblxuLy8gdXRpbGl0eSBmdW5jdGlvbiBmb3IgZ2V0dGluZyB4L3kgY29vcmRzIGZyb20gZXZlbnRcblVuaXBvaW50ZXIuZ2V0UG9pbnRlclBvaW50ID0gZnVuY3Rpb24oIHBvaW50ZXIgKSB7XG4gIHJldHVybiB7XG4gICAgeDogcG9pbnRlci5wYWdlWCxcbiAgICB5OiBwb2ludGVyLnBhZ2VZXG4gIH07XG59O1xuXG4vLyAtLS0tLSAgLS0tLS0gLy9cblxucmV0dXJuIFVuaXBvaW50ZXI7XG5cbn0pKTtcbiIsIi8qKlxuICogV2l0aGluIFZpZXdwb3J0XG4gKlxuICogQGRlc2NyaXB0aW9uIERldGVybWluZXMgd2hldGhlciBhbiBlbGVtZW50IGlzIGNvbXBsZXRlbHkgd2l0aGluIHRoZSBicm93c2VyIHZpZXdwb3J0XG4gKiBAYXV0aG9yICAgICAgQ3JhaWcgUGF0aWssIGh0dHA6Ly9wYXRpay5jb20vXG4gKiBAdmVyc2lvbiAgICAgMS4wLjBcbiAqIEBkYXRlICAgICAgICAyMDE1LTA4LTAyXG4gKi9cbihmdW5jdGlvbiAocm9vdCwgbmFtZSwgZmFjdG9yeSkge1xuICAgIC8vIEFNRFxuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtdLCBmYWN0b3J5KTtcbiAgICB9XG4gICAgLy8gTm9kZSBhbmQgQ29tbW9uSlMtbGlrZSBlbnZpcm9ubWVudHNcbiAgICBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gICAgfVxuICAgIC8vIEJyb3dzZXIgZ2xvYmFsXG4gICAgZWxzZSB7XG4gICAgICAgIHJvb3RbbmFtZV0gPSBmYWN0b3J5KCk7XG4gICAgfVxufSh0aGlzLCAnd2l0aGludmlld3BvcnQnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblVzZVdpbmRvd0RpbWVuc2lvbnMgPSB3aW5kb3cuaW5uZXJIZWlnaHQgIT09IHVuZGVmaW5lZDsgLy8gSUUgOCBhbmQgbG93ZXIgZmFpbCB0aGlzXG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgYW4gZWxlbWVudCBpcyB3aXRoaW4gdGhlIHZpZXdwb3J0XG4gICAgICogQHBhcmFtICB7T2JqZWN0fSAgZWxlbSAgICAgICBET00gRWxlbWVudCAocmVxdWlyZWQpXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSAgb3B0aW9ucyAgICBPcHRpb25hbCBzZXR0aW5nc1xuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59ICAgICAgICAgICAgV2hldGhlciB0aGUgZWxlbWVudCB3YXMgY29tcGxldGVseSB3aXRoaW4gdGhlIHZpZXdwb3J0XG4gICAgKi9cbiAgICB2YXIgd2l0aGludmlld3BvcnQgPSBmdW5jdGlvbiB3aXRoaW52aWV3cG9ydCAoZWxlbSwgb3B0aW9ucykge1xuICAgICAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gICAgICAgIHZhciBtZXRhZGF0YSA9IHt9O1xuICAgICAgICB2YXIgY29uZmlnID0ge307XG4gICAgICAgIHZhciBzZXR0aW5ncztcbiAgICAgICAgdmFyIGlzV2l0aGluO1xuICAgICAgICB2YXIgZWxlbUJvdW5kaW5nUmVjdDtcbiAgICAgICAgdmFyIHNpZGVOYW1lc1BhdHRlcm47XG4gICAgICAgIHZhciBzaWRlcztcbiAgICAgICAgdmFyIHNpZGU7XG4gICAgICAgIHZhciBpO1xuXG4gICAgICAgIC8vIElmIGludm9rZWQgYnkgdGhlIGpRdWVyeSBwbHVnaW4sIGdldCB0aGUgYWN0dWFsIERPTSBlbGVtZW50XG4gICAgICAgIGlmICh0eXBlb2YgalF1ZXJ5ICE9PSAndW5kZWZpbmVkJyAmJiBlbGVtIGluc3RhbmNlb2YgalF1ZXJ5KSB7XG4gICAgICAgICAgICBlbGVtID0gZWxlbS5nZXQoMCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIGVsZW0gIT09ICdvYmplY3QnIHx8IGVsZW0ubm9kZVR5cGUgIT09IDEpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhbiBlbGVtZW50Jyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMb29rIGZvciBpbmxpbmUgc2V0dGluZ3Mgb24gdGhlIGVsZW1lbnRcbiAgICAgICAgaWYgKGVsZW0uZ2V0QXR0cmlidXRlKCdkYXRhLXdpdGhpbnZpZXdwb3J0LXNldHRpbmdzJykgJiYgd2luZG93LkpTT04pIHtcbiAgICAgICAgICAgIG1ldGFkYXRhID0gSlNPTi5wYXJzZShlbGVtLmdldEF0dHJpYnV0ZSgnZGF0YS13aXRoaW52aWV3cG9ydC1zZXR0aW5ncycpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldHRpbmdzIGFyZ3VtZW50IG1heSBiZSBhIHNpbXBsZSBzdHJpbmcgKGB0b3BgLCBgcmlnaHRgLCBldGMpXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHNldHRpbmdzID0ge3NpZGVzOiBvcHRpb25zfTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHNldHRpbmdzID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJ1aWxkIGNvbmZpZ3VyYXRpb24gZnJvbSBkZWZhdWx0cyBhbmQgdXNlci1wcm92aWRlZCBzZXR0aW5ncyBhbmQgbWV0YWRhdGFcbiAgICAgICAgY29uZmlnLmNvbnRhaW5lciA9IHNldHRpbmdzLmNvbnRhaW5lciB8fCBtZXRhZGF0YS5jb250YWluZXIgfHwgd2l0aGludmlld3BvcnQuZGVmYXVsdHMuY29udGFpbmVyIHx8IHdpbmRvdztcbiAgICAgICAgY29uZmlnLnNpZGVzICA9IHNldHRpbmdzLnNpZGVzICB8fCBtZXRhZGF0YS5zaWRlcyAgfHwgd2l0aGludmlld3BvcnQuZGVmYXVsdHMuc2lkZXMgIHx8ICdhbGwnO1xuICAgICAgICBjb25maWcudG9wICAgID0gc2V0dGluZ3MudG9wICAgIHx8IG1ldGFkYXRhLnRvcCAgICB8fCB3aXRoaW52aWV3cG9ydC5kZWZhdWx0cy50b3AgICAgfHwgMDtcbiAgICAgICAgY29uZmlnLnJpZ2h0ICA9IHNldHRpbmdzLnJpZ2h0ICB8fCBtZXRhZGF0YS5yaWdodCAgfHwgd2l0aGludmlld3BvcnQuZGVmYXVsdHMucmlnaHQgIHx8IDA7XG4gICAgICAgIGNvbmZpZy5ib3R0b20gPSBzZXR0aW5ncy5ib3R0b20gfHwgbWV0YWRhdGEuYm90dG9tIHx8IHdpdGhpbnZpZXdwb3J0LmRlZmF1bHRzLmJvdHRvbSB8fCAwO1xuICAgICAgICBjb25maWcubGVmdCAgID0gc2V0dGluZ3MubGVmdCAgIHx8IG1ldGFkYXRhLmxlZnQgICB8fCB3aXRoaW52aWV3cG9ydC5kZWZhdWx0cy5sZWZ0ICAgfHwgMDtcblxuICAgICAgICAvLyBVc2UgdGhlIHdpbmRvdyBhcyB0aGUgY29udGFpbmVyIGlmIHRoZSB1c2VyIHNwZWNpZmllZCB0aGUgYm9keSBvciBhIG5vbi1lbGVtZW50XG4gICAgICAgIGlmIChjb25maWcuY29udGFpbmVyID09PSBkb2N1bWVudC5ib2R5IHx8ICFjb25maWcuY29udGFpbmVyLm5vZGVUeXBlID09PSAxKSB7XG4gICAgICAgICAgICBjb25maWcuY29udGFpbmVyID0gd2luZG93O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRWxlbWVudCB0ZXN0aW5nIG1ldGhvZHNcbiAgICAgICAgaXNXaXRoaW4gPSB7XG4gICAgICAgICAgICAvLyBFbGVtZW50IGlzIGJlbG93IHRoZSB0b3AgZWRnZSBvZiB0aGUgdmlld3BvcnRcbiAgICAgICAgICAgIHRvcDogZnVuY3Rpb24gX2lzV2l0aGluX3RvcCAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1Cb3VuZGluZ1JlY3QudG9wID49IGNvbmZpZy50b3A7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvLyBFbGVtZW50IGlzIHRvIHRoZSBsZWZ0IG9mIHRoZSByaWdodCBlZGdlIG9mIHRoZSB2aWV3cG9ydFxuICAgICAgICAgICAgcmlnaHQ6IGZ1bmN0aW9uIF9pc1dpdGhpbl9yaWdodCAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbnRhaW5lcldpZHRoO1xuXG4gICAgICAgICAgICAgICAgaWYgKGNhblVzZVdpbmRvd0RpbWVuc2lvbnMgfHwgY29uZmlnLmNvbnRhaW5lciAhPT0gd2luZG93KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lcldpZHRoID0gY29uZmlnLmNvbnRhaW5lci5pbm5lcldpZHRoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyV2lkdGggPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gTm90ZSB0aGF0IGBlbGVtQm91bmRpbmdSZWN0LnJpZ2h0YCBpcyB0aGUgZGlzdGFuY2UgZnJvbSB0aGUgKmxlZnQqIG9mIHRoZSB2aWV3cG9ydCB0byB0aGUgZWxlbWVudCdzIGZhciByaWdodCBlZGdlXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1Cb3VuZGluZ1JlY3QucmlnaHQgPD0gY29udGFpbmVyV2lkdGggLSBjb25maWcucmlnaHQ7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvLyBFbGVtZW50IGlzIGFib3ZlIHRoZSBib3R0b20gZWRnZSBvZiB0aGUgdmlld3BvcnRcbiAgICAgICAgICAgIGJvdHRvbTogZnVuY3Rpb24gX2lzV2l0aGluX2JvdHRvbSAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbnRhaW5lckhlaWdodDtcblxuICAgICAgICAgICAgICAgIGlmIChjYW5Vc2VXaW5kb3dEaW1lbnNpb25zIHx8IGNvbmZpZy5jb250YWluZXIgIT09IHdpbmRvdykge1xuICAgICAgICAgICAgICAgICAgICBjb250YWluZXJIZWlnaHQgPSBjb25maWcuY29udGFpbmVyLmlubmVySGVpZ2h0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVySGVpZ2h0ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBOb3RlIHRoYXQgYGVsZW1Cb3VuZGluZ1JlY3QuYm90dG9tYCBpcyB0aGUgZGlzdGFuY2UgZnJvbSB0aGUgKnRvcCogb2YgdGhlIHZpZXdwb3J0IHRvIHRoZSBlbGVtZW50J3MgYm90dG9tIGVkZ2VcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbUJvdW5kaW5nUmVjdC5ib3R0b20gPD0gY29udGFpbmVySGVpZ2h0IC0gY29uZmlnLmJvdHRvbTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8vIEVsZW1lbnQgaXMgdG8gdGhlIHJpZ2h0IG9mIHRoZSBsZWZ0IGVkZ2Ugb2YgdGhlIHZpZXdwb3J0XG4gICAgICAgICAgICBsZWZ0OiBmdW5jdGlvbiBfaXNXaXRoaW5fbGVmdCAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1Cb3VuZGluZ1JlY3QubGVmdCA+PSBjb25maWcubGVmdDtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8vIEVsZW1lbnQgaXMgd2l0aGluIGFsbCBmb3VyIGJvdW5kYXJpZXNcbiAgICAgICAgICAgIGFsbDogZnVuY3Rpb24gX2lzV2l0aGluX2FsbCAoKSB7XG4gICAgICAgICAgICAgICAgLy8gVGVzdCBlYWNoIGJvdW5kYXJ5IGluIG9yZGVyIG9mIG1vc3QgZWZmaWNpZW50IGFuZCBtb3N0IGxpa2VseSB0byBiZSBmYWxzZSBzbyB0aGF0IHdlIGNhbiBhdm9pZCBydW5uaW5nIGFsbCBmb3VyIGZ1bmN0aW9ucyBvbiBtb3N0IGVsZW1lbnRzXG4gICAgICAgICAgICAgICAgLy8gVG9wOiBRdWlja2VzdCB0byBjYWxjdWxhdGUgKyBtb3N0IGxpa2VseSB0byBiZSBmYWxzZVxuICAgICAgICAgICAgICAgIC8vIEJvdHRvbTogTm90ZSBxdWl0ZSBhcyBxdWljayB0byBjYWxjdWxhdGUsIGJ1dCBhbHNvIHZlcnkgbGlrZWx5IHRvIGJlIGZhbHNlXG4gICAgICAgICAgICAgICAgLy8gTGVmdCBhbmQgcmlnaHQgYXJlIGJvdGggZXF1YWxseSB1bmxpa2VseSB0byBiZSBmYWxzZSBzaW5jZSBtb3N0IHNpdGVzIG9ubHkgc2Nyb2xsIHZlcnRpY2FsbHksIGJ1dCBsZWZ0IGlzIGZhc3RlclxuICAgICAgICAgICAgICAgIHJldHVybiAoaXNXaXRoaW4udG9wKCkgJiYgaXNXaXRoaW4uYm90dG9tKCkgJiYgaXNXaXRoaW4ubGVmdCgpICYmIGlzV2l0aGluLnJpZ2h0KCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEdldCB0aGUgZWxlbWVudCdzIGJvdW5kaW5nIHJlY3RhbmdsZSB3aXRoIHJlc3BlY3QgdG8gdGhlIHZpZXdwb3J0XG4gICAgICAgIGVsZW1Cb3VuZGluZ1JlY3QgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgIC8vIFRlc3QgdGhlIGVsZW1lbnQgYWdhaW5zdCBlYWNoIHNpZGUgb2YgdGhlIHZpZXdwb3J0IHRoYXQgd2FzIHJlcXVlc3RlZFxuICAgICAgICBzaWRlTmFtZXNQYXR0ZXJuID0gL150b3AkfF5yaWdodCR8XmJvdHRvbSR8XmxlZnQkfF5hbGwkLztcbiAgICAgICAgLy8gTG9vcCB0aHJvdWdoIGFsbCBvZiB0aGUgc2lkZXNcbiAgICAgICAgc2lkZXMgPSBjb25maWcuc2lkZXMuc3BsaXQoJyAnKTtcbiAgICAgICAgaSA9IHNpZGVzLmxlbmd0aDtcbiAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgICAgc2lkZSA9IHNpZGVzW2ldLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgICAgIGlmIChzaWRlTmFtZXNQYXR0ZXJuLnRlc3Qoc2lkZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNXaXRoaW5bc2lkZV0oKSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUXVpdCBhcyBzb29uIGFzIHRoZSBmaXJzdCBmYWlsdXJlIGlzIGZvdW5kXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIC8vIERlZmF1bHQgc2V0dGluZ3NcbiAgICB3aXRoaW52aWV3cG9ydC5wcm90b3R5cGUuZGVmYXVsdHMgPSB7XG4gICAgICAgIGNvbnRhaW5lcjogZG9jdW1lbnQuYm9keSxcbiAgICAgICAgc2lkZXM6ICdhbGwnLFxuICAgICAgICB0b3A6IDAsXG4gICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICBib3R0b206IDAsXG4gICAgICAgIGxlZnQ6IDBcbiAgICB9O1xuXG4gICAgd2l0aGludmlld3BvcnQuZGVmYXVsdHMgPSB3aXRoaW52aWV3cG9ydC5wcm90b3R5cGUuZGVmYXVsdHM7XG5cbiAgICAvKipcbiAgICAgKiBPcHRpb25hbCBlbmhhbmNlbWVudHMgYW5kIHNob3J0Y3V0c1xuICAgICAqXG4gICAgICogQGRlc2NyaXB0aW9uIFVuY29tbWVudCBvciBjb21tZW50IHRoZXNlIHBpZWNlcyBhcyB0aGV5IGFwcGx5IHRvIHlvdXIgcHJvamVjdCBhbmQgY29kaW5nIHByZWZlcmVuY2VzXG4gICAgICovXG5cbiAgICAvLyBTaG9ydGN1dCBtZXRob2RzIGZvciBlYWNoIHNpZGUgb2YgdGhlIHZpZXdwb3J0XG4gICAgLy8gRXhhbXBsZTogYHdpdGhpbnZpZXdwb3J0LnRvcChlbGVtKWAgaXMgdGhlIHNhbWUgYXMgYHdpdGhpbnZpZXdwb3J0KGVsZW0sICd0b3AnKWBcbiAgICB3aXRoaW52aWV3cG9ydC5wcm90b3R5cGUudG9wID0gZnVuY3Rpb24gX3dpdGhpbnZpZXdwb3J0X3RvcCAoZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gd2l0aGludmlld3BvcnQoZWxlbWVudCwgJ3RvcCcpO1xuICAgIH07XG5cbiAgICB3aXRoaW52aWV3cG9ydC5wcm90b3R5cGUucmlnaHQgPSBmdW5jdGlvbiBfd2l0aGludmlld3BvcnRfcmlnaHQgKGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIHdpdGhpbnZpZXdwb3J0KGVsZW1lbnQsICdyaWdodCcpO1xuICAgIH07XG5cbiAgICB3aXRoaW52aWV3cG9ydC5wcm90b3R5cGUuYm90dG9tID0gZnVuY3Rpb24gX3dpdGhpbnZpZXdwb3J0X2JvdHRvbSAoZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gd2l0aGludmlld3BvcnQoZWxlbWVudCwgJ2JvdHRvbScpO1xuICAgIH07XG5cbiAgICB3aXRoaW52aWV3cG9ydC5wcm90b3R5cGUubGVmdCA9IGZ1bmN0aW9uIF93aXRoaW52aWV3cG9ydF9sZWZ0IChlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiB3aXRoaW52aWV3cG9ydChlbGVtZW50LCAnbGVmdCcpO1xuICAgIH07XG5cbiAgICByZXR1cm4gd2l0aGludmlld3BvcnQ7XG59KSk7XG4iLCJjb25zdCBkcmFnZ2FiaWxseSA9IHJlcXVpcmUoJ2RyYWdnYWJpbGx5Jyk7XG5cbmNvbnN0IHNob3cgPSAoKSA9PiB7XG4gICAgJCgnYm9keScpLmFwcGVuZChodG1sKTtcbiAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnZocy1jb250cm9scycpO1xuICAgIG5ldyBkcmFnZ2FiaWxseShlbGVtZW50KTtcbn07XG5cbmNvbnN0IHRvZ2dsZVJlY29yZGluZ1N0YXRlID0gKCkgPT4ge1xuICAgICQoJy52aHMtcmVjb3JkLWNpcmNsZScpLnRvZ2dsZUNsYXNzKCd2aHMtcmVjb3JkaW5nJyk7XG59O1xuXG5jb25zdCB0b2dnbGVQbGF5aW5nU3RhdGUgPSAoKSA9PiB7XG4gICAgJCgnLnZocy1wbGF5LWJ1dHRvbicpLnRvZ2dsZUNsYXNzKCd2aHMtcGxheWluZycpO1xufTtcblxuY29uc3Qgc3R5bGVzID0gYDxzdHlsZT5cbiAgICAudmhzLWNvbnRyb2xzIHtcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICB0b3A6IDEwcHg7XG4gICAgICAgIGxlZnQ6IDEwcHg7XG4gICAgfVxuICAgIC52aHMtYnV0dG9uIHtcbiAgICAgICAgd2lkdGg6IDMwcHg7XG4gICAgICAgIGhlaWdodDogMzBweDtcbiAgICAgICAgYmFja2dyb3VuZDogI0ZGRjtcbiAgICAgICAgYm9yZGVyOiAxcHggc29saWQgI0RERDtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogNXB4O1xuICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICB9XG4gICAgLnZocy1yZWNvcmQtY2lyY2xlIHtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgICB3aWR0aDogMTBweDtcbiAgICAgICAgaGVpZ2h0OiAxMHB4O1xuICAgICAgICBtYXJnaW46IDEwcHg7XG4gICAgICAgIGJhY2tncm91bmQ6ICNGRTM1NDg7XG4gICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICB9XG4gICAgLnZocy1yZWNvcmRpbmcge1xuICAgICAgICBhbmltYXRpb246IHZocy1yZWNvcmRpbmctYW5pbWF0aW9uIDJzIGluZmluaXRlO1xuICAgIH1cbiAgICBAa2V5ZnJhbWVzIHZocy1yZWNvcmRpbmctYW5pbWF0aW9uIHtcbiAgICAgICAgMCUgICB7b3BhY2l0eTogMX1cbiAgICAgICAgNTAlICB7b3BhY2l0eTogMH1cbiAgICAgICAgMTAwJSB7b3BhY2l0eTogMX1cbiAgICB9XG4gICAgLnZocy1wbGF5aW5nIHtcbiAgICAgICAgYmFja2dyb3VuZDogIzAwQURFOTtcbiAgICAgICAgYm9yZGVyLWNvbG9yOiAjMDBBREU5O1xuICAgIH1cbiAgICAudmhzLXBsYXlpbmcgLnZocy1wbGF5LXRyaWFuZ2xlIHtcbiAgICAgICAgYmFja2dyb3VuZDogI0ZGRjtcbiAgICB9XG4gICAgLnZocy1wbGF5LXRyaWFuZ2xlIHtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzY2NjtcbiAgICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgICAgICBtYXJnaW46IDEycHg7XG4gICAgfVxuICAgIC52aHMtcGxheS10cmlhbmdsZTpiZWZvcmUsXG4gICAgLnZocy1wbGF5LXRyaWFuZ2xlOmFmdGVyIHtcbiAgICAgICAgY29udGVudDogJyc7XG4gICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogaW5oZXJpdDtcbiAgICB9XG4gICAgLnZocy1wbGF5LXRyaWFuZ2xlLFxuICAgIC52aHMtcGxheS10cmlhbmdsZTpiZWZvcmUsXG4gICAgLnZocy1wbGF5LXRyaWFuZ2xlOmFmdGVyIHtcbiAgICAgICAgd2lkdGg6ICA2cHg7XG4gICAgICAgIGhlaWdodDogNnB4O1xuICAgICAgICBib3JkZXItdG9wLXJpZ2h0LXJhZGl1czogMzAlO1xuICAgIH1cbiAgICAudmhzLXBsYXktdHJpYW5nbGUge1xuICAgICAgICB0cmFuc2Zvcm06IHJvdGF0ZSgzMGRlZykgc2tld1goLTMwZGVnKSBzY2FsZSgxLCAuODY2KTtcbiAgICB9XG4gICAgLnZocy1wbGF5LXRyaWFuZ2xlOmJlZm9yZSB7XG4gICAgICAgIHRyYW5zZm9ybTogcm90YXRlKC0xMzVkZWcpIHNrZXdYKC00NWRlZykgc2NhbGUoMS40MTQsIC43MDcpIHRyYW5zbGF0ZSgwLCAtNTAlKTtcbiAgICB9XG4gICAgLnZocy1wbGF5LXRyaWFuZ2xlOmFmdGVyIHtcbiAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMTM1ZGVnKSBza2V3WSgtNDVkZWcpIHNjYWxlKC43MDcsIDEuNDE0KSB0cmFuc2xhdGUoNTAlKTtcbiAgICB9XG48L3N0eWxlPmA7XG5cbmNvbnN0IGh0bWwgPSBgXG4gICAgPGRpdiBjbGFzcz1cInZocy1jb250cm9sc1wiPlxuICAgICAgICAke3N0eWxlc31cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJ2aHMtYnV0dG9uXCIgb25jbGljaz1cInZocy50b2dnbGVSZWNvcmRpbmcoKVwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ2aHMtcmVjb3JkLWNpcmNsZVwiPjwvc3Bhbj5cbiAgICAgICAgPC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz1cInZocy1idXR0b24gdmhzLXBsYXktYnV0dG9uXCIgb25jbGljaz1cInZocy5zZXR1cFBsYXliYWNrKClcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidmhzLXBsYXktdHJpYW5nbGVcIj48L3NwYW4+XG4gICAgICAgIDwvc3Bhbj5cbiAgICA8L2Rpdj5cbmA7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHNob3csXG4gICAgdG9nZ2xlUmVjb3JkaW5nU3RhdGUsXG4gICAgdG9nZ2xlUGxheWluZ1N0YXRlXG59XG4iLCJjb25zdCB4cGF0aCA9IHJlcXVpcmUoJ3NpbXBsZS14cGF0aC1wb3NpdGlvbicpO1xuY29uc3QgdmlzaWJsZSA9IHJlcXVpcmUoJ3dpdGhpbnZpZXdwb3J0Jyk7XG53aW5kb3cudmlzYmxlID0gdmlzaWJsZTtcblxuY29uc3Qgc2hvdyA9ICgpID0+IHtcbiAgICAkKCdib2R5JykuYXBwZW5kKGh0bWwpO1xufTtcblxubGV0IGV2ZW50cyA9IFtdO1xuXG5jb25zdCByZW5kZXIgPSAoZXZlbnRzQXJyYXksIGxhc3RFdmVudEluZGV4KSA9PiB7XG4gICAgJCgnLnZocy1zaWRlYmFyLWV2ZW50cycpLmVtcHR5KCk7XG4gICAgZXZlbnRzID0gZXZlbnRzQXJyYXk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyBpKyspIGFkZEV2ZW50KGksIGxhc3RFdmVudEluZGV4KTtcbiAgICBmb2xsb3dMb2dzKCk7XG59O1xuXG5jb25zdCBmb2xsb3dMb2dzID0gKCkgPT4ge1xuICAgIGxldCBsYXRlc3RQYXNzZWRUZXN0ID0gJCgnLnZocy1zaWRlYmFyLWV2ZW50LXBhc3NlZCcpLmxhc3QoKTtcbiAgICBpZiAoIWxhdGVzdFBhc3NlZFRlc3QubGVuZ3RoKSByZXR1cm47XG5cbiAgICBpZiAoIXZpc2libGUobGF0ZXN0UGFzc2VkVGVzdCkpIHtcbiAgICAgICAgbGV0IHNjcm9sbFRvcCAgPSAkKCcudmhzLXNpZGViYXInKS5zY3JvbGxUb3AoKTtcbiAgICAgICAgJCgnLnZocy1zaWRlYmFyJykuc3RvcCgpLmFuaW1hdGUoe1xuICAgICAgICAgICAgc2Nyb2xsVG9wOiBzY3JvbGxUb3AgKyA1MDBcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuY29uc3QgYWRkRXZlbnQgPSAoaW5kZXgsIGxhc3RFdmVudEluZGV4KSA9PiB7XG4gICAgbGV0IGV2ZW50ID0gZXZlbnRzW2luZGV4XTtcbiAgICBldmVudC5pbmRleCA9IGluZGV4O1xuXG4gICAgZXZlbnQuc3RhdHVzID0gaW5kZXggPD0gbGFzdEV2ZW50SW5kZXggPyAncGFzc2VkJzogJ3BlbmRpbmcnO1xuXG4gICAgaWYgKGV2ZW50LnR5cGUgPT09ICd3YWl0JyAmJiBldmVudC5kdXJhdGlvbiA8IDMwMCkgcmV0dXJuO1xuXG4gICAgZXZlbnQuaWRlbnRpZmllciA9IGdldFByZXR0eUlkZW50aWZpZXIoZXZlbnQucGF0aCk7XG5cbiAgICBpZiAoZXZlbnQud2hpY2ggPT09IDEpIGRlbGV0ZSBldmVudC53aGljaDsgLy8gY2xpY2sgZXZlbnRzXG4gICAgaWYgKGV2ZW50LndoaWNoKSBldmVudC5rZXkgPSBnZXRQcmV0dHlLZXkoZXZlbnQud2hpY2gpO1xuXG4gICAgJCgnLnZocy1zaWRlYmFyLWV2ZW50cycpLmFwcGVuZChnZXROZXdFdmVudEhUTUwoZXZlbnQpKTtcbn07XG5cbmNvbnN0IGdldFByZXR0eUlkZW50aWZpZXIgPSAocGF0aCkgPT4ge1xuICAgIGxldCBpZGVudGlmaWVyID0gJyc7XG4gICAgaWYgKCFwYXRoKSByZXR1cm4gaWRlbnRpZmllcjtcblxuICAgIGxldCBlbGVtZW50ID0geHBhdGgudG9Ob2RlKHBhdGgsIGRvY3VtZW50KTtcbiAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIGlkZW50aWZpZXI7XG4gICAgfVxuXG4gICAgaWRlbnRpZmllciArPSBlbGVtZW50LnRhZ05hbWUgPyBgJHtlbGVtZW50LnRhZ05hbWV9YDogJyc7XG4gICAgaWRlbnRpZmllciArPSBlbGVtZW50LmlkID8gYCMke2VsZW1lbnQuaWR9YDogJyc7XG4gICAgaWRlbnRpZmllciArPSBlbGVtZW50LmNsYXNzTmFtZSA/IGAuJHtlbGVtZW50LmNsYXNzTmFtZX1gOiAnJztcbiAgICBpZGVudGlmaWVyICs9IGVsZW1lbnQudGV4dCA/IGAoJHtlbGVtZW50LnRleHR9KWA6ICcnO1xuICAgIHJldHVybiBpZGVudGlmaWVyO1xufTtcblxuY29uc3QgZ2V0UHJldHR5S2V5ID0gKHdoaWNoKSA9PiB7XG4gICAgbGV0IG1hcCA9IHtcbiAgICAgICAgODogJ+KGkCcsXG4gICAgICAgIDEzOiAn4oa1JyxcbiAgICAgICAgMzI6ICdfJyAvL3Byb3h5IGZvciBzcGFjZVxuICAgIH1cbiAgICByZXR1cm4gbWFwW3doaWNoXSB8fCBTdHJpbmcuZnJvbUNoYXJDb2RlKHdoaWNoKTtcbn07XG5cbmNvbnN0IHN0eWxlcyA9IGA8c3R5bGU+XG4gICAgLnZocy1zaWRlYmFyIHtcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICB0b3A6IDA7XG4gICAgICAgIHJpZ2h0OiAwO1xuICAgICAgICB3aWR0aDogMzAwcHg7XG4gICAgICAgIGhlaWdodDogMTAwJTtcbiAgICAgICAgei1pbmRleDogOTk5O1xuICAgICAgICBiYWNrZ3JvdW5kOiAjMjUzNDQ3O1xuICAgICAgICBib3JkZXItbGVmdDogMXB4IHNvbGlkICMxQzI5Mzk7XG4gICAgICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgICAgIGNvbG9yOiAjRkZGO1xuICAgICAgICBmb250LXNpemU6IDE0cHg7XG4gICAgfVxuICAgIC52aHMtc2lkZWJhci1oZWFkZXIge1xuICAgICAgICBiYWNrZ3JvdW5kOiAjMUMyOTM5O1xuICAgICAgICBwYWRkaW5nOiAyMHB4IDMwcHg7XG4gICAgICAgIGZvbnQtc2l6ZTogMThweDtcbiAgICB9XG4gICAgLnZocy1zaWRlYmFyLWV2ZW50IHtcbiAgICAgICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICAgICAgcGFkZGluZzogMTBweDtcbiAgICB9XG4gICAgLnZocy1zaWRlYmFyLWV2ZW50LXR5cGUsIC52aHMtc2lkZWJhci1ldmVudC1rZXkge1xuICAgICAgICBmbG9hdDogcmlnaHQ7XG4gICAgfVxuICAgIC52aHMtc2lkZWJhci1ldmVudC1rZXkge1xuICAgICAgICBjb2xvcjogI0QyNDI2RTtcbiAgICAgICAgYmFja2dyb3VuZDogI0Y3RjdGOTtcbiAgICAgICAgYm9yZGVyOiAxcHggc29saWQgI0RERDtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogM3B4O1xuICAgICAgICBwYWRkaW5nOiAwIDNweDtcbiAgICAgICAgbWFyZ2luLWxlZnQ6IDVweDtcbiAgICAgICAgZGlzcGxheTogaW5saW5lO1xuICAgIH1cbiAgICAudmhzLXNpZGViYXItc3RhdHVzIHtcbiAgICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgICAgICB3aWR0aDogNy41cHg7XG4gICAgICAgIGhlaWdodDogNy41cHg7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgICAgbWFyZ2luOiAycHggNXB4O1xuICAgIH1cbiAgICAudmhzLXNpZGViYXItZXZlbnQtcGVuZGluZyB7XG4gICAgICAgIGNvbG9yOiAjNzA3Qzg4O1xuICAgIH1cbiAgICAudmhzLXNpZGViYXItZXZlbnQtcGVuZGluZyAudmhzLXNpZGViYXItc3RhdHVzIHtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzcwN0M4ODtcbiAgICB9XG4gICAgLnZocy1zaWRlYmFyLWV2ZW50LXBhc3NlZCB7XG4gICAgICAgIGNvbG9yOiAjMkVBQURFO1xuICAgIH1cbiAgICAudmhzLXNpZGViYXItZXZlbnQtcGFzc2VkIC52aHMtc2lkZWJhci1zdGF0dXMge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMkVBQURFO1xuICAgIH1cbiAgICAudmhzLXNpZGViYXItZXZlbnQtZmFpbGVkIC52aHMtc2lkZWJhci1zdGF0dXMge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZWQ7XG4gICAgfVxuPC9zdHlsZT5gO1xuXG5jb25zdCBodG1sID0gYFxuICAgIDxkaXYgY2xhc3M9XCJ2aHMtc2lkZWJhclwiPlxuICAgICAgICAke3N0eWxlc31cbiAgICAgICAgPGRpdiBjbGFzcz1cInZocy1zaWRlYmFyLWhlYWRlclwiPlxuICAgICAgICAgICAgRXZlbnRzXG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwidmhzLXNpZGViYXItZXZlbnRzXCI+XG5cbiAgICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG5gO1xuXG5jb25zdCBnZXREZXRhaWxIVE1MID0gKGRhdGEsIHR5cGUpID0+IHtcbiAgICBpZiAoIWRhdGEpIHJldHVybiBgYDtcbiAgICBpZiAodHlwZSA9PT0gJ2R1cmF0aW9uJykgZGF0YSA9IGAmIzEyODMzNzsgJHtkYXRhfWA7XG4gICAgcmV0dXJuIGA8c3BhbiBjbGFzcz1cInZocy1zaWRlYmFyLWV2ZW50LSR7dHlwZX1cIj4ke2RhdGF9PC9zcGFuPmA7XG59O1xuXG5jb25zdCBnZXROZXdFdmVudEhUTUwgPSAoe3R5cGUsIGR1cmF0aW9uLCBrZXksIGlkZW50aWZpZXIsIHN0YXR1cywgaW5kZXh9KSA9PiB7XG4gICAgcmV0dXJuIGBcbiAgICAgICAgPGRpdlxuICAgICAgICAgICAgY2xhc3M9XCJ2aHMtc2lkZWJhci1ldmVudCB2aHMtc2lkZWJhci1ldmVudC0ke3N0YXR1c31cIlxuICAgICAgICAgICAgZGF0YS1pbmRleD0ke2luZGV4fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ2aHMtc2lkZWJhci1zdGF0dXNcIj48L3NwYW4+XG4gICAgICAgICAgICAke2dldERldGFpbEhUTUwoaWRlbnRpZmllciwgJ2lkZW50aWZpZXInKX1cbiAgICAgICAgICAgICR7Z2V0RGV0YWlsSFRNTChkdXJhdGlvbiwgJ2R1cmF0aW9uJyl9XG5cbiAgICAgICAgICAgICR7Z2V0RGV0YWlsSFRNTChrZXksICdrZXknKX1cbiAgICAgICAgICAgICR7Z2V0RGV0YWlsSFRNTCh0eXBlLCAndHlwZScpfVxuICAgICAgICA8L2Rpdj5cbiAgICBgO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc2hvdyxcbiAgICByZW5kZXJcbn1cbiIsIi8qIExpYiB0byBnZXQgeHBhdGggZm9yIGEgRE9NIG5vZGUgKi9cbmNvbnN0IHhwYXRoID0gcmVxdWlyZSgnc2ltcGxlLXhwYXRoLXBvc2l0aW9uJyk7XG5cbi8qIFBvbHlmaWxsIGZvciBBcnJheS5wcm90b3R5cGUuaW5jbHVkZXMgKi9cbnJlcXVpcmUoJ2NvcmUtanMvZm4vYXJyYXkvaW5jbHVkZXMnKTtcblxuY29uc3QgY29udHJvbHMgPSByZXF1aXJlKCcuL2NvbnRyb2xzJyk7XG5jb25zdCBzaWRlYmFyID0gcmVxdWlyZSgnLi9zaWRlYmFyJyk7XG5cbi8qIFdoaXRlbGlzdCBvZiBET00gZXZlbnRzIHRoYXQgYXJlIHJlY29yZGVkICovXG5jb25zdCBldmVudFR5cGVzID0gWydjbGljaycsICdrZXlwcmVzcycsICdkYmxjbGljayddO1xuXG4vKiBIYWNreSBldmVudHMgKi9cbmNvbnN0IHNwZWNpYWxFdmVudFR5cGVzID0gWydrZXlkb3duJ107XG5cbmxldCBldmVudHMgPSBbXTtcblxuLyogQ3JlYXRlIGV2ZW50IGhhbmRsZXJzIGZvciBlYWNoIGV2ZW50IHR5cGUgLSBjYWxsIGByZWNvcmRgIGZ1bmN0aW9uICovXG5jb25zdCBnZXRFdmVudEhhbmRsZXJzID0gKCkgPT4ge1xuICAgIGxldCBoYW5kbGVycyA9IHt9O1xuICAgIGV2ZW50VHlwZXMubWFwKHR5cGUgPT4gaGFuZGxlcnNbdHlwZV0gPSByZWNvcmRFdmVudCk7XG4gICAgc3BlY2lhbEV2ZW50VHlwZXMubWFwKHR5cGUgPT4gaGFuZGxlcnNbdHlwZV0gPSByZWNvcmRFdmVudCk7XG4gICAgcmV0dXJuIGhhbmRsZXJzO1xufTtcblxuY29uc3Qgd3JhcEJvZHlJblJlY29yZGFibGUgPSAoKSA9PiB7XG4gICAgJCgnYm9keScpLndyYXBJbm5lcignPGRpdiBjbGFzcz1cInZocy1yZWNvcmRhYmxlXCI+PC9kaXY+Jylcbn07XG5cbmNvbnN0IGF0dGFjaEhhbmRsZXJzID0gKCkgPT4ge1xuICAgIGxldCBoYW5kbGVycyA9IGdldEV2ZW50SGFuZGxlcnMoKTtcbiAgICAkKCcudmhzLXJlY29yZGFibGUnKS5vbihoYW5kbGVycyk7XG59O1xuXG5jb25zdCBkZXRhY2hIYW5kbGVycyA9ICgpID0+IHtcbiAgICBsZXQgaGFuZGxlcnMgPSBnZXRFdmVudEhhbmRsZXJzKCk7XG4gICAgJCgnLnZocy1yZWNvcmRhYmxlJykub2ZmKGhhbmRsZXJzKTtcbn07XG5cbmNvbnN0IHJlY29yZEV2ZW50ID0gKGV2ZW50KSA9PiB7XG4gICAgLyogT25seSByZWNvcmQgd2hpdGVsaXN0ZWQgZXZlbnQgdHlwZXMgKi9cbiAgICBpZiAoIWV2ZW50VHlwZXMuaW5jbHVkZXMoZXZlbnQudHlwZSkpIHtcbiAgICAgICAgLyogU29tZSBldmVudHMgbGlrZSBrZXlkb3duIG5lZWQgc3BlY2lhbCB0cmVhdG1lbnQgKi9cbiAgICAgICAgaWYgKHNwZWNpYWxFdmVudFR5cGVzLmluY2x1ZGVzKGV2ZW50LnR5cGUpKSBoYW5kbGVIYWNrcyhldmVudCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIFdlIHdhbnQgdG8gZ2V0IHRoZSB4cGF0aCBvZiB0aGUgRE9NIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBEZXBlbmRpbmcgb24gdGhlIGludGVyZmFjZSwgdGhlIGVsZW1lbnQgbWlnaHQgb3JcbiAgICAgKiBtaWdodCBub3Qgc3RheSBpbiB0aGUgRE9NIHRyZWUgYWZ0ZXIgdGhlIGV2ZW50LlxuICAgICAqXG4gICAgICogV2UgbmVlZCB0byBoaWphY2sgdGhlIGV2ZW50LCBydW4gb3VyIGNvZGUgZmlyc3RcbiAgICAgKiBhbmQgdGhlbiBwbGF5IHRoZSBldmVudC5cbiAgICAgKi9cbiAgICBpZiAoZXZlbnQucHJldmVudERlZmF1bHQpIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAvKiBBZGRpbmcgYSB3YWl0IGJlZm9yZSBlYWNoIHVzZXIgZXZlbnQgKi9cbiAgICBldmVudHMucHVzaChnZXRXYWl0RXZlbnQoKSk7XG5cbiAgICBsZXQgc3ludGhldGljRXZlbnQgPSB7XG4gICAgICAgIHR5cGU6IGV2ZW50LnR5cGUsXG4gICAgICAgIHdoaWNoOiBldmVudC53aGljaCxcbiAgICAgICAgcGF0aDogeHBhdGguZnJvbU5vZGUoZXZlbnQudGFyZ2V0LCBkb2N1bWVudClcbiAgICB9O1xuICAgIGV2ZW50cy5wdXNoKHN5bnRoZXRpY0V2ZW50KTtcblxuICAgIGlmICghZXZlbnQuaGFja3kpIHBsYXlFdmVudChzeW50aGV0aWNFdmVudCk7XG59O1xuXG5jb25zdCBoYW5kbGVIYWNrcyA9IChldmVudCkgPT4ge1xuICAgIC8qIFRoZSBrZXlwcmVzcyBldmVudCBkb2VzIG5vdCBjYXRjaCBiYWNrIHNwYWNlIGtleSAqL1xuICAgIGlmIChldmVudC50eXBlID09PSAna2V5ZG93bicgJiYgZXZlbnQud2hpY2ggPT09IDgpIGJhY2tzcGFjZUhhY2soZXZlbnQpO1xufTtcblxuY29uc3QgYmFja3NwYWNlSGFjayA9ICh7d2hpY2gsIHRhcmdldH0pID0+IHtcbiAgICBsZXQgY3VzdG9tRXZlbnQgPSB7XG4gICAgICAgIHR5cGU6ICdrZXlwcmVzcycsXG4gICAgICAgIHdoaWNoLFxuICAgICAgICB0YXJnZXQsXG4gICAgICAgIGhhY2t5OiB0cnVlXG4gICAgfTtcbiAgICByZWNvcmRFdmVudChjdXN0b21FdmVudCk7XG59O1xuXG5sZXQgbGFzdEV2ZW50VGltZXN0YW1wO1xuY29uc3QgZ2V0V2FpdEV2ZW50ID0gKCkgPT4ge1xuICAgIGxldCBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICBsZXQgZXZlbnQgPSB7XG4gICAgICAgIHR5cGU6ICd3YWl0JyxcbiAgICAgICAgLyogUmV0dXJuIHRpbWUgc2luY2UgbGFzdCBldmVudCAqL1xuICAgICAgICBkdXJhdGlvbjogKG5vdyAtIGxhc3RFdmVudFRpbWVzdGFtcCkgfHwgMFxuICAgIH07XG5cbiAgICBsYXN0RXZlbnRUaW1lc3RhbXAgPSBub3c7XG4gICAgcmV0dXJuIGV2ZW50O1xufTtcblxuY29uc3QgZ2V0RWxlbWVudCA9IChwYXRoKSA9PiB7XG4gICAgcmV0dXJuIHhwYXRoLnRvTm9kZShwYXRoLCBkb2N1bWVudCk7XG59O1xuXG4vKiBQbGF5IGFuIGV2ZW50ICovXG5jb25zdCBwbGF5RXZlbnQgPSAoZXZlbnQpID0+IHtcbiAgICAvLyBUT0RPOiBTaW1wbGlmeSB0aGlzIGZ1bmN0aW9uIHdpdGggYXN5bmMtYXdhaXRcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgIC8qXG4gICAgICAgICAqIERvbid0IHdhbnQgc3ludGhldGljIGV2ZW50cyB0byBiZSByZWNvcmRlZCB3aGlsZSB3aGVuIHdlIHBsYXkgdGhlbS5cbiAgICAgICAgICogV2Ugd2lsbCBlbmQgdXAgaW4gYW4gaW5maW5pdGUgbG9vcCBvdGhlcndpc2VcbiAgICAgICAgKi9cbiAgICAgICAgc3RvcFJlY29yZGluZygpO1xuXG4gICAgICAgIC8qXG4gICAgICAgICogQWxsIGV2ZW50cyByZXR1cm4gYSBwcm9taXNlIHdoaWNoIGlzIHJlc29sdmVkIGFmdGVyXG4gICAgICAgICogdGhlIGV2ZW50IGlzIGNvbXBsZXRlZC4gVXNlZnVsIGZvciB3YWl0IGV2ZW50c1xuICAgICAgICAqL1xuICAgICAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBsZXQgdHlwZSA9IGV2ZW50LnR5cGU7XG4gICAgICAgICAgICAvLyBUT0RPOiBDcmVhdGUgYW4gZXZlbnQgbWFwIGZvciBldmVudHNcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAnY2xpY2snKSBjbGljayhldmVudCwgcmVzb2x2ZSk7XG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ2RibGNsaWNrJykgZGJsY2xpY2soZXZlbnQsIHJlc29sdmUpO1xuICAgICAgICAgICAgZWxzZSBpZiAodHlwZSA9PT0gJ2tleXByZXNzJykga2V5cHJlc3MoZXZlbnQsIHJlc29sdmUpO1xuICAgICAgICAgICAgZWxzZSBpZiAodHlwZSA9PT0gJ3dhaXQnKSB3YWl0KGV2ZW50LCByZXNvbHZlKTtcbiAgICAgICAgICAgIGVsc2UgcmVqZWN0KG5ldyBFcnJvcignVW5rbm93biBldmVudCB0eXBlLiBDb3VsZCBub3QgcGxheScpKTtcbiAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvKiBSZS1hdHRhY2ggaGFuZGxlcnMgYWZ0ZXIgZXZlbnQgaXMgcGxheWVkICovXG4gICAgICAgICAgICByZXN1bWVSZWNvcmRpbmcoKTsgLy9UT0RPOiBEb24ndCBhdHRhY2ggaW4gcGxheWJhY2sgbW9kZVxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5cbi8qXG4gKiBTaW11bGF0ZSBldmVudHNcbiAqIEVhY2ggaGFuZGxlciBnZXRzIHRoZSBldmVudCBvYmplY3RcbiAqIGFuZCB0aGUgcmVzb2x2ZSBmdW5jdGlvbiBmb3IgaXQncyBwcm9taXNlXG4gKiByZXNvbHZlKCkgbXVzdCBiZSBjYWxsZWQgYXQgdGhlIGVuZCBvZiB0aGUgZnVuY3Rpb25cbiAqL1xuXG5jb25zdCBjbGljayA9ICh7cGF0aH0sIHJlc29sdmUpID0+IHtcbiAgICBsZXQgZWxlbWVudCA9IGdldEVsZW1lbnQocGF0aCk7XG4gICAgJChlbGVtZW50KS50cmlnZ2VyKCdjbGljaycpO1xuICAgIHJlc29sdmUoKTtcbn07XG5cbmNvbnN0IGRibGNsaWNrID0gKHtwYXRofSwgcmVzb2x2ZSkgPT4ge1xuICAgIGxldCBlbGVtZW50ID0gZ2V0RWxlbWVudChwYXRoKTtcbiAgICAkKGVsZW1lbnQpLnRyaWdnZXIoJ2RibGNsaWNrJyk7XG4gICAgcmVzb2x2ZSgpO1xufTtcblxuY29uc3Qga2V5cHJlc3MgPSAoe3BhdGgsIHdoaWNofSxyZXNvbHZlKSA9PiB7XG4gICAgbGV0IGVsZW1lbnQgPSBnZXRFbGVtZW50KHBhdGgpO1xuICAgIGxldCBjdXJyZW50VmFsdWUgPSAkKGVsZW1lbnQpLnZhbCgpO1xuICAgIGlmICh3aGljaCA9PT0gOCkge1xuICAgICAgICAvKiBNYW51YWxseSBoYW5kbGUgYmFja3NwYWNlICovXG4gICAgICAgICQoZWxlbWVudCkudmFsKGN1cnJlbnRWYWx1ZS5zdWJzdHJpbmcoMCwgY3VycmVudFZhbHVlLmxlbmd0aC0xKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGtleSA9IFN0cmluZy5mcm9tQ2hhckNvZGUod2hpY2gpO1xuICAgICAgICAvKiBNYW51YWxseSBhZGQgY2hhcmFjaHRlciAqL1xuICAgICAgICAkKGVsZW1lbnQpLnZhbChjdXJyZW50VmFsdWUgKyBrZXkpO1xuICAgIH1cbiAgICAvKiBUcmlnZ2VyIGV2ZW50ICovXG4gICAgJChlbGVtZW50KS50cmlnZ2VyKGpRdWVyeS5FdmVudCgna2V5ZG93bicsIHt3aGljaH0pKTtcbiAgICAkKGVsZW1lbnQpLnRyaWdnZXIoalF1ZXJ5LkV2ZW50KCdrZXl1cCcsIHt3aGljaH0pKTtcbiAgICByZXNvbHZlKCk7XG59O1xuXG5jb25zdCB3YWl0ID0gKHtkdXJhdGlvbn0sIHJlc29sdmUpID0+IHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHJlc29sdmUoKSwgZHVyYXRpb24pO1xufTtcblxuLyogUGxheSBhbGwgcmVjb3JkZWQgZXZlbnRzICovXG5jb25zdCBwbGF5ID0gKCkgPT4ge1xuICAgIGNvbnRyb2xzLnRvZ2dsZVBsYXlpbmdTdGF0ZSgpO1xuICAgIHBsYXlFdmVudHNSZWN1cnNpdmVseSgwKTtcbn1cblxuY29uc3Qgc2V0dXBQbGF5YmFjayA9ICgpID0+IHtcbiAgICBpZiAoaXNSZWNvcmRpbmcpIHRvZ2dsZVJlY29yZGluZygpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd2aHMtcGxheWJhY2snLCB0cnVlKTtcbiAgICBsb2NhdGlvbi5yZWxvYWQoKTtcbn07XG5cbmNvbnN0IGluaXRQbGF5YmFjayA9ICgpID0+IHtcbiAgICBldmVudHMgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd2aHMnKSkuZXZlbnRzO1xuICAgIHNpZGViYXIuc2hvdygpO1xuICAgIHNpZGViYXIucmVuZGVyKGV2ZW50cyk7XG4gICAgcGxheSgpO1xuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd2aHMtcGxheWJhY2snKTtcbn07XG5cbmNvbnN0IHBsYXlFdmVudHNSZWN1cnNpdmVseSA9IChpbmRleCkgPT4ge1xuICAgIGlmICghZXZlbnRzW2luZGV4XSkge1xuICAgICAgICBjb250cm9scy50b2dnbGVQbGF5aW5nU3RhdGUoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvKlxuICAgICAqIEl0J3MgdXNlZnVsIHRvIHJlLXJlbmRlciB0aGUgc2lkZWJhciBiZWNhdXNlXG4gICAgICogdGhlIGVsZW1lbnQgaW4gYW4gZXZlbnQgbWlnaHQgb25seSBlbnRlciB0aGUgRE9NXG4gICAgICogYWZ0ZXIgaXQncyBwcmV2aW91cyBldmVudC5cbiAgICAgKiBQYXNzaW5nIGxhc3QgZXZlbnQgaW5kZXggZm9yIG1hcmtpbmcgcHJvZ3Jlc3NcbiAgICAgKi9cbiAgICBzaWRlYmFyLnJlbmRlcihldmVudHMsIGluZGV4KTtcblxuICAgIC8qIFBsYXkgZXZlbnQgKi9cbiAgICBwbGF5RXZlbnQoZXZlbnRzW2luZGV4XSkudGhlbigoKSA9PiBwbGF5RXZlbnRzUmVjdXJzaXZlbHkoKytpbmRleCkpO1xufTtcblxubGV0IGlzUmVjb3JkaW5nID0gZmFsc2U7XG5jb25zdCB0b2dnbGVSZWNvcmRpbmcgPSAoKSA9PiB7XG4gICAgaWYgKGlzUmVjb3JkaW5nKSBzdG9wUmVjb3JkaW5nKCk7XG4gICAgZWxzZSByZWNvcmQoKTtcbiAgICBjb250cm9scy50b2dnbGVSZWNvcmRpbmdTdGF0ZSgpO1xufTtcblxuY29uc3QgcmVjb3JkID0gKCkgPT4ge1xuICAgIGV2ZW50cyA9IFtdO1xuICAgIHJlc3VtZVJlY29yZGluZygpO1xufTtcblxuY29uc3Qgc3RvcFJlY29yZGluZyA9ICgpID0+IHtcbiAgICBkZXRhY2hIYW5kbGVycygpO1xuICAgIGlzUmVjb3JkaW5nID0gZmFsc2U7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3ZocycsIEpTT04uc3RyaW5naWZ5KHtldmVudHN9KSk7XG59O1xuXG5jb25zdCByZXN1bWVSZWNvcmRpbmcgPSAoKSA9PiB7XG4gICAgYXR0YWNoSGFuZGxlcnMoKTtcbiAgICBpc1JlY29yZGluZyA9IHRydWU7XG59O1xuXG4kKCgpID0+IHtcbiAgICAvKiBFeHBvc2UgcHVibGljIGZ1bmN0aW9ucyAqL1xuICAgIHdpbmRvdy52aHMgPSB7XG4gICAgICAgIGV2ZW50cyxcbiAgICAgICAgdG9nZ2xlUmVjb3JkaW5nLFxuICAgICAgICBzZXR1cFBsYXliYWNrXG4gICAgfVxuICAgIHdyYXBCb2R5SW5SZWNvcmRhYmxlKCk7XG4gICAgY29udHJvbHMuc2hvdygpO1xuXG4gICAgbGV0IHBsYXliYWNrID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Zocy1wbGF5YmFjaycpO1xuICAgIGlmIChwbGF5YmFjaykgaW5pdFBsYXliYWNrKCk7XG59KTtcbiJdfQ==
