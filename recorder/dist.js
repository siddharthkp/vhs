(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global){
/* @preserve
 * The MIT License (MIT)
 * 
 * Copyright (c) 2013-2015 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
/**
 * bluebird build version 3.4.6
 * Features enabled: core, race, call_get, generators, map, nodeify, promisify, props, reduce, settle, some, using, timers, filter, any, each
*/
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Promise=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise) {
var SomePromiseArray = Promise._SomePromiseArray;
function any(promises) {
    var ret = new SomePromiseArray(promises);
    var promise = ret.promise();
    ret.setHowMany(1);
    ret.setUnwrap();
    ret.init();
    return promise;
}

Promise.any = function (promises) {
    return any(promises);
};

Promise.prototype.any = function () {
    return any(this);
};

};

},{}],2:[function(_dereq_,module,exports){
"use strict";
var firstLineError;
try {throw new Error(); } catch (e) {firstLineError = e;}
var schedule = _dereq_("./schedule");
var Queue = _dereq_("./queue");
var util = _dereq_("./util");

function Async() {
    this._customScheduler = false;
    this._isTickUsed = false;
    this._lateQueue = new Queue(16);
    this._normalQueue = new Queue(16);
    this._haveDrainedQueues = false;
    this._trampolineEnabled = true;
    var self = this;
    this.drainQueues = function () {
        self._drainQueues();
    };
    this._schedule = schedule;
}

Async.prototype.setScheduler = function(fn) {
    var prev = this._schedule;
    this._schedule = fn;
    this._customScheduler = true;
    return prev;
};

Async.prototype.hasCustomScheduler = function() {
    return this._customScheduler;
};

Async.prototype.enableTrampoline = function() {
    this._trampolineEnabled = true;
};

Async.prototype.disableTrampolineIfNecessary = function() {
    if (util.hasDevTools) {
        this._trampolineEnabled = false;
    }
};

Async.prototype.haveItemsQueued = function () {
    return this._isTickUsed || this._haveDrainedQueues;
};


Async.prototype.fatalError = function(e, isNode) {
    if (isNode) {
        process.stderr.write("Fatal " + (e instanceof Error ? e.stack : e) +
            "\n");
        process.exit(2);
    } else {
        this.throwLater(e);
    }
};

Async.prototype.throwLater = function(fn, arg) {
    if (arguments.length === 1) {
        arg = fn;
        fn = function () { throw arg; };
    }
    if (typeof setTimeout !== "undefined") {
        setTimeout(function() {
            fn(arg);
        }, 0);
    } else try {
        this._schedule(function() {
            fn(arg);
        });
    } catch (e) {
        throw new Error("No async scheduler available\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }
};

function AsyncInvokeLater(fn, receiver, arg) {
    this._lateQueue.push(fn, receiver, arg);
    this._queueTick();
}

function AsyncInvoke(fn, receiver, arg) {
    this._normalQueue.push(fn, receiver, arg);
    this._queueTick();
}

function AsyncSettlePromises(promise) {
    this._normalQueue._pushOne(promise);
    this._queueTick();
}

if (!util.hasDevTools) {
    Async.prototype.invokeLater = AsyncInvokeLater;
    Async.prototype.invoke = AsyncInvoke;
    Async.prototype.settlePromises = AsyncSettlePromises;
} else {
    Async.prototype.invokeLater = function (fn, receiver, arg) {
        if (this._trampolineEnabled) {
            AsyncInvokeLater.call(this, fn, receiver, arg);
        } else {
            this._schedule(function() {
                setTimeout(function() {
                    fn.call(receiver, arg);
                }, 100);
            });
        }
    };

    Async.prototype.invoke = function (fn, receiver, arg) {
        if (this._trampolineEnabled) {
            AsyncInvoke.call(this, fn, receiver, arg);
        } else {
            this._schedule(function() {
                fn.call(receiver, arg);
            });
        }
    };

    Async.prototype.settlePromises = function(promise) {
        if (this._trampolineEnabled) {
            AsyncSettlePromises.call(this, promise);
        } else {
            this._schedule(function() {
                promise._settlePromises();
            });
        }
    };
}

Async.prototype.invokeFirst = function (fn, receiver, arg) {
    this._normalQueue.unshift(fn, receiver, arg);
    this._queueTick();
};

Async.prototype._drainQueue = function(queue) {
    while (queue.length() > 0) {
        var fn = queue.shift();
        if (typeof fn !== "function") {
            fn._settlePromises();
            continue;
        }
        var receiver = queue.shift();
        var arg = queue.shift();
        fn.call(receiver, arg);
    }
};

Async.prototype._drainQueues = function () {
    this._drainQueue(this._normalQueue);
    this._reset();
    this._haveDrainedQueues = true;
    this._drainQueue(this._lateQueue);
};

Async.prototype._queueTick = function () {
    if (!this._isTickUsed) {
        this._isTickUsed = true;
        this._schedule(this.drainQueues);
    }
};

Async.prototype._reset = function () {
    this._isTickUsed = false;
};

module.exports = Async;
module.exports.firstLineError = firstLineError;

},{"./queue":26,"./schedule":29,"./util":36}],3:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL, tryConvertToPromise, debug) {
var calledBind = false;
var rejectThis = function(_, e) {
    this._reject(e);
};

var targetRejected = function(e, context) {
    context.promiseRejectionQueued = true;
    context.bindingPromise._then(rejectThis, rejectThis, null, this, e);
};

var bindingResolved = function(thisArg, context) {
    if (((this._bitField & 50397184) === 0)) {
        this._resolveCallback(context.target);
    }
};

var bindingRejected = function(e, context) {
    if (!context.promiseRejectionQueued) this._reject(e);
};

Promise.prototype.bind = function (thisArg) {
    if (!calledBind) {
        calledBind = true;
        Promise.prototype._propagateFrom = debug.propagateFromFunction();
        Promise.prototype._boundValue = debug.boundValueFunction();
    }
    var maybePromise = tryConvertToPromise(thisArg);
    var ret = new Promise(INTERNAL);
    ret._propagateFrom(this, 1);
    var target = this._target();
    ret._setBoundTo(maybePromise);
    if (maybePromise instanceof Promise) {
        var context = {
            promiseRejectionQueued: false,
            promise: ret,
            target: target,
            bindingPromise: maybePromise
        };
        target._then(INTERNAL, targetRejected, undefined, ret, context);
        maybePromise._then(
            bindingResolved, bindingRejected, undefined, ret, context);
        ret._setOnCancel(maybePromise);
    } else {
        ret._resolveCallback(target);
    }
    return ret;
};

Promise.prototype._setBoundTo = function (obj) {
    if (obj !== undefined) {
        this._bitField = this._bitField | 2097152;
        this._boundTo = obj;
    } else {
        this._bitField = this._bitField & (~2097152);
    }
};

Promise.prototype._isBound = function () {
    return (this._bitField & 2097152) === 2097152;
};

Promise.bind = function (thisArg, value) {
    return Promise.resolve(value).bind(thisArg);
};
};

},{}],4:[function(_dereq_,module,exports){
"use strict";
var old;
if (typeof Promise !== "undefined") old = Promise;
function noConflict() {
    try { if (Promise === bluebird) Promise = old; }
    catch (e) {}
    return bluebird;
}
var bluebird = _dereq_("./promise")();
bluebird.noConflict = noConflict;
module.exports = bluebird;

},{"./promise":22}],5:[function(_dereq_,module,exports){
"use strict";
var cr = Object.create;
if (cr) {
    var callerCache = cr(null);
    var getterCache = cr(null);
    callerCache[" size"] = getterCache[" size"] = 0;
}

module.exports = function(Promise) {
var util = _dereq_("./util");
var canEvaluate = util.canEvaluate;
var isIdentifier = util.isIdentifier;

var getMethodCaller;
var getGetter;
if (!true) {
var makeMethodCaller = function (methodName) {
    return new Function("ensureMethod", "                                    \n\
        return function(obj) {                                               \n\
            'use strict'                                                     \n\
            var len = this.length;                                           \n\
            ensureMethod(obj, 'methodName');                                 \n\
            switch(len) {                                                    \n\
                case 1: return obj.methodName(this[0]);                      \n\
                case 2: return obj.methodName(this[0], this[1]);             \n\
                case 3: return obj.methodName(this[0], this[1], this[2]);    \n\
                case 0: return obj.methodName();                             \n\
                default:                                                     \n\
                    return obj.methodName.apply(obj, this);                  \n\
            }                                                                \n\
        };                                                                   \n\
        ".replace(/methodName/g, methodName))(ensureMethod);
};

var makeGetter = function (propertyName) {
    return new Function("obj", "                                             \n\
        'use strict';                                                        \n\
        return obj.propertyName;                                             \n\
        ".replace("propertyName", propertyName));
};

var getCompiled = function(name, compiler, cache) {
    var ret = cache[name];
    if (typeof ret !== "function") {
        if (!isIdentifier(name)) {
            return null;
        }
        ret = compiler(name);
        cache[name] = ret;
        cache[" size"]++;
        if (cache[" size"] > 512) {
            var keys = Object.keys(cache);
            for (var i = 0; i < 256; ++i) delete cache[keys[i]];
            cache[" size"] = keys.length - 256;
        }
    }
    return ret;
};

getMethodCaller = function(name) {
    return getCompiled(name, makeMethodCaller, callerCache);
};

getGetter = function(name) {
    return getCompiled(name, makeGetter, getterCache);
};
}

function ensureMethod(obj, methodName) {
    var fn;
    if (obj != null) fn = obj[methodName];
    if (typeof fn !== "function") {
        var message = "Object " + util.classString(obj) + " has no method '" +
            util.toString(methodName) + "'";
        throw new Promise.TypeError(message);
    }
    return fn;
}

function caller(obj) {
    var methodName = this.pop();
    var fn = ensureMethod(obj, methodName);
    return fn.apply(obj, this);
}
Promise.prototype.call = function (methodName) {
    var args = [].slice.call(arguments, 1);;
    if (!true) {
        if (canEvaluate) {
            var maybeCaller = getMethodCaller(methodName);
            if (maybeCaller !== null) {
                return this._then(
                    maybeCaller, undefined, undefined, args, undefined);
            }
        }
    }
    args.push(methodName);
    return this._then(caller, undefined, undefined, args, undefined);
};

function namedGetter(obj) {
    return obj[this];
}
function indexedGetter(obj) {
    var index = +this;
    if (index < 0) index = Math.max(0, index + obj.length);
    return obj[index];
}
Promise.prototype.get = function (propertyName) {
    var isIndex = (typeof propertyName === "number");
    var getter;
    if (!isIndex) {
        if (canEvaluate) {
            var maybeGetter = getGetter(propertyName);
            getter = maybeGetter !== null ? maybeGetter : namedGetter;
        } else {
            getter = namedGetter;
        }
    } else {
        getter = indexedGetter;
    }
    return this._then(getter, undefined, undefined, propertyName, undefined);
};
};

},{"./util":36}],6:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, PromiseArray, apiRejection, debug) {
var util = _dereq_("./util");
var tryCatch = util.tryCatch;
var errorObj = util.errorObj;
var async = Promise._async;

Promise.prototype["break"] = Promise.prototype.cancel = function() {
    if (!debug.cancellation()) return this._warn("cancellation is disabled");

    var promise = this;
    var child = promise;
    while (promise._isCancellable()) {
        if (!promise._cancelBy(child)) {
            if (child._isFollowing()) {
                child._followee().cancel();
            } else {
                child._cancelBranched();
            }
            break;
        }

        var parent = promise._cancellationParent;
        if (parent == null || !parent._isCancellable()) {
            if (promise._isFollowing()) {
                promise._followee().cancel();
            } else {
                promise._cancelBranched();
            }
            break;
        } else {
            if (promise._isFollowing()) promise._followee().cancel();
            promise._setWillBeCancelled();
            child = promise;
            promise = parent;
        }
    }
};

Promise.prototype._branchHasCancelled = function() {
    this._branchesRemainingToCancel--;
};

Promise.prototype._enoughBranchesHaveCancelled = function() {
    return this._branchesRemainingToCancel === undefined ||
           this._branchesRemainingToCancel <= 0;
};

Promise.prototype._cancelBy = function(canceller) {
    if (canceller === this) {
        this._branchesRemainingToCancel = 0;
        this._invokeOnCancel();
        return true;
    } else {
        this._branchHasCancelled();
        if (this._enoughBranchesHaveCancelled()) {
            this._invokeOnCancel();
            return true;
        }
    }
    return false;
};

Promise.prototype._cancelBranched = function() {
    if (this._enoughBranchesHaveCancelled()) {
        this._cancel();
    }
};

Promise.prototype._cancel = function() {
    if (!this._isCancellable()) return;
    this._setCancelled();
    async.invoke(this._cancelPromises, this, undefined);
};

Promise.prototype._cancelPromises = function() {
    if (this._length() > 0) this._settlePromises();
};

Promise.prototype._unsetOnCancel = function() {
    this._onCancelField = undefined;
};

Promise.prototype._isCancellable = function() {
    return this.isPending() && !this._isCancelled();
};

Promise.prototype.isCancellable = function() {
    return this.isPending() && !this.isCancelled();
};

Promise.prototype._doInvokeOnCancel = function(onCancelCallback, internalOnly) {
    if (util.isArray(onCancelCallback)) {
        for (var i = 0; i < onCancelCallback.length; ++i) {
            this._doInvokeOnCancel(onCancelCallback[i], internalOnly);
        }
    } else if (onCancelCallback !== undefined) {
        if (typeof onCancelCallback === "function") {
            if (!internalOnly) {
                var e = tryCatch(onCancelCallback).call(this._boundValue());
                if (e === errorObj) {
                    this._attachExtraTrace(e.e);
                    async.throwLater(e.e);
                }
            }
        } else {
            onCancelCallback._resultCancelled(this);
        }
    }
};

Promise.prototype._invokeOnCancel = function() {
    var onCancelCallback = this._onCancel();
    this._unsetOnCancel();
    async.invoke(this._doInvokeOnCancel, this, onCancelCallback);
};

Promise.prototype._invokeInternalOnCancel = function() {
    if (this._isCancellable()) {
        this._doInvokeOnCancel(this._onCancel(), true);
        this._unsetOnCancel();
    }
};

Promise.prototype._resultCancelled = function() {
    this.cancel();
};

};

},{"./util":36}],7:[function(_dereq_,module,exports){
"use strict";
module.exports = function(NEXT_FILTER) {
var util = _dereq_("./util");
var getKeys = _dereq_("./es5").keys;
var tryCatch = util.tryCatch;
var errorObj = util.errorObj;

function catchFilter(instances, cb, promise) {
    return function(e) {
        var boundTo = promise._boundValue();
        predicateLoop: for (var i = 0; i < instances.length; ++i) {
            var item = instances[i];

            if (item === Error ||
                (item != null && item.prototype instanceof Error)) {
                if (e instanceof item) {
                    return tryCatch(cb).call(boundTo, e);
                }
            } else if (typeof item === "function") {
                var matchesPredicate = tryCatch(item).call(boundTo, e);
                if (matchesPredicate === errorObj) {
                    return matchesPredicate;
                } else if (matchesPredicate) {
                    return tryCatch(cb).call(boundTo, e);
                }
            } else if (util.isObject(e)) {
                var keys = getKeys(item);
                for (var j = 0; j < keys.length; ++j) {
                    var key = keys[j];
                    if (item[key] != e[key]) {
                        continue predicateLoop;
                    }
                }
                return tryCatch(cb).call(boundTo, e);
            }
        }
        return NEXT_FILTER;
    };
}

return catchFilter;
};

},{"./es5":13,"./util":36}],8:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise) {
var longStackTraces = false;
var contextStack = [];

Promise.prototype._promiseCreated = function() {};
Promise.prototype._pushContext = function() {};
Promise.prototype._popContext = function() {return null;};
Promise._peekContext = Promise.prototype._peekContext = function() {};

function Context() {
    this._trace = new Context.CapturedTrace(peekContext());
}
Context.prototype._pushContext = function () {
    if (this._trace !== undefined) {
        this._trace._promiseCreated = null;
        contextStack.push(this._trace);
    }
};

Context.prototype._popContext = function () {
    if (this._trace !== undefined) {
        var trace = contextStack.pop();
        var ret = trace._promiseCreated;
        trace._promiseCreated = null;
        return ret;
    }
    return null;
};

function createContext() {
    if (longStackTraces) return new Context();
}

function peekContext() {
    var lastIndex = contextStack.length - 1;
    if (lastIndex >= 0) {
        return contextStack[lastIndex];
    }
    return undefined;
}
Context.CapturedTrace = null;
Context.create = createContext;
Context.deactivateLongStackTraces = function() {};
Context.activateLongStackTraces = function() {
    var Promise_pushContext = Promise.prototype._pushContext;
    var Promise_popContext = Promise.prototype._popContext;
    var Promise_PeekContext = Promise._peekContext;
    var Promise_peekContext = Promise.prototype._peekContext;
    var Promise_promiseCreated = Promise.prototype._promiseCreated;
    Context.deactivateLongStackTraces = function() {
        Promise.prototype._pushContext = Promise_pushContext;
        Promise.prototype._popContext = Promise_popContext;
        Promise._peekContext = Promise_PeekContext;
        Promise.prototype._peekContext = Promise_peekContext;
        Promise.prototype._promiseCreated = Promise_promiseCreated;
        longStackTraces = false;
    };
    longStackTraces = true;
    Promise.prototype._pushContext = Context.prototype._pushContext;
    Promise.prototype._popContext = Context.prototype._popContext;
    Promise._peekContext = Promise.prototype._peekContext = peekContext;
    Promise.prototype._promiseCreated = function() {
        var ctx = this._peekContext();
        if (ctx && ctx._promiseCreated == null) ctx._promiseCreated = this;
    };
};
return Context;
};

},{}],9:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, Context) {
var getDomain = Promise._getDomain;
var async = Promise._async;
var Warning = _dereq_("./errors").Warning;
var util = _dereq_("./util");
var canAttachTrace = util.canAttachTrace;
var unhandledRejectionHandled;
var possiblyUnhandledRejection;
var bluebirdFramePattern =
    /[\\\/]bluebird[\\\/]js[\\\/](release|debug|instrumented)/;
var nodeFramePattern = /\((?:timers\.js):\d+:\d+\)/;
var parseLinePattern = /[\/<\(](.+?):(\d+):(\d+)\)?\s*$/;
var stackFramePattern = null;
var formatStack = null;
var indentStackFrames = false;
var printWarning;
var debugging = !!(util.env("BLUEBIRD_DEBUG") != 0 &&
                        (true ||
                         util.env("BLUEBIRD_DEBUG") ||
                         util.env("NODE_ENV") === "development"));

var warnings = !!(util.env("BLUEBIRD_WARNINGS") != 0 &&
    (debugging || util.env("BLUEBIRD_WARNINGS")));

var longStackTraces = !!(util.env("BLUEBIRD_LONG_STACK_TRACES") != 0 &&
    (debugging || util.env("BLUEBIRD_LONG_STACK_TRACES")));

var wForgottenReturn = util.env("BLUEBIRD_W_FORGOTTEN_RETURN") != 0 &&
    (warnings || !!util.env("BLUEBIRD_W_FORGOTTEN_RETURN"));

Promise.prototype.suppressUnhandledRejections = function() {
    var target = this._target();
    target._bitField = ((target._bitField & (~1048576)) |
                      524288);
};

Promise.prototype._ensurePossibleRejectionHandled = function () {
    if ((this._bitField & 524288) !== 0) return;
    this._setRejectionIsUnhandled();
    async.invokeLater(this._notifyUnhandledRejection, this, undefined);
};

Promise.prototype._notifyUnhandledRejectionIsHandled = function () {
    fireRejectionEvent("rejectionHandled",
                                  unhandledRejectionHandled, undefined, this);
};

Promise.prototype._setReturnedNonUndefined = function() {
    this._bitField = this._bitField | 268435456;
};

Promise.prototype._returnedNonUndefined = function() {
    return (this._bitField & 268435456) !== 0;
};

Promise.prototype._notifyUnhandledRejection = function () {
    if (this._isRejectionUnhandled()) {
        var reason = this._settledValue();
        this._setUnhandledRejectionIsNotified();
        fireRejectionEvent("unhandledRejection",
                                      possiblyUnhandledRejection, reason, this);
    }
};

Promise.prototype._setUnhandledRejectionIsNotified = function () {
    this._bitField = this._bitField | 262144;
};

Promise.prototype._unsetUnhandledRejectionIsNotified = function () {
    this._bitField = this._bitField & (~262144);
};

Promise.prototype._isUnhandledRejectionNotified = function () {
    return (this._bitField & 262144) > 0;
};

Promise.prototype._setRejectionIsUnhandled = function () {
    this._bitField = this._bitField | 1048576;
};

Promise.prototype._unsetRejectionIsUnhandled = function () {
    this._bitField = this._bitField & (~1048576);
    if (this._isUnhandledRejectionNotified()) {
        this._unsetUnhandledRejectionIsNotified();
        this._notifyUnhandledRejectionIsHandled();
    }
};

Promise.prototype._isRejectionUnhandled = function () {
    return (this._bitField & 1048576) > 0;
};

Promise.prototype._warn = function(message, shouldUseOwnTrace, promise) {
    return warn(message, shouldUseOwnTrace, promise || this);
};

Promise.onPossiblyUnhandledRejection = function (fn) {
    var domain = getDomain();
    possiblyUnhandledRejection =
        typeof fn === "function" ? (domain === null ?
                                            fn : util.domainBind(domain, fn))
                                 : undefined;
};

Promise.onUnhandledRejectionHandled = function (fn) {
    var domain = getDomain();
    unhandledRejectionHandled =
        typeof fn === "function" ? (domain === null ?
                                            fn : util.domainBind(domain, fn))
                                 : undefined;
};

var disableLongStackTraces = function() {};
Promise.longStackTraces = function () {
    if (async.haveItemsQueued() && !config.longStackTraces) {
        throw new Error("cannot enable long stack traces after promises have been created\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }
    if (!config.longStackTraces && longStackTracesIsSupported()) {
        var Promise_captureStackTrace = Promise.prototype._captureStackTrace;
        var Promise_attachExtraTrace = Promise.prototype._attachExtraTrace;
        config.longStackTraces = true;
        disableLongStackTraces = function() {
            if (async.haveItemsQueued() && !config.longStackTraces) {
                throw new Error("cannot enable long stack traces after promises have been created\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
            }
            Promise.prototype._captureStackTrace = Promise_captureStackTrace;
            Promise.prototype._attachExtraTrace = Promise_attachExtraTrace;
            Context.deactivateLongStackTraces();
            async.enableTrampoline();
            config.longStackTraces = false;
        };
        Promise.prototype._captureStackTrace = longStackTracesCaptureStackTrace;
        Promise.prototype._attachExtraTrace = longStackTracesAttachExtraTrace;
        Context.activateLongStackTraces();
        async.disableTrampolineIfNecessary();
    }
};

Promise.hasLongStackTraces = function () {
    return config.longStackTraces && longStackTracesIsSupported();
};

var fireDomEvent = (function() {
    try {
        if (typeof CustomEvent === "function") {
            var event = new CustomEvent("CustomEvent");
            util.global.dispatchEvent(event);
            return function(name, event) {
                var domEvent = new CustomEvent(name.toLowerCase(), {
                    detail: event,
                    cancelable: true
                });
                return !util.global.dispatchEvent(domEvent);
            };
        } else if (typeof Event === "function") {
            var event = new Event("CustomEvent");
            util.global.dispatchEvent(event);
            return function(name, event) {
                var domEvent = new Event(name.toLowerCase(), {
                    cancelable: true
                });
                domEvent.detail = event;
                return !util.global.dispatchEvent(domEvent);
            };
        } else {
            var event = document.createEvent("CustomEvent");
            event.initCustomEvent("testingtheevent", false, true, {});
            util.global.dispatchEvent(event);
            return function(name, event) {
                var domEvent = document.createEvent("CustomEvent");
                domEvent.initCustomEvent(name.toLowerCase(), false, true,
                    event);
                return !util.global.dispatchEvent(domEvent);
            };
        }
    } catch (e) {}
    return function() {
        return false;
    };
})();

var fireGlobalEvent = (function() {
    if (util.isNode) {
        return function() {
            return process.emit.apply(process, arguments);
        };
    } else {
        if (!util.global) {
            return function() {
                return false;
            };
        }
        return function(name) {
            var methodName = "on" + name.toLowerCase();
            var method = util.global[methodName];
            if (!method) return false;
            method.apply(util.global, [].slice.call(arguments, 1));
            return true;
        };
    }
})();

function generatePromiseLifecycleEventObject(name, promise) {
    return {promise: promise};
}

var eventToObjectGenerator = {
    promiseCreated: generatePromiseLifecycleEventObject,
    promiseFulfilled: generatePromiseLifecycleEventObject,
    promiseRejected: generatePromiseLifecycleEventObject,
    promiseResolved: generatePromiseLifecycleEventObject,
    promiseCancelled: generatePromiseLifecycleEventObject,
    promiseChained: function(name, promise, child) {
        return {promise: promise, child: child};
    },
    warning: function(name, warning) {
        return {warning: warning};
    },
    unhandledRejection: function (name, reason, promise) {
        return {reason: reason, promise: promise};
    },
    rejectionHandled: generatePromiseLifecycleEventObject
};

var activeFireEvent = function (name) {
    var globalEventFired = false;
    try {
        globalEventFired = fireGlobalEvent.apply(null, arguments);
    } catch (e) {
        async.throwLater(e);
        globalEventFired = true;
    }

    var domEventFired = false;
    try {
        domEventFired = fireDomEvent(name,
                    eventToObjectGenerator[name].apply(null, arguments));
    } catch (e) {
        async.throwLater(e);
        domEventFired = true;
    }

    return domEventFired || globalEventFired;
};

Promise.config = function(opts) {
    opts = Object(opts);
    if ("longStackTraces" in opts) {
        if (opts.longStackTraces) {
            Promise.longStackTraces();
        } else if (!opts.longStackTraces && Promise.hasLongStackTraces()) {
            disableLongStackTraces();
        }
    }
    if ("warnings" in opts) {
        var warningsOption = opts.warnings;
        config.warnings = !!warningsOption;
        wForgottenReturn = config.warnings;

        if (util.isObject(warningsOption)) {
            if ("wForgottenReturn" in warningsOption) {
                wForgottenReturn = !!warningsOption.wForgottenReturn;
            }
        }
    }
    if ("cancellation" in opts && opts.cancellation && !config.cancellation) {
        if (async.haveItemsQueued()) {
            throw new Error(
                "cannot enable cancellation after promises are in use");
        }
        Promise.prototype._clearCancellationData =
            cancellationClearCancellationData;
        Promise.prototype._propagateFrom = cancellationPropagateFrom;
        Promise.prototype._onCancel = cancellationOnCancel;
        Promise.prototype._setOnCancel = cancellationSetOnCancel;
        Promise.prototype._attachCancellationCallback =
            cancellationAttachCancellationCallback;
        Promise.prototype._execute = cancellationExecute;
        propagateFromFunction = cancellationPropagateFrom;
        config.cancellation = true;
    }
    if ("monitoring" in opts) {
        if (opts.monitoring && !config.monitoring) {
            config.monitoring = true;
            Promise.prototype._fireEvent = activeFireEvent;
        } else if (!opts.monitoring && config.monitoring) {
            config.monitoring = false;
            Promise.prototype._fireEvent = defaultFireEvent;
        }
    }
};

function defaultFireEvent() { return false; }

Promise.prototype._fireEvent = defaultFireEvent;
Promise.prototype._execute = function(executor, resolve, reject) {
    try {
        executor(resolve, reject);
    } catch (e) {
        return e;
    }
};
Promise.prototype._onCancel = function () {};
Promise.prototype._setOnCancel = function (handler) { ; };
Promise.prototype._attachCancellationCallback = function(onCancel) {
    ;
};
Promise.prototype._captureStackTrace = function () {};
Promise.prototype._attachExtraTrace = function () {};
Promise.prototype._clearCancellationData = function() {};
Promise.prototype._propagateFrom = function (parent, flags) {
    ;
    ;
};

function cancellationExecute(executor, resolve, reject) {
    var promise = this;
    try {
        executor(resolve, reject, function(onCancel) {
            if (typeof onCancel !== "function") {
                throw new TypeError("onCancel must be a function, got: " +
                                    util.toString(onCancel));
            }
            promise._attachCancellationCallback(onCancel);
        });
    } catch (e) {
        return e;
    }
}

function cancellationAttachCancellationCallback(onCancel) {
    if (!this._isCancellable()) return this;

    var previousOnCancel = this._onCancel();
    if (previousOnCancel !== undefined) {
        if (util.isArray(previousOnCancel)) {
            previousOnCancel.push(onCancel);
        } else {
            this._setOnCancel([previousOnCancel, onCancel]);
        }
    } else {
        this._setOnCancel(onCancel);
    }
}

function cancellationOnCancel() {
    return this._onCancelField;
}

function cancellationSetOnCancel(onCancel) {
    this._onCancelField = onCancel;
}

function cancellationClearCancellationData() {
    this._cancellationParent = undefined;
    this._onCancelField = undefined;
}

function cancellationPropagateFrom(parent, flags) {
    if ((flags & 1) !== 0) {
        this._cancellationParent = parent;
        var branchesRemainingToCancel = parent._branchesRemainingToCancel;
        if (branchesRemainingToCancel === undefined) {
            branchesRemainingToCancel = 0;
        }
        parent._branchesRemainingToCancel = branchesRemainingToCancel + 1;
    }
    if ((flags & 2) !== 0 && parent._isBound()) {
        this._setBoundTo(parent._boundTo);
    }
}

function bindingPropagateFrom(parent, flags) {
    if ((flags & 2) !== 0 && parent._isBound()) {
        this._setBoundTo(parent._boundTo);
    }
}
var propagateFromFunction = bindingPropagateFrom;

function boundValueFunction() {
    var ret = this._boundTo;
    if (ret !== undefined) {
        if (ret instanceof Promise) {
            if (ret.isFulfilled()) {
                return ret.value();
            } else {
                return undefined;
            }
        }
    }
    return ret;
}

function longStackTracesCaptureStackTrace() {
    this._trace = new CapturedTrace(this._peekContext());
}

function longStackTracesAttachExtraTrace(error, ignoreSelf) {
    if (canAttachTrace(error)) {
        var trace = this._trace;
        if (trace !== undefined) {
            if (ignoreSelf) trace = trace._parent;
        }
        if (trace !== undefined) {
            trace.attachExtraTrace(error);
        } else if (!error.__stackCleaned__) {
            var parsed = parseStackAndMessage(error);
            util.notEnumerableProp(error, "stack",
                parsed.message + "\n" + parsed.stack.join("\n"));
            util.notEnumerableProp(error, "__stackCleaned__", true);
        }
    }
}

function checkForgottenReturns(returnValue, promiseCreated, name, promise,
                               parent) {
    if (returnValue === undefined && promiseCreated !== null &&
        wForgottenReturn) {
        if (parent !== undefined && parent._returnedNonUndefined()) return;
        if ((promise._bitField & 65535) === 0) return;

        if (name) name = name + " ";
        var handlerLine = "";
        var creatorLine = "";
        if (promiseCreated._trace) {
            var traceLines = promiseCreated._trace.stack.split("\n");
            var stack = cleanStack(traceLines);
            for (var i = stack.length - 1; i >= 0; --i) {
                var line = stack[i];
                if (!nodeFramePattern.test(line)) {
                    var lineMatches = line.match(parseLinePattern);
                    if (lineMatches) {
                        handlerLine  = "at " + lineMatches[1] +
                            ":" + lineMatches[2] + ":" + lineMatches[3] + " ";
                    }
                    break;
                }
            }

            if (stack.length > 0) {
                var firstUserLine = stack[0];
                for (var i = 0; i < traceLines.length; ++i) {

                    if (traceLines[i] === firstUserLine) {
                        if (i > 0) {
                            creatorLine = "\n" + traceLines[i - 1];
                        }
                        break;
                    }
                }

            }
        }
        var msg = "a promise was created in a " + name +
            "handler " + handlerLine + "but was not returned from it, " +
            "see http://goo.gl/rRqMUw" +
            creatorLine;
        promise._warn(msg, true, promiseCreated);
    }
}

function deprecated(name, replacement) {
    var message = name +
        " is deprecated and will be removed in a future version.";
    if (replacement) message += " Use " + replacement + " instead.";
    return warn(message);
}

function warn(message, shouldUseOwnTrace, promise) {
    if (!config.warnings) return;
    var warning = new Warning(message);
    var ctx;
    if (shouldUseOwnTrace) {
        promise._attachExtraTrace(warning);
    } else if (config.longStackTraces && (ctx = Promise._peekContext())) {
        ctx.attachExtraTrace(warning);
    } else {
        var parsed = parseStackAndMessage(warning);
        warning.stack = parsed.message + "\n" + parsed.stack.join("\n");
    }

    if (!activeFireEvent("warning", warning)) {
        formatAndLogError(warning, "", true);
    }
}

function reconstructStack(message, stacks) {
    for (var i = 0; i < stacks.length - 1; ++i) {
        stacks[i].push("From previous event:");
        stacks[i] = stacks[i].join("\n");
    }
    if (i < stacks.length) {
        stacks[i] = stacks[i].join("\n");
    }
    return message + "\n" + stacks.join("\n");
}

function removeDuplicateOrEmptyJumps(stacks) {
    for (var i = 0; i < stacks.length; ++i) {
        if (stacks[i].length === 0 ||
            ((i + 1 < stacks.length) && stacks[i][0] === stacks[i+1][0])) {
            stacks.splice(i, 1);
            i--;
        }
    }
}

function removeCommonRoots(stacks) {
    var current = stacks[0];
    for (var i = 1; i < stacks.length; ++i) {
        var prev = stacks[i];
        var currentLastIndex = current.length - 1;
        var currentLastLine = current[currentLastIndex];
        var commonRootMeetPoint = -1;

        for (var j = prev.length - 1; j >= 0; --j) {
            if (prev[j] === currentLastLine) {
                commonRootMeetPoint = j;
                break;
            }
        }

        for (var j = commonRootMeetPoint; j >= 0; --j) {
            var line = prev[j];
            if (current[currentLastIndex] === line) {
                current.pop();
                currentLastIndex--;
            } else {
                break;
            }
        }
        current = prev;
    }
}

function cleanStack(stack) {
    var ret = [];
    for (var i = 0; i < stack.length; ++i) {
        var line = stack[i];
        var isTraceLine = "    (No stack trace)" === line ||
            stackFramePattern.test(line);
        var isInternalFrame = isTraceLine && shouldIgnore(line);
        if (isTraceLine && !isInternalFrame) {
            if (indentStackFrames && line.charAt(0) !== " ") {
                line = "    " + line;
            }
            ret.push(line);
        }
    }
    return ret;
}

function stackFramesAsArray(error) {
    var stack = error.stack.replace(/\s+$/g, "").split("\n");
    for (var i = 0; i < stack.length; ++i) {
        var line = stack[i];
        if ("    (No stack trace)" === line || stackFramePattern.test(line)) {
            break;
        }
    }
    if (i > 0) {
        stack = stack.slice(i);
    }
    return stack;
}

function parseStackAndMessage(error) {
    var stack = error.stack;
    var message = error.toString();
    stack = typeof stack === "string" && stack.length > 0
                ? stackFramesAsArray(error) : ["    (No stack trace)"];
    return {
        message: message,
        stack: cleanStack(stack)
    };
}

function formatAndLogError(error, title, isSoft) {
    if (typeof console !== "undefined") {
        var message;
        if (util.isObject(error)) {
            var stack = error.stack;
            message = title + formatStack(stack, error);
        } else {
            message = title + String(error);
        }
        if (typeof printWarning === "function") {
            printWarning(message, isSoft);
        } else if (typeof console.log === "function" ||
            typeof console.log === "object") {
            console.log(message);
        }
    }
}

function fireRejectionEvent(name, localHandler, reason, promise) {
    var localEventFired = false;
    try {
        if (typeof localHandler === "function") {
            localEventFired = true;
            if (name === "rejectionHandled") {
                localHandler(promise);
            } else {
                localHandler(reason, promise);
            }
        }
    } catch (e) {
        async.throwLater(e);
    }

    if (name === "unhandledRejection") {
        if (!activeFireEvent(name, reason, promise) && !localEventFired) {
            formatAndLogError(reason, "Unhandled rejection ");
        }
    } else {
        activeFireEvent(name, promise);
    }
}

function formatNonError(obj) {
    var str;
    if (typeof obj === "function") {
        str = "[function " +
            (obj.name || "anonymous") +
            "]";
    } else {
        str = obj && typeof obj.toString === "function"
            ? obj.toString() : util.toString(obj);
        var ruselessToString = /\[object [a-zA-Z0-9$_]+\]/;
        if (ruselessToString.test(str)) {
            try {
                var newStr = JSON.stringify(obj);
                str = newStr;
            }
            catch(e) {

            }
        }
        if (str.length === 0) {
            str = "(empty array)";
        }
    }
    return ("(<" + snip(str) + ">, no stack trace)");
}

function snip(str) {
    var maxChars = 41;
    if (str.length < maxChars) {
        return str;
    }
    return str.substr(0, maxChars - 3) + "...";
}

function longStackTracesIsSupported() {
    return typeof captureStackTrace === "function";
}

var shouldIgnore = function() { return false; };
var parseLineInfoRegex = /[\/<\(]([^:\/]+):(\d+):(?:\d+)\)?\s*$/;
function parseLineInfo(line) {
    var matches = line.match(parseLineInfoRegex);
    if (matches) {
        return {
            fileName: matches[1],
            line: parseInt(matches[2], 10)
        };
    }
}

function setBounds(firstLineError, lastLineError) {
    if (!longStackTracesIsSupported()) return;
    var firstStackLines = firstLineError.stack.split("\n");
    var lastStackLines = lastLineError.stack.split("\n");
    var firstIndex = -1;
    var lastIndex = -1;
    var firstFileName;
    var lastFileName;
    for (var i = 0; i < firstStackLines.length; ++i) {
        var result = parseLineInfo(firstStackLines[i]);
        if (result) {
            firstFileName = result.fileName;
            firstIndex = result.line;
            break;
        }
    }
    for (var i = 0; i < lastStackLines.length; ++i) {
        var result = parseLineInfo(lastStackLines[i]);
        if (result) {
            lastFileName = result.fileName;
            lastIndex = result.line;
            break;
        }
    }
    if (firstIndex < 0 || lastIndex < 0 || !firstFileName || !lastFileName ||
        firstFileName !== lastFileName || firstIndex >= lastIndex) {
        return;
    }

    shouldIgnore = function(line) {
        if (bluebirdFramePattern.test(line)) return true;
        var info = parseLineInfo(line);
        if (info) {
            if (info.fileName === firstFileName &&
                (firstIndex <= info.line && info.line <= lastIndex)) {
                return true;
            }
        }
        return false;
    };
}

function CapturedTrace(parent) {
    this._parent = parent;
    this._promisesCreated = 0;
    var length = this._length = 1 + (parent === undefined ? 0 : parent._length);
    captureStackTrace(this, CapturedTrace);
    if (length > 32) this.uncycle();
}
util.inherits(CapturedTrace, Error);
Context.CapturedTrace = CapturedTrace;

CapturedTrace.prototype.uncycle = function() {
    var length = this._length;
    if (length < 2) return;
    var nodes = [];
    var stackToIndex = {};

    for (var i = 0, node = this; node !== undefined; ++i) {
        nodes.push(node);
        node = node._parent;
    }
    length = this._length = i;
    for (var i = length - 1; i >= 0; --i) {
        var stack = nodes[i].stack;
        if (stackToIndex[stack] === undefined) {
            stackToIndex[stack] = i;
        }
    }
    for (var i = 0; i < length; ++i) {
        var currentStack = nodes[i].stack;
        var index = stackToIndex[currentStack];
        if (index !== undefined && index !== i) {
            if (index > 0) {
                nodes[index - 1]._parent = undefined;
                nodes[index - 1]._length = 1;
            }
            nodes[i]._parent = undefined;
            nodes[i]._length = 1;
            var cycleEdgeNode = i > 0 ? nodes[i - 1] : this;

            if (index < length - 1) {
                cycleEdgeNode._parent = nodes[index + 1];
                cycleEdgeNode._parent.uncycle();
                cycleEdgeNode._length =
                    cycleEdgeNode._parent._length + 1;
            } else {
                cycleEdgeNode._parent = undefined;
                cycleEdgeNode._length = 1;
            }
            var currentChildLength = cycleEdgeNode._length + 1;
            for (var j = i - 2; j >= 0; --j) {
                nodes[j]._length = currentChildLength;
                currentChildLength++;
            }
            return;
        }
    }
};

CapturedTrace.prototype.attachExtraTrace = function(error) {
    if (error.__stackCleaned__) return;
    this.uncycle();
    var parsed = parseStackAndMessage(error);
    var message = parsed.message;
    var stacks = [parsed.stack];

    var trace = this;
    while (trace !== undefined) {
        stacks.push(cleanStack(trace.stack.split("\n")));
        trace = trace._parent;
    }
    removeCommonRoots(stacks);
    removeDuplicateOrEmptyJumps(stacks);
    util.notEnumerableProp(error, "stack", reconstructStack(message, stacks));
    util.notEnumerableProp(error, "__stackCleaned__", true);
};

var captureStackTrace = (function stackDetection() {
    var v8stackFramePattern = /^\s*at\s*/;
    var v8stackFormatter = function(stack, error) {
        if (typeof stack === "string") return stack;

        if (error.name !== undefined &&
            error.message !== undefined) {
            return error.toString();
        }
        return formatNonError(error);
    };

    if (typeof Error.stackTraceLimit === "number" &&
        typeof Error.captureStackTrace === "function") {
        Error.stackTraceLimit += 6;
        stackFramePattern = v8stackFramePattern;
        formatStack = v8stackFormatter;
        var captureStackTrace = Error.captureStackTrace;

        shouldIgnore = function(line) {
            return bluebirdFramePattern.test(line);
        };
        return function(receiver, ignoreUntil) {
            Error.stackTraceLimit += 6;
            captureStackTrace(receiver, ignoreUntil);
            Error.stackTraceLimit -= 6;
        };
    }
    var err = new Error();

    if (typeof err.stack === "string" &&
        err.stack.split("\n")[0].indexOf("stackDetection@") >= 0) {
        stackFramePattern = /@/;
        formatStack = v8stackFormatter;
        indentStackFrames = true;
        return function captureStackTrace(o) {
            o.stack = new Error().stack;
        };
    }

    var hasStackAfterThrow;
    try { throw new Error(); }
    catch(e) {
        hasStackAfterThrow = ("stack" in e);
    }
    if (!("stack" in err) && hasStackAfterThrow &&
        typeof Error.stackTraceLimit === "number") {
        stackFramePattern = v8stackFramePattern;
        formatStack = v8stackFormatter;
        return function captureStackTrace(o) {
            Error.stackTraceLimit += 6;
            try { throw new Error(); }
            catch(e) { o.stack = e.stack; }
            Error.stackTraceLimit -= 6;
        };
    }

    formatStack = function(stack, error) {
        if (typeof stack === "string") return stack;

        if ((typeof error === "object" ||
            typeof error === "function") &&
            error.name !== undefined &&
            error.message !== undefined) {
            return error.toString();
        }
        return formatNonError(error);
    };

    return null;

})([]);

if (typeof console !== "undefined" && typeof console.warn !== "undefined") {
    printWarning = function (message) {
        console.warn(message);
    };
    if (util.isNode && process.stderr.isTTY) {
        printWarning = function(message, isSoft) {
            var color = isSoft ? "\u001b[33m" : "\u001b[31m";
            console.warn(color + message + "\u001b[0m\n");
        };
    } else if (!util.isNode && typeof (new Error().stack) === "string") {
        printWarning = function(message, isSoft) {
            console.warn("%c" + message,
                        isSoft ? "color: darkorange" : "color: red");
        };
    }
}

var config = {
    warnings: warnings,
    longStackTraces: false,
    cancellation: false,
    monitoring: false
};

if (longStackTraces) Promise.longStackTraces();

return {
    longStackTraces: function() {
        return config.longStackTraces;
    },
    warnings: function() {
        return config.warnings;
    },
    cancellation: function() {
        return config.cancellation;
    },
    monitoring: function() {
        return config.monitoring;
    },
    propagateFromFunction: function() {
        return propagateFromFunction;
    },
    boundValueFunction: function() {
        return boundValueFunction;
    },
    checkForgottenReturns: checkForgottenReturns,
    setBounds: setBounds,
    warn: warn,
    deprecated: deprecated,
    CapturedTrace: CapturedTrace,
    fireDomEvent: fireDomEvent,
    fireGlobalEvent: fireGlobalEvent
};
};

},{"./errors":12,"./util":36}],10:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise) {
function returner() {
    return this.value;
}
function thrower() {
    throw this.reason;
}

Promise.prototype["return"] =
Promise.prototype.thenReturn = function (value) {
    if (value instanceof Promise) value.suppressUnhandledRejections();
    return this._then(
        returner, undefined, undefined, {value: value}, undefined);
};

Promise.prototype["throw"] =
Promise.prototype.thenThrow = function (reason) {
    return this._then(
        thrower, undefined, undefined, {reason: reason}, undefined);
};

Promise.prototype.catchThrow = function (reason) {
    if (arguments.length <= 1) {
        return this._then(
            undefined, thrower, undefined, {reason: reason}, undefined);
    } else {
        var _reason = arguments[1];
        var handler = function() {throw _reason;};
        return this.caught(reason, handler);
    }
};

Promise.prototype.catchReturn = function (value) {
    if (arguments.length <= 1) {
        if (value instanceof Promise) value.suppressUnhandledRejections();
        return this._then(
            undefined, returner, undefined, {value: value}, undefined);
    } else {
        var _value = arguments[1];
        if (_value instanceof Promise) _value.suppressUnhandledRejections();
        var handler = function() {return _value;};
        return this.caught(value, handler);
    }
};
};

},{}],11:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL) {
var PromiseReduce = Promise.reduce;
var PromiseAll = Promise.all;

function promiseAllThis() {
    return PromiseAll(this);
}

function PromiseMapSeries(promises, fn) {
    return PromiseReduce(promises, fn, INTERNAL, INTERNAL);
}

Promise.prototype.each = function (fn) {
    return PromiseReduce(this, fn, INTERNAL, 0)
              ._then(promiseAllThis, undefined, undefined, this, undefined);
};

Promise.prototype.mapSeries = function (fn) {
    return PromiseReduce(this, fn, INTERNAL, INTERNAL);
};

Promise.each = function (promises, fn) {
    return PromiseReduce(promises, fn, INTERNAL, 0)
              ._then(promiseAllThis, undefined, undefined, promises, undefined);
};

Promise.mapSeries = PromiseMapSeries;
};


},{}],12:[function(_dereq_,module,exports){
"use strict";
var es5 = _dereq_("./es5");
var Objectfreeze = es5.freeze;
var util = _dereq_("./util");
var inherits = util.inherits;
var notEnumerableProp = util.notEnumerableProp;

function subError(nameProperty, defaultMessage) {
    function SubError(message) {
        if (!(this instanceof SubError)) return new SubError(message);
        notEnumerableProp(this, "message",
            typeof message === "string" ? message : defaultMessage);
        notEnumerableProp(this, "name", nameProperty);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        } else {
            Error.call(this);
        }
    }
    inherits(SubError, Error);
    return SubError;
}

var _TypeError, _RangeError;
var Warning = subError("Warning", "warning");
var CancellationError = subError("CancellationError", "cancellation error");
var TimeoutError = subError("TimeoutError", "timeout error");
var AggregateError = subError("AggregateError", "aggregate error");
try {
    _TypeError = TypeError;
    _RangeError = RangeError;
} catch(e) {
    _TypeError = subError("TypeError", "type error");
    _RangeError = subError("RangeError", "range error");
}

var methods = ("join pop push shift unshift slice filter forEach some " +
    "every map indexOf lastIndexOf reduce reduceRight sort reverse").split(" ");

for (var i = 0; i < methods.length; ++i) {
    if (typeof Array.prototype[methods[i]] === "function") {
        AggregateError.prototype[methods[i]] = Array.prototype[methods[i]];
    }
}

es5.defineProperty(AggregateError.prototype, "length", {
    value: 0,
    configurable: false,
    writable: true,
    enumerable: true
});
AggregateError.prototype["isOperational"] = true;
var level = 0;
AggregateError.prototype.toString = function() {
    var indent = Array(level * 4 + 1).join(" ");
    var ret = "\n" + indent + "AggregateError of:" + "\n";
    level++;
    indent = Array(level * 4 + 1).join(" ");
    for (var i = 0; i < this.length; ++i) {
        var str = this[i] === this ? "[Circular AggregateError]" : this[i] + "";
        var lines = str.split("\n");
        for (var j = 0; j < lines.length; ++j) {
            lines[j] = indent + lines[j];
        }
        str = lines.join("\n");
        ret += str + "\n";
    }
    level--;
    return ret;
};

function OperationalError(message) {
    if (!(this instanceof OperationalError))
        return new OperationalError(message);
    notEnumerableProp(this, "name", "OperationalError");
    notEnumerableProp(this, "message", message);
    this.cause = message;
    this["isOperational"] = true;

    if (message instanceof Error) {
        notEnumerableProp(this, "message", message.message);
        notEnumerableProp(this, "stack", message.stack);
    } else if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
    }

}
inherits(OperationalError, Error);

var errorTypes = Error["__BluebirdErrorTypes__"];
if (!errorTypes) {
    errorTypes = Objectfreeze({
        CancellationError: CancellationError,
        TimeoutError: TimeoutError,
        OperationalError: OperationalError,
        RejectionError: OperationalError,
        AggregateError: AggregateError
    });
    es5.defineProperty(Error, "__BluebirdErrorTypes__", {
        value: errorTypes,
        writable: false,
        enumerable: false,
        configurable: false
    });
}

module.exports = {
    Error: Error,
    TypeError: _TypeError,
    RangeError: _RangeError,
    CancellationError: errorTypes.CancellationError,
    OperationalError: errorTypes.OperationalError,
    TimeoutError: errorTypes.TimeoutError,
    AggregateError: errorTypes.AggregateError,
    Warning: Warning
};

},{"./es5":13,"./util":36}],13:[function(_dereq_,module,exports){
var isES5 = (function(){
    "use strict";
    return this === undefined;
})();

if (isES5) {
    module.exports = {
        freeze: Object.freeze,
        defineProperty: Object.defineProperty,
        getDescriptor: Object.getOwnPropertyDescriptor,
        keys: Object.keys,
        names: Object.getOwnPropertyNames,
        getPrototypeOf: Object.getPrototypeOf,
        isArray: Array.isArray,
        isES5: isES5,
        propertyIsWritable: function(obj, prop) {
            var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
            return !!(!descriptor || descriptor.writable || descriptor.set);
        }
    };
} else {
    var has = {}.hasOwnProperty;
    var str = {}.toString;
    var proto = {}.constructor.prototype;

    var ObjectKeys = function (o) {
        var ret = [];
        for (var key in o) {
            if (has.call(o, key)) {
                ret.push(key);
            }
        }
        return ret;
    };

    var ObjectGetDescriptor = function(o, key) {
        return {value: o[key]};
    };

    var ObjectDefineProperty = function (o, key, desc) {
        o[key] = desc.value;
        return o;
    };

    var ObjectFreeze = function (obj) {
        return obj;
    };

    var ObjectGetPrototypeOf = function (obj) {
        try {
            return Object(obj).constructor.prototype;
        }
        catch (e) {
            return proto;
        }
    };

    var ArrayIsArray = function (obj) {
        try {
            return str.call(obj) === "[object Array]";
        }
        catch(e) {
            return false;
        }
    };

    module.exports = {
        isArray: ArrayIsArray,
        keys: ObjectKeys,
        names: ObjectKeys,
        defineProperty: ObjectDefineProperty,
        getDescriptor: ObjectGetDescriptor,
        freeze: ObjectFreeze,
        getPrototypeOf: ObjectGetPrototypeOf,
        isES5: isES5,
        propertyIsWritable: function() {
            return true;
        }
    };
}

},{}],14:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL) {
var PromiseMap = Promise.map;

Promise.prototype.filter = function (fn, options) {
    return PromiseMap(this, fn, options, INTERNAL);
};

Promise.filter = function (promises, fn, options) {
    return PromiseMap(promises, fn, options, INTERNAL);
};
};

},{}],15:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, tryConvertToPromise) {
var util = _dereq_("./util");
var CancellationError = Promise.CancellationError;
var errorObj = util.errorObj;

function PassThroughHandlerContext(promise, type, handler) {
    this.promise = promise;
    this.type = type;
    this.handler = handler;
    this.called = false;
    this.cancelPromise = null;
}

PassThroughHandlerContext.prototype.isFinallyHandler = function() {
    return this.type === 0;
};

function FinallyHandlerCancelReaction(finallyHandler) {
    this.finallyHandler = finallyHandler;
}

FinallyHandlerCancelReaction.prototype._resultCancelled = function() {
    checkCancel(this.finallyHandler);
};

function checkCancel(ctx, reason) {
    if (ctx.cancelPromise != null) {
        if (arguments.length > 1) {
            ctx.cancelPromise._reject(reason);
        } else {
            ctx.cancelPromise._cancel();
        }
        ctx.cancelPromise = null;
        return true;
    }
    return false;
}

function succeed() {
    return finallyHandler.call(this, this.promise._target()._settledValue());
}
function fail(reason) {
    if (checkCancel(this, reason)) return;
    errorObj.e = reason;
    return errorObj;
}
function finallyHandler(reasonOrValue) {
    var promise = this.promise;
    var handler = this.handler;

    if (!this.called) {
        this.called = true;
        var ret = this.isFinallyHandler()
            ? handler.call(promise._boundValue())
            : handler.call(promise._boundValue(), reasonOrValue);
        if (ret !== undefined) {
            promise._setReturnedNonUndefined();
            var maybePromise = tryConvertToPromise(ret, promise);
            if (maybePromise instanceof Promise) {
                if (this.cancelPromise != null) {
                    if (maybePromise._isCancelled()) {
                        var reason =
                            new CancellationError("late cancellation observer");
                        promise._attachExtraTrace(reason);
                        errorObj.e = reason;
                        return errorObj;
                    } else if (maybePromise.isPending()) {
                        maybePromise._attachCancellationCallback(
                            new FinallyHandlerCancelReaction(this));
                    }
                }
                return maybePromise._then(
                    succeed, fail, undefined, this, undefined);
            }
        }
    }

    if (promise.isRejected()) {
        checkCancel(this);
        errorObj.e = reasonOrValue;
        return errorObj;
    } else {
        checkCancel(this);
        return reasonOrValue;
    }
}

Promise.prototype._passThrough = function(handler, type, success, fail) {
    if (typeof handler !== "function") return this.then();
    return this._then(success,
                      fail,
                      undefined,
                      new PassThroughHandlerContext(this, type, handler),
                      undefined);
};

Promise.prototype.lastly =
Promise.prototype["finally"] = function (handler) {
    return this._passThrough(handler,
                             0,
                             finallyHandler,
                             finallyHandler);
};

Promise.prototype.tap = function (handler) {
    return this._passThrough(handler, 1, finallyHandler);
};

return PassThroughHandlerContext;
};

},{"./util":36}],16:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise,
                          apiRejection,
                          INTERNAL,
                          tryConvertToPromise,
                          Proxyable,
                          debug) {
var errors = _dereq_("./errors");
var TypeError = errors.TypeError;
var util = _dereq_("./util");
var errorObj = util.errorObj;
var tryCatch = util.tryCatch;
var yieldHandlers = [];

function promiseFromYieldHandler(value, yieldHandlers, traceParent) {
    for (var i = 0; i < yieldHandlers.length; ++i) {
        traceParent._pushContext();
        var result = tryCatch(yieldHandlers[i])(value);
        traceParent._popContext();
        if (result === errorObj) {
            traceParent._pushContext();
            var ret = Promise.reject(errorObj.e);
            traceParent._popContext();
            return ret;
        }
        var maybePromise = tryConvertToPromise(result, traceParent);
        if (maybePromise instanceof Promise) return maybePromise;
    }
    return null;
}

function PromiseSpawn(generatorFunction, receiver, yieldHandler, stack) {
    if (debug.cancellation()) {
        var internal = new Promise(INTERNAL);
        var _finallyPromise = this._finallyPromise = new Promise(INTERNAL);
        this._promise = internal.lastly(function() {
            return _finallyPromise;
        });
        internal._captureStackTrace();
        internal._setOnCancel(this);
    } else {
        var promise = this._promise = new Promise(INTERNAL);
        promise._captureStackTrace();
    }
    this._stack = stack;
    this._generatorFunction = generatorFunction;
    this._receiver = receiver;
    this._generator = undefined;
    this._yieldHandlers = typeof yieldHandler === "function"
        ? [yieldHandler].concat(yieldHandlers)
        : yieldHandlers;
    this._yieldedPromise = null;
    this._cancellationPhase = false;
}
util.inherits(PromiseSpawn, Proxyable);

PromiseSpawn.prototype._isResolved = function() {
    return this._promise === null;
};

PromiseSpawn.prototype._cleanup = function() {
    this._promise = this._generator = null;
    if (debug.cancellation() && this._finallyPromise !== null) {
        this._finallyPromise._fulfill();
        this._finallyPromise = null;
    }
};

PromiseSpawn.prototype._promiseCancelled = function() {
    if (this._isResolved()) return;
    var implementsReturn = typeof this._generator["return"] !== "undefined";

    var result;
    if (!implementsReturn) {
        var reason = new Promise.CancellationError(
            "generator .return() sentinel");
        Promise.coroutine.returnSentinel = reason;
        this._promise._attachExtraTrace(reason);
        this._promise._pushContext();
        result = tryCatch(this._generator["throw"]).call(this._generator,
                                                         reason);
        this._promise._popContext();
    } else {
        this._promise._pushContext();
        result = tryCatch(this._generator["return"]).call(this._generator,
                                                          undefined);
        this._promise._popContext();
    }
    this._cancellationPhase = true;
    this._yieldedPromise = null;
    this._continue(result);
};

PromiseSpawn.prototype._promiseFulfilled = function(value) {
    this._yieldedPromise = null;
    this._promise._pushContext();
    var result = tryCatch(this._generator.next).call(this._generator, value);
    this._promise._popContext();
    this._continue(result);
};

PromiseSpawn.prototype._promiseRejected = function(reason) {
    this._yieldedPromise = null;
    this._promise._attachExtraTrace(reason);
    this._promise._pushContext();
    var result = tryCatch(this._generator["throw"])
        .call(this._generator, reason);
    this._promise._popContext();
    this._continue(result);
};

PromiseSpawn.prototype._resultCancelled = function() {
    if (this._yieldedPromise instanceof Promise) {
        var promise = this._yieldedPromise;
        this._yieldedPromise = null;
        promise.cancel();
    }
};

PromiseSpawn.prototype.promise = function () {
    return this._promise;
};

PromiseSpawn.prototype._run = function () {
    this._generator = this._generatorFunction.call(this._receiver);
    this._receiver =
        this._generatorFunction = undefined;
    this._promiseFulfilled(undefined);
};

PromiseSpawn.prototype._continue = function (result) {
    var promise = this._promise;
    if (result === errorObj) {
        this._cleanup();
        if (this._cancellationPhase) {
            return promise.cancel();
        } else {
            return promise._rejectCallback(result.e, false);
        }
    }

    var value = result.value;
    if (result.done === true) {
        this._cleanup();
        if (this._cancellationPhase) {
            return promise.cancel();
        } else {
            return promise._resolveCallback(value);
        }
    } else {
        var maybePromise = tryConvertToPromise(value, this._promise);
        if (!(maybePromise instanceof Promise)) {
            maybePromise =
                promiseFromYieldHandler(maybePromise,
                                        this._yieldHandlers,
                                        this._promise);
            if (maybePromise === null) {
                this._promiseRejected(
                    new TypeError(
                        "A value %s was yielded that could not be treated as a promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a\u000a".replace("%s", value) +
                        "From coroutine:\u000a" +
                        this._stack.split("\n").slice(1, -7).join("\n")
                    )
                );
                return;
            }
        }
        maybePromise = maybePromise._target();
        var bitField = maybePromise._bitField;
        ;
        if (((bitField & 50397184) === 0)) {
            this._yieldedPromise = maybePromise;
            maybePromise._proxy(this, null);
        } else if (((bitField & 33554432) !== 0)) {
            Promise._async.invoke(
                this._promiseFulfilled, this, maybePromise._value()
            );
        } else if (((bitField & 16777216) !== 0)) {
            Promise._async.invoke(
                this._promiseRejected, this, maybePromise._reason()
            );
        } else {
            this._promiseCancelled();
        }
    }
};

Promise.coroutine = function (generatorFunction, options) {
    if (typeof generatorFunction !== "function") {
        throw new TypeError("generatorFunction must be a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }
    var yieldHandler = Object(options).yieldHandler;
    var PromiseSpawn$ = PromiseSpawn;
    var stack = new Error().stack;
    return function () {
        var generator = generatorFunction.apply(this, arguments);
        var spawn = new PromiseSpawn$(undefined, undefined, yieldHandler,
                                      stack);
        var ret = spawn.promise();
        spawn._generator = generator;
        spawn._promiseFulfilled(undefined);
        return ret;
    };
};

Promise.coroutine.addYieldHandler = function(fn) {
    if (typeof fn !== "function") {
        throw new TypeError("expecting a function but got " + util.classString(fn));
    }
    yieldHandlers.push(fn);
};

Promise.spawn = function (generatorFunction) {
    debug.deprecated("Promise.spawn()", "Promise.coroutine()");
    if (typeof generatorFunction !== "function") {
        return apiRejection("generatorFunction must be a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }
    var spawn = new PromiseSpawn(generatorFunction, this);
    var ret = spawn.promise();
    spawn._run(Promise.spawn);
    return ret;
};
};

},{"./errors":12,"./util":36}],17:[function(_dereq_,module,exports){
"use strict";
module.exports =
function(Promise, PromiseArray, tryConvertToPromise, INTERNAL, async,
         getDomain) {
var util = _dereq_("./util");
var canEvaluate = util.canEvaluate;
var tryCatch = util.tryCatch;
var errorObj = util.errorObj;
var reject;

if (!true) {
if (canEvaluate) {
    var thenCallback = function(i) {
        return new Function("value", "holder", "                             \n\
            'use strict';                                                    \n\
            holder.pIndex = value;                                           \n\
            holder.checkFulfillment(this);                                   \n\
            ".replace(/Index/g, i));
    };

    var promiseSetter = function(i) {
        return new Function("promise", "holder", "                           \n\
            'use strict';                                                    \n\
            holder.pIndex = promise;                                         \n\
            ".replace(/Index/g, i));
    };

    var generateHolderClass = function(total) {
        var props = new Array(total);
        for (var i = 0; i < props.length; ++i) {
            props[i] = "this.p" + (i+1);
        }
        var assignment = props.join(" = ") + " = null;";
        var cancellationCode= "var promise;\n" + props.map(function(prop) {
            return "                                                         \n\
                promise = " + prop + ";                                      \n\
                if (promise instanceof Promise) {                            \n\
                    promise.cancel();                                        \n\
                }                                                            \n\
            ";
        }).join("\n");
        var passedArguments = props.join(", ");
        var name = "Holder$" + total;


        var code = "return function(tryCatch, errorObj, Promise, async) {    \n\
            'use strict';                                                    \n\
            function [TheName](fn) {                                         \n\
                [TheProperties]                                              \n\
                this.fn = fn;                                                \n\
                this.asyncNeeded = true;                                     \n\
                this.now = 0;                                                \n\
            }                                                                \n\
                                                                             \n\
            [TheName].prototype._callFunction = function(promise) {          \n\
                promise._pushContext();                                      \n\
                var ret = tryCatch(this.fn)([ThePassedArguments]);           \n\
                promise._popContext();                                       \n\
                if (ret === errorObj) {                                      \n\
                    promise._rejectCallback(ret.e, false);                   \n\
                } else {                                                     \n\
                    promise._resolveCallback(ret);                           \n\
                }                                                            \n\
            };                                                               \n\
                                                                             \n\
            [TheName].prototype.checkFulfillment = function(promise) {       \n\
                var now = ++this.now;                                        \n\
                if (now === [TheTotal]) {                                    \n\
                    if (this.asyncNeeded) {                                  \n\
                        async.invoke(this._callFunction, this, promise);     \n\
                    } else {                                                 \n\
                        this._callFunction(promise);                         \n\
                    }                                                        \n\
                                                                             \n\
                }                                                            \n\
            };                                                               \n\
                                                                             \n\
            [TheName].prototype._resultCancelled = function() {              \n\
                [CancellationCode]                                           \n\
            };                                                               \n\
                                                                             \n\
            return [TheName];                                                \n\
        }(tryCatch, errorObj, Promise, async);                               \n\
        ";

        code = code.replace(/\[TheName\]/g, name)
            .replace(/\[TheTotal\]/g, total)
            .replace(/\[ThePassedArguments\]/g, passedArguments)
            .replace(/\[TheProperties\]/g, assignment)
            .replace(/\[CancellationCode\]/g, cancellationCode);

        return new Function("tryCatch", "errorObj", "Promise", "async", code)
                           (tryCatch, errorObj, Promise, async);
    };

    var holderClasses = [];
    var thenCallbacks = [];
    var promiseSetters = [];

    for (var i = 0; i < 8; ++i) {
        holderClasses.push(generateHolderClass(i + 1));
        thenCallbacks.push(thenCallback(i + 1));
        promiseSetters.push(promiseSetter(i + 1));
    }

    reject = function (reason) {
        this._reject(reason);
    };
}}

Promise.join = function () {
    var last = arguments.length - 1;
    var fn;
    if (last > 0 && typeof arguments[last] === "function") {
        fn = arguments[last];
        if (!true) {
            if (last <= 8 && canEvaluate) {
                var ret = new Promise(INTERNAL);
                ret._captureStackTrace();
                var HolderClass = holderClasses[last - 1];
                var holder = new HolderClass(fn);
                var callbacks = thenCallbacks;

                for (var i = 0; i < last; ++i) {
                    var maybePromise = tryConvertToPromise(arguments[i], ret);
                    if (maybePromise instanceof Promise) {
                        maybePromise = maybePromise._target();
                        var bitField = maybePromise._bitField;
                        ;
                        if (((bitField & 50397184) === 0)) {
                            maybePromise._then(callbacks[i], reject,
                                               undefined, ret, holder);
                            promiseSetters[i](maybePromise, holder);
                            holder.asyncNeeded = false;
                        } else if (((bitField & 33554432) !== 0)) {
                            callbacks[i].call(ret,
                                              maybePromise._value(), holder);
                        } else if (((bitField & 16777216) !== 0)) {
                            ret._reject(maybePromise._reason());
                        } else {
                            ret._cancel();
                        }
                    } else {
                        callbacks[i].call(ret, maybePromise, holder);
                    }
                }

                if (!ret._isFateSealed()) {
                    if (holder.asyncNeeded) {
                        var domain = getDomain();
                        if (domain !== null) {
                            holder.fn = util.domainBind(domain, holder.fn);
                        }
                    }
                    ret._setAsyncGuaranteed();
                    ret._setOnCancel(holder);
                }
                return ret;
            }
        }
    }
    var args = [].slice.call(arguments);;
    if (fn) args.pop();
    var ret = new PromiseArray(args).promise();
    return fn !== undefined ? ret.spread(fn) : ret;
};

};

},{"./util":36}],18:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise,
                          PromiseArray,
                          apiRejection,
                          tryConvertToPromise,
                          INTERNAL,
                          debug) {
var getDomain = Promise._getDomain;
var util = _dereq_("./util");
var tryCatch = util.tryCatch;
var errorObj = util.errorObj;
var async = Promise._async;

function MappingPromiseArray(promises, fn, limit, _filter) {
    this.constructor$(promises);
    this._promise._captureStackTrace();
    var domain = getDomain();
    this._callback = domain === null ? fn : util.domainBind(domain, fn);
    this._preservedValues = _filter === INTERNAL
        ? new Array(this.length())
        : null;
    this._limit = limit;
    this._inFlight = 0;
    this._queue = [];
    async.invoke(this._asyncInit, this, undefined);
}
util.inherits(MappingPromiseArray, PromiseArray);

MappingPromiseArray.prototype._asyncInit = function() {
    this._init$(undefined, -2);
};

MappingPromiseArray.prototype._init = function () {};

MappingPromiseArray.prototype._promiseFulfilled = function (value, index) {
    var values = this._values;
    var length = this.length();
    var preservedValues = this._preservedValues;
    var limit = this._limit;

    if (index < 0) {
        index = (index * -1) - 1;
        values[index] = value;
        if (limit >= 1) {
            this._inFlight--;
            this._drainQueue();
            if (this._isResolved()) return true;
        }
    } else {
        if (limit >= 1 && this._inFlight >= limit) {
            values[index] = value;
            this._queue.push(index);
            return false;
        }
        if (preservedValues !== null) preservedValues[index] = value;

        var promise = this._promise;
        var callback = this._callback;
        var receiver = promise._boundValue();
        promise._pushContext();
        var ret = tryCatch(callback).call(receiver, value, index, length);
        var promiseCreated = promise._popContext();
        debug.checkForgottenReturns(
            ret,
            promiseCreated,
            preservedValues !== null ? "Promise.filter" : "Promise.map",
            promise
        );
        if (ret === errorObj) {
            this._reject(ret.e);
            return true;
        }

        var maybePromise = tryConvertToPromise(ret, this._promise);
        if (maybePromise instanceof Promise) {
            maybePromise = maybePromise._target();
            var bitField = maybePromise._bitField;
            ;
            if (((bitField & 50397184) === 0)) {
                if (limit >= 1) this._inFlight++;
                values[index] = maybePromise;
                maybePromise._proxy(this, (index + 1) * -1);
                return false;
            } else if (((bitField & 33554432) !== 0)) {
                ret = maybePromise._value();
            } else if (((bitField & 16777216) !== 0)) {
                this._reject(maybePromise._reason());
                return true;
            } else {
                this._cancel();
                return true;
            }
        }
        values[index] = ret;
    }
    var totalResolved = ++this._totalResolved;
    if (totalResolved >= length) {
        if (preservedValues !== null) {
            this._filter(values, preservedValues);
        } else {
            this._resolve(values);
        }
        return true;
    }
    return false;
};

MappingPromiseArray.prototype._drainQueue = function () {
    var queue = this._queue;
    var limit = this._limit;
    var values = this._values;
    while (queue.length > 0 && this._inFlight < limit) {
        if (this._isResolved()) return;
        var index = queue.pop();
        this._promiseFulfilled(values[index], index);
    }
};

MappingPromiseArray.prototype._filter = function (booleans, values) {
    var len = values.length;
    var ret = new Array(len);
    var j = 0;
    for (var i = 0; i < len; ++i) {
        if (booleans[i]) ret[j++] = values[i];
    }
    ret.length = j;
    this._resolve(ret);
};

MappingPromiseArray.prototype.preservedValues = function () {
    return this._preservedValues;
};

function map(promises, fn, options, _filter) {
    if (typeof fn !== "function") {
        return apiRejection("expecting a function but got " + util.classString(fn));
    }

    var limit = 0;
    if (options !== undefined) {
        if (typeof options === "object" && options !== null) {
            if (typeof options.concurrency !== "number") {
                return Promise.reject(
                    new TypeError("'concurrency' must be a number but it is " +
                                    util.classString(options.concurrency)));
            }
            limit = options.concurrency;
        } else {
            return Promise.reject(new TypeError(
                            "options argument must be an object but it is " +
                             util.classString(options)));
        }
    }
    limit = typeof limit === "number" &&
        isFinite(limit) && limit >= 1 ? limit : 0;
    return new MappingPromiseArray(promises, fn, limit, _filter).promise();
}

Promise.prototype.map = function (fn, options) {
    return map(this, fn, options, null);
};

Promise.map = function (promises, fn, options, _filter) {
    return map(promises, fn, options, _filter);
};


};

},{"./util":36}],19:[function(_dereq_,module,exports){
"use strict";
module.exports =
function(Promise, INTERNAL, tryConvertToPromise, apiRejection, debug) {
var util = _dereq_("./util");
var tryCatch = util.tryCatch;

Promise.method = function (fn) {
    if (typeof fn !== "function") {
        throw new Promise.TypeError("expecting a function but got " + util.classString(fn));
    }
    return function () {
        var ret = new Promise(INTERNAL);
        ret._captureStackTrace();
        ret._pushContext();
        var value = tryCatch(fn).apply(this, arguments);
        var promiseCreated = ret._popContext();
        debug.checkForgottenReturns(
            value, promiseCreated, "Promise.method", ret);
        ret._resolveFromSyncValue(value);
        return ret;
    };
};

Promise.attempt = Promise["try"] = function (fn) {
    if (typeof fn !== "function") {
        return apiRejection("expecting a function but got " + util.classString(fn));
    }
    var ret = new Promise(INTERNAL);
    ret._captureStackTrace();
    ret._pushContext();
    var value;
    if (arguments.length > 1) {
        debug.deprecated("calling Promise.try with more than 1 argument");
        var arg = arguments[1];
        var ctx = arguments[2];
        value = util.isArray(arg) ? tryCatch(fn).apply(ctx, arg)
                                  : tryCatch(fn).call(ctx, arg);
    } else {
        value = tryCatch(fn)();
    }
    var promiseCreated = ret._popContext();
    debug.checkForgottenReturns(
        value, promiseCreated, "Promise.try", ret);
    ret._resolveFromSyncValue(value);
    return ret;
};

Promise.prototype._resolveFromSyncValue = function (value) {
    if (value === util.errorObj) {
        this._rejectCallback(value.e, false);
    } else {
        this._resolveCallback(value, true);
    }
};
};

},{"./util":36}],20:[function(_dereq_,module,exports){
"use strict";
var util = _dereq_("./util");
var maybeWrapAsError = util.maybeWrapAsError;
var errors = _dereq_("./errors");
var OperationalError = errors.OperationalError;
var es5 = _dereq_("./es5");

function isUntypedError(obj) {
    return obj instanceof Error &&
        es5.getPrototypeOf(obj) === Error.prototype;
}

var rErrorKey = /^(?:name|message|stack|cause)$/;
function wrapAsOperationalError(obj) {
    var ret;
    if (isUntypedError(obj)) {
        ret = new OperationalError(obj);
        ret.name = obj.name;
        ret.message = obj.message;
        ret.stack = obj.stack;
        var keys = es5.keys(obj);
        for (var i = 0; i < keys.length; ++i) {
            var key = keys[i];
            if (!rErrorKey.test(key)) {
                ret[key] = obj[key];
            }
        }
        return ret;
    }
    util.markAsOriginatingFromRejection(obj);
    return obj;
}

function nodebackForPromise(promise, multiArgs) {
    return function(err, value) {
        if (promise === null) return;
        if (err) {
            var wrapped = wrapAsOperationalError(maybeWrapAsError(err));
            promise._attachExtraTrace(wrapped);
            promise._reject(wrapped);
        } else if (!multiArgs) {
            promise._fulfill(value);
        } else {
            var args = [].slice.call(arguments, 1);;
            promise._fulfill(args);
        }
        promise = null;
    };
}

module.exports = nodebackForPromise;

},{"./errors":12,"./es5":13,"./util":36}],21:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise) {
var util = _dereq_("./util");
var async = Promise._async;
var tryCatch = util.tryCatch;
var errorObj = util.errorObj;

function spreadAdapter(val, nodeback) {
    var promise = this;
    if (!util.isArray(val)) return successAdapter.call(promise, val, nodeback);
    var ret =
        tryCatch(nodeback).apply(promise._boundValue(), [null].concat(val));
    if (ret === errorObj) {
        async.throwLater(ret.e);
    }
}

function successAdapter(val, nodeback) {
    var promise = this;
    var receiver = promise._boundValue();
    var ret = val === undefined
        ? tryCatch(nodeback).call(receiver, null)
        : tryCatch(nodeback).call(receiver, null, val);
    if (ret === errorObj) {
        async.throwLater(ret.e);
    }
}
function errorAdapter(reason, nodeback) {
    var promise = this;
    if (!reason) {
        var newReason = new Error(reason + "");
        newReason.cause = reason;
        reason = newReason;
    }
    var ret = tryCatch(nodeback).call(promise._boundValue(), reason);
    if (ret === errorObj) {
        async.throwLater(ret.e);
    }
}

Promise.prototype.asCallback = Promise.prototype.nodeify = function (nodeback,
                                                                     options) {
    if (typeof nodeback == "function") {
        var adapter = successAdapter;
        if (options !== undefined && Object(options).spread) {
            adapter = spreadAdapter;
        }
        this._then(
            adapter,
            errorAdapter,
            undefined,
            this,
            nodeback
        );
    }
    return this;
};
};

},{"./util":36}],22:[function(_dereq_,module,exports){
"use strict";
module.exports = function() {
var makeSelfResolutionError = function () {
    return new TypeError("circular promise resolution chain\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
};
var reflectHandler = function() {
    return new Promise.PromiseInspection(this._target());
};
var apiRejection = function(msg) {
    return Promise.reject(new TypeError(msg));
};
function Proxyable() {}
var UNDEFINED_BINDING = {};
var util = _dereq_("./util");

var getDomain;
if (util.isNode) {
    getDomain = function() {
        var ret = process.domain;
        if (ret === undefined) ret = null;
        return ret;
    };
} else {
    getDomain = function() {
        return null;
    };
}
util.notEnumerableProp(Promise, "_getDomain", getDomain);

var es5 = _dereq_("./es5");
var Async = _dereq_("./async");
var async = new Async();
es5.defineProperty(Promise, "_async", {value: async});
var errors = _dereq_("./errors");
var TypeError = Promise.TypeError = errors.TypeError;
Promise.RangeError = errors.RangeError;
var CancellationError = Promise.CancellationError = errors.CancellationError;
Promise.TimeoutError = errors.TimeoutError;
Promise.OperationalError = errors.OperationalError;
Promise.RejectionError = errors.OperationalError;
Promise.AggregateError = errors.AggregateError;
var INTERNAL = function(){};
var APPLY = {};
var NEXT_FILTER = {};
var tryConvertToPromise = _dereq_("./thenables")(Promise, INTERNAL);
var PromiseArray =
    _dereq_("./promise_array")(Promise, INTERNAL,
                               tryConvertToPromise, apiRejection, Proxyable);
var Context = _dereq_("./context")(Promise);
 /*jshint unused:false*/
var createContext = Context.create;
var debug = _dereq_("./debuggability")(Promise, Context);
var CapturedTrace = debug.CapturedTrace;
var PassThroughHandlerContext =
    _dereq_("./finally")(Promise, tryConvertToPromise);
var catchFilter = _dereq_("./catch_filter")(NEXT_FILTER);
var nodebackForPromise = _dereq_("./nodeback");
var errorObj = util.errorObj;
var tryCatch = util.tryCatch;
function check(self, executor) {
    if (typeof executor !== "function") {
        throw new TypeError("expecting a function but got " + util.classString(executor));
    }
    if (self.constructor !== Promise) {
        throw new TypeError("the promise constructor cannot be invoked directly\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }
}

function Promise(executor) {
    this._bitField = 0;
    this._fulfillmentHandler0 = undefined;
    this._rejectionHandler0 = undefined;
    this._promise0 = undefined;
    this._receiver0 = undefined;
    if (executor !== INTERNAL) {
        check(this, executor);
        this._resolveFromExecutor(executor);
    }
    this._promiseCreated();
    this._fireEvent("promiseCreated", this);
}

Promise.prototype.toString = function () {
    return "[object Promise]";
};

Promise.prototype.caught = Promise.prototype["catch"] = function (fn) {
    var len = arguments.length;
    if (len > 1) {
        var catchInstances = new Array(len - 1),
            j = 0, i;
        for (i = 0; i < len - 1; ++i) {
            var item = arguments[i];
            if (util.isObject(item)) {
                catchInstances[j++] = item;
            } else {
                return apiRejection("expecting an object but got " +
                    "A catch statement predicate " + util.classString(item));
            }
        }
        catchInstances.length = j;
        fn = arguments[i];
        return this.then(undefined, catchFilter(catchInstances, fn, this));
    }
    return this.then(undefined, fn);
};

Promise.prototype.reflect = function () {
    return this._then(reflectHandler,
        reflectHandler, undefined, this, undefined);
};

Promise.prototype.then = function (didFulfill, didReject) {
    if (debug.warnings() && arguments.length > 0 &&
        typeof didFulfill !== "function" &&
        typeof didReject !== "function") {
        var msg = ".then() only accepts functions but was passed: " +
                util.classString(didFulfill);
        if (arguments.length > 1) {
            msg += ", " + util.classString(didReject);
        }
        this._warn(msg);
    }
    return this._then(didFulfill, didReject, undefined, undefined, undefined);
};

Promise.prototype.done = function (didFulfill, didReject) {
    var promise =
        this._then(didFulfill, didReject, undefined, undefined, undefined);
    promise._setIsFinal();
};

Promise.prototype.spread = function (fn) {
    if (typeof fn !== "function") {
        return apiRejection("expecting a function but got " + util.classString(fn));
    }
    return this.all()._then(fn, undefined, undefined, APPLY, undefined);
};

Promise.prototype.toJSON = function () {
    var ret = {
        isFulfilled: false,
        isRejected: false,
        fulfillmentValue: undefined,
        rejectionReason: undefined
    };
    if (this.isFulfilled()) {
        ret.fulfillmentValue = this.value();
        ret.isFulfilled = true;
    } else if (this.isRejected()) {
        ret.rejectionReason = this.reason();
        ret.isRejected = true;
    }
    return ret;
};

Promise.prototype.all = function () {
    if (arguments.length > 0) {
        this._warn(".all() was passed arguments but it does not take any");
    }
    return new PromiseArray(this).promise();
};

Promise.prototype.error = function (fn) {
    return this.caught(util.originatesFromRejection, fn);
};

Promise.getNewLibraryCopy = module.exports;

Promise.is = function (val) {
    return val instanceof Promise;
};

Promise.fromNode = Promise.fromCallback = function(fn) {
    var ret = new Promise(INTERNAL);
    ret._captureStackTrace();
    var multiArgs = arguments.length > 1 ? !!Object(arguments[1]).multiArgs
                                         : false;
    var result = tryCatch(fn)(nodebackForPromise(ret, multiArgs));
    if (result === errorObj) {
        ret._rejectCallback(result.e, true);
    }
    if (!ret._isFateSealed()) ret._setAsyncGuaranteed();
    return ret;
};

Promise.all = function (promises) {
    return new PromiseArray(promises).promise();
};

Promise.cast = function (obj) {
    var ret = tryConvertToPromise(obj);
    if (!(ret instanceof Promise)) {
        ret = new Promise(INTERNAL);
        ret._captureStackTrace();
        ret._setFulfilled();
        ret._rejectionHandler0 = obj;
    }
    return ret;
};

Promise.resolve = Promise.fulfilled = Promise.cast;

Promise.reject = Promise.rejected = function (reason) {
    var ret = new Promise(INTERNAL);
    ret._captureStackTrace();
    ret._rejectCallback(reason, true);
    return ret;
};

Promise.setScheduler = function(fn) {
    if (typeof fn !== "function") {
        throw new TypeError("expecting a function but got " + util.classString(fn));
    }
    return async.setScheduler(fn);
};

Promise.prototype._then = function (
    didFulfill,
    didReject,
    _,    receiver,
    internalData
) {
    var haveInternalData = internalData !== undefined;
    var promise = haveInternalData ? internalData : new Promise(INTERNAL);
    var target = this._target();
    var bitField = target._bitField;

    if (!haveInternalData) {
        promise._propagateFrom(this, 3);
        promise._captureStackTrace();
        if (receiver === undefined &&
            ((this._bitField & 2097152) !== 0)) {
            if (!((bitField & 50397184) === 0)) {
                receiver = this._boundValue();
            } else {
                receiver = target === this ? undefined : this._boundTo;
            }
        }
        this._fireEvent("promiseChained", this, promise);
    }

    var domain = getDomain();
    if (!((bitField & 50397184) === 0)) {
        var handler, value, settler = target._settlePromiseCtx;
        if (((bitField & 33554432) !== 0)) {
            value = target._rejectionHandler0;
            handler = didFulfill;
        } else if (((bitField & 16777216) !== 0)) {
            value = target._fulfillmentHandler0;
            handler = didReject;
            target._unsetRejectionIsUnhandled();
        } else {
            settler = target._settlePromiseLateCancellationObserver;
            value = new CancellationError("late cancellation observer");
            target._attachExtraTrace(value);
            handler = didReject;
        }

        async.invoke(settler, target, {
            handler: domain === null ? handler
                : (typeof handler === "function" &&
                    util.domainBind(domain, handler)),
            promise: promise,
            receiver: receiver,
            value: value
        });
    } else {
        target._addCallbacks(didFulfill, didReject, promise, receiver, domain);
    }

    return promise;
};

Promise.prototype._length = function () {
    return this._bitField & 65535;
};

Promise.prototype._isFateSealed = function () {
    return (this._bitField & 117506048) !== 0;
};

Promise.prototype._isFollowing = function () {
    return (this._bitField & 67108864) === 67108864;
};

Promise.prototype._setLength = function (len) {
    this._bitField = (this._bitField & -65536) |
        (len & 65535);
};

Promise.prototype._setFulfilled = function () {
    this._bitField = this._bitField | 33554432;
    this._fireEvent("promiseFulfilled", this);
};

Promise.prototype._setRejected = function () {
    this._bitField = this._bitField | 16777216;
    this._fireEvent("promiseRejected", this);
};

Promise.prototype._setFollowing = function () {
    this._bitField = this._bitField | 67108864;
    this._fireEvent("promiseResolved", this);
};

Promise.prototype._setIsFinal = function () {
    this._bitField = this._bitField | 4194304;
};

Promise.prototype._isFinal = function () {
    return (this._bitField & 4194304) > 0;
};

Promise.prototype._unsetCancelled = function() {
    this._bitField = this._bitField & (~65536);
};

Promise.prototype._setCancelled = function() {
    this._bitField = this._bitField | 65536;
    this._fireEvent("promiseCancelled", this);
};

Promise.prototype._setWillBeCancelled = function() {
    this._bitField = this._bitField | 8388608;
};

Promise.prototype._setAsyncGuaranteed = function() {
    if (async.hasCustomScheduler()) return;
    this._bitField = this._bitField | 134217728;
};

Promise.prototype._receiverAt = function (index) {
    var ret = index === 0 ? this._receiver0 : this[
            index * 4 - 4 + 3];
    if (ret === UNDEFINED_BINDING) {
        return undefined;
    } else if (ret === undefined && this._isBound()) {
        return this._boundValue();
    }
    return ret;
};

Promise.prototype._promiseAt = function (index) {
    return this[
            index * 4 - 4 + 2];
};

Promise.prototype._fulfillmentHandlerAt = function (index) {
    return this[
            index * 4 - 4 + 0];
};

Promise.prototype._rejectionHandlerAt = function (index) {
    return this[
            index * 4 - 4 + 1];
};

Promise.prototype._boundValue = function() {};

Promise.prototype._migrateCallback0 = function (follower) {
    var bitField = follower._bitField;
    var fulfill = follower._fulfillmentHandler0;
    var reject = follower._rejectionHandler0;
    var promise = follower._promise0;
    var receiver = follower._receiverAt(0);
    if (receiver === undefined) receiver = UNDEFINED_BINDING;
    this._addCallbacks(fulfill, reject, promise, receiver, null);
};

Promise.prototype._migrateCallbackAt = function (follower, index) {
    var fulfill = follower._fulfillmentHandlerAt(index);
    var reject = follower._rejectionHandlerAt(index);
    var promise = follower._promiseAt(index);
    var receiver = follower._receiverAt(index);
    if (receiver === undefined) receiver = UNDEFINED_BINDING;
    this._addCallbacks(fulfill, reject, promise, receiver, null);
};

Promise.prototype._addCallbacks = function (
    fulfill,
    reject,
    promise,
    receiver,
    domain
) {
    var index = this._length();

    if (index >= 65535 - 4) {
        index = 0;
        this._setLength(0);
    }

    if (index === 0) {
        this._promise0 = promise;
        this._receiver0 = receiver;
        if (typeof fulfill === "function") {
            this._fulfillmentHandler0 =
                domain === null ? fulfill : util.domainBind(domain, fulfill);
        }
        if (typeof reject === "function") {
            this._rejectionHandler0 =
                domain === null ? reject : util.domainBind(domain, reject);
        }
    } else {
        var base = index * 4 - 4;
        this[base + 2] = promise;
        this[base + 3] = receiver;
        if (typeof fulfill === "function") {
            this[base + 0] =
                domain === null ? fulfill : util.domainBind(domain, fulfill);
        }
        if (typeof reject === "function") {
            this[base + 1] =
                domain === null ? reject : util.domainBind(domain, reject);
        }
    }
    this._setLength(index + 1);
    return index;
};

Promise.prototype._proxy = function (proxyable, arg) {
    this._addCallbacks(undefined, undefined, arg, proxyable, null);
};

Promise.prototype._resolveCallback = function(value, shouldBind) {
    if (((this._bitField & 117506048) !== 0)) return;
    if (value === this)
        return this._rejectCallback(makeSelfResolutionError(), false);
    var maybePromise = tryConvertToPromise(value, this);
    if (!(maybePromise instanceof Promise)) return this._fulfill(value);

    if (shouldBind) this._propagateFrom(maybePromise, 2);

    var promise = maybePromise._target();

    if (promise === this) {
        this._reject(makeSelfResolutionError());
        return;
    }

    var bitField = promise._bitField;
    if (((bitField & 50397184) === 0)) {
        var len = this._length();
        if (len > 0) promise._migrateCallback0(this);
        for (var i = 1; i < len; ++i) {
            promise._migrateCallbackAt(this, i);
        }
        this._setFollowing();
        this._setLength(0);
        this._setFollowee(promise);
    } else if (((bitField & 33554432) !== 0)) {
        this._fulfill(promise._value());
    } else if (((bitField & 16777216) !== 0)) {
        this._reject(promise._reason());
    } else {
        var reason = new CancellationError("late cancellation observer");
        promise._attachExtraTrace(reason);
        this._reject(reason);
    }
};

Promise.prototype._rejectCallback =
function(reason, synchronous, ignoreNonErrorWarnings) {
    var trace = util.ensureErrorObject(reason);
    var hasStack = trace === reason;
    if (!hasStack && !ignoreNonErrorWarnings && debug.warnings()) {
        var message = "a promise was rejected with a non-error: " +
            util.classString(reason);
        this._warn(message, true);
    }
    this._attachExtraTrace(trace, synchronous ? hasStack : false);
    this._reject(reason);
};

Promise.prototype._resolveFromExecutor = function (executor) {
    var promise = this;
    this._captureStackTrace();
    this._pushContext();
    var synchronous = true;
    var r = this._execute(executor, function(value) {
        promise._resolveCallback(value);
    }, function (reason) {
        promise._rejectCallback(reason, synchronous);
    });
    synchronous = false;
    this._popContext();

    if (r !== undefined) {
        promise._rejectCallback(r, true);
    }
};

Promise.prototype._settlePromiseFromHandler = function (
    handler, receiver, value, promise
) {
    var bitField = promise._bitField;
    if (((bitField & 65536) !== 0)) return;
    promise._pushContext();
    var x;
    if (receiver === APPLY) {
        if (!value || typeof value.length !== "number") {
            x = errorObj;
            x.e = new TypeError("cannot .spread() a non-array: " +
                                    util.classString(value));
        } else {
            x = tryCatch(handler).apply(this._boundValue(), value);
        }
    } else {
        x = tryCatch(handler).call(receiver, value);
    }
    var promiseCreated = promise._popContext();
    bitField = promise._bitField;
    if (((bitField & 65536) !== 0)) return;

    if (x === NEXT_FILTER) {
        promise._reject(value);
    } else if (x === errorObj) {
        promise._rejectCallback(x.e, false);
    } else {
        debug.checkForgottenReturns(x, promiseCreated, "",  promise, this);
        promise._resolveCallback(x);
    }
};

Promise.prototype._target = function() {
    var ret = this;
    while (ret._isFollowing()) ret = ret._followee();
    return ret;
};

Promise.prototype._followee = function() {
    return this._rejectionHandler0;
};

Promise.prototype._setFollowee = function(promise) {
    this._rejectionHandler0 = promise;
};

Promise.prototype._settlePromise = function(promise, handler, receiver, value) {
    var isPromise = promise instanceof Promise;
    var bitField = this._bitField;
    var asyncGuaranteed = ((bitField & 134217728) !== 0);
    if (((bitField & 65536) !== 0)) {
        if (isPromise) promise._invokeInternalOnCancel();

        if (receiver instanceof PassThroughHandlerContext &&
            receiver.isFinallyHandler()) {
            receiver.cancelPromise = promise;
            if (tryCatch(handler).call(receiver, value) === errorObj) {
                promise._reject(errorObj.e);
            }
        } else if (handler === reflectHandler) {
            promise._fulfill(reflectHandler.call(receiver));
        } else if (receiver instanceof Proxyable) {
            receiver._promiseCancelled(promise);
        } else if (isPromise || promise instanceof PromiseArray) {
            promise._cancel();
        } else {
            receiver.cancel();
        }
    } else if (typeof handler === "function") {
        if (!isPromise) {
            handler.call(receiver, value, promise);
        } else {
            if (asyncGuaranteed) promise._setAsyncGuaranteed();
            this._settlePromiseFromHandler(handler, receiver, value, promise);
        }
    } else if (receiver instanceof Proxyable) {
        if (!receiver._isResolved()) {
            if (((bitField & 33554432) !== 0)) {
                receiver._promiseFulfilled(value, promise);
            } else {
                receiver._promiseRejected(value, promise);
            }
        }
    } else if (isPromise) {
        if (asyncGuaranteed) promise._setAsyncGuaranteed();
        if (((bitField & 33554432) !== 0)) {
            promise._fulfill(value);
        } else {
            promise._reject(value);
        }
    }
};

Promise.prototype._settlePromiseLateCancellationObserver = function(ctx) {
    var handler = ctx.handler;
    var promise = ctx.promise;
    var receiver = ctx.receiver;
    var value = ctx.value;
    if (typeof handler === "function") {
        if (!(promise instanceof Promise)) {
            handler.call(receiver, value, promise);
        } else {
            this._settlePromiseFromHandler(handler, receiver, value, promise);
        }
    } else if (promise instanceof Promise) {
        promise._reject(value);
    }
};

Promise.prototype._settlePromiseCtx = function(ctx) {
    this._settlePromise(ctx.promise, ctx.handler, ctx.receiver, ctx.value);
};

Promise.prototype._settlePromise0 = function(handler, value, bitField) {
    var promise = this._promise0;
    var receiver = this._receiverAt(0);
    this._promise0 = undefined;
    this._receiver0 = undefined;
    this._settlePromise(promise, handler, receiver, value);
};

Promise.prototype._clearCallbackDataAtIndex = function(index) {
    var base = index * 4 - 4;
    this[base + 2] =
    this[base + 3] =
    this[base + 0] =
    this[base + 1] = undefined;
};

Promise.prototype._fulfill = function (value) {
    var bitField = this._bitField;
    if (((bitField & 117506048) >>> 16)) return;
    if (value === this) {
        var err = makeSelfResolutionError();
        this._attachExtraTrace(err);
        return this._reject(err);
    }
    this._setFulfilled();
    this._rejectionHandler0 = value;

    if ((bitField & 65535) > 0) {
        if (((bitField & 134217728) !== 0)) {
            this._settlePromises();
        } else {
            async.settlePromises(this);
        }
    }
};

Promise.prototype._reject = function (reason) {
    var bitField = this._bitField;
    if (((bitField & 117506048) >>> 16)) return;
    this._setRejected();
    this._fulfillmentHandler0 = reason;

    if (this._isFinal()) {
        return async.fatalError(reason, util.isNode);
    }

    if ((bitField & 65535) > 0) {
        async.settlePromises(this);
    } else {
        this._ensurePossibleRejectionHandled();
    }
};

Promise.prototype._fulfillPromises = function (len, value) {
    for (var i = 1; i < len; i++) {
        var handler = this._fulfillmentHandlerAt(i);
        var promise = this._promiseAt(i);
        var receiver = this._receiverAt(i);
        this._clearCallbackDataAtIndex(i);
        this._settlePromise(promise, handler, receiver, value);
    }
};

Promise.prototype._rejectPromises = function (len, reason) {
    for (var i = 1; i < len; i++) {
        var handler = this._rejectionHandlerAt(i);
        var promise = this._promiseAt(i);
        var receiver = this._receiverAt(i);
        this._clearCallbackDataAtIndex(i);
        this._settlePromise(promise, handler, receiver, reason);
    }
};

Promise.prototype._settlePromises = function () {
    var bitField = this._bitField;
    var len = (bitField & 65535);

    if (len > 0) {
        if (((bitField & 16842752) !== 0)) {
            var reason = this._fulfillmentHandler0;
            this._settlePromise0(this._rejectionHandler0, reason, bitField);
            this._rejectPromises(len, reason);
        } else {
            var value = this._rejectionHandler0;
            this._settlePromise0(this._fulfillmentHandler0, value, bitField);
            this._fulfillPromises(len, value);
        }
        this._setLength(0);
    }
    this._clearCancellationData();
};

Promise.prototype._settledValue = function() {
    var bitField = this._bitField;
    if (((bitField & 33554432) !== 0)) {
        return this._rejectionHandler0;
    } else if (((bitField & 16777216) !== 0)) {
        return this._fulfillmentHandler0;
    }
};

function deferResolve(v) {this.promise._resolveCallback(v);}
function deferReject(v) {this.promise._rejectCallback(v, false);}

Promise.defer = Promise.pending = function() {
    debug.deprecated("Promise.defer", "new Promise");
    var promise = new Promise(INTERNAL);
    return {
        promise: promise,
        resolve: deferResolve,
        reject: deferReject
    };
};

util.notEnumerableProp(Promise,
                       "_makeSelfResolutionError",
                       makeSelfResolutionError);

_dereq_("./method")(Promise, INTERNAL, tryConvertToPromise, apiRejection,
    debug);
_dereq_("./bind")(Promise, INTERNAL, tryConvertToPromise, debug);
_dereq_("./cancel")(Promise, PromiseArray, apiRejection, debug);
_dereq_("./direct_resolve")(Promise);
_dereq_("./synchronous_inspection")(Promise);
_dereq_("./join")(
    Promise, PromiseArray, tryConvertToPromise, INTERNAL, async, getDomain);
Promise.Promise = Promise;
Promise.version = "3.4.6";
_dereq_('./map.js')(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug);
_dereq_('./call_get.js')(Promise);
_dereq_('./using.js')(Promise, apiRejection, tryConvertToPromise, createContext, INTERNAL, debug);
_dereq_('./timers.js')(Promise, INTERNAL, debug);
_dereq_('./generators.js')(Promise, apiRejection, INTERNAL, tryConvertToPromise, Proxyable, debug);
_dereq_('./nodeify.js')(Promise);
_dereq_('./promisify.js')(Promise, INTERNAL);
_dereq_('./props.js')(Promise, PromiseArray, tryConvertToPromise, apiRejection);
_dereq_('./race.js')(Promise, INTERNAL, tryConvertToPromise, apiRejection);
_dereq_('./reduce.js')(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug);
_dereq_('./settle.js')(Promise, PromiseArray, debug);
_dereq_('./some.js')(Promise, PromiseArray, apiRejection);
_dereq_('./filter.js')(Promise, INTERNAL);
_dereq_('./each.js')(Promise, INTERNAL);
_dereq_('./any.js')(Promise);
                                                         
    util.toFastProperties(Promise);                                          
    util.toFastProperties(Promise.prototype);                                
    function fillTypes(value) {                                              
        var p = new Promise(INTERNAL);                                       
        p._fulfillmentHandler0 = value;                                      
        p._rejectionHandler0 = value;                                        
        p._promise0 = value;                                                 
        p._receiver0 = value;                                                
    }                                                                        
    // Complete slack tracking, opt out of field-type tracking and           
    // stabilize map                                                         
    fillTypes({a: 1});                                                       
    fillTypes({b: 2});                                                       
    fillTypes({c: 3});                                                       
    fillTypes(1);                                                            
    fillTypes(function(){});                                                 
    fillTypes(undefined);                                                    
    fillTypes(false);                                                        
    fillTypes(new Promise(INTERNAL));                                        
    debug.setBounds(Async.firstLineError, util.lastLineError);               
    return Promise;                                                          

};

},{"./any.js":1,"./async":2,"./bind":3,"./call_get.js":5,"./cancel":6,"./catch_filter":7,"./context":8,"./debuggability":9,"./direct_resolve":10,"./each.js":11,"./errors":12,"./es5":13,"./filter.js":14,"./finally":15,"./generators.js":16,"./join":17,"./map.js":18,"./method":19,"./nodeback":20,"./nodeify.js":21,"./promise_array":23,"./promisify.js":24,"./props.js":25,"./race.js":27,"./reduce.js":28,"./settle.js":30,"./some.js":31,"./synchronous_inspection":32,"./thenables":33,"./timers.js":34,"./using.js":35,"./util":36}],23:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL, tryConvertToPromise,
    apiRejection, Proxyable) {
var util = _dereq_("./util");
var isArray = util.isArray;

function toResolutionValue(val) {
    switch(val) {
    case -2: return [];
    case -3: return {};
    }
}

function PromiseArray(values) {
    var promise = this._promise = new Promise(INTERNAL);
    if (values instanceof Promise) {
        promise._propagateFrom(values, 3);
    }
    promise._setOnCancel(this);
    this._values = values;
    this._length = 0;
    this._totalResolved = 0;
    this._init(undefined, -2);
}
util.inherits(PromiseArray, Proxyable);

PromiseArray.prototype.length = function () {
    return this._length;
};

PromiseArray.prototype.promise = function () {
    return this._promise;
};

PromiseArray.prototype._init = function init(_, resolveValueIfEmpty) {
    var values = tryConvertToPromise(this._values, this._promise);
    if (values instanceof Promise) {
        values = values._target();
        var bitField = values._bitField;
        ;
        this._values = values;

        if (((bitField & 50397184) === 0)) {
            this._promise._setAsyncGuaranteed();
            return values._then(
                init,
                this._reject,
                undefined,
                this,
                resolveValueIfEmpty
           );
        } else if (((bitField & 33554432) !== 0)) {
            values = values._value();
        } else if (((bitField & 16777216) !== 0)) {
            return this._reject(values._reason());
        } else {
            return this._cancel();
        }
    }
    values = util.asArray(values);
    if (values === null) {
        var err = apiRejection(
            "expecting an array or an iterable object but got " + util.classString(values)).reason();
        this._promise._rejectCallback(err, false);
        return;
    }

    if (values.length === 0) {
        if (resolveValueIfEmpty === -5) {
            this._resolveEmptyArray();
        }
        else {
            this._resolve(toResolutionValue(resolveValueIfEmpty));
        }
        return;
    }
    this._iterate(values);
};

PromiseArray.prototype._iterate = function(values) {
    var len = this.getActualLength(values.length);
    this._length = len;
    this._values = this.shouldCopyValues() ? new Array(len) : this._values;
    var result = this._promise;
    var isResolved = false;
    var bitField = null;
    for (var i = 0; i < len; ++i) {
        var maybePromise = tryConvertToPromise(values[i], result);

        if (maybePromise instanceof Promise) {
            maybePromise = maybePromise._target();
            bitField = maybePromise._bitField;
        } else {
            bitField = null;
        }

        if (isResolved) {
            if (bitField !== null) {
                maybePromise.suppressUnhandledRejections();
            }
        } else if (bitField !== null) {
            if (((bitField & 50397184) === 0)) {
                maybePromise._proxy(this, i);
                this._values[i] = maybePromise;
            } else if (((bitField & 33554432) !== 0)) {
                isResolved = this._promiseFulfilled(maybePromise._value(), i);
            } else if (((bitField & 16777216) !== 0)) {
                isResolved = this._promiseRejected(maybePromise._reason(), i);
            } else {
                isResolved = this._promiseCancelled(i);
            }
        } else {
            isResolved = this._promiseFulfilled(maybePromise, i);
        }
    }
    if (!isResolved) result._setAsyncGuaranteed();
};

PromiseArray.prototype._isResolved = function () {
    return this._values === null;
};

PromiseArray.prototype._resolve = function (value) {
    this._values = null;
    this._promise._fulfill(value);
};

PromiseArray.prototype._cancel = function() {
    if (this._isResolved() || !this._promise._isCancellable()) return;
    this._values = null;
    this._promise._cancel();
};

PromiseArray.prototype._reject = function (reason) {
    this._values = null;
    this._promise._rejectCallback(reason, false);
};

PromiseArray.prototype._promiseFulfilled = function (value, index) {
    this._values[index] = value;
    var totalResolved = ++this._totalResolved;
    if (totalResolved >= this._length) {
        this._resolve(this._values);
        return true;
    }
    return false;
};

PromiseArray.prototype._promiseCancelled = function() {
    this._cancel();
    return true;
};

PromiseArray.prototype._promiseRejected = function (reason) {
    this._totalResolved++;
    this._reject(reason);
    return true;
};

PromiseArray.prototype._resultCancelled = function() {
    if (this._isResolved()) return;
    var values = this._values;
    this._cancel();
    if (values instanceof Promise) {
        values.cancel();
    } else {
        for (var i = 0; i < values.length; ++i) {
            if (values[i] instanceof Promise) {
                values[i].cancel();
            }
        }
    }
};

PromiseArray.prototype.shouldCopyValues = function () {
    return true;
};

PromiseArray.prototype.getActualLength = function (len) {
    return len;
};

return PromiseArray;
};

},{"./util":36}],24:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL) {
var THIS = {};
var util = _dereq_("./util");
var nodebackForPromise = _dereq_("./nodeback");
var withAppended = util.withAppended;
var maybeWrapAsError = util.maybeWrapAsError;
var canEvaluate = util.canEvaluate;
var TypeError = _dereq_("./errors").TypeError;
var defaultSuffix = "Async";
var defaultPromisified = {__isPromisified__: true};
var noCopyProps = [
    "arity",    "length",
    "name",
    "arguments",
    "caller",
    "callee",
    "prototype",
    "__isPromisified__"
];
var noCopyPropsPattern = new RegExp("^(?:" + noCopyProps.join("|") + ")$");

var defaultFilter = function(name) {
    return util.isIdentifier(name) &&
        name.charAt(0) !== "_" &&
        name !== "constructor";
};

function propsFilter(key) {
    return !noCopyPropsPattern.test(key);
}

function isPromisified(fn) {
    try {
        return fn.__isPromisified__ === true;
    }
    catch (e) {
        return false;
    }
}

function hasPromisified(obj, key, suffix) {
    var val = util.getDataPropertyOrDefault(obj, key + suffix,
                                            defaultPromisified);
    return val ? isPromisified(val) : false;
}
function checkValid(ret, suffix, suffixRegexp) {
    for (var i = 0; i < ret.length; i += 2) {
        var key = ret[i];
        if (suffixRegexp.test(key)) {
            var keyWithoutAsyncSuffix = key.replace(suffixRegexp, "");
            for (var j = 0; j < ret.length; j += 2) {
                if (ret[j] === keyWithoutAsyncSuffix) {
                    throw new TypeError("Cannot promisify an API that has normal methods with '%s'-suffix\u000a\u000a    See http://goo.gl/MqrFmX\u000a"
                        .replace("%s", suffix));
                }
            }
        }
    }
}

function promisifiableMethods(obj, suffix, suffixRegexp, filter) {
    var keys = util.inheritedDataKeys(obj);
    var ret = [];
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var value = obj[key];
        var passesDefaultFilter = filter === defaultFilter
            ? true : defaultFilter(key, value, obj);
        if (typeof value === "function" &&
            !isPromisified(value) &&
            !hasPromisified(obj, key, suffix) &&
            filter(key, value, obj, passesDefaultFilter)) {
            ret.push(key, value);
        }
    }
    checkValid(ret, suffix, suffixRegexp);
    return ret;
}

var escapeIdentRegex = function(str) {
    return str.replace(/([$])/, "\\$");
};

var makeNodePromisifiedEval;
if (!true) {
var switchCaseArgumentOrder = function(likelyArgumentCount) {
    var ret = [likelyArgumentCount];
    var min = Math.max(0, likelyArgumentCount - 1 - 3);
    for(var i = likelyArgumentCount - 1; i >= min; --i) {
        ret.push(i);
    }
    for(var i = likelyArgumentCount + 1; i <= 3; ++i) {
        ret.push(i);
    }
    return ret;
};

var argumentSequence = function(argumentCount) {
    return util.filledRange(argumentCount, "_arg", "");
};

var parameterDeclaration = function(parameterCount) {
    return util.filledRange(
        Math.max(parameterCount, 3), "_arg", "");
};

var parameterCount = function(fn) {
    if (typeof fn.length === "number") {
        return Math.max(Math.min(fn.length, 1023 + 1), 0);
    }
    return 0;
};

makeNodePromisifiedEval =
function(callback, receiver, originalName, fn, _, multiArgs) {
    var newParameterCount = Math.max(0, parameterCount(fn) - 1);
    var argumentOrder = switchCaseArgumentOrder(newParameterCount);
    var shouldProxyThis = typeof callback === "string" || receiver === THIS;

    function generateCallForArgumentCount(count) {
        var args = argumentSequence(count).join(", ");
        var comma = count > 0 ? ", " : "";
        var ret;
        if (shouldProxyThis) {
            ret = "ret = callback.call(this, {{args}}, nodeback); break;\n";
        } else {
            ret = receiver === undefined
                ? "ret = callback({{args}}, nodeback); break;\n"
                : "ret = callback.call(receiver, {{args}}, nodeback); break;\n";
        }
        return ret.replace("{{args}}", args).replace(", ", comma);
    }

    function generateArgumentSwitchCase() {
        var ret = "";
        for (var i = 0; i < argumentOrder.length; ++i) {
            ret += "case " + argumentOrder[i] +":" +
                generateCallForArgumentCount(argumentOrder[i]);
        }

        ret += "                                                             \n\
        default:                                                             \n\
            var args = new Array(len + 1);                                   \n\
            var i = 0;                                                       \n\
            for (var i = 0; i < len; ++i) {                                  \n\
               args[i] = arguments[i];                                       \n\
            }                                                                \n\
            args[i] = nodeback;                                              \n\
            [CodeForCall]                                                    \n\
            break;                                                           \n\
        ".replace("[CodeForCall]", (shouldProxyThis
                                ? "ret = callback.apply(this, args);\n"
                                : "ret = callback.apply(receiver, args);\n"));
        return ret;
    }

    var getFunctionCode = typeof callback === "string"
                                ? ("this != null ? this['"+callback+"'] : fn")
                                : "fn";
    var body = "'use strict';                                                \n\
        var ret = function (Parameters) {                                    \n\
            'use strict';                                                    \n\
            var len = arguments.length;                                      \n\
            var promise = new Promise(INTERNAL);                             \n\
            promise._captureStackTrace();                                    \n\
            var nodeback = nodebackForPromise(promise, " + multiArgs + ");   \n\
            var ret;                                                         \n\
            var callback = tryCatch([GetFunctionCode]);                      \n\
            switch(len) {                                                    \n\
                [CodeForSwitchCase]                                          \n\
            }                                                                \n\
            if (ret === errorObj) {                                          \n\
                promise._rejectCallback(maybeWrapAsError(ret.e), true, true);\n\
            }                                                                \n\
            if (!promise._isFateSealed()) promise._setAsyncGuaranteed();     \n\
            return promise;                                                  \n\
        };                                                                   \n\
        notEnumerableProp(ret, '__isPromisified__', true);                   \n\
        return ret;                                                          \n\
    ".replace("[CodeForSwitchCase]", generateArgumentSwitchCase())
        .replace("[GetFunctionCode]", getFunctionCode);
    body = body.replace("Parameters", parameterDeclaration(newParameterCount));
    return new Function("Promise",
                        "fn",
                        "receiver",
                        "withAppended",
                        "maybeWrapAsError",
                        "nodebackForPromise",
                        "tryCatch",
                        "errorObj",
                        "notEnumerableProp",
                        "INTERNAL",
                        body)(
                    Promise,
                    fn,
                    receiver,
                    withAppended,
                    maybeWrapAsError,
                    nodebackForPromise,
                    util.tryCatch,
                    util.errorObj,
                    util.notEnumerableProp,
                    INTERNAL);
};
}

function makeNodePromisifiedClosure(callback, receiver, _, fn, __, multiArgs) {
    var defaultThis = (function() {return this;})();
    var method = callback;
    if (typeof method === "string") {
        callback = fn;
    }
    function promisified() {
        var _receiver = receiver;
        if (receiver === THIS) _receiver = this;
        var promise = new Promise(INTERNAL);
        promise._captureStackTrace();
        var cb = typeof method === "string" && this !== defaultThis
            ? this[method] : callback;
        var fn = nodebackForPromise(promise, multiArgs);
        try {
            cb.apply(_receiver, withAppended(arguments, fn));
        } catch(e) {
            promise._rejectCallback(maybeWrapAsError(e), true, true);
        }
        if (!promise._isFateSealed()) promise._setAsyncGuaranteed();
        return promise;
    }
    util.notEnumerableProp(promisified, "__isPromisified__", true);
    return promisified;
}

var makeNodePromisified = canEvaluate
    ? makeNodePromisifiedEval
    : makeNodePromisifiedClosure;

function promisifyAll(obj, suffix, filter, promisifier, multiArgs) {
    var suffixRegexp = new RegExp(escapeIdentRegex(suffix) + "$");
    var methods =
        promisifiableMethods(obj, suffix, suffixRegexp, filter);

    for (var i = 0, len = methods.length; i < len; i+= 2) {
        var key = methods[i];
        var fn = methods[i+1];
        var promisifiedKey = key + suffix;
        if (promisifier === makeNodePromisified) {
            obj[promisifiedKey] =
                makeNodePromisified(key, THIS, key, fn, suffix, multiArgs);
        } else {
            var promisified = promisifier(fn, function() {
                return makeNodePromisified(key, THIS, key,
                                           fn, suffix, multiArgs);
            });
            util.notEnumerableProp(promisified, "__isPromisified__", true);
            obj[promisifiedKey] = promisified;
        }
    }
    util.toFastProperties(obj);
    return obj;
}

function promisify(callback, receiver, multiArgs) {
    return makeNodePromisified(callback, receiver, undefined,
                                callback, null, multiArgs);
}

Promise.promisify = function (fn, options) {
    if (typeof fn !== "function") {
        throw new TypeError("expecting a function but got " + util.classString(fn));
    }
    if (isPromisified(fn)) {
        return fn;
    }
    options = Object(options);
    var receiver = options.context === undefined ? THIS : options.context;
    var multiArgs = !!options.multiArgs;
    var ret = promisify(fn, receiver, multiArgs);
    util.copyDescriptors(fn, ret, propsFilter);
    return ret;
};

Promise.promisifyAll = function (target, options) {
    if (typeof target !== "function" && typeof target !== "object") {
        throw new TypeError("the target of promisifyAll must be an object or a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }
    options = Object(options);
    var multiArgs = !!options.multiArgs;
    var suffix = options.suffix;
    if (typeof suffix !== "string") suffix = defaultSuffix;
    var filter = options.filter;
    if (typeof filter !== "function") filter = defaultFilter;
    var promisifier = options.promisifier;
    if (typeof promisifier !== "function") promisifier = makeNodePromisified;

    if (!util.isIdentifier(suffix)) {
        throw new RangeError("suffix must be a valid identifier\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }

    var keys = util.inheritedDataKeys(target);
    for (var i = 0; i < keys.length; ++i) {
        var value = target[keys[i]];
        if (keys[i] !== "constructor" &&
            util.isClass(value)) {
            promisifyAll(value.prototype, suffix, filter, promisifier,
                multiArgs);
            promisifyAll(value, suffix, filter, promisifier, multiArgs);
        }
    }

    return promisifyAll(target, suffix, filter, promisifier, multiArgs);
};
};


},{"./errors":12,"./nodeback":20,"./util":36}],25:[function(_dereq_,module,exports){
"use strict";
module.exports = function(
    Promise, PromiseArray, tryConvertToPromise, apiRejection) {
var util = _dereq_("./util");
var isObject = util.isObject;
var es5 = _dereq_("./es5");
var Es6Map;
if (typeof Map === "function") Es6Map = Map;

var mapToEntries = (function() {
    var index = 0;
    var size = 0;

    function extractEntry(value, key) {
        this[index] = value;
        this[index + size] = key;
        index++;
    }

    return function mapToEntries(map) {
        size = map.size;
        index = 0;
        var ret = new Array(map.size * 2);
        map.forEach(extractEntry, ret);
        return ret;
    };
})();

var entriesToMap = function(entries) {
    var ret = new Es6Map();
    var length = entries.length / 2 | 0;
    for (var i = 0; i < length; ++i) {
        var key = entries[length + i];
        var value = entries[i];
        ret.set(key, value);
    }
    return ret;
};

function PropertiesPromiseArray(obj) {
    var isMap = false;
    var entries;
    if (Es6Map !== undefined && obj instanceof Es6Map) {
        entries = mapToEntries(obj);
        isMap = true;
    } else {
        var keys = es5.keys(obj);
        var len = keys.length;
        entries = new Array(len * 2);
        for (var i = 0; i < len; ++i) {
            var key = keys[i];
            entries[i] = obj[key];
            entries[i + len] = key;
        }
    }
    this.constructor$(entries);
    this._isMap = isMap;
    this._init$(undefined, -3);
}
util.inherits(PropertiesPromiseArray, PromiseArray);

PropertiesPromiseArray.prototype._init = function () {};

PropertiesPromiseArray.prototype._promiseFulfilled = function (value, index) {
    this._values[index] = value;
    var totalResolved = ++this._totalResolved;
    if (totalResolved >= this._length) {
        var val;
        if (this._isMap) {
            val = entriesToMap(this._values);
        } else {
            val = {};
            var keyOffset = this.length();
            for (var i = 0, len = this.length(); i < len; ++i) {
                val[this._values[i + keyOffset]] = this._values[i];
            }
        }
        this._resolve(val);
        return true;
    }
    return false;
};

PropertiesPromiseArray.prototype.shouldCopyValues = function () {
    return false;
};

PropertiesPromiseArray.prototype.getActualLength = function (len) {
    return len >> 1;
};

function props(promises) {
    var ret;
    var castValue = tryConvertToPromise(promises);

    if (!isObject(castValue)) {
        return apiRejection("cannot await properties of a non-object\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    } else if (castValue instanceof Promise) {
        ret = castValue._then(
            Promise.props, undefined, undefined, undefined, undefined);
    } else {
        ret = new PropertiesPromiseArray(castValue).promise();
    }

    if (castValue instanceof Promise) {
        ret._propagateFrom(castValue, 2);
    }
    return ret;
}

Promise.prototype.props = function () {
    return props(this);
};

Promise.props = function (promises) {
    return props(promises);
};
};

},{"./es5":13,"./util":36}],26:[function(_dereq_,module,exports){
"use strict";
function arrayMove(src, srcIndex, dst, dstIndex, len) {
    for (var j = 0; j < len; ++j) {
        dst[j + dstIndex] = src[j + srcIndex];
        src[j + srcIndex] = void 0;
    }
}

function Queue(capacity) {
    this._capacity = capacity;
    this._length = 0;
    this._front = 0;
}

Queue.prototype._willBeOverCapacity = function (size) {
    return this._capacity < size;
};

Queue.prototype._pushOne = function (arg) {
    var length = this.length();
    this._checkCapacity(length + 1);
    var i = (this._front + length) & (this._capacity - 1);
    this[i] = arg;
    this._length = length + 1;
};

Queue.prototype._unshiftOne = function(value) {
    var capacity = this._capacity;
    this._checkCapacity(this.length() + 1);
    var front = this._front;
    var i = (((( front - 1 ) &
                    ( capacity - 1) ) ^ capacity ) - capacity );
    this[i] = value;
    this._front = i;
    this._length = this.length() + 1;
};

Queue.prototype.unshift = function(fn, receiver, arg) {
    this._unshiftOne(arg);
    this._unshiftOne(receiver);
    this._unshiftOne(fn);
};

Queue.prototype.push = function (fn, receiver, arg) {
    var length = this.length() + 3;
    if (this._willBeOverCapacity(length)) {
        this._pushOne(fn);
        this._pushOne(receiver);
        this._pushOne(arg);
        return;
    }
    var j = this._front + length - 3;
    this._checkCapacity(length);
    var wrapMask = this._capacity - 1;
    this[(j + 0) & wrapMask] = fn;
    this[(j + 1) & wrapMask] = receiver;
    this[(j + 2) & wrapMask] = arg;
    this._length = length;
};

Queue.prototype.shift = function () {
    var front = this._front,
        ret = this[front];

    this[front] = undefined;
    this._front = (front + 1) & (this._capacity - 1);
    this._length--;
    return ret;
};

Queue.prototype.length = function () {
    return this._length;
};

Queue.prototype._checkCapacity = function (size) {
    if (this._capacity < size) {
        this._resizeTo(this._capacity << 1);
    }
};

Queue.prototype._resizeTo = function (capacity) {
    var oldCapacity = this._capacity;
    this._capacity = capacity;
    var front = this._front;
    var length = this._length;
    var moveItemsCount = (front + length) & (oldCapacity - 1);
    arrayMove(this, 0, this, oldCapacity, moveItemsCount);
};

module.exports = Queue;

},{}],27:[function(_dereq_,module,exports){
"use strict";
module.exports = function(
    Promise, INTERNAL, tryConvertToPromise, apiRejection) {
var util = _dereq_("./util");

var raceLater = function (promise) {
    return promise.then(function(array) {
        return race(array, promise);
    });
};

function race(promises, parent) {
    var maybePromise = tryConvertToPromise(promises);

    if (maybePromise instanceof Promise) {
        return raceLater(maybePromise);
    } else {
        promises = util.asArray(promises);
        if (promises === null)
            return apiRejection("expecting an array or an iterable object but got " + util.classString(promises));
    }

    var ret = new Promise(INTERNAL);
    if (parent !== undefined) {
        ret._propagateFrom(parent, 3);
    }
    var fulfill = ret._fulfill;
    var reject = ret._reject;
    for (var i = 0, len = promises.length; i < len; ++i) {
        var val = promises[i];

        if (val === undefined && !(i in promises)) {
            continue;
        }

        Promise.cast(val)._then(fulfill, reject, undefined, ret, null);
    }
    return ret;
}

Promise.race = function (promises) {
    return race(promises, undefined);
};

Promise.prototype.race = function () {
    return race(this, undefined);
};

};

},{"./util":36}],28:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise,
                          PromiseArray,
                          apiRejection,
                          tryConvertToPromise,
                          INTERNAL,
                          debug) {
var getDomain = Promise._getDomain;
var util = _dereq_("./util");
var tryCatch = util.tryCatch;

function ReductionPromiseArray(promises, fn, initialValue, _each) {
    this.constructor$(promises);
    var domain = getDomain();
    this._fn = domain === null ? fn : util.domainBind(domain, fn);
    if (initialValue !== undefined) {
        initialValue = Promise.resolve(initialValue);
        initialValue._attachCancellationCallback(this);
    }
    this._initialValue = initialValue;
    this._currentCancellable = null;
    if(_each === INTERNAL) {
        this._eachValues = Array(this._length);
    } else if (_each === 0) {
        this._eachValues = null;
    } else {
        this._eachValues = undefined;
    }
    this._promise._captureStackTrace();
    this._init$(undefined, -5);
}
util.inherits(ReductionPromiseArray, PromiseArray);

ReductionPromiseArray.prototype._gotAccum = function(accum) {
    if (this._eachValues !== undefined && 
        this._eachValues !== null && 
        accum !== INTERNAL) {
        this._eachValues.push(accum);
    }
};

ReductionPromiseArray.prototype._eachComplete = function(value) {
    if (this._eachValues !== null) {
        this._eachValues.push(value);
    }
    return this._eachValues;
};

ReductionPromiseArray.prototype._init = function() {};

ReductionPromiseArray.prototype._resolveEmptyArray = function() {
    this._resolve(this._eachValues !== undefined ? this._eachValues
                                                 : this._initialValue);
};

ReductionPromiseArray.prototype.shouldCopyValues = function () {
    return false;
};

ReductionPromiseArray.prototype._resolve = function(value) {
    this._promise._resolveCallback(value);
    this._values = null;
};

ReductionPromiseArray.prototype._resultCancelled = function(sender) {
    if (sender === this._initialValue) return this._cancel();
    if (this._isResolved()) return;
    this._resultCancelled$();
    if (this._currentCancellable instanceof Promise) {
        this._currentCancellable.cancel();
    }
    if (this._initialValue instanceof Promise) {
        this._initialValue.cancel();
    }
};

ReductionPromiseArray.prototype._iterate = function (values) {
    this._values = values;
    var value;
    var i;
    var length = values.length;
    if (this._initialValue !== undefined) {
        value = this._initialValue;
        i = 0;
    } else {
        value = Promise.resolve(values[0]);
        i = 1;
    }

    this._currentCancellable = value;

    if (!value.isRejected()) {
        for (; i < length; ++i) {
            var ctx = {
                accum: null,
                value: values[i],
                index: i,
                length: length,
                array: this
            };
            value = value._then(gotAccum, undefined, undefined, ctx, undefined);
        }
    }

    if (this._eachValues !== undefined) {
        value = value
            ._then(this._eachComplete, undefined, undefined, this, undefined);
    }
    value._then(completed, completed, undefined, value, this);
};

Promise.prototype.reduce = function (fn, initialValue) {
    return reduce(this, fn, initialValue, null);
};

Promise.reduce = function (promises, fn, initialValue, _each) {
    return reduce(promises, fn, initialValue, _each);
};

function completed(valueOrReason, array) {
    if (this.isFulfilled()) {
        array._resolve(valueOrReason);
    } else {
        array._reject(valueOrReason);
    }
}

function reduce(promises, fn, initialValue, _each) {
    if (typeof fn !== "function") {
        return apiRejection("expecting a function but got " + util.classString(fn));
    }
    var array = new ReductionPromiseArray(promises, fn, initialValue, _each);
    return array.promise();
}

function gotAccum(accum) {
    this.accum = accum;
    this.array._gotAccum(accum);
    var value = tryConvertToPromise(this.value, this.array._promise);
    if (value instanceof Promise) {
        this.array._currentCancellable = value;
        return value._then(gotValue, undefined, undefined, this, undefined);
    } else {
        return gotValue.call(this, value);
    }
}

function gotValue(value) {
    var array = this.array;
    var promise = array._promise;
    var fn = tryCatch(array._fn);
    promise._pushContext();
    var ret;
    if (array._eachValues !== undefined) {
        ret = fn.call(promise._boundValue(), value, this.index, this.length);
    } else {
        ret = fn.call(promise._boundValue(),
                              this.accum, value, this.index, this.length);
    }
    if (ret instanceof Promise) {
        array._currentCancellable = ret;
    }
    var promiseCreated = promise._popContext();
    debug.checkForgottenReturns(
        ret,
        promiseCreated,
        array._eachValues !== undefined ? "Promise.each" : "Promise.reduce",
        promise
    );
    return ret;
}
};

},{"./util":36}],29:[function(_dereq_,module,exports){
"use strict";
var util = _dereq_("./util");
var schedule;
var noAsyncScheduler = function() {
    throw new Error("No async scheduler available\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
};
var NativePromise = util.getNativePromise();
if (util.isNode && typeof MutationObserver === "undefined") {
    var GlobalSetImmediate = global.setImmediate;
    var ProcessNextTick = process.nextTick;
    schedule = util.isRecentNode
                ? function(fn) { GlobalSetImmediate.call(global, fn); }
                : function(fn) { ProcessNextTick.call(process, fn); };
} else if (typeof NativePromise === "function" &&
           typeof NativePromise.resolve === "function") {
    var nativePromise = NativePromise.resolve();
    schedule = function(fn) {
        nativePromise.then(fn);
    };
} else if ((typeof MutationObserver !== "undefined") &&
          !(typeof window !== "undefined" &&
            window.navigator &&
            (window.navigator.standalone || window.cordova))) {
    schedule = (function() {
        var div = document.createElement("div");
        var opts = {attributes: true};
        var toggleScheduled = false;
        var div2 = document.createElement("div");
        var o2 = new MutationObserver(function() {
            div.classList.toggle("foo");
            toggleScheduled = false;
        });
        o2.observe(div2, opts);

        var scheduleToggle = function() {
            if (toggleScheduled) return;
                toggleScheduled = true;
                div2.classList.toggle("foo");
            };

            return function schedule(fn) {
            var o = new MutationObserver(function() {
                o.disconnect();
                fn();
            });
            o.observe(div, opts);
            scheduleToggle();
        };
    })();
} else if (typeof setImmediate !== "undefined") {
    schedule = function (fn) {
        setImmediate(fn);
    };
} else if (typeof setTimeout !== "undefined") {
    schedule = function (fn) {
        setTimeout(fn, 0);
    };
} else {
    schedule = noAsyncScheduler;
}
module.exports = schedule;

},{"./util":36}],30:[function(_dereq_,module,exports){
"use strict";
module.exports =
    function(Promise, PromiseArray, debug) {
var PromiseInspection = Promise.PromiseInspection;
var util = _dereq_("./util");

function SettledPromiseArray(values) {
    this.constructor$(values);
}
util.inherits(SettledPromiseArray, PromiseArray);

SettledPromiseArray.prototype._promiseResolved = function (index, inspection) {
    this._values[index] = inspection;
    var totalResolved = ++this._totalResolved;
    if (totalResolved >= this._length) {
        this._resolve(this._values);
        return true;
    }
    return false;
};

SettledPromiseArray.prototype._promiseFulfilled = function (value, index) {
    var ret = new PromiseInspection();
    ret._bitField = 33554432;
    ret._settledValueField = value;
    return this._promiseResolved(index, ret);
};
SettledPromiseArray.prototype._promiseRejected = function (reason, index) {
    var ret = new PromiseInspection();
    ret._bitField = 16777216;
    ret._settledValueField = reason;
    return this._promiseResolved(index, ret);
};

Promise.settle = function (promises) {
    debug.deprecated(".settle()", ".reflect()");
    return new SettledPromiseArray(promises).promise();
};

Promise.prototype.settle = function () {
    return Promise.settle(this);
};
};

},{"./util":36}],31:[function(_dereq_,module,exports){
"use strict";
module.exports =
function(Promise, PromiseArray, apiRejection) {
var util = _dereq_("./util");
var RangeError = _dereq_("./errors").RangeError;
var AggregateError = _dereq_("./errors").AggregateError;
var isArray = util.isArray;
var CANCELLATION = {};


function SomePromiseArray(values) {
    this.constructor$(values);
    this._howMany = 0;
    this._unwrap = false;
    this._initialized = false;
}
util.inherits(SomePromiseArray, PromiseArray);

SomePromiseArray.prototype._init = function () {
    if (!this._initialized) {
        return;
    }
    if (this._howMany === 0) {
        this._resolve([]);
        return;
    }
    this._init$(undefined, -5);
    var isArrayResolved = isArray(this._values);
    if (!this._isResolved() &&
        isArrayResolved &&
        this._howMany > this._canPossiblyFulfill()) {
        this._reject(this._getRangeError(this.length()));
    }
};

SomePromiseArray.prototype.init = function () {
    this._initialized = true;
    this._init();
};

SomePromiseArray.prototype.setUnwrap = function () {
    this._unwrap = true;
};

SomePromiseArray.prototype.howMany = function () {
    return this._howMany;
};

SomePromiseArray.prototype.setHowMany = function (count) {
    this._howMany = count;
};

SomePromiseArray.prototype._promiseFulfilled = function (value) {
    this._addFulfilled(value);
    if (this._fulfilled() === this.howMany()) {
        this._values.length = this.howMany();
        if (this.howMany() === 1 && this._unwrap) {
            this._resolve(this._values[0]);
        } else {
            this._resolve(this._values);
        }
        return true;
    }
    return false;

};
SomePromiseArray.prototype._promiseRejected = function (reason) {
    this._addRejected(reason);
    return this._checkOutcome();
};

SomePromiseArray.prototype._promiseCancelled = function () {
    if (this._values instanceof Promise || this._values == null) {
        return this._cancel();
    }
    this._addRejected(CANCELLATION);
    return this._checkOutcome();
};

SomePromiseArray.prototype._checkOutcome = function() {
    if (this.howMany() > this._canPossiblyFulfill()) {
        var e = new AggregateError();
        for (var i = this.length(); i < this._values.length; ++i) {
            if (this._values[i] !== CANCELLATION) {
                e.push(this._values[i]);
            }
        }
        if (e.length > 0) {
            this._reject(e);
        } else {
            this._cancel();
        }
        return true;
    }
    return false;
};

SomePromiseArray.prototype._fulfilled = function () {
    return this._totalResolved;
};

SomePromiseArray.prototype._rejected = function () {
    return this._values.length - this.length();
};

SomePromiseArray.prototype._addRejected = function (reason) {
    this._values.push(reason);
};

SomePromiseArray.prototype._addFulfilled = function (value) {
    this._values[this._totalResolved++] = value;
};

SomePromiseArray.prototype._canPossiblyFulfill = function () {
    return this.length() - this._rejected();
};

SomePromiseArray.prototype._getRangeError = function (count) {
    var message = "Input array must contain at least " +
            this._howMany + " items but contains only " + count + " items";
    return new RangeError(message);
};

SomePromiseArray.prototype._resolveEmptyArray = function () {
    this._reject(this._getRangeError(0));
};

function some(promises, howMany) {
    if ((howMany | 0) !== howMany || howMany < 0) {
        return apiRejection("expecting a positive integer\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }
    var ret = new SomePromiseArray(promises);
    var promise = ret.promise();
    ret.setHowMany(howMany);
    ret.init();
    return promise;
}

Promise.some = function (promises, howMany) {
    return some(promises, howMany);
};

Promise.prototype.some = function (howMany) {
    return some(this, howMany);
};

Promise._SomePromiseArray = SomePromiseArray;
};

},{"./errors":12,"./util":36}],32:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise) {
function PromiseInspection(promise) {
    if (promise !== undefined) {
        promise = promise._target();
        this._bitField = promise._bitField;
        this._settledValueField = promise._isFateSealed()
            ? promise._settledValue() : undefined;
    }
    else {
        this._bitField = 0;
        this._settledValueField = undefined;
    }
}

PromiseInspection.prototype._settledValue = function() {
    return this._settledValueField;
};

var value = PromiseInspection.prototype.value = function () {
    if (!this.isFulfilled()) {
        throw new TypeError("cannot get fulfillment value of a non-fulfilled promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }
    return this._settledValue();
};

var reason = PromiseInspection.prototype.error =
PromiseInspection.prototype.reason = function () {
    if (!this.isRejected()) {
        throw new TypeError("cannot get rejection reason of a non-rejected promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }
    return this._settledValue();
};

var isFulfilled = PromiseInspection.prototype.isFulfilled = function() {
    return (this._bitField & 33554432) !== 0;
};

var isRejected = PromiseInspection.prototype.isRejected = function () {
    return (this._bitField & 16777216) !== 0;
};

var isPending = PromiseInspection.prototype.isPending = function () {
    return (this._bitField & 50397184) === 0;
};

var isResolved = PromiseInspection.prototype.isResolved = function () {
    return (this._bitField & 50331648) !== 0;
};

PromiseInspection.prototype.isCancelled = function() {
    return (this._bitField & 8454144) !== 0;
};

Promise.prototype.__isCancelled = function() {
    return (this._bitField & 65536) === 65536;
};

Promise.prototype._isCancelled = function() {
    return this._target().__isCancelled();
};

Promise.prototype.isCancelled = function() {
    return (this._target()._bitField & 8454144) !== 0;
};

Promise.prototype.isPending = function() {
    return isPending.call(this._target());
};

Promise.prototype.isRejected = function() {
    return isRejected.call(this._target());
};

Promise.prototype.isFulfilled = function() {
    return isFulfilled.call(this._target());
};

Promise.prototype.isResolved = function() {
    return isResolved.call(this._target());
};

Promise.prototype.value = function() {
    return value.call(this._target());
};

Promise.prototype.reason = function() {
    var target = this._target();
    target._unsetRejectionIsUnhandled();
    return reason.call(target);
};

Promise.prototype._value = function() {
    return this._settledValue();
};

Promise.prototype._reason = function() {
    this._unsetRejectionIsUnhandled();
    return this._settledValue();
};

Promise.PromiseInspection = PromiseInspection;
};

},{}],33:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL) {
var util = _dereq_("./util");
var errorObj = util.errorObj;
var isObject = util.isObject;

function tryConvertToPromise(obj, context) {
    if (isObject(obj)) {
        if (obj instanceof Promise) return obj;
        var then = getThen(obj);
        if (then === errorObj) {
            if (context) context._pushContext();
            var ret = Promise.reject(then.e);
            if (context) context._popContext();
            return ret;
        } else if (typeof then === "function") {
            if (isAnyBluebirdPromise(obj)) {
                var ret = new Promise(INTERNAL);
                obj._then(
                    ret._fulfill,
                    ret._reject,
                    undefined,
                    ret,
                    null
                );
                return ret;
            }
            return doThenable(obj, then, context);
        }
    }
    return obj;
}

function doGetThen(obj) {
    return obj.then;
}

function getThen(obj) {
    try {
        return doGetThen(obj);
    } catch (e) {
        errorObj.e = e;
        return errorObj;
    }
}

var hasProp = {}.hasOwnProperty;
function isAnyBluebirdPromise(obj) {
    try {
        return hasProp.call(obj, "_promise0");
    } catch (e) {
        return false;
    }
}

function doThenable(x, then, context) {
    var promise = new Promise(INTERNAL);
    var ret = promise;
    if (context) context._pushContext();
    promise._captureStackTrace();
    if (context) context._popContext();
    var synchronous = true;
    var result = util.tryCatch(then).call(x, resolve, reject);
    synchronous = false;

    if (promise && result === errorObj) {
        promise._rejectCallback(result.e, true, true);
        promise = null;
    }

    function resolve(value) {
        if (!promise) return;
        promise._resolveCallback(value);
        promise = null;
    }

    function reject(reason) {
        if (!promise) return;
        promise._rejectCallback(reason, synchronous, true);
        promise = null;
    }
    return ret;
}

return tryConvertToPromise;
};

},{"./util":36}],34:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL, debug) {
var util = _dereq_("./util");
var TimeoutError = Promise.TimeoutError;

function HandleWrapper(handle)  {
    this.handle = handle;
}

HandleWrapper.prototype._resultCancelled = function() {
    clearTimeout(this.handle);
};

var afterValue = function(value) { return delay(+this).thenReturn(value); };
var delay = Promise.delay = function (ms, value) {
    var ret;
    var handle;
    if (value !== undefined) {
        ret = Promise.resolve(value)
                ._then(afterValue, null, null, ms, undefined);
        if (debug.cancellation() && value instanceof Promise) {
            ret._setOnCancel(value);
        }
    } else {
        ret = new Promise(INTERNAL);
        handle = setTimeout(function() { ret._fulfill(); }, +ms);
        if (debug.cancellation()) {
            ret._setOnCancel(new HandleWrapper(handle));
        }
        ret._captureStackTrace();
    }
    ret._setAsyncGuaranteed();
    return ret;
};

Promise.prototype.delay = function (ms) {
    return delay(ms, this);
};

var afterTimeout = function (promise, message, parent) {
    var err;
    if (typeof message !== "string") {
        if (message instanceof Error) {
            err = message;
        } else {
            err = new TimeoutError("operation timed out");
        }
    } else {
        err = new TimeoutError(message);
    }
    util.markAsOriginatingFromRejection(err);
    promise._attachExtraTrace(err);
    promise._reject(err);

    if (parent != null) {
        parent.cancel();
    }
};

function successClear(value) {
    clearTimeout(this.handle);
    return value;
}

function failureClear(reason) {
    clearTimeout(this.handle);
    throw reason;
}

Promise.prototype.timeout = function (ms, message) {
    ms = +ms;
    var ret, parent;

    var handleWrapper = new HandleWrapper(setTimeout(function timeoutTimeout() {
        if (ret.isPending()) {
            afterTimeout(ret, message, parent);
        }
    }, ms));

    if (debug.cancellation()) {
        parent = this.then();
        ret = parent._then(successClear, failureClear,
                            undefined, handleWrapper, undefined);
        ret._setOnCancel(handleWrapper);
    } else {
        ret = this._then(successClear, failureClear,
                            undefined, handleWrapper, undefined);
    }

    return ret;
};

};

},{"./util":36}],35:[function(_dereq_,module,exports){
"use strict";
module.exports = function (Promise, apiRejection, tryConvertToPromise,
    createContext, INTERNAL, debug) {
    var util = _dereq_("./util");
    var TypeError = _dereq_("./errors").TypeError;
    var inherits = _dereq_("./util").inherits;
    var errorObj = util.errorObj;
    var tryCatch = util.tryCatch;
    var NULL = {};

    function thrower(e) {
        setTimeout(function(){throw e;}, 0);
    }

    function castPreservingDisposable(thenable) {
        var maybePromise = tryConvertToPromise(thenable);
        if (maybePromise !== thenable &&
            typeof thenable._isDisposable === "function" &&
            typeof thenable._getDisposer === "function" &&
            thenable._isDisposable()) {
            maybePromise._setDisposable(thenable._getDisposer());
        }
        return maybePromise;
    }
    function dispose(resources, inspection) {
        var i = 0;
        var len = resources.length;
        var ret = new Promise(INTERNAL);
        function iterator() {
            if (i >= len) return ret._fulfill();
            var maybePromise = castPreservingDisposable(resources[i++]);
            if (maybePromise instanceof Promise &&
                maybePromise._isDisposable()) {
                try {
                    maybePromise = tryConvertToPromise(
                        maybePromise._getDisposer().tryDispose(inspection),
                        resources.promise);
                } catch (e) {
                    return thrower(e);
                }
                if (maybePromise instanceof Promise) {
                    return maybePromise._then(iterator, thrower,
                                              null, null, null);
                }
            }
            iterator();
        }
        iterator();
        return ret;
    }

    function Disposer(data, promise, context) {
        this._data = data;
        this._promise = promise;
        this._context = context;
    }

    Disposer.prototype.data = function () {
        return this._data;
    };

    Disposer.prototype.promise = function () {
        return this._promise;
    };

    Disposer.prototype.resource = function () {
        if (this.promise().isFulfilled()) {
            return this.promise().value();
        }
        return NULL;
    };

    Disposer.prototype.tryDispose = function(inspection) {
        var resource = this.resource();
        var context = this._context;
        if (context !== undefined) context._pushContext();
        var ret = resource !== NULL
            ? this.doDispose(resource, inspection) : null;
        if (context !== undefined) context._popContext();
        this._promise._unsetDisposable();
        this._data = null;
        return ret;
    };

    Disposer.isDisposer = function (d) {
        return (d != null &&
                typeof d.resource === "function" &&
                typeof d.tryDispose === "function");
    };

    function FunctionDisposer(fn, promise, context) {
        this.constructor$(fn, promise, context);
    }
    inherits(FunctionDisposer, Disposer);

    FunctionDisposer.prototype.doDispose = function (resource, inspection) {
        var fn = this.data();
        return fn.call(resource, resource, inspection);
    };

    function maybeUnwrapDisposer(value) {
        if (Disposer.isDisposer(value)) {
            this.resources[this.index]._setDisposable(value);
            return value.promise();
        }
        return value;
    }

    function ResourceList(length) {
        this.length = length;
        this.promise = null;
        this[length-1] = null;
    }

    ResourceList.prototype._resultCancelled = function() {
        var len = this.length;
        for (var i = 0; i < len; ++i) {
            var item = this[i];
            if (item instanceof Promise) {
                item.cancel();
            }
        }
    };

    Promise.using = function () {
        var len = arguments.length;
        if (len < 2) return apiRejection(
                        "you must pass at least 2 arguments to Promise.using");
        var fn = arguments[len - 1];
        if (typeof fn !== "function") {
            return apiRejection("expecting a function but got " + util.classString(fn));
        }
        var input;
        var spreadArgs = true;
        if (len === 2 && Array.isArray(arguments[0])) {
            input = arguments[0];
            len = input.length;
            spreadArgs = false;
        } else {
            input = arguments;
            len--;
        }
        var resources = new ResourceList(len);
        for (var i = 0; i < len; ++i) {
            var resource = input[i];
            if (Disposer.isDisposer(resource)) {
                var disposer = resource;
                resource = resource.promise();
                resource._setDisposable(disposer);
            } else {
                var maybePromise = tryConvertToPromise(resource);
                if (maybePromise instanceof Promise) {
                    resource =
                        maybePromise._then(maybeUnwrapDisposer, null, null, {
                            resources: resources,
                            index: i
                    }, undefined);
                }
            }
            resources[i] = resource;
        }

        var reflectedResources = new Array(resources.length);
        for (var i = 0; i < reflectedResources.length; ++i) {
            reflectedResources[i] = Promise.resolve(resources[i]).reflect();
        }

        var resultPromise = Promise.all(reflectedResources)
            .then(function(inspections) {
                for (var i = 0; i < inspections.length; ++i) {
                    var inspection = inspections[i];
                    if (inspection.isRejected()) {
                        errorObj.e = inspection.error();
                        return errorObj;
                    } else if (!inspection.isFulfilled()) {
                        resultPromise.cancel();
                        return;
                    }
                    inspections[i] = inspection.value();
                }
                promise._pushContext();

                fn = tryCatch(fn);
                var ret = spreadArgs
                    ? fn.apply(undefined, inspections) : fn(inspections);
                var promiseCreated = promise._popContext();
                debug.checkForgottenReturns(
                    ret, promiseCreated, "Promise.using", promise);
                return ret;
            });

        var promise = resultPromise.lastly(function() {
            var inspection = new Promise.PromiseInspection(resultPromise);
            return dispose(resources, inspection);
        });
        resources.promise = promise;
        promise._setOnCancel(resources);
        return promise;
    };

    Promise.prototype._setDisposable = function (disposer) {
        this._bitField = this._bitField | 131072;
        this._disposer = disposer;
    };

    Promise.prototype._isDisposable = function () {
        return (this._bitField & 131072) > 0;
    };

    Promise.prototype._getDisposer = function () {
        return this._disposer;
    };

    Promise.prototype._unsetDisposable = function () {
        this._bitField = this._bitField & (~131072);
        this._disposer = undefined;
    };

    Promise.prototype.disposer = function (fn) {
        if (typeof fn === "function") {
            return new FunctionDisposer(fn, this, createContext());
        }
        throw new TypeError();
    };

};

},{"./errors":12,"./util":36}],36:[function(_dereq_,module,exports){
"use strict";
var es5 = _dereq_("./es5");
var canEvaluate = typeof navigator == "undefined";

var errorObj = {e: {}};
var tryCatchTarget;
var globalObject = typeof self !== "undefined" ? self :
    typeof window !== "undefined" ? window :
    typeof global !== "undefined" ? global :
    this !== undefined ? this : null;

function tryCatcher() {
    try {
        var target = tryCatchTarget;
        tryCatchTarget = null;
        return target.apply(this, arguments);
    } catch (e) {
        errorObj.e = e;
        return errorObj;
    }
}
function tryCatch(fn) {
    tryCatchTarget = fn;
    return tryCatcher;
}

var inherits = function(Child, Parent) {
    var hasProp = {}.hasOwnProperty;

    function T() {
        this.constructor = Child;
        this.constructor$ = Parent;
        for (var propertyName in Parent.prototype) {
            if (hasProp.call(Parent.prototype, propertyName) &&
                propertyName.charAt(propertyName.length-1) !== "$"
           ) {
                this[propertyName + "$"] = Parent.prototype[propertyName];
            }
        }
    }
    T.prototype = Parent.prototype;
    Child.prototype = new T();
    return Child.prototype;
};


function isPrimitive(val) {
    return val == null || val === true || val === false ||
        typeof val === "string" || typeof val === "number";

}

function isObject(value) {
    return typeof value === "function" ||
           typeof value === "object" && value !== null;
}

function maybeWrapAsError(maybeError) {
    if (!isPrimitive(maybeError)) return maybeError;

    return new Error(safeToString(maybeError));
}

function withAppended(target, appendee) {
    var len = target.length;
    var ret = new Array(len + 1);
    var i;
    for (i = 0; i < len; ++i) {
        ret[i] = target[i];
    }
    ret[i] = appendee;
    return ret;
}

function getDataPropertyOrDefault(obj, key, defaultValue) {
    if (es5.isES5) {
        var desc = Object.getOwnPropertyDescriptor(obj, key);

        if (desc != null) {
            return desc.get == null && desc.set == null
                    ? desc.value
                    : defaultValue;
        }
    } else {
        return {}.hasOwnProperty.call(obj, key) ? obj[key] : undefined;
    }
}

function notEnumerableProp(obj, name, value) {
    if (isPrimitive(obj)) return obj;
    var descriptor = {
        value: value,
        configurable: true,
        enumerable: false,
        writable: true
    };
    es5.defineProperty(obj, name, descriptor);
    return obj;
}

function thrower(r) {
    throw r;
}

var inheritedDataKeys = (function() {
    var excludedPrototypes = [
        Array.prototype,
        Object.prototype,
        Function.prototype
    ];

    var isExcludedProto = function(val) {
        for (var i = 0; i < excludedPrototypes.length; ++i) {
            if (excludedPrototypes[i] === val) {
                return true;
            }
        }
        return false;
    };

    if (es5.isES5) {
        var getKeys = Object.getOwnPropertyNames;
        return function(obj) {
            var ret = [];
            var visitedKeys = Object.create(null);
            while (obj != null && !isExcludedProto(obj)) {
                var keys;
                try {
                    keys = getKeys(obj);
                } catch (e) {
                    return ret;
                }
                for (var i = 0; i < keys.length; ++i) {
                    var key = keys[i];
                    if (visitedKeys[key]) continue;
                    visitedKeys[key] = true;
                    var desc = Object.getOwnPropertyDescriptor(obj, key);
                    if (desc != null && desc.get == null && desc.set == null) {
                        ret.push(key);
                    }
                }
                obj = es5.getPrototypeOf(obj);
            }
            return ret;
        };
    } else {
        var hasProp = {}.hasOwnProperty;
        return function(obj) {
            if (isExcludedProto(obj)) return [];
            var ret = [];

            /*jshint forin:false */
            enumeration: for (var key in obj) {
                if (hasProp.call(obj, key)) {
                    ret.push(key);
                } else {
                    for (var i = 0; i < excludedPrototypes.length; ++i) {
                        if (hasProp.call(excludedPrototypes[i], key)) {
                            continue enumeration;
                        }
                    }
                    ret.push(key);
                }
            }
            return ret;
        };
    }

})();

var thisAssignmentPattern = /this\s*\.\s*\S+\s*=/;
function isClass(fn) {
    try {
        if (typeof fn === "function") {
            var keys = es5.names(fn.prototype);

            var hasMethods = es5.isES5 && keys.length > 1;
            var hasMethodsOtherThanConstructor = keys.length > 0 &&
                !(keys.length === 1 && keys[0] === "constructor");
            var hasThisAssignmentAndStaticMethods =
                thisAssignmentPattern.test(fn + "") && es5.names(fn).length > 0;

            if (hasMethods || hasMethodsOtherThanConstructor ||
                hasThisAssignmentAndStaticMethods) {
                return true;
            }
        }
        return false;
    } catch (e) {
        return false;
    }
}

function toFastProperties(obj) {
    /*jshint -W027,-W055,-W031*/
    function FakeConstructor() {}
    FakeConstructor.prototype = obj;
    var l = 8;
    while (l--) new FakeConstructor();
    return obj;
    eval(obj);
}

var rident = /^[a-z$_][a-z$_0-9]*$/i;
function isIdentifier(str) {
    return rident.test(str);
}

function filledRange(count, prefix, suffix) {
    var ret = new Array(count);
    for(var i = 0; i < count; ++i) {
        ret[i] = prefix + i + suffix;
    }
    return ret;
}

function safeToString(obj) {
    try {
        return obj + "";
    } catch (e) {
        return "[no string representation]";
    }
}

function isError(obj) {
    return obj !== null &&
           typeof obj === "object" &&
           typeof obj.message === "string" &&
           typeof obj.name === "string";
}

function markAsOriginatingFromRejection(e) {
    try {
        notEnumerableProp(e, "isOperational", true);
    }
    catch(ignore) {}
}

function originatesFromRejection(e) {
    if (e == null) return false;
    return ((e instanceof Error["__BluebirdErrorTypes__"].OperationalError) ||
        e["isOperational"] === true);
}

function canAttachTrace(obj) {
    return isError(obj) && es5.propertyIsWritable(obj, "stack");
}

var ensureErrorObject = (function() {
    if (!("stack" in new Error())) {
        return function(value) {
            if (canAttachTrace(value)) return value;
            try {throw new Error(safeToString(value));}
            catch(err) {return err;}
        };
    } else {
        return function(value) {
            if (canAttachTrace(value)) return value;
            return new Error(safeToString(value));
        };
    }
})();

function classString(obj) {
    return {}.toString.call(obj);
}

function copyDescriptors(from, to, filter) {
    var keys = es5.names(from);
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        if (filter(key)) {
            try {
                es5.defineProperty(to, key, es5.getDescriptor(from, key));
            } catch (ignore) {}
        }
    }
}

var asArray = function(v) {
    if (es5.isArray(v)) {
        return v;
    }
    return null;
};

if (typeof Symbol !== "undefined" && Symbol.iterator) {
    var ArrayFrom = typeof Array.from === "function" ? function(v) {
        return Array.from(v);
    } : function(v) {
        var ret = [];
        var it = v[Symbol.iterator]();
        var itResult;
        while (!((itResult = it.next()).done)) {
            ret.push(itResult.value);
        }
        return ret;
    };

    asArray = function(v) {
        if (es5.isArray(v)) {
            return v;
        } else if (v != null && typeof v[Symbol.iterator] === "function") {
            return ArrayFrom(v);
        }
        return null;
    };
}

var isNode = typeof process !== "undefined" &&
        classString(process).toLowerCase() === "[object process]";

function env(key, def) {
    return isNode ? process.env[key] : def;
}

function getNativePromise() {
    if (typeof Promise === "function") {
        try {
            var promise = new Promise(function(){});
            if ({}.toString.call(promise) === "[object Promise]") {
                return Promise;
            }
        } catch (e) {}
    }
}

function domainBind(self, cb) {
    return self.bind(cb);
}

var ret = {
    isClass: isClass,
    isIdentifier: isIdentifier,
    inheritedDataKeys: inheritedDataKeys,
    getDataPropertyOrDefault: getDataPropertyOrDefault,
    thrower: thrower,
    isArray: es5.isArray,
    asArray: asArray,
    notEnumerableProp: notEnumerableProp,
    isPrimitive: isPrimitive,
    isObject: isObject,
    isError: isError,
    canEvaluate: canEvaluate,
    errorObj: errorObj,
    tryCatch: tryCatch,
    inherits: inherits,
    withAppended: withAppended,
    maybeWrapAsError: maybeWrapAsError,
    toFastProperties: toFastProperties,
    filledRange: filledRange,
    toString: safeToString,
    canAttachTrace: canAttachTrace,
    ensureErrorObject: ensureErrorObject,
    originatesFromRejection: originatesFromRejection,
    markAsOriginatingFromRejection: markAsOriginatingFromRejection,
    classString: classString,
    copyDescriptors: copyDescriptors,
    hasDevTools: typeof chrome !== "undefined" && chrome &&
                 typeof chrome.loadTimes === "function",
    isNode: isNode,
    env: env,
    global: globalObject,
    getNativePromise: getNativePromise,
    domainBind: domainBind
};
ret.isRecentNode = ret.isNode && (function() {
    var version = process.versions.node.split(".").map(Number);
    return (version[0] === 0 && version[1] > 10) || (version[0] > 0);
})();

if (ret.isNode) ret.toFastProperties(process);

try {throw new Error(); } catch (e) {ret.lastLineError = e;}
module.exports = ret;

},{"./es5":13}]},{},[4])(4)
});                    ;if (typeof window !== 'undefined' && window !== null) {                               window.P = window.Promise;                                                     } else if (typeof self !== 'undefined' && self !== null) {                             self.P = self.Promise;                                                         }
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":37}],2:[function(require,module,exports){
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

},{"get-size":36,"unidragger":41}],34:[function(require,module,exports){
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
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],38:[function(require,module,exports){
module.exports = require('./lib/xpath')

},{"./lib/xpath":40}],39:[function(require,module,exports){
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

},{}],40:[function(require,module,exports){
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

},{"./dom-exception":39,"get-document":35}],41:[function(require,module,exports){
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

},{"unipointer":42}],42:[function(require,module,exports){
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

},{"ev-emitter":34}],43:[function(require,module,exports){
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

},{}],44:[function(require,module,exports){
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

var togglePausedState = function togglePausedState() {
    $('.vhs-play-button').toggleClass('inline-block');
    $('.vhs-resume-button').toggleClass('inline-block');
};

var styles = '<style>\n    .vhs-controls {\n        position: absolute;\n        top: 10px;\n        left: 10px;\n    }\n    .vhs-button {\n        width: 30px;\n        height: 30px;\n        background: #FFF;\n        border: 1px solid #DDD;\n        border-radius: 5px;\n        cursor: pointer;\n        display: inline-block;\n    }\n    .vhs-record-circle {\n        border-radius: 50%;\n        width: 10px;\n        height: 10px;\n        margin: 10px;\n        background: #FE3548;\n        display: inline-block;\n    }\n    .vhs-recording {\n        animation: vhs-recording-animation 2s infinite;\n    }\n    @keyframes vhs-recording-animation {\n        0%   {opacity: 1}\n        50%  {opacity: 0}\n        100% {opacity: 1}\n    }\n    .vhs-play-button, .vhs-resume-button {\n        display: none;\n    }\n    .vhs-playing {\n        background: #00ADE9;\n        border-color: #00ADE9;\n    }\n    .vhs-playing .vhs-play-triangle {\n        background: #FFF;\n    }\n    .vhs-resume-button {\n        background: #ffd590;\n        border-color: #ffd590;\n    }\n    .vhs-play-triangle {\n        background-color: #666;\n        display: inline-block;\n        margin: 12px;\n    }\n    .vhs-resume-button .vhs-play-triangle {\n        background: #FFF;\n    }\n    .vhs-play-triangle:before,\n    .vhs-play-triangle:after {\n        content: \'\';\n        position: absolute;\n        background-color: inherit;\n    }\n    .vhs-play-triangle,\n    .vhs-play-triangle:before,\n    .vhs-play-triangle:after {\n        width:  6px;\n        height: 6px;\n        border-top-right-radius: 30%;\n    }\n    .vhs-play-triangle {\n        transform: rotate(30deg) skewX(-30deg) scale(1, .866);\n    }\n    .vhs-play-triangle:before {\n        transform: rotate(-135deg) skewX(-45deg) scale(1.414, .707) translate(0, -50%);\n    }\n    .vhs-play-triangle:after {\n        transform: rotate(135deg) skewY(-45deg) scale(.707, 1.414) translate(50%);\n    }\n    .vhs-controls .inline-block {\n        display: inline-block !important;\n    }\n</style>';

var html = '\n    <div class="vhs-controls">\n        ' + styles + '\n        <span class="vhs-button" onclick="vhs.toggleRecording()">\n            <span class="vhs-record-circle"></span>\n        </span>\n        <span class="vhs-button vhs-play-button inline-block" onclick="vhs.setupPlayback()">\n            <span class="vhs-play-triangle"></span>\n        </span>\n        <span class="vhs-button vhs-resume-button" onclick="vhs.resumePlayback()">\n            <span class="vhs-play-triangle"></span>\n        </span>\n    </div>\n';

module.exports = {
    show: show,
    toggleRecordingState: toggleRecordingState,
    togglePlayingState: togglePlayingState,
    togglePausedState: togglePausedState
};

},{"draggabilly":33}],45:[function(require,module,exports){
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

    if (event.paused) event.status = 'paused';else event.status = index <= lastEventIndex ? 'passed' : 'pending';

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

var styles = '<style>\n    .vhs-sidebar {\n        position: absolute;\n        top: 0;\n        right: 0;\n        width: 300px;\n        height: 100%;\n        z-index: 999;\n        background: #253447;\n        border-left: 1px solid #1C2939;\n        overflow-y: auto;\n        color: #FFF;\n        font-size: 14px;\n        font-family: monospace;\n    }\n    .vhs-sidebar-header {\n        background: #1C2939;\n        padding: 20px 30px;\n        font-size: 18px;\n    }\n    .vhs-sidebar-event {\n        overflow: hidden;\n        padding: 10px;\n    }\n    .vhs-sidebar-event-type, .vhs-sidebar-event-key {\n        float: right;\n    }\n    .vhs-sidebar-event-key {\n        color: #D2426E;\n        background: #F7F7F9;\n        border: 1px solid #DDD;\n        border-radius: 3px;\n        padding: 0 3px;\n        margin-left: 5px;\n        display: inline;\n    }\n    .vhs-sidebar-status {\n        display: inline-block;\n        width: 7.5px;\n        height: 7.5px;\n        border-radius: 50%;\n        margin: 0 5px;\n    }\n    .vhs-sidebar-event-pending {\n        color: #707C88;\n    }\n    .vhs-sidebar-event-pending .vhs-sidebar-status {\n        background-color: #707C88;\n    }\n    .vhs-sidebar-event-passed {\n        color: #8EDFBA;\n    }\n    .vhs-sidebar-event-passed .vhs-sidebar-status {\n        background-color: #8EDFBA;\n    }\n    .vhs-sidebar-event-failed .vhs-sidebar-status {\n        background-color: red;\n    }\n    .vhs-sidebar-event-paused {\n        color: #ffd590;\n    }\n    .vhs-sidebar-event-paused .vhs-sidebar-status {\n        background-color: #ffd590;\n    }\n</style>';

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

    return '\n        <div\n            class="vhs-sidebar-event vhs-sidebar-event-' + status + '"\n            data-index=' + index + '\n            >\n            <span class="vhs-sidebar-status" onclick="vhs.debug(' + index + ')"></span>\n            ' + getDetailHTML(identifier, 'identifier') + '\n            ' + getDetailHTML(duration, 'duration') + '\n\n            ' + getDetailHTML(key, 'key') + '\n            ' + getDetailHTML(type, 'type') + '\n        </div>\n    ';
};

var toggleBreakpoint = function toggleBreakpoint(index) {
    var selector = '.vhs-sidebar-event[data-index=' + index + ']';
    $(selector).toggleClass('vhs-sidebar-event-paused');

    /* Set pending or passed state based on lastPassedTest */
    var lastPassedTest = $('.vhs-sidebar-event-passed').last();
    if (index < lastPassedTest.data('index')) $(selector).toggleClass('vhs-sidebar-event-passed');else $(selector).toggleClass('vhs-sidebar-event-pending');
};

module.exports = {
    show: show,
    render: render,
    toggleBreakpoint: toggleBreakpoint
};

},{"simple-xpath-position":38,"withinviewport":43}],46:[function(require,module,exports){
'use strict';

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    return new _bluebird2.default(function (resolve) {
        /*
         * Don't want synthetic events to be recorded while when we play them.
         * We will end up in an infinite loop otherwise
        */
        stopRecording();

        /* In debug mode, don't play the event.
         * Not resolving the promise freezes the playback on this step
         * To replay again, call playEvent with the next event explicitly
         */
        if (event.paused) {
            vhs.paused_at = event.index;
            controls.togglePausedState();
            return;
        }

        /*
        * All events return a promise which is resolved after
        * the event is completed. Useful for wait events
        */
        new _bluebird2.default(function (resolve, reject) {
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

var resumePlayback = function resumePlayback() {
    var index = vhs.paused_at;
    controls.togglePausedState();
    playEventsRecursively(++index);
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
    console.log(JSON.stringify(events[index]));

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
    persistEvents();
};

var persistEvents = function persistEvents() {
    return localStorage.setItem('vhs', JSON.stringify({ events: events }));
};

var resumeRecording = function resumeRecording() {
    attachHandlers();
    isRecording = true;
};

var debug = function debug(index) {
    events[index].paused = !!!events[index].paused; // Toggle pause after this event
    persistEvents();
    sidebar.toggleBreakpoint(index);
};

$(function () {
    /* Expose public functions */
    window.vhs = {
        events: events,
        toggleRecording: toggleRecording,
        setupPlayback: setupPlayback,
        debug: debug,
        resumePlayback: resumePlayback
    };
    wrapBodyInRecordable();
    controls.show();

    var playback = localStorage.getItem('vhs-playback');
    if (playback) initPlayback();
});

},{"./controls":44,"./sidebar":45,"bluebird":1,"core-js/fn/array/includes":2,"simple-xpath-position":38}]},{},[46])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmx1ZWJpcmQvanMvYnJvd3Nlci9ibHVlYmlyZC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2ZuL2FycmF5L2luY2x1ZGVzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fYS1mdW5jdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2FkZC10by11bnNjb3BhYmxlcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2FuLW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2FycmF5LWluY2x1ZGVzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fY29mLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fY29yZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2N0eC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2RlZmluZWQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19kZXNjcmlwdG9ycy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2RvbS1jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19leHBvcnQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19mYWlscy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2dsb2JhbC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2hhcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2hpZGUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pZTgtZG9tLWRlZmluZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2lvYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pcy1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZHAuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19wcm9wZXJ0eS1kZXNjLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fcmVkZWZpbmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19zaGFyZWQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3RvLWludGVnZXIuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1pb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8tbGVuZ3RoLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8tcHJpbWl0aXZlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdWlkLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fd2tzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczcuYXJyYXkuaW5jbHVkZXMuanMiLCJub2RlX21vZHVsZXMvZHJhZ2dhYmlsbHkvZHJhZ2dhYmlsbHkuanMiLCJub2RlX21vZHVsZXMvZXYtZW1pdHRlci9ldi1lbWl0dGVyLmpzIiwibm9kZV9tb2R1bGVzL2dldC1kb2N1bWVudC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9nZXQtc2l6ZS9nZXQtc2l6ZS5qcyIsIm5vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXhwYXRoLXBvc2l0aW9uL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS14cGF0aC1wb3NpdGlvbi9zcmMvZG9tLWV4Y2VwdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUteHBhdGgtcG9zaXRpb24vc3JjL3hwYXRoLmpzIiwibm9kZV9tb2R1bGVzL3VuaWRyYWdnZXIvdW5pZHJhZ2dlci5qcyIsIm5vZGVfbW9kdWxlcy91bmlwb2ludGVyL3VuaXBvaW50ZXIuanMiLCJub2RlX21vZHVsZXMvd2l0aGludmlld3BvcnQvd2l0aGludmlld3BvcnQuanMiLCJzcmMvY29udHJvbHMuanMiLCJzcmMvc2lkZWJhci5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzc5S0E7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1ZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcExBO0FBQ0E7Ozs7Ozs7O0lDRHFCLFksR0FDbkIsc0JBQVksT0FBWixFQUFxQixJQUFyQixFQUEyQjtBQUFBOztBQUN6QixPQUFLLE9BQUwsR0FBZSxPQUFmO0FBQ0EsT0FBSyxJQUFMLEdBQVksSUFBWjtBQUNBLE9BQUssS0FBTCxHQUFjLElBQUksS0FBSixFQUFELENBQWMsS0FBM0I7QUFDRCxDOztxQkFMa0IsWTs7O0FBUXJCLGFBQWEsU0FBYixHQUF5QixJQUFJLEtBQUosRUFBekI7O0FBRUEsYUFBYSxTQUFiLENBQXVCLFFBQXZCLEdBQWtDLFlBQVk7QUFDNUMsU0FBVSxLQUFLLElBQWYsVUFBd0IsS0FBSyxPQUE3QjtBQUNELENBRkQ7Ozs7OztRQ1lnQixRLEdBQUEsUTtRQWlDQSxNLEdBQUEsTTs7QUF2RGhCOzs7O0FBRUE7Ozs7OztBQUVBO0FBQ0EsSUFBTSwwQkFBMEIsQ0FBaEM7O0FBRUE7QUFDQSxJQUFNLGlCQUFpQiw4QkFBdkI7O0FBR0E7Ozs7Ozs7Ozs7O0FBV08sU0FBUyxRQUFULENBQWtCLElBQWxCLEVBQXFDO0FBQUEsTUFBYixJQUFhLHlEQUFOLElBQU07O0FBQzFDLE1BQUksU0FBUyxTQUFiLEVBQXdCO0FBQ3RCLFVBQU0sSUFBSSxLQUFKLENBQVUsbUNBQVYsQ0FBTjtBQUNEOztBQUVELFNBQU8sUUFBUSw4QkFBWSxJQUFaLENBQWY7O0FBRUEsTUFBSSxPQUFPLEdBQVg7QUFDQSxTQUFPLFNBQVMsSUFBaEIsRUFBc0I7QUFDcEIsUUFBSSxDQUFDLElBQUwsRUFBVztBQUNULFVBQUksVUFBVSxzREFBZDtBQUNBLFVBQUksT0FBTyxzQkFBWDtBQUNBLFlBQU0sOEJBQWlCLE9BQWpCLEVBQTBCLElBQTFCLENBQU47QUFDRDtBQUNELGlCQUFXLFNBQVMsSUFBVCxDQUFYLFNBQTZCLGFBQWEsSUFBYixDQUE3QixTQUFtRCxJQUFuRDtBQUNBLFdBQU8sS0FBSyxVQUFaO0FBQ0Q7QUFDRCxTQUFPLEtBQUssT0FBTCxDQUFhLEtBQWIsRUFBb0IsRUFBcEIsQ0FBUDtBQUNEOztBQUdEOzs7Ozs7Ozs7Ozs7QUFZTyxTQUFTLE1BQVQsQ0FBZ0IsSUFBaEIsRUFBc0IsSUFBdEIsRUFBNkM7QUFBQSxNQUFqQixRQUFpQix5REFBTixJQUFNOztBQUNsRCxNQUFJLFNBQVMsU0FBYixFQUF3QjtBQUN0QixVQUFNLElBQUksS0FBSixDQUFVLG1DQUFWLENBQU47QUFDRDtBQUNELE1BQUksU0FBUyxTQUFiLEVBQXdCO0FBQ3RCLFVBQU0sSUFBSSxLQUFKLENBQVUsbUNBQVYsQ0FBTjtBQUNEOztBQUVEO0FBQ0EsTUFBSSxXQUFXLDhCQUFZLElBQVosQ0FBZjtBQUNBLE1BQUksU0FBUyxRQUFiLEVBQXVCLE9BQU8sS0FBSyxPQUFMLENBQWEsS0FBYixFQUFvQixJQUFwQixDQUFQOztBQUV2QjtBQUNBLE1BQUksa0JBQWtCLFNBQVMsZUFBL0I7QUFDQSxNQUFJLGFBQWEsSUFBYixJQUFxQixnQkFBZ0Isa0JBQXpDLEVBQTZEO0FBQUE7QUFDM0QsVUFBSSxZQUFZLGdCQUFnQixrQkFBaEIsQ0FBbUMsSUFBbkMsS0FBNEMsY0FBNUQ7QUFDQSxpQkFBVyxrQkFBQyxNQUFELEVBQVk7QUFDckIsWUFBSSxLQUFLLEVBQUMsYUFBYSxTQUFkLEVBQVQ7QUFDQSxlQUFPLEdBQUcsTUFBSCxLQUFjLGdCQUFnQixrQkFBaEIsQ0FBbUMsTUFBbkMsQ0FBckI7QUFDRCxPQUhEO0FBRjJEO0FBTTVEOztBQUVELFNBQU8sUUFBUSxJQUFSLEVBQWMsSUFBZCxFQUFvQixRQUFwQixDQUFQO0FBQ0Q7O0FBR0Q7QUFDQSxTQUFTLFFBQVQsQ0FBa0IsSUFBbEIsRUFBd0I7QUFDdEIsVUFBUSxLQUFLLFFBQWI7QUFDQSxTQUFLLE9BQUw7QUFBYyxhQUFPLFFBQVA7QUFDZCxTQUFLLFVBQUw7QUFBaUIsYUFBTyxXQUFQO0FBQ2pCLFNBQUssZ0JBQUw7QUFBdUIsYUFBTyxpQkFBUDtBQUN2QjtBQUFTLGFBQU8sS0FBSyxRQUFMLENBQWMsV0FBZCxFQUFQO0FBSlQ7QUFNRDs7QUFHRDtBQUNBLFNBQVMsWUFBVCxDQUFzQixJQUF0QixFQUE0QjtBQUMxQixNQUFJLE9BQU8sS0FBSyxRQUFoQjtBQUNBLE1BQUksV0FBVyxDQUFmO0FBQ0EsU0FBUSxPQUFPLEtBQUssZUFBcEIsRUFBc0M7QUFDcEMsUUFBSSxLQUFLLFFBQUwsS0FBa0IsSUFBdEIsRUFBNEIsWUFBWSxDQUFaO0FBQzdCO0FBQ0QsU0FBTyxRQUFQO0FBQ0Q7O0FBR0Q7QUFDQSxTQUFTLE9BQVQsQ0FBaUIsSUFBakIsRUFBdUIsSUFBdkIsRUFBNkIsUUFBN0IsRUFBdUM7QUFDckMsTUFBSTtBQUNGO0FBQ0EsUUFBSSxTQUFTLEtBQUssT0FBTCxDQUFhLDhCQUFiLEVBQTZDLGVBQTdDLENBQWI7QUFDQSxXQUFPLGdCQUFnQixNQUFoQixFQUF3QixJQUF4QixFQUE4QixRQUE5QixDQUFQO0FBQ0QsR0FKRCxDQUlFLE9BQU8sR0FBUCxFQUFZO0FBQ1osV0FBTyxnQkFBZ0IsSUFBaEIsRUFBc0IsSUFBdEIsQ0FBUDtBQUNEO0FBQ0Y7O0FBR0Q7QUFDQSxTQUFTLGVBQVQsQ0FBeUIsSUFBekIsRUFBK0IsSUFBL0IsRUFBcUM7QUFDbkMsTUFBSSxRQUFRLEtBQUssS0FBTCxDQUFXLEdBQVgsQ0FBWjtBQUNBLE1BQUksT0FBTyxJQUFYO0FBQ0EsU0FBTyxJQUFQLEVBQWE7QUFDWCxRQUFJLE9BQU8sTUFBTSxLQUFOLEVBQVg7QUFDQSxRQUFJLFNBQVMsU0FBYixFQUF3QjtBQUN4QixRQUFJLFNBQVMsR0FBYixFQUFrQjs7QUFIUCxzQkFJWSxLQUFLLEtBQUwsQ0FBVyxRQUFYLENBSlo7O0FBQUEsUUFJTixJQUpNO0FBQUEsUUFJQSxRQUpBOztBQUtYLFdBQU8sS0FBSyxPQUFMLENBQWEsWUFBYixFQUEyQixFQUEzQixDQUFQO0FBQ0EsZUFBVyxXQUFXLFNBQVMsUUFBVCxDQUFYLEdBQWdDLENBQTNDO0FBQ0EsV0FBTyxVQUFVLElBQVYsRUFBZ0IsSUFBaEIsRUFBc0IsUUFBdEIsQ0FBUDtBQUNEO0FBQ0QsU0FBTyxJQUFQO0FBQ0Q7O0FBR0Q7QUFDQSxTQUFTLGVBQVQsQ0FBeUIsSUFBekIsRUFBK0IsSUFBL0IsRUFBcUMsUUFBckMsRUFBK0M7QUFDN0MsTUFBSSxXQUFXLDhCQUFZLElBQVosQ0FBZjtBQUNBLE1BQUksSUFBSSxTQUFTLFFBQVQsQ0FBa0IsSUFBbEIsRUFBd0IsSUFBeEIsRUFBOEIsUUFBOUIsRUFBd0MsdUJBQXhDLEVBQWlFLElBQWpFLENBQVI7QUFDQSxTQUFPLEVBQUUsZUFBVDtBQUNEOztBQUdEO0FBQ0EsU0FBUyxTQUFULENBQW1CLElBQW5CLEVBQXlCLElBQXpCLEVBQStCLFFBQS9CLEVBQXlDO0FBQ3ZDLE9BQUssT0FBTyxLQUFLLFVBQWpCLEVBQThCLElBQTlCLEVBQXFDLE9BQU8sS0FBSyxXQUFqRCxFQUE4RDtBQUM1RCxRQUFJLFNBQVMsSUFBVCxNQUFtQixJQUFuQixJQUEyQixFQUFFLFFBQUYsS0FBZSxDQUE5QyxFQUFpRDtBQUNsRDtBQUNELFNBQU8sSUFBUDtBQUNEOzs7QUNsSkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbE1BLElBQU0sY0FBYyxRQUFRLGFBQVIsQ0FBcEI7O0FBRUEsSUFBTSxPQUFPLFNBQVAsSUFBTyxHQUFNO0FBQ2YsTUFBRSxNQUFGLEVBQVUsTUFBVixDQUFpQixJQUFqQjtBQUNBLFFBQU0sVUFBVSxTQUFTLGFBQVQsQ0FBdUIsZUFBdkIsQ0FBaEI7QUFDQSxRQUFJLFdBQUosQ0FBZ0IsT0FBaEI7QUFDSCxDQUpEOztBQU1BLElBQU0sdUJBQXVCLFNBQXZCLG9CQUF1QixHQUFNO0FBQy9CLE1BQUUsb0JBQUYsRUFBd0IsV0FBeEIsQ0FBb0MsZUFBcEM7QUFDSCxDQUZEOztBQUlBLElBQU0scUJBQXFCLFNBQXJCLGtCQUFxQixHQUFNO0FBQzdCLE1BQUUsa0JBQUYsRUFBc0IsV0FBdEIsQ0FBa0MsYUFBbEM7QUFDSCxDQUZEOztBQUlBLElBQU0sb0JBQW9CLFNBQXBCLGlCQUFvQixHQUFNO0FBQzVCLE1BQUUsa0JBQUYsRUFBc0IsV0FBdEIsQ0FBa0MsY0FBbEM7QUFDQSxNQUFFLG9CQUFGLEVBQXdCLFdBQXhCLENBQW9DLGNBQXBDO0FBQ0gsQ0FIRDs7QUFLQSxJQUFNLHlnRUFBTjs7QUFnRkEsSUFBTSxzREFFSSxNQUZKLDBkQUFOOztBQWVBLE9BQU8sT0FBUCxHQUFpQjtBQUNiLGNBRGE7QUFFYiw4Q0FGYTtBQUdiLDBDQUhhO0FBSWI7QUFKYSxDQUFqQjs7Ozs7QUNwSEEsSUFBTSxRQUFRLFFBQVEsdUJBQVIsQ0FBZDtBQUNBLElBQU0sVUFBVSxRQUFRLGdCQUFSLENBQWhCO0FBQ0EsT0FBTyxNQUFQLEdBQWdCLE9BQWhCOztBQUVBLElBQU0sT0FBTyxTQUFQLElBQU8sR0FBTTtBQUNmLE1BQUUsTUFBRixFQUFVLE1BQVYsQ0FBaUIsSUFBakI7QUFDSCxDQUZEOztBQUlBLElBQUksU0FBUyxFQUFiOztBQUVBLElBQU0sU0FBUyxTQUFULE1BQVMsQ0FBQyxXQUFELEVBQWMsY0FBZCxFQUFpQztBQUM1QyxNQUFFLHFCQUFGLEVBQXlCLEtBQXpCO0FBQ0EsYUFBUyxXQUFUO0FBQ0EsU0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLE9BQU8sTUFBM0IsRUFBbUMsR0FBbkM7QUFBd0MsaUJBQVMsQ0FBVCxFQUFZLGNBQVo7QUFBeEMsS0FDQTtBQUNILENBTEQ7O0FBT0EsSUFBTSxhQUFhLFNBQWIsVUFBYSxHQUFNO0FBQ3JCLFFBQUksbUJBQW1CLEVBQUUsMkJBQUYsRUFBK0IsSUFBL0IsRUFBdkI7QUFDQSxRQUFJLENBQUMsaUJBQWlCLE1BQXRCLEVBQThCOztBQUU5QixRQUFJLENBQUMsUUFBUSxnQkFBUixDQUFMLEVBQWdDO0FBQzVCLFlBQUksWUFBYSxFQUFFLGNBQUYsRUFBa0IsU0FBbEIsRUFBakI7QUFDQSxVQUFFLGNBQUYsRUFBa0IsSUFBbEIsR0FBeUIsT0FBekIsQ0FBaUM7QUFDN0IsdUJBQVcsWUFBWTtBQURNLFNBQWpDO0FBR0g7QUFDSixDQVZEOztBQVlBLElBQU0sV0FBVyxTQUFYLFFBQVcsQ0FBQyxLQUFELEVBQVEsY0FBUixFQUEyQjtBQUN4QyxRQUFJLFFBQVEsT0FBTyxLQUFQLENBQVo7QUFDQSxVQUFNLEtBQU4sR0FBYyxLQUFkOztBQUVBLFFBQUksTUFBTSxNQUFWLEVBQWtCLE1BQU0sTUFBTixHQUFlLFFBQWYsQ0FBbEIsS0FDSyxNQUFNLE1BQU4sR0FBZSxTQUFTLGNBQVQsR0FBMEIsUUFBMUIsR0FBb0MsU0FBbkQ7O0FBR0wsUUFBSSxNQUFNLElBQU4sS0FBZSxNQUFmLElBQXlCLE1BQU0sUUFBTixHQUFpQixHQUE5QyxFQUFtRDs7QUFFbkQsVUFBTSxVQUFOLEdBQW1CLG9CQUFvQixNQUFNLElBQTFCLENBQW5COztBQUVBLFFBQUksTUFBTSxLQUFOLEtBQWdCLENBQXBCLEVBQXVCLE9BQU8sTUFBTSxLQUFiLENBWmlCLENBWUc7QUFDM0MsUUFBSSxNQUFNLEtBQVYsRUFBaUIsTUFBTSxHQUFOLEdBQVksYUFBYSxNQUFNLEtBQW5CLENBQVo7O0FBRWpCLE1BQUUscUJBQUYsRUFBeUIsTUFBekIsQ0FBZ0MsZ0JBQWdCLEtBQWhCLENBQWhDO0FBQ0gsQ0FoQkQ7O0FBa0JBLElBQU0sc0JBQXNCLFNBQXRCLG1CQUFzQixDQUFDLElBQUQsRUFBVTtBQUNsQyxRQUFJLGFBQWEsRUFBakI7QUFDQSxRQUFJLENBQUMsSUFBTCxFQUFXLE9BQU8sVUFBUDs7QUFFWCxRQUFJLFVBQVUsTUFBTSxNQUFOLENBQWEsSUFBYixFQUFtQixRQUFuQixDQUFkO0FBQ0EsUUFBSSxDQUFDLE9BQUwsRUFBYztBQUNWLGVBQU8sVUFBUDtBQUNIOztBQUVELGtCQUFjLFFBQVEsT0FBUixRQUFxQixRQUFRLE9BQTdCLEdBQXdDLEVBQXREO0FBQ0Esa0JBQWMsUUFBUSxFQUFSLFNBQWlCLFFBQVEsRUFBekIsR0FBK0IsRUFBN0M7QUFDQSxrQkFBYyxRQUFRLFNBQVIsU0FBd0IsUUFBUSxTQUFoQyxHQUE2QyxFQUEzRDtBQUNBLGtCQUFjLFFBQVEsSUFBUixTQUFtQixRQUFRLElBQTNCLFNBQW9DLEVBQWxEO0FBQ0EsV0FBTyxVQUFQO0FBQ0gsQ0FkRDs7QUFnQkEsSUFBTSxlQUFlLFNBQWYsWUFBZSxDQUFDLEtBQUQsRUFBVztBQUM1QixRQUFJLE1BQU07QUFDTixXQUFHLEdBREc7QUFFTixZQUFJLEdBRkU7QUFHTixZQUFJLEdBSEUsQ0FHRTtBQUhGLEtBQVY7QUFLQSxXQUFPLElBQUksS0FBSixLQUFjLE9BQU8sWUFBUCxDQUFvQixLQUFwQixDQUFyQjtBQUNILENBUEQ7O0FBU0EsSUFBTSwrbERBQU47O0FBa0VBLElBQU0scURBRUksTUFGSiw2SkFBTjs7QUFZQSxJQUFNLGdCQUFnQixTQUFoQixhQUFnQixDQUFDLElBQUQsRUFBTyxJQUFQLEVBQWdCO0FBQ2xDLFFBQUksQ0FBQyxJQUFMLEVBQVc7QUFDWCxRQUFJLFNBQVMsVUFBYixFQUF5QixzQkFBb0IsSUFBcEI7QUFDekIsK0NBQXlDLElBQXpDLFVBQWtELElBQWxEO0FBQ0gsQ0FKRDs7QUFNQSxJQUFNLGtCQUFrQixTQUFsQixlQUFrQixPQUFzRDtBQUFBLFFBQXBELElBQW9ELFFBQXBELElBQW9EO0FBQUEsUUFBOUMsUUFBOEMsUUFBOUMsUUFBOEM7QUFBQSxRQUFwQyxHQUFvQyxRQUFwQyxHQUFvQztBQUFBLFFBQS9CLFVBQStCLFFBQS9CLFVBQStCO0FBQUEsUUFBbkIsTUFBbUIsUUFBbkIsTUFBbUI7QUFBQSxRQUFYLEtBQVcsUUFBWCxLQUFXOztBQUMxRSx1RkFFcUQsTUFGckQsa0NBR3FCLEtBSHJCLHlGQUs4RCxLQUw5RCxnQ0FNVSxjQUFjLFVBQWQsRUFBMEIsWUFBMUIsQ0FOVixzQkFPVSxjQUFjLFFBQWQsRUFBd0IsVUFBeEIsQ0FQVix3QkFTVSxjQUFjLEdBQWQsRUFBbUIsS0FBbkIsQ0FUVixzQkFVVSxjQUFjLElBQWQsRUFBb0IsTUFBcEIsQ0FWVjtBQWFILENBZEQ7O0FBZ0JBLElBQU0sbUJBQW1CLFNBQW5CLGdCQUFtQixDQUFDLEtBQUQsRUFBVztBQUNoQyxRQUFJLDhDQUE0QyxLQUE1QyxNQUFKO0FBQ0EsTUFBRSxRQUFGLEVBQVksV0FBWixDQUF3QiwwQkFBeEI7O0FBRUE7QUFDQSxRQUFJLGlCQUFpQixFQUFFLDJCQUFGLEVBQStCLElBQS9CLEVBQXJCO0FBQ0EsUUFBSSxRQUFRLGVBQWUsSUFBZixDQUFvQixPQUFwQixDQUFaLEVBQTBDLEVBQUUsUUFBRixFQUFZLFdBQVosQ0FBd0IsMEJBQXhCLEVBQTFDLEtBQ0ssRUFBRSxRQUFGLEVBQVksV0FBWixDQUF3QiwyQkFBeEI7QUFDUixDQVJEOztBQVVBLE9BQU8sT0FBUCxHQUFpQjtBQUNiLGNBRGE7QUFFYixrQkFGYTtBQUdiO0FBSGEsQ0FBakI7Ozs7Ozs7Ozs7O0FDdExBO0FBQ0EsSUFBTSxRQUFRLFFBQVEsdUJBQVIsQ0FBZDs7QUFFQTtBQUNBLFFBQVEsMkJBQVI7O0FBRUEsSUFBTSxXQUFXLFFBQVEsWUFBUixDQUFqQjtBQUNBLElBQU0sVUFBVSxRQUFRLFdBQVIsQ0FBaEI7O0FBRUE7QUFDQSxJQUFNLGFBQWEsQ0FBQyxPQUFELEVBQVUsVUFBVixFQUFzQixVQUF0QixDQUFuQjs7QUFFQTtBQUNBLElBQU0sb0JBQW9CLENBQUMsU0FBRCxDQUExQjs7QUFFQSxJQUFJLFNBQVMsRUFBYjs7QUFFQTtBQUNBLElBQU0sbUJBQW1CLFNBQW5CLGdCQUFtQixHQUFNO0FBQzNCLFFBQUksV0FBVyxFQUFmO0FBQ0EsZUFBVyxHQUFYLENBQWU7QUFBQSxlQUFRLFNBQVMsSUFBVCxJQUFpQixXQUF6QjtBQUFBLEtBQWY7QUFDQSxzQkFBa0IsR0FBbEIsQ0FBc0I7QUFBQSxlQUFRLFNBQVMsSUFBVCxJQUFpQixXQUF6QjtBQUFBLEtBQXRCO0FBQ0EsV0FBTyxRQUFQO0FBQ0gsQ0FMRDs7QUFPQSxJQUFNLHVCQUF1QixTQUF2QixvQkFBdUIsR0FBTTtBQUMvQixNQUFFLE1BQUYsRUFBVSxTQUFWLENBQW9CLG9DQUFwQjtBQUNILENBRkQ7O0FBSUEsSUFBTSxpQkFBaUIsU0FBakIsY0FBaUIsR0FBTTtBQUN6QixRQUFJLFdBQVcsa0JBQWY7QUFDQSxNQUFFLGlCQUFGLEVBQXFCLEVBQXJCLENBQXdCLFFBQXhCO0FBQ0gsQ0FIRDs7QUFLQSxJQUFNLGlCQUFpQixTQUFqQixjQUFpQixHQUFNO0FBQ3pCLFFBQUksV0FBVyxrQkFBZjtBQUNBLE1BQUUsaUJBQUYsRUFBcUIsR0FBckIsQ0FBeUIsUUFBekI7QUFDSCxDQUhEOztBQUtBLElBQU0sY0FBYyxTQUFkLFdBQWMsQ0FBQyxLQUFELEVBQVc7QUFDM0I7QUFDQSxRQUFJLENBQUMsV0FBVyxRQUFYLENBQW9CLE1BQU0sSUFBMUIsQ0FBTCxFQUFzQztBQUNsQztBQUNBLFlBQUksa0JBQWtCLFFBQWxCLENBQTJCLE1BQU0sSUFBakMsQ0FBSixFQUE0QyxZQUFZLEtBQVo7QUFDNUM7QUFDSDs7QUFFRDs7Ozs7Ozs7O0FBU0EsUUFBSSxNQUFNLGNBQVYsRUFBMEIsTUFBTSxjQUFOOztBQUUxQjtBQUNBLFdBQU8sSUFBUCxDQUFZLGNBQVo7O0FBRUEsUUFBSSxpQkFBaUI7QUFDakIsY0FBTSxNQUFNLElBREs7QUFFakIsZUFBTyxNQUFNLEtBRkk7QUFHakIsY0FBTSxNQUFNLFFBQU4sQ0FBZSxNQUFNLE1BQXJCLEVBQTZCLFFBQTdCO0FBSFcsS0FBckI7QUFLQSxXQUFPLElBQVAsQ0FBWSxjQUFaOztBQUVBLFFBQUksQ0FBQyxNQUFNLEtBQVgsRUFBa0IsVUFBVSxjQUFWO0FBQ3JCLENBOUJEOztBQWdDQSxJQUFNLGNBQWMsU0FBZCxXQUFjLENBQUMsS0FBRCxFQUFXO0FBQzNCO0FBQ0EsUUFBSSxNQUFNLElBQU4sS0FBZSxTQUFmLElBQTRCLE1BQU0sS0FBTixLQUFnQixDQUFoRCxFQUFtRCxjQUFjLEtBQWQ7QUFDdEQsQ0FIRDs7QUFLQSxJQUFNLGdCQUFnQixTQUFoQixhQUFnQixPQUFxQjtBQUFBLFFBQW5CLEtBQW1CLFFBQW5CLEtBQW1CO0FBQUEsUUFBWixNQUFZLFFBQVosTUFBWTs7QUFDdkMsUUFBSSxjQUFjO0FBQ2QsY0FBTSxVQURRO0FBRWQsb0JBRmM7QUFHZCxzQkFIYztBQUlkLGVBQU87QUFKTyxLQUFsQjtBQU1BLGdCQUFZLFdBQVo7QUFDSCxDQVJEOztBQVVBLElBQUksMkJBQUo7QUFDQSxJQUFNLGVBQWUsU0FBZixZQUFlLEdBQU07QUFDdkIsUUFBSSxNQUFNLElBQUksSUFBSixHQUFXLE9BQVgsRUFBVjtBQUNBLFFBQUksUUFBUTtBQUNSLGNBQU0sTUFERTtBQUVSO0FBQ0Esa0JBQVcsTUFBTSxrQkFBUCxJQUE4QjtBQUhoQyxLQUFaOztBQU1BLHlCQUFxQixHQUFyQjtBQUNBLFdBQU8sS0FBUDtBQUNILENBVkQ7O0FBWUEsSUFBTSxhQUFhLFNBQWIsVUFBYSxDQUFDLElBQUQsRUFBVTtBQUN6QixXQUFPLE1BQU0sTUFBTixDQUFhLElBQWIsRUFBbUIsUUFBbkIsQ0FBUDtBQUNILENBRkQ7O0FBSUE7QUFDQSxJQUFNLFlBQVksU0FBWixTQUFZLENBQUMsS0FBRCxFQUFXO0FBQ3pCO0FBQ0EsV0FBTyx1QkFBWSxtQkFBVztBQUMxQjs7OztBQUlBOztBQUVBOzs7O0FBSUEsWUFBSSxNQUFNLE1BQVYsRUFBa0I7QUFDZCxnQkFBSSxTQUFKLEdBQWdCLE1BQU0sS0FBdEI7QUFDQSxxQkFBUyxpQkFBVDtBQUNBO0FBQ0g7O0FBRUQ7Ozs7QUFJQSwrQkFBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQXFCO0FBQzdCLGdCQUFJLE9BQU8sTUFBTSxJQUFqQjtBQUNBO0FBQ0EsZ0JBQUksU0FBUyxPQUFiLEVBQXNCLE1BQU0sS0FBTixFQUFhLE9BQWI7QUFDdEIsZ0JBQUksU0FBUyxVQUFiLEVBQXlCLFNBQVMsS0FBVCxFQUFnQixPQUFoQixFQUF6QixLQUNLLElBQUksU0FBUyxVQUFiLEVBQXlCLFNBQVMsS0FBVCxFQUFnQixPQUFoQixFQUF6QixLQUNBLElBQUksU0FBUyxNQUFiLEVBQXFCLEtBQUssS0FBTCxFQUFZLE9BQVosRUFBckIsS0FDQSxPQUFPLElBQUksS0FBSixDQUFVLG9DQUFWLENBQVA7QUFDUixTQVJELEVBUUcsSUFSSCxDQVFRLFlBQU07QUFDVjtBQUNBLDhCQUZVLENBRVM7QUFDbkI7QUFDSCxTQVpEO0FBYUgsS0FsQ00sQ0FBUDtBQW1DSCxDQXJDRDs7QUF1Q0E7Ozs7Ozs7QUFPQSxJQUFNLFFBQVEsU0FBUixLQUFRLFFBQVMsT0FBVCxFQUFxQjtBQUFBLFFBQW5CLElBQW1CLFNBQW5CLElBQW1COztBQUMvQixRQUFJLFVBQVUsV0FBVyxJQUFYLENBQWQ7QUFDQSxNQUFFLE9BQUYsRUFBVyxPQUFYLENBQW1CLE9BQW5CO0FBQ0E7QUFDSCxDQUpEOztBQU1BLElBQU0sV0FBVyxTQUFYLFFBQVcsUUFBUyxPQUFULEVBQXFCO0FBQUEsUUFBbkIsSUFBbUIsU0FBbkIsSUFBbUI7O0FBQ2xDLFFBQUksVUFBVSxXQUFXLElBQVgsQ0FBZDtBQUNBLE1BQUUsT0FBRixFQUFXLE9BQVgsQ0FBbUIsVUFBbkI7QUFDQTtBQUNILENBSkQ7O0FBTUEsSUFBTSxXQUFXLFNBQVgsUUFBVyxRQUFlLE9BQWYsRUFBMkI7QUFBQSxRQUF6QixJQUF5QixTQUF6QixJQUF5QjtBQUFBLFFBQW5CLEtBQW1CLFNBQW5CLEtBQW1COztBQUN4QyxRQUFJLFVBQVUsV0FBVyxJQUFYLENBQWQ7QUFDQSxRQUFJLGVBQWUsRUFBRSxPQUFGLEVBQVcsR0FBWCxFQUFuQjtBQUNBLFFBQUksVUFBVSxDQUFkLEVBQWlCO0FBQ2I7QUFDQSxVQUFFLE9BQUYsRUFBVyxHQUFYLENBQWUsYUFBYSxTQUFiLENBQXVCLENBQXZCLEVBQTBCLGFBQWEsTUFBYixHQUFvQixDQUE5QyxDQUFmO0FBQ0gsS0FIRCxNQUdPO0FBQ0gsWUFBSSxNQUFNLE9BQU8sWUFBUCxDQUFvQixLQUFwQixDQUFWO0FBQ0E7QUFDQSxVQUFFLE9BQUYsRUFBVyxHQUFYLENBQWUsZUFBZSxHQUE5QjtBQUNIO0FBQ0Q7QUFDQSxNQUFFLE9BQUYsRUFBVyxPQUFYLENBQW1CLE9BQU8sS0FBUCxDQUFhLFNBQWIsRUFBd0IsRUFBQyxZQUFELEVBQXhCLENBQW5CO0FBQ0EsTUFBRSxPQUFGLEVBQVcsT0FBWCxDQUFtQixPQUFPLEtBQVAsQ0FBYSxPQUFiLEVBQXNCLEVBQUMsWUFBRCxFQUF0QixDQUFuQjtBQUNBO0FBQ0gsQ0FmRDs7QUFpQkEsSUFBTSxPQUFPLFNBQVAsSUFBTyxRQUFhLE9BQWIsRUFBeUI7QUFBQSxRQUF2QixRQUF1QixTQUF2QixRQUF1Qjs7QUFDbEMsZUFBVztBQUFBLGVBQU0sU0FBTjtBQUFBLEtBQVgsRUFBNEIsUUFBNUI7QUFDSCxDQUZEOztBQUlBO0FBQ0EsSUFBTSxPQUFPLFNBQVAsSUFBTyxHQUFNO0FBQ2YsYUFBUyxrQkFBVDtBQUNBLDBCQUFzQixDQUF0QjtBQUNILENBSEQ7O0FBS0EsSUFBTSxnQkFBZ0IsU0FBaEIsYUFBZ0IsR0FBTTtBQUN4QixRQUFJLFdBQUosRUFBaUI7QUFDakIsaUJBQWEsT0FBYixDQUFxQixjQUFyQixFQUFxQyxJQUFyQztBQUNBLGFBQVMsTUFBVDtBQUNILENBSkQ7O0FBTUEsSUFBTSxlQUFlLFNBQWYsWUFBZSxHQUFNO0FBQ3ZCLGFBQVMsS0FBSyxLQUFMLENBQVcsYUFBYSxPQUFiLENBQXFCLEtBQXJCLENBQVgsRUFBd0MsTUFBakQ7QUFDQSxZQUFRLElBQVI7QUFDQSxZQUFRLE1BQVIsQ0FBZSxNQUFmO0FBQ0E7QUFDQSxpQkFBYSxVQUFiLENBQXdCLGNBQXhCO0FBQ0gsQ0FORDs7QUFRQSxJQUFNLGlCQUFpQixTQUFqQixjQUFpQixHQUFNO0FBQ3pCLFFBQUksUUFBUSxJQUFJLFNBQWhCO0FBQ0EsYUFBUyxpQkFBVDtBQUNBLDBCQUFzQixFQUFFLEtBQXhCO0FBQ0gsQ0FKRDs7QUFNQSxJQUFNLHdCQUF3QixTQUF4QixxQkFBd0IsQ0FBQyxLQUFELEVBQVc7QUFDckMsUUFBSSxDQUFDLE9BQU8sS0FBUCxDQUFMLEVBQW9CO0FBQ2hCLGlCQUFTLGtCQUFUO0FBQ0E7QUFDSDtBQUNEOzs7Ozs7QUFNQSxZQUFRLE1BQVIsQ0FBZSxNQUFmLEVBQXVCLEtBQXZCO0FBQ0EsWUFBUSxHQUFSLENBQVksS0FBSyxTQUFMLENBQWUsT0FBTyxLQUFQLENBQWYsQ0FBWjs7QUFFQTtBQUNBLGNBQVUsT0FBTyxLQUFQLENBQVYsRUFBeUIsSUFBekIsQ0FBOEI7QUFBQSxlQUFNLHNCQUFzQixFQUFFLEtBQXhCLENBQU47QUFBQSxLQUE5QjtBQUNILENBaEJEOztBQWtCQSxJQUFJLGNBQWMsS0FBbEI7QUFDQSxJQUFNLGtCQUFrQixTQUFsQixlQUFrQixHQUFNO0FBQzFCLFFBQUksV0FBSixFQUFpQixnQkFBakIsS0FDSztBQUNMLGFBQVMsb0JBQVQ7QUFDSCxDQUpEOztBQU1BLElBQU0sU0FBUyxTQUFULE1BQVMsR0FBTTtBQUNqQixhQUFTLEVBQVQ7QUFDQTtBQUNILENBSEQ7O0FBS0EsSUFBTSxnQkFBZ0IsU0FBaEIsYUFBZ0IsR0FBTTtBQUN4QjtBQUNBLGtCQUFjLEtBQWQ7QUFDQTtBQUNILENBSkQ7O0FBTUEsSUFBTSxnQkFBZ0IsU0FBaEIsYUFBZ0I7QUFBQSxXQUFNLGFBQWEsT0FBYixDQUFxQixLQUFyQixFQUE0QixLQUFLLFNBQUwsQ0FBZSxFQUFDLGNBQUQsRUFBZixDQUE1QixDQUFOO0FBQUEsQ0FBdEI7O0FBRUEsSUFBTSxrQkFBa0IsU0FBbEIsZUFBa0IsR0FBTTtBQUMxQjtBQUNBLGtCQUFjLElBQWQ7QUFDSCxDQUhEOztBQUtBLElBQU0sUUFBUSxTQUFSLEtBQVEsQ0FBQyxLQUFELEVBQVc7QUFDckIsV0FBTyxLQUFQLEVBQWMsTUFBZCxHQUF1QixDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQVAsRUFBYyxNQUF4QyxDQURxQixDQUMyQjtBQUNoRDtBQUNBLFlBQVEsZ0JBQVIsQ0FBeUIsS0FBekI7QUFDSCxDQUpEOztBQU1BLEVBQUUsWUFBTTtBQUNKO0FBQ0EsV0FBTyxHQUFQLEdBQWE7QUFDVCxzQkFEUztBQUVULHdDQUZTO0FBR1Qsb0NBSFM7QUFJVCxvQkFKUztBQUtUO0FBTFMsS0FBYjtBQU9BO0FBQ0EsYUFBUyxJQUFUOztBQUVBLFFBQUksV0FBVyxhQUFhLE9BQWIsQ0FBcUIsY0FBckIsQ0FBZjtBQUNBLFFBQUksUUFBSixFQUFjO0FBQ2pCLENBZEQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyogQHByZXNlcnZlXG4gKiBUaGUgTUlUIExpY2Vuc2UgKE1JVClcbiAqIFxuICogQ29weXJpZ2h0IChjKSAyMDEzLTIwMTUgUGV0a2EgQW50b25vdlxuICogXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKiBcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqIFxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuICogVEhFIFNPRlRXQVJFLlxuICogXG4gKi9cbi8qKlxuICogYmx1ZWJpcmQgYnVpbGQgdmVyc2lvbiAzLjQuNlxuICogRmVhdHVyZXMgZW5hYmxlZDogY29yZSwgcmFjZSwgY2FsbF9nZXQsIGdlbmVyYXRvcnMsIG1hcCwgbm9kZWlmeSwgcHJvbWlzaWZ5LCBwcm9wcywgcmVkdWNlLCBzZXR0bGUsIHNvbWUsIHVzaW5nLCB0aW1lcnMsIGZpbHRlciwgYW55LCBlYWNoXG4qL1xuIWZ1bmN0aW9uKGUpe2lmKFwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzJiZcInVuZGVmaW5lZFwiIT10eXBlb2YgbW9kdWxlKW1vZHVsZS5leHBvcnRzPWUoKTtlbHNlIGlmKFwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZClkZWZpbmUoW10sZSk7ZWxzZXt2YXIgZjtcInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93P2Y9d2luZG93OlwidW5kZWZpbmVkXCIhPXR5cGVvZiBnbG9iYWw/Zj1nbG9iYWw6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHNlbGYmJihmPXNlbGYpLGYuUHJvbWlzZT1lKCl9fShmdW5jdGlvbigpe3ZhciBkZWZpbmUsbW9kdWxlLGV4cG9ydHM7cmV0dXJuIChmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgX2RlcmVxXz09XCJmdW5jdGlvblwiJiZfZGVyZXFfO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiBfZGVyZXFfPT1cImZ1bmN0aW9uXCImJl9kZXJlcV87Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pKHsxOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcblwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihQcm9taXNlKSB7XG52YXIgU29tZVByb21pc2VBcnJheSA9IFByb21pc2UuX1NvbWVQcm9taXNlQXJyYXk7XG5mdW5jdGlvbiBhbnkocHJvbWlzZXMpIHtcbiAgICB2YXIgcmV0ID0gbmV3IFNvbWVQcm9taXNlQXJyYXkocHJvbWlzZXMpO1xuICAgIHZhciBwcm9taXNlID0gcmV0LnByb21pc2UoKTtcbiAgICByZXQuc2V0SG93TWFueSgxKTtcbiAgICByZXQuc2V0VW53cmFwKCk7XG4gICAgcmV0LmluaXQoKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuUHJvbWlzZS5hbnkgPSBmdW5jdGlvbiAocHJvbWlzZXMpIHtcbiAgICByZXR1cm4gYW55KHByb21pc2VzKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmFueSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gYW55KHRoaXMpO1xufTtcblxufTtcblxufSx7fV0sMjpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG5cInVzZSBzdHJpY3RcIjtcbnZhciBmaXJzdExpbmVFcnJvcjtcbnRyeSB7dGhyb3cgbmV3IEVycm9yKCk7IH0gY2F0Y2ggKGUpIHtmaXJzdExpbmVFcnJvciA9IGU7fVxudmFyIHNjaGVkdWxlID0gX2RlcmVxXyhcIi4vc2NoZWR1bGVcIik7XG52YXIgUXVldWUgPSBfZGVyZXFfKFwiLi9xdWV1ZVwiKTtcbnZhciB1dGlsID0gX2RlcmVxXyhcIi4vdXRpbFwiKTtcblxuZnVuY3Rpb24gQXN5bmMoKSB7XG4gICAgdGhpcy5fY3VzdG9tU2NoZWR1bGVyID0gZmFsc2U7XG4gICAgdGhpcy5faXNUaWNrVXNlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2xhdGVRdWV1ZSA9IG5ldyBRdWV1ZSgxNik7XG4gICAgdGhpcy5fbm9ybWFsUXVldWUgPSBuZXcgUXVldWUoMTYpO1xuICAgIHRoaXMuX2hhdmVEcmFpbmVkUXVldWVzID0gZmFsc2U7XG4gICAgdGhpcy5fdHJhbXBvbGluZUVuYWJsZWQgPSB0cnVlO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLmRyYWluUXVldWVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLl9kcmFpblF1ZXVlcygpO1xuICAgIH07XG4gICAgdGhpcy5fc2NoZWR1bGUgPSBzY2hlZHVsZTtcbn1cblxuQXN5bmMucHJvdG90eXBlLnNldFNjaGVkdWxlciA9IGZ1bmN0aW9uKGZuKSB7XG4gICAgdmFyIHByZXYgPSB0aGlzLl9zY2hlZHVsZTtcbiAgICB0aGlzLl9zY2hlZHVsZSA9IGZuO1xuICAgIHRoaXMuX2N1c3RvbVNjaGVkdWxlciA9IHRydWU7XG4gICAgcmV0dXJuIHByZXY7XG59O1xuXG5Bc3luYy5wcm90b3R5cGUuaGFzQ3VzdG9tU2NoZWR1bGVyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2N1c3RvbVNjaGVkdWxlcjtcbn07XG5cbkFzeW5jLnByb3RvdHlwZS5lbmFibGVUcmFtcG9saW5lID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fdHJhbXBvbGluZUVuYWJsZWQgPSB0cnVlO1xufTtcblxuQXN5bmMucHJvdG90eXBlLmRpc2FibGVUcmFtcG9saW5lSWZOZWNlc3NhcnkgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodXRpbC5oYXNEZXZUb29scykge1xuICAgICAgICB0aGlzLl90cmFtcG9saW5lRW5hYmxlZCA9IGZhbHNlO1xuICAgIH1cbn07XG5cbkFzeW5jLnByb3RvdHlwZS5oYXZlSXRlbXNRdWV1ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzVGlja1VzZWQgfHwgdGhpcy5faGF2ZURyYWluZWRRdWV1ZXM7XG59O1xuXG5cbkFzeW5jLnByb3RvdHlwZS5mYXRhbEVycm9yID0gZnVuY3Rpb24oZSwgaXNOb2RlKSB7XG4gICAgaWYgKGlzTm9kZSkge1xuICAgICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZShcIkZhdGFsIFwiICsgKGUgaW5zdGFuY2VvZiBFcnJvciA/IGUuc3RhY2sgOiBlKSArXG4gICAgICAgICAgICBcIlxcblwiKTtcbiAgICAgICAgcHJvY2Vzcy5leGl0KDIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGhyb3dMYXRlcihlKTtcbiAgICB9XG59O1xuXG5Bc3luYy5wcm90b3R5cGUudGhyb3dMYXRlciA9IGZ1bmN0aW9uKGZuLCBhcmcpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICBhcmcgPSBmbjtcbiAgICAgICAgZm4gPSBmdW5jdGlvbiAoKSB7IHRocm93IGFyZzsgfTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBmbihhcmcpO1xuICAgICAgICB9LCAwKTtcbiAgICB9IGVsc2UgdHJ5IHtcbiAgICAgICAgdGhpcy5fc2NoZWR1bGUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBmbihhcmcpO1xuICAgICAgICB9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGFzeW5jIHNjaGVkdWxlciBhdmFpbGFibGVcXHUwMDBhXFx1MDAwYSAgICBTZWUgaHR0cDovL2dvby5nbC9NcXJGbVhcXHUwMDBhXCIpO1xuICAgIH1cbn07XG5cbmZ1bmN0aW9uIEFzeW5jSW52b2tlTGF0ZXIoZm4sIHJlY2VpdmVyLCBhcmcpIHtcbiAgICB0aGlzLl9sYXRlUXVldWUucHVzaChmbiwgcmVjZWl2ZXIsIGFyZyk7XG4gICAgdGhpcy5fcXVldWVUaWNrKCk7XG59XG5cbmZ1bmN0aW9uIEFzeW5jSW52b2tlKGZuLCByZWNlaXZlciwgYXJnKSB7XG4gICAgdGhpcy5fbm9ybWFsUXVldWUucHVzaChmbiwgcmVjZWl2ZXIsIGFyZyk7XG4gICAgdGhpcy5fcXVldWVUaWNrKCk7XG59XG5cbmZ1bmN0aW9uIEFzeW5jU2V0dGxlUHJvbWlzZXMocHJvbWlzZSkge1xuICAgIHRoaXMuX25vcm1hbFF1ZXVlLl9wdXNoT25lKHByb21pc2UpO1xuICAgIHRoaXMuX3F1ZXVlVGljaygpO1xufVxuXG5pZiAoIXV0aWwuaGFzRGV2VG9vbHMpIHtcbiAgICBBc3luYy5wcm90b3R5cGUuaW52b2tlTGF0ZXIgPSBBc3luY0ludm9rZUxhdGVyO1xuICAgIEFzeW5jLnByb3RvdHlwZS5pbnZva2UgPSBBc3luY0ludm9rZTtcbiAgICBBc3luYy5wcm90b3R5cGUuc2V0dGxlUHJvbWlzZXMgPSBBc3luY1NldHRsZVByb21pc2VzO1xufSBlbHNlIHtcbiAgICBBc3luYy5wcm90b3R5cGUuaW52b2tlTGF0ZXIgPSBmdW5jdGlvbiAoZm4sIHJlY2VpdmVyLCBhcmcpIHtcbiAgICAgICAgaWYgKHRoaXMuX3RyYW1wb2xpbmVFbmFibGVkKSB7XG4gICAgICAgICAgICBBc3luY0ludm9rZUxhdGVyLmNhbGwodGhpcywgZm4sIHJlY2VpdmVyLCBhcmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fc2NoZWR1bGUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgZm4uY2FsbChyZWNlaXZlciwgYXJnKTtcbiAgICAgICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQXN5bmMucHJvdG90eXBlLmludm9rZSA9IGZ1bmN0aW9uIChmbiwgcmVjZWl2ZXIsIGFyZykge1xuICAgICAgICBpZiAodGhpcy5fdHJhbXBvbGluZUVuYWJsZWQpIHtcbiAgICAgICAgICAgIEFzeW5jSW52b2tlLmNhbGwodGhpcywgZm4sIHJlY2VpdmVyLCBhcmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fc2NoZWR1bGUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZm4uY2FsbChyZWNlaXZlciwgYXJnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIEFzeW5jLnByb3RvdHlwZS5zZXR0bGVQcm9taXNlcyA9IGZ1bmN0aW9uKHByb21pc2UpIHtcbiAgICAgICAgaWYgKHRoaXMuX3RyYW1wb2xpbmVFbmFibGVkKSB7XG4gICAgICAgICAgICBBc3luY1NldHRsZVByb21pc2VzLmNhbGwodGhpcywgcHJvbWlzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9zY2hlZHVsZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBwcm9taXNlLl9zZXR0bGVQcm9taXNlcygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5Bc3luYy5wcm90b3R5cGUuaW52b2tlRmlyc3QgPSBmdW5jdGlvbiAoZm4sIHJlY2VpdmVyLCBhcmcpIHtcbiAgICB0aGlzLl9ub3JtYWxRdWV1ZS51bnNoaWZ0KGZuLCByZWNlaXZlciwgYXJnKTtcbiAgICB0aGlzLl9xdWV1ZVRpY2soKTtcbn07XG5cbkFzeW5jLnByb3RvdHlwZS5fZHJhaW5RdWV1ZSA9IGZ1bmN0aW9uKHF1ZXVlKSB7XG4gICAgd2hpbGUgKHF1ZXVlLmxlbmd0aCgpID4gMCkge1xuICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICBpZiAodHlwZW9mIGZuICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGZuLl9zZXR0bGVQcm9taXNlcygpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlY2VpdmVyID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgdmFyIGFyZyA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgIGZuLmNhbGwocmVjZWl2ZXIsIGFyZyk7XG4gICAgfVxufTtcblxuQXN5bmMucHJvdG90eXBlLl9kcmFpblF1ZXVlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl9kcmFpblF1ZXVlKHRoaXMuX25vcm1hbFF1ZXVlKTtcbiAgICB0aGlzLl9yZXNldCgpO1xuICAgIHRoaXMuX2hhdmVEcmFpbmVkUXVldWVzID0gdHJ1ZTtcbiAgICB0aGlzLl9kcmFpblF1ZXVlKHRoaXMuX2xhdGVRdWV1ZSk7XG59O1xuXG5Bc3luYy5wcm90b3R5cGUuX3F1ZXVlVGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuX2lzVGlja1VzZWQpIHtcbiAgICAgICAgdGhpcy5faXNUaWNrVXNlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuX3NjaGVkdWxlKHRoaXMuZHJhaW5RdWV1ZXMpO1xuICAgIH1cbn07XG5cbkFzeW5jLnByb3RvdHlwZS5fcmVzZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5faXNUaWNrVXNlZCA9IGZhbHNlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBBc3luYztcbm1vZHVsZS5leHBvcnRzLmZpcnN0TGluZUVycm9yID0gZmlyc3RMaW5lRXJyb3I7XG5cbn0se1wiLi9xdWV1ZVwiOjI2LFwiLi9zY2hlZHVsZVwiOjI5LFwiLi91dGlsXCI6MzZ9XSwzOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcblwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihQcm9taXNlLCBJTlRFUk5BTCwgdHJ5Q29udmVydFRvUHJvbWlzZSwgZGVidWcpIHtcbnZhciBjYWxsZWRCaW5kID0gZmFsc2U7XG52YXIgcmVqZWN0VGhpcyA9IGZ1bmN0aW9uKF8sIGUpIHtcbiAgICB0aGlzLl9yZWplY3QoZSk7XG59O1xuXG52YXIgdGFyZ2V0UmVqZWN0ZWQgPSBmdW5jdGlvbihlLCBjb250ZXh0KSB7XG4gICAgY29udGV4dC5wcm9taXNlUmVqZWN0aW9uUXVldWVkID0gdHJ1ZTtcbiAgICBjb250ZXh0LmJpbmRpbmdQcm9taXNlLl90aGVuKHJlamVjdFRoaXMsIHJlamVjdFRoaXMsIG51bGwsIHRoaXMsIGUpO1xufTtcblxudmFyIGJpbmRpbmdSZXNvbHZlZCA9IGZ1bmN0aW9uKHRoaXNBcmcsIGNvbnRleHQpIHtcbiAgICBpZiAoKCh0aGlzLl9iaXRGaWVsZCAmIDUwMzk3MTg0KSA9PT0gMCkpIHtcbiAgICAgICAgdGhpcy5fcmVzb2x2ZUNhbGxiYWNrKGNvbnRleHQudGFyZ2V0KTtcbiAgICB9XG59O1xuXG52YXIgYmluZGluZ1JlamVjdGVkID0gZnVuY3Rpb24oZSwgY29udGV4dCkge1xuICAgIGlmICghY29udGV4dC5wcm9taXNlUmVqZWN0aW9uUXVldWVkKSB0aGlzLl9yZWplY3QoZSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24gKHRoaXNBcmcpIHtcbiAgICBpZiAoIWNhbGxlZEJpbmQpIHtcbiAgICAgICAgY2FsbGVkQmluZCA9IHRydWU7XG4gICAgICAgIFByb21pc2UucHJvdG90eXBlLl9wcm9wYWdhdGVGcm9tID0gZGVidWcucHJvcGFnYXRlRnJvbUZ1bmN0aW9uKCk7XG4gICAgICAgIFByb21pc2UucHJvdG90eXBlLl9ib3VuZFZhbHVlID0gZGVidWcuYm91bmRWYWx1ZUZ1bmN0aW9uKCk7XG4gICAgfVxuICAgIHZhciBtYXliZVByb21pc2UgPSB0cnlDb252ZXJ0VG9Qcm9taXNlKHRoaXNBcmcpO1xuICAgIHZhciByZXQgPSBuZXcgUHJvbWlzZShJTlRFUk5BTCk7XG4gICAgcmV0Ll9wcm9wYWdhdGVGcm9tKHRoaXMsIDEpO1xuICAgIHZhciB0YXJnZXQgPSB0aGlzLl90YXJnZXQoKTtcbiAgICByZXQuX3NldEJvdW5kVG8obWF5YmVQcm9taXNlKTtcbiAgICBpZiAobWF5YmVQcm9taXNlIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICB2YXIgY29udGV4dCA9IHtcbiAgICAgICAgICAgIHByb21pc2VSZWplY3Rpb25RdWV1ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcHJvbWlzZTogcmV0LFxuICAgICAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgICAgICBiaW5kaW5nUHJvbWlzZTogbWF5YmVQcm9taXNlXG4gICAgICAgIH07XG4gICAgICAgIHRhcmdldC5fdGhlbihJTlRFUk5BTCwgdGFyZ2V0UmVqZWN0ZWQsIHVuZGVmaW5lZCwgcmV0LCBjb250ZXh0KTtcbiAgICAgICAgbWF5YmVQcm9taXNlLl90aGVuKFxuICAgICAgICAgICAgYmluZGluZ1Jlc29sdmVkLCBiaW5kaW5nUmVqZWN0ZWQsIHVuZGVmaW5lZCwgcmV0LCBjb250ZXh0KTtcbiAgICAgICAgcmV0Ll9zZXRPbkNhbmNlbChtYXliZVByb21pc2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldC5fcmVzb2x2ZUNhbGxiYWNrKHRhcmdldCk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5fc2V0Qm91bmRUbyA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICBpZiAob2JqICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5fYml0RmllbGQgPSB0aGlzLl9iaXRGaWVsZCB8IDIwOTcxNTI7XG4gICAgICAgIHRoaXMuX2JvdW5kVG8gPSBvYmo7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fYml0RmllbGQgPSB0aGlzLl9iaXRGaWVsZCAmICh+MjA5NzE1Mik7XG4gICAgfVxufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuX2lzQm91bmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICh0aGlzLl9iaXRGaWVsZCAmIDIwOTcxNTIpID09PSAyMDk3MTUyO1xufTtcblxuUHJvbWlzZS5iaW5kID0gZnVuY3Rpb24gKHRoaXNBcmcsIHZhbHVlKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSkuYmluZCh0aGlzQXJnKTtcbn07XG59O1xuXG59LHt9XSw0OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcblwidXNlIHN0cmljdFwiO1xudmFyIG9sZDtcbmlmICh0eXBlb2YgUHJvbWlzZSAhPT0gXCJ1bmRlZmluZWRcIikgb2xkID0gUHJvbWlzZTtcbmZ1bmN0aW9uIG5vQ29uZmxpY3QoKSB7XG4gICAgdHJ5IHsgaWYgKFByb21pc2UgPT09IGJsdWViaXJkKSBQcm9taXNlID0gb2xkOyB9XG4gICAgY2F0Y2ggKGUpIHt9XG4gICAgcmV0dXJuIGJsdWViaXJkO1xufVxudmFyIGJsdWViaXJkID0gX2RlcmVxXyhcIi4vcHJvbWlzZVwiKSgpO1xuYmx1ZWJpcmQubm9Db25mbGljdCA9IG5vQ29uZmxpY3Q7XG5tb2R1bGUuZXhwb3J0cyA9IGJsdWViaXJkO1xuXG59LHtcIi4vcHJvbWlzZVwiOjIyfV0sNTpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG5cInVzZSBzdHJpY3RcIjtcbnZhciBjciA9IE9iamVjdC5jcmVhdGU7XG5pZiAoY3IpIHtcbiAgICB2YXIgY2FsbGVyQ2FjaGUgPSBjcihudWxsKTtcbiAgICB2YXIgZ2V0dGVyQ2FjaGUgPSBjcihudWxsKTtcbiAgICBjYWxsZXJDYWNoZVtcIiBzaXplXCJdID0gZ2V0dGVyQ2FjaGVbXCIgc2l6ZVwiXSA9IDA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oUHJvbWlzZSkge1xudmFyIHV0aWwgPSBfZGVyZXFfKFwiLi91dGlsXCIpO1xudmFyIGNhbkV2YWx1YXRlID0gdXRpbC5jYW5FdmFsdWF0ZTtcbnZhciBpc0lkZW50aWZpZXIgPSB1dGlsLmlzSWRlbnRpZmllcjtcblxudmFyIGdldE1ldGhvZENhbGxlcjtcbnZhciBnZXRHZXR0ZXI7XG5pZiAoIXRydWUpIHtcbnZhciBtYWtlTWV0aG9kQ2FsbGVyID0gZnVuY3Rpb24gKG1ldGhvZE5hbWUpIHtcbiAgICByZXR1cm4gbmV3IEZ1bmN0aW9uKFwiZW5zdXJlTWV0aG9kXCIsIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuXFxcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikgeyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuXFxcbiAgICAgICAgICAgICd1c2Ugc3RyaWN0JyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuXFxcbiAgICAgICAgICAgIHZhciBsZW4gPSB0aGlzLmxlbmd0aDsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuXFxcbiAgICAgICAgICAgIGVuc3VyZU1ldGhvZChvYmosICdtZXRob2ROYW1lJyk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuXFxcbiAgICAgICAgICAgIHN3aXRjaChsZW4pIHsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuXFxcbiAgICAgICAgICAgICAgICBjYXNlIDE6IHJldHVybiBvYmoubWV0aG9kTmFtZSh0aGlzWzBdKTsgICAgICAgICAgICAgICAgICAgICAgXFxuXFxcbiAgICAgICAgICAgICAgICBjYXNlIDI6IHJldHVybiBvYmoubWV0aG9kTmFtZSh0aGlzWzBdLCB0aGlzWzFdKTsgICAgICAgICAgICAgXFxuXFxcbiAgICAgICAgICAgICAgICBjYXNlIDM6IHJldHVybiBvYmoubWV0aG9kTmFtZSh0aGlzWzBdLCB0aGlzWzFdLCB0aGlzWzJdKTsgICAgXFxuXFxcbiAgICAgICAgICAgICAgICBjYXNlIDA6IHJldHVybiBvYmoubWV0aG9kTmFtZSgpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuXFxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuXFxcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iai5tZXRob2ROYW1lLmFwcGx5KG9iaiwgdGhpcyk7ICAgICAgICAgICAgICAgICAgXFxuXFxcbiAgICAgICAgICAgIH0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuXFxcbiAgICAgICAgfTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuXFxcbiAgICAgICAgXCIucmVwbGFjZSgvbWV0aG9kTmFtZS9nLCBtZXRob2ROYW1lKSkoZW5zdXJlTWV0aG9kKTtcbn07XG5cbnZhciBtYWtlR2V0dGVyID0gZnVuY3Rpb24gKHByb3BlcnR5TmFtZSkge1xuICAgIHJldHVybiBuZXcgRnVuY3Rpb24oXCJvYmpcIiwgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAndXNlIHN0cmljdCc7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICByZXR1cm4gb2JqLnByb3BlcnR5TmFtZTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICBcIi5yZXBsYWNlKFwicHJvcGVydHlOYW1lXCIsIHByb3BlcnR5TmFtZSkpO1xufTtcblxudmFyIGdldENvbXBpbGVkID0gZnVuY3Rpb24obmFtZSwgY29tcGlsZXIsIGNhY2hlKSB7XG4gICAgdmFyIHJldCA9IGNhY2hlW25hbWVdO1xuICAgIGlmICh0eXBlb2YgcmV0ICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgaWYgKCFpc0lkZW50aWZpZXIobmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldCA9IGNvbXBpbGVyKG5hbWUpO1xuICAgICAgICBjYWNoZVtuYW1lXSA9IHJldDtcbiAgICAgICAgY2FjaGVbXCIgc2l6ZVwiXSsrO1xuICAgICAgICBpZiAoY2FjaGVbXCIgc2l6ZVwiXSA+IDUxMikge1xuICAgICAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhjYWNoZSk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI1NjsgKytpKSBkZWxldGUgY2FjaGVba2V5c1tpXV07XG4gICAgICAgICAgICBjYWNoZVtcIiBzaXplXCJdID0ga2V5cy5sZW5ndGggLSAyNTY7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbn07XG5cbmdldE1ldGhvZENhbGxlciA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gZ2V0Q29tcGlsZWQobmFtZSwgbWFrZU1ldGhvZENhbGxlciwgY2FsbGVyQ2FjaGUpO1xufTtcblxuZ2V0R2V0dGVyID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiBnZXRDb21waWxlZChuYW1lLCBtYWtlR2V0dGVyLCBnZXR0ZXJDYWNoZSk7XG59O1xufVxuXG5mdW5jdGlvbiBlbnN1cmVNZXRob2Qob2JqLCBtZXRob2ROYW1lKSB7XG4gICAgdmFyIGZuO1xuICAgIGlmIChvYmogIT0gbnVsbCkgZm4gPSBvYmpbbWV0aG9kTmFtZV07XG4gICAgaWYgKHR5cGVvZiBmbiAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHZhciBtZXNzYWdlID0gXCJPYmplY3QgXCIgKyB1dGlsLmNsYXNzU3RyaW5nKG9iaikgKyBcIiBoYXMgbm8gbWV0aG9kICdcIiArXG4gICAgICAgICAgICB1dGlsLnRvU3RyaW5nKG1ldGhvZE5hbWUpICsgXCInXCI7XG4gICAgICAgIHRocm93IG5ldyBQcm9taXNlLlR5cGVFcnJvcihtZXNzYWdlKTtcbiAgICB9XG4gICAgcmV0dXJuIGZuO1xufVxuXG5mdW5jdGlvbiBjYWxsZXIob2JqKSB7XG4gICAgdmFyIG1ldGhvZE5hbWUgPSB0aGlzLnBvcCgpO1xuICAgIHZhciBmbiA9IGVuc3VyZU1ldGhvZChvYmosIG1ldGhvZE5hbWUpO1xuICAgIHJldHVybiBmbi5hcHBseShvYmosIHRoaXMpO1xufVxuUHJvbWlzZS5wcm90b3R5cGUuY2FsbCA9IGZ1bmN0aW9uIChtZXRob2ROYW1lKSB7XG4gICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7O1xuICAgIGlmICghdHJ1ZSkge1xuICAgICAgICBpZiAoY2FuRXZhbHVhdGUpIHtcbiAgICAgICAgICAgIHZhciBtYXliZUNhbGxlciA9IGdldE1ldGhvZENhbGxlcihtZXRob2ROYW1lKTtcbiAgICAgICAgICAgIGlmIChtYXliZUNhbGxlciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl90aGVuKFxuICAgICAgICAgICAgICAgICAgICBtYXliZUNhbGxlciwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGFyZ3MsIHVuZGVmaW5lZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXJncy5wdXNoKG1ldGhvZE5hbWUpO1xuICAgIHJldHVybiB0aGlzLl90aGVuKGNhbGxlciwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGFyZ3MsIHVuZGVmaW5lZCk7XG59O1xuXG5mdW5jdGlvbiBuYW1lZEdldHRlcihvYmopIHtcbiAgICByZXR1cm4gb2JqW3RoaXNdO1xufVxuZnVuY3Rpb24gaW5kZXhlZEdldHRlcihvYmopIHtcbiAgICB2YXIgaW5kZXggPSArdGhpcztcbiAgICBpZiAoaW5kZXggPCAwKSBpbmRleCA9IE1hdGgubWF4KDAsIGluZGV4ICsgb2JqLmxlbmd0aCk7XG4gICAgcmV0dXJuIG9ialtpbmRleF07XG59XG5Qcm9taXNlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAocHJvcGVydHlOYW1lKSB7XG4gICAgdmFyIGlzSW5kZXggPSAodHlwZW9mIHByb3BlcnR5TmFtZSA9PT0gXCJudW1iZXJcIik7XG4gICAgdmFyIGdldHRlcjtcbiAgICBpZiAoIWlzSW5kZXgpIHtcbiAgICAgICAgaWYgKGNhbkV2YWx1YXRlKSB7XG4gICAgICAgICAgICB2YXIgbWF5YmVHZXR0ZXIgPSBnZXRHZXR0ZXIocHJvcGVydHlOYW1lKTtcbiAgICAgICAgICAgIGdldHRlciA9IG1heWJlR2V0dGVyICE9PSBudWxsID8gbWF5YmVHZXR0ZXIgOiBuYW1lZEdldHRlcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdldHRlciA9IG5hbWVkR2V0dGVyO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZ2V0dGVyID0gaW5kZXhlZEdldHRlcjtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3RoZW4oZ2V0dGVyLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgcHJvcGVydHlOYW1lLCB1bmRlZmluZWQpO1xufTtcbn07XG5cbn0se1wiLi91dGlsXCI6MzZ9XSw2OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcblwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihQcm9taXNlLCBQcm9taXNlQXJyYXksIGFwaVJlamVjdGlvbiwgZGVidWcpIHtcbnZhciB1dGlsID0gX2RlcmVxXyhcIi4vdXRpbFwiKTtcbnZhciB0cnlDYXRjaCA9IHV0aWwudHJ5Q2F0Y2g7XG52YXIgZXJyb3JPYmogPSB1dGlsLmVycm9yT2JqO1xudmFyIGFzeW5jID0gUHJvbWlzZS5fYXN5bmM7XG5cblByb21pc2UucHJvdG90eXBlW1wiYnJlYWtcIl0gPSBQcm9taXNlLnByb3RvdHlwZS5jYW5jZWwgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoIWRlYnVnLmNhbmNlbGxhdGlvbigpKSByZXR1cm4gdGhpcy5fd2FybihcImNhbmNlbGxhdGlvbiBpcyBkaXNhYmxlZFwiKTtcblxuICAgIHZhciBwcm9taXNlID0gdGhpcztcbiAgICB2YXIgY2hpbGQgPSBwcm9taXNlO1xuICAgIHdoaWxlIChwcm9taXNlLl9pc0NhbmNlbGxhYmxlKCkpIHtcbiAgICAgICAgaWYgKCFwcm9taXNlLl9jYW5jZWxCeShjaGlsZCkpIHtcbiAgICAgICAgICAgIGlmIChjaGlsZC5faXNGb2xsb3dpbmcoKSkge1xuICAgICAgICAgICAgICAgIGNoaWxkLl9mb2xsb3dlZSgpLmNhbmNlbCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjaGlsZC5fY2FuY2VsQnJhbmNoZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHBhcmVudCA9IHByb21pc2UuX2NhbmNlbGxhdGlvblBhcmVudDtcbiAgICAgICAgaWYgKHBhcmVudCA9PSBudWxsIHx8ICFwYXJlbnQuX2lzQ2FuY2VsbGFibGUoKSkge1xuICAgICAgICAgICAgaWYgKHByb21pc2UuX2lzRm9sbG93aW5nKCkpIHtcbiAgICAgICAgICAgICAgICBwcm9taXNlLl9mb2xsb3dlZSgpLmNhbmNlbCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwcm9taXNlLl9jYW5jZWxCcmFuY2hlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAocHJvbWlzZS5faXNGb2xsb3dpbmcoKSkgcHJvbWlzZS5fZm9sbG93ZWUoKS5jYW5jZWwoKTtcbiAgICAgICAgICAgIHByb21pc2UuX3NldFdpbGxCZUNhbmNlbGxlZCgpO1xuICAgICAgICAgICAgY2hpbGQgPSBwcm9taXNlO1xuICAgICAgICAgICAgcHJvbWlzZSA9IHBhcmVudDtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblByb21pc2UucHJvdG90eXBlLl9icmFuY2hIYXNDYW5jZWxsZWQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9icmFuY2hlc1JlbWFpbmluZ1RvQ2FuY2VsLS07XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5fZW5vdWdoQnJhbmNoZXNIYXZlQ2FuY2VsbGVkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2JyYW5jaGVzUmVtYWluaW5nVG9DYW5jZWwgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICB0aGlzLl9icmFuY2hlc1JlbWFpbmluZ1RvQ2FuY2VsIDw9IDA7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5fY2FuY2VsQnkgPSBmdW5jdGlvbihjYW5jZWxsZXIpIHtcbiAgICBpZiAoY2FuY2VsbGVyID09PSB0aGlzKSB7XG4gICAgICAgIHRoaXMuX2JyYW5jaGVzUmVtYWluaW5nVG9DYW5jZWwgPSAwO1xuICAgICAgICB0aGlzLl9pbnZva2VPbkNhbmNlbCgpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9icmFuY2hIYXNDYW5jZWxsZWQoKTtcbiAgICAgICAgaWYgKHRoaXMuX2Vub3VnaEJyYW5jaGVzSGF2ZUNhbmNlbGxlZCgpKSB7XG4gICAgICAgICAgICB0aGlzLl9pbnZva2VPbkNhbmNlbCgpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuX2NhbmNlbEJyYW5jaGVkID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX2Vub3VnaEJyYW5jaGVzSGF2ZUNhbmNlbGxlZCgpKSB7XG4gICAgICAgIHRoaXMuX2NhbmNlbCgpO1xuICAgIH1cbn07XG5cblByb21pc2UucHJvdG90eXBlLl9jYW5jZWwgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoIXRoaXMuX2lzQ2FuY2VsbGFibGUoKSkgcmV0dXJuO1xuICAgIHRoaXMuX3NldENhbmNlbGxlZCgpO1xuICAgIGFzeW5jLmludm9rZSh0aGlzLl9jYW5jZWxQcm9taXNlcywgdGhpcywgdW5kZWZpbmVkKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLl9jYW5jZWxQcm9taXNlcyA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9sZW5ndGgoKSA+IDApIHRoaXMuX3NldHRsZVByb21pc2VzKCk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5fdW5zZXRPbkNhbmNlbCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX29uQ2FuY2VsRmllbGQgPSB1bmRlZmluZWQ7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5faXNDYW5jZWxsYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmlzUGVuZGluZygpICYmICF0aGlzLl9pc0NhbmNlbGxlZCgpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuaXNDYW5jZWxsYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmlzUGVuZGluZygpICYmICF0aGlzLmlzQ2FuY2VsbGVkKCk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5fZG9JbnZva2VPbkNhbmNlbCA9IGZ1bmN0aW9uKG9uQ2FuY2VsQ2FsbGJhY2ssIGludGVybmFsT25seSkge1xuICAgIGlmICh1dGlsLmlzQXJyYXkob25DYW5jZWxDYWxsYmFjaykpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvbkNhbmNlbENhbGxiYWNrLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB0aGlzLl9kb0ludm9rZU9uQ2FuY2VsKG9uQ2FuY2VsQ2FsbGJhY2tbaV0sIGludGVybmFsT25seSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG9uQ2FuY2VsQ2FsbGJhY2sgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAodHlwZW9mIG9uQ2FuY2VsQ2FsbGJhY2sgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgaWYgKCFpbnRlcm5hbE9ubHkpIHtcbiAgICAgICAgICAgICAgICB2YXIgZSA9IHRyeUNhdGNoKG9uQ2FuY2VsQ2FsbGJhY2spLmNhbGwodGhpcy5fYm91bmRWYWx1ZSgpKTtcbiAgICAgICAgICAgICAgICBpZiAoZSA9PT0gZXJyb3JPYmopIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYXR0YWNoRXh0cmFUcmFjZShlLmUpO1xuICAgICAgICAgICAgICAgICAgICBhc3luYy50aHJvd0xhdGVyKGUuZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb25DYW5jZWxDYWxsYmFjay5fcmVzdWx0Q2FuY2VsbGVkKHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuX2ludm9rZU9uQ2FuY2VsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG9uQ2FuY2VsQ2FsbGJhY2sgPSB0aGlzLl9vbkNhbmNlbCgpO1xuICAgIHRoaXMuX3Vuc2V0T25DYW5jZWwoKTtcbiAgICBhc3luYy5pbnZva2UodGhpcy5fZG9JbnZva2VPbkNhbmNlbCwgdGhpcywgb25DYW5jZWxDYWxsYmFjayk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5faW52b2tlSW50ZXJuYWxPbkNhbmNlbCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9pc0NhbmNlbGxhYmxlKCkpIHtcbiAgICAgICAgdGhpcy5fZG9JbnZva2VPbkNhbmNlbCh0aGlzLl9vbkNhbmNlbCgpLCB0cnVlKTtcbiAgICAgICAgdGhpcy5fdW5zZXRPbkNhbmNlbCgpO1xuICAgIH1cbn07XG5cblByb21pc2UucHJvdG90eXBlLl9yZXN1bHRDYW5jZWxsZWQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNhbmNlbCgpO1xufTtcblxufTtcblxufSx7XCIuL3V0aWxcIjozNn1dLDc6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuXCJ1c2Ugc3RyaWN0XCI7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKE5FWFRfRklMVEVSKSB7XG52YXIgdXRpbCA9IF9kZXJlcV8oXCIuL3V0aWxcIik7XG52YXIgZ2V0S2V5cyA9IF9kZXJlcV8oXCIuL2VzNVwiKS5rZXlzO1xudmFyIHRyeUNhdGNoID0gdXRpbC50cnlDYXRjaDtcbnZhciBlcnJvck9iaiA9IHV0aWwuZXJyb3JPYmo7XG5cbmZ1bmN0aW9uIGNhdGNoRmlsdGVyKGluc3RhbmNlcywgY2IsIHByb21pc2UpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgYm91bmRUbyA9IHByb21pc2UuX2JvdW5kVmFsdWUoKTtcbiAgICAgICAgcHJlZGljYXRlTG9vcDogZm9yICh2YXIgaSA9IDA7IGkgPCBpbnN0YW5jZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gaW5zdGFuY2VzW2ldO1xuXG4gICAgICAgICAgICBpZiAoaXRlbSA9PT0gRXJyb3IgfHxcbiAgICAgICAgICAgICAgICAoaXRlbSAhPSBudWxsICYmIGl0ZW0ucHJvdG90eXBlIGluc3RhbmNlb2YgRXJyb3IpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnlDYXRjaChjYikuY2FsbChib3VuZFRvLCBlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBpdGVtID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2hlc1ByZWRpY2F0ZSA9IHRyeUNhdGNoKGl0ZW0pLmNhbGwoYm91bmRUbywgZSk7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZXNQcmVkaWNhdGUgPT09IGVycm9yT2JqKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaGVzUHJlZGljYXRlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobWF0Y2hlc1ByZWRpY2F0ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ5Q2F0Y2goY2IpLmNhbGwoYm91bmRUbywgZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICh1dGlsLmlzT2JqZWN0KGUpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGtleXMgPSBnZXRLZXlzKGl0ZW0pO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwga2V5cy5sZW5ndGg7ICsraikge1xuICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0ga2V5c1tqXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW1ba2V5XSAhPSBlW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlIHByZWRpY2F0ZUxvb3A7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyeUNhdGNoKGNiKS5jYWxsKGJvdW5kVG8sIGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBORVhUX0ZJTFRFUjtcbiAgICB9O1xufVxuXG5yZXR1cm4gY2F0Y2hGaWx0ZXI7XG59O1xuXG59LHtcIi4vZXM1XCI6MTMsXCIuL3V0aWxcIjozNn1dLDg6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuXCJ1c2Ugc3RyaWN0XCI7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKFByb21pc2UpIHtcbnZhciBsb25nU3RhY2tUcmFjZXMgPSBmYWxzZTtcbnZhciBjb250ZXh0U3RhY2sgPSBbXTtcblxuUHJvbWlzZS5wcm90b3R5cGUuX3Byb21pc2VDcmVhdGVkID0gZnVuY3Rpb24oKSB7fTtcblByb21pc2UucHJvdG90eXBlLl9wdXNoQ29udGV4dCA9IGZ1bmN0aW9uKCkge307XG5Qcm9taXNlLnByb3RvdHlwZS5fcG9wQ29udGV4dCA9IGZ1bmN0aW9uKCkge3JldHVybiBudWxsO307XG5Qcm9taXNlLl9wZWVrQ29udGV4dCA9IFByb21pc2UucHJvdG90eXBlLl9wZWVrQ29udGV4dCA9IGZ1bmN0aW9uKCkge307XG5cbmZ1bmN0aW9uIENvbnRleHQoKSB7XG4gICAgdGhpcy5fdHJhY2UgPSBuZXcgQ29udGV4dC5DYXB0dXJlZFRyYWNlKHBlZWtDb250ZXh0KCkpO1xufVxuQ29udGV4dC5wcm90b3R5cGUuX3B1c2hDb250ZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLl90cmFjZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMuX3RyYWNlLl9wcm9taXNlQ3JlYXRlZCA9IG51bGw7XG4gICAgICAgIGNvbnRleHRTdGFjay5wdXNoKHRoaXMuX3RyYWNlKTtcbiAgICB9XG59O1xuXG5Db250ZXh0LnByb3RvdHlwZS5fcG9wQ29udGV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5fdHJhY2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB2YXIgdHJhY2UgPSBjb250ZXh0U3RhY2sucG9wKCk7XG4gICAgICAgIHZhciByZXQgPSB0cmFjZS5fcHJvbWlzZUNyZWF0ZWQ7XG4gICAgICAgIHRyYWNlLl9wcm9taXNlQ3JlYXRlZCA9IG51bGw7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufTtcblxuZnVuY3Rpb24gY3JlYXRlQ29udGV4dCgpIHtcbiAgICBpZiAobG9uZ1N0YWNrVHJhY2VzKSByZXR1cm4gbmV3IENvbnRleHQoKTtcbn1cblxuZnVuY3Rpb24gcGVla0NvbnRleHQoKSB7XG4gICAgdmFyIGxhc3RJbmRleCA9IGNvbnRleHRTdGFjay5sZW5ndGggLSAxO1xuICAgIGlmIChsYXN0SW5kZXggPj0gMCkge1xuICAgICAgICByZXR1cm4gY29udGV4dFN0YWNrW2xhc3RJbmRleF07XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG5Db250ZXh0LkNhcHR1cmVkVHJhY2UgPSBudWxsO1xuQ29udGV4dC5jcmVhdGUgPSBjcmVhdGVDb250ZXh0O1xuQ29udGV4dC5kZWFjdGl2YXRlTG9uZ1N0YWNrVHJhY2VzID0gZnVuY3Rpb24oKSB7fTtcbkNvbnRleHQuYWN0aXZhdGVMb25nU3RhY2tUcmFjZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgUHJvbWlzZV9wdXNoQ29udGV4dCA9IFByb21pc2UucHJvdG90eXBlLl9wdXNoQ29udGV4dDtcbiAgICB2YXIgUHJvbWlzZV9wb3BDb250ZXh0ID0gUHJvbWlzZS5wcm90b3R5cGUuX3BvcENvbnRleHQ7XG4gICAgdmFyIFByb21pc2VfUGVla0NvbnRleHQgPSBQcm9taXNlLl9wZWVrQ29udGV4dDtcbiAgICB2YXIgUHJvbWlzZV9wZWVrQ29udGV4dCA9IFByb21pc2UucHJvdG90eXBlLl9wZWVrQ29udGV4dDtcbiAgICB2YXIgUHJvbWlzZV9wcm9taXNlQ3JlYXRlZCA9IFByb21pc2UucHJvdG90eXBlLl9wcm9taXNlQ3JlYXRlZDtcbiAgICBDb250ZXh0LmRlYWN0aXZhdGVMb25nU3RhY2tUcmFjZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgUHJvbWlzZS5wcm90b3R5cGUuX3B1c2hDb250ZXh0ID0gUHJvbWlzZV9wdXNoQ29udGV4dDtcbiAgICAgICAgUHJvbWlzZS5wcm90b3R5cGUuX3BvcENvbnRleHQgPSBQcm9taXNlX3BvcENvbnRleHQ7XG4gICAgICAgIFByb21pc2UuX3BlZWtDb250ZXh0ID0gUHJvbWlzZV9QZWVrQ29udGV4dDtcbiAgICAgICAgUHJvbWlzZS5wcm90b3R5cGUuX3BlZWtDb250ZXh0ID0gUHJvbWlzZV9wZWVrQ29udGV4dDtcbiAgICAgICAgUHJvbWlzZS5wcm90b3R5cGUuX3Byb21pc2VDcmVhdGVkID0gUHJvbWlzZV9wcm9taXNlQ3JlYXRlZDtcbiAgICAgICAgbG9uZ1N0YWNrVHJhY2VzID0gZmFsc2U7XG4gICAgfTtcbiAgICBsb25nU3RhY2tUcmFjZXMgPSB0cnVlO1xuICAgIFByb21pc2UucHJvdG90eXBlLl9wdXNoQ29udGV4dCA9IENvbnRleHQucHJvdG90eXBlLl9wdXNoQ29udGV4dDtcbiAgICBQcm9taXNlLnByb3RvdHlwZS5fcG9wQ29udGV4dCA9IENvbnRleHQucHJvdG90eXBlLl9wb3BDb250ZXh0O1xuICAgIFByb21pc2UuX3BlZWtDb250ZXh0ID0gUHJvbWlzZS5wcm90b3R5cGUuX3BlZWtDb250ZXh0ID0gcGVla0NvbnRleHQ7XG4gICAgUHJvbWlzZS5wcm90b3R5cGUuX3Byb21pc2VDcmVhdGVkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjdHggPSB0aGlzLl9wZWVrQ29udGV4dCgpO1xuICAgICAgICBpZiAoY3R4ICYmIGN0eC5fcHJvbWlzZUNyZWF0ZWQgPT0gbnVsbCkgY3R4Ll9wcm9taXNlQ3JlYXRlZCA9IHRoaXM7XG4gICAgfTtcbn07XG5yZXR1cm4gQ29udGV4dDtcbn07XG5cbn0se31dLDk6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuXCJ1c2Ugc3RyaWN0XCI7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKFByb21pc2UsIENvbnRleHQpIHtcbnZhciBnZXREb21haW4gPSBQcm9taXNlLl9nZXREb21haW47XG52YXIgYXN5bmMgPSBQcm9taXNlLl9hc3luYztcbnZhciBXYXJuaW5nID0gX2RlcmVxXyhcIi4vZXJyb3JzXCIpLldhcm5pbmc7XG52YXIgdXRpbCA9IF9kZXJlcV8oXCIuL3V0aWxcIik7XG52YXIgY2FuQXR0YWNoVHJhY2UgPSB1dGlsLmNhbkF0dGFjaFRyYWNlO1xudmFyIHVuaGFuZGxlZFJlamVjdGlvbkhhbmRsZWQ7XG52YXIgcG9zc2libHlVbmhhbmRsZWRSZWplY3Rpb247XG52YXIgYmx1ZWJpcmRGcmFtZVBhdHRlcm4gPVxuICAgIC9bXFxcXFxcL11ibHVlYmlyZFtcXFxcXFwvXWpzW1xcXFxcXC9dKHJlbGVhc2V8ZGVidWd8aW5zdHJ1bWVudGVkKS87XG52YXIgbm9kZUZyYW1lUGF0dGVybiA9IC9cXCgoPzp0aW1lcnNcXC5qcyk6XFxkKzpcXGQrXFwpLztcbnZhciBwYXJzZUxpbmVQYXR0ZXJuID0gL1tcXC88XFwoXSguKz8pOihcXGQrKTooXFxkKylcXCk/XFxzKiQvO1xudmFyIHN0YWNrRnJhbWVQYXR0ZXJuID0gbnVsbDtcbnZhciBmb3JtYXRTdGFjayA9IG51bGw7XG52YXIgaW5kZW50U3RhY2tGcmFtZXMgPSBmYWxzZTtcbnZhciBwcmludFdhcm5pbmc7XG52YXIgZGVidWdnaW5nID0gISEodXRpbC5lbnYoXCJCTFVFQklSRF9ERUJVR1wiKSAhPSAwICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAodHJ1ZSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgIHV0aWwuZW52KFwiQkxVRUJJUkRfREVCVUdcIikgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICB1dGlsLmVudihcIk5PREVfRU5WXCIpID09PSBcImRldmVsb3BtZW50XCIpKTtcblxudmFyIHdhcm5pbmdzID0gISEodXRpbC5lbnYoXCJCTFVFQklSRF9XQVJOSU5HU1wiKSAhPSAwICYmXG4gICAgKGRlYnVnZ2luZyB8fCB1dGlsLmVudihcIkJMVUVCSVJEX1dBUk5JTkdTXCIpKSk7XG5cbnZhciBsb25nU3RhY2tUcmFjZXMgPSAhISh1dGlsLmVudihcIkJMVUVCSVJEX0xPTkdfU1RBQ0tfVFJBQ0VTXCIpICE9IDAgJiZcbiAgICAoZGVidWdnaW5nIHx8IHV0aWwuZW52KFwiQkxVRUJJUkRfTE9OR19TVEFDS19UUkFDRVNcIikpKTtcblxudmFyIHdGb3Jnb3R0ZW5SZXR1cm4gPSB1dGlsLmVudihcIkJMVUVCSVJEX1dfRk9SR09UVEVOX1JFVFVSTlwiKSAhPSAwICYmXG4gICAgKHdhcm5pbmdzIHx8ICEhdXRpbC5lbnYoXCJCTFVFQklSRF9XX0ZPUkdPVFRFTl9SRVRVUk5cIikpO1xuXG5Qcm9taXNlLnByb3RvdHlwZS5zdXBwcmVzc1VuaGFuZGxlZFJlamVjdGlvbnMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGFyZ2V0ID0gdGhpcy5fdGFyZ2V0KCk7XG4gICAgdGFyZ2V0Ll9iaXRGaWVsZCA9ICgodGFyZ2V0Ll9iaXRGaWVsZCAmICh+MTA0ODU3NikpIHxcbiAgICAgICAgICAgICAgICAgICAgICA1MjQyODgpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuX2Vuc3VyZVBvc3NpYmxlUmVqZWN0aW9uSGFuZGxlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoKHRoaXMuX2JpdEZpZWxkICYgNTI0Mjg4KSAhPT0gMCkgcmV0dXJuO1xuICAgIHRoaXMuX3NldFJlamVjdGlvbklzVW5oYW5kbGVkKCk7XG4gICAgYXN5bmMuaW52b2tlTGF0ZXIodGhpcy5fbm90aWZ5VW5oYW5kbGVkUmVqZWN0aW9uLCB0aGlzLCB1bmRlZmluZWQpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuX25vdGlmeVVuaGFuZGxlZFJlamVjdGlvbklzSGFuZGxlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmaXJlUmVqZWN0aW9uRXZlbnQoXCJyZWplY3Rpb25IYW5kbGVkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5oYW5kbGVkUmVqZWN0aW9uSGFuZGxlZCwgdW5kZWZpbmVkLCB0aGlzKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLl9zZXRSZXR1cm5lZE5vblVuZGVmaW5lZCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2JpdEZpZWxkID0gdGhpcy5fYml0RmllbGQgfCAyNjg0MzU0NTY7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5fcmV0dXJuZWROb25VbmRlZmluZWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKHRoaXMuX2JpdEZpZWxkICYgMjY4NDM1NDU2KSAhPT0gMDtcbn07XG5cblByb21pc2UucHJvdG90eXBlLl9ub3RpZnlVbmhhbmRsZWRSZWplY3Rpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuX2lzUmVqZWN0aW9uVW5oYW5kbGVkKCkpIHtcbiAgICAgICAgdmFyIHJlYXNvbiA9IHRoaXMuX3NldHRsZWRWYWx1ZSgpO1xuICAgICAgICB0aGlzLl9zZXRVbmhhbmRsZWRSZWplY3Rpb25Jc05vdGlmaWVkKCk7XG4gICAgICAgIGZpcmVSZWplY3Rpb25FdmVudChcInVuaGFuZGxlZFJlamVjdGlvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NzaWJseVVuaGFuZGxlZFJlamVjdGlvbiwgcmVhc29uLCB0aGlzKTtcbiAgICB9XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5fc2V0VW5oYW5kbGVkUmVqZWN0aW9uSXNOb3RpZmllZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl9iaXRGaWVsZCA9IHRoaXMuX2JpdEZpZWxkIHwgMjYyMTQ0O1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuX3Vuc2V0VW5oYW5kbGVkUmVqZWN0aW9uSXNOb3RpZmllZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl9iaXRGaWVsZCA9IHRoaXMuX2JpdEZpZWxkICYgKH4yNjIxNDQpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuX2lzVW5oYW5kbGVkUmVqZWN0aW9uTm90aWZpZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICh0aGlzLl9iaXRGaWVsZCAmIDI2MjE0NCkgPiAwO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuX3NldFJlamVjdGlvbklzVW5oYW5kbGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX2JpdEZpZWxkID0gdGhpcy5fYml0RmllbGQgfCAxMDQ4NTc2O1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuX3Vuc2V0UmVqZWN0aW9uSXNVbmhhbmRsZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fYml0RmllbGQgPSB0aGlzLl9iaXRGaWVsZCAmICh+MTA0ODU3Nik7XG4gICAgaWYgKHRoaXMuX2lzVW5oYW5kbGVkUmVqZWN0aW9uTm90aWZpZWQoKSkge1xuICAgICAgICB0aGlzLl91bnNldFVuaGFuZGxlZFJlamVjdGlvbklzTm90aWZpZWQoKTtcbiAgICAgICAgdGhpcy5fbm90aWZ5VW5oYW5kbGVkUmVqZWN0aW9uSXNIYW5kbGVkKCk7XG4gICAgfVxufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuX2lzUmVqZWN0aW9uVW5oYW5kbGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAodGhpcy5fYml0RmllbGQgJiAxMDQ4NTc2KSA+IDA7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5fd2FybiA9IGZ1bmN0aW9uKG1lc3NhZ2UsIHNob3VsZFVzZU93blRyYWNlLCBwcm9taXNlKSB7XG4gICAgcmV0dXJuIHdhcm4obWVzc2FnZSwgc2hvdWxkVXNlT3duVHJhY2UsIHByb21pc2UgfHwgdGhpcyk7XG59O1xuXG5Qcm9taXNlLm9uUG9zc2libHlVbmhhbmRsZWRSZWplY3Rpb24gPSBmdW5jdGlvbiAoZm4pIHtcbiAgICB2YXIgZG9tYWluID0gZ2V0RG9tYWluKCk7XG4gICAgcG9zc2libHlVbmhhbmRsZWRSZWplY3Rpb24gPVxuICAgICAgICB0eXBlb2YgZm4gPT09IFwiZnVuY3Rpb25cIiA/IChkb21haW4gPT09IG51bGwgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbiA6IHV0aWwuZG9tYWluQmluZChkb21haW4sIGZuKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkO1xufTtcblxuUHJvbWlzZS5vblVuaGFuZGxlZFJlamVjdGlvbkhhbmRsZWQgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICB2YXIgZG9tYWluID0gZ2V0RG9tYWluKCk7XG4gICAgdW5oYW5kbGVkUmVqZWN0aW9uSGFuZGxlZCA9XG4gICAgICAgIHR5cGVvZiBmbiA9PT0gXCJmdW5jdGlvblwiID8gKGRvbWFpbiA9PT0gbnVsbCA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZuIDogdXRpbC5kb21haW5CaW5kKGRvbWFpbiwgZm4pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWQ7XG59O1xuXG52YXIgZGlzYWJsZUxvbmdTdGFja1RyYWNlcyA9IGZ1bmN0aW9uKCkge307XG5Qcm9taXNlLmxvbmdTdGFja1RyYWNlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoYXN5bmMuaGF2ZUl0ZW1zUXVldWVkKCkgJiYgIWNvbmZpZy5sb25nU3RhY2tUcmFjZXMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY2Fubm90IGVuYWJsZSBsb25nIHN0YWNrIHRyYWNlcyBhZnRlciBwcm9taXNlcyBoYXZlIGJlZW4gY3JlYXRlZFxcdTAwMGFcXHUwMDBhICAgIFNlZSBodHRwOi8vZ29vLmdsL01xckZtWFxcdTAwMGFcIik7XG4gICAgfVxuICAgIGlmICghY29uZmlnLmxvbmdTdGFja1RyYWNlcyAmJiBsb25nU3RhY2tUcmFjZXNJc1N1cHBvcnRlZCgpKSB7XG4gICAgICAgIHZhciBQcm9taXNlX2NhcHR1cmVTdGFja1RyYWNlID0gUHJvbWlzZS5wcm90b3R5cGUuX2NhcHR1cmVTdGFja1RyYWNlO1xuICAgICAgICB2YXIgUHJvbWlzZV9hdHRhY2hFeHRyYVRyYWNlID0gUHJvbWlzZS5wcm90b3R5cGUuX2F0dGFjaEV4dHJhVHJhY2U7XG4gICAgICAgIGNvbmZpZy5sb25nU3RhY2tUcmFjZXMgPSB0cnVlO1xuICAgICAgICBkaXNhYmxlTG9uZ1N0YWNrVHJhY2VzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoYXN5bmMuaGF2ZUl0ZW1zUXVldWVkKCkgJiYgIWNvbmZpZy5sb25nU3RhY2tUcmFjZXMpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjYW5ub3QgZW5hYmxlIGxvbmcgc3RhY2sgdHJhY2VzIGFmdGVyIHByb21pc2VzIGhhdmUgYmVlbiBjcmVhdGVkXFx1MDAwYVxcdTAwMGEgICAgU2VlIGh0dHA6Ly9nb28uZ2wvTXFyRm1YXFx1MDAwYVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFByb21pc2UucHJvdG90eXBlLl9jYXB0dXJlU3RhY2tUcmFjZSA9IFByb21pc2VfY2FwdHVyZVN0YWNrVHJhY2U7XG4gICAgICAgICAgICBQcm9taXNlLnByb3RvdHlwZS5fYXR0YWNoRXh0cmFUcmFjZSA9IFByb21pc2VfYXR0YWNoRXh0cmFUcmFjZTtcbiAgICAgICAgICAgIENvbnRleHQuZGVhY3RpdmF0ZUxvbmdTdGFja1RyYWNlcygpO1xuICAgICAgICAgICAgYXN5bmMuZW5hYmxlVHJhbXBvbGluZSgpO1xuICAgICAgICAgICAgY29uZmlnLmxvbmdTdGFja1RyYWNlcyA9IGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICBQcm9taXNlLnByb3RvdHlwZS5fY2FwdHVyZVN0YWNrVHJhY2UgPSBsb25nU3RhY2tUcmFjZXNDYXB0dXJlU3RhY2tUcmFjZTtcbiAgICAgICAgUHJvbWlzZS5wcm90b3R5cGUuX2F0dGFjaEV4dHJhVHJhY2UgPSBsb25nU3RhY2tUcmFjZXNBdHRhY2hFeHRyYVRyYWNlO1xuICAgICAgICBDb250ZXh0LmFjdGl2YXRlTG9uZ1N0YWNrVHJhY2VzKCk7XG4gICAgICAgIGFzeW5jLmRpc2FibGVUcmFtcG9saW5lSWZOZWNlc3NhcnkoKTtcbiAgICB9XG59O1xuXG5Qcm9taXNlLmhhc0xvbmdTdGFja1RyYWNlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gY29uZmlnLmxvbmdTdGFja1RyYWNlcyAmJiBsb25nU3RhY2tUcmFjZXNJc1N1cHBvcnRlZCgpO1xufTtcblxudmFyIGZpcmVEb21FdmVudCA9IChmdW5jdGlvbigpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIEN1c3RvbUV2ZW50ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHZhciBldmVudCA9IG5ldyBDdXN0b21FdmVudChcIkN1c3RvbUV2ZW50XCIpO1xuICAgICAgICAgICAgdXRpbC5nbG9iYWwuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24obmFtZSwgZXZlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgZG9tRXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQobmFtZS50b0xvd2VyQ2FzZSgpLCB7XG4gICAgICAgICAgICAgICAgICAgIGRldGFpbDogZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gIXV0aWwuZ2xvYmFsLmRpc3BhdGNoRXZlbnQoZG9tRXZlbnQpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgRXZlbnQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KFwiQ3VzdG9tRXZlbnRcIik7XG4gICAgICAgICAgICB1dGlsLmdsb2JhbC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihuYW1lLCBldmVudCkge1xuICAgICAgICAgICAgICAgIHZhciBkb21FdmVudCA9IG5ldyBFdmVudChuYW1lLnRvTG93ZXJDYXNlKCksIHtcbiAgICAgICAgICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGRvbUV2ZW50LmRldGFpbCA9IGV2ZW50O1xuICAgICAgICAgICAgICAgIHJldHVybiAhdXRpbC5nbG9iYWwuZGlzcGF0Y2hFdmVudChkb21FdmVudCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJDdXN0b21FdmVudFwiKTtcbiAgICAgICAgICAgIGV2ZW50LmluaXRDdXN0b21FdmVudChcInRlc3Rpbmd0aGVldmVudFwiLCBmYWxzZSwgdHJ1ZSwge30pO1xuICAgICAgICAgICAgdXRpbC5nbG9iYWwuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24obmFtZSwgZXZlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgZG9tRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudChcIkN1c3RvbUV2ZW50XCIpO1xuICAgICAgICAgICAgICAgIGRvbUV2ZW50LmluaXRDdXN0b21FdmVudChuYW1lLnRvTG93ZXJDYXNlKCksIGZhbHNlLCB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBldmVudCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICF1dGlsLmdsb2JhbC5kaXNwYXRjaEV2ZW50KGRvbUV2ZW50KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7fVxuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG59KSgpO1xuXG52YXIgZmlyZUdsb2JhbEV2ZW50ID0gKGZ1bmN0aW9uKCkge1xuICAgIGlmICh1dGlsLmlzTm9kZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvY2Vzcy5lbWl0LmFwcGx5KHByb2Nlc3MsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCF1dGlsLmdsb2JhbCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgICAgIHZhciBtZXRob2ROYW1lID0gXCJvblwiICsgbmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgdmFyIG1ldGhvZCA9IHV0aWwuZ2xvYmFsW21ldGhvZE5hbWVdO1xuICAgICAgICAgICAgaWYgKCFtZXRob2QpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIG1ldGhvZC5hcHBseSh1dGlsLmdsb2JhbCwgW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9O1xuICAgIH1cbn0pKCk7XG5cbmZ1bmN0aW9uIGdlbmVyYXRlUHJvbWlzZUxpZmVjeWNsZUV2ZW50T2JqZWN0KG5hbWUsIHByb21pc2UpIHtcbiAgICByZXR1cm4ge3Byb21pc2U6IHByb21pc2V9O1xufVxuXG52YXIgZXZlbnRUb09iamVjdEdlbmVyYXRvciA9IHtcbiAgICBwcm9taXNlQ3JlYXRlZDogZ2VuZXJhdGVQcm9taXNlTGlmZWN5Y2xlRXZlbnRPYmplY3QsXG4gICAgcHJvbWlzZUZ1bGZpbGxlZDogZ2VuZXJhdGVQcm9taXNlTGlmZWN5Y2xlRXZlbnRPYmplY3QsXG4gICAgcHJvbWlzZVJlamVjdGVkOiBnZW5lcmF0ZVByb21pc2VMaWZlY3ljbGVFdmVudE9iamVjdCxcbiAgICBwcm9taXNlUmVzb2x2ZWQ6IGdlbmVyYXRlUHJvbWlzZUxpZmVjeWNsZUV2ZW50T2JqZWN0LFxuICAgIHByb21pc2VDYW5jZWxsZWQ6IGdlbmVyYXRlUHJvbWlzZUxpZmVjeWNsZUV2ZW50T2JqZWN0LFxuICAgIHByb21pc2VDaGFpbmVkOiBmdW5jdGlvbihuYW1lLCBwcm9taXNlLCBjaGlsZCkge1xuICAgICAgICByZXR1cm4ge3Byb21pc2U6IHByb21pc2UsIGNoaWxkOiBjaGlsZH07XG4gICAgfSxcbiAgICB3YXJuaW5nOiBmdW5jdGlvbihuYW1lLCB3YXJuaW5nKSB7XG4gICAgICAgIHJldHVybiB7d2FybmluZzogd2FybmluZ307XG4gICAgfSxcbiAgICB1bmhhbmRsZWRSZWplY3Rpb246IGZ1bmN0aW9uIChuYW1lLCByZWFzb24sIHByb21pc2UpIHtcbiAgICAgICAgcmV0dXJuIHtyZWFzb246IHJlYXNvbiwgcHJvbWlzZTogcHJvbWlzZX07XG4gICAgfSxcbiAgICByZWplY3Rpb25IYW5kbGVkOiBnZW5lcmF0ZVByb21pc2VMaWZlY3ljbGVFdmVudE9iamVjdFxufTtcblxudmFyIGFjdGl2ZUZpcmVFdmVudCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdmFyIGdsb2JhbEV2ZW50RmlyZWQgPSBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgICBnbG9iYWxFdmVudEZpcmVkID0gZmlyZUdsb2JhbEV2ZW50LmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBhc3luYy50aHJvd0xhdGVyKGUpO1xuICAgICAgICBnbG9iYWxFdmVudEZpcmVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB2YXIgZG9tRXZlbnRGaXJlZCA9IGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICAgIGRvbUV2ZW50RmlyZWQgPSBmaXJlRG9tRXZlbnQobmFtZSxcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRUb09iamVjdEdlbmVyYXRvcltuYW1lXS5hcHBseShudWxsLCBhcmd1bWVudHMpKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGFzeW5jLnRocm93TGF0ZXIoZSk7XG4gICAgICAgIGRvbUV2ZW50RmlyZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBkb21FdmVudEZpcmVkIHx8IGdsb2JhbEV2ZW50RmlyZWQ7XG59O1xuXG5Qcm9taXNlLmNvbmZpZyA9IGZ1bmN0aW9uKG9wdHMpIHtcbiAgICBvcHRzID0gT2JqZWN0KG9wdHMpO1xuICAgIGlmIChcImxvbmdTdGFja1RyYWNlc1wiIGluIG9wdHMpIHtcbiAgICAgICAgaWYgKG9wdHMubG9uZ1N0YWNrVHJhY2VzKSB7XG4gICAgICAgICAgICBQcm9taXNlLmxvbmdTdGFja1RyYWNlcygpO1xuICAgICAgICB9IGVsc2UgaWYgKCFvcHRzLmxvbmdTdGFja1RyYWNlcyAmJiBQcm9taXNlLmhhc0xvbmdTdGFja1RyYWNlcygpKSB7XG4gICAgICAgICAgICBkaXNhYmxlTG9uZ1N0YWNrVHJhY2VzKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKFwid2FybmluZ3NcIiBpbiBvcHRzKSB7XG4gICAgICAgIHZhciB3YXJuaW5nc09wdGlvbiA9IG9wdHMud2FybmluZ3M7XG4gICAgICAgIGNvbmZpZy53YXJuaW5ncyA9ICEhd2FybmluZ3NPcHRpb247XG4gICAgICAgIHdGb3Jnb3R0ZW5SZXR1cm4gPSBjb25maWcud2FybmluZ3M7XG5cbiAgICAgICAgaWYgKHV0aWwuaXNPYmplY3Qod2FybmluZ3NPcHRpb24pKSB7XG4gICAgICAgICAgICBpZiAoXCJ3Rm9yZ290dGVuUmV0dXJuXCIgaW4gd2FybmluZ3NPcHRpb24pIHtcbiAgICAgICAgICAgICAgICB3Rm9yZ290dGVuUmV0dXJuID0gISF3YXJuaW5nc09wdGlvbi53Rm9yZ290dGVuUmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChcImNhbmNlbGxhdGlvblwiIGluIG9wdHMgJiYgb3B0cy5jYW5jZWxsYXRpb24gJiYgIWNvbmZpZy5jYW5jZWxsYXRpb24pIHtcbiAgICAgICAgaWYgKGFzeW5jLmhhdmVJdGVtc1F1ZXVlZCgpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgXCJjYW5ub3QgZW5hYmxlIGNhbmNlbGxhdGlvbiBhZnRlciBwcm9taXNlcyBhcmUgaW4gdXNlXCIpO1xuICAgICAgICB9XG4gICAgICAgIFByb21pc2UucHJvdG90eXBlLl9jbGVhckNhbmNlbGxhdGlvbkRhdGEgPVxuICAgICAgICAgICAgY2FuY2VsbGF0aW9uQ2xlYXJDYW5jZWxsYXRpb25EYXRhO1xuICAgICAgICBQcm9taXNlLnByb3RvdHlwZS5fcHJvcGFnYXRlRnJvbSA9IGNhbmNlbGxhdGlvblByb3BhZ2F0ZUZyb207XG4gICAgICAgIFByb21pc2UucHJvdG90eXBlLl9vbkNhbmNlbCA9IGNhbmNlbGxhdGlvbk9uQ2FuY2VsO1xuICAgICAgICBQcm9taXNlLnByb3RvdHlwZS5fc2V0T25DYW5jZWwgPSBjYW5jZWxsYXRpb25TZXRPbkNhbmNlbDtcbiAgICAgICAgUHJvbWlzZS5wcm90b3R5cGUuX2F0dGFjaENhbmNlbGxhdGlvbkNhbGxiYWNrID1cbiAgICAgICAgICAgIGNhbmNlbGxhdGlvbkF0dGFjaENhbmNlbGxhdGlvbkNhbGxiYWNrO1xuICAgICAgICBQcm9taXNlLnByb3RvdHlwZS5fZXhlY3V0ZSA9IGNhbmNlbGxhdGlvbkV4ZWN1dGU7XG4gICAgICAgIHByb3BhZ2F0ZUZyb21GdW5jdGlvbiA9IGNhbmNlbGxhdGlvblByb3BhZ2F0ZUZyb207XG4gICAgICAgIGNvbmZpZy5jYW5jZWxsYXRpb24gPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoXCJtb25pdG9yaW5nXCIgaW4gb3B0cykge1xuICAgICAgICBpZiAob3B0cy5tb25pdG9yaW5nICYmICFjb25maWcubW9uaXRvcmluZykge1xuICAgICAgICAgICAgY29uZmlnLm1vbml0b3JpbmcgPSB0cnVlO1xuICAgICAgICAgICAgUHJvbWlzZS5wcm90b3R5cGUuX2ZpcmVFdmVudCA9IGFjdGl2ZUZpcmVFdmVudDtcbiAgICAgICAgfSBlbHNlIGlmICghb3B0cy5tb25pdG9yaW5nICYmIGNvbmZpZy5tb25pdG9yaW5nKSB7XG4gICAgICAgICAgICBjb25maWcubW9uaXRvcmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgUHJvbWlzZS5wcm90b3R5cGUuX2ZpcmVFdmVudCA9IGRlZmF1bHRGaXJlRXZlbnQ7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5mdW5jdGlvbiBkZWZhdWx0RmlyZUV2ZW50KCkgeyByZXR1cm4gZmFsc2U7IH1cblxuUHJvbWlzZS5wcm90b3R5cGUuX2ZpcmVFdmVudCA9IGRlZmF1bHRGaXJlRXZlbnQ7XG5Qcm9taXNlLnByb3RvdHlwZS5fZXhlY3V0ZSA9IGZ1bmN0aW9uKGV4ZWN1dG9yLCByZXNvbHZlLCByZWplY3QpIHtcbiAgICB0cnkge1xuICAgICAgICBleGVjdXRvcihyZXNvbHZlLCByZWplY3QpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgfVxufTtcblByb21pc2UucHJvdG90eXBlLl9vbkNhbmNlbCA9IGZ1bmN0aW9uICgpIHt9O1xuUHJvbWlzZS5wcm90b3R5cGUuX3NldE9uQ2FuY2VsID0gZnVuY3Rpb24gKGhhbmRsZXIpIHsgOyB9O1xuUHJvbWlzZS5wcm90b3R5cGUuX2F0dGFjaENhbmNlbGxhdGlvbkNhbGxiYWNrID0gZnVuY3Rpb24ob25DYW5jZWwpIHtcbiAgICA7XG59O1xuUHJvbWlzZS5wcm90b3R5cGUuX2NhcHR1cmVTdGFja1RyYWNlID0gZnVuY3Rpb24gKCkge307XG5Qcm9taXNlLnByb3RvdHlwZS5fYXR0YWNoRXh0cmFUcmFjZSA9IGZ1bmN0aW9uICgpIHt9O1xuUHJvbWlzZS5wcm90b3R5cGUuX2NsZWFyQ2FuY2VsbGF0aW9uRGF0YSA9IGZ1bmN0aW9uKCkge307XG5Qcm9taXNlLnByb3RvdHlwZS5fcHJvcGFnYXRlRnJvbSA9IGZ1bmN0aW9uIChwYXJlbnQsIGZsYWdzKSB7XG4gICAgO1xuICAgIDtcbn07XG5cbmZ1bmN0aW9uIGNhbmNlbGxhdGlvbkV4ZWN1dGUoZXhlY3V0b3IsIHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciBwcm9taXNlID0gdGhpcztcbiAgICB0cnkge1xuICAgICAgICBleGVjdXRvcihyZXNvbHZlLCByZWplY3QsIGZ1bmN0aW9uKG9uQ2FuY2VsKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIG9uQ2FuY2VsICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwib25DYW5jZWwgbXVzdCBiZSBhIGZ1bmN0aW9uLCBnb3Q6IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0aWwudG9TdHJpbmcob25DYW5jZWwpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByb21pc2UuX2F0dGFjaENhbmNlbGxhdGlvbkNhbGxiYWNrKG9uQ2FuY2VsKTtcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gZTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGNhbmNlbGxhdGlvbkF0dGFjaENhbmNlbGxhdGlvbkNhbGxiYWNrKG9uQ2FuY2VsKSB7XG4gICAgaWYgKCF0aGlzLl9pc0NhbmNlbGxhYmxlKCkpIHJldHVybiB0aGlzO1xuXG4gICAgdmFyIHByZXZpb3VzT25DYW5jZWwgPSB0aGlzLl9vbkNhbmNlbCgpO1xuICAgIGlmIChwcmV2aW91c09uQ2FuY2VsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKHV0aWwuaXNBcnJheShwcmV2aW91c09uQ2FuY2VsKSkge1xuICAgICAgICAgICAgcHJldmlvdXNPbkNhbmNlbC5wdXNoKG9uQ2FuY2VsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3NldE9uQ2FuY2VsKFtwcmV2aW91c09uQ2FuY2VsLCBvbkNhbmNlbF0pO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fc2V0T25DYW5jZWwob25DYW5jZWwpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gY2FuY2VsbGF0aW9uT25DYW5jZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX29uQ2FuY2VsRmllbGQ7XG59XG5cbmZ1bmN0aW9uIGNhbmNlbGxhdGlvblNldE9uQ2FuY2VsKG9uQ2FuY2VsKSB7XG4gICAgdGhpcy5fb25DYW5jZWxGaWVsZCA9IG9uQ2FuY2VsO1xufVxuXG5mdW5jdGlvbiBjYW5jZWxsYXRpb25DbGVhckNhbmNlbGxhdGlvbkRhdGEoKSB7XG4gICAgdGhpcy5fY2FuY2VsbGF0aW9uUGFyZW50ID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX29uQ2FuY2VsRmllbGQgPSB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGNhbmNlbGxhdGlvblByb3BhZ2F0ZUZyb20ocGFyZW50LCBmbGFncykge1xuICAgIGlmICgoZmxhZ3MgJiAxKSAhPT0gMCkge1xuICAgICAgICB0aGlzLl9jYW5jZWxsYXRpb25QYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgIHZhciBicmFuY2hlc1JlbWFpbmluZ1RvQ2FuY2VsID0gcGFyZW50Ll9icmFuY2hlc1JlbWFpbmluZ1RvQ2FuY2VsO1xuICAgICAgICBpZiAoYnJhbmNoZXNSZW1haW5pbmdUb0NhbmNlbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBicmFuY2hlc1JlbWFpbmluZ1RvQ2FuY2VsID0gMDtcbiAgICAgICAgfVxuICAgICAgICBwYXJlbnQuX2JyYW5jaGVzUmVtYWluaW5nVG9DYW5jZWwgPSBicmFuY2hlc1JlbWFpbmluZ1RvQ2FuY2VsICsgMTtcbiAgICB9XG4gICAgaWYgKChmbGFncyAmIDIpICE9PSAwICYmIHBhcmVudC5faXNCb3VuZCgpKSB7XG4gICAgICAgIHRoaXMuX3NldEJvdW5kVG8ocGFyZW50Ll9ib3VuZFRvKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGJpbmRpbmdQcm9wYWdhdGVGcm9tKHBhcmVudCwgZmxhZ3MpIHtcbiAgICBpZiAoKGZsYWdzICYgMikgIT09IDAgJiYgcGFyZW50Ll9pc0JvdW5kKCkpIHtcbiAgICAgICAgdGhpcy5fc2V0Qm91bmRUbyhwYXJlbnQuX2JvdW5kVG8pO1xuICAgIH1cbn1cbnZhciBwcm9wYWdhdGVGcm9tRnVuY3Rpb24gPSBiaW5kaW5nUHJvcGFnYXRlRnJvbTtcblxuZnVuY3Rpb24gYm91bmRWYWx1ZUZ1bmN0aW9uKCkge1xuICAgIHZhciByZXQgPSB0aGlzLl9ib3VuZFRvO1xuICAgIGlmIChyZXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAocmV0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICAgICAgaWYgKHJldC5pc0Z1bGZpbGxlZCgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJldC52YWx1ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIGxvbmdTdGFja1RyYWNlc0NhcHR1cmVTdGFja1RyYWNlKCkge1xuICAgIHRoaXMuX3RyYWNlID0gbmV3IENhcHR1cmVkVHJhY2UodGhpcy5fcGVla0NvbnRleHQoKSk7XG59XG5cbmZ1bmN0aW9uIGxvbmdTdGFja1RyYWNlc0F0dGFjaEV4dHJhVHJhY2UoZXJyb3IsIGlnbm9yZVNlbGYpIHtcbiAgICBpZiAoY2FuQXR0YWNoVHJhY2UoZXJyb3IpKSB7XG4gICAgICAgIHZhciB0cmFjZSA9IHRoaXMuX3RyYWNlO1xuICAgICAgICBpZiAodHJhY2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKGlnbm9yZVNlbGYpIHRyYWNlID0gdHJhY2UuX3BhcmVudDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHJhY2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdHJhY2UuYXR0YWNoRXh0cmFUcmFjZShlcnJvcik7XG4gICAgICAgIH0gZWxzZSBpZiAoIWVycm9yLl9fc3RhY2tDbGVhbmVkX18pIHtcbiAgICAgICAgICAgIHZhciBwYXJzZWQgPSBwYXJzZVN0YWNrQW5kTWVzc2FnZShlcnJvcik7XG4gICAgICAgICAgICB1dGlsLm5vdEVudW1lcmFibGVQcm9wKGVycm9yLCBcInN0YWNrXCIsXG4gICAgICAgICAgICAgICAgcGFyc2VkLm1lc3NhZ2UgKyBcIlxcblwiICsgcGFyc2VkLnN0YWNrLmpvaW4oXCJcXG5cIikpO1xuICAgICAgICAgICAgdXRpbC5ub3RFbnVtZXJhYmxlUHJvcChlcnJvciwgXCJfX3N0YWNrQ2xlYW5lZF9fXCIsIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBjaGVja0ZvcmdvdHRlblJldHVybnMocmV0dXJuVmFsdWUsIHByb21pc2VDcmVhdGVkLCBuYW1lLCBwcm9taXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudCkge1xuICAgIGlmIChyZXR1cm5WYWx1ZSA9PT0gdW5kZWZpbmVkICYmIHByb21pc2VDcmVhdGVkICE9PSBudWxsICYmXG4gICAgICAgIHdGb3Jnb3R0ZW5SZXR1cm4pIHtcbiAgICAgICAgaWYgKHBhcmVudCAhPT0gdW5kZWZpbmVkICYmIHBhcmVudC5fcmV0dXJuZWROb25VbmRlZmluZWQoKSkgcmV0dXJuO1xuICAgICAgICBpZiAoKHByb21pc2UuX2JpdEZpZWxkICYgNjU1MzUpID09PSAwKSByZXR1cm47XG5cbiAgICAgICAgaWYgKG5hbWUpIG5hbWUgPSBuYW1lICsgXCIgXCI7XG4gICAgICAgIHZhciBoYW5kbGVyTGluZSA9IFwiXCI7XG4gICAgICAgIHZhciBjcmVhdG9yTGluZSA9IFwiXCI7XG4gICAgICAgIGlmIChwcm9taXNlQ3JlYXRlZC5fdHJhY2UpIHtcbiAgICAgICAgICAgIHZhciB0cmFjZUxpbmVzID0gcHJvbWlzZUNyZWF0ZWQuX3RyYWNlLnN0YWNrLnNwbGl0KFwiXFxuXCIpO1xuICAgICAgICAgICAgdmFyIHN0YWNrID0gY2xlYW5TdGFjayh0cmFjZUxpbmVzKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBzdGFjay5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICAgICAgICAgIHZhciBsaW5lID0gc3RhY2tbaV07XG4gICAgICAgICAgICAgICAgaWYgKCFub2RlRnJhbWVQYXR0ZXJuLnRlc3QobGluZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxpbmVNYXRjaGVzID0gbGluZS5tYXRjaChwYXJzZUxpbmVQYXR0ZXJuKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxpbmVNYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyTGluZSAgPSBcImF0IFwiICsgbGluZU1hdGNoZXNbMV0gK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiOlwiICsgbGluZU1hdGNoZXNbMl0gKyBcIjpcIiArIGxpbmVNYXRjaGVzWzNdICsgXCIgXCI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc3RhY2subGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBmaXJzdFVzZXJMaW5lID0gc3RhY2tbMF07XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cmFjZUxpbmVzLmxlbmd0aDsgKytpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYWNlTGluZXNbaV0gPT09IGZpcnN0VXNlckxpbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0b3JMaW5lID0gXCJcXG5cIiArIHRyYWNlTGluZXNbaSAtIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgbXNnID0gXCJhIHByb21pc2Ugd2FzIGNyZWF0ZWQgaW4gYSBcIiArIG5hbWUgK1xuICAgICAgICAgICAgXCJoYW5kbGVyIFwiICsgaGFuZGxlckxpbmUgKyBcImJ1dCB3YXMgbm90IHJldHVybmVkIGZyb20gaXQsIFwiICtcbiAgICAgICAgICAgIFwic2VlIGh0dHA6Ly9nb28uZ2wvclJxTVV3XCIgK1xuICAgICAgICAgICAgY3JlYXRvckxpbmU7XG4gICAgICAgIHByb21pc2UuX3dhcm4obXNnLCB0cnVlLCBwcm9taXNlQ3JlYXRlZCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkZXByZWNhdGVkKG5hbWUsIHJlcGxhY2VtZW50KSB7XG4gICAgdmFyIG1lc3NhZ2UgPSBuYW1lICtcbiAgICAgICAgXCIgaXMgZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIGEgZnV0dXJlIHZlcnNpb24uXCI7XG4gICAgaWYgKHJlcGxhY2VtZW50KSBtZXNzYWdlICs9IFwiIFVzZSBcIiArIHJlcGxhY2VtZW50ICsgXCIgaW5zdGVhZC5cIjtcbiAgICByZXR1cm4gd2FybihtZXNzYWdlKTtcbn1cblxuZnVuY3Rpb24gd2FybihtZXNzYWdlLCBzaG91bGRVc2VPd25UcmFjZSwgcHJvbWlzZSkge1xuICAgIGlmICghY29uZmlnLndhcm5pbmdzKSByZXR1cm47XG4gICAgdmFyIHdhcm5pbmcgPSBuZXcgV2FybmluZyhtZXNzYWdlKTtcbiAgICB2YXIgY3R4O1xuICAgIGlmIChzaG91bGRVc2VPd25UcmFjZSkge1xuICAgICAgICBwcm9taXNlLl9hdHRhY2hFeHRyYVRyYWNlKHdhcm5pbmcpO1xuICAgIH0gZWxzZSBpZiAoY29uZmlnLmxvbmdTdGFja1RyYWNlcyAmJiAoY3R4ID0gUHJvbWlzZS5fcGVla0NvbnRleHQoKSkpIHtcbiAgICAgICAgY3R4LmF0dGFjaEV4dHJhVHJhY2Uod2FybmluZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHBhcnNlZCA9IHBhcnNlU3RhY2tBbmRNZXNzYWdlKHdhcm5pbmcpO1xuICAgICAgICB3YXJuaW5nLnN0YWNrID0gcGFyc2VkLm1lc3NhZ2UgKyBcIlxcblwiICsgcGFyc2VkLnN0YWNrLmpvaW4oXCJcXG5cIik7XG4gICAgfVxuXG4gICAgaWYgKCFhY3RpdmVGaXJlRXZlbnQoXCJ3YXJuaW5nXCIsIHdhcm5pbmcpKSB7XG4gICAgICAgIGZvcm1hdEFuZExvZ0Vycm9yKHdhcm5pbmcsIFwiXCIsIHRydWUpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVjb25zdHJ1Y3RTdGFjayhtZXNzYWdlLCBzdGFja3MpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0YWNrcy5sZW5ndGggLSAxOyArK2kpIHtcbiAgICAgICAgc3RhY2tzW2ldLnB1c2goXCJGcm9tIHByZXZpb3VzIGV2ZW50OlwiKTtcbiAgICAgICAgc3RhY2tzW2ldID0gc3RhY2tzW2ldLmpvaW4oXCJcXG5cIik7XG4gICAgfVxuICAgIGlmIChpIDwgc3RhY2tzLmxlbmd0aCkge1xuICAgICAgICBzdGFja3NbaV0gPSBzdGFja3NbaV0uam9pbihcIlxcblwiKTtcbiAgICB9XG4gICAgcmV0dXJuIG1lc3NhZ2UgKyBcIlxcblwiICsgc3RhY2tzLmpvaW4oXCJcXG5cIik7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUR1cGxpY2F0ZU9yRW1wdHlKdW1wcyhzdGFja3MpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0YWNrcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBpZiAoc3RhY2tzW2ldLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgKChpICsgMSA8IHN0YWNrcy5sZW5ndGgpICYmIHN0YWNrc1tpXVswXSA9PT0gc3RhY2tzW2krMV1bMF0pKSB7XG4gICAgICAgICAgICBzdGFja3Muc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgaS0tO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmVDb21tb25Sb290cyhzdGFja3MpIHtcbiAgICB2YXIgY3VycmVudCA9IHN0YWNrc1swXTtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IHN0YWNrcy5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgcHJldiA9IHN0YWNrc1tpXTtcbiAgICAgICAgdmFyIGN1cnJlbnRMYXN0SW5kZXggPSBjdXJyZW50Lmxlbmd0aCAtIDE7XG4gICAgICAgIHZhciBjdXJyZW50TGFzdExpbmUgPSBjdXJyZW50W2N1cnJlbnRMYXN0SW5kZXhdO1xuICAgICAgICB2YXIgY29tbW9uUm9vdE1lZXRQb2ludCA9IC0xO1xuXG4gICAgICAgIGZvciAodmFyIGogPSBwcmV2Lmxlbmd0aCAtIDE7IGogPj0gMDsgLS1qKSB7XG4gICAgICAgICAgICBpZiAocHJldltqXSA9PT0gY3VycmVudExhc3RMaW5lKSB7XG4gICAgICAgICAgICAgICAgY29tbW9uUm9vdE1lZXRQb2ludCA9IGo7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBqID0gY29tbW9uUm9vdE1lZXRQb2ludDsgaiA+PSAwOyAtLWopIHtcbiAgICAgICAgICAgIHZhciBsaW5lID0gcHJldltqXTtcbiAgICAgICAgICAgIGlmIChjdXJyZW50W2N1cnJlbnRMYXN0SW5kZXhdID09PSBsaW5lKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudC5wb3AoKTtcbiAgICAgICAgICAgICAgICBjdXJyZW50TGFzdEluZGV4LS07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnQgPSBwcmV2O1xuICAgIH1cbn1cblxuZnVuY3Rpb24gY2xlYW5TdGFjayhzdGFjaykge1xuICAgIHZhciByZXQgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0YWNrLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBsaW5lID0gc3RhY2tbaV07XG4gICAgICAgIHZhciBpc1RyYWNlTGluZSA9IFwiICAgIChObyBzdGFjayB0cmFjZSlcIiA9PT0gbGluZSB8fFxuICAgICAgICAgICAgc3RhY2tGcmFtZVBhdHRlcm4udGVzdChsaW5lKTtcbiAgICAgICAgdmFyIGlzSW50ZXJuYWxGcmFtZSA9IGlzVHJhY2VMaW5lICYmIHNob3VsZElnbm9yZShsaW5lKTtcbiAgICAgICAgaWYgKGlzVHJhY2VMaW5lICYmICFpc0ludGVybmFsRnJhbWUpIHtcbiAgICAgICAgICAgIGlmIChpbmRlbnRTdGFja0ZyYW1lcyAmJiBsaW5lLmNoYXJBdCgwKSAhPT0gXCIgXCIpIHtcbiAgICAgICAgICAgICAgICBsaW5lID0gXCIgICAgXCIgKyBsaW5lO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0LnB1c2gobGluZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gc3RhY2tGcmFtZXNBc0FycmF5KGVycm9yKSB7XG4gICAgdmFyIHN0YWNrID0gZXJyb3Iuc3RhY2sucmVwbGFjZSgvXFxzKyQvZywgXCJcIikuc3BsaXQoXCJcXG5cIik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdGFjay5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgbGluZSA9IHN0YWNrW2ldO1xuICAgICAgICBpZiAoXCIgICAgKE5vIHN0YWNrIHRyYWNlKVwiID09PSBsaW5lIHx8IHN0YWNrRnJhbWVQYXR0ZXJuLnRlc3QobGluZSkpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChpID4gMCkge1xuICAgICAgICBzdGFjayA9IHN0YWNrLnNsaWNlKGkpO1xuICAgIH1cbiAgICByZXR1cm4gc3RhY2s7XG59XG5cbmZ1bmN0aW9uIHBhcnNlU3RhY2tBbmRNZXNzYWdlKGVycm9yKSB7XG4gICAgdmFyIHN0YWNrID0gZXJyb3Iuc3RhY2s7XG4gICAgdmFyIG1lc3NhZ2UgPSBlcnJvci50b1N0cmluZygpO1xuICAgIHN0YWNrID0gdHlwZW9mIHN0YWNrID09PSBcInN0cmluZ1wiICYmIHN0YWNrLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICA/IHN0YWNrRnJhbWVzQXNBcnJheShlcnJvcikgOiBbXCIgICAgKE5vIHN0YWNrIHRyYWNlKVwiXTtcbiAgICByZXR1cm4ge1xuICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgICAgICBzdGFjazogY2xlYW5TdGFjayhzdGFjaylcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBmb3JtYXRBbmRMb2dFcnJvcihlcnJvciwgdGl0bGUsIGlzU29mdCkge1xuICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICB2YXIgbWVzc2FnZTtcbiAgICAgICAgaWYgKHV0aWwuaXNPYmplY3QoZXJyb3IpKSB7XG4gICAgICAgICAgICB2YXIgc3RhY2sgPSBlcnJvci5zdGFjaztcbiAgICAgICAgICAgIG1lc3NhZ2UgPSB0aXRsZSArIGZvcm1hdFN0YWNrKHN0YWNrLCBlcnJvcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtZXNzYWdlID0gdGl0bGUgKyBTdHJpbmcoZXJyb3IpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgcHJpbnRXYXJuaW5nID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHByaW50V2FybmluZyhtZXNzYWdlLCBpc1NvZnQpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjb25zb2xlLmxvZyA9PT0gXCJmdW5jdGlvblwiIHx8XG4gICAgICAgICAgICB0eXBlb2YgY29uc29sZS5sb2cgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBmaXJlUmVqZWN0aW9uRXZlbnQobmFtZSwgbG9jYWxIYW5kbGVyLCByZWFzb24sIHByb21pc2UpIHtcbiAgICB2YXIgbG9jYWxFdmVudEZpcmVkID0gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBsb2NhbEhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgbG9jYWxFdmVudEZpcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChuYW1lID09PSBcInJlamVjdGlvbkhhbmRsZWRcIikge1xuICAgICAgICAgICAgICAgIGxvY2FsSGFuZGxlcihwcm9taXNlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9jYWxIYW5kbGVyKHJlYXNvbiwgcHJvbWlzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGFzeW5jLnRocm93TGF0ZXIoZSk7XG4gICAgfVxuXG4gICAgaWYgKG5hbWUgPT09IFwidW5oYW5kbGVkUmVqZWN0aW9uXCIpIHtcbiAgICAgICAgaWYgKCFhY3RpdmVGaXJlRXZlbnQobmFtZSwgcmVhc29uLCBwcm9taXNlKSAmJiAhbG9jYWxFdmVudEZpcmVkKSB7XG4gICAgICAgICAgICBmb3JtYXRBbmRMb2dFcnJvcihyZWFzb24sIFwiVW5oYW5kbGVkIHJlamVjdGlvbiBcIik7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBhY3RpdmVGaXJlRXZlbnQobmFtZSwgcHJvbWlzZSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBmb3JtYXROb25FcnJvcihvYmopIHtcbiAgICB2YXIgc3RyO1xuICAgIGlmICh0eXBlb2Ygb2JqID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgc3RyID0gXCJbZnVuY3Rpb24gXCIgK1xuICAgICAgICAgICAgKG9iai5uYW1lIHx8IFwiYW5vbnltb3VzXCIpICtcbiAgICAgICAgICAgIFwiXVwiO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHN0ciA9IG9iaiAmJiB0eXBlb2Ygb2JqLnRvU3RyaW5nID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICAgID8gb2JqLnRvU3RyaW5nKCkgOiB1dGlsLnRvU3RyaW5nKG9iaik7XG4gICAgICAgIHZhciBydXNlbGVzc1RvU3RyaW5nID0gL1xcW29iamVjdCBbYS16QS1aMC05JF9dK1xcXS87XG4gICAgICAgIGlmIChydXNlbGVzc1RvU3RyaW5nLnRlc3Qoc3RyKSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2YXIgbmV3U3RyID0gSlNPTi5zdHJpbmdpZnkob2JqKTtcbiAgICAgICAgICAgICAgICBzdHIgPSBuZXdTdHI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaChlKSB7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgc3RyID0gXCIoZW1wdHkgYXJyYXkpXCI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIChcIig8XCIgKyBzbmlwKHN0cikgKyBcIj4sIG5vIHN0YWNrIHRyYWNlKVwiKTtcbn1cblxuZnVuY3Rpb24gc25pcChzdHIpIHtcbiAgICB2YXIgbWF4Q2hhcnMgPSA0MTtcbiAgICBpZiAoc3RyLmxlbmd0aCA8IG1heENoYXJzKSB7XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIHJldHVybiBzdHIuc3Vic3RyKDAsIG1heENoYXJzIC0gMykgKyBcIi4uLlwiO1xufVxuXG5mdW5jdGlvbiBsb25nU3RhY2tUcmFjZXNJc1N1cHBvcnRlZCgpIHtcbiAgICByZXR1cm4gdHlwZW9mIGNhcHR1cmVTdGFja1RyYWNlID09PSBcImZ1bmN0aW9uXCI7XG59XG5cbnZhciBzaG91bGRJZ25vcmUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGZhbHNlOyB9O1xudmFyIHBhcnNlTGluZUluZm9SZWdleCA9IC9bXFwvPFxcKF0oW146XFwvXSspOihcXGQrKTooPzpcXGQrKVxcKT9cXHMqJC87XG5mdW5jdGlvbiBwYXJzZUxpbmVJbmZvKGxpbmUpIHtcbiAgICB2YXIgbWF0Y2hlcyA9IGxpbmUubWF0Y2gocGFyc2VMaW5lSW5mb1JlZ2V4KTtcbiAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmlsZU5hbWU6IG1hdGNoZXNbMV0sXG4gICAgICAgICAgICBsaW5lOiBwYXJzZUludChtYXRjaGVzWzJdLCAxMClcbiAgICAgICAgfTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNldEJvdW5kcyhmaXJzdExpbmVFcnJvciwgbGFzdExpbmVFcnJvcikge1xuICAgIGlmICghbG9uZ1N0YWNrVHJhY2VzSXNTdXBwb3J0ZWQoKSkgcmV0dXJuO1xuICAgIHZhciBmaXJzdFN0YWNrTGluZXMgPSBmaXJzdExpbmVFcnJvci5zdGFjay5zcGxpdChcIlxcblwiKTtcbiAgICB2YXIgbGFzdFN0YWNrTGluZXMgPSBsYXN0TGluZUVycm9yLnN0YWNrLnNwbGl0KFwiXFxuXCIpO1xuICAgIHZhciBmaXJzdEluZGV4ID0gLTE7XG4gICAgdmFyIGxhc3RJbmRleCA9IC0xO1xuICAgIHZhciBmaXJzdEZpbGVOYW1lO1xuICAgIHZhciBsYXN0RmlsZU5hbWU7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaXJzdFN0YWNrTGluZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHBhcnNlTGluZUluZm8oZmlyc3RTdGFja0xpbmVzW2ldKTtcbiAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgZmlyc3RGaWxlTmFtZSA9IHJlc3VsdC5maWxlTmFtZTtcbiAgICAgICAgICAgIGZpcnN0SW5kZXggPSByZXN1bHQubGluZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdFN0YWNrTGluZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHBhcnNlTGluZUluZm8obGFzdFN0YWNrTGluZXNbaV0pO1xuICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICBsYXN0RmlsZU5hbWUgPSByZXN1bHQuZmlsZU5hbWU7XG4gICAgICAgICAgICBsYXN0SW5kZXggPSByZXN1bHQubGluZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChmaXJzdEluZGV4IDwgMCB8fCBsYXN0SW5kZXggPCAwIHx8ICFmaXJzdEZpbGVOYW1lIHx8ICFsYXN0RmlsZU5hbWUgfHxcbiAgICAgICAgZmlyc3RGaWxlTmFtZSAhPT0gbGFzdEZpbGVOYW1lIHx8IGZpcnN0SW5kZXggPj0gbGFzdEluZGV4KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzaG91bGRJZ25vcmUgPSBmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgIGlmIChibHVlYmlyZEZyYW1lUGF0dGVybi50ZXN0KGxpbmUpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgdmFyIGluZm8gPSBwYXJzZUxpbmVJbmZvKGxpbmUpO1xuICAgICAgICBpZiAoaW5mbykge1xuICAgICAgICAgICAgaWYgKGluZm8uZmlsZU5hbWUgPT09IGZpcnN0RmlsZU5hbWUgJiZcbiAgICAgICAgICAgICAgICAoZmlyc3RJbmRleCA8PSBpbmZvLmxpbmUgJiYgaW5mby5saW5lIDw9IGxhc3RJbmRleCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gQ2FwdHVyZWRUcmFjZShwYXJlbnQpIHtcbiAgICB0aGlzLl9wYXJlbnQgPSBwYXJlbnQ7XG4gICAgdGhpcy5fcHJvbWlzZXNDcmVhdGVkID0gMDtcbiAgICB2YXIgbGVuZ3RoID0gdGhpcy5fbGVuZ3RoID0gMSArIChwYXJlbnQgPT09IHVuZGVmaW5lZCA/IDAgOiBwYXJlbnQuX2xlbmd0aCk7XG4gICAgY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgQ2FwdHVyZWRUcmFjZSk7XG4gICAgaWYgKGxlbmd0aCA+IDMyKSB0aGlzLnVuY3ljbGUoKTtcbn1cbnV0aWwuaW5oZXJpdHMoQ2FwdHVyZWRUcmFjZSwgRXJyb3IpO1xuQ29udGV4dC5DYXB0dXJlZFRyYWNlID0gQ2FwdHVyZWRUcmFjZTtcblxuQ2FwdHVyZWRUcmFjZS5wcm90b3R5cGUudW5jeWNsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBsZW5ndGggPSB0aGlzLl9sZW5ndGg7XG4gICAgaWYgKGxlbmd0aCA8IDIpIHJldHVybjtcbiAgICB2YXIgbm9kZXMgPSBbXTtcbiAgICB2YXIgc3RhY2tUb0luZGV4ID0ge307XG5cbiAgICBmb3IgKHZhciBpID0gMCwgbm9kZSA9IHRoaXM7IG5vZGUgIT09IHVuZGVmaW5lZDsgKytpKSB7XG4gICAgICAgIG5vZGVzLnB1c2gobm9kZSk7XG4gICAgICAgIG5vZGUgPSBub2RlLl9wYXJlbnQ7XG4gICAgfVxuICAgIGxlbmd0aCA9IHRoaXMuX2xlbmd0aCA9IGk7XG4gICAgZm9yICh2YXIgaSA9IGxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBzdGFjayA9IG5vZGVzW2ldLnN0YWNrO1xuICAgICAgICBpZiAoc3RhY2tUb0luZGV4W3N0YWNrXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdGFja1RvSW5kZXhbc3RhY2tdID0gaTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBjdXJyZW50U3RhY2sgPSBub2Rlc1tpXS5zdGFjaztcbiAgICAgICAgdmFyIGluZGV4ID0gc3RhY2tUb0luZGV4W2N1cnJlbnRTdGFja107XG4gICAgICAgIGlmIChpbmRleCAhPT0gdW5kZWZpbmVkICYmIGluZGV4ICE9PSBpKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPiAwKSB7XG4gICAgICAgICAgICAgICAgbm9kZXNbaW5kZXggLSAxXS5fcGFyZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIG5vZGVzW2luZGV4IC0gMV0uX2xlbmd0aCA9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBub2Rlc1tpXS5fcGFyZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgbm9kZXNbaV0uX2xlbmd0aCA9IDE7XG4gICAgICAgICAgICB2YXIgY3ljbGVFZGdlTm9kZSA9IGkgPiAwID8gbm9kZXNbaSAtIDFdIDogdGhpcztcblxuICAgICAgICAgICAgaWYgKGluZGV4IDwgbGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgIGN5Y2xlRWRnZU5vZGUuX3BhcmVudCA9IG5vZGVzW2luZGV4ICsgMV07XG4gICAgICAgICAgICAgICAgY3ljbGVFZGdlTm9kZS5fcGFyZW50LnVuY3ljbGUoKTtcbiAgICAgICAgICAgICAgICBjeWNsZUVkZ2VOb2RlLl9sZW5ndGggPVxuICAgICAgICAgICAgICAgICAgICBjeWNsZUVkZ2VOb2RlLl9wYXJlbnQuX2xlbmd0aCArIDE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGN5Y2xlRWRnZU5vZGUuX3BhcmVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBjeWNsZUVkZ2VOb2RlLl9sZW5ndGggPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGN1cnJlbnRDaGlsZExlbmd0aCA9IGN5Y2xlRWRnZU5vZGUuX2xlbmd0aCArIDE7XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gaSAtIDI7IGogPj0gMDsgLS1qKSB7XG4gICAgICAgICAgICAgICAgbm9kZXNbal0uX2xlbmd0aCA9IGN1cnJlbnRDaGlsZExlbmd0aDtcbiAgICAgICAgICAgICAgICBjdXJyZW50Q2hpbGRMZW5ndGgrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbkNhcHR1cmVkVHJhY2UucHJvdG90eXBlLmF0dGFjaEV4dHJhVHJhY2UgPSBmdW5jdGlvbihlcnJvcikge1xuICAgIGlmIChlcnJvci5fX3N0YWNrQ2xlYW5lZF9fKSByZXR1cm47XG4gICAgdGhpcy51bmN5Y2xlKCk7XG4gICAgdmFyIHBhcnNlZCA9IHBhcnNlU3RhY2tBbmRNZXNzYWdlKGVycm9yKTtcbiAgICB2YXIgbWVzc2FnZSA9IHBhcnNlZC5tZXNzYWdlO1xuICAgIHZhciBzdGFja3MgPSBbcGFyc2VkLnN0YWNrXTtcblxuICAgIHZhciB0cmFjZSA9IHRoaXM7XG4gICAgd2hpbGUgKHRyYWNlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc3RhY2tzLnB1c2goY2xlYW5TdGFjayh0cmFjZS5zdGFjay5zcGxpdChcIlxcblwiKSkpO1xuICAgICAgICB0cmFjZSA9IHRyYWNlLl9wYXJlbnQ7XG4gICAgfVxuICAgIHJlbW92ZUNvbW1vblJvb3RzKHN0YWNrcyk7XG4gICAgcmVtb3ZlRHVwbGljYXRlT3JFbXB0eUp1bXBzKHN0YWNrcyk7XG4gICAgdXRpbC5ub3RFbnVtZXJhYmxlUHJvcChlcnJvciwgXCJzdGFja1wiLCByZWNvbnN0cnVjdFN0YWNrKG1lc3NhZ2UsIHN0YWNrcykpO1xuICAgIHV0aWwubm90RW51bWVyYWJsZVByb3AoZXJyb3IsIFwiX19zdGFja0NsZWFuZWRfX1wiLCB0cnVlKTtcbn07XG5cbnZhciBjYXB0dXJlU3RhY2tUcmFjZSA9IChmdW5jdGlvbiBzdGFja0RldGVjdGlvbigpIHtcbiAgICB2YXIgdjhzdGFja0ZyYW1lUGF0dGVybiA9IC9eXFxzKmF0XFxzKi87XG4gICAgdmFyIHY4c3RhY2tGb3JtYXR0ZXIgPSBmdW5jdGlvbihzdGFjaywgZXJyb3IpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBzdGFjayA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIHN0YWNrO1xuXG4gICAgICAgIGlmIChlcnJvci5uYW1lICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgIGVycm9yLm1lc3NhZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIGVycm9yLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZvcm1hdE5vbkVycm9yKGVycm9yKTtcbiAgICB9O1xuXG4gICAgaWYgKHR5cGVvZiBFcnJvci5zdGFja1RyYWNlTGltaXQgPT09IFwibnVtYmVyXCIgJiZcbiAgICAgICAgdHlwZW9mIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgRXJyb3Iuc3RhY2tUcmFjZUxpbWl0ICs9IDY7XG4gICAgICAgIHN0YWNrRnJhbWVQYXR0ZXJuID0gdjhzdGFja0ZyYW1lUGF0dGVybjtcbiAgICAgICAgZm9ybWF0U3RhY2sgPSB2OHN0YWNrRm9ybWF0dGVyO1xuICAgICAgICB2YXIgY2FwdHVyZVN0YWNrVHJhY2UgPSBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZTtcblxuICAgICAgICBzaG91bGRJZ25vcmUgPSBmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gYmx1ZWJpcmRGcmFtZVBhdHRlcm4udGVzdChsaW5lKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHJlY2VpdmVyLCBpZ25vcmVVbnRpbCkge1xuICAgICAgICAgICAgRXJyb3Iuc3RhY2tUcmFjZUxpbWl0ICs9IDY7XG4gICAgICAgICAgICBjYXB0dXJlU3RhY2tUcmFjZShyZWNlaXZlciwgaWdub3JlVW50aWwpO1xuICAgICAgICAgICAgRXJyb3Iuc3RhY2tUcmFjZUxpbWl0IC09IDY7XG4gICAgICAgIH07XG4gICAgfVxuICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoKTtcblxuICAgIGlmICh0eXBlb2YgZXJyLnN0YWNrID09PSBcInN0cmluZ1wiICYmXG4gICAgICAgIGVyci5zdGFjay5zcGxpdChcIlxcblwiKVswXS5pbmRleE9mKFwic3RhY2tEZXRlY3Rpb25AXCIpID49IDApIHtcbiAgICAgICAgc3RhY2tGcmFtZVBhdHRlcm4gPSAvQC87XG4gICAgICAgIGZvcm1hdFN0YWNrID0gdjhzdGFja0Zvcm1hdHRlcjtcbiAgICAgICAgaW5kZW50U3RhY2tGcmFtZXMgPSB0cnVlO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gY2FwdHVyZVN0YWNrVHJhY2Uobykge1xuICAgICAgICAgICAgby5zdGFjayA9IG5ldyBFcnJvcigpLnN0YWNrO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHZhciBoYXNTdGFja0FmdGVyVGhyb3c7XG4gICAgdHJ5IHsgdGhyb3cgbmV3IEVycm9yKCk7IH1cbiAgICBjYXRjaChlKSB7XG4gICAgICAgIGhhc1N0YWNrQWZ0ZXJUaHJvdyA9IChcInN0YWNrXCIgaW4gZSk7XG4gICAgfVxuICAgIGlmICghKFwic3RhY2tcIiBpbiBlcnIpICYmIGhhc1N0YWNrQWZ0ZXJUaHJvdyAmJlxuICAgICAgICB0eXBlb2YgRXJyb3Iuc3RhY2tUcmFjZUxpbWl0ID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgIHN0YWNrRnJhbWVQYXR0ZXJuID0gdjhzdGFja0ZyYW1lUGF0dGVybjtcbiAgICAgICAgZm9ybWF0U3RhY2sgPSB2OHN0YWNrRm9ybWF0dGVyO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gY2FwdHVyZVN0YWNrVHJhY2Uobykge1xuICAgICAgICAgICAgRXJyb3Iuc3RhY2tUcmFjZUxpbWl0ICs9IDY7XG4gICAgICAgICAgICB0cnkgeyB0aHJvdyBuZXcgRXJyb3IoKTsgfVxuICAgICAgICAgICAgY2F0Y2goZSkgeyBvLnN0YWNrID0gZS5zdGFjazsgfVxuICAgICAgICAgICAgRXJyb3Iuc3RhY2tUcmFjZUxpbWl0IC09IDY7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZm9ybWF0U3RhY2sgPSBmdW5jdGlvbihzdGFjaywgZXJyb3IpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBzdGFjayA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIHN0YWNrO1xuXG4gICAgICAgIGlmICgodHlwZW9mIGVycm9yID09PSBcIm9iamVjdFwiIHx8XG4gICAgICAgICAgICB0eXBlb2YgZXJyb3IgPT09IFwiZnVuY3Rpb25cIikgJiZcbiAgICAgICAgICAgIGVycm9yLm5hbWUgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgZXJyb3IubWVzc2FnZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gZXJyb3IudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZm9ybWF0Tm9uRXJyb3IoZXJyb3IpO1xuICAgIH07XG5cbiAgICByZXR1cm4gbnVsbDtcblxufSkoW10pO1xuXG5pZiAodHlwZW9mIGNvbnNvbGUgIT09IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIGNvbnNvbGUud2FybiAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHByaW50V2FybmluZyA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihtZXNzYWdlKTtcbiAgICB9O1xuICAgIGlmICh1dGlsLmlzTm9kZSAmJiBwcm9jZXNzLnN0ZGVyci5pc1RUWSkge1xuICAgICAgICBwcmludFdhcm5pbmcgPSBmdW5jdGlvbihtZXNzYWdlLCBpc1NvZnQpIHtcbiAgICAgICAgICAgIHZhciBjb2xvciA9IGlzU29mdCA/IFwiXFx1MDAxYlszM21cIiA6IFwiXFx1MDAxYlszMW1cIjtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihjb2xvciArIG1lc3NhZ2UgKyBcIlxcdTAwMWJbMG1cXG5cIik7XG4gICAgICAgIH07XG4gICAgfSBlbHNlIGlmICghdXRpbC5pc05vZGUgJiYgdHlwZW9mIChuZXcgRXJyb3IoKS5zdGFjaykgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgcHJpbnRXYXJuaW5nID0gZnVuY3Rpb24obWVzc2FnZSwgaXNTb2Z0KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIlY1wiICsgbWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzU29mdCA/IFwiY29sb3I6IGRhcmtvcmFuZ2VcIiA6IFwiY29sb3I6IHJlZFwiKTtcbiAgICAgICAgfTtcbiAgICB9XG59XG5cbnZhciBjb25maWcgPSB7XG4gICAgd2FybmluZ3M6IHdhcm5pbmdzLFxuICAgIGxvbmdTdGFja1RyYWNlczogZmFsc2UsXG4gICAgY2FuY2VsbGF0aW9uOiBmYWxzZSxcbiAgICBtb25pdG9yaW5nOiBmYWxzZVxufTtcblxuaWYgKGxvbmdTdGFja1RyYWNlcykgUHJvbWlzZS5sb25nU3RhY2tUcmFjZXMoKTtcblxucmV0dXJuIHtcbiAgICBsb25nU3RhY2tUcmFjZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gY29uZmlnLmxvbmdTdGFja1RyYWNlcztcbiAgICB9LFxuICAgIHdhcm5pbmdzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy53YXJuaW5ncztcbiAgICB9LFxuICAgIGNhbmNlbGxhdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBjb25maWcuY2FuY2VsbGF0aW9uO1xuICAgIH0sXG4gICAgbW9uaXRvcmluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBjb25maWcubW9uaXRvcmluZztcbiAgICB9LFxuICAgIHByb3BhZ2F0ZUZyb21GdW5jdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBwcm9wYWdhdGVGcm9tRnVuY3Rpb247XG4gICAgfSxcbiAgICBib3VuZFZhbHVlRnVuY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYm91bmRWYWx1ZUZ1bmN0aW9uO1xuICAgIH0sXG4gICAgY2hlY2tGb3Jnb3R0ZW5SZXR1cm5zOiBjaGVja0ZvcmdvdHRlblJldHVybnMsXG4gICAgc2V0Qm91bmRzOiBzZXRCb3VuZHMsXG4gICAgd2Fybjogd2FybixcbiAgICBkZXByZWNhdGVkOiBkZXByZWNhdGVkLFxuICAgIENhcHR1cmVkVHJhY2U6IENhcHR1cmVkVHJhY2UsXG4gICAgZmlyZURvbUV2ZW50OiBmaXJlRG9tRXZlbnQsXG4gICAgZmlyZUdsb2JhbEV2ZW50OiBmaXJlR2xvYmFsRXZlbnRcbn07XG59O1xuXG59LHtcIi4vZXJyb3JzXCI6MTIsXCIuL3V0aWxcIjozNn1dLDEwOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcblwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihQcm9taXNlKSB7XG5mdW5jdGlvbiByZXR1cm5lcigpIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZTtcbn1cbmZ1bmN0aW9uIHRocm93ZXIoKSB7XG4gICAgdGhyb3cgdGhpcy5yZWFzb247XG59XG5cblByb21pc2UucHJvdG90eXBlW1wicmV0dXJuXCJdID1cblByb21pc2UucHJvdG90eXBlLnRoZW5SZXR1cm4gPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBQcm9taXNlKSB2YWx1ZS5zdXBwcmVzc1VuaGFuZGxlZFJlamVjdGlvbnMoKTtcbiAgICByZXR1cm4gdGhpcy5fdGhlbihcbiAgICAgICAgcmV0dXJuZXIsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB7dmFsdWU6IHZhbHVlfSwgdW5kZWZpbmVkKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlW1widGhyb3dcIl0gPVxuUHJvbWlzZS5wcm90b3R5cGUudGhlblRocm93ID0gZnVuY3Rpb24gKHJlYXNvbikge1xuICAgIHJldHVybiB0aGlzLl90aGVuKFxuICAgICAgICB0aHJvd2VyLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwge3JlYXNvbjogcmVhc29ufSwgdW5kZWZpbmVkKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmNhdGNoVGhyb3cgPSBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPD0gMSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdGhlbihcbiAgICAgICAgICAgIHVuZGVmaW5lZCwgdGhyb3dlciwgdW5kZWZpbmVkLCB7cmVhc29uOiByZWFzb259LCB1bmRlZmluZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBfcmVhc29uID0gYXJndW1lbnRzWzFdO1xuICAgICAgICB2YXIgaGFuZGxlciA9IGZ1bmN0aW9uKCkge3Rocm93IF9yZWFzb247fTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2F1Z2h0KHJlYXNvbiwgaGFuZGxlcik7XG4gICAgfVxufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuY2F0Y2hSZXR1cm4gPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8PSAxKSB7XG4gICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFByb21pc2UpIHZhbHVlLnN1cHByZXNzVW5oYW5kbGVkUmVqZWN0aW9ucygpO1xuICAgICAgICByZXR1cm4gdGhpcy5fdGhlbihcbiAgICAgICAgICAgIHVuZGVmaW5lZCwgcmV0dXJuZXIsIHVuZGVmaW5lZCwge3ZhbHVlOiB2YWx1ZX0sIHVuZGVmaW5lZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIF92YWx1ZSA9IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgaWYgKF92YWx1ZSBpbnN0YW5jZW9mIFByb21pc2UpIF92YWx1ZS5zdXBwcmVzc1VuaGFuZGxlZFJlamVjdGlvbnMoKTtcbiAgICAgICAgdmFyIGhhbmRsZXIgPSBmdW5jdGlvbigpIHtyZXR1cm4gX3ZhbHVlO307XG4gICAgICAgIHJldHVybiB0aGlzLmNhdWdodCh2YWx1ZSwgaGFuZGxlcik7XG4gICAgfVxufTtcbn07XG5cbn0se31dLDExOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcblwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihQcm9taXNlLCBJTlRFUk5BTCkge1xudmFyIFByb21pc2VSZWR1Y2UgPSBQcm9taXNlLnJlZHVjZTtcbnZhciBQcm9taXNlQWxsID0gUHJvbWlzZS5hbGw7XG5cbmZ1bmN0aW9uIHByb21pc2VBbGxUaGlzKCkge1xuICAgIHJldHVybiBQcm9taXNlQWxsKHRoaXMpO1xufVxuXG5mdW5jdGlvbiBQcm9taXNlTWFwU2VyaWVzKHByb21pc2VzLCBmbikge1xuICAgIHJldHVybiBQcm9taXNlUmVkdWNlKHByb21pc2VzLCBmbiwgSU5URVJOQUwsIElOVEVSTkFMKTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uIChmbikge1xuICAgIHJldHVybiBQcm9taXNlUmVkdWNlKHRoaXMsIGZuLCBJTlRFUk5BTCwgMClcbiAgICAgICAgICAgICAgLl90aGVuKHByb21pc2VBbGxUaGlzLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdGhpcywgdW5kZWZpbmVkKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm1hcFNlcmllcyA9IGZ1bmN0aW9uIChmbikge1xuICAgIHJldHVybiBQcm9taXNlUmVkdWNlKHRoaXMsIGZuLCBJTlRFUk5BTCwgSU5URVJOQUwpO1xufTtcblxuUHJvbWlzZS5lYWNoID0gZnVuY3Rpb24gKHByb21pc2VzLCBmbikge1xuICAgIHJldHVybiBQcm9taXNlUmVkdWNlKHByb21pc2VzLCBmbiwgSU5URVJOQUwsIDApXG4gICAgICAgICAgICAgIC5fdGhlbihwcm9taXNlQWxsVGhpcywgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHByb21pc2VzLCB1bmRlZmluZWQpO1xufTtcblxuUHJvbWlzZS5tYXBTZXJpZXMgPSBQcm9taXNlTWFwU2VyaWVzO1xufTtcblxuXG59LHt9XSwxMjpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG5cInVzZSBzdHJpY3RcIjtcbnZhciBlczUgPSBfZGVyZXFfKFwiLi9lczVcIik7XG52YXIgT2JqZWN0ZnJlZXplID0gZXM1LmZyZWV6ZTtcbnZhciB1dGlsID0gX2RlcmVxXyhcIi4vdXRpbFwiKTtcbnZhciBpbmhlcml0cyA9IHV0aWwuaW5oZXJpdHM7XG52YXIgbm90RW51bWVyYWJsZVByb3AgPSB1dGlsLm5vdEVudW1lcmFibGVQcm9wO1xuXG5mdW5jdGlvbiBzdWJFcnJvcihuYW1lUHJvcGVydHksIGRlZmF1bHRNZXNzYWdlKSB7XG4gICAgZnVuY3Rpb24gU3ViRXJyb3IobWVzc2FnZSkge1xuICAgICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgU3ViRXJyb3IpKSByZXR1cm4gbmV3IFN1YkVycm9yKG1lc3NhZ2UpO1xuICAgICAgICBub3RFbnVtZXJhYmxlUHJvcCh0aGlzLCBcIm1lc3NhZ2VcIixcbiAgICAgICAgICAgIHR5cGVvZiBtZXNzYWdlID09PSBcInN0cmluZ1wiID8gbWVzc2FnZSA6IGRlZmF1bHRNZXNzYWdlKTtcbiAgICAgICAgbm90RW51bWVyYWJsZVByb3AodGhpcywgXCJuYW1lXCIsIG5hbWVQcm9wZXJ0eSk7XG4gICAgICAgIGlmIChFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSkge1xuICAgICAgICAgICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgdGhpcy5jb25zdHJ1Y3Rvcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBFcnJvci5jYWxsKHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGluaGVyaXRzKFN1YkVycm9yLCBFcnJvcik7XG4gICAgcmV0dXJuIFN1YkVycm9yO1xufVxuXG52YXIgX1R5cGVFcnJvciwgX1JhbmdlRXJyb3I7XG52YXIgV2FybmluZyA9IHN1YkVycm9yKFwiV2FybmluZ1wiLCBcIndhcm5pbmdcIik7XG52YXIgQ2FuY2VsbGF0aW9uRXJyb3IgPSBzdWJFcnJvcihcIkNhbmNlbGxhdGlvbkVycm9yXCIsIFwiY2FuY2VsbGF0aW9uIGVycm9yXCIpO1xudmFyIFRpbWVvdXRFcnJvciA9IHN1YkVycm9yKFwiVGltZW91dEVycm9yXCIsIFwidGltZW91dCBlcnJvclwiKTtcbnZhciBBZ2dyZWdhdGVFcnJvciA9IHN1YkVycm9yKFwiQWdncmVnYXRlRXJyb3JcIiwgXCJhZ2dyZWdhdGUgZXJyb3JcIik7XG50cnkge1xuICAgIF9UeXBlRXJyb3IgPSBUeXBlRXJyb3I7XG4gICAgX1JhbmdlRXJyb3IgPSBSYW5nZUVycm9yO1xufSBjYXRjaChlKSB7XG4gICAgX1R5cGVFcnJvciA9IHN1YkVycm9yKFwiVHlwZUVycm9yXCIsIFwidHlwZSBlcnJvclwiKTtcbiAgICBfUmFuZ2VFcnJvciA9IHN1YkVycm9yKFwiUmFuZ2VFcnJvclwiLCBcInJhbmdlIGVycm9yXCIpO1xufVxuXG52YXIgbWV0aG9kcyA9IChcImpvaW4gcG9wIHB1c2ggc2hpZnQgdW5zaGlmdCBzbGljZSBmaWx0ZXIgZm9yRWFjaCBzb21lIFwiICtcbiAgICBcImV2ZXJ5IG1hcCBpbmRleE9mIGxhc3RJbmRleE9mIHJlZHVjZSByZWR1Y2VSaWdodCBzb3J0IHJldmVyc2VcIikuc3BsaXQoXCIgXCIpO1xuXG5mb3IgKHZhciBpID0gMDsgaSA8IG1ldGhvZHMubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAodHlwZW9mIEFycmF5LnByb3RvdHlwZVttZXRob2RzW2ldXSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIEFnZ3JlZ2F0ZUVycm9yLnByb3RvdHlwZVttZXRob2RzW2ldXSA9IEFycmF5LnByb3RvdHlwZVttZXRob2RzW2ldXTtcbiAgICB9XG59XG5cbmVzNS5kZWZpbmVQcm9wZXJ0eShBZ2dyZWdhdGVFcnJvci5wcm90b3R5cGUsIFwibGVuZ3RoXCIsIHtcbiAgICB2YWx1ZTogMCxcbiAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWVcbn0pO1xuQWdncmVnYXRlRXJyb3IucHJvdG90eXBlW1wiaXNPcGVyYXRpb25hbFwiXSA9IHRydWU7XG52YXIgbGV2ZWwgPSAwO1xuQWdncmVnYXRlRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGluZGVudCA9IEFycmF5KGxldmVsICogNCArIDEpLmpvaW4oXCIgXCIpO1xuICAgIHZhciByZXQgPSBcIlxcblwiICsgaW5kZW50ICsgXCJBZ2dyZWdhdGVFcnJvciBvZjpcIiArIFwiXFxuXCI7XG4gICAgbGV2ZWwrKztcbiAgICBpbmRlbnQgPSBBcnJheShsZXZlbCAqIDQgKyAxKS5qb2luKFwiIFwiKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIHN0ciA9IHRoaXNbaV0gPT09IHRoaXMgPyBcIltDaXJjdWxhciBBZ2dyZWdhdGVFcnJvcl1cIiA6IHRoaXNbaV0gKyBcIlwiO1xuICAgICAgICB2YXIgbGluZXMgPSBzdHIuc3BsaXQoXCJcXG5cIik7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbGluZXMubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICAgIGxpbmVzW2pdID0gaW5kZW50ICsgbGluZXNbal07XG4gICAgICAgIH1cbiAgICAgICAgc3RyID0gbGluZXMuam9pbihcIlxcblwiKTtcbiAgICAgICAgcmV0ICs9IHN0ciArIFwiXFxuXCI7XG4gICAgfVxuICAgIGxldmVsLS07XG4gICAgcmV0dXJuIHJldDtcbn07XG5cbmZ1bmN0aW9uIE9wZXJhdGlvbmFsRXJyb3IobWVzc2FnZSkge1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBPcGVyYXRpb25hbEVycm9yKSlcbiAgICAgICAgcmV0dXJuIG5ldyBPcGVyYXRpb25hbEVycm9yKG1lc3NhZ2UpO1xuICAgIG5vdEVudW1lcmFibGVQcm9wKHRoaXMsIFwibmFtZVwiLCBcIk9wZXJhdGlvbmFsRXJyb3JcIik7XG4gICAgbm90RW51bWVyYWJsZVByb3AodGhpcywgXCJtZXNzYWdlXCIsIG1lc3NhZ2UpO1xuICAgIHRoaXMuY2F1c2UgPSBtZXNzYWdlO1xuICAgIHRoaXNbXCJpc09wZXJhdGlvbmFsXCJdID0gdHJ1ZTtcblxuICAgIGlmIChtZXNzYWdlIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgbm90RW51bWVyYWJsZVByb3AodGhpcywgXCJtZXNzYWdlXCIsIG1lc3NhZ2UubWVzc2FnZSk7XG4gICAgICAgIG5vdEVudW1lcmFibGVQcm9wKHRoaXMsIFwic3RhY2tcIiwgbWVzc2FnZS5zdGFjayk7XG4gICAgfSBlbHNlIGlmIChFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSkge1xuICAgICAgICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCB0aGlzLmNvbnN0cnVjdG9yKTtcbiAgICB9XG5cbn1cbmluaGVyaXRzKE9wZXJhdGlvbmFsRXJyb3IsIEVycm9yKTtcblxudmFyIGVycm9yVHlwZXMgPSBFcnJvcltcIl9fQmx1ZWJpcmRFcnJvclR5cGVzX19cIl07XG5pZiAoIWVycm9yVHlwZXMpIHtcbiAgICBlcnJvclR5cGVzID0gT2JqZWN0ZnJlZXplKHtcbiAgICAgICAgQ2FuY2VsbGF0aW9uRXJyb3I6IENhbmNlbGxhdGlvbkVycm9yLFxuICAgICAgICBUaW1lb3V0RXJyb3I6IFRpbWVvdXRFcnJvcixcbiAgICAgICAgT3BlcmF0aW9uYWxFcnJvcjogT3BlcmF0aW9uYWxFcnJvcixcbiAgICAgICAgUmVqZWN0aW9uRXJyb3I6IE9wZXJhdGlvbmFsRXJyb3IsXG4gICAgICAgIEFnZ3JlZ2F0ZUVycm9yOiBBZ2dyZWdhdGVFcnJvclxuICAgIH0pO1xuICAgIGVzNS5kZWZpbmVQcm9wZXJ0eShFcnJvciwgXCJfX0JsdWViaXJkRXJyb3JUeXBlc19fXCIsIHtcbiAgICAgICAgdmFsdWU6IGVycm9yVHlwZXMsXG4gICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2VcbiAgICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgRXJyb3I6IEVycm9yLFxuICAgIFR5cGVFcnJvcjogX1R5cGVFcnJvcixcbiAgICBSYW5nZUVycm9yOiBfUmFuZ2VFcnJvcixcbiAgICBDYW5jZWxsYXRpb25FcnJvcjogZXJyb3JUeXBlcy5DYW5jZWxsYXRpb25FcnJvcixcbiAgICBPcGVyYXRpb25hbEVycm9yOiBlcnJvclR5cGVzLk9wZXJhdGlvbmFsRXJyb3IsXG4gICAgVGltZW91dEVycm9yOiBlcnJvclR5cGVzLlRpbWVvdXRFcnJvcixcbiAgICBBZ2dyZWdhdGVFcnJvcjogZXJyb3JUeXBlcy5BZ2dyZWdhdGVFcnJvcixcbiAgICBXYXJuaW5nOiBXYXJuaW5nXG59O1xuXG59LHtcIi4vZXM1XCI6MTMsXCIuL3V0aWxcIjozNn1dLDEzOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcbnZhciBpc0VTNSA9IChmdW5jdGlvbigpe1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIHJldHVybiB0aGlzID09PSB1bmRlZmluZWQ7XG59KSgpO1xuXG5pZiAoaXNFUzUpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAgICAgZnJlZXplOiBPYmplY3QuZnJlZXplLFxuICAgICAgICBkZWZpbmVQcm9wZXJ0eTogT2JqZWN0LmRlZmluZVByb3BlcnR5LFxuICAgICAgICBnZXREZXNjcmlwdG9yOiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yLFxuICAgICAgICBrZXlzOiBPYmplY3Qua2V5cyxcbiAgICAgICAgbmFtZXM6IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzLFxuICAgICAgICBnZXRQcm90b3R5cGVPZjogT2JqZWN0LmdldFByb3RvdHlwZU9mLFxuICAgICAgICBpc0FycmF5OiBBcnJheS5pc0FycmF5LFxuICAgICAgICBpc0VTNTogaXNFUzUsXG4gICAgICAgIHByb3BlcnR5SXNXcml0YWJsZTogZnVuY3Rpb24ob2JqLCBwcm9wKSB7XG4gICAgICAgICAgICB2YXIgZGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqLCBwcm9wKTtcbiAgICAgICAgICAgIHJldHVybiAhISghZGVzY3JpcHRvciB8fCBkZXNjcmlwdG9yLndyaXRhYmxlIHx8IGRlc2NyaXB0b3Iuc2V0KTtcbiAgICAgICAgfVxuICAgIH07XG59IGVsc2Uge1xuICAgIHZhciBoYXMgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgICB2YXIgc3RyID0ge30udG9TdHJpbmc7XG4gICAgdmFyIHByb3RvID0ge30uY29uc3RydWN0b3IucHJvdG90eXBlO1xuXG4gICAgdmFyIE9iamVjdEtleXMgPSBmdW5jdGlvbiAobykge1xuICAgICAgICB2YXIgcmV0ID0gW107XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvKSB7XG4gICAgICAgICAgICBpZiAoaGFzLmNhbGwobywga2V5KSkge1xuICAgICAgICAgICAgICAgIHJldC5wdXNoKGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9O1xuXG4gICAgdmFyIE9iamVjdEdldERlc2NyaXB0b3IgPSBmdW5jdGlvbihvLCBrZXkpIHtcbiAgICAgICAgcmV0dXJuIHt2YWx1ZTogb1trZXldfTtcbiAgICB9O1xuXG4gICAgdmFyIE9iamVjdERlZmluZVByb3BlcnR5ID0gZnVuY3Rpb24gKG8sIGtleSwgZGVzYykge1xuICAgICAgICBvW2tleV0gPSBkZXNjLnZhbHVlO1xuICAgICAgICByZXR1cm4gbztcbiAgICB9O1xuXG4gICAgdmFyIE9iamVjdEZyZWV6ZSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9O1xuXG4gICAgdmFyIE9iamVjdEdldFByb3RvdHlwZU9mID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdChvYmopLmNvbnN0cnVjdG9yLnByb3RvdHlwZTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIHByb3RvO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBBcnJheUlzQXJyYXkgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyLmNhbGwob2JqKSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAgICAgaXNBcnJheTogQXJyYXlJc0FycmF5LFxuICAgICAgICBrZXlzOiBPYmplY3RLZXlzLFxuICAgICAgICBuYW1lczogT2JqZWN0S2V5cyxcbiAgICAgICAgZGVmaW5lUHJvcGVydHk6IE9iamVjdERlZmluZVByb3BlcnR5LFxuICAgICAgICBnZXREZXNjcmlwdG9yOiBPYmplY3RHZXREZXNjcmlwdG9yLFxuICAgICAgICBmcmVlemU6IE9iamVjdEZyZWV6ZSxcbiAgICAgICAgZ2V0UHJvdG90eXBlT2Y6IE9iamVjdEdldFByb3RvdHlwZU9mLFxuICAgICAgICBpc0VTNTogaXNFUzUsXG4gICAgICAgIHByb3BlcnR5SXNXcml0YWJsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH07XG59XG5cbn0se31dLDE0OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcblwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihQcm9taXNlLCBJTlRFUk5BTCkge1xudmFyIFByb21pc2VNYXAgPSBQcm9taXNlLm1hcDtcblxuUHJvbWlzZS5wcm90b3R5cGUuZmlsdGVyID0gZnVuY3Rpb24gKGZuLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIFByb21pc2VNYXAodGhpcywgZm4sIG9wdGlvbnMsIElOVEVSTkFMKTtcbn07XG5cblByb21pc2UuZmlsdGVyID0gZnVuY3Rpb24gKHByb21pc2VzLCBmbiwgb3B0aW9ucykge1xuICAgIHJldHVybiBQcm9taXNlTWFwKHByb21pc2VzLCBmbiwgb3B0aW9ucywgSU5URVJOQUwpO1xufTtcbn07XG5cbn0se31dLDE1OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcblwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihQcm9taXNlLCB0cnlDb252ZXJ0VG9Qcm9taXNlKSB7XG52YXIgdXRpbCA9IF9kZXJlcV8oXCIuL3V0aWxcIik7XG52YXIgQ2FuY2VsbGF0aW9uRXJyb3IgPSBQcm9taXNlLkNhbmNlbGxhdGlvbkVycm9yO1xudmFyIGVycm9yT2JqID0gdXRpbC5lcnJvck9iajtcblxuZnVuY3Rpb24gUGFzc1Rocm91Z2hIYW5kbGVyQ29udGV4dChwcm9taXNlLCB0eXBlLCBoYW5kbGVyKSB7XG4gICAgdGhpcy5wcm9taXNlID0gcHJvbWlzZTtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMuaGFuZGxlciA9IGhhbmRsZXI7XG4gICAgdGhpcy5jYWxsZWQgPSBmYWxzZTtcbiAgICB0aGlzLmNhbmNlbFByb21pc2UgPSBudWxsO1xufVxuXG5QYXNzVGhyb3VnaEhhbmRsZXJDb250ZXh0LnByb3RvdHlwZS5pc0ZpbmFsbHlIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMudHlwZSA9PT0gMDtcbn07XG5cbmZ1bmN0aW9uIEZpbmFsbHlIYW5kbGVyQ2FuY2VsUmVhY3Rpb24oZmluYWxseUhhbmRsZXIpIHtcbiAgICB0aGlzLmZpbmFsbHlIYW5kbGVyID0gZmluYWxseUhhbmRsZXI7XG59XG5cbkZpbmFsbHlIYW5kbGVyQ2FuY2VsUmVhY3Rpb24ucHJvdG90eXBlLl9yZXN1bHRDYW5jZWxsZWQgPSBmdW5jdGlvbigpIHtcbiAgICBjaGVja0NhbmNlbCh0aGlzLmZpbmFsbHlIYW5kbGVyKTtcbn07XG5cbmZ1bmN0aW9uIGNoZWNrQ2FuY2VsKGN0eCwgcmVhc29uKSB7XG4gICAgaWYgKGN0eC5jYW5jZWxQcm9taXNlICE9IG51bGwpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBjdHguY2FuY2VsUHJvbWlzZS5fcmVqZWN0KHJlYXNvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjdHguY2FuY2VsUHJvbWlzZS5fY2FuY2VsKCk7XG4gICAgICAgIH1cbiAgICAgICAgY3R4LmNhbmNlbFByb21pc2UgPSBudWxsO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBzdWNjZWVkKCkge1xuICAgIHJldHVybiBmaW5hbGx5SGFuZGxlci5jYWxsKHRoaXMsIHRoaXMucHJvbWlzZS5fdGFyZ2V0KCkuX3NldHRsZWRWYWx1ZSgpKTtcbn1cbmZ1bmN0aW9uIGZhaWwocmVhc29uKSB7XG4gICAgaWYgKGNoZWNrQ2FuY2VsKHRoaXMsIHJlYXNvbikpIHJldHVybjtcbiAgICBlcnJvck9iai5lID0gcmVhc29uO1xuICAgIHJldHVybiBlcnJvck9iajtcbn1cbmZ1bmN0aW9uIGZpbmFsbHlIYW5kbGVyKHJlYXNvbk9yVmFsdWUpIHtcbiAgICB2YXIgcHJvbWlzZSA9IHRoaXMucHJvbWlzZTtcbiAgICB2YXIgaGFuZGxlciA9IHRoaXMuaGFuZGxlcjtcblxuICAgIGlmICghdGhpcy5jYWxsZWQpIHtcbiAgICAgICAgdGhpcy5jYWxsZWQgPSB0cnVlO1xuICAgICAgICB2YXIgcmV0ID0gdGhpcy5pc0ZpbmFsbHlIYW5kbGVyKClcbiAgICAgICAgICAgID8gaGFuZGxlci5jYWxsKHByb21pc2UuX2JvdW5kVmFsdWUoKSlcbiAgICAgICAgICAgIDogaGFuZGxlci5jYWxsKHByb21pc2UuX2JvdW5kVmFsdWUoKSwgcmVhc29uT3JWYWx1ZSk7XG4gICAgICAgIGlmIChyZXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcHJvbWlzZS5fc2V0UmV0dXJuZWROb25VbmRlZmluZWQoKTtcbiAgICAgICAgICAgIHZhciBtYXliZVByb21pc2UgPSB0cnlDb252ZXJ0VG9Qcm9taXNlKHJldCwgcHJvbWlzZSk7XG4gICAgICAgICAgICBpZiAobWF5YmVQcm9taXNlIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNhbmNlbFByb21pc2UgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobWF5YmVQcm9taXNlLl9pc0NhbmNlbGxlZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVhc29uID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgQ2FuY2VsbGF0aW9uRXJyb3IoXCJsYXRlIGNhbmNlbGxhdGlvbiBvYnNlcnZlclwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2UuX2F0dGFjaEV4dHJhVHJhY2UocmVhc29uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yT2JqLmUgPSByZWFzb247XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JPYmo7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobWF5YmVQcm9taXNlLmlzUGVuZGluZygpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXliZVByb21pc2UuX2F0dGFjaENhbmNlbGxhdGlvbkNhbGxiYWNrKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBGaW5hbGx5SGFuZGxlckNhbmNlbFJlYWN0aW9uKHRoaXMpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbWF5YmVQcm9taXNlLl90aGVuKFxuICAgICAgICAgICAgICAgICAgICBzdWNjZWVkLCBmYWlsLCB1bmRlZmluZWQsIHRoaXMsIHVuZGVmaW5lZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocHJvbWlzZS5pc1JlamVjdGVkKCkpIHtcbiAgICAgICAgY2hlY2tDYW5jZWwodGhpcyk7XG4gICAgICAgIGVycm9yT2JqLmUgPSByZWFzb25PclZhbHVlO1xuICAgICAgICByZXR1cm4gZXJyb3JPYmo7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY2hlY2tDYW5jZWwodGhpcyk7XG4gICAgICAgIHJldHVybiByZWFzb25PclZhbHVlO1xuICAgIH1cbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuX3Bhc3NUaHJvdWdoID0gZnVuY3Rpb24oaGFuZGxlciwgdHlwZSwgc3VjY2VzcywgZmFpbCkge1xuICAgIGlmICh0eXBlb2YgaGFuZGxlciAhPT0gXCJmdW5jdGlvblwiKSByZXR1cm4gdGhpcy50aGVuKCk7XG4gICAgcmV0dXJuIHRoaXMuX3RoZW4oc3VjY2VzcyxcbiAgICAgICAgICAgICAgICAgICAgICBmYWlsLFxuICAgICAgICAgICAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICBuZXcgUGFzc1Rocm91Z2hIYW5kbGVyQ29udGV4dCh0aGlzLCB0eXBlLCBoYW5kbGVyKSxcbiAgICAgICAgICAgICAgICAgICAgICB1bmRlZmluZWQpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubGFzdGx5ID1cblByb21pc2UucHJvdG90eXBlW1wiZmluYWxseVwiXSA9IGZ1bmN0aW9uIChoYW5kbGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Bhc3NUaHJvdWdoKGhhbmRsZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsbHlIYW5kbGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5hbGx5SGFuZGxlcik7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS50YXAgPSBmdW5jdGlvbiAoaGFuZGxlcikge1xuICAgIHJldHVybiB0aGlzLl9wYXNzVGhyb3VnaChoYW5kbGVyLCAxLCBmaW5hbGx5SGFuZGxlcik7XG59O1xuXG5yZXR1cm4gUGFzc1Rocm91Z2hIYW5kbGVyQ29udGV4dDtcbn07XG5cbn0se1wiLi91dGlsXCI6MzZ9XSwxNjpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG5cInVzZSBzdHJpY3RcIjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oUHJvbWlzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpUmVqZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBJTlRFUk5BTCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5Q29udmVydFRvUHJvbWlzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgUHJveHlhYmxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBkZWJ1Zykge1xudmFyIGVycm9ycyA9IF9kZXJlcV8oXCIuL2Vycm9yc1wiKTtcbnZhciBUeXBlRXJyb3IgPSBlcnJvcnMuVHlwZUVycm9yO1xudmFyIHV0aWwgPSBfZGVyZXFfKFwiLi91dGlsXCIpO1xudmFyIGVycm9yT2JqID0gdXRpbC5lcnJvck9iajtcbnZhciB0cnlDYXRjaCA9IHV0aWwudHJ5Q2F0Y2g7XG52YXIgeWllbGRIYW5kbGVycyA9IFtdO1xuXG5mdW5jdGlvbiBwcm9taXNlRnJvbVlpZWxkSGFuZGxlcih2YWx1ZSwgeWllbGRIYW5kbGVycywgdHJhY2VQYXJlbnQpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHlpZWxkSGFuZGxlcnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdHJhY2VQYXJlbnQuX3B1c2hDb250ZXh0KCk7XG4gICAgICAgIHZhciByZXN1bHQgPSB0cnlDYXRjaCh5aWVsZEhhbmRsZXJzW2ldKSh2YWx1ZSk7XG4gICAgICAgIHRyYWNlUGFyZW50Ll9wb3BDb250ZXh0KCk7XG4gICAgICAgIGlmIChyZXN1bHQgPT09IGVycm9yT2JqKSB7XG4gICAgICAgICAgICB0cmFjZVBhcmVudC5fcHVzaENvbnRleHQoKTtcbiAgICAgICAgICAgIHZhciByZXQgPSBQcm9taXNlLnJlamVjdChlcnJvck9iai5lKTtcbiAgICAgICAgICAgIHRyYWNlUGFyZW50Ll9wb3BDb250ZXh0KCk7XG4gICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICB9XG4gICAgICAgIHZhciBtYXliZVByb21pc2UgPSB0cnlDb252ZXJ0VG9Qcm9taXNlKHJlc3VsdCwgdHJhY2VQYXJlbnQpO1xuICAgICAgICBpZiAobWF5YmVQcm9taXNlIGluc3RhbmNlb2YgUHJvbWlzZSkgcmV0dXJuIG1heWJlUHJvbWlzZTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIFByb21pc2VTcGF3bihnZW5lcmF0b3JGdW5jdGlvbiwgcmVjZWl2ZXIsIHlpZWxkSGFuZGxlciwgc3RhY2spIHtcbiAgICBpZiAoZGVidWcuY2FuY2VsbGF0aW9uKCkpIHtcbiAgICAgICAgdmFyIGludGVybmFsID0gbmV3IFByb21pc2UoSU5URVJOQUwpO1xuICAgICAgICB2YXIgX2ZpbmFsbHlQcm9taXNlID0gdGhpcy5fZmluYWxseVByb21pc2UgPSBuZXcgUHJvbWlzZShJTlRFUk5BTCk7XG4gICAgICAgIHRoaXMuX3Byb21pc2UgPSBpbnRlcm5hbC5sYXN0bHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gX2ZpbmFsbHlQcm9taXNlO1xuICAgICAgICB9KTtcbiAgICAgICAgaW50ZXJuYWwuX2NhcHR1cmVTdGFja1RyYWNlKCk7XG4gICAgICAgIGludGVybmFsLl9zZXRPbkNhbmNlbCh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcHJvbWlzZSA9IHRoaXMuX3Byb21pc2UgPSBuZXcgUHJvbWlzZShJTlRFUk5BTCk7XG4gICAgICAgIHByb21pc2UuX2NhcHR1cmVTdGFja1RyYWNlKCk7XG4gICAgfVxuICAgIHRoaXMuX3N0YWNrID0gc3RhY2s7XG4gICAgdGhpcy5fZ2VuZXJhdG9yRnVuY3Rpb24gPSBnZW5lcmF0b3JGdW5jdGlvbjtcbiAgICB0aGlzLl9yZWNlaXZlciA9IHJlY2VpdmVyO1xuICAgIHRoaXMuX2dlbmVyYXRvciA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl95aWVsZEhhbmRsZXJzID0gdHlwZW9mIHlpZWxkSGFuZGxlciA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgID8gW3lpZWxkSGFuZGxlcl0uY29uY2F0KHlpZWxkSGFuZGxlcnMpXG4gICAgICAgIDogeWllbGRIYW5kbGVycztcbiAgICB0aGlzLl95aWVsZGVkUHJvbWlzZSA9IG51bGw7XG4gICAgdGhpcy5fY2FuY2VsbGF0aW9uUGhhc2UgPSBmYWxzZTtcbn1cbnV0aWwuaW5oZXJpdHMoUHJvbWlzZVNwYXduLCBQcm94eWFibGUpO1xuXG5Qcm9taXNlU3Bhd24ucHJvdG90eXBlLl9pc1Jlc29sdmVkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb21pc2UgPT09IG51bGw7XG59O1xuXG5Qcm9taXNlU3Bhd24ucHJvdG90eXBlLl9jbGVhbnVwID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fcHJvbWlzZSA9IHRoaXMuX2dlbmVyYXRvciA9IG51bGw7XG4gICAgaWYgKGRlYnVnLmNhbmNlbGxhdGlvbigpICYmIHRoaXMuX2ZpbmFsbHlQcm9taXNlICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuX2ZpbmFsbHlQcm9taXNlLl9mdWxmaWxsKCk7XG4gICAgICAgIHRoaXMuX2ZpbmFsbHlQcm9taXNlID0gbnVsbDtcbiAgICB9XG59O1xuXG5Qcm9taXNlU3Bhd24ucHJvdG90eXBlLl9wcm9taXNlQ2FuY2VsbGVkID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX2lzUmVzb2x2ZWQoKSkgcmV0dXJuO1xuICAgIHZhciBpbXBsZW1lbnRzUmV0dXJuID0gdHlwZW9mIHRoaXMuX2dlbmVyYXRvcltcInJldHVyblwiXSAhPT0gXCJ1bmRlZmluZWRcIjtcblxuICAgIHZhciByZXN1bHQ7XG4gICAgaWYgKCFpbXBsZW1lbnRzUmV0dXJuKSB7XG4gICAgICAgIHZhciByZWFzb24gPSBuZXcgUHJvbWlzZS5DYW5jZWxsYXRpb25FcnJvcihcbiAgICAgICAgICAgIFwiZ2VuZXJhdG9yIC5yZXR1cm4oKSBzZW50aW5lbFwiKTtcbiAgICAgICAgUHJvbWlzZS5jb3JvdXRpbmUucmV0dXJuU2VudGluZWwgPSByZWFzb247XG4gICAgICAgIHRoaXMuX3Byb21pc2UuX2F0dGFjaEV4dHJhVHJhY2UocmVhc29uKTtcbiAgICAgICAgdGhpcy5fcHJvbWlzZS5fcHVzaENvbnRleHQoKTtcbiAgICAgICAgcmVzdWx0ID0gdHJ5Q2F0Y2godGhpcy5fZ2VuZXJhdG9yW1widGhyb3dcIl0pLmNhbGwodGhpcy5fZ2VuZXJhdG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhc29uKTtcbiAgICAgICAgdGhpcy5fcHJvbWlzZS5fcG9wQ29udGV4dCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3Byb21pc2UuX3B1c2hDb250ZXh0KCk7XG4gICAgICAgIHJlc3VsdCA9IHRyeUNhdGNoKHRoaXMuX2dlbmVyYXRvcltcInJldHVyblwiXSkuY2FsbCh0aGlzLl9nZW5lcmF0b3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkKTtcbiAgICAgICAgdGhpcy5fcHJvbWlzZS5fcG9wQ29udGV4dCgpO1xuICAgIH1cbiAgICB0aGlzLl9jYW5jZWxsYXRpb25QaGFzZSA9IHRydWU7XG4gICAgdGhpcy5feWllbGRlZFByb21pc2UgPSBudWxsO1xuICAgIHRoaXMuX2NvbnRpbnVlKHJlc3VsdCk7XG59O1xuXG5Qcm9taXNlU3Bhd24ucHJvdG90eXBlLl9wcm9taXNlRnVsZmlsbGVkID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICB0aGlzLl95aWVsZGVkUHJvbWlzZSA9IG51bGw7XG4gICAgdGhpcy5fcHJvbWlzZS5fcHVzaENvbnRleHQoKTtcbiAgICB2YXIgcmVzdWx0ID0gdHJ5Q2F0Y2godGhpcy5fZ2VuZXJhdG9yLm5leHQpLmNhbGwodGhpcy5fZ2VuZXJhdG9yLCB2YWx1ZSk7XG4gICAgdGhpcy5fcHJvbWlzZS5fcG9wQ29udGV4dCgpO1xuICAgIHRoaXMuX2NvbnRpbnVlKHJlc3VsdCk7XG59O1xuXG5Qcm9taXNlU3Bhd24ucHJvdG90eXBlLl9wcm9taXNlUmVqZWN0ZWQgPSBmdW5jdGlvbihyZWFzb24pIHtcbiAgICB0aGlzLl95aWVsZGVkUHJvbWlzZSA9IG51bGw7XG4gICAgdGhpcy5fcHJvbWlzZS5fYXR0YWNoRXh0cmFUcmFjZShyZWFzb24pO1xuICAgIHRoaXMuX3Byb21pc2UuX3B1c2hDb250ZXh0KCk7XG4gICAgdmFyIHJlc3VsdCA9IHRyeUNhdGNoKHRoaXMuX2dlbmVyYXRvcltcInRocm93XCJdKVxuICAgICAgICAuY2FsbCh0aGlzLl9nZW5lcmF0b3IsIHJlYXNvbik7XG4gICAgdGhpcy5fcHJvbWlzZS5fcG9wQ29udGV4dCgpO1xuICAgIHRoaXMuX2NvbnRpbnVlKHJlc3VsdCk7XG59O1xuXG5Qcm9taXNlU3Bhd24ucHJvdG90eXBlLl9yZXN1bHRDYW5jZWxsZWQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5feWllbGRlZFByb21pc2UgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgIHZhciBwcm9taXNlID0gdGhpcy5feWllbGRlZFByb21pc2U7XG4gICAgICAgIHRoaXMuX3lpZWxkZWRQcm9taXNlID0gbnVsbDtcbiAgICAgICAgcHJvbWlzZS5jYW5jZWwoKTtcbiAgICB9XG59O1xuXG5Qcm9taXNlU3Bhd24ucHJvdG90eXBlLnByb21pc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb21pc2U7XG59O1xuXG5Qcm9taXNlU3Bhd24ucHJvdG90eXBlLl9ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fZ2VuZXJhdG9yID0gdGhpcy5fZ2VuZXJhdG9yRnVuY3Rpb24uY2FsbCh0aGlzLl9yZWNlaXZlcik7XG4gICAgdGhpcy5fcmVjZWl2ZXIgPVxuICAgICAgICB0aGlzLl9nZW5lcmF0b3JGdW5jdGlvbiA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9wcm9taXNlRnVsZmlsbGVkKHVuZGVmaW5lZCk7XG59O1xuXG5Qcm9taXNlU3Bhd24ucHJvdG90eXBlLl9jb250aW51ZSA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICB2YXIgcHJvbWlzZSA9IHRoaXMuX3Byb21pc2U7XG4gICAgaWYgKHJlc3VsdCA9PT0gZXJyb3JPYmopIHtcbiAgICAgICAgdGhpcy5fY2xlYW51cCgpO1xuICAgICAgICBpZiAodGhpcy5fY2FuY2VsbGF0aW9uUGhhc2UpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlLmNhbmNlbCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHByb21pc2UuX3JlamVjdENhbGxiYWNrKHJlc3VsdC5lLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgdmFsdWUgPSByZXN1bHQudmFsdWU7XG4gICAgaWYgKHJlc3VsdC5kb25lID09PSB0cnVlKSB7XG4gICAgICAgIHRoaXMuX2NsZWFudXAoKTtcbiAgICAgICAgaWYgKHRoaXMuX2NhbmNlbGxhdGlvblBoYXNlKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZS5jYW5jZWwoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlLl9yZXNvbHZlQ2FsbGJhY2sodmFsdWUpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIG1heWJlUHJvbWlzZSA9IHRyeUNvbnZlcnRUb1Byb21pc2UodmFsdWUsIHRoaXMuX3Byb21pc2UpO1xuICAgICAgICBpZiAoIShtYXliZVByb21pc2UgaW5zdGFuY2VvZiBQcm9taXNlKSkge1xuICAgICAgICAgICAgbWF5YmVQcm9taXNlID1cbiAgICAgICAgICAgICAgICBwcm9taXNlRnJvbVlpZWxkSGFuZGxlcihtYXliZVByb21pc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5feWllbGRIYW5kbGVycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9wcm9taXNlKTtcbiAgICAgICAgICAgIGlmIChtYXliZVByb21pc2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcm9taXNlUmVqZWN0ZWQoXG4gICAgICAgICAgICAgICAgICAgIG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIkEgdmFsdWUgJXMgd2FzIHlpZWxkZWQgdGhhdCBjb3VsZCBub3QgYmUgdHJlYXRlZCBhcyBhIHByb21pc2VcXHUwMDBhXFx1MDAwYSAgICBTZWUgaHR0cDovL2dvby5nbC9NcXJGbVhcXHUwMDBhXFx1MDAwYVwiLnJlcGxhY2UoXCIlc1wiLCB2YWx1ZSkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJGcm9tIGNvcm91dGluZTpcXHUwMDBhXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc3RhY2suc3BsaXQoXCJcXG5cIikuc2xpY2UoMSwgLTcpLmpvaW4oXCJcXG5cIilcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG1heWJlUHJvbWlzZSA9IG1heWJlUHJvbWlzZS5fdGFyZ2V0KCk7XG4gICAgICAgIHZhciBiaXRGaWVsZCA9IG1heWJlUHJvbWlzZS5fYml0RmllbGQ7XG4gICAgICAgIDtcbiAgICAgICAgaWYgKCgoYml0RmllbGQgJiA1MDM5NzE4NCkgPT09IDApKSB7XG4gICAgICAgICAgICB0aGlzLl95aWVsZGVkUHJvbWlzZSA9IG1heWJlUHJvbWlzZTtcbiAgICAgICAgICAgIG1heWJlUHJvbWlzZS5fcHJveHkodGhpcywgbnVsbCk7XG4gICAgICAgIH0gZWxzZSBpZiAoKChiaXRGaWVsZCAmIDMzNTU0NDMyKSAhPT0gMCkpIHtcbiAgICAgICAgICAgIFByb21pc2UuX2FzeW5jLmludm9rZShcbiAgICAgICAgICAgICAgICB0aGlzLl9wcm9taXNlRnVsZmlsbGVkLCB0aGlzLCBtYXliZVByb21pc2UuX3ZhbHVlKClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAoKChiaXRGaWVsZCAmIDE2Nzc3MjE2KSAhPT0gMCkpIHtcbiAgICAgICAgICAgIFByb21pc2UuX2FzeW5jLmludm9rZShcbiAgICAgICAgICAgICAgICB0aGlzLl9wcm9taXNlUmVqZWN0ZWQsIHRoaXMsIG1heWJlUHJvbWlzZS5fcmVhc29uKClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9wcm9taXNlQ2FuY2VsbGVkKCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5Qcm9taXNlLmNvcm91dGluZSA9IGZ1bmN0aW9uIChnZW5lcmF0b3JGdW5jdGlvbiwgb3B0aW9ucykge1xuICAgIGlmICh0eXBlb2YgZ2VuZXJhdG9yRnVuY3Rpb24gIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiZ2VuZXJhdG9yRnVuY3Rpb24gbXVzdCBiZSBhIGZ1bmN0aW9uXFx1MDAwYVxcdTAwMGEgICAgU2VlIGh0dHA6Ly9nb28uZ2wvTXFyRm1YXFx1MDAwYVwiKTtcbiAgICB9XG4gICAgdmFyIHlpZWxkSGFuZGxlciA9IE9iamVjdChvcHRpb25zKS55aWVsZEhhbmRsZXI7XG4gICAgdmFyIFByb21pc2VTcGF3biQgPSBQcm9taXNlU3Bhd247XG4gICAgdmFyIHN0YWNrID0gbmV3IEVycm9yKCkuc3RhY2s7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGdlbmVyYXRvciA9IGdlbmVyYXRvckZ1bmN0aW9uLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIHZhciBzcGF3biA9IG5ldyBQcm9taXNlU3Bhd24kKHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB5aWVsZEhhbmRsZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrKTtcbiAgICAgICAgdmFyIHJldCA9IHNwYXduLnByb21pc2UoKTtcbiAgICAgICAgc3Bhd24uX2dlbmVyYXRvciA9IGdlbmVyYXRvcjtcbiAgICAgICAgc3Bhd24uX3Byb21pc2VGdWxmaWxsZWQodW5kZWZpbmVkKTtcbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9O1xufTtcblxuUHJvbWlzZS5jb3JvdXRpbmUuYWRkWWllbGRIYW5kbGVyID0gZnVuY3Rpb24oZm4pIHtcbiAgICBpZiAodHlwZW9mIGZuICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImV4cGVjdGluZyBhIGZ1bmN0aW9uIGJ1dCBnb3QgXCIgKyB1dGlsLmNsYXNzU3RyaW5nKGZuKSk7XG4gICAgfVxuICAgIHlpZWxkSGFuZGxlcnMucHVzaChmbik7XG59O1xuXG5Qcm9taXNlLnNwYXduID0gZnVuY3Rpb24gKGdlbmVyYXRvckZ1bmN0aW9uKSB7XG4gICAgZGVidWcuZGVwcmVjYXRlZChcIlByb21pc2Uuc3Bhd24oKVwiLCBcIlByb21pc2UuY29yb3V0aW5lKClcIik7XG4gICAgaWYgKHR5cGVvZiBnZW5lcmF0b3JGdW5jdGlvbiAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBhcGlSZWplY3Rpb24oXCJnZW5lcmF0b3JGdW5jdGlvbiBtdXN0IGJlIGEgZnVuY3Rpb25cXHUwMDBhXFx1MDAwYSAgICBTZWUgaHR0cDovL2dvby5nbC9NcXJGbVhcXHUwMDBhXCIpO1xuICAgIH1cbiAgICB2YXIgc3Bhd24gPSBuZXcgUHJvbWlzZVNwYXduKGdlbmVyYXRvckZ1bmN0aW9uLCB0aGlzKTtcbiAgICB2YXIgcmV0ID0gc3Bhd24ucHJvbWlzZSgpO1xuICAgIHNwYXduLl9ydW4oUHJvbWlzZS5zcGF3bik7XG4gICAgcmV0dXJuIHJldDtcbn07XG59O1xuXG59LHtcIi4vZXJyb3JzXCI6MTIsXCIuL3V0aWxcIjozNn1dLDE3OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcblwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPVxuZnVuY3Rpb24oUHJvbWlzZSwgUHJvbWlzZUFycmF5LCB0cnlDb252ZXJ0VG9Qcm9taXNlLCBJTlRFUk5BTCwgYXN5bmMsXG4gICAgICAgICBnZXREb21haW4pIHtcbnZhciB1dGlsID0gX2RlcmVxXyhcIi4vdXRpbFwiKTtcbnZhciBjYW5FdmFsdWF0ZSA9IHV0aWwuY2FuRXZhbHVhdGU7XG52YXIgdHJ5Q2F0Y2ggPSB1dGlsLnRyeUNhdGNoO1xudmFyIGVycm9yT2JqID0gdXRpbC5lcnJvck9iajtcbnZhciByZWplY3Q7XG5cbmlmICghdHJ1ZSkge1xuaWYgKGNhbkV2YWx1YXRlKSB7XG4gICAgdmFyIHRoZW5DYWxsYmFjayA9IGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGdW5jdGlvbihcInZhbHVlXCIsIFwiaG9sZGVyXCIsIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgJ3VzZSBzdHJpY3QnOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgaG9sZGVyLnBJbmRleCA9IHZhbHVlOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgaG9sZGVyLmNoZWNrRnVsZmlsbG1lbnQodGhpcyk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgXCIucmVwbGFjZSgvSW5kZXgvZywgaSkpO1xuICAgIH07XG5cbiAgICB2YXIgcHJvbWlzZVNldHRlciA9IGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGdW5jdGlvbihcInByb21pc2VcIiwgXCJob2xkZXJcIiwgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgJ3VzZSBzdHJpY3QnOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgaG9sZGVyLnBJbmRleCA9IHByb21pc2U7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgXCIucmVwbGFjZSgvSW5kZXgvZywgaSkpO1xuICAgIH07XG5cbiAgICB2YXIgZ2VuZXJhdGVIb2xkZXJDbGFzcyA9IGZ1bmN0aW9uKHRvdGFsKSB7XG4gICAgICAgIHZhciBwcm9wcyA9IG5ldyBBcnJheSh0b3RhbCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHByb3BzW2ldID0gXCJ0aGlzLnBcIiArIChpKzEpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBhc3NpZ25tZW50ID0gcHJvcHMuam9pbihcIiA9IFwiKSArIFwiID0gbnVsbDtcIjtcbiAgICAgICAgdmFyIGNhbmNlbGxhdGlvbkNvZGU9IFwidmFyIHByb21pc2U7XFxuXCIgKyBwcm9wcy5tYXAoZnVuY3Rpb24ocHJvcCkge1xuICAgICAgICAgICAgcmV0dXJuIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuXFxcbiAgICAgICAgICAgICAgICBwcm9taXNlID0gXCIgKyBwcm9wICsgXCI7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgIGlmIChwcm9taXNlIGluc3RhbmNlb2YgUHJvbWlzZSkgeyAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgICAgICBwcm9taXNlLmNhbmNlbCgpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgIH0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgXCI7XG4gICAgICAgIH0pLmpvaW4oXCJcXG5cIik7XG4gICAgICAgIHZhciBwYXNzZWRBcmd1bWVudHMgPSBwcm9wcy5qb2luKFwiLCBcIik7XG4gICAgICAgIHZhciBuYW1lID0gXCJIb2xkZXIkXCIgKyB0b3RhbDtcblxuXG4gICAgICAgIHZhciBjb2RlID0gXCJyZXR1cm4gZnVuY3Rpb24odHJ5Q2F0Y2gsIGVycm9yT2JqLCBQcm9taXNlLCBhc3luYykgeyAgICBcXG5cXFxuICAgICAgICAgICAgJ3VzZSBzdHJpY3QnOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgZnVuY3Rpb24gW1RoZU5hbWVdKGZuKSB7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgIFtUaGVQcm9wZXJ0aWVzXSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgIHRoaXMuZm4gPSBmbjsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgIHRoaXMuYXN5bmNOZWVkZWQgPSB0cnVlOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgIHRoaXMubm93ID0gMDsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgfSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgW1RoZU5hbWVdLnByb3RvdHlwZS5fY2FsbEZ1bmN0aW9uID0gZnVuY3Rpb24ocHJvbWlzZSkgeyAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgIHByb21pc2UuX3B1c2hDb250ZXh0KCk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgIHZhciByZXQgPSB0cnlDYXRjaCh0aGlzLmZuKShbVGhlUGFzc2VkQXJndW1lbnRzXSk7ICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgIHByb21pc2UuX3BvcENvbnRleHQoKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgIGlmIChyZXQgPT09IGVycm9yT2JqKSB7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgICAgICBwcm9taXNlLl9yZWplY3RDYWxsYmFjayhyZXQuZSwgZmFsc2UpOyAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgIH0gZWxzZSB7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgICAgICBwcm9taXNlLl9yZXNvbHZlQ2FsbGJhY2socmV0KTsgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgIH0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgfTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgW1RoZU5hbWVdLnByb3RvdHlwZS5jaGVja0Z1bGZpbGxtZW50ID0gZnVuY3Rpb24ocHJvbWlzZSkgeyAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgIHZhciBub3cgPSArK3RoaXMubm93OyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgIGlmIChub3cgPT09IFtUaGVUb3RhbF0pIHsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5hc3luY05lZWRlZCkgeyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgYXN5bmMuaW52b2tlKHRoaXMuX2NhbGxGdW5jdGlvbiwgdGhpcywgcHJvbWlzZSk7ICAgICBcXG5cXFxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgeyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2FsbEZ1bmN0aW9uKHByb21pc2UpOyAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgICAgICB9ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgIH0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgfTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgW1RoZU5hbWVdLnByb3RvdHlwZS5fcmVzdWx0Q2FuY2VsbGVkID0gZnVuY3Rpb24oKSB7ICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgIFtDYW5jZWxsYXRpb25Db2RlXSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgfTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgcmV0dXJuIFtUaGVOYW1lXTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICB9KHRyeUNhdGNoLCBlcnJvck9iaiwgUHJvbWlzZSwgYXN5bmMpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICBcIjtcblxuICAgICAgICBjb2RlID0gY29kZS5yZXBsYWNlKC9cXFtUaGVOYW1lXFxdL2csIG5hbWUpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxbVGhlVG90YWxcXF0vZywgdG90YWwpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxbVGhlUGFzc2VkQXJndW1lbnRzXFxdL2csIHBhc3NlZEFyZ3VtZW50cylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXFtUaGVQcm9wZXJ0aWVzXFxdL2csIGFzc2lnbm1lbnQpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxbQ2FuY2VsbGF0aW9uQ29kZVxcXS9nLCBjYW5jZWxsYXRpb25Db2RlKTtcblxuICAgICAgICByZXR1cm4gbmV3IEZ1bmN0aW9uKFwidHJ5Q2F0Y2hcIiwgXCJlcnJvck9ialwiLCBcIlByb21pc2VcIiwgXCJhc3luY1wiLCBjb2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgKHRyeUNhdGNoLCBlcnJvck9iaiwgUHJvbWlzZSwgYXN5bmMpO1xuICAgIH07XG5cbiAgICB2YXIgaG9sZGVyQ2xhc3NlcyA9IFtdO1xuICAgIHZhciB0aGVuQ2FsbGJhY2tzID0gW107XG4gICAgdmFyIHByb21pc2VTZXR0ZXJzID0gW107XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDg7ICsraSkge1xuICAgICAgICBob2xkZXJDbGFzc2VzLnB1c2goZ2VuZXJhdGVIb2xkZXJDbGFzcyhpICsgMSkpO1xuICAgICAgICB0aGVuQ2FsbGJhY2tzLnB1c2godGhlbkNhbGxiYWNrKGkgKyAxKSk7XG4gICAgICAgIHByb21pc2VTZXR0ZXJzLnB1c2gocHJvbWlzZVNldHRlcihpICsgMSkpO1xuICAgIH1cblxuICAgIHJlamVjdCA9IGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgdGhpcy5fcmVqZWN0KHJlYXNvbik7XG4gICAgfTtcbn19XG5cblByb21pc2Uuam9pbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbGFzdCA9IGFyZ3VtZW50cy5sZW5ndGggLSAxO1xuICAgIHZhciBmbjtcbiAgICBpZiAobGFzdCA+IDAgJiYgdHlwZW9mIGFyZ3VtZW50c1tsYXN0XSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGZuID0gYXJndW1lbnRzW2xhc3RdO1xuICAgICAgICBpZiAoIXRydWUpIHtcbiAgICAgICAgICAgIGlmIChsYXN0IDw9IDggJiYgY2FuRXZhbHVhdGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmV0ID0gbmV3IFByb21pc2UoSU5URVJOQUwpO1xuICAgICAgICAgICAgICAgIHJldC5fY2FwdHVyZVN0YWNrVHJhY2UoKTtcbiAgICAgICAgICAgICAgICB2YXIgSG9sZGVyQ2xhc3MgPSBob2xkZXJDbGFzc2VzW2xhc3QgLSAxXTtcbiAgICAgICAgICAgICAgICB2YXIgaG9sZGVyID0gbmV3IEhvbGRlckNsYXNzKGZuKTtcbiAgICAgICAgICAgICAgICB2YXIgY2FsbGJhY2tzID0gdGhlbkNhbGxiYWNrcztcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdDsgKytpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXliZVByb21pc2UgPSB0cnlDb252ZXJ0VG9Qcm9taXNlKGFyZ3VtZW50c1tpXSwgcmV0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1heWJlUHJvbWlzZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heWJlUHJvbWlzZSA9IG1heWJlUHJvbWlzZS5fdGFyZ2V0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYml0RmllbGQgPSBtYXliZVByb21pc2UuX2JpdEZpZWxkO1xuICAgICAgICAgICAgICAgICAgICAgICAgO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCgoYml0RmllbGQgJiA1MDM5NzE4NCkgPT09IDApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF5YmVQcm9taXNlLl90aGVuKGNhbGxiYWNrc1tpXSwgcmVqZWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmRlZmluZWQsIHJldCwgaG9sZGVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9taXNlU2V0dGVyc1tpXShtYXliZVByb21pc2UsIGhvbGRlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9sZGVyLmFzeW5jTmVlZGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCgoYml0RmllbGQgJiAzMzU1NDQzMikgIT09IDApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tzW2ldLmNhbGwocmV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heWJlUHJvbWlzZS5fdmFsdWUoKSwgaG9sZGVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoKChiaXRGaWVsZCAmIDE2Nzc3MjE2KSAhPT0gMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQuX3JlamVjdChtYXliZVByb21pc2UuX3JlYXNvbigpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0Ll9jYW5jZWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrc1tpXS5jYWxsKHJldCwgbWF5YmVQcm9taXNlLCBob2xkZXIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCFyZXQuX2lzRmF0ZVNlYWxlZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChob2xkZXIuYXN5bmNOZWVkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkb21haW4gPSBnZXREb21haW4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkb21haW4gIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBob2xkZXIuZm4gPSB1dGlsLmRvbWFpbkJpbmQoZG9tYWluLCBob2xkZXIuZm4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldC5fc2V0QXN5bmNHdWFyYW50ZWVkKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldC5fc2V0T25DYW5jZWwoaG9sZGVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTs7XG4gICAgaWYgKGZuKSBhcmdzLnBvcCgpO1xuICAgIHZhciByZXQgPSBuZXcgUHJvbWlzZUFycmF5KGFyZ3MpLnByb21pc2UoKTtcbiAgICByZXR1cm4gZm4gIT09IHVuZGVmaW5lZCA/IHJldC5zcHJlYWQoZm4pIDogcmV0O1xufTtcblxufTtcblxufSx7XCIuL3V0aWxcIjozNn1dLDE4OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcblwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihQcm9taXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBQcm9taXNlQXJyYXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFwaVJlamVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5Q29udmVydFRvUHJvbWlzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgSU5URVJOQUwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKSB7XG52YXIgZ2V0RG9tYWluID0gUHJvbWlzZS5fZ2V0RG9tYWluO1xudmFyIHV0aWwgPSBfZGVyZXFfKFwiLi91dGlsXCIpO1xudmFyIHRyeUNhdGNoID0gdXRpbC50cnlDYXRjaDtcbnZhciBlcnJvck9iaiA9IHV0aWwuZXJyb3JPYmo7XG52YXIgYXN5bmMgPSBQcm9taXNlLl9hc3luYztcblxuZnVuY3Rpb24gTWFwcGluZ1Byb21pc2VBcnJheShwcm9taXNlcywgZm4sIGxpbWl0LCBfZmlsdGVyKSB7XG4gICAgdGhpcy5jb25zdHJ1Y3RvciQocHJvbWlzZXMpO1xuICAgIHRoaXMuX3Byb21pc2UuX2NhcHR1cmVTdGFja1RyYWNlKCk7XG4gICAgdmFyIGRvbWFpbiA9IGdldERvbWFpbigpO1xuICAgIHRoaXMuX2NhbGxiYWNrID0gZG9tYWluID09PSBudWxsID8gZm4gOiB1dGlsLmRvbWFpbkJpbmQoZG9tYWluLCBmbik7XG4gICAgdGhpcy5fcHJlc2VydmVkVmFsdWVzID0gX2ZpbHRlciA9PT0gSU5URVJOQUxcbiAgICAgICAgPyBuZXcgQXJyYXkodGhpcy5sZW5ndGgoKSlcbiAgICAgICAgOiBudWxsO1xuICAgIHRoaXMuX2xpbWl0ID0gbGltaXQ7XG4gICAgdGhpcy5faW5GbGlnaHQgPSAwO1xuICAgIHRoaXMuX3F1ZXVlID0gW107XG4gICAgYXN5bmMuaW52b2tlKHRoaXMuX2FzeW5jSW5pdCwgdGhpcywgdW5kZWZpbmVkKTtcbn1cbnV0aWwuaW5oZXJpdHMoTWFwcGluZ1Byb21pc2VBcnJheSwgUHJvbWlzZUFycmF5KTtcblxuTWFwcGluZ1Byb21pc2VBcnJheS5wcm90b3R5cGUuX2FzeW5jSW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2luaXQkKHVuZGVmaW5lZCwgLTIpO1xufTtcblxuTWFwcGluZ1Byb21pc2VBcnJheS5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbiAoKSB7fTtcblxuTWFwcGluZ1Byb21pc2VBcnJheS5wcm90b3R5cGUuX3Byb21pc2VGdWxmaWxsZWQgPSBmdW5jdGlvbiAodmFsdWUsIGluZGV4KSB7XG4gICAgdmFyIHZhbHVlcyA9IHRoaXMuX3ZhbHVlcztcbiAgICB2YXIgbGVuZ3RoID0gdGhpcy5sZW5ndGgoKTtcbiAgICB2YXIgcHJlc2VydmVkVmFsdWVzID0gdGhpcy5fcHJlc2VydmVkVmFsdWVzO1xuICAgIHZhciBsaW1pdCA9IHRoaXMuX2xpbWl0O1xuXG4gICAgaWYgKGluZGV4IDwgMCkge1xuICAgICAgICBpbmRleCA9IChpbmRleCAqIC0xKSAtIDE7XG4gICAgICAgIHZhbHVlc1tpbmRleF0gPSB2YWx1ZTtcbiAgICAgICAgaWYgKGxpbWl0ID49IDEpIHtcbiAgICAgICAgICAgIHRoaXMuX2luRmxpZ2h0LS07XG4gICAgICAgICAgICB0aGlzLl9kcmFpblF1ZXVlKCk7XG4gICAgICAgICAgICBpZiAodGhpcy5faXNSZXNvbHZlZCgpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChsaW1pdCA+PSAxICYmIHRoaXMuX2luRmxpZ2h0ID49IGxpbWl0KSB7XG4gICAgICAgICAgICB2YWx1ZXNbaW5kZXhdID0gdmFsdWU7XG4gICAgICAgICAgICB0aGlzLl9xdWV1ZS5wdXNoKGluZGV4KTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJlc2VydmVkVmFsdWVzICE9PSBudWxsKSBwcmVzZXJ2ZWRWYWx1ZXNbaW5kZXhdID0gdmFsdWU7XG5cbiAgICAgICAgdmFyIHByb21pc2UgPSB0aGlzLl9wcm9taXNlO1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSB0aGlzLl9jYWxsYmFjaztcbiAgICAgICAgdmFyIHJlY2VpdmVyID0gcHJvbWlzZS5fYm91bmRWYWx1ZSgpO1xuICAgICAgICBwcm9taXNlLl9wdXNoQ29udGV4dCgpO1xuICAgICAgICB2YXIgcmV0ID0gdHJ5Q2F0Y2goY2FsbGJhY2spLmNhbGwocmVjZWl2ZXIsIHZhbHVlLCBpbmRleCwgbGVuZ3RoKTtcbiAgICAgICAgdmFyIHByb21pc2VDcmVhdGVkID0gcHJvbWlzZS5fcG9wQ29udGV4dCgpO1xuICAgICAgICBkZWJ1Zy5jaGVja0ZvcmdvdHRlblJldHVybnMoXG4gICAgICAgICAgICByZXQsXG4gICAgICAgICAgICBwcm9taXNlQ3JlYXRlZCxcbiAgICAgICAgICAgIHByZXNlcnZlZFZhbHVlcyAhPT0gbnVsbCA/IFwiUHJvbWlzZS5maWx0ZXJcIiA6IFwiUHJvbWlzZS5tYXBcIixcbiAgICAgICAgICAgIHByb21pc2VcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHJldCA9PT0gZXJyb3JPYmopIHtcbiAgICAgICAgICAgIHRoaXMuX3JlamVjdChyZXQuZSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBtYXliZVByb21pc2UgPSB0cnlDb252ZXJ0VG9Qcm9taXNlKHJldCwgdGhpcy5fcHJvbWlzZSk7XG4gICAgICAgIGlmIChtYXliZVByb21pc2UgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICBtYXliZVByb21pc2UgPSBtYXliZVByb21pc2UuX3RhcmdldCgpO1xuICAgICAgICAgICAgdmFyIGJpdEZpZWxkID0gbWF5YmVQcm9taXNlLl9iaXRGaWVsZDtcbiAgICAgICAgICAgIDtcbiAgICAgICAgICAgIGlmICgoKGJpdEZpZWxkICYgNTAzOTcxODQpID09PSAwKSkge1xuICAgICAgICAgICAgICAgIGlmIChsaW1pdCA+PSAxKSB0aGlzLl9pbkZsaWdodCsrO1xuICAgICAgICAgICAgICAgIHZhbHVlc1tpbmRleF0gPSBtYXliZVByb21pc2U7XG4gICAgICAgICAgICAgICAgbWF5YmVQcm9taXNlLl9wcm94eSh0aGlzLCAoaW5kZXggKyAxKSAqIC0xKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCgoYml0RmllbGQgJiAzMzU1NDQzMikgIT09IDApKSB7XG4gICAgICAgICAgICAgICAgcmV0ID0gbWF5YmVQcm9taXNlLl92YWx1ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgoKGJpdEZpZWxkICYgMTY3NzcyMTYpICE9PSAwKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlamVjdChtYXliZVByb21pc2UuX3JlYXNvbigpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FuY2VsKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFsdWVzW2luZGV4XSA9IHJldDtcbiAgICB9XG4gICAgdmFyIHRvdGFsUmVzb2x2ZWQgPSArK3RoaXMuX3RvdGFsUmVzb2x2ZWQ7XG4gICAgaWYgKHRvdGFsUmVzb2x2ZWQgPj0gbGVuZ3RoKSB7XG4gICAgICAgIGlmIChwcmVzZXJ2ZWRWYWx1ZXMgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuX2ZpbHRlcih2YWx1ZXMsIHByZXNlcnZlZFZhbHVlcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9yZXNvbHZlKHZhbHVlcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbk1hcHBpbmdQcm9taXNlQXJyYXkucHJvdG90eXBlLl9kcmFpblF1ZXVlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBxdWV1ZSA9IHRoaXMuX3F1ZXVlO1xuICAgIHZhciBsaW1pdCA9IHRoaXMuX2xpbWl0O1xuICAgIHZhciB2YWx1ZXMgPSB0aGlzLl92YWx1ZXM7XG4gICAgd2hpbGUgKHF1ZXVlLmxlbmd0aCA+IDAgJiYgdGhpcy5faW5GbGlnaHQgPCBsaW1pdCkge1xuICAgICAgICBpZiAodGhpcy5faXNSZXNvbHZlZCgpKSByZXR1cm47XG4gICAgICAgIHZhciBpbmRleCA9IHF1ZXVlLnBvcCgpO1xuICAgICAgICB0aGlzLl9wcm9taXNlRnVsZmlsbGVkKHZhbHVlc1tpbmRleF0sIGluZGV4KTtcbiAgICB9XG59O1xuXG5NYXBwaW5nUHJvbWlzZUFycmF5LnByb3RvdHlwZS5fZmlsdGVyID0gZnVuY3Rpb24gKGJvb2xlYW5zLCB2YWx1ZXMpIHtcbiAgICB2YXIgbGVuID0gdmFsdWVzLmxlbmd0aDtcbiAgICB2YXIgcmV0ID0gbmV3IEFycmF5KGxlbik7XG4gICAgdmFyIGogPSAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgICAgaWYgKGJvb2xlYW5zW2ldKSByZXRbaisrXSA9IHZhbHVlc1tpXTtcbiAgICB9XG4gICAgcmV0Lmxlbmd0aCA9IGo7XG4gICAgdGhpcy5fcmVzb2x2ZShyZXQpO1xufTtcblxuTWFwcGluZ1Byb21pc2VBcnJheS5wcm90b3R5cGUucHJlc2VydmVkVmFsdWVzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl9wcmVzZXJ2ZWRWYWx1ZXM7XG59O1xuXG5mdW5jdGlvbiBtYXAocHJvbWlzZXMsIGZuLCBvcHRpb25zLCBfZmlsdGVyKSB7XG4gICAgaWYgKHR5cGVvZiBmbiAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBhcGlSZWplY3Rpb24oXCJleHBlY3RpbmcgYSBmdW5jdGlvbiBidXQgZ290IFwiICsgdXRpbC5jbGFzc1N0cmluZyhmbikpO1xuICAgIH1cblxuICAgIHZhciBsaW1pdCA9IDA7XG4gICAgaWYgKG9wdGlvbnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09IFwib2JqZWN0XCIgJiYgb3B0aW9ucyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLmNvbmN1cnJlbmN5ICE9PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KFxuICAgICAgICAgICAgICAgICAgICBuZXcgVHlwZUVycm9yKFwiJ2NvbmN1cnJlbmN5JyBtdXN0IGJlIGEgbnVtYmVyIGJ1dCBpdCBpcyBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGlsLmNsYXNzU3RyaW5nKG9wdGlvbnMuY29uY3VycmVuY3kpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsaW1pdCA9IG9wdGlvbnMuY29uY3VycmVuY3k7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm9wdGlvbnMgYXJndW1lbnQgbXVzdCBiZSBhbiBvYmplY3QgYnV0IGl0IGlzIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRpbC5jbGFzc1N0cmluZyhvcHRpb25zKSkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGxpbWl0ID0gdHlwZW9mIGxpbWl0ID09PSBcIm51bWJlclwiICYmXG4gICAgICAgIGlzRmluaXRlKGxpbWl0KSAmJiBsaW1pdCA+PSAxID8gbGltaXQgOiAwO1xuICAgIHJldHVybiBuZXcgTWFwcGluZ1Byb21pc2VBcnJheShwcm9taXNlcywgZm4sIGxpbWl0LCBfZmlsdGVyKS5wcm9taXNlKCk7XG59XG5cblByb21pc2UucHJvdG90eXBlLm1hcCA9IGZ1bmN0aW9uIChmbiwgb3B0aW9ucykge1xuICAgIHJldHVybiBtYXAodGhpcywgZm4sIG9wdGlvbnMsIG51bGwpO1xufTtcblxuUHJvbWlzZS5tYXAgPSBmdW5jdGlvbiAocHJvbWlzZXMsIGZuLCBvcHRpb25zLCBfZmlsdGVyKSB7XG4gICAgcmV0dXJuIG1hcChwcm9taXNlcywgZm4sIG9wdGlvbnMsIF9maWx0ZXIpO1xufTtcblxuXG59O1xuXG59LHtcIi4vdXRpbFwiOjM2fV0sMTk6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuXCJ1c2Ugc3RyaWN0XCI7XG5tb2R1bGUuZXhwb3J0cyA9XG5mdW5jdGlvbihQcm9taXNlLCBJTlRFUk5BTCwgdHJ5Q29udmVydFRvUHJvbWlzZSwgYXBpUmVqZWN0aW9uLCBkZWJ1Zykge1xudmFyIHV0aWwgPSBfZGVyZXFfKFwiLi91dGlsXCIpO1xudmFyIHRyeUNhdGNoID0gdXRpbC50cnlDYXRjaDtcblxuUHJvbWlzZS5tZXRob2QgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICBpZiAodHlwZW9mIGZuICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IFByb21pc2UuVHlwZUVycm9yKFwiZXhwZWN0aW5nIGEgZnVuY3Rpb24gYnV0IGdvdCBcIiArIHV0aWwuY2xhc3NTdHJpbmcoZm4pKTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHJldCA9IG5ldyBQcm9taXNlKElOVEVSTkFMKTtcbiAgICAgICAgcmV0Ll9jYXB0dXJlU3RhY2tUcmFjZSgpO1xuICAgICAgICByZXQuX3B1c2hDb250ZXh0KCk7XG4gICAgICAgIHZhciB2YWx1ZSA9IHRyeUNhdGNoKGZuKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB2YXIgcHJvbWlzZUNyZWF0ZWQgPSByZXQuX3BvcENvbnRleHQoKTtcbiAgICAgICAgZGVidWcuY2hlY2tGb3Jnb3R0ZW5SZXR1cm5zKFxuICAgICAgICAgICAgdmFsdWUsIHByb21pc2VDcmVhdGVkLCBcIlByb21pc2UubWV0aG9kXCIsIHJldCk7XG4gICAgICAgIHJldC5fcmVzb2x2ZUZyb21TeW5jVmFsdWUodmFsdWUpO1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH07XG59O1xuXG5Qcm9taXNlLmF0dGVtcHQgPSBQcm9taXNlW1widHJ5XCJdID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgaWYgKHR5cGVvZiBmbiAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBhcGlSZWplY3Rpb24oXCJleHBlY3RpbmcgYSBmdW5jdGlvbiBidXQgZ290IFwiICsgdXRpbC5jbGFzc1N0cmluZyhmbikpO1xuICAgIH1cbiAgICB2YXIgcmV0ID0gbmV3IFByb21pc2UoSU5URVJOQUwpO1xuICAgIHJldC5fY2FwdHVyZVN0YWNrVHJhY2UoKTtcbiAgICByZXQuX3B1c2hDb250ZXh0KCk7XG4gICAgdmFyIHZhbHVlO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBkZWJ1Zy5kZXByZWNhdGVkKFwiY2FsbGluZyBQcm9taXNlLnRyeSB3aXRoIG1vcmUgdGhhbiAxIGFyZ3VtZW50XCIpO1xuICAgICAgICB2YXIgYXJnID0gYXJndW1lbnRzWzFdO1xuICAgICAgICB2YXIgY3R4ID0gYXJndW1lbnRzWzJdO1xuICAgICAgICB2YWx1ZSA9IHV0aWwuaXNBcnJheShhcmcpID8gdHJ5Q2F0Y2goZm4pLmFwcGx5KGN0eCwgYXJnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdHJ5Q2F0Y2goZm4pLmNhbGwoY3R4LCBhcmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gdHJ5Q2F0Y2goZm4pKCk7XG4gICAgfVxuICAgIHZhciBwcm9taXNlQ3JlYXRlZCA9IHJldC5fcG9wQ29udGV4dCgpO1xuICAgIGRlYnVnLmNoZWNrRm9yZ290dGVuUmV0dXJucyhcbiAgICAgICAgdmFsdWUsIHByb21pc2VDcmVhdGVkLCBcIlByb21pc2UudHJ5XCIsIHJldCk7XG4gICAgcmV0Ll9yZXNvbHZlRnJvbVN5bmNWYWx1ZSh2YWx1ZSk7XG4gICAgcmV0dXJuIHJldDtcbn07XG5cblByb21pc2UucHJvdG90eXBlLl9yZXNvbHZlRnJvbVN5bmNWYWx1ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PT0gdXRpbC5lcnJvck9iaikge1xuICAgICAgICB0aGlzLl9yZWplY3RDYWxsYmFjayh2YWx1ZS5lLCBmYWxzZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcmVzb2x2ZUNhbGxiYWNrKHZhbHVlLCB0cnVlKTtcbiAgICB9XG59O1xufTtcblxufSx7XCIuL3V0aWxcIjozNn1dLDIwOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcblwidXNlIHN0cmljdFwiO1xudmFyIHV0aWwgPSBfZGVyZXFfKFwiLi91dGlsXCIpO1xudmFyIG1heWJlV3JhcEFzRXJyb3IgPSB1dGlsLm1heWJlV3JhcEFzRXJyb3I7XG52YXIgZXJyb3JzID0gX2RlcmVxXyhcIi4vZXJyb3JzXCIpO1xudmFyIE9wZXJhdGlvbmFsRXJyb3IgPSBlcnJvcnMuT3BlcmF0aW9uYWxFcnJvcjtcbnZhciBlczUgPSBfZGVyZXFfKFwiLi9lczVcIik7XG5cbmZ1bmN0aW9uIGlzVW50eXBlZEVycm9yKG9iaikge1xuICAgIHJldHVybiBvYmogaW5zdGFuY2VvZiBFcnJvciAmJlxuICAgICAgICBlczUuZ2V0UHJvdG90eXBlT2Yob2JqKSA9PT0gRXJyb3IucHJvdG90eXBlO1xufVxuXG52YXIgckVycm9yS2V5ID0gL14oPzpuYW1lfG1lc3NhZ2V8c3RhY2t8Y2F1c2UpJC87XG5mdW5jdGlvbiB3cmFwQXNPcGVyYXRpb25hbEVycm9yKG9iaikge1xuICAgIHZhciByZXQ7XG4gICAgaWYgKGlzVW50eXBlZEVycm9yKG9iaikpIHtcbiAgICAgICAgcmV0ID0gbmV3IE9wZXJhdGlvbmFsRXJyb3Iob2JqKTtcbiAgICAgICAgcmV0Lm5hbWUgPSBvYmoubmFtZTtcbiAgICAgICAgcmV0Lm1lc3NhZ2UgPSBvYmoubWVzc2FnZTtcbiAgICAgICAgcmV0LnN0YWNrID0gb2JqLnN0YWNrO1xuICAgICAgICB2YXIga2V5cyA9IGVzNS5rZXlzKG9iaik7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgICAgICAgICBpZiAoIXJFcnJvcktleS50ZXN0KGtleSkpIHtcbiAgICAgICAgICAgICAgICByZXRba2V5XSA9IG9ialtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIHV0aWwubWFya0FzT3JpZ2luYXRpbmdGcm9tUmVqZWN0aW9uKG9iaik7XG4gICAgcmV0dXJuIG9iajtcbn1cblxuZnVuY3Rpb24gbm9kZWJhY2tGb3JQcm9taXNlKHByb21pc2UsIG11bHRpQXJncykge1xuICAgIHJldHVybiBmdW5jdGlvbihlcnIsIHZhbHVlKSB7XG4gICAgICAgIGlmIChwcm9taXNlID09PSBudWxsKSByZXR1cm47XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHZhciB3cmFwcGVkID0gd3JhcEFzT3BlcmF0aW9uYWxFcnJvcihtYXliZVdyYXBBc0Vycm9yKGVycikpO1xuICAgICAgICAgICAgcHJvbWlzZS5fYXR0YWNoRXh0cmFUcmFjZSh3cmFwcGVkKTtcbiAgICAgICAgICAgIHByb21pc2UuX3JlamVjdCh3cmFwcGVkKTtcbiAgICAgICAgfSBlbHNlIGlmICghbXVsdGlBcmdzKSB7XG4gICAgICAgICAgICBwcm9taXNlLl9mdWxmaWxsKHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpOztcbiAgICAgICAgICAgIHByb21pc2UuX2Z1bGZpbGwoYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcHJvbWlzZSA9IG51bGw7XG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBub2RlYmFja0ZvclByb21pc2U7XG5cbn0se1wiLi9lcnJvcnNcIjoxMixcIi4vZXM1XCI6MTMsXCIuL3V0aWxcIjozNn1dLDIxOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcblwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihQcm9taXNlKSB7XG52YXIgdXRpbCA9IF9kZXJlcV8oXCIuL3V0aWxcIik7XG52YXIgYXN5bmMgPSBQcm9taXNlLl9hc3luYztcbnZhciB0cnlDYXRjaCA9IHV0aWwudHJ5Q2F0Y2g7XG52YXIgZXJyb3JPYmogPSB1dGlsLmVycm9yT2JqO1xuXG5mdW5jdGlvbiBzcHJlYWRBZGFwdGVyKHZhbCwgbm9kZWJhY2spIHtcbiAgICB2YXIgcHJvbWlzZSA9IHRoaXM7XG4gICAgaWYgKCF1dGlsLmlzQXJyYXkodmFsKSkgcmV0dXJuIHN1Y2Nlc3NBZGFwdGVyLmNhbGwocHJvbWlzZSwgdmFsLCBub2RlYmFjayk7XG4gICAgdmFyIHJldCA9XG4gICAgICAgIHRyeUNhdGNoKG5vZGViYWNrKS5hcHBseShwcm9taXNlLl9ib3VuZFZhbHVlKCksIFtudWxsXS5jb25jYXQodmFsKSk7XG4gICAgaWYgKHJldCA9PT0gZXJyb3JPYmopIHtcbiAgICAgICAgYXN5bmMudGhyb3dMYXRlcihyZXQuZSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzdWNjZXNzQWRhcHRlcih2YWwsIG5vZGViYWNrKSB7XG4gICAgdmFyIHByb21pc2UgPSB0aGlzO1xuICAgIHZhciByZWNlaXZlciA9IHByb21pc2UuX2JvdW5kVmFsdWUoKTtcbiAgICB2YXIgcmV0ID0gdmFsID09PSB1bmRlZmluZWRcbiAgICAgICAgPyB0cnlDYXRjaChub2RlYmFjaykuY2FsbChyZWNlaXZlciwgbnVsbClcbiAgICAgICAgOiB0cnlDYXRjaChub2RlYmFjaykuY2FsbChyZWNlaXZlciwgbnVsbCwgdmFsKTtcbiAgICBpZiAocmV0ID09PSBlcnJvck9iaikge1xuICAgICAgICBhc3luYy50aHJvd0xhdGVyKHJldC5lKTtcbiAgICB9XG59XG5mdW5jdGlvbiBlcnJvckFkYXB0ZXIocmVhc29uLCBub2RlYmFjaykge1xuICAgIHZhciBwcm9taXNlID0gdGhpcztcbiAgICBpZiAoIXJlYXNvbikge1xuICAgICAgICB2YXIgbmV3UmVhc29uID0gbmV3IEVycm9yKHJlYXNvbiArIFwiXCIpO1xuICAgICAgICBuZXdSZWFzb24uY2F1c2UgPSByZWFzb247XG4gICAgICAgIHJlYXNvbiA9IG5ld1JlYXNvbjtcbiAgICB9XG4gICAgdmFyIHJldCA9IHRyeUNhdGNoKG5vZGViYWNrKS5jYWxsKHByb21pc2UuX2JvdW5kVmFsdWUoKSwgcmVhc29uKTtcbiAgICBpZiAocmV0ID09PSBlcnJvck9iaikge1xuICAgICAgICBhc3luYy50aHJvd0xhdGVyKHJldC5lKTtcbiAgICB9XG59XG5cblByb21pc2UucHJvdG90eXBlLmFzQ2FsbGJhY2sgPSBQcm9taXNlLnByb3RvdHlwZS5ub2RlaWZ5ID0gZnVuY3Rpb24gKG5vZGViYWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucykge1xuICAgIGlmICh0eXBlb2Ygbm9kZWJhY2sgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHZhciBhZGFwdGVyID0gc3VjY2Vzc0FkYXB0ZXI7XG4gICAgICAgIGlmIChvcHRpb25zICE9PSB1bmRlZmluZWQgJiYgT2JqZWN0KG9wdGlvbnMpLnNwcmVhZCkge1xuICAgICAgICAgICAgYWRhcHRlciA9IHNwcmVhZEFkYXB0ZXI7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fdGhlbihcbiAgICAgICAgICAgIGFkYXB0ZXIsXG4gICAgICAgICAgICBlcnJvckFkYXB0ZXIsXG4gICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgbm9kZWJhY2tcbiAgICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xufTtcblxufSx7XCIuL3V0aWxcIjozNn1dLDIyOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcblwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbnZhciBtYWtlU2VsZlJlc29sdXRpb25FcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gbmV3IFR5cGVFcnJvcihcImNpcmN1bGFyIHByb21pc2UgcmVzb2x1dGlvbiBjaGFpblxcdTAwMGFcXHUwMDBhICAgIFNlZSBodHRwOi8vZ29vLmdsL01xckZtWFxcdTAwMGFcIik7XG59O1xudmFyIHJlZmxlY3RIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlLlByb21pc2VJbnNwZWN0aW9uKHRoaXMuX3RhcmdldCgpKTtcbn07XG52YXIgYXBpUmVqZWN0aW9uID0gZnVuY3Rpb24obXNnKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IobXNnKSk7XG59O1xuZnVuY3Rpb24gUHJveHlhYmxlKCkge31cbnZhciBVTkRFRklORURfQklORElORyA9IHt9O1xudmFyIHV0aWwgPSBfZGVyZXFfKFwiLi91dGlsXCIpO1xuXG52YXIgZ2V0RG9tYWluO1xuaWYgKHV0aWwuaXNOb2RlKSB7XG4gICAgZ2V0RG9tYWluID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZXQgPSBwcm9jZXNzLmRvbWFpbjtcbiAgICAgICAgaWYgKHJldCA9PT0gdW5kZWZpbmVkKSByZXQgPSBudWxsO1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH07XG59IGVsc2Uge1xuICAgIGdldERvbWFpbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xufVxudXRpbC5ub3RFbnVtZXJhYmxlUHJvcChQcm9taXNlLCBcIl9nZXREb21haW5cIiwgZ2V0RG9tYWluKTtcblxudmFyIGVzNSA9IF9kZXJlcV8oXCIuL2VzNVwiKTtcbnZhciBBc3luYyA9IF9kZXJlcV8oXCIuL2FzeW5jXCIpO1xudmFyIGFzeW5jID0gbmV3IEFzeW5jKCk7XG5lczUuZGVmaW5lUHJvcGVydHkoUHJvbWlzZSwgXCJfYXN5bmNcIiwge3ZhbHVlOiBhc3luY30pO1xudmFyIGVycm9ycyA9IF9kZXJlcV8oXCIuL2Vycm9yc1wiKTtcbnZhciBUeXBlRXJyb3IgPSBQcm9taXNlLlR5cGVFcnJvciA9IGVycm9ycy5UeXBlRXJyb3I7XG5Qcm9taXNlLlJhbmdlRXJyb3IgPSBlcnJvcnMuUmFuZ2VFcnJvcjtcbnZhciBDYW5jZWxsYXRpb25FcnJvciA9IFByb21pc2UuQ2FuY2VsbGF0aW9uRXJyb3IgPSBlcnJvcnMuQ2FuY2VsbGF0aW9uRXJyb3I7XG5Qcm9taXNlLlRpbWVvdXRFcnJvciA9IGVycm9ycy5UaW1lb3V0RXJyb3I7XG5Qcm9taXNlLk9wZXJhdGlvbmFsRXJyb3IgPSBlcnJvcnMuT3BlcmF0aW9uYWxFcnJvcjtcblByb21pc2UuUmVqZWN0aW9uRXJyb3IgPSBlcnJvcnMuT3BlcmF0aW9uYWxFcnJvcjtcblByb21pc2UuQWdncmVnYXRlRXJyb3IgPSBlcnJvcnMuQWdncmVnYXRlRXJyb3I7XG52YXIgSU5URVJOQUwgPSBmdW5jdGlvbigpe307XG52YXIgQVBQTFkgPSB7fTtcbnZhciBORVhUX0ZJTFRFUiA9IHt9O1xudmFyIHRyeUNvbnZlcnRUb1Byb21pc2UgPSBfZGVyZXFfKFwiLi90aGVuYWJsZXNcIikoUHJvbWlzZSwgSU5URVJOQUwpO1xudmFyIFByb21pc2VBcnJheSA9XG4gICAgX2RlcmVxXyhcIi4vcHJvbWlzZV9hcnJheVwiKShQcm9taXNlLCBJTlRFUk5BTCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnlDb252ZXJ0VG9Qcm9taXNlLCBhcGlSZWplY3Rpb24sIFByb3h5YWJsZSk7XG52YXIgQ29udGV4dCA9IF9kZXJlcV8oXCIuL2NvbnRleHRcIikoUHJvbWlzZSk7XG4gLypqc2hpbnQgdW51c2VkOmZhbHNlKi9cbnZhciBjcmVhdGVDb250ZXh0ID0gQ29udGV4dC5jcmVhdGU7XG52YXIgZGVidWcgPSBfZGVyZXFfKFwiLi9kZWJ1Z2dhYmlsaXR5XCIpKFByb21pc2UsIENvbnRleHQpO1xudmFyIENhcHR1cmVkVHJhY2UgPSBkZWJ1Zy5DYXB0dXJlZFRyYWNlO1xudmFyIFBhc3NUaHJvdWdoSGFuZGxlckNvbnRleHQgPVxuICAgIF9kZXJlcV8oXCIuL2ZpbmFsbHlcIikoUHJvbWlzZSwgdHJ5Q29udmVydFRvUHJvbWlzZSk7XG52YXIgY2F0Y2hGaWx0ZXIgPSBfZGVyZXFfKFwiLi9jYXRjaF9maWx0ZXJcIikoTkVYVF9GSUxURVIpO1xudmFyIG5vZGViYWNrRm9yUHJvbWlzZSA9IF9kZXJlcV8oXCIuL25vZGViYWNrXCIpO1xudmFyIGVycm9yT2JqID0gdXRpbC5lcnJvck9iajtcbnZhciB0cnlDYXRjaCA9IHV0aWwudHJ5Q2F0Y2g7XG5mdW5jdGlvbiBjaGVjayhzZWxmLCBleGVjdXRvcikge1xuICAgIGlmICh0eXBlb2YgZXhlY3V0b3IgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiZXhwZWN0aW5nIGEgZnVuY3Rpb24gYnV0IGdvdCBcIiArIHV0aWwuY2xhc3NTdHJpbmcoZXhlY3V0b3IpKTtcbiAgICB9XG4gICAgaWYgKHNlbGYuY29uc3RydWN0b3IgIT09IFByb21pc2UpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcInRoZSBwcm9taXNlIGNvbnN0cnVjdG9yIGNhbm5vdCBiZSBpbnZva2VkIGRpcmVjdGx5XFx1MDAwYVxcdTAwMGEgICAgU2VlIGh0dHA6Ly9nb28uZ2wvTXFyRm1YXFx1MDAwYVwiKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIFByb21pc2UoZXhlY3V0b3IpIHtcbiAgICB0aGlzLl9iaXRGaWVsZCA9IDA7XG4gICAgdGhpcy5fZnVsZmlsbG1lbnRIYW5kbGVyMCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9yZWplY3Rpb25IYW5kbGVyMCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9wcm9taXNlMCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9yZWNlaXZlcjAgPSB1bmRlZmluZWQ7XG4gICAgaWYgKGV4ZWN1dG9yICE9PSBJTlRFUk5BTCkge1xuICAgICAgICBjaGVjayh0aGlzLCBleGVjdXRvcik7XG4gICAgICAgIHRoaXMuX3Jlc29sdmVGcm9tRXhlY3V0b3IoZXhlY3V0b3IpO1xuICAgIH1cbiAgICB0aGlzLl9wcm9taXNlQ3JlYXRlZCgpO1xuICAgIHRoaXMuX2ZpcmVFdmVudChcInByb21pc2VDcmVhdGVkXCIsIHRoaXMpO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gXCJbb2JqZWN0IFByb21pc2VdXCI7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5jYXVnaHQgPSBQcm9taXNlLnByb3RvdHlwZVtcImNhdGNoXCJdID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgdmFyIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgaWYgKGxlbiA+IDEpIHtcbiAgICAgICAgdmFyIGNhdGNoSW5zdGFuY2VzID0gbmV3IEFycmF5KGxlbiAtIDEpLFxuICAgICAgICAgICAgaiA9IDAsIGk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW4gLSAxOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gYXJndW1lbnRzW2ldO1xuICAgICAgICAgICAgaWYgKHV0aWwuaXNPYmplY3QoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICBjYXRjaEluc3RhbmNlc1tqKytdID0gaXRlbTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFwaVJlamVjdGlvbihcImV4cGVjdGluZyBhbiBvYmplY3QgYnV0IGdvdCBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiQSBjYXRjaCBzdGF0ZW1lbnQgcHJlZGljYXRlIFwiICsgdXRpbC5jbGFzc1N0cmluZyhpdGVtKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2hJbnN0YW5jZXMubGVuZ3RoID0gajtcbiAgICAgICAgZm4gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIHJldHVybiB0aGlzLnRoZW4odW5kZWZpbmVkLCBjYXRjaEZpbHRlcihjYXRjaEluc3RhbmNlcywgZm4sIHRoaXMpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudGhlbih1bmRlZmluZWQsIGZuKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLnJlZmxlY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3RoZW4ocmVmbGVjdEhhbmRsZXIsXG4gICAgICAgIHJlZmxlY3RIYW5kbGVyLCB1bmRlZmluZWQsIHRoaXMsIHVuZGVmaW5lZCk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24gKGRpZEZ1bGZpbGwsIGRpZFJlamVjdCkge1xuICAgIGlmIChkZWJ1Zy53YXJuaW5ncygpICYmIGFyZ3VtZW50cy5sZW5ndGggPiAwICYmXG4gICAgICAgIHR5cGVvZiBkaWRGdWxmaWxsICE9PSBcImZ1bmN0aW9uXCIgJiZcbiAgICAgICAgdHlwZW9mIGRpZFJlamVjdCAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHZhciBtc2cgPSBcIi50aGVuKCkgb25seSBhY2NlcHRzIGZ1bmN0aW9ucyBidXQgd2FzIHBhc3NlZDogXCIgK1xuICAgICAgICAgICAgICAgIHV0aWwuY2xhc3NTdHJpbmcoZGlkRnVsZmlsbCk7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgbXNnICs9IFwiLCBcIiArIHV0aWwuY2xhc3NTdHJpbmcoZGlkUmVqZWN0KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl93YXJuKG1zZyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl90aGVuKGRpZEZ1bGZpbGwsIGRpZFJlamVjdCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5kb25lID0gZnVuY3Rpb24gKGRpZEZ1bGZpbGwsIGRpZFJlamVjdCkge1xuICAgIHZhciBwcm9taXNlID1cbiAgICAgICAgdGhpcy5fdGhlbihkaWRGdWxmaWxsLCBkaWRSZWplY3QsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQpO1xuICAgIHByb21pc2UuX3NldElzRmluYWwoKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLnNwcmVhZCA9IGZ1bmN0aW9uIChmbikge1xuICAgIGlmICh0eXBlb2YgZm4gIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gYXBpUmVqZWN0aW9uKFwiZXhwZWN0aW5nIGEgZnVuY3Rpb24gYnV0IGdvdCBcIiArIHV0aWwuY2xhc3NTdHJpbmcoZm4pKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYWxsKCkuX3RoZW4oZm4sIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBBUFBMWSwgdW5kZWZpbmVkKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmV0ID0ge1xuICAgICAgICBpc0Z1bGZpbGxlZDogZmFsc2UsXG4gICAgICAgIGlzUmVqZWN0ZWQ6IGZhbHNlLFxuICAgICAgICBmdWxmaWxsbWVudFZhbHVlOiB1bmRlZmluZWQsXG4gICAgICAgIHJlamVjdGlvblJlYXNvbjogdW5kZWZpbmVkXG4gICAgfTtcbiAgICBpZiAodGhpcy5pc0Z1bGZpbGxlZCgpKSB7XG4gICAgICAgIHJldC5mdWxmaWxsbWVudFZhbHVlID0gdGhpcy52YWx1ZSgpO1xuICAgICAgICByZXQuaXNGdWxmaWxsZWQgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc1JlamVjdGVkKCkpIHtcbiAgICAgICAgcmV0LnJlamVjdGlvblJlYXNvbiA9IHRoaXMucmVhc29uKCk7XG4gICAgICAgIHJldC5pc1JlamVjdGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmFsbCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5fd2FybihcIi5hbGwoKSB3YXMgcGFzc2VkIGFyZ3VtZW50cyBidXQgaXQgZG9lcyBub3QgdGFrZSBhbnlcIik7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvbWlzZUFycmF5KHRoaXMpLnByb21pc2UoKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmVycm9yID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgcmV0dXJuIHRoaXMuY2F1Z2h0KHV0aWwub3JpZ2luYXRlc0Zyb21SZWplY3Rpb24sIGZuKTtcbn07XG5cblByb21pc2UuZ2V0TmV3TGlicmFyeUNvcHkgPSBtb2R1bGUuZXhwb3J0cztcblxuUHJvbWlzZS5pcyA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgICByZXR1cm4gdmFsIGluc3RhbmNlb2YgUHJvbWlzZTtcbn07XG5cblByb21pc2UuZnJvbU5vZGUgPSBQcm9taXNlLmZyb21DYWxsYmFjayA9IGZ1bmN0aW9uKGZuKSB7XG4gICAgdmFyIHJldCA9IG5ldyBQcm9taXNlKElOVEVSTkFMKTtcbiAgICByZXQuX2NhcHR1cmVTdGFja1RyYWNlKCk7XG4gICAgdmFyIG11bHRpQXJncyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gISFPYmplY3QoYXJndW1lbnRzWzFdKS5tdWx0aUFyZ3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBmYWxzZTtcbiAgICB2YXIgcmVzdWx0ID0gdHJ5Q2F0Y2goZm4pKG5vZGViYWNrRm9yUHJvbWlzZShyZXQsIG11bHRpQXJncykpO1xuICAgIGlmIChyZXN1bHQgPT09IGVycm9yT2JqKSB7XG4gICAgICAgIHJldC5fcmVqZWN0Q2FsbGJhY2socmVzdWx0LmUsIHRydWUpO1xuICAgIH1cbiAgICBpZiAoIXJldC5faXNGYXRlU2VhbGVkKCkpIHJldC5fc2V0QXN5bmNHdWFyYW50ZWVkKCk7XG4gICAgcmV0dXJuIHJldDtcbn07XG5cblByb21pc2UuYWxsID0gZnVuY3Rpb24gKHByb21pc2VzKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlQXJyYXkocHJvbWlzZXMpLnByb21pc2UoKTtcbn07XG5cblByb21pc2UuY2FzdCA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICB2YXIgcmV0ID0gdHJ5Q29udmVydFRvUHJvbWlzZShvYmopO1xuICAgIGlmICghKHJldCBpbnN0YW5jZW9mIFByb21pc2UpKSB7XG4gICAgICAgIHJldCA9IG5ldyBQcm9taXNlKElOVEVSTkFMKTtcbiAgICAgICAgcmV0Ll9jYXB0dXJlU3RhY2tUcmFjZSgpO1xuICAgICAgICByZXQuX3NldEZ1bGZpbGxlZCgpO1xuICAgICAgICByZXQuX3JlamVjdGlvbkhhbmRsZXIwID0gb2JqO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xufTtcblxuUHJvbWlzZS5yZXNvbHZlID0gUHJvbWlzZS5mdWxmaWxsZWQgPSBQcm9taXNlLmNhc3Q7XG5cblByb21pc2UucmVqZWN0ID0gUHJvbWlzZS5yZWplY3RlZCA9IGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICB2YXIgcmV0ID0gbmV3IFByb21pc2UoSU5URVJOQUwpO1xuICAgIHJldC5fY2FwdHVyZVN0YWNrVHJhY2UoKTtcbiAgICByZXQuX3JlamVjdENhbGxiYWNrKHJlYXNvbiwgdHJ1ZSk7XG4gICAgcmV0dXJuIHJldDtcbn07XG5cblByb21pc2Uuc2V0U2NoZWR1bGVyID0gZnVuY3Rpb24oZm4pIHtcbiAgICBpZiAodHlwZW9mIGZuICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImV4cGVjdGluZyBhIGZ1bmN0aW9uIGJ1dCBnb3QgXCIgKyB1dGlsLmNsYXNzU3RyaW5nKGZuKSk7XG4gICAgfVxuICAgIHJldHVybiBhc3luYy5zZXRTY2hlZHVsZXIoZm4pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuX3RoZW4gPSBmdW5jdGlvbiAoXG4gICAgZGlkRnVsZmlsbCxcbiAgICBkaWRSZWplY3QsXG4gICAgXywgICAgcmVjZWl2ZXIsXG4gICAgaW50ZXJuYWxEYXRhXG4pIHtcbiAgICB2YXIgaGF2ZUludGVybmFsRGF0YSA9IGludGVybmFsRGF0YSAhPT0gdW5kZWZpbmVkO1xuICAgIHZhciBwcm9taXNlID0gaGF2ZUludGVybmFsRGF0YSA/IGludGVybmFsRGF0YSA6IG5ldyBQcm9taXNlKElOVEVSTkFMKTtcbiAgICB2YXIgdGFyZ2V0ID0gdGhpcy5fdGFyZ2V0KCk7XG4gICAgdmFyIGJpdEZpZWxkID0gdGFyZ2V0Ll9iaXRGaWVsZDtcblxuICAgIGlmICghaGF2ZUludGVybmFsRGF0YSkge1xuICAgICAgICBwcm9taXNlLl9wcm9wYWdhdGVGcm9tKHRoaXMsIDMpO1xuICAgICAgICBwcm9taXNlLl9jYXB0dXJlU3RhY2tUcmFjZSgpO1xuICAgICAgICBpZiAocmVjZWl2ZXIgPT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgKCh0aGlzLl9iaXRGaWVsZCAmIDIwOTcxNTIpICE9PSAwKSkge1xuICAgICAgICAgICAgaWYgKCEoKGJpdEZpZWxkICYgNTAzOTcxODQpID09PSAwKSkge1xuICAgICAgICAgICAgICAgIHJlY2VpdmVyID0gdGhpcy5fYm91bmRWYWx1ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZWNlaXZlciA9IHRhcmdldCA9PT0gdGhpcyA/IHVuZGVmaW5lZCA6IHRoaXMuX2JvdW5kVG87XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZmlyZUV2ZW50KFwicHJvbWlzZUNoYWluZWRcIiwgdGhpcywgcHJvbWlzZSk7XG4gICAgfVxuXG4gICAgdmFyIGRvbWFpbiA9IGdldERvbWFpbigpO1xuICAgIGlmICghKChiaXRGaWVsZCAmIDUwMzk3MTg0KSA9PT0gMCkpIHtcbiAgICAgICAgdmFyIGhhbmRsZXIsIHZhbHVlLCBzZXR0bGVyID0gdGFyZ2V0Ll9zZXR0bGVQcm9taXNlQ3R4O1xuICAgICAgICBpZiAoKChiaXRGaWVsZCAmIDMzNTU0NDMyKSAhPT0gMCkpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdGFyZ2V0Ll9yZWplY3Rpb25IYW5kbGVyMDtcbiAgICAgICAgICAgIGhhbmRsZXIgPSBkaWRGdWxmaWxsO1xuICAgICAgICB9IGVsc2UgaWYgKCgoYml0RmllbGQgJiAxNjc3NzIxNikgIT09IDApKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHRhcmdldC5fZnVsZmlsbG1lbnRIYW5kbGVyMDtcbiAgICAgICAgICAgIGhhbmRsZXIgPSBkaWRSZWplY3Q7XG4gICAgICAgICAgICB0YXJnZXQuX3Vuc2V0UmVqZWN0aW9uSXNVbmhhbmRsZWQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNldHRsZXIgPSB0YXJnZXQuX3NldHRsZVByb21pc2VMYXRlQ2FuY2VsbGF0aW9uT2JzZXJ2ZXI7XG4gICAgICAgICAgICB2YWx1ZSA9IG5ldyBDYW5jZWxsYXRpb25FcnJvcihcImxhdGUgY2FuY2VsbGF0aW9uIG9ic2VydmVyXCIpO1xuICAgICAgICAgICAgdGFyZ2V0Ll9hdHRhY2hFeHRyYVRyYWNlKHZhbHVlKTtcbiAgICAgICAgICAgIGhhbmRsZXIgPSBkaWRSZWplY3Q7XG4gICAgICAgIH1cblxuICAgICAgICBhc3luYy5pbnZva2Uoc2V0dGxlciwgdGFyZ2V0LCB7XG4gICAgICAgICAgICBoYW5kbGVyOiBkb21haW4gPT09IG51bGwgPyBoYW5kbGVyXG4gICAgICAgICAgICAgICAgOiAodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIiAmJlxuICAgICAgICAgICAgICAgICAgICB1dGlsLmRvbWFpbkJpbmQoZG9tYWluLCBoYW5kbGVyKSksXG4gICAgICAgICAgICBwcm9taXNlOiBwcm9taXNlLFxuICAgICAgICAgICAgcmVjZWl2ZXI6IHJlY2VpdmVyLFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRhcmdldC5fYWRkQ2FsbGJhY2tzKGRpZEZ1bGZpbGwsIGRpZFJlamVjdCwgcHJvbWlzZSwgcmVjZWl2ZXIsIGRvbWFpbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb21pc2U7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5fbGVuZ3RoID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl9iaXRGaWVsZCAmIDY1NTM1O1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuX2lzRmF0ZVNlYWxlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKHRoaXMuX2JpdEZpZWxkICYgMTE3NTA2MDQ4KSAhPT0gMDtcbn07XG5cblByb21pc2UucHJvdG90eXBlLl9pc0ZvbGxvd2luZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKHRoaXMuX2JpdEZpZWxkICYgNjcxMDg4NjQpID09PSA2NzEwODg2NDtcbn07XG5cblByb21pc2UucHJvdG90eXBlLl9zZXRMZW5ndGggPSBmdW5jdGlvbiAobGVuKSB7XG4gICAgdGhpcy5fYml0RmllbGQgPSAodGhpcy5fYml0RmllbGQgJiAtNjU1MzYpIHxcbiAgICAgICAgKGxlbiAmIDY1NTM1KTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLl9zZXRGdWxmaWxsZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fYml0RmllbGQgPSB0aGlzLl9iaXRGaWVsZCB8IDMzNTU0NDMyO1xuICAgIHRoaXMuX2ZpcmVFdmVudChcInByb21pc2VGdWxmaWxsZWRcIiwgdGhpcyk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5fc2V0UmVqZWN0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fYml0RmllbGQgPSB0aGlzLl9iaXRGaWVsZCB8IDE2Nzc3MjE2O1xuICAgIHRoaXMuX2ZpcmVFdmVudChcInByb21pc2VSZWplY3RlZFwiLCB0aGlzKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLl9zZXRGb2xsb3dpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fYml0RmllbGQgPSB0aGlzLl9iaXRGaWVsZCB8IDY3MTA4ODY0O1xuICAgIHRoaXMuX2ZpcmVFdmVudChcInByb21pc2VSZXNvbHZlZFwiLCB0aGlzKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLl9zZXRJc0ZpbmFsID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX2JpdEZpZWxkID0gdGhpcy5fYml0RmllbGQgfCA0MTk0MzA0O1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuX2lzRmluYWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICh0aGlzLl9iaXRGaWVsZCAmIDQxOTQzMDQpID4gMDtcbn07XG5cblByb21pc2UucHJvdG90eXBlLl91bnNldENhbmNlbGxlZCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2JpdEZpZWxkID0gdGhpcy5fYml0RmllbGQgJiAofjY1NTM2KTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLl9zZXRDYW5jZWxsZWQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9iaXRGaWVsZCA9IHRoaXMuX2JpdEZpZWxkIHwgNjU1MzY7XG4gICAgdGhpcy5fZmlyZUV2ZW50KFwicHJvbWlzZUNhbmNlbGxlZFwiLCB0aGlzKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLl9zZXRXaWxsQmVDYW5jZWxsZWQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9iaXRGaWVsZCA9IHRoaXMuX2JpdEZpZWxkIHwgODM4ODYwODtcbn07XG5cblByb21pc2UucHJvdG90eXBlLl9zZXRBc3luY0d1YXJhbnRlZWQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoYXN5bmMuaGFzQ3VzdG9tU2NoZWR1bGVyKCkpIHJldHVybjtcbiAgICB0aGlzLl9iaXRGaWVsZCA9IHRoaXMuX2JpdEZpZWxkIHwgMTM0MjE3NzI4O1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuX3JlY2VpdmVyQXQgPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICB2YXIgcmV0ID0gaW5kZXggPT09IDAgPyB0aGlzLl9yZWNlaXZlcjAgOiB0aGlzW1xuICAgICAgICAgICAgaW5kZXggKiA0IC0gNCArIDNdO1xuICAgIGlmIChyZXQgPT09IFVOREVGSU5FRF9CSU5ESU5HKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIGlmIChyZXQgPT09IHVuZGVmaW5lZCAmJiB0aGlzLl9pc0JvdW5kKCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2JvdW5kVmFsdWUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbn07XG5cblByb21pc2UucHJvdG90eXBlLl9wcm9taXNlQXQgPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICByZXR1cm4gdGhpc1tcbiAgICAgICAgICAgIGluZGV4ICogNCAtIDQgKyAyXTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLl9mdWxmaWxsbWVudEhhbmRsZXJBdCA9IGZ1bmN0aW9uIChpbmRleCkge1xuICAgIHJldHVybiB0aGlzW1xuICAgICAgICAgICAgaW5kZXggKiA0IC0gNCArIDBdO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuX3JlamVjdGlvbkhhbmRsZXJBdCA9IGZ1bmN0aW9uIChpbmRleCkge1xuICAgIHJldHVybiB0aGlzW1xuICAgICAgICAgICAgaW5kZXggKiA0IC0gNCArIDFdO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuX2JvdW5kVmFsdWUgPSBmdW5jdGlvbigpIHt9O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5fbWlncmF0ZUNhbGxiYWNrMCA9IGZ1bmN0aW9uIChmb2xsb3dlcikge1xuICAgIHZhciBiaXRGaWVsZCA9IGZvbGxvd2VyLl9iaXRGaWVsZDtcbiAgICB2YXIgZnVsZmlsbCA9IGZvbGxvd2VyLl9mdWxmaWxsbWVudEhhbmRsZXIwO1xuICAgIHZhciByZWplY3QgPSBmb2xsb3dlci5fcmVqZWN0aW9uSGFuZGxlcjA7XG4gICAgdmFyIHByb21pc2UgPSBmb2xsb3dlci5fcHJvbWlzZTA7XG4gICAgdmFyIHJlY2VpdmVyID0gZm9sbG93ZXIuX3JlY2VpdmVyQXQoMCk7XG4gICAgaWYgKHJlY2VpdmVyID09PSB1bmRlZmluZWQpIHJlY2VpdmVyID0gVU5ERUZJTkVEX0JJTkRJTkc7XG4gICAgdGhpcy5fYWRkQ2FsbGJhY2tzKGZ1bGZpbGwsIHJlamVjdCwgcHJvbWlzZSwgcmVjZWl2ZXIsIG51bGwpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuX21pZ3JhdGVDYWxsYmFja0F0ID0gZnVuY3Rpb24gKGZvbGxvd2VyLCBpbmRleCkge1xuICAgIHZhciBmdWxmaWxsID0gZm9sbG93ZXIuX2Z1bGZpbGxtZW50SGFuZGxlckF0KGluZGV4KTtcbiAgICB2YXIgcmVqZWN0ID0gZm9sbG93ZXIuX3JlamVjdGlvbkhhbmRsZXJBdChpbmRleCk7XG4gICAgdmFyIHByb21pc2UgPSBmb2xsb3dlci5fcHJvbWlzZUF0KGluZGV4KTtcbiAgICB2YXIgcmVjZWl2ZXIgPSBmb2xsb3dlci5fcmVjZWl2ZXJBdChpbmRleCk7XG4gICAgaWYgKHJlY2VpdmVyID09PSB1bmRlZmluZWQpIHJlY2VpdmVyID0gVU5ERUZJTkVEX0JJTkRJTkc7XG4gICAgdGhpcy5fYWRkQ2FsbGJhY2tzKGZ1bGZpbGwsIHJlamVjdCwgcHJvbWlzZSwgcmVjZWl2ZXIsIG51bGwpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuX2FkZENhbGxiYWNrcyA9IGZ1bmN0aW9uIChcbiAgICBmdWxmaWxsLFxuICAgIHJlamVjdCxcbiAgICBwcm9taXNlLFxuICAgIHJlY2VpdmVyLFxuICAgIGRvbWFpblxuKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5fbGVuZ3RoKCk7XG5cbiAgICBpZiAoaW5kZXggPj0gNjU1MzUgLSA0KSB7XG4gICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgdGhpcy5fc2V0TGVuZ3RoKDApO1xuICAgIH1cblxuICAgIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgICB0aGlzLl9wcm9taXNlMCA9IHByb21pc2U7XG4gICAgICAgIHRoaXMuX3JlY2VpdmVyMCA9IHJlY2VpdmVyO1xuICAgICAgICBpZiAodHlwZW9mIGZ1bGZpbGwgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgdGhpcy5fZnVsZmlsbG1lbnRIYW5kbGVyMCA9XG4gICAgICAgICAgICAgICAgZG9tYWluID09PSBudWxsID8gZnVsZmlsbCA6IHV0aWwuZG9tYWluQmluZChkb21haW4sIGZ1bGZpbGwpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgcmVqZWN0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlamVjdGlvbkhhbmRsZXIwID1cbiAgICAgICAgICAgICAgICBkb21haW4gPT09IG51bGwgPyByZWplY3QgOiB1dGlsLmRvbWFpbkJpbmQoZG9tYWluLCByZWplY3QpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGJhc2UgPSBpbmRleCAqIDQgLSA0O1xuICAgICAgICB0aGlzW2Jhc2UgKyAyXSA9IHByb21pc2U7XG4gICAgICAgIHRoaXNbYmFzZSArIDNdID0gcmVjZWl2ZXI7XG4gICAgICAgIGlmICh0eXBlb2YgZnVsZmlsbCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICB0aGlzW2Jhc2UgKyAwXSA9XG4gICAgICAgICAgICAgICAgZG9tYWluID09PSBudWxsID8gZnVsZmlsbCA6IHV0aWwuZG9tYWluQmluZChkb21haW4sIGZ1bGZpbGwpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgcmVqZWN0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHRoaXNbYmFzZSArIDFdID1cbiAgICAgICAgICAgICAgICBkb21haW4gPT09IG51bGwgPyByZWplY3QgOiB1dGlsLmRvbWFpbkJpbmQoZG9tYWluLCByZWplY3QpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3NldExlbmd0aChpbmRleCArIDEpO1xuICAgIHJldHVybiBpbmRleDtcbn07XG5cblByb21pc2UucHJvdG90eXBlLl9wcm94eSA9IGZ1bmN0aW9uIChwcm94eWFibGUsIGFyZykge1xuICAgIHRoaXMuX2FkZENhbGxiYWNrcyh1bmRlZmluZWQsIHVuZGVmaW5lZCwgYXJnLCBwcm94eWFibGUsIG51bGwpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuX3Jlc29sdmVDYWxsYmFjayA9IGZ1bmN0aW9uKHZhbHVlLCBzaG91bGRCaW5kKSB7XG4gICAgaWYgKCgodGhpcy5fYml0RmllbGQgJiAxMTc1MDYwNDgpICE9PSAwKSkgcmV0dXJuO1xuICAgIGlmICh2YWx1ZSA9PT0gdGhpcylcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlamVjdENhbGxiYWNrKG1ha2VTZWxmUmVzb2x1dGlvbkVycm9yKCksIGZhbHNlKTtcbiAgICB2YXIgbWF5YmVQcm9taXNlID0gdHJ5Q29udmVydFRvUHJvbWlzZSh2YWx1ZSwgdGhpcyk7XG4gICAgaWYgKCEobWF5YmVQcm9taXNlIGluc3RhbmNlb2YgUHJvbWlzZSkpIHJldHVybiB0aGlzLl9mdWxmaWxsKHZhbHVlKTtcblxuICAgIGlmIChzaG91bGRCaW5kKSB0aGlzLl9wcm9wYWdhdGVGcm9tKG1heWJlUHJvbWlzZSwgMik7XG5cbiAgICB2YXIgcHJvbWlzZSA9IG1heWJlUHJvbWlzZS5fdGFyZ2V0KCk7XG5cbiAgICBpZiAocHJvbWlzZSA9PT0gdGhpcykge1xuICAgICAgICB0aGlzLl9yZWplY3QobWFrZVNlbGZSZXNvbHV0aW9uRXJyb3IoKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgYml0RmllbGQgPSBwcm9taXNlLl9iaXRGaWVsZDtcbiAgICBpZiAoKChiaXRGaWVsZCAmIDUwMzk3MTg0KSA9PT0gMCkpIHtcbiAgICAgICAgdmFyIGxlbiA9IHRoaXMuX2xlbmd0aCgpO1xuICAgICAgICBpZiAobGVuID4gMCkgcHJvbWlzZS5fbWlncmF0ZUNhbGxiYWNrMCh0aGlzKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBsZW47ICsraSkge1xuICAgICAgICAgICAgcHJvbWlzZS5fbWlncmF0ZUNhbGxiYWNrQXQodGhpcywgaSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc2V0Rm9sbG93aW5nKCk7XG4gICAgICAgIHRoaXMuX3NldExlbmd0aCgwKTtcbiAgICAgICAgdGhpcy5fc2V0Rm9sbG93ZWUocHJvbWlzZSk7XG4gICAgfSBlbHNlIGlmICgoKGJpdEZpZWxkICYgMzM1NTQ0MzIpICE9PSAwKSkge1xuICAgICAgICB0aGlzLl9mdWxmaWxsKHByb21pc2UuX3ZhbHVlKCkpO1xuICAgIH0gZWxzZSBpZiAoKChiaXRGaWVsZCAmIDE2Nzc3MjE2KSAhPT0gMCkpIHtcbiAgICAgICAgdGhpcy5fcmVqZWN0KHByb21pc2UuX3JlYXNvbigpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcmVhc29uID0gbmV3IENhbmNlbGxhdGlvbkVycm9yKFwibGF0ZSBjYW5jZWxsYXRpb24gb2JzZXJ2ZXJcIik7XG4gICAgICAgIHByb21pc2UuX2F0dGFjaEV4dHJhVHJhY2UocmVhc29uKTtcbiAgICAgICAgdGhpcy5fcmVqZWN0KHJlYXNvbik7XG4gICAgfVxufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuX3JlamVjdENhbGxiYWNrID1cbmZ1bmN0aW9uKHJlYXNvbiwgc3luY2hyb25vdXMsIGlnbm9yZU5vbkVycm9yV2FybmluZ3MpIHtcbiAgICB2YXIgdHJhY2UgPSB1dGlsLmVuc3VyZUVycm9yT2JqZWN0KHJlYXNvbik7XG4gICAgdmFyIGhhc1N0YWNrID0gdHJhY2UgPT09IHJlYXNvbjtcbiAgICBpZiAoIWhhc1N0YWNrICYmICFpZ25vcmVOb25FcnJvcldhcm5pbmdzICYmIGRlYnVnLndhcm5pbmdzKCkpIHtcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSBcImEgcHJvbWlzZSB3YXMgcmVqZWN0ZWQgd2l0aCBhIG5vbi1lcnJvcjogXCIgK1xuICAgICAgICAgICAgdXRpbC5jbGFzc1N0cmluZyhyZWFzb24pO1xuICAgICAgICB0aGlzLl93YXJuKG1lc3NhZ2UsIHRydWUpO1xuICAgIH1cbiAgICB0aGlzLl9hdHRhY2hFeHRyYVRyYWNlKHRyYWNlLCBzeW5jaHJvbm91cyA/IGhhc1N0YWNrIDogZmFsc2UpO1xuICAgIHRoaXMuX3JlamVjdChyZWFzb24pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuX3Jlc29sdmVGcm9tRXhlY3V0b3IgPSBmdW5jdGlvbiAoZXhlY3V0b3IpIHtcbiAgICB2YXIgcHJvbWlzZSA9IHRoaXM7XG4gICAgdGhpcy5fY2FwdHVyZVN0YWNrVHJhY2UoKTtcbiAgICB0aGlzLl9wdXNoQ29udGV4dCgpO1xuICAgIHZhciBzeW5jaHJvbm91cyA9IHRydWU7XG4gICAgdmFyIHIgPSB0aGlzLl9leGVjdXRlKGV4ZWN1dG9yLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBwcm9taXNlLl9yZXNvbHZlQ2FsbGJhY2sodmFsdWUpO1xuICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgcHJvbWlzZS5fcmVqZWN0Q2FsbGJhY2socmVhc29uLCBzeW5jaHJvbm91cyk7XG4gICAgfSk7XG4gICAgc3luY2hyb25vdXMgPSBmYWxzZTtcbiAgICB0aGlzLl9wb3BDb250ZXh0KCk7XG5cbiAgICBpZiAociAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHByb21pc2UuX3JlamVjdENhbGxiYWNrKHIsIHRydWUpO1xuICAgIH1cbn07XG5cblByb21pc2UucHJvdG90eXBlLl9zZXR0bGVQcm9taXNlRnJvbUhhbmRsZXIgPSBmdW5jdGlvbiAoXG4gICAgaGFuZGxlciwgcmVjZWl2ZXIsIHZhbHVlLCBwcm9taXNlXG4pIHtcbiAgICB2YXIgYml0RmllbGQgPSBwcm9taXNlLl9iaXRGaWVsZDtcbiAgICBpZiAoKChiaXRGaWVsZCAmIDY1NTM2KSAhPT0gMCkpIHJldHVybjtcbiAgICBwcm9taXNlLl9wdXNoQ29udGV4dCgpO1xuICAgIHZhciB4O1xuICAgIGlmIChyZWNlaXZlciA9PT0gQVBQTFkpIHtcbiAgICAgICAgaWYgKCF2YWx1ZSB8fCB0eXBlb2YgdmFsdWUubGVuZ3RoICE9PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICB4ID0gZXJyb3JPYmo7XG4gICAgICAgICAgICB4LmUgPSBuZXcgVHlwZUVycm9yKFwiY2Fubm90IC5zcHJlYWQoKSBhIG5vbi1hcnJheTogXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRpbC5jbGFzc1N0cmluZyh2YWx1ZSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgeCA9IHRyeUNhdGNoKGhhbmRsZXIpLmFwcGx5KHRoaXMuX2JvdW5kVmFsdWUoKSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgeCA9IHRyeUNhdGNoKGhhbmRsZXIpLmNhbGwocmVjZWl2ZXIsIHZhbHVlKTtcbiAgICB9XG4gICAgdmFyIHByb21pc2VDcmVhdGVkID0gcHJvbWlzZS5fcG9wQ29udGV4dCgpO1xuICAgIGJpdEZpZWxkID0gcHJvbWlzZS5fYml0RmllbGQ7XG4gICAgaWYgKCgoYml0RmllbGQgJiA2NTUzNikgIT09IDApKSByZXR1cm47XG5cbiAgICBpZiAoeCA9PT0gTkVYVF9GSUxURVIpIHtcbiAgICAgICAgcHJvbWlzZS5fcmVqZWN0KHZhbHVlKTtcbiAgICB9IGVsc2UgaWYgKHggPT09IGVycm9yT2JqKSB7XG4gICAgICAgIHByb21pc2UuX3JlamVjdENhbGxiYWNrKHguZSwgZmFsc2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGRlYnVnLmNoZWNrRm9yZ290dGVuUmV0dXJucyh4LCBwcm9taXNlQ3JlYXRlZCwgXCJcIiwgIHByb21pc2UsIHRoaXMpO1xuICAgICAgICBwcm9taXNlLl9yZXNvbHZlQ2FsbGJhY2soeCk7XG4gICAgfVxufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuX3RhcmdldCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXQgPSB0aGlzO1xuICAgIHdoaWxlIChyZXQuX2lzRm9sbG93aW5nKCkpIHJldCA9IHJldC5fZm9sbG93ZWUoKTtcbiAgICByZXR1cm4gcmV0O1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuX2ZvbGxvd2VlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3JlamVjdGlvbkhhbmRsZXIwO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuX3NldEZvbGxvd2VlID0gZnVuY3Rpb24ocHJvbWlzZSkge1xuICAgIHRoaXMuX3JlamVjdGlvbkhhbmRsZXIwID0gcHJvbWlzZTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLl9zZXR0bGVQcm9taXNlID0gZnVuY3Rpb24ocHJvbWlzZSwgaGFuZGxlciwgcmVjZWl2ZXIsIHZhbHVlKSB7XG4gICAgdmFyIGlzUHJvbWlzZSA9IHByb21pc2UgaW5zdGFuY2VvZiBQcm9taXNlO1xuICAgIHZhciBiaXRGaWVsZCA9IHRoaXMuX2JpdEZpZWxkO1xuICAgIHZhciBhc3luY0d1YXJhbnRlZWQgPSAoKGJpdEZpZWxkICYgMTM0MjE3NzI4KSAhPT0gMCk7XG4gICAgaWYgKCgoYml0RmllbGQgJiA2NTUzNikgIT09IDApKSB7XG4gICAgICAgIGlmIChpc1Byb21pc2UpIHByb21pc2UuX2ludm9rZUludGVybmFsT25DYW5jZWwoKTtcblxuICAgICAgICBpZiAocmVjZWl2ZXIgaW5zdGFuY2VvZiBQYXNzVGhyb3VnaEhhbmRsZXJDb250ZXh0ICYmXG4gICAgICAgICAgICByZWNlaXZlci5pc0ZpbmFsbHlIYW5kbGVyKCkpIHtcbiAgICAgICAgICAgIHJlY2VpdmVyLmNhbmNlbFByb21pc2UgPSBwcm9taXNlO1xuICAgICAgICAgICAgaWYgKHRyeUNhdGNoKGhhbmRsZXIpLmNhbGwocmVjZWl2ZXIsIHZhbHVlKSA9PT0gZXJyb3JPYmopIHtcbiAgICAgICAgICAgICAgICBwcm9taXNlLl9yZWplY3QoZXJyb3JPYmouZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoaGFuZGxlciA9PT0gcmVmbGVjdEhhbmRsZXIpIHtcbiAgICAgICAgICAgIHByb21pc2UuX2Z1bGZpbGwocmVmbGVjdEhhbmRsZXIuY2FsbChyZWNlaXZlcikpO1xuICAgICAgICB9IGVsc2UgaWYgKHJlY2VpdmVyIGluc3RhbmNlb2YgUHJveHlhYmxlKSB7XG4gICAgICAgICAgICByZWNlaXZlci5fcHJvbWlzZUNhbmNlbGxlZChwcm9taXNlKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc1Byb21pc2UgfHwgcHJvbWlzZSBpbnN0YW5jZW9mIFByb21pc2VBcnJheSkge1xuICAgICAgICAgICAgcHJvbWlzZS5fY2FuY2VsKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZWNlaXZlci5jYW5jZWwoKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBpZiAoIWlzUHJvbWlzZSkge1xuICAgICAgICAgICAgaGFuZGxlci5jYWxsKHJlY2VpdmVyLCB2YWx1ZSwgcHJvbWlzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoYXN5bmNHdWFyYW50ZWVkKSBwcm9taXNlLl9zZXRBc3luY0d1YXJhbnRlZWQoKTtcbiAgICAgICAgICAgIHRoaXMuX3NldHRsZVByb21pc2VGcm9tSGFuZGxlcihoYW5kbGVyLCByZWNlaXZlciwgdmFsdWUsIHByb21pc2UpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChyZWNlaXZlciBpbnN0YW5jZW9mIFByb3h5YWJsZSkge1xuICAgICAgICBpZiAoIXJlY2VpdmVyLl9pc1Jlc29sdmVkKCkpIHtcbiAgICAgICAgICAgIGlmICgoKGJpdEZpZWxkICYgMzM1NTQ0MzIpICE9PSAwKSkge1xuICAgICAgICAgICAgICAgIHJlY2VpdmVyLl9wcm9taXNlRnVsZmlsbGVkKHZhbHVlLCBwcm9taXNlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVjZWl2ZXIuX3Byb21pc2VSZWplY3RlZCh2YWx1ZSwgcHJvbWlzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzUHJvbWlzZSkge1xuICAgICAgICBpZiAoYXN5bmNHdWFyYW50ZWVkKSBwcm9taXNlLl9zZXRBc3luY0d1YXJhbnRlZWQoKTtcbiAgICAgICAgaWYgKCgoYml0RmllbGQgJiAzMzU1NDQzMikgIT09IDApKSB7XG4gICAgICAgICAgICBwcm9taXNlLl9mdWxmaWxsKHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHByb21pc2UuX3JlamVjdCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5fc2V0dGxlUHJvbWlzZUxhdGVDYW5jZWxsYXRpb25PYnNlcnZlciA9IGZ1bmN0aW9uKGN0eCkge1xuICAgIHZhciBoYW5kbGVyID0gY3R4LmhhbmRsZXI7XG4gICAgdmFyIHByb21pc2UgPSBjdHgucHJvbWlzZTtcbiAgICB2YXIgcmVjZWl2ZXIgPSBjdHgucmVjZWl2ZXI7XG4gICAgdmFyIHZhbHVlID0gY3R4LnZhbHVlO1xuICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGlmICghKHByb21pc2UgaW5zdGFuY2VvZiBQcm9taXNlKSkge1xuICAgICAgICAgICAgaGFuZGxlci5jYWxsKHJlY2VpdmVyLCB2YWx1ZSwgcHJvbWlzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9zZXR0bGVQcm9taXNlRnJvbUhhbmRsZXIoaGFuZGxlciwgcmVjZWl2ZXIsIHZhbHVlLCBwcm9taXNlKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAocHJvbWlzZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgcHJvbWlzZS5fcmVqZWN0KHZhbHVlKTtcbiAgICB9XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5fc2V0dGxlUHJvbWlzZUN0eCA9IGZ1bmN0aW9uKGN0eCkge1xuICAgIHRoaXMuX3NldHRsZVByb21pc2UoY3R4LnByb21pc2UsIGN0eC5oYW5kbGVyLCBjdHgucmVjZWl2ZXIsIGN0eC52YWx1ZSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5fc2V0dGxlUHJvbWlzZTAgPSBmdW5jdGlvbihoYW5kbGVyLCB2YWx1ZSwgYml0RmllbGQpIHtcbiAgICB2YXIgcHJvbWlzZSA9IHRoaXMuX3Byb21pc2UwO1xuICAgIHZhciByZWNlaXZlciA9IHRoaXMuX3JlY2VpdmVyQXQoMCk7XG4gICAgdGhpcy5fcHJvbWlzZTAgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fcmVjZWl2ZXIwID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX3NldHRsZVByb21pc2UocHJvbWlzZSwgaGFuZGxlciwgcmVjZWl2ZXIsIHZhbHVlKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLl9jbGVhckNhbGxiYWNrRGF0YUF0SW5kZXggPSBmdW5jdGlvbihpbmRleCkge1xuICAgIHZhciBiYXNlID0gaW5kZXggKiA0IC0gNDtcbiAgICB0aGlzW2Jhc2UgKyAyXSA9XG4gICAgdGhpc1tiYXNlICsgM10gPVxuICAgIHRoaXNbYmFzZSArIDBdID1cbiAgICB0aGlzW2Jhc2UgKyAxXSA9IHVuZGVmaW5lZDtcbn07XG5cblByb21pc2UucHJvdG90eXBlLl9mdWxmaWxsID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIGJpdEZpZWxkID0gdGhpcy5fYml0RmllbGQ7XG4gICAgaWYgKCgoYml0RmllbGQgJiAxMTc1MDYwNDgpID4+PiAxNikpIHJldHVybjtcbiAgICBpZiAodmFsdWUgPT09IHRoaXMpIHtcbiAgICAgICAgdmFyIGVyciA9IG1ha2VTZWxmUmVzb2x1dGlvbkVycm9yKCk7XG4gICAgICAgIHRoaXMuX2F0dGFjaEV4dHJhVHJhY2UoZXJyKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlamVjdChlcnIpO1xuICAgIH1cbiAgICB0aGlzLl9zZXRGdWxmaWxsZWQoKTtcbiAgICB0aGlzLl9yZWplY3Rpb25IYW5kbGVyMCA9IHZhbHVlO1xuXG4gICAgaWYgKChiaXRGaWVsZCAmIDY1NTM1KSA+IDApIHtcbiAgICAgICAgaWYgKCgoYml0RmllbGQgJiAxMzQyMTc3MjgpICE9PSAwKSkge1xuICAgICAgICAgICAgdGhpcy5fc2V0dGxlUHJvbWlzZXMoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFzeW5jLnNldHRsZVByb21pc2VzKHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuX3JlamVjdCA9IGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICB2YXIgYml0RmllbGQgPSB0aGlzLl9iaXRGaWVsZDtcbiAgICBpZiAoKChiaXRGaWVsZCAmIDExNzUwNjA0OCkgPj4+IDE2KSkgcmV0dXJuO1xuICAgIHRoaXMuX3NldFJlamVjdGVkKCk7XG4gICAgdGhpcy5fZnVsZmlsbG1lbnRIYW5kbGVyMCA9IHJlYXNvbjtcblxuICAgIGlmICh0aGlzLl9pc0ZpbmFsKCkpIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLmZhdGFsRXJyb3IocmVhc29uLCB1dGlsLmlzTm9kZSk7XG4gICAgfVxuXG4gICAgaWYgKChiaXRGaWVsZCAmIDY1NTM1KSA+IDApIHtcbiAgICAgICAgYXN5bmMuc2V0dGxlUHJvbWlzZXModGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fZW5zdXJlUG9zc2libGVSZWplY3Rpb25IYW5kbGVkKCk7XG4gICAgfVxufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuX2Z1bGZpbGxQcm9taXNlcyA9IGZ1bmN0aW9uIChsZW4sIHZhbHVlKSB7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBsZW47IGkrKykge1xuICAgICAgICB2YXIgaGFuZGxlciA9IHRoaXMuX2Z1bGZpbGxtZW50SGFuZGxlckF0KGkpO1xuICAgICAgICB2YXIgcHJvbWlzZSA9IHRoaXMuX3Byb21pc2VBdChpKTtcbiAgICAgICAgdmFyIHJlY2VpdmVyID0gdGhpcy5fcmVjZWl2ZXJBdChpKTtcbiAgICAgICAgdGhpcy5fY2xlYXJDYWxsYmFja0RhdGFBdEluZGV4KGkpO1xuICAgICAgICB0aGlzLl9zZXR0bGVQcm9taXNlKHByb21pc2UsIGhhbmRsZXIsIHJlY2VpdmVyLCB2YWx1ZSk7XG4gICAgfVxufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuX3JlamVjdFByb21pc2VzID0gZnVuY3Rpb24gKGxlbiwgcmVhc29uKSB7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBsZW47IGkrKykge1xuICAgICAgICB2YXIgaGFuZGxlciA9IHRoaXMuX3JlamVjdGlvbkhhbmRsZXJBdChpKTtcbiAgICAgICAgdmFyIHByb21pc2UgPSB0aGlzLl9wcm9taXNlQXQoaSk7XG4gICAgICAgIHZhciByZWNlaXZlciA9IHRoaXMuX3JlY2VpdmVyQXQoaSk7XG4gICAgICAgIHRoaXMuX2NsZWFyQ2FsbGJhY2tEYXRhQXRJbmRleChpKTtcbiAgICAgICAgdGhpcy5fc2V0dGxlUHJvbWlzZShwcm9taXNlLCBoYW5kbGVyLCByZWNlaXZlciwgcmVhc29uKTtcbiAgICB9XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5fc2V0dGxlUHJvbWlzZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGJpdEZpZWxkID0gdGhpcy5fYml0RmllbGQ7XG4gICAgdmFyIGxlbiA9IChiaXRGaWVsZCAmIDY1NTM1KTtcblxuICAgIGlmIChsZW4gPiAwKSB7XG4gICAgICAgIGlmICgoKGJpdEZpZWxkICYgMTY4NDI3NTIpICE9PSAwKSkge1xuICAgICAgICAgICAgdmFyIHJlYXNvbiA9IHRoaXMuX2Z1bGZpbGxtZW50SGFuZGxlcjA7XG4gICAgICAgICAgICB0aGlzLl9zZXR0bGVQcm9taXNlMCh0aGlzLl9yZWplY3Rpb25IYW5kbGVyMCwgcmVhc29uLCBiaXRGaWVsZCk7XG4gICAgICAgICAgICB0aGlzLl9yZWplY3RQcm9taXNlcyhsZW4sIHJlYXNvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLl9yZWplY3Rpb25IYW5kbGVyMDtcbiAgICAgICAgICAgIHRoaXMuX3NldHRsZVByb21pc2UwKHRoaXMuX2Z1bGZpbGxtZW50SGFuZGxlcjAsIHZhbHVlLCBiaXRGaWVsZCk7XG4gICAgICAgICAgICB0aGlzLl9mdWxmaWxsUHJvbWlzZXMobGVuLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc2V0TGVuZ3RoKDApO1xuICAgIH1cbiAgICB0aGlzLl9jbGVhckNhbmNlbGxhdGlvbkRhdGEoKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLl9zZXR0bGVkVmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYml0RmllbGQgPSB0aGlzLl9iaXRGaWVsZDtcbiAgICBpZiAoKChiaXRGaWVsZCAmIDMzNTU0NDMyKSAhPT0gMCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlamVjdGlvbkhhbmRsZXIwO1xuICAgIH0gZWxzZSBpZiAoKChiaXRGaWVsZCAmIDE2Nzc3MjE2KSAhPT0gMCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Z1bGZpbGxtZW50SGFuZGxlcjA7XG4gICAgfVxufTtcblxuZnVuY3Rpb24gZGVmZXJSZXNvbHZlKHYpIHt0aGlzLnByb21pc2UuX3Jlc29sdmVDYWxsYmFjayh2KTt9XG5mdW5jdGlvbiBkZWZlclJlamVjdCh2KSB7dGhpcy5wcm9taXNlLl9yZWplY3RDYWxsYmFjayh2LCBmYWxzZSk7fVxuXG5Qcm9taXNlLmRlZmVyID0gUHJvbWlzZS5wZW5kaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgZGVidWcuZGVwcmVjYXRlZChcIlByb21pc2UuZGVmZXJcIiwgXCJuZXcgUHJvbWlzZVwiKTtcbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKElOVEVSTkFMKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBwcm9taXNlOiBwcm9taXNlLFxuICAgICAgICByZXNvbHZlOiBkZWZlclJlc29sdmUsXG4gICAgICAgIHJlamVjdDogZGVmZXJSZWplY3RcbiAgICB9O1xufTtcblxudXRpbC5ub3RFbnVtZXJhYmxlUHJvcChQcm9taXNlLFxuICAgICAgICAgICAgICAgICAgICAgICBcIl9tYWtlU2VsZlJlc29sdXRpb25FcnJvclwiLFxuICAgICAgICAgICAgICAgICAgICAgICBtYWtlU2VsZlJlc29sdXRpb25FcnJvcik7XG5cbl9kZXJlcV8oXCIuL21ldGhvZFwiKShQcm9taXNlLCBJTlRFUk5BTCwgdHJ5Q29udmVydFRvUHJvbWlzZSwgYXBpUmVqZWN0aW9uLFxuICAgIGRlYnVnKTtcbl9kZXJlcV8oXCIuL2JpbmRcIikoUHJvbWlzZSwgSU5URVJOQUwsIHRyeUNvbnZlcnRUb1Byb21pc2UsIGRlYnVnKTtcbl9kZXJlcV8oXCIuL2NhbmNlbFwiKShQcm9taXNlLCBQcm9taXNlQXJyYXksIGFwaVJlamVjdGlvbiwgZGVidWcpO1xuX2RlcmVxXyhcIi4vZGlyZWN0X3Jlc29sdmVcIikoUHJvbWlzZSk7XG5fZGVyZXFfKFwiLi9zeW5jaHJvbm91c19pbnNwZWN0aW9uXCIpKFByb21pc2UpO1xuX2RlcmVxXyhcIi4vam9pblwiKShcbiAgICBQcm9taXNlLCBQcm9taXNlQXJyYXksIHRyeUNvbnZlcnRUb1Byb21pc2UsIElOVEVSTkFMLCBhc3luYywgZ2V0RG9tYWluKTtcblByb21pc2UuUHJvbWlzZSA9IFByb21pc2U7XG5Qcm9taXNlLnZlcnNpb24gPSBcIjMuNC42XCI7XG5fZGVyZXFfKCcuL21hcC5qcycpKFByb21pc2UsIFByb21pc2VBcnJheSwgYXBpUmVqZWN0aW9uLCB0cnlDb252ZXJ0VG9Qcm9taXNlLCBJTlRFUk5BTCwgZGVidWcpO1xuX2RlcmVxXygnLi9jYWxsX2dldC5qcycpKFByb21pc2UpO1xuX2RlcmVxXygnLi91c2luZy5qcycpKFByb21pc2UsIGFwaVJlamVjdGlvbiwgdHJ5Q29udmVydFRvUHJvbWlzZSwgY3JlYXRlQ29udGV4dCwgSU5URVJOQUwsIGRlYnVnKTtcbl9kZXJlcV8oJy4vdGltZXJzLmpzJykoUHJvbWlzZSwgSU5URVJOQUwsIGRlYnVnKTtcbl9kZXJlcV8oJy4vZ2VuZXJhdG9ycy5qcycpKFByb21pc2UsIGFwaVJlamVjdGlvbiwgSU5URVJOQUwsIHRyeUNvbnZlcnRUb1Byb21pc2UsIFByb3h5YWJsZSwgZGVidWcpO1xuX2RlcmVxXygnLi9ub2RlaWZ5LmpzJykoUHJvbWlzZSk7XG5fZGVyZXFfKCcuL3Byb21pc2lmeS5qcycpKFByb21pc2UsIElOVEVSTkFMKTtcbl9kZXJlcV8oJy4vcHJvcHMuanMnKShQcm9taXNlLCBQcm9taXNlQXJyYXksIHRyeUNvbnZlcnRUb1Byb21pc2UsIGFwaVJlamVjdGlvbik7XG5fZGVyZXFfKCcuL3JhY2UuanMnKShQcm9taXNlLCBJTlRFUk5BTCwgdHJ5Q29udmVydFRvUHJvbWlzZSwgYXBpUmVqZWN0aW9uKTtcbl9kZXJlcV8oJy4vcmVkdWNlLmpzJykoUHJvbWlzZSwgUHJvbWlzZUFycmF5LCBhcGlSZWplY3Rpb24sIHRyeUNvbnZlcnRUb1Byb21pc2UsIElOVEVSTkFMLCBkZWJ1Zyk7XG5fZGVyZXFfKCcuL3NldHRsZS5qcycpKFByb21pc2UsIFByb21pc2VBcnJheSwgZGVidWcpO1xuX2RlcmVxXygnLi9zb21lLmpzJykoUHJvbWlzZSwgUHJvbWlzZUFycmF5LCBhcGlSZWplY3Rpb24pO1xuX2RlcmVxXygnLi9maWx0ZXIuanMnKShQcm9taXNlLCBJTlRFUk5BTCk7XG5fZGVyZXFfKCcuL2VhY2guanMnKShQcm9taXNlLCBJTlRFUk5BTCk7XG5fZGVyZXFfKCcuL2FueS5qcycpKFByb21pc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgdXRpbC50b0Zhc3RQcm9wZXJ0aWVzKFByb21pc2UpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIHV0aWwudG9GYXN0UHJvcGVydGllcyhQcm9taXNlLnByb3RvdHlwZSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBmdW5jdGlvbiBmaWxsVHlwZXModmFsdWUpIHsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHZhciBwID0gbmV3IFByb21pc2UoSU5URVJOQUwpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBwLl9mdWxmaWxsbWVudEhhbmRsZXIwID0gdmFsdWU7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgcC5fcmVqZWN0aW9uSGFuZGxlcjAgPSB2YWx1ZTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHAuX3Byb21pc2UwID0gdmFsdWU7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBwLl9yZWNlaXZlcjAgPSB2YWx1ZTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICB9ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgLy8gQ29tcGxldGUgc2xhY2sgdHJhY2tpbmcsIG9wdCBvdXQgb2YgZmllbGQtdHlwZSB0cmFja2luZyBhbmQgICAgICAgICAgIFxuICAgIC8vIHN0YWJpbGl6ZSBtYXAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBmaWxsVHlwZXMoe2E6IDF9KTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgZmlsbFR5cGVzKHtiOiAyfSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIGZpbGxUeXBlcyh7YzogM30pOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBmaWxsVHlwZXMoMSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgZmlsbFR5cGVzKGZ1bmN0aW9uKCl7fSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIGZpbGxUeXBlcyh1bmRlZmluZWQpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBmaWxsVHlwZXMoZmFsc2UpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgZmlsbFR5cGVzKG5ldyBQcm9taXNlKElOVEVSTkFMKSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIGRlYnVnLnNldEJvdW5kcyhBc3luYy5maXJzdExpbmVFcnJvciwgdXRpbC5sYXN0TGluZUVycm9yKTsgICAgICAgICAgICAgICBcbiAgICByZXR1cm4gUHJvbWlzZTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5cbn07XG5cbn0se1wiLi9hbnkuanNcIjoxLFwiLi9hc3luY1wiOjIsXCIuL2JpbmRcIjozLFwiLi9jYWxsX2dldC5qc1wiOjUsXCIuL2NhbmNlbFwiOjYsXCIuL2NhdGNoX2ZpbHRlclwiOjcsXCIuL2NvbnRleHRcIjo4LFwiLi9kZWJ1Z2dhYmlsaXR5XCI6OSxcIi4vZGlyZWN0X3Jlc29sdmVcIjoxMCxcIi4vZWFjaC5qc1wiOjExLFwiLi9lcnJvcnNcIjoxMixcIi4vZXM1XCI6MTMsXCIuL2ZpbHRlci5qc1wiOjE0LFwiLi9maW5hbGx5XCI6MTUsXCIuL2dlbmVyYXRvcnMuanNcIjoxNixcIi4vam9pblwiOjE3LFwiLi9tYXAuanNcIjoxOCxcIi4vbWV0aG9kXCI6MTksXCIuL25vZGViYWNrXCI6MjAsXCIuL25vZGVpZnkuanNcIjoyMSxcIi4vcHJvbWlzZV9hcnJheVwiOjIzLFwiLi9wcm9taXNpZnkuanNcIjoyNCxcIi4vcHJvcHMuanNcIjoyNSxcIi4vcmFjZS5qc1wiOjI3LFwiLi9yZWR1Y2UuanNcIjoyOCxcIi4vc2V0dGxlLmpzXCI6MzAsXCIuL3NvbWUuanNcIjozMSxcIi4vc3luY2hyb25vdXNfaW5zcGVjdGlvblwiOjMyLFwiLi90aGVuYWJsZXNcIjozMyxcIi4vdGltZXJzLmpzXCI6MzQsXCIuL3VzaW5nLmpzXCI6MzUsXCIuL3V0aWxcIjozNn1dLDIzOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcblwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihQcm9taXNlLCBJTlRFUk5BTCwgdHJ5Q29udmVydFRvUHJvbWlzZSxcbiAgICBhcGlSZWplY3Rpb24sIFByb3h5YWJsZSkge1xudmFyIHV0aWwgPSBfZGVyZXFfKFwiLi91dGlsXCIpO1xudmFyIGlzQXJyYXkgPSB1dGlsLmlzQXJyYXk7XG5cbmZ1bmN0aW9uIHRvUmVzb2x1dGlvblZhbHVlKHZhbCkge1xuICAgIHN3aXRjaCh2YWwpIHtcbiAgICBjYXNlIC0yOiByZXR1cm4gW107XG4gICAgY2FzZSAtMzogcmV0dXJuIHt9O1xuICAgIH1cbn1cblxuZnVuY3Rpb24gUHJvbWlzZUFycmF5KHZhbHVlcykge1xuICAgIHZhciBwcm9taXNlID0gdGhpcy5fcHJvbWlzZSA9IG5ldyBQcm9taXNlKElOVEVSTkFMKTtcbiAgICBpZiAodmFsdWVzIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICBwcm9taXNlLl9wcm9wYWdhdGVGcm9tKHZhbHVlcywgMyk7XG4gICAgfVxuICAgIHByb21pc2UuX3NldE9uQ2FuY2VsKHRoaXMpO1xuICAgIHRoaXMuX3ZhbHVlcyA9IHZhbHVlcztcbiAgICB0aGlzLl9sZW5ndGggPSAwO1xuICAgIHRoaXMuX3RvdGFsUmVzb2x2ZWQgPSAwO1xuICAgIHRoaXMuX2luaXQodW5kZWZpbmVkLCAtMik7XG59XG51dGlsLmluaGVyaXRzKFByb21pc2VBcnJheSwgUHJveHlhYmxlKTtcblxuUHJvbWlzZUFycmF5LnByb3RvdHlwZS5sZW5ndGggPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xlbmd0aDtcbn07XG5cblByb21pc2VBcnJheS5wcm90b3R5cGUucHJvbWlzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvbWlzZTtcbn07XG5cblByb21pc2VBcnJheS5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbiBpbml0KF8sIHJlc29sdmVWYWx1ZUlmRW1wdHkpIHtcbiAgICB2YXIgdmFsdWVzID0gdHJ5Q29udmVydFRvUHJvbWlzZSh0aGlzLl92YWx1ZXMsIHRoaXMuX3Byb21pc2UpO1xuICAgIGlmICh2YWx1ZXMgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgIHZhbHVlcyA9IHZhbHVlcy5fdGFyZ2V0KCk7XG4gICAgICAgIHZhciBiaXRGaWVsZCA9IHZhbHVlcy5fYml0RmllbGQ7XG4gICAgICAgIDtcbiAgICAgICAgdGhpcy5fdmFsdWVzID0gdmFsdWVzO1xuXG4gICAgICAgIGlmICgoKGJpdEZpZWxkICYgNTAzOTcxODQpID09PSAwKSkge1xuICAgICAgICAgICAgdGhpcy5fcHJvbWlzZS5fc2V0QXN5bmNHdWFyYW50ZWVkKCk7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVzLl90aGVuKFxuICAgICAgICAgICAgICAgIGluaXQsXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVqZWN0LFxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgICAgIHJlc29sdmVWYWx1ZUlmRW1wdHlcbiAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICgoKGJpdEZpZWxkICYgMzM1NTQ0MzIpICE9PSAwKSkge1xuICAgICAgICAgICAgdmFsdWVzID0gdmFsdWVzLl92YWx1ZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKCgoYml0RmllbGQgJiAxNjc3NzIxNikgIT09IDApKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcmVqZWN0KHZhbHVlcy5fcmVhc29uKCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NhbmNlbCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHZhbHVlcyA9IHV0aWwuYXNBcnJheSh2YWx1ZXMpO1xuICAgIGlmICh2YWx1ZXMgPT09IG51bGwpIHtcbiAgICAgICAgdmFyIGVyciA9IGFwaVJlamVjdGlvbihcbiAgICAgICAgICAgIFwiZXhwZWN0aW5nIGFuIGFycmF5IG9yIGFuIGl0ZXJhYmxlIG9iamVjdCBidXQgZ290IFwiICsgdXRpbC5jbGFzc1N0cmluZyh2YWx1ZXMpKS5yZWFzb24oKTtcbiAgICAgICAgdGhpcy5fcHJvbWlzZS5fcmVqZWN0Q2FsbGJhY2soZXJyLCBmYWxzZSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodmFsdWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBpZiAocmVzb2x2ZVZhbHVlSWZFbXB0eSA9PT0gLTUpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jlc29sdmVFbXB0eUFycmF5KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9yZXNvbHZlKHRvUmVzb2x1dGlvblZhbHVlKHJlc29sdmVWYWx1ZUlmRW1wdHkpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2l0ZXJhdGUodmFsdWVzKTtcbn07XG5cblByb21pc2VBcnJheS5wcm90b3R5cGUuX2l0ZXJhdGUgPSBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICB2YXIgbGVuID0gdGhpcy5nZXRBY3R1YWxMZW5ndGgodmFsdWVzLmxlbmd0aCk7XG4gICAgdGhpcy5fbGVuZ3RoID0gbGVuO1xuICAgIHRoaXMuX3ZhbHVlcyA9IHRoaXMuc2hvdWxkQ29weVZhbHVlcygpID8gbmV3IEFycmF5KGxlbikgOiB0aGlzLl92YWx1ZXM7XG4gICAgdmFyIHJlc3VsdCA9IHRoaXMuX3Byb21pc2U7XG4gICAgdmFyIGlzUmVzb2x2ZWQgPSBmYWxzZTtcbiAgICB2YXIgYml0RmllbGQgPSBudWxsO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgICAgdmFyIG1heWJlUHJvbWlzZSA9IHRyeUNvbnZlcnRUb1Byb21pc2UodmFsdWVzW2ldLCByZXN1bHQpO1xuXG4gICAgICAgIGlmIChtYXliZVByb21pc2UgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICBtYXliZVByb21pc2UgPSBtYXliZVByb21pc2UuX3RhcmdldCgpO1xuICAgICAgICAgICAgYml0RmllbGQgPSBtYXliZVByb21pc2UuX2JpdEZpZWxkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYml0RmllbGQgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzUmVzb2x2ZWQpIHtcbiAgICAgICAgICAgIGlmIChiaXRGaWVsZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG1heWJlUHJvbWlzZS5zdXBwcmVzc1VuaGFuZGxlZFJlamVjdGlvbnMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChiaXRGaWVsZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKCgoYml0RmllbGQgJiA1MDM5NzE4NCkgPT09IDApKSB7XG4gICAgICAgICAgICAgICAgbWF5YmVQcm9taXNlLl9wcm94eSh0aGlzLCBpKTtcbiAgICAgICAgICAgICAgICB0aGlzLl92YWx1ZXNbaV0gPSBtYXliZVByb21pc2U7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCgoYml0RmllbGQgJiAzMzU1NDQzMikgIT09IDApKSB7XG4gICAgICAgICAgICAgICAgaXNSZXNvbHZlZCA9IHRoaXMuX3Byb21pc2VGdWxmaWxsZWQobWF5YmVQcm9taXNlLl92YWx1ZSgpLCBpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoKChiaXRGaWVsZCAmIDE2Nzc3MjE2KSAhPT0gMCkpIHtcbiAgICAgICAgICAgICAgICBpc1Jlc29sdmVkID0gdGhpcy5fcHJvbWlzZVJlamVjdGVkKG1heWJlUHJvbWlzZS5fcmVhc29uKCksIGkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpc1Jlc29sdmVkID0gdGhpcy5fcHJvbWlzZUNhbmNlbGxlZChpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlzUmVzb2x2ZWQgPSB0aGlzLl9wcm9taXNlRnVsZmlsbGVkKG1heWJlUHJvbWlzZSwgaSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFpc1Jlc29sdmVkKSByZXN1bHQuX3NldEFzeW5jR3VhcmFudGVlZCgpO1xufTtcblxuUHJvbWlzZUFycmF5LnByb3RvdHlwZS5faXNSZXNvbHZlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fdmFsdWVzID09PSBudWxsO1xufTtcblxuUHJvbWlzZUFycmF5LnByb3RvdHlwZS5fcmVzb2x2ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHRoaXMuX3ZhbHVlcyA9IG51bGw7XG4gICAgdGhpcy5fcHJvbWlzZS5fZnVsZmlsbCh2YWx1ZSk7XG59O1xuXG5Qcm9taXNlQXJyYXkucHJvdG90eXBlLl9jYW5jZWwgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5faXNSZXNvbHZlZCgpIHx8ICF0aGlzLl9wcm9taXNlLl9pc0NhbmNlbGxhYmxlKCkpIHJldHVybjtcbiAgICB0aGlzLl92YWx1ZXMgPSBudWxsO1xuICAgIHRoaXMuX3Byb21pc2UuX2NhbmNlbCgpO1xufTtcblxuUHJvbWlzZUFycmF5LnByb3RvdHlwZS5fcmVqZWN0ID0gZnVuY3Rpb24gKHJlYXNvbikge1xuICAgIHRoaXMuX3ZhbHVlcyA9IG51bGw7XG4gICAgdGhpcy5fcHJvbWlzZS5fcmVqZWN0Q2FsbGJhY2socmVhc29uLCBmYWxzZSk7XG59O1xuXG5Qcm9taXNlQXJyYXkucHJvdG90eXBlLl9wcm9taXNlRnVsZmlsbGVkID0gZnVuY3Rpb24gKHZhbHVlLCBpbmRleCkge1xuICAgIHRoaXMuX3ZhbHVlc1tpbmRleF0gPSB2YWx1ZTtcbiAgICB2YXIgdG90YWxSZXNvbHZlZCA9ICsrdGhpcy5fdG90YWxSZXNvbHZlZDtcbiAgICBpZiAodG90YWxSZXNvbHZlZCA+PSB0aGlzLl9sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5fcmVzb2x2ZSh0aGlzLl92YWx1ZXMpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuUHJvbWlzZUFycmF5LnByb3RvdHlwZS5fcHJvbWlzZUNhbmNlbGxlZCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2NhbmNlbCgpO1xuICAgIHJldHVybiB0cnVlO1xufTtcblxuUHJvbWlzZUFycmF5LnByb3RvdHlwZS5fcHJvbWlzZVJlamVjdGVkID0gZnVuY3Rpb24gKHJlYXNvbikge1xuICAgIHRoaXMuX3RvdGFsUmVzb2x2ZWQrKztcbiAgICB0aGlzLl9yZWplY3QocmVhc29uKTtcbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cblByb21pc2VBcnJheS5wcm90b3R5cGUuX3Jlc3VsdENhbmNlbGxlZCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9pc1Jlc29sdmVkKCkpIHJldHVybjtcbiAgICB2YXIgdmFsdWVzID0gdGhpcy5fdmFsdWVzO1xuICAgIHRoaXMuX2NhbmNlbCgpO1xuICAgIGlmICh2YWx1ZXMgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgIHZhbHVlcy5jYW5jZWwoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlc1tpXSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZXNbaV0uY2FuY2VsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5Qcm9taXNlQXJyYXkucHJvdG90eXBlLnNob3VsZENvcHlWYWx1ZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG5Qcm9taXNlQXJyYXkucHJvdG90eXBlLmdldEFjdHVhbExlbmd0aCA9IGZ1bmN0aW9uIChsZW4pIHtcbiAgICByZXR1cm4gbGVuO1xufTtcblxucmV0dXJuIFByb21pc2VBcnJheTtcbn07XG5cbn0se1wiLi91dGlsXCI6MzZ9XSwyNDpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG5cInVzZSBzdHJpY3RcIjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oUHJvbWlzZSwgSU5URVJOQUwpIHtcbnZhciBUSElTID0ge307XG52YXIgdXRpbCA9IF9kZXJlcV8oXCIuL3V0aWxcIik7XG52YXIgbm9kZWJhY2tGb3JQcm9taXNlID0gX2RlcmVxXyhcIi4vbm9kZWJhY2tcIik7XG52YXIgd2l0aEFwcGVuZGVkID0gdXRpbC53aXRoQXBwZW5kZWQ7XG52YXIgbWF5YmVXcmFwQXNFcnJvciA9IHV0aWwubWF5YmVXcmFwQXNFcnJvcjtcbnZhciBjYW5FdmFsdWF0ZSA9IHV0aWwuY2FuRXZhbHVhdGU7XG52YXIgVHlwZUVycm9yID0gX2RlcmVxXyhcIi4vZXJyb3JzXCIpLlR5cGVFcnJvcjtcbnZhciBkZWZhdWx0U3VmZml4ID0gXCJBc3luY1wiO1xudmFyIGRlZmF1bHRQcm9taXNpZmllZCA9IHtfX2lzUHJvbWlzaWZpZWRfXzogdHJ1ZX07XG52YXIgbm9Db3B5UHJvcHMgPSBbXG4gICAgXCJhcml0eVwiLCAgICBcImxlbmd0aFwiLFxuICAgIFwibmFtZVwiLFxuICAgIFwiYXJndW1lbnRzXCIsXG4gICAgXCJjYWxsZXJcIixcbiAgICBcImNhbGxlZVwiLFxuICAgIFwicHJvdG90eXBlXCIsXG4gICAgXCJfX2lzUHJvbWlzaWZpZWRfX1wiXG5dO1xudmFyIG5vQ29weVByb3BzUGF0dGVybiA9IG5ldyBSZWdFeHAoXCJeKD86XCIgKyBub0NvcHlQcm9wcy5qb2luKFwifFwiKSArIFwiKSRcIik7XG5cbnZhciBkZWZhdWx0RmlsdGVyID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB1dGlsLmlzSWRlbnRpZmllcihuYW1lKSAmJlxuICAgICAgICBuYW1lLmNoYXJBdCgwKSAhPT0gXCJfXCIgJiZcbiAgICAgICAgbmFtZSAhPT0gXCJjb25zdHJ1Y3RvclwiO1xufTtcblxuZnVuY3Rpb24gcHJvcHNGaWx0ZXIoa2V5KSB7XG4gICAgcmV0dXJuICFub0NvcHlQcm9wc1BhdHRlcm4udGVzdChrZXkpO1xufVxuXG5mdW5jdGlvbiBpc1Byb21pc2lmaWVkKGZuKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGZuLl9faXNQcm9taXNpZmllZF9fID09PSB0cnVlO1xuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBoYXNQcm9taXNpZmllZChvYmosIGtleSwgc3VmZml4KSB7XG4gICAgdmFyIHZhbCA9IHV0aWwuZ2V0RGF0YVByb3BlcnR5T3JEZWZhdWx0KG9iaiwga2V5ICsgc3VmZml4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0UHJvbWlzaWZpZWQpO1xuICAgIHJldHVybiB2YWwgPyBpc1Byb21pc2lmaWVkKHZhbCkgOiBmYWxzZTtcbn1cbmZ1bmN0aW9uIGNoZWNrVmFsaWQocmV0LCBzdWZmaXgsIHN1ZmZpeFJlZ2V4cCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmV0Lmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICAgIHZhciBrZXkgPSByZXRbaV07XG4gICAgICAgIGlmIChzdWZmaXhSZWdleHAudGVzdChrZXkpKSB7XG4gICAgICAgICAgICB2YXIga2V5V2l0aG91dEFzeW5jU3VmZml4ID0ga2V5LnJlcGxhY2Uoc3VmZml4UmVnZXhwLCBcIlwiKTtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcmV0Lmxlbmd0aDsgaiArPSAyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJldFtqXSA9PT0ga2V5V2l0aG91dEFzeW5jU3VmZml4KSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgcHJvbWlzaWZ5IGFuIEFQSSB0aGF0IGhhcyBub3JtYWwgbWV0aG9kcyB3aXRoICclcyctc3VmZml4XFx1MDAwYVxcdTAwMGEgICAgU2VlIGh0dHA6Ly9nb28uZ2wvTXFyRm1YXFx1MDAwYVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZShcIiVzXCIsIHN1ZmZpeCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gcHJvbWlzaWZpYWJsZU1ldGhvZHMob2JqLCBzdWZmaXgsIHN1ZmZpeFJlZ2V4cCwgZmlsdGVyKSB7XG4gICAgdmFyIGtleXMgPSB1dGlsLmluaGVyaXRlZERhdGFLZXlzKG9iaik7XG4gICAgdmFyIHJldCA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgdmFyIHZhbHVlID0gb2JqW2tleV07XG4gICAgICAgIHZhciBwYXNzZXNEZWZhdWx0RmlsdGVyID0gZmlsdGVyID09PSBkZWZhdWx0RmlsdGVyXG4gICAgICAgICAgICA/IHRydWUgOiBkZWZhdWx0RmlsdGVyKGtleSwgdmFsdWUsIG9iaik7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIiAmJlxuICAgICAgICAgICAgIWlzUHJvbWlzaWZpZWQodmFsdWUpICYmXG4gICAgICAgICAgICAhaGFzUHJvbWlzaWZpZWQob2JqLCBrZXksIHN1ZmZpeCkgJiZcbiAgICAgICAgICAgIGZpbHRlcihrZXksIHZhbHVlLCBvYmosIHBhc3Nlc0RlZmF1bHRGaWx0ZXIpKSB7XG4gICAgICAgICAgICByZXQucHVzaChrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjaGVja1ZhbGlkKHJldCwgc3VmZml4LCBzdWZmaXhSZWdleHApO1xuICAgIHJldHVybiByZXQ7XG59XG5cbnZhciBlc2NhcGVJZGVudFJlZ2V4ID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8oWyRdKS8sIFwiXFxcXCRcIik7XG59O1xuXG52YXIgbWFrZU5vZGVQcm9taXNpZmllZEV2YWw7XG5pZiAoIXRydWUpIHtcbnZhciBzd2l0Y2hDYXNlQXJndW1lbnRPcmRlciA9IGZ1bmN0aW9uKGxpa2VseUFyZ3VtZW50Q291bnQpIHtcbiAgICB2YXIgcmV0ID0gW2xpa2VseUFyZ3VtZW50Q291bnRdO1xuICAgIHZhciBtaW4gPSBNYXRoLm1heCgwLCBsaWtlbHlBcmd1bWVudENvdW50IC0gMSAtIDMpO1xuICAgIGZvcih2YXIgaSA9IGxpa2VseUFyZ3VtZW50Q291bnQgLSAxOyBpID49IG1pbjsgLS1pKSB7XG4gICAgICAgIHJldC5wdXNoKGkpO1xuICAgIH1cbiAgICBmb3IodmFyIGkgPSBsaWtlbHlBcmd1bWVudENvdW50ICsgMTsgaSA8PSAzOyArK2kpIHtcbiAgICAgICAgcmV0LnB1c2goaSk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG59O1xuXG52YXIgYXJndW1lbnRTZXF1ZW5jZSA9IGZ1bmN0aW9uKGFyZ3VtZW50Q291bnQpIHtcbiAgICByZXR1cm4gdXRpbC5maWxsZWRSYW5nZShhcmd1bWVudENvdW50LCBcIl9hcmdcIiwgXCJcIik7XG59O1xuXG52YXIgcGFyYW1ldGVyRGVjbGFyYXRpb24gPSBmdW5jdGlvbihwYXJhbWV0ZXJDb3VudCkge1xuICAgIHJldHVybiB1dGlsLmZpbGxlZFJhbmdlKFxuICAgICAgICBNYXRoLm1heChwYXJhbWV0ZXJDb3VudCwgMyksIFwiX2FyZ1wiLCBcIlwiKTtcbn07XG5cbnZhciBwYXJhbWV0ZXJDb3VudCA9IGZ1bmN0aW9uKGZuKSB7XG4gICAgaWYgKHR5cGVvZiBmbi5sZW5ndGggPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KE1hdGgubWluKGZuLmxlbmd0aCwgMTAyMyArIDEpLCAwKTtcbiAgICB9XG4gICAgcmV0dXJuIDA7XG59O1xuXG5tYWtlTm9kZVByb21pc2lmaWVkRXZhbCA9XG5mdW5jdGlvbihjYWxsYmFjaywgcmVjZWl2ZXIsIG9yaWdpbmFsTmFtZSwgZm4sIF8sIG11bHRpQXJncykge1xuICAgIHZhciBuZXdQYXJhbWV0ZXJDb3VudCA9IE1hdGgubWF4KDAsIHBhcmFtZXRlckNvdW50KGZuKSAtIDEpO1xuICAgIHZhciBhcmd1bWVudE9yZGVyID0gc3dpdGNoQ2FzZUFyZ3VtZW50T3JkZXIobmV3UGFyYW1ldGVyQ291bnQpO1xuICAgIHZhciBzaG91bGRQcm94eVRoaXMgPSB0eXBlb2YgY2FsbGJhY2sgPT09IFwic3RyaW5nXCIgfHwgcmVjZWl2ZXIgPT09IFRISVM7XG5cbiAgICBmdW5jdGlvbiBnZW5lcmF0ZUNhbGxGb3JBcmd1bWVudENvdW50KGNvdW50KSB7XG4gICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRTZXF1ZW5jZShjb3VudCkuam9pbihcIiwgXCIpO1xuICAgICAgICB2YXIgY29tbWEgPSBjb3VudCA+IDAgPyBcIiwgXCIgOiBcIlwiO1xuICAgICAgICB2YXIgcmV0O1xuICAgICAgICBpZiAoc2hvdWxkUHJveHlUaGlzKSB7XG4gICAgICAgICAgICByZXQgPSBcInJldCA9IGNhbGxiYWNrLmNhbGwodGhpcywge3thcmdzfX0sIG5vZGViYWNrKTsgYnJlYWs7XFxuXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXQgPSByZWNlaXZlciA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgPyBcInJldCA9IGNhbGxiYWNrKHt7YXJnc319LCBub2RlYmFjayk7IGJyZWFrO1xcblwiXG4gICAgICAgICAgICAgICAgOiBcInJldCA9IGNhbGxiYWNrLmNhbGwocmVjZWl2ZXIsIHt7YXJnc319LCBub2RlYmFjayk7IGJyZWFrO1xcblwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQucmVwbGFjZShcInt7YXJnc319XCIsIGFyZ3MpLnJlcGxhY2UoXCIsIFwiLCBjb21tYSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2VuZXJhdGVBcmd1bWVudFN3aXRjaENhc2UoKSB7XG4gICAgICAgIHZhciByZXQgPSBcIlwiO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50T3JkZXIubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHJldCArPSBcImNhc2UgXCIgKyBhcmd1bWVudE9yZGVyW2ldICtcIjpcIiArXG4gICAgICAgICAgICAgICAgZ2VuZXJhdGVDYWxsRm9yQXJndW1lbnRDb3VudChhcmd1bWVudE9yZGVyW2ldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldCArPSBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICBkZWZhdWx0OiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkobGVuICsgMSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgdmFyIGkgPSAwOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkgeyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgfSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgYXJnc1tpXSA9IG5vZGViYWNrOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgW0NvZGVGb3JDYWxsXSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgYnJlYWs7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICBcIi5yZXBsYWNlKFwiW0NvZGVGb3JDYWxsXVwiLCAoc2hvdWxkUHJveHlUaGlzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gXCJyZXQgPSBjYWxsYmFjay5hcHBseSh0aGlzLCBhcmdzKTtcXG5cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFwicmV0ID0gY2FsbGJhY2suYXBwbHkocmVjZWl2ZXIsIGFyZ3MpO1xcblwiKSk7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgdmFyIGdldEZ1bmN0aW9uQ29kZSA9IHR5cGVvZiBjYWxsYmFjayA9PT0gXCJzdHJpbmdcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IChcInRoaXMgIT0gbnVsbCA/IHRoaXNbJ1wiK2NhbGxiYWNrK1wiJ10gOiBmblwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFwiZm5cIjtcbiAgICB2YXIgYm9keSA9IFwiJ3VzZSBzdHJpY3QnOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcblxcXG4gICAgICAgIHZhciByZXQgPSBmdW5jdGlvbiAoUGFyYW1ldGVycykgeyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcblxcXG4gICAgICAgICAgICAndXNlIHN0cmljdCc7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcblxcXG4gICAgICAgICAgICB2YXIgbGVuID0gYXJndW1lbnRzLmxlbmd0aDsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcblxcXG4gICAgICAgICAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKElOVEVSTkFMKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcblxcXG4gICAgICAgICAgICBwcm9taXNlLl9jYXB0dXJlU3RhY2tUcmFjZSgpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcblxcXG4gICAgICAgICAgICB2YXIgbm9kZWJhY2sgPSBub2RlYmFja0ZvclByb21pc2UocHJvbWlzZSwgXCIgKyBtdWx0aUFyZ3MgKyBcIik7ICAgXFxuXFxcbiAgICAgICAgICAgIHZhciByZXQ7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuXFxcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IHRyeUNhdGNoKFtHZXRGdW5jdGlvbkNvZGVdKTsgICAgICAgICAgICAgICAgICAgICAgXFxuXFxcbiAgICAgICAgICAgIHN3aXRjaChsZW4pIHsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuXFxcbiAgICAgICAgICAgICAgICBbQ29kZUZvclN3aXRjaENhc2VdICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuXFxcbiAgICAgICAgICAgIH0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuXFxcbiAgICAgICAgICAgIGlmIChyZXQgPT09IGVycm9yT2JqKSB7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuXFxcbiAgICAgICAgICAgICAgICBwcm9taXNlLl9yZWplY3RDYWxsYmFjayhtYXliZVdyYXBBc0Vycm9yKHJldC5lKSwgdHJ1ZSwgdHJ1ZSk7XFxuXFxcbiAgICAgICAgICAgIH0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuXFxcbiAgICAgICAgICAgIGlmICghcHJvbWlzZS5faXNGYXRlU2VhbGVkKCkpIHByb21pc2UuX3NldEFzeW5jR3VhcmFudGVlZCgpOyAgICAgXFxuXFxcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuXFxcbiAgICAgICAgfTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuXFxcbiAgICAgICAgbm90RW51bWVyYWJsZVByb3AocmV0LCAnX19pc1Byb21pc2lmaWVkX18nLCB0cnVlKTsgICAgICAgICAgICAgICAgICAgXFxuXFxcbiAgICAgICAgcmV0dXJuIHJldDsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuXFxcbiAgICBcIi5yZXBsYWNlKFwiW0NvZGVGb3JTd2l0Y2hDYXNlXVwiLCBnZW5lcmF0ZUFyZ3VtZW50U3dpdGNoQ2FzZSgpKVxuICAgICAgICAucmVwbGFjZShcIltHZXRGdW5jdGlvbkNvZGVdXCIsIGdldEZ1bmN0aW9uQ29kZSk7XG4gICAgYm9keSA9IGJvZHkucmVwbGFjZShcIlBhcmFtZXRlcnNcIiwgcGFyYW1ldGVyRGVjbGFyYXRpb24obmV3UGFyYW1ldGVyQ291bnQpKTtcbiAgICByZXR1cm4gbmV3IEZ1bmN0aW9uKFwiUHJvbWlzZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJmblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWNlaXZlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ3aXRoQXBwZW5kZWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibWF5YmVXcmFwQXNFcnJvclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJub2RlYmFja0ZvclByb21pc2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHJ5Q2F0Y2hcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZXJyb3JPYmpcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibm90RW51bWVyYWJsZVByb3BcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiSU5URVJOQUxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHkpKFxuICAgICAgICAgICAgICAgICAgICBQcm9taXNlLFxuICAgICAgICAgICAgICAgICAgICBmbixcbiAgICAgICAgICAgICAgICAgICAgcmVjZWl2ZXIsXG4gICAgICAgICAgICAgICAgICAgIHdpdGhBcHBlbmRlZCxcbiAgICAgICAgICAgICAgICAgICAgbWF5YmVXcmFwQXNFcnJvcixcbiAgICAgICAgICAgICAgICAgICAgbm9kZWJhY2tGb3JQcm9taXNlLFxuICAgICAgICAgICAgICAgICAgICB1dGlsLnRyeUNhdGNoLFxuICAgICAgICAgICAgICAgICAgICB1dGlsLmVycm9yT2JqLFxuICAgICAgICAgICAgICAgICAgICB1dGlsLm5vdEVudW1lcmFibGVQcm9wLFxuICAgICAgICAgICAgICAgICAgICBJTlRFUk5BTCk7XG59O1xufVxuXG5mdW5jdGlvbiBtYWtlTm9kZVByb21pc2lmaWVkQ2xvc3VyZShjYWxsYmFjaywgcmVjZWl2ZXIsIF8sIGZuLCBfXywgbXVsdGlBcmdzKSB7XG4gICAgdmFyIGRlZmF1bHRUaGlzID0gKGZ1bmN0aW9uKCkge3JldHVybiB0aGlzO30pKCk7XG4gICAgdmFyIG1ldGhvZCA9IGNhbGxiYWNrO1xuICAgIGlmICh0eXBlb2YgbWV0aG9kID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGNhbGxiYWNrID0gZm47XG4gICAgfVxuICAgIGZ1bmN0aW9uIHByb21pc2lmaWVkKCkge1xuICAgICAgICB2YXIgX3JlY2VpdmVyID0gcmVjZWl2ZXI7XG4gICAgICAgIGlmIChyZWNlaXZlciA9PT0gVEhJUykgX3JlY2VpdmVyID0gdGhpcztcbiAgICAgICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShJTlRFUk5BTCk7XG4gICAgICAgIHByb21pc2UuX2NhcHR1cmVTdGFja1RyYWNlKCk7XG4gICAgICAgIHZhciBjYiA9IHR5cGVvZiBtZXRob2QgPT09IFwic3RyaW5nXCIgJiYgdGhpcyAhPT0gZGVmYXVsdFRoaXNcbiAgICAgICAgICAgID8gdGhpc1ttZXRob2RdIDogY2FsbGJhY2s7XG4gICAgICAgIHZhciBmbiA9IG5vZGViYWNrRm9yUHJvbWlzZShwcm9taXNlLCBtdWx0aUFyZ3MpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY2IuYXBwbHkoX3JlY2VpdmVyLCB3aXRoQXBwZW5kZWQoYXJndW1lbnRzLCBmbikpO1xuICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICAgIHByb21pc2UuX3JlamVjdENhbGxiYWNrKG1heWJlV3JhcEFzRXJyb3IoZSksIHRydWUsIHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcHJvbWlzZS5faXNGYXRlU2VhbGVkKCkpIHByb21pc2UuX3NldEFzeW5jR3VhcmFudGVlZCgpO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG4gICAgdXRpbC5ub3RFbnVtZXJhYmxlUHJvcChwcm9taXNpZmllZCwgXCJfX2lzUHJvbWlzaWZpZWRfX1wiLCB0cnVlKTtcbiAgICByZXR1cm4gcHJvbWlzaWZpZWQ7XG59XG5cbnZhciBtYWtlTm9kZVByb21pc2lmaWVkID0gY2FuRXZhbHVhdGVcbiAgICA/IG1ha2VOb2RlUHJvbWlzaWZpZWRFdmFsXG4gICAgOiBtYWtlTm9kZVByb21pc2lmaWVkQ2xvc3VyZTtcblxuZnVuY3Rpb24gcHJvbWlzaWZ5QWxsKG9iaiwgc3VmZml4LCBmaWx0ZXIsIHByb21pc2lmaWVyLCBtdWx0aUFyZ3MpIHtcbiAgICB2YXIgc3VmZml4UmVnZXhwID0gbmV3IFJlZ0V4cChlc2NhcGVJZGVudFJlZ2V4KHN1ZmZpeCkgKyBcIiRcIik7XG4gICAgdmFyIG1ldGhvZHMgPVxuICAgICAgICBwcm9taXNpZmlhYmxlTWV0aG9kcyhvYmosIHN1ZmZpeCwgc3VmZml4UmVnZXhwLCBmaWx0ZXIpO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IG1ldGhvZHMubGVuZ3RoOyBpIDwgbGVuOyBpKz0gMikge1xuICAgICAgICB2YXIga2V5ID0gbWV0aG9kc1tpXTtcbiAgICAgICAgdmFyIGZuID0gbWV0aG9kc1tpKzFdO1xuICAgICAgICB2YXIgcHJvbWlzaWZpZWRLZXkgPSBrZXkgKyBzdWZmaXg7XG4gICAgICAgIGlmIChwcm9taXNpZmllciA9PT0gbWFrZU5vZGVQcm9taXNpZmllZCkge1xuICAgICAgICAgICAgb2JqW3Byb21pc2lmaWVkS2V5XSA9XG4gICAgICAgICAgICAgICAgbWFrZU5vZGVQcm9taXNpZmllZChrZXksIFRISVMsIGtleSwgZm4sIHN1ZmZpeCwgbXVsdGlBcmdzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBwcm9taXNpZmllZCA9IHByb21pc2lmaWVyKGZuLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWFrZU5vZGVQcm9taXNpZmllZChrZXksIFRISVMsIGtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbiwgc3VmZml4LCBtdWx0aUFyZ3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB1dGlsLm5vdEVudW1lcmFibGVQcm9wKHByb21pc2lmaWVkLCBcIl9faXNQcm9taXNpZmllZF9fXCIsIHRydWUpO1xuICAgICAgICAgICAgb2JqW3Byb21pc2lmaWVkS2V5XSA9IHByb21pc2lmaWVkO1xuICAgICAgICB9XG4gICAgfVxuICAgIHV0aWwudG9GYXN0UHJvcGVydGllcyhvYmopO1xuICAgIHJldHVybiBvYmo7XG59XG5cbmZ1bmN0aW9uIHByb21pc2lmeShjYWxsYmFjaywgcmVjZWl2ZXIsIG11bHRpQXJncykge1xuICAgIHJldHVybiBtYWtlTm9kZVByb21pc2lmaWVkKGNhbGxiYWNrLCByZWNlaXZlciwgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaywgbnVsbCwgbXVsdGlBcmdzKTtcbn1cblxuUHJvbWlzZS5wcm9taXNpZnkgPSBmdW5jdGlvbiAoZm4sIG9wdGlvbnMpIHtcbiAgICBpZiAodHlwZW9mIGZuICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImV4cGVjdGluZyBhIGZ1bmN0aW9uIGJ1dCBnb3QgXCIgKyB1dGlsLmNsYXNzU3RyaW5nKGZuKSk7XG4gICAgfVxuICAgIGlmIChpc1Byb21pc2lmaWVkKGZuKSkge1xuICAgICAgICByZXR1cm4gZm47XG4gICAgfVxuICAgIG9wdGlvbnMgPSBPYmplY3Qob3B0aW9ucyk7XG4gICAgdmFyIHJlY2VpdmVyID0gb3B0aW9ucy5jb250ZXh0ID09PSB1bmRlZmluZWQgPyBUSElTIDogb3B0aW9ucy5jb250ZXh0O1xuICAgIHZhciBtdWx0aUFyZ3MgPSAhIW9wdGlvbnMubXVsdGlBcmdzO1xuICAgIHZhciByZXQgPSBwcm9taXNpZnkoZm4sIHJlY2VpdmVyLCBtdWx0aUFyZ3MpO1xuICAgIHV0aWwuY29weURlc2NyaXB0b3JzKGZuLCByZXQsIHByb3BzRmlsdGVyKTtcbiAgICByZXR1cm4gcmV0O1xufTtcblxuUHJvbWlzZS5wcm9taXNpZnlBbGwgPSBmdW5jdGlvbiAodGFyZ2V0LCBvcHRpb25zKSB7XG4gICAgaWYgKHR5cGVvZiB0YXJnZXQgIT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgdGFyZ2V0ICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJ0aGUgdGFyZ2V0IG9mIHByb21pc2lmeUFsbCBtdXN0IGJlIGFuIG9iamVjdCBvciBhIGZ1bmN0aW9uXFx1MDAwYVxcdTAwMGEgICAgU2VlIGh0dHA6Ly9nb28uZ2wvTXFyRm1YXFx1MDAwYVwiKTtcbiAgICB9XG4gICAgb3B0aW9ucyA9IE9iamVjdChvcHRpb25zKTtcbiAgICB2YXIgbXVsdGlBcmdzID0gISFvcHRpb25zLm11bHRpQXJncztcbiAgICB2YXIgc3VmZml4ID0gb3B0aW9ucy5zdWZmaXg7XG4gICAgaWYgKHR5cGVvZiBzdWZmaXggIT09IFwic3RyaW5nXCIpIHN1ZmZpeCA9IGRlZmF1bHRTdWZmaXg7XG4gICAgdmFyIGZpbHRlciA9IG9wdGlvbnMuZmlsdGVyO1xuICAgIGlmICh0eXBlb2YgZmlsdGVyICE9PSBcImZ1bmN0aW9uXCIpIGZpbHRlciA9IGRlZmF1bHRGaWx0ZXI7XG4gICAgdmFyIHByb21pc2lmaWVyID0gb3B0aW9ucy5wcm9taXNpZmllcjtcbiAgICBpZiAodHlwZW9mIHByb21pc2lmaWVyICE9PSBcImZ1bmN0aW9uXCIpIHByb21pc2lmaWVyID0gbWFrZU5vZGVQcm9taXNpZmllZDtcblxuICAgIGlmICghdXRpbC5pc0lkZW50aWZpZXIoc3VmZml4KSkge1xuICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcInN1ZmZpeCBtdXN0IGJlIGEgdmFsaWQgaWRlbnRpZmllclxcdTAwMGFcXHUwMDBhICAgIFNlZSBodHRwOi8vZ29vLmdsL01xckZtWFxcdTAwMGFcIik7XG4gICAgfVxuXG4gICAgdmFyIGtleXMgPSB1dGlsLmluaGVyaXRlZERhdGFLZXlzKHRhcmdldCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHRhcmdldFtrZXlzW2ldXTtcbiAgICAgICAgaWYgKGtleXNbaV0gIT09IFwiY29uc3RydWN0b3JcIiAmJlxuICAgICAgICAgICAgdXRpbC5pc0NsYXNzKHZhbHVlKSkge1xuICAgICAgICAgICAgcHJvbWlzaWZ5QWxsKHZhbHVlLnByb3RvdHlwZSwgc3VmZml4LCBmaWx0ZXIsIHByb21pc2lmaWVyLFxuICAgICAgICAgICAgICAgIG11bHRpQXJncyk7XG4gICAgICAgICAgICBwcm9taXNpZnlBbGwodmFsdWUsIHN1ZmZpeCwgZmlsdGVyLCBwcm9taXNpZmllciwgbXVsdGlBcmdzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNpZnlBbGwodGFyZ2V0LCBzdWZmaXgsIGZpbHRlciwgcHJvbWlzaWZpZXIsIG11bHRpQXJncyk7XG59O1xufTtcblxuXG59LHtcIi4vZXJyb3JzXCI6MTIsXCIuL25vZGViYWNrXCI6MjAsXCIuL3V0aWxcIjozNn1dLDI1OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcblwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihcbiAgICBQcm9taXNlLCBQcm9taXNlQXJyYXksIHRyeUNvbnZlcnRUb1Byb21pc2UsIGFwaVJlamVjdGlvbikge1xudmFyIHV0aWwgPSBfZGVyZXFfKFwiLi91dGlsXCIpO1xudmFyIGlzT2JqZWN0ID0gdXRpbC5pc09iamVjdDtcbnZhciBlczUgPSBfZGVyZXFfKFwiLi9lczVcIik7XG52YXIgRXM2TWFwO1xuaWYgKHR5cGVvZiBNYXAgPT09IFwiZnVuY3Rpb25cIikgRXM2TWFwID0gTWFwO1xuXG52YXIgbWFwVG9FbnRyaWVzID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgdmFyIHNpemUgPSAwO1xuXG4gICAgZnVuY3Rpb24gZXh0cmFjdEVudHJ5KHZhbHVlLCBrZXkpIHtcbiAgICAgICAgdGhpc1tpbmRleF0gPSB2YWx1ZTtcbiAgICAgICAgdGhpc1tpbmRleCArIHNpemVdID0ga2V5O1xuICAgICAgICBpbmRleCsrO1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBtYXBUb0VudHJpZXMobWFwKSB7XG4gICAgICAgIHNpemUgPSBtYXAuc2l6ZTtcbiAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICB2YXIgcmV0ID0gbmV3IEFycmF5KG1hcC5zaXplICogMik7XG4gICAgICAgIG1hcC5mb3JFYWNoKGV4dHJhY3RFbnRyeSwgcmV0KTtcbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9O1xufSkoKTtcblxudmFyIGVudHJpZXNUb01hcCA9IGZ1bmN0aW9uKGVudHJpZXMpIHtcbiAgICB2YXIgcmV0ID0gbmV3IEVzNk1hcCgpO1xuICAgIHZhciBsZW5ndGggPSBlbnRyaWVzLmxlbmd0aCAvIDIgfCAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGtleSA9IGVudHJpZXNbbGVuZ3RoICsgaV07XG4gICAgICAgIHZhciB2YWx1ZSA9IGVudHJpZXNbaV07XG4gICAgICAgIHJldC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG59O1xuXG5mdW5jdGlvbiBQcm9wZXJ0aWVzUHJvbWlzZUFycmF5KG9iaikge1xuICAgIHZhciBpc01hcCA9IGZhbHNlO1xuICAgIHZhciBlbnRyaWVzO1xuICAgIGlmIChFczZNYXAgIT09IHVuZGVmaW5lZCAmJiBvYmogaW5zdGFuY2VvZiBFczZNYXApIHtcbiAgICAgICAgZW50cmllcyA9IG1hcFRvRW50cmllcyhvYmopO1xuICAgICAgICBpc01hcCA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGtleXMgPSBlczUua2V5cyhvYmopO1xuICAgICAgICB2YXIgbGVuID0ga2V5cy5sZW5ndGg7XG4gICAgICAgIGVudHJpZXMgPSBuZXcgQXJyYXkobGVuICogMik7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgICAgICAgICAgZW50cmllc1tpXSA9IG9ialtrZXldO1xuICAgICAgICAgICAgZW50cmllc1tpICsgbGVuXSA9IGtleTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmNvbnN0cnVjdG9yJChlbnRyaWVzKTtcbiAgICB0aGlzLl9pc01hcCA9IGlzTWFwO1xuICAgIHRoaXMuX2luaXQkKHVuZGVmaW5lZCwgLTMpO1xufVxudXRpbC5pbmhlcml0cyhQcm9wZXJ0aWVzUHJvbWlzZUFycmF5LCBQcm9taXNlQXJyYXkpO1xuXG5Qcm9wZXJ0aWVzUHJvbWlzZUFycmF5LnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uICgpIHt9O1xuXG5Qcm9wZXJ0aWVzUHJvbWlzZUFycmF5LnByb3RvdHlwZS5fcHJvbWlzZUZ1bGZpbGxlZCA9IGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgpIHtcbiAgICB0aGlzLl92YWx1ZXNbaW5kZXhdID0gdmFsdWU7XG4gICAgdmFyIHRvdGFsUmVzb2x2ZWQgPSArK3RoaXMuX3RvdGFsUmVzb2x2ZWQ7XG4gICAgaWYgKHRvdGFsUmVzb2x2ZWQgPj0gdGhpcy5fbGVuZ3RoKSB7XG4gICAgICAgIHZhciB2YWw7XG4gICAgICAgIGlmICh0aGlzLl9pc01hcCkge1xuICAgICAgICAgICAgdmFsID0gZW50cmllc1RvTWFwKHRoaXMuX3ZhbHVlcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YWwgPSB7fTtcbiAgICAgICAgICAgIHZhciBrZXlPZmZzZXQgPSB0aGlzLmxlbmd0aCgpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMubGVuZ3RoKCk7IGkgPCBsZW47ICsraSkge1xuICAgICAgICAgICAgICAgIHZhbFt0aGlzLl92YWx1ZXNbaSArIGtleU9mZnNldF1dID0gdGhpcy5fdmFsdWVzW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3Jlc29sdmUodmFsKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cblByb3BlcnRpZXNQcm9taXNlQXJyYXkucHJvdG90eXBlLnNob3VsZENvcHlWYWx1ZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuUHJvcGVydGllc1Byb21pc2VBcnJheS5wcm90b3R5cGUuZ2V0QWN0dWFsTGVuZ3RoID0gZnVuY3Rpb24gKGxlbikge1xuICAgIHJldHVybiBsZW4gPj4gMTtcbn07XG5cbmZ1bmN0aW9uIHByb3BzKHByb21pc2VzKSB7XG4gICAgdmFyIHJldDtcbiAgICB2YXIgY2FzdFZhbHVlID0gdHJ5Q29udmVydFRvUHJvbWlzZShwcm9taXNlcyk7XG5cbiAgICBpZiAoIWlzT2JqZWN0KGNhc3RWYWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIGFwaVJlamVjdGlvbihcImNhbm5vdCBhd2FpdCBwcm9wZXJ0aWVzIG9mIGEgbm9uLW9iamVjdFxcdTAwMGFcXHUwMDBhICAgIFNlZSBodHRwOi8vZ29vLmdsL01xckZtWFxcdTAwMGFcIik7XG4gICAgfSBlbHNlIGlmIChjYXN0VmFsdWUgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgIHJldCA9IGNhc3RWYWx1ZS5fdGhlbihcbiAgICAgICAgICAgIFByb21pc2UucHJvcHMsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0ID0gbmV3IFByb3BlcnRpZXNQcm9taXNlQXJyYXkoY2FzdFZhbHVlKS5wcm9taXNlKCk7XG4gICAgfVxuXG4gICAgaWYgKGNhc3RWYWx1ZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgcmV0Ll9wcm9wYWdhdGVGcm9tKGNhc3RWYWx1ZSwgMik7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG59XG5cblByb21pc2UucHJvdG90eXBlLnByb3BzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBwcm9wcyh0aGlzKTtcbn07XG5cblByb21pc2UucHJvcHMgPSBmdW5jdGlvbiAocHJvbWlzZXMpIHtcbiAgICByZXR1cm4gcHJvcHMocHJvbWlzZXMpO1xufTtcbn07XG5cbn0se1wiLi9lczVcIjoxMyxcIi4vdXRpbFwiOjM2fV0sMjY6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuXCJ1c2Ugc3RyaWN0XCI7XG5mdW5jdGlvbiBhcnJheU1vdmUoc3JjLCBzcmNJbmRleCwgZHN0LCBkc3RJbmRleCwgbGVuKSB7XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBsZW47ICsraikge1xuICAgICAgICBkc3RbaiArIGRzdEluZGV4XSA9IHNyY1tqICsgc3JjSW5kZXhdO1xuICAgICAgICBzcmNbaiArIHNyY0luZGV4XSA9IHZvaWQgMDtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIFF1ZXVlKGNhcGFjaXR5KSB7XG4gICAgdGhpcy5fY2FwYWNpdHkgPSBjYXBhY2l0eTtcbiAgICB0aGlzLl9sZW5ndGggPSAwO1xuICAgIHRoaXMuX2Zyb250ID0gMDtcbn1cblxuUXVldWUucHJvdG90eXBlLl93aWxsQmVPdmVyQ2FwYWNpdHkgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICAgIHJldHVybiB0aGlzLl9jYXBhY2l0eSA8IHNpemU7XG59O1xuXG5RdWV1ZS5wcm90b3R5cGUuX3B1c2hPbmUgPSBmdW5jdGlvbiAoYXJnKSB7XG4gICAgdmFyIGxlbmd0aCA9IHRoaXMubGVuZ3RoKCk7XG4gICAgdGhpcy5fY2hlY2tDYXBhY2l0eShsZW5ndGggKyAxKTtcbiAgICB2YXIgaSA9ICh0aGlzLl9mcm9udCArIGxlbmd0aCkgJiAodGhpcy5fY2FwYWNpdHkgLSAxKTtcbiAgICB0aGlzW2ldID0gYXJnO1xuICAgIHRoaXMuX2xlbmd0aCA9IGxlbmd0aCArIDE7XG59O1xuXG5RdWV1ZS5wcm90b3R5cGUuX3Vuc2hpZnRPbmUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciBjYXBhY2l0eSA9IHRoaXMuX2NhcGFjaXR5O1xuICAgIHRoaXMuX2NoZWNrQ2FwYWNpdHkodGhpcy5sZW5ndGgoKSArIDEpO1xuICAgIHZhciBmcm9udCA9IHRoaXMuX2Zyb250O1xuICAgIHZhciBpID0gKCgoKCBmcm9udCAtIDEgKSAmXG4gICAgICAgICAgICAgICAgICAgICggY2FwYWNpdHkgLSAxKSApIF4gY2FwYWNpdHkgKSAtIGNhcGFjaXR5ICk7XG4gICAgdGhpc1tpXSA9IHZhbHVlO1xuICAgIHRoaXMuX2Zyb250ID0gaTtcbiAgICB0aGlzLl9sZW5ndGggPSB0aGlzLmxlbmd0aCgpICsgMTtcbn07XG5cblF1ZXVlLnByb3RvdHlwZS51bnNoaWZ0ID0gZnVuY3Rpb24oZm4sIHJlY2VpdmVyLCBhcmcpIHtcbiAgICB0aGlzLl91bnNoaWZ0T25lKGFyZyk7XG4gICAgdGhpcy5fdW5zaGlmdE9uZShyZWNlaXZlcik7XG4gICAgdGhpcy5fdW5zaGlmdE9uZShmbik7XG59O1xuXG5RdWV1ZS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChmbiwgcmVjZWl2ZXIsIGFyZykge1xuICAgIHZhciBsZW5ndGggPSB0aGlzLmxlbmd0aCgpICsgMztcbiAgICBpZiAodGhpcy5fd2lsbEJlT3ZlckNhcGFjaXR5KGxlbmd0aCkpIHtcbiAgICAgICAgdGhpcy5fcHVzaE9uZShmbik7XG4gICAgICAgIHRoaXMuX3B1c2hPbmUocmVjZWl2ZXIpO1xuICAgICAgICB0aGlzLl9wdXNoT25lKGFyZyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGogPSB0aGlzLl9mcm9udCArIGxlbmd0aCAtIDM7XG4gICAgdGhpcy5fY2hlY2tDYXBhY2l0eShsZW5ndGgpO1xuICAgIHZhciB3cmFwTWFzayA9IHRoaXMuX2NhcGFjaXR5IC0gMTtcbiAgICB0aGlzWyhqICsgMCkgJiB3cmFwTWFza10gPSBmbjtcbiAgICB0aGlzWyhqICsgMSkgJiB3cmFwTWFza10gPSByZWNlaXZlcjtcbiAgICB0aGlzWyhqICsgMikgJiB3cmFwTWFza10gPSBhcmc7XG4gICAgdGhpcy5fbGVuZ3RoID0gbGVuZ3RoO1xufTtcblxuUXVldWUucHJvdG90eXBlLnNoaWZ0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmcm9udCA9IHRoaXMuX2Zyb250LFxuICAgICAgICByZXQgPSB0aGlzW2Zyb250XTtcblxuICAgIHRoaXNbZnJvbnRdID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX2Zyb250ID0gKGZyb250ICsgMSkgJiAodGhpcy5fY2FwYWNpdHkgLSAxKTtcbiAgICB0aGlzLl9sZW5ndGgtLTtcbiAgICByZXR1cm4gcmV0O1xufTtcblxuUXVldWUucHJvdG90eXBlLmxlbmd0aCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbGVuZ3RoO1xufTtcblxuUXVldWUucHJvdG90eXBlLl9jaGVja0NhcGFjaXR5ID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgICBpZiAodGhpcy5fY2FwYWNpdHkgPCBzaXplKSB7XG4gICAgICAgIHRoaXMuX3Jlc2l6ZVRvKHRoaXMuX2NhcGFjaXR5IDw8IDEpO1xuICAgIH1cbn07XG5cblF1ZXVlLnByb3RvdHlwZS5fcmVzaXplVG8gPSBmdW5jdGlvbiAoY2FwYWNpdHkpIHtcbiAgICB2YXIgb2xkQ2FwYWNpdHkgPSB0aGlzLl9jYXBhY2l0eTtcbiAgICB0aGlzLl9jYXBhY2l0eSA9IGNhcGFjaXR5O1xuICAgIHZhciBmcm9udCA9IHRoaXMuX2Zyb250O1xuICAgIHZhciBsZW5ndGggPSB0aGlzLl9sZW5ndGg7XG4gICAgdmFyIG1vdmVJdGVtc0NvdW50ID0gKGZyb250ICsgbGVuZ3RoKSAmIChvbGRDYXBhY2l0eSAtIDEpO1xuICAgIGFycmF5TW92ZSh0aGlzLCAwLCB0aGlzLCBvbGRDYXBhY2l0eSwgbW92ZUl0ZW1zQ291bnQpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBRdWV1ZTtcblxufSx7fV0sMjc6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuXCJ1c2Ugc3RyaWN0XCI7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKFxuICAgIFByb21pc2UsIElOVEVSTkFMLCB0cnlDb252ZXJ0VG9Qcm9taXNlLCBhcGlSZWplY3Rpb24pIHtcbnZhciB1dGlsID0gX2RlcmVxXyhcIi4vdXRpbFwiKTtcblxudmFyIHJhY2VMYXRlciA9IGZ1bmN0aW9uIChwcm9taXNlKSB7XG4gICAgcmV0dXJuIHByb21pc2UudGhlbihmdW5jdGlvbihhcnJheSkge1xuICAgICAgICByZXR1cm4gcmFjZShhcnJheSwgcHJvbWlzZSk7XG4gICAgfSk7XG59O1xuXG5mdW5jdGlvbiByYWNlKHByb21pc2VzLCBwYXJlbnQpIHtcbiAgICB2YXIgbWF5YmVQcm9taXNlID0gdHJ5Q29udmVydFRvUHJvbWlzZShwcm9taXNlcyk7XG5cbiAgICBpZiAobWF5YmVQcm9taXNlIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICByZXR1cm4gcmFjZUxhdGVyKG1heWJlUHJvbWlzZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcHJvbWlzZXMgPSB1dGlsLmFzQXJyYXkocHJvbWlzZXMpO1xuICAgICAgICBpZiAocHJvbWlzZXMgPT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gYXBpUmVqZWN0aW9uKFwiZXhwZWN0aW5nIGFuIGFycmF5IG9yIGFuIGl0ZXJhYmxlIG9iamVjdCBidXQgZ290IFwiICsgdXRpbC5jbGFzc1N0cmluZyhwcm9taXNlcykpO1xuICAgIH1cblxuICAgIHZhciByZXQgPSBuZXcgUHJvbWlzZShJTlRFUk5BTCk7XG4gICAgaWYgKHBhcmVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldC5fcHJvcGFnYXRlRnJvbShwYXJlbnQsIDMpO1xuICAgIH1cbiAgICB2YXIgZnVsZmlsbCA9IHJldC5fZnVsZmlsbDtcbiAgICB2YXIgcmVqZWN0ID0gcmV0Ll9yZWplY3Q7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHByb21pc2VzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICAgIHZhciB2YWwgPSBwcm9taXNlc1tpXTtcblxuICAgICAgICBpZiAodmFsID09PSB1bmRlZmluZWQgJiYgIShpIGluIHByb21pc2VzKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBQcm9taXNlLmNhc3QodmFsKS5fdGhlbihmdWxmaWxsLCByZWplY3QsIHVuZGVmaW5lZCwgcmV0LCBudWxsKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbn1cblxuUHJvbWlzZS5yYWNlID0gZnVuY3Rpb24gKHByb21pc2VzKSB7XG4gICAgcmV0dXJuIHJhY2UocHJvbWlzZXMsIHVuZGVmaW5lZCk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5yYWNlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiByYWNlKHRoaXMsIHVuZGVmaW5lZCk7XG59O1xuXG59O1xuXG59LHtcIi4vdXRpbFwiOjM2fV0sMjg6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuXCJ1c2Ugc3RyaWN0XCI7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKFByb21pc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFByb21pc2VBcnJheSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpUmVqZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0cnlDb252ZXJ0VG9Qcm9taXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBJTlRFUk5BTCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWcpIHtcbnZhciBnZXREb21haW4gPSBQcm9taXNlLl9nZXREb21haW47XG52YXIgdXRpbCA9IF9kZXJlcV8oXCIuL3V0aWxcIik7XG52YXIgdHJ5Q2F0Y2ggPSB1dGlsLnRyeUNhdGNoO1xuXG5mdW5jdGlvbiBSZWR1Y3Rpb25Qcm9taXNlQXJyYXkocHJvbWlzZXMsIGZuLCBpbml0aWFsVmFsdWUsIF9lYWNoKSB7XG4gICAgdGhpcy5jb25zdHJ1Y3RvciQocHJvbWlzZXMpO1xuICAgIHZhciBkb21haW4gPSBnZXREb21haW4oKTtcbiAgICB0aGlzLl9mbiA9IGRvbWFpbiA9PT0gbnVsbCA/IGZuIDogdXRpbC5kb21haW5CaW5kKGRvbWFpbiwgZm4pO1xuICAgIGlmIChpbml0aWFsVmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpbml0aWFsVmFsdWUgPSBQcm9taXNlLnJlc29sdmUoaW5pdGlhbFZhbHVlKTtcbiAgICAgICAgaW5pdGlhbFZhbHVlLl9hdHRhY2hDYW5jZWxsYXRpb25DYWxsYmFjayh0aGlzKTtcbiAgICB9XG4gICAgdGhpcy5faW5pdGlhbFZhbHVlID0gaW5pdGlhbFZhbHVlO1xuICAgIHRoaXMuX2N1cnJlbnRDYW5jZWxsYWJsZSA9IG51bGw7XG4gICAgaWYoX2VhY2ggPT09IElOVEVSTkFMKSB7XG4gICAgICAgIHRoaXMuX2VhY2hWYWx1ZXMgPSBBcnJheSh0aGlzLl9sZW5ndGgpO1xuICAgIH0gZWxzZSBpZiAoX2VhY2ggPT09IDApIHtcbiAgICAgICAgdGhpcy5fZWFjaFZhbHVlcyA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fZWFjaFZhbHVlcyA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdGhpcy5fcHJvbWlzZS5fY2FwdHVyZVN0YWNrVHJhY2UoKTtcbiAgICB0aGlzLl9pbml0JCh1bmRlZmluZWQsIC01KTtcbn1cbnV0aWwuaW5oZXJpdHMoUmVkdWN0aW9uUHJvbWlzZUFycmF5LCBQcm9taXNlQXJyYXkpO1xuXG5SZWR1Y3Rpb25Qcm9taXNlQXJyYXkucHJvdG90eXBlLl9nb3RBY2N1bSA9IGZ1bmN0aW9uKGFjY3VtKSB7XG4gICAgaWYgKHRoaXMuX2VhY2hWYWx1ZXMgIT09IHVuZGVmaW5lZCAmJiBcbiAgICAgICAgdGhpcy5fZWFjaFZhbHVlcyAhPT0gbnVsbCAmJiBcbiAgICAgICAgYWNjdW0gIT09IElOVEVSTkFMKSB7XG4gICAgICAgIHRoaXMuX2VhY2hWYWx1ZXMucHVzaChhY2N1bSk7XG4gICAgfVxufTtcblxuUmVkdWN0aW9uUHJvbWlzZUFycmF5LnByb3RvdHlwZS5fZWFjaENvbXBsZXRlID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAodGhpcy5fZWFjaFZhbHVlcyAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9lYWNoVmFsdWVzLnB1c2godmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZWFjaFZhbHVlcztcbn07XG5cblJlZHVjdGlvblByb21pc2VBcnJheS5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbigpIHt9O1xuXG5SZWR1Y3Rpb25Qcm9taXNlQXJyYXkucHJvdG90eXBlLl9yZXNvbHZlRW1wdHlBcnJheSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3Jlc29sdmUodGhpcy5fZWFjaFZhbHVlcyAhPT0gdW5kZWZpbmVkID8gdGhpcy5fZWFjaFZhbHVlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdGhpcy5faW5pdGlhbFZhbHVlKTtcbn07XG5cblJlZHVjdGlvblByb21pc2VBcnJheS5wcm90b3R5cGUuc2hvdWxkQ29weVZhbHVlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5SZWR1Y3Rpb25Qcm9taXNlQXJyYXkucHJvdG90eXBlLl9yZXNvbHZlID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICB0aGlzLl9wcm9taXNlLl9yZXNvbHZlQ2FsbGJhY2sodmFsdWUpO1xuICAgIHRoaXMuX3ZhbHVlcyA9IG51bGw7XG59O1xuXG5SZWR1Y3Rpb25Qcm9taXNlQXJyYXkucHJvdG90eXBlLl9yZXN1bHRDYW5jZWxsZWQgPSBmdW5jdGlvbihzZW5kZXIpIHtcbiAgICBpZiAoc2VuZGVyID09PSB0aGlzLl9pbml0aWFsVmFsdWUpIHJldHVybiB0aGlzLl9jYW5jZWwoKTtcbiAgICBpZiAodGhpcy5faXNSZXNvbHZlZCgpKSByZXR1cm47XG4gICAgdGhpcy5fcmVzdWx0Q2FuY2VsbGVkJCgpO1xuICAgIGlmICh0aGlzLl9jdXJyZW50Q2FuY2VsbGFibGUgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRDYW5jZWxsYWJsZS5jYW5jZWwoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2luaXRpYWxWYWx1ZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgdGhpcy5faW5pdGlhbFZhbHVlLmNhbmNlbCgpO1xuICAgIH1cbn07XG5cblJlZHVjdGlvblByb21pc2VBcnJheS5wcm90b3R5cGUuX2l0ZXJhdGUgPSBmdW5jdGlvbiAodmFsdWVzKSB7XG4gICAgdGhpcy5fdmFsdWVzID0gdmFsdWVzO1xuICAgIHZhciB2YWx1ZTtcbiAgICB2YXIgaTtcbiAgICB2YXIgbGVuZ3RoID0gdmFsdWVzLmxlbmd0aDtcbiAgICBpZiAodGhpcy5faW5pdGlhbFZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdmFsdWUgPSB0aGlzLl9pbml0aWFsVmFsdWU7XG4gICAgICAgIGkgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gUHJvbWlzZS5yZXNvbHZlKHZhbHVlc1swXSk7XG4gICAgICAgIGkgPSAxO1xuICAgIH1cblxuICAgIHRoaXMuX2N1cnJlbnRDYW5jZWxsYWJsZSA9IHZhbHVlO1xuXG4gICAgaWYgKCF2YWx1ZS5pc1JlamVjdGVkKCkpIHtcbiAgICAgICAgZm9yICg7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIGN0eCA9IHtcbiAgICAgICAgICAgICAgICBhY2N1bTogbnVsbCxcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVzW2ldLFxuICAgICAgICAgICAgICAgIGluZGV4OiBpLFxuICAgICAgICAgICAgICAgIGxlbmd0aDogbGVuZ3RoLFxuICAgICAgICAgICAgICAgIGFycmF5OiB0aGlzXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5fdGhlbihnb3RBY2N1bSwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGN0eCwgdW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLl9lYWNoVmFsdWVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZVxuICAgICAgICAgICAgLl90aGVuKHRoaXMuX2VhY2hDb21wbGV0ZSwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHRoaXMsIHVuZGVmaW5lZCk7XG4gICAgfVxuICAgIHZhbHVlLl90aGVuKGNvbXBsZXRlZCwgY29tcGxldGVkLCB1bmRlZmluZWQsIHZhbHVlLCB0aGlzKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLnJlZHVjZSA9IGZ1bmN0aW9uIChmbiwgaW5pdGlhbFZhbHVlKSB7XG4gICAgcmV0dXJuIHJlZHVjZSh0aGlzLCBmbiwgaW5pdGlhbFZhbHVlLCBudWxsKTtcbn07XG5cblByb21pc2UucmVkdWNlID0gZnVuY3Rpb24gKHByb21pc2VzLCBmbiwgaW5pdGlhbFZhbHVlLCBfZWFjaCkge1xuICAgIHJldHVybiByZWR1Y2UocHJvbWlzZXMsIGZuLCBpbml0aWFsVmFsdWUsIF9lYWNoKTtcbn07XG5cbmZ1bmN0aW9uIGNvbXBsZXRlZCh2YWx1ZU9yUmVhc29uLCBhcnJheSkge1xuICAgIGlmICh0aGlzLmlzRnVsZmlsbGVkKCkpIHtcbiAgICAgICAgYXJyYXkuX3Jlc29sdmUodmFsdWVPclJlYXNvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYXJyYXkuX3JlamVjdCh2YWx1ZU9yUmVhc29uKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlZHVjZShwcm9taXNlcywgZm4sIGluaXRpYWxWYWx1ZSwgX2VhY2gpIHtcbiAgICBpZiAodHlwZW9mIGZuICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGFwaVJlamVjdGlvbihcImV4cGVjdGluZyBhIGZ1bmN0aW9uIGJ1dCBnb3QgXCIgKyB1dGlsLmNsYXNzU3RyaW5nKGZuKSk7XG4gICAgfVxuICAgIHZhciBhcnJheSA9IG5ldyBSZWR1Y3Rpb25Qcm9taXNlQXJyYXkocHJvbWlzZXMsIGZuLCBpbml0aWFsVmFsdWUsIF9lYWNoKTtcbiAgICByZXR1cm4gYXJyYXkucHJvbWlzZSgpO1xufVxuXG5mdW5jdGlvbiBnb3RBY2N1bShhY2N1bSkge1xuICAgIHRoaXMuYWNjdW0gPSBhY2N1bTtcbiAgICB0aGlzLmFycmF5Ll9nb3RBY2N1bShhY2N1bSk7XG4gICAgdmFyIHZhbHVlID0gdHJ5Q29udmVydFRvUHJvbWlzZSh0aGlzLnZhbHVlLCB0aGlzLmFycmF5Ll9wcm9taXNlKTtcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgIHRoaXMuYXJyYXkuX2N1cnJlbnRDYW5jZWxsYWJsZSA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdmFsdWUuX3RoZW4oZ290VmFsdWUsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB0aGlzLCB1bmRlZmluZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBnb3RWYWx1ZS5jYWxsKHRoaXMsIHZhbHVlKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGdvdFZhbHVlKHZhbHVlKSB7XG4gICAgdmFyIGFycmF5ID0gdGhpcy5hcnJheTtcbiAgICB2YXIgcHJvbWlzZSA9IGFycmF5Ll9wcm9taXNlO1xuICAgIHZhciBmbiA9IHRyeUNhdGNoKGFycmF5Ll9mbik7XG4gICAgcHJvbWlzZS5fcHVzaENvbnRleHQoKTtcbiAgICB2YXIgcmV0O1xuICAgIGlmIChhcnJheS5fZWFjaFZhbHVlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldCA9IGZuLmNhbGwocHJvbWlzZS5fYm91bmRWYWx1ZSgpLCB2YWx1ZSwgdGhpcy5pbmRleCwgdGhpcy5sZW5ndGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldCA9IGZuLmNhbGwocHJvbWlzZS5fYm91bmRWYWx1ZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hY2N1bSwgdmFsdWUsIHRoaXMuaW5kZXgsIHRoaXMubGVuZ3RoKTtcbiAgICB9XG4gICAgaWYgKHJldCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgYXJyYXkuX2N1cnJlbnRDYW5jZWxsYWJsZSA9IHJldDtcbiAgICB9XG4gICAgdmFyIHByb21pc2VDcmVhdGVkID0gcHJvbWlzZS5fcG9wQ29udGV4dCgpO1xuICAgIGRlYnVnLmNoZWNrRm9yZ290dGVuUmV0dXJucyhcbiAgICAgICAgcmV0LFxuICAgICAgICBwcm9taXNlQ3JlYXRlZCxcbiAgICAgICAgYXJyYXkuX2VhY2hWYWx1ZXMgIT09IHVuZGVmaW5lZCA/IFwiUHJvbWlzZS5lYWNoXCIgOiBcIlByb21pc2UucmVkdWNlXCIsXG4gICAgICAgIHByb21pc2VcbiAgICApO1xuICAgIHJldHVybiByZXQ7XG59XG59O1xuXG59LHtcIi4vdXRpbFwiOjM2fV0sMjk6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuXCJ1c2Ugc3RyaWN0XCI7XG52YXIgdXRpbCA9IF9kZXJlcV8oXCIuL3V0aWxcIik7XG52YXIgc2NoZWR1bGU7XG52YXIgbm9Bc3luY1NjaGVkdWxlciA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGFzeW5jIHNjaGVkdWxlciBhdmFpbGFibGVcXHUwMDBhXFx1MDAwYSAgICBTZWUgaHR0cDovL2dvby5nbC9NcXJGbVhcXHUwMDBhXCIpO1xufTtcbnZhciBOYXRpdmVQcm9taXNlID0gdXRpbC5nZXROYXRpdmVQcm9taXNlKCk7XG5pZiAodXRpbC5pc05vZGUgJiYgdHlwZW9mIE11dGF0aW9uT2JzZXJ2ZXIgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB2YXIgR2xvYmFsU2V0SW1tZWRpYXRlID0gZ2xvYmFsLnNldEltbWVkaWF0ZTtcbiAgICB2YXIgUHJvY2Vzc05leHRUaWNrID0gcHJvY2Vzcy5uZXh0VGljaztcbiAgICBzY2hlZHVsZSA9IHV0aWwuaXNSZWNlbnROb2RlXG4gICAgICAgICAgICAgICAgPyBmdW5jdGlvbihmbikgeyBHbG9iYWxTZXRJbW1lZGlhdGUuY2FsbChnbG9iYWwsIGZuKTsgfVxuICAgICAgICAgICAgICAgIDogZnVuY3Rpb24oZm4pIHsgUHJvY2Vzc05leHRUaWNrLmNhbGwocHJvY2VzcywgZm4pOyB9O1xufSBlbHNlIGlmICh0eXBlb2YgTmF0aXZlUHJvbWlzZSA9PT0gXCJmdW5jdGlvblwiICYmXG4gICAgICAgICAgIHR5cGVvZiBOYXRpdmVQcm9taXNlLnJlc29sdmUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHZhciBuYXRpdmVQcm9taXNlID0gTmF0aXZlUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgc2NoZWR1bGUgPSBmdW5jdGlvbihmbikge1xuICAgICAgICBuYXRpdmVQcm9taXNlLnRoZW4oZm4pO1xuICAgIH07XG59IGVsc2UgaWYgKCh0eXBlb2YgTXV0YXRpb25PYnNlcnZlciAhPT0gXCJ1bmRlZmluZWRcIikgJiZcbiAgICAgICAgICAhKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiZcbiAgICAgICAgICAgIHdpbmRvdy5uYXZpZ2F0b3IgJiZcbiAgICAgICAgICAgICh3aW5kb3cubmF2aWdhdG9yLnN0YW5kYWxvbmUgfHwgd2luZG93LmNvcmRvdmEpKSkge1xuICAgIHNjaGVkdWxlID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgdmFyIG9wdHMgPSB7YXR0cmlidXRlczogdHJ1ZX07XG4gICAgICAgIHZhciB0b2dnbGVTY2hlZHVsZWQgPSBmYWxzZTtcbiAgICAgICAgdmFyIGRpdjIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB2YXIgbzIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGRpdi5jbGFzc0xpc3QudG9nZ2xlKFwiZm9vXCIpO1xuICAgICAgICAgICAgdG9nZ2xlU2NoZWR1bGVkID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgICBvMi5vYnNlcnZlKGRpdjIsIG9wdHMpO1xuXG4gICAgICAgIHZhciBzY2hlZHVsZVRvZ2dsZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHRvZ2dsZVNjaGVkdWxlZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHRvZ2dsZVNjaGVkdWxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgZGl2Mi5jbGFzc0xpc3QudG9nZ2xlKFwiZm9vXCIpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIHNjaGVkdWxlKGZuKSB7XG4gICAgICAgICAgICB2YXIgbyA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIG8uZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG8ub2JzZXJ2ZShkaXYsIG9wdHMpO1xuICAgICAgICAgICAgc2NoZWR1bGVUb2dnbGUoKTtcbiAgICAgICAgfTtcbiAgICB9KSgpO1xufSBlbHNlIGlmICh0eXBlb2Ygc2V0SW1tZWRpYXRlICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgc2NoZWR1bGUgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgc2V0SW1tZWRpYXRlKGZuKTtcbiAgICB9O1xufSBlbHNlIGlmICh0eXBlb2Ygc2V0VGltZW91dCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHNjaGVkdWxlID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59IGVsc2Uge1xuICAgIHNjaGVkdWxlID0gbm9Bc3luY1NjaGVkdWxlcjtcbn1cbm1vZHVsZS5leHBvcnRzID0gc2NoZWR1bGU7XG5cbn0se1wiLi91dGlsXCI6MzZ9XSwzMDpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG5cInVzZSBzdHJpY3RcIjtcbm1vZHVsZS5leHBvcnRzID1cbiAgICBmdW5jdGlvbihQcm9taXNlLCBQcm9taXNlQXJyYXksIGRlYnVnKSB7XG52YXIgUHJvbWlzZUluc3BlY3Rpb24gPSBQcm9taXNlLlByb21pc2VJbnNwZWN0aW9uO1xudmFyIHV0aWwgPSBfZGVyZXFfKFwiLi91dGlsXCIpO1xuXG5mdW5jdGlvbiBTZXR0bGVkUHJvbWlzZUFycmF5KHZhbHVlcykge1xuICAgIHRoaXMuY29uc3RydWN0b3IkKHZhbHVlcyk7XG59XG51dGlsLmluaGVyaXRzKFNldHRsZWRQcm9taXNlQXJyYXksIFByb21pc2VBcnJheSk7XG5cblNldHRsZWRQcm9taXNlQXJyYXkucHJvdG90eXBlLl9wcm9taXNlUmVzb2x2ZWQgPSBmdW5jdGlvbiAoaW5kZXgsIGluc3BlY3Rpb24pIHtcbiAgICB0aGlzLl92YWx1ZXNbaW5kZXhdID0gaW5zcGVjdGlvbjtcbiAgICB2YXIgdG90YWxSZXNvbHZlZCA9ICsrdGhpcy5fdG90YWxSZXNvbHZlZDtcbiAgICBpZiAodG90YWxSZXNvbHZlZCA+PSB0aGlzLl9sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5fcmVzb2x2ZSh0aGlzLl92YWx1ZXMpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuU2V0dGxlZFByb21pc2VBcnJheS5wcm90b3R5cGUuX3Byb21pc2VGdWxmaWxsZWQgPSBmdW5jdGlvbiAodmFsdWUsIGluZGV4KSB7XG4gICAgdmFyIHJldCA9IG5ldyBQcm9taXNlSW5zcGVjdGlvbigpO1xuICAgIHJldC5fYml0RmllbGQgPSAzMzU1NDQzMjtcbiAgICByZXQuX3NldHRsZWRWYWx1ZUZpZWxkID0gdmFsdWU7XG4gICAgcmV0dXJuIHRoaXMuX3Byb21pc2VSZXNvbHZlZChpbmRleCwgcmV0KTtcbn07XG5TZXR0bGVkUHJvbWlzZUFycmF5LnByb3RvdHlwZS5fcHJvbWlzZVJlamVjdGVkID0gZnVuY3Rpb24gKHJlYXNvbiwgaW5kZXgpIHtcbiAgICB2YXIgcmV0ID0gbmV3IFByb21pc2VJbnNwZWN0aW9uKCk7XG4gICAgcmV0Ll9iaXRGaWVsZCA9IDE2Nzc3MjE2O1xuICAgIHJldC5fc2V0dGxlZFZhbHVlRmllbGQgPSByZWFzb247XG4gICAgcmV0dXJuIHRoaXMuX3Byb21pc2VSZXNvbHZlZChpbmRleCwgcmV0KTtcbn07XG5cblByb21pc2Uuc2V0dGxlID0gZnVuY3Rpb24gKHByb21pc2VzKSB7XG4gICAgZGVidWcuZGVwcmVjYXRlZChcIi5zZXR0bGUoKVwiLCBcIi5yZWZsZWN0KClcIik7XG4gICAgcmV0dXJuIG5ldyBTZXR0bGVkUHJvbWlzZUFycmF5KHByb21pc2VzKS5wcm9taXNlKCk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5zZXR0bGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFByb21pc2Uuc2V0dGxlKHRoaXMpO1xufTtcbn07XG5cbn0se1wiLi91dGlsXCI6MzZ9XSwzMTpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG5cInVzZSBzdHJpY3RcIjtcbm1vZHVsZS5leHBvcnRzID1cbmZ1bmN0aW9uKFByb21pc2UsIFByb21pc2VBcnJheSwgYXBpUmVqZWN0aW9uKSB7XG52YXIgdXRpbCA9IF9kZXJlcV8oXCIuL3V0aWxcIik7XG52YXIgUmFuZ2VFcnJvciA9IF9kZXJlcV8oXCIuL2Vycm9yc1wiKS5SYW5nZUVycm9yO1xudmFyIEFnZ3JlZ2F0ZUVycm9yID0gX2RlcmVxXyhcIi4vZXJyb3JzXCIpLkFnZ3JlZ2F0ZUVycm9yO1xudmFyIGlzQXJyYXkgPSB1dGlsLmlzQXJyYXk7XG52YXIgQ0FOQ0VMTEFUSU9OID0ge307XG5cblxuZnVuY3Rpb24gU29tZVByb21pc2VBcnJheSh2YWx1ZXMpIHtcbiAgICB0aGlzLmNvbnN0cnVjdG9yJCh2YWx1ZXMpO1xuICAgIHRoaXMuX2hvd01hbnkgPSAwO1xuICAgIHRoaXMuX3Vud3JhcCA9IGZhbHNlO1xuICAgIHRoaXMuX2luaXRpYWxpemVkID0gZmFsc2U7XG59XG51dGlsLmluaGVyaXRzKFNvbWVQcm9taXNlQXJyYXksIFByb21pc2VBcnJheSk7XG5cblNvbWVQcm9taXNlQXJyYXkucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5faW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5faG93TWFueSA9PT0gMCkge1xuICAgICAgICB0aGlzLl9yZXNvbHZlKFtdKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9pbml0JCh1bmRlZmluZWQsIC01KTtcbiAgICB2YXIgaXNBcnJheVJlc29sdmVkID0gaXNBcnJheSh0aGlzLl92YWx1ZXMpO1xuICAgIGlmICghdGhpcy5faXNSZXNvbHZlZCgpICYmXG4gICAgICAgIGlzQXJyYXlSZXNvbHZlZCAmJlxuICAgICAgICB0aGlzLl9ob3dNYW55ID4gdGhpcy5fY2FuUG9zc2libHlGdWxmaWxsKCkpIHtcbiAgICAgICAgdGhpcy5fcmVqZWN0KHRoaXMuX2dldFJhbmdlRXJyb3IodGhpcy5sZW5ndGgoKSkpO1xuICAgIH1cbn07XG5cblNvbWVQcm9taXNlQXJyYXkucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5faW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgIHRoaXMuX2luaXQoKTtcbn07XG5cblNvbWVQcm9taXNlQXJyYXkucHJvdG90eXBlLnNldFVud3JhcCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl91bndyYXAgPSB0cnVlO1xufTtcblxuU29tZVByb21pc2VBcnJheS5wcm90b3R5cGUuaG93TWFueSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5faG93TWFueTtcbn07XG5cblNvbWVQcm9taXNlQXJyYXkucHJvdG90eXBlLnNldEhvd01hbnkgPSBmdW5jdGlvbiAoY291bnQpIHtcbiAgICB0aGlzLl9ob3dNYW55ID0gY291bnQ7XG59O1xuXG5Tb21lUHJvbWlzZUFycmF5LnByb3RvdHlwZS5fcHJvbWlzZUZ1bGZpbGxlZCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHRoaXMuX2FkZEZ1bGZpbGxlZCh2YWx1ZSk7XG4gICAgaWYgKHRoaXMuX2Z1bGZpbGxlZCgpID09PSB0aGlzLmhvd01hbnkoKSkge1xuICAgICAgICB0aGlzLl92YWx1ZXMubGVuZ3RoID0gdGhpcy5ob3dNYW55KCk7XG4gICAgICAgIGlmICh0aGlzLmhvd01hbnkoKSA9PT0gMSAmJiB0aGlzLl91bndyYXApIHtcbiAgICAgICAgICAgIHRoaXMuX3Jlc29sdmUodGhpcy5fdmFsdWVzWzBdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3Jlc29sdmUodGhpcy5fdmFsdWVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuXG59O1xuU29tZVByb21pc2VBcnJheS5wcm90b3R5cGUuX3Byb21pc2VSZWplY3RlZCA9IGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICB0aGlzLl9hZGRSZWplY3RlZChyZWFzb24pO1xuICAgIHJldHVybiB0aGlzLl9jaGVja091dGNvbWUoKTtcbn07XG5cblNvbWVQcm9taXNlQXJyYXkucHJvdG90eXBlLl9wcm9taXNlQ2FuY2VsbGVkID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLl92YWx1ZXMgaW5zdGFuY2VvZiBQcm9taXNlIHx8IHRoaXMuX3ZhbHVlcyA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jYW5jZWwoKTtcbiAgICB9XG4gICAgdGhpcy5fYWRkUmVqZWN0ZWQoQ0FOQ0VMTEFUSU9OKTtcbiAgICByZXR1cm4gdGhpcy5fY2hlY2tPdXRjb21lKCk7XG59O1xuXG5Tb21lUHJvbWlzZUFycmF5LnByb3RvdHlwZS5fY2hlY2tPdXRjb21lID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuaG93TWFueSgpID4gdGhpcy5fY2FuUG9zc2libHlGdWxmaWxsKCkpIHtcbiAgICAgICAgdmFyIGUgPSBuZXcgQWdncmVnYXRlRXJyb3IoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IHRoaXMubGVuZ3RoKCk7IGkgPCB0aGlzLl92YWx1ZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl92YWx1ZXNbaV0gIT09IENBTkNFTExBVElPTikge1xuICAgICAgICAgICAgICAgIGUucHVzaCh0aGlzLl92YWx1ZXNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuX3JlamVjdChlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2NhbmNlbCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5Tb21lUHJvbWlzZUFycmF5LnByb3RvdHlwZS5fZnVsZmlsbGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl90b3RhbFJlc29sdmVkO1xufTtcblxuU29tZVByb21pc2VBcnJheS5wcm90b3R5cGUuX3JlamVjdGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl92YWx1ZXMubGVuZ3RoIC0gdGhpcy5sZW5ndGgoKTtcbn07XG5cblNvbWVQcm9taXNlQXJyYXkucHJvdG90eXBlLl9hZGRSZWplY3RlZCA9IGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICB0aGlzLl92YWx1ZXMucHVzaChyZWFzb24pO1xufTtcblxuU29tZVByb21pc2VBcnJheS5wcm90b3R5cGUuX2FkZEZ1bGZpbGxlZCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHRoaXMuX3ZhbHVlc1t0aGlzLl90b3RhbFJlc29sdmVkKytdID0gdmFsdWU7XG59O1xuXG5Tb21lUHJvbWlzZUFycmF5LnByb3RvdHlwZS5fY2FuUG9zc2libHlGdWxmaWxsID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmxlbmd0aCgpIC0gdGhpcy5fcmVqZWN0ZWQoKTtcbn07XG5cblNvbWVQcm9taXNlQXJyYXkucHJvdG90eXBlLl9nZXRSYW5nZUVycm9yID0gZnVuY3Rpb24gKGNvdW50KSB7XG4gICAgdmFyIG1lc3NhZ2UgPSBcIklucHV0IGFycmF5IG11c3QgY29udGFpbiBhdCBsZWFzdCBcIiArXG4gICAgICAgICAgICB0aGlzLl9ob3dNYW55ICsgXCIgaXRlbXMgYnV0IGNvbnRhaW5zIG9ubHkgXCIgKyBjb3VudCArIFwiIGl0ZW1zXCI7XG4gICAgcmV0dXJuIG5ldyBSYW5nZUVycm9yKG1lc3NhZ2UpO1xufTtcblxuU29tZVByb21pc2VBcnJheS5wcm90b3R5cGUuX3Jlc29sdmVFbXB0eUFycmF5ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX3JlamVjdCh0aGlzLl9nZXRSYW5nZUVycm9yKDApKTtcbn07XG5cbmZ1bmN0aW9uIHNvbWUocHJvbWlzZXMsIGhvd01hbnkpIHtcbiAgICBpZiAoKGhvd01hbnkgfCAwKSAhPT0gaG93TWFueSB8fCBob3dNYW55IDwgMCkge1xuICAgICAgICByZXR1cm4gYXBpUmVqZWN0aW9uKFwiZXhwZWN0aW5nIGEgcG9zaXRpdmUgaW50ZWdlclxcdTAwMGFcXHUwMDBhICAgIFNlZSBodHRwOi8vZ29vLmdsL01xckZtWFxcdTAwMGFcIik7XG4gICAgfVxuICAgIHZhciByZXQgPSBuZXcgU29tZVByb21pc2VBcnJheShwcm9taXNlcyk7XG4gICAgdmFyIHByb21pc2UgPSByZXQucHJvbWlzZSgpO1xuICAgIHJldC5zZXRIb3dNYW55KGhvd01hbnkpO1xuICAgIHJldC5pbml0KCk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cblByb21pc2Uuc29tZSA9IGZ1bmN0aW9uIChwcm9taXNlcywgaG93TWFueSkge1xuICAgIHJldHVybiBzb21lKHByb21pc2VzLCBob3dNYW55KTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLnNvbWUgPSBmdW5jdGlvbiAoaG93TWFueSkge1xuICAgIHJldHVybiBzb21lKHRoaXMsIGhvd01hbnkpO1xufTtcblxuUHJvbWlzZS5fU29tZVByb21pc2VBcnJheSA9IFNvbWVQcm9taXNlQXJyYXk7XG59O1xuXG59LHtcIi4vZXJyb3JzXCI6MTIsXCIuL3V0aWxcIjozNn1dLDMyOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcblwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihQcm9taXNlKSB7XG5mdW5jdGlvbiBQcm9taXNlSW5zcGVjdGlvbihwcm9taXNlKSB7XG4gICAgaWYgKHByb21pc2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBwcm9taXNlID0gcHJvbWlzZS5fdGFyZ2V0KCk7XG4gICAgICAgIHRoaXMuX2JpdEZpZWxkID0gcHJvbWlzZS5fYml0RmllbGQ7XG4gICAgICAgIHRoaXMuX3NldHRsZWRWYWx1ZUZpZWxkID0gcHJvbWlzZS5faXNGYXRlU2VhbGVkKClcbiAgICAgICAgICAgID8gcHJvbWlzZS5fc2V0dGxlZFZhbHVlKCkgOiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLl9iaXRGaWVsZCA9IDA7XG4gICAgICAgIHRoaXMuX3NldHRsZWRWYWx1ZUZpZWxkID0gdW5kZWZpbmVkO1xuICAgIH1cbn1cblxuUHJvbWlzZUluc3BlY3Rpb24ucHJvdG90eXBlLl9zZXR0bGVkVmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fc2V0dGxlZFZhbHVlRmllbGQ7XG59O1xuXG52YXIgdmFsdWUgPSBQcm9taXNlSW5zcGVjdGlvbi5wcm90b3R5cGUudmFsdWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLmlzRnVsZmlsbGVkKCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImNhbm5vdCBnZXQgZnVsZmlsbG1lbnQgdmFsdWUgb2YgYSBub24tZnVsZmlsbGVkIHByb21pc2VcXHUwMDBhXFx1MDAwYSAgICBTZWUgaHR0cDovL2dvby5nbC9NcXJGbVhcXHUwMDBhXCIpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fc2V0dGxlZFZhbHVlKCk7XG59O1xuXG52YXIgcmVhc29uID0gUHJvbWlzZUluc3BlY3Rpb24ucHJvdG90eXBlLmVycm9yID1cblByb21pc2VJbnNwZWN0aW9uLnByb3RvdHlwZS5yZWFzb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLmlzUmVqZWN0ZWQoKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiY2Fubm90IGdldCByZWplY3Rpb24gcmVhc29uIG9mIGEgbm9uLXJlamVjdGVkIHByb21pc2VcXHUwMDBhXFx1MDAwYSAgICBTZWUgaHR0cDovL2dvby5nbC9NcXJGbVhcXHUwMDBhXCIpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fc2V0dGxlZFZhbHVlKCk7XG59O1xuXG52YXIgaXNGdWxmaWxsZWQgPSBQcm9taXNlSW5zcGVjdGlvbi5wcm90b3R5cGUuaXNGdWxmaWxsZWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKHRoaXMuX2JpdEZpZWxkICYgMzM1NTQ0MzIpICE9PSAwO1xufTtcblxudmFyIGlzUmVqZWN0ZWQgPSBQcm9taXNlSW5zcGVjdGlvbi5wcm90b3R5cGUuaXNSZWplY3RlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKHRoaXMuX2JpdEZpZWxkICYgMTY3NzcyMTYpICE9PSAwO1xufTtcblxudmFyIGlzUGVuZGluZyA9IFByb21pc2VJbnNwZWN0aW9uLnByb3RvdHlwZS5pc1BlbmRpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICh0aGlzLl9iaXRGaWVsZCAmIDUwMzk3MTg0KSA9PT0gMDtcbn07XG5cbnZhciBpc1Jlc29sdmVkID0gUHJvbWlzZUluc3BlY3Rpb24ucHJvdG90eXBlLmlzUmVzb2x2ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICh0aGlzLl9iaXRGaWVsZCAmIDUwMzMxNjQ4KSAhPT0gMDtcbn07XG5cblByb21pc2VJbnNwZWN0aW9uLnByb3RvdHlwZS5pc0NhbmNlbGxlZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAodGhpcy5fYml0RmllbGQgJiA4NDU0MTQ0KSAhPT0gMDtcbn07XG5cblByb21pc2UucHJvdG90eXBlLl9faXNDYW5jZWxsZWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKHRoaXMuX2JpdEZpZWxkICYgNjU1MzYpID09PSA2NTUzNjtcbn07XG5cblByb21pc2UucHJvdG90eXBlLl9pc0NhbmNlbGxlZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl90YXJnZXQoKS5fX2lzQ2FuY2VsbGVkKCk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5pc0NhbmNlbGxlZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAodGhpcy5fdGFyZ2V0KCkuX2JpdEZpZWxkICYgODQ1NDE0NCkgIT09IDA7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5pc1BlbmRpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gaXNQZW5kaW5nLmNhbGwodGhpcy5fdGFyZ2V0KCkpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuaXNSZWplY3RlZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBpc1JlamVjdGVkLmNhbGwodGhpcy5fdGFyZ2V0KCkpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuaXNGdWxmaWxsZWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gaXNGdWxmaWxsZWQuY2FsbCh0aGlzLl90YXJnZXQoKSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5pc1Jlc29sdmVkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGlzUmVzb2x2ZWQuY2FsbCh0aGlzLl90YXJnZXQoKSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB2YWx1ZS5jYWxsKHRoaXMuX3RhcmdldCgpKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLnJlYXNvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0YXJnZXQgPSB0aGlzLl90YXJnZXQoKTtcbiAgICB0YXJnZXQuX3Vuc2V0UmVqZWN0aW9uSXNVbmhhbmRsZWQoKTtcbiAgICByZXR1cm4gcmVhc29uLmNhbGwodGFyZ2V0KTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLl92YWx1ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9zZXR0bGVkVmFsdWUoKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLl9yZWFzb24gPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl91bnNldFJlamVjdGlvbklzVW5oYW5kbGVkKCk7XG4gICAgcmV0dXJuIHRoaXMuX3NldHRsZWRWYWx1ZSgpO1xufTtcblxuUHJvbWlzZS5Qcm9taXNlSW5zcGVjdGlvbiA9IFByb21pc2VJbnNwZWN0aW9uO1xufTtcblxufSx7fV0sMzM6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuXCJ1c2Ugc3RyaWN0XCI7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKFByb21pc2UsIElOVEVSTkFMKSB7XG52YXIgdXRpbCA9IF9kZXJlcV8oXCIuL3V0aWxcIik7XG52YXIgZXJyb3JPYmogPSB1dGlsLmVycm9yT2JqO1xudmFyIGlzT2JqZWN0ID0gdXRpbC5pc09iamVjdDtcblxuZnVuY3Rpb24gdHJ5Q29udmVydFRvUHJvbWlzZShvYmosIGNvbnRleHQpIHtcbiAgICBpZiAoaXNPYmplY3Qob2JqKSkge1xuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgUHJvbWlzZSkgcmV0dXJuIG9iajtcbiAgICAgICAgdmFyIHRoZW4gPSBnZXRUaGVuKG9iaik7XG4gICAgICAgIGlmICh0aGVuID09PSBlcnJvck9iaikge1xuICAgICAgICAgICAgaWYgKGNvbnRleHQpIGNvbnRleHQuX3B1c2hDb250ZXh0KCk7XG4gICAgICAgICAgICB2YXIgcmV0ID0gUHJvbWlzZS5yZWplY3QodGhlbi5lKTtcbiAgICAgICAgICAgIGlmIChjb250ZXh0KSBjb250ZXh0Ll9wb3BDb250ZXh0KCk7XG4gICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGVuID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGlmIChpc0FueUJsdWViaXJkUHJvbWlzZShvYmopKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJldCA9IG5ldyBQcm9taXNlKElOVEVSTkFMKTtcbiAgICAgICAgICAgICAgICBvYmouX3RoZW4oXG4gICAgICAgICAgICAgICAgICAgIHJldC5fZnVsZmlsbCxcbiAgICAgICAgICAgICAgICAgICAgcmV0Ll9yZWplY3QsXG4gICAgICAgICAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgcmV0LFxuICAgICAgICAgICAgICAgICAgICBudWxsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGRvVGhlbmFibGUob2JqLCB0aGVuLCBjb250ZXh0KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqO1xufVxuXG5mdW5jdGlvbiBkb0dldFRoZW4ob2JqKSB7XG4gICAgcmV0dXJuIG9iai50aGVuO1xufVxuXG5mdW5jdGlvbiBnZXRUaGVuKG9iaikge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBkb0dldFRoZW4ob2JqKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGVycm9yT2JqLmUgPSBlO1xuICAgICAgICByZXR1cm4gZXJyb3JPYmo7XG4gICAgfVxufVxuXG52YXIgaGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5O1xuZnVuY3Rpb24gaXNBbnlCbHVlYmlyZFByb21pc2Uob2JqKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGhhc1Byb3AuY2FsbChvYmosIFwiX3Byb21pc2UwXCIpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZG9UaGVuYWJsZSh4LCB0aGVuLCBjb250ZXh0KSB7XG4gICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShJTlRFUk5BTCk7XG4gICAgdmFyIHJldCA9IHByb21pc2U7XG4gICAgaWYgKGNvbnRleHQpIGNvbnRleHQuX3B1c2hDb250ZXh0KCk7XG4gICAgcHJvbWlzZS5fY2FwdHVyZVN0YWNrVHJhY2UoKTtcbiAgICBpZiAoY29udGV4dCkgY29udGV4dC5fcG9wQ29udGV4dCgpO1xuICAgIHZhciBzeW5jaHJvbm91cyA9IHRydWU7XG4gICAgdmFyIHJlc3VsdCA9IHV0aWwudHJ5Q2F0Y2godGhlbikuY2FsbCh4LCByZXNvbHZlLCByZWplY3QpO1xuICAgIHN5bmNocm9ub3VzID0gZmFsc2U7XG5cbiAgICBpZiAocHJvbWlzZSAmJiByZXN1bHQgPT09IGVycm9yT2JqKSB7XG4gICAgICAgIHByb21pc2UuX3JlamVjdENhbGxiYWNrKHJlc3VsdC5lLCB0cnVlLCB0cnVlKTtcbiAgICAgICAgcHJvbWlzZSA9IG51bGw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzb2x2ZSh2YWx1ZSkge1xuICAgICAgICBpZiAoIXByb21pc2UpIHJldHVybjtcbiAgICAgICAgcHJvbWlzZS5fcmVzb2x2ZUNhbGxiYWNrKHZhbHVlKTtcbiAgICAgICAgcHJvbWlzZSA9IG51bGw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVqZWN0KHJlYXNvbikge1xuICAgICAgICBpZiAoIXByb21pc2UpIHJldHVybjtcbiAgICAgICAgcHJvbWlzZS5fcmVqZWN0Q2FsbGJhY2socmVhc29uLCBzeW5jaHJvbm91cywgdHJ1ZSk7XG4gICAgICAgIHByb21pc2UgPSBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xufVxuXG5yZXR1cm4gdHJ5Q29udmVydFRvUHJvbWlzZTtcbn07XG5cbn0se1wiLi91dGlsXCI6MzZ9XSwzNDpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG5cInVzZSBzdHJpY3RcIjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oUHJvbWlzZSwgSU5URVJOQUwsIGRlYnVnKSB7XG52YXIgdXRpbCA9IF9kZXJlcV8oXCIuL3V0aWxcIik7XG52YXIgVGltZW91dEVycm9yID0gUHJvbWlzZS5UaW1lb3V0RXJyb3I7XG5cbmZ1bmN0aW9uIEhhbmRsZVdyYXBwZXIoaGFuZGxlKSAge1xuICAgIHRoaXMuaGFuZGxlID0gaGFuZGxlO1xufVxuXG5IYW5kbGVXcmFwcGVyLnByb3RvdHlwZS5fcmVzdWx0Q2FuY2VsbGVkID0gZnVuY3Rpb24oKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuaGFuZGxlKTtcbn07XG5cbnZhciBhZnRlclZhbHVlID0gZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIGRlbGF5KCt0aGlzKS50aGVuUmV0dXJuKHZhbHVlKTsgfTtcbnZhciBkZWxheSA9IFByb21pc2UuZGVsYXkgPSBmdW5jdGlvbiAobXMsIHZhbHVlKSB7XG4gICAgdmFyIHJldDtcbiAgICB2YXIgaGFuZGxlO1xuICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldCA9IFByb21pc2UucmVzb2x2ZSh2YWx1ZSlcbiAgICAgICAgICAgICAgICAuX3RoZW4oYWZ0ZXJWYWx1ZSwgbnVsbCwgbnVsbCwgbXMsIHVuZGVmaW5lZCk7XG4gICAgICAgIGlmIChkZWJ1Zy5jYW5jZWxsYXRpb24oKSAmJiB2YWx1ZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldC5fc2V0T25DYW5jZWwodmFsdWUpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0ID0gbmV3IFByb21pc2UoSU5URVJOQUwpO1xuICAgICAgICBoYW5kbGUgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyByZXQuX2Z1bGZpbGwoKTsgfSwgK21zKTtcbiAgICAgICAgaWYgKGRlYnVnLmNhbmNlbGxhdGlvbigpKSB7XG4gICAgICAgICAgICByZXQuX3NldE9uQ2FuY2VsKG5ldyBIYW5kbGVXcmFwcGVyKGhhbmRsZSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldC5fY2FwdHVyZVN0YWNrVHJhY2UoKTtcbiAgICB9XG4gICAgcmV0Ll9zZXRBc3luY0d1YXJhbnRlZWQoKTtcbiAgICByZXR1cm4gcmV0O1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZGVsYXkgPSBmdW5jdGlvbiAobXMpIHtcbiAgICByZXR1cm4gZGVsYXkobXMsIHRoaXMpO1xufTtcblxudmFyIGFmdGVyVGltZW91dCA9IGZ1bmN0aW9uIChwcm9taXNlLCBtZXNzYWdlLCBwYXJlbnQpIHtcbiAgICB2YXIgZXJyO1xuICAgIGlmICh0eXBlb2YgbWVzc2FnZSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICBpZiAobWVzc2FnZSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICBlcnIgPSBtZXNzYWdlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXJyID0gbmV3IFRpbWVvdXRFcnJvcihcIm9wZXJhdGlvbiB0aW1lZCBvdXRcIik7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBlcnIgPSBuZXcgVGltZW91dEVycm9yKG1lc3NhZ2UpO1xuICAgIH1cbiAgICB1dGlsLm1hcmtBc09yaWdpbmF0aW5nRnJvbVJlamVjdGlvbihlcnIpO1xuICAgIHByb21pc2UuX2F0dGFjaEV4dHJhVHJhY2UoZXJyKTtcbiAgICBwcm9taXNlLl9yZWplY3QoZXJyKTtcblxuICAgIGlmIChwYXJlbnQgIT0gbnVsbCkge1xuICAgICAgICBwYXJlbnQuY2FuY2VsKCk7XG4gICAgfVxufTtcblxuZnVuY3Rpb24gc3VjY2Vzc0NsZWFyKHZhbHVlKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuaGFuZGxlKTtcbiAgICByZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGZhaWx1cmVDbGVhcihyZWFzb24pIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5oYW5kbGUpO1xuICAgIHRocm93IHJlYXNvbjtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUudGltZW91dCA9IGZ1bmN0aW9uIChtcywgbWVzc2FnZSkge1xuICAgIG1zID0gK21zO1xuICAgIHZhciByZXQsIHBhcmVudDtcblxuICAgIHZhciBoYW5kbGVXcmFwcGVyID0gbmV3IEhhbmRsZVdyYXBwZXIoc2V0VGltZW91dChmdW5jdGlvbiB0aW1lb3V0VGltZW91dCgpIHtcbiAgICAgICAgaWYgKHJldC5pc1BlbmRpbmcoKSkge1xuICAgICAgICAgICAgYWZ0ZXJUaW1lb3V0KHJldCwgbWVzc2FnZSwgcGFyZW50KTtcbiAgICAgICAgfVxuICAgIH0sIG1zKSk7XG5cbiAgICBpZiAoZGVidWcuY2FuY2VsbGF0aW9uKCkpIHtcbiAgICAgICAgcGFyZW50ID0gdGhpcy50aGVuKCk7XG4gICAgICAgIHJldCA9IHBhcmVudC5fdGhlbihzdWNjZXNzQ2xlYXIsIGZhaWx1cmVDbGVhcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmRlZmluZWQsIGhhbmRsZVdyYXBwZXIsIHVuZGVmaW5lZCk7XG4gICAgICAgIHJldC5fc2V0T25DYW5jZWwoaGFuZGxlV3JhcHBlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0ID0gdGhpcy5fdGhlbihzdWNjZXNzQ2xlYXIsIGZhaWx1cmVDbGVhcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmRlZmluZWQsIGhhbmRsZVdyYXBwZXIsIHVuZGVmaW5lZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbn07XG5cbn07XG5cbn0se1wiLi91dGlsXCI6MzZ9XSwzNTpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG5cInVzZSBzdHJpY3RcIjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKFByb21pc2UsIGFwaVJlamVjdGlvbiwgdHJ5Q29udmVydFRvUHJvbWlzZSxcbiAgICBjcmVhdGVDb250ZXh0LCBJTlRFUk5BTCwgZGVidWcpIHtcbiAgICB2YXIgdXRpbCA9IF9kZXJlcV8oXCIuL3V0aWxcIik7XG4gICAgdmFyIFR5cGVFcnJvciA9IF9kZXJlcV8oXCIuL2Vycm9yc1wiKS5UeXBlRXJyb3I7XG4gICAgdmFyIGluaGVyaXRzID0gX2RlcmVxXyhcIi4vdXRpbFwiKS5pbmhlcml0cztcbiAgICB2YXIgZXJyb3JPYmogPSB1dGlsLmVycm9yT2JqO1xuICAgIHZhciB0cnlDYXRjaCA9IHV0aWwudHJ5Q2F0Y2g7XG4gICAgdmFyIE5VTEwgPSB7fTtcblxuICAgIGZ1bmN0aW9uIHRocm93ZXIoZSkge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dGhyb3cgZTt9LCAwKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYXN0UHJlc2VydmluZ0Rpc3Bvc2FibGUodGhlbmFibGUpIHtcbiAgICAgICAgdmFyIG1heWJlUHJvbWlzZSA9IHRyeUNvbnZlcnRUb1Byb21pc2UodGhlbmFibGUpO1xuICAgICAgICBpZiAobWF5YmVQcm9taXNlICE9PSB0aGVuYWJsZSAmJlxuICAgICAgICAgICAgdHlwZW9mIHRoZW5hYmxlLl9pc0Rpc3Bvc2FibGUgPT09IFwiZnVuY3Rpb25cIiAmJlxuICAgICAgICAgICAgdHlwZW9mIHRoZW5hYmxlLl9nZXREaXNwb3NlciA9PT0gXCJmdW5jdGlvblwiICYmXG4gICAgICAgICAgICB0aGVuYWJsZS5faXNEaXNwb3NhYmxlKCkpIHtcbiAgICAgICAgICAgIG1heWJlUHJvbWlzZS5fc2V0RGlzcG9zYWJsZSh0aGVuYWJsZS5fZ2V0RGlzcG9zZXIoKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1heWJlUHJvbWlzZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZGlzcG9zZShyZXNvdXJjZXMsIGluc3BlY3Rpb24pIHtcbiAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICB2YXIgbGVuID0gcmVzb3VyY2VzLmxlbmd0aDtcbiAgICAgICAgdmFyIHJldCA9IG5ldyBQcm9taXNlKElOVEVSTkFMKTtcbiAgICAgICAgZnVuY3Rpb24gaXRlcmF0b3IoKSB7XG4gICAgICAgICAgICBpZiAoaSA+PSBsZW4pIHJldHVybiByZXQuX2Z1bGZpbGwoKTtcbiAgICAgICAgICAgIHZhciBtYXliZVByb21pc2UgPSBjYXN0UHJlc2VydmluZ0Rpc3Bvc2FibGUocmVzb3VyY2VzW2krK10pO1xuICAgICAgICAgICAgaWYgKG1heWJlUHJvbWlzZSBpbnN0YW5jZW9mIFByb21pc2UgJiZcbiAgICAgICAgICAgICAgICBtYXliZVByb21pc2UuX2lzRGlzcG9zYWJsZSgpKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgbWF5YmVQcm9taXNlID0gdHJ5Q29udmVydFRvUHJvbWlzZShcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heWJlUHJvbWlzZS5fZ2V0RGlzcG9zZXIoKS50cnlEaXNwb3NlKGluc3BlY3Rpb24pLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VzLnByb21pc2UpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRocm93ZXIoZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChtYXliZVByb21pc2UgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtYXliZVByb21pc2UuX3RoZW4oaXRlcmF0b3IsIHRocm93ZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCwgbnVsbCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXRlcmF0b3IoKTtcbiAgICAgICAgfVxuICAgICAgICBpdGVyYXRvcigpO1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIERpc3Bvc2VyKGRhdGEsIHByb21pc2UsIGNvbnRleHQpIHtcbiAgICAgICAgdGhpcy5fZGF0YSA9IGRhdGE7XG4gICAgICAgIHRoaXMuX3Byb21pc2UgPSBwcm9taXNlO1xuICAgICAgICB0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcbiAgICB9XG5cbiAgICBEaXNwb3Nlci5wcm90b3R5cGUuZGF0YSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGE7XG4gICAgfTtcblxuICAgIERpc3Bvc2VyLnByb3RvdHlwZS5wcm9taXNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcHJvbWlzZTtcbiAgICB9O1xuXG4gICAgRGlzcG9zZXIucHJvdG90eXBlLnJlc291cmNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5wcm9taXNlKCkuaXNGdWxmaWxsZWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvbWlzZSgpLnZhbHVlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE5VTEw7XG4gICAgfTtcblxuICAgIERpc3Bvc2VyLnByb3RvdHlwZS50cnlEaXNwb3NlID0gZnVuY3Rpb24oaW5zcGVjdGlvbikge1xuICAgICAgICB2YXIgcmVzb3VyY2UgPSB0aGlzLnJlc291cmNlKCk7XG4gICAgICAgIHZhciBjb250ZXh0ID0gdGhpcy5fY29udGV4dDtcbiAgICAgICAgaWYgKGNvbnRleHQgIT09IHVuZGVmaW5lZCkgY29udGV4dC5fcHVzaENvbnRleHQoKTtcbiAgICAgICAgdmFyIHJldCA9IHJlc291cmNlICE9PSBOVUxMXG4gICAgICAgICAgICA/IHRoaXMuZG9EaXNwb3NlKHJlc291cmNlLCBpbnNwZWN0aW9uKSA6IG51bGw7XG4gICAgICAgIGlmIChjb250ZXh0ICE9PSB1bmRlZmluZWQpIGNvbnRleHQuX3BvcENvbnRleHQoKTtcbiAgICAgICAgdGhpcy5fcHJvbWlzZS5fdW5zZXREaXNwb3NhYmxlKCk7XG4gICAgICAgIHRoaXMuX2RhdGEgPSBudWxsO1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH07XG5cbiAgICBEaXNwb3Nlci5pc0Rpc3Bvc2VyID0gZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgcmV0dXJuIChkICE9IG51bGwgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YgZC5yZXNvdXJjZSA9PT0gXCJmdW5jdGlvblwiICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mIGQudHJ5RGlzcG9zZSA9PT0gXCJmdW5jdGlvblwiKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gRnVuY3Rpb25EaXNwb3NlcihmbiwgcHJvbWlzZSwgY29udGV4dCkge1xuICAgICAgICB0aGlzLmNvbnN0cnVjdG9yJChmbiwgcHJvbWlzZSwgY29udGV4dCk7XG4gICAgfVxuICAgIGluaGVyaXRzKEZ1bmN0aW9uRGlzcG9zZXIsIERpc3Bvc2VyKTtcblxuICAgIEZ1bmN0aW9uRGlzcG9zZXIucHJvdG90eXBlLmRvRGlzcG9zZSA9IGZ1bmN0aW9uIChyZXNvdXJjZSwgaW5zcGVjdGlvbikge1xuICAgICAgICB2YXIgZm4gPSB0aGlzLmRhdGEoKTtcbiAgICAgICAgcmV0dXJuIGZuLmNhbGwocmVzb3VyY2UsIHJlc291cmNlLCBpbnNwZWN0aW9uKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gbWF5YmVVbndyYXBEaXNwb3Nlcih2YWx1ZSkge1xuICAgICAgICBpZiAoRGlzcG9zZXIuaXNEaXNwb3Nlcih2YWx1ZSkpIHtcbiAgICAgICAgICAgIHRoaXMucmVzb3VyY2VzW3RoaXMuaW5kZXhdLl9zZXREaXNwb3NhYmxlKHZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5wcm9taXNlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIFJlc291cmNlTGlzdChsZW5ndGgpIHtcbiAgICAgICAgdGhpcy5sZW5ndGggPSBsZW5ndGg7XG4gICAgICAgIHRoaXMucHJvbWlzZSA9IG51bGw7XG4gICAgICAgIHRoaXNbbGVuZ3RoLTFdID0gbnVsbDtcbiAgICB9XG5cbiAgICBSZXNvdXJjZUxpc3QucHJvdG90eXBlLl9yZXN1bHRDYW5jZWxsZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICAgICAgICB2YXIgaXRlbSA9IHRoaXNbaV07XG4gICAgICAgICAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICBpdGVtLmNhbmNlbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIFByb21pc2UudXNpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBpZiAobGVuIDwgMikgcmV0dXJuIGFwaVJlamVjdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgIFwieW91IG11c3QgcGFzcyBhdCBsZWFzdCAyIGFyZ3VtZW50cyB0byBQcm9taXNlLnVzaW5nXCIpO1xuICAgICAgICB2YXIgZm4gPSBhcmd1bWVudHNbbGVuIC0gMV07XG4gICAgICAgIGlmICh0eXBlb2YgZm4gIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgcmV0dXJuIGFwaVJlamVjdGlvbihcImV4cGVjdGluZyBhIGZ1bmN0aW9uIGJ1dCBnb3QgXCIgKyB1dGlsLmNsYXNzU3RyaW5nKGZuKSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGlucHV0O1xuICAgICAgICB2YXIgc3ByZWFkQXJncyA9IHRydWU7XG4gICAgICAgIGlmIChsZW4gPT09IDIgJiYgQXJyYXkuaXNBcnJheShhcmd1bWVudHNbMF0pKSB7XG4gICAgICAgICAgICBpbnB1dCA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIGxlbiA9IGlucHV0Lmxlbmd0aDtcbiAgICAgICAgICAgIHNwcmVhZEFyZ3MgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlucHV0ID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgbGVuLS07XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlc291cmNlcyA9IG5ldyBSZXNvdXJjZUxpc3QobGVuKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgICAgICAgICAgdmFyIHJlc291cmNlID0gaW5wdXRbaV07XG4gICAgICAgICAgICBpZiAoRGlzcG9zZXIuaXNEaXNwb3NlcihyZXNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGlzcG9zZXIgPSByZXNvdXJjZTtcbiAgICAgICAgICAgICAgICByZXNvdXJjZSA9IHJlc291cmNlLnByb21pc2UoKTtcbiAgICAgICAgICAgICAgICByZXNvdXJjZS5fc2V0RGlzcG9zYWJsZShkaXNwb3Nlcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBtYXliZVByb21pc2UgPSB0cnlDb252ZXJ0VG9Qcm9taXNlKHJlc291cmNlKTtcbiAgICAgICAgICAgICAgICBpZiAobWF5YmVQcm9taXNlIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICAgICAgICAgICAgICByZXNvdXJjZSA9XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXliZVByb21pc2UuX3RoZW4obWF5YmVVbndyYXBEaXNwb3NlciwgbnVsbCwgbnVsbCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlczogcmVzb3VyY2VzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4OiBpXG4gICAgICAgICAgICAgICAgICAgIH0sIHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzb3VyY2VzW2ldID0gcmVzb3VyY2U7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVmbGVjdGVkUmVzb3VyY2VzID0gbmV3IEFycmF5KHJlc291cmNlcy5sZW5ndGgpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZmxlY3RlZFJlc291cmNlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgcmVmbGVjdGVkUmVzb3VyY2VzW2ldID0gUHJvbWlzZS5yZXNvbHZlKHJlc291cmNlc1tpXSkucmVmbGVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlc3VsdFByb21pc2UgPSBQcm9taXNlLmFsbChyZWZsZWN0ZWRSZXNvdXJjZXMpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihpbnNwZWN0aW9ucykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5zcGVjdGlvbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluc3BlY3Rpb24gPSBpbnNwZWN0aW9uc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluc3BlY3Rpb24uaXNSZWplY3RlZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck9iai5lID0gaW5zcGVjdGlvbi5lcnJvcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yT2JqO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFpbnNwZWN0aW9uLmlzRnVsZmlsbGVkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFByb21pc2UuY2FuY2VsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaW5zcGVjdGlvbnNbaV0gPSBpbnNwZWN0aW9uLnZhbHVlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHByb21pc2UuX3B1c2hDb250ZXh0KCk7XG5cbiAgICAgICAgICAgICAgICBmbiA9IHRyeUNhdGNoKGZuKTtcbiAgICAgICAgICAgICAgICB2YXIgcmV0ID0gc3ByZWFkQXJnc1xuICAgICAgICAgICAgICAgICAgICA/IGZuLmFwcGx5KHVuZGVmaW5lZCwgaW5zcGVjdGlvbnMpIDogZm4oaW5zcGVjdGlvbnMpO1xuICAgICAgICAgICAgICAgIHZhciBwcm9taXNlQ3JlYXRlZCA9IHByb21pc2UuX3BvcENvbnRleHQoKTtcbiAgICAgICAgICAgICAgICBkZWJ1Zy5jaGVja0ZvcmdvdHRlblJldHVybnMoXG4gICAgICAgICAgICAgICAgICAgIHJldCwgcHJvbWlzZUNyZWF0ZWQsIFwiUHJvbWlzZS51c2luZ1wiLCBwcm9taXNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIHByb21pc2UgPSByZXN1bHRQcm9taXNlLmxhc3RseShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBpbnNwZWN0aW9uID0gbmV3IFByb21pc2UuUHJvbWlzZUluc3BlY3Rpb24ocmVzdWx0UHJvbWlzZSk7XG4gICAgICAgICAgICByZXR1cm4gZGlzcG9zZShyZXNvdXJjZXMsIGluc3BlY3Rpb24pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmVzb3VyY2VzLnByb21pc2UgPSBwcm9taXNlO1xuICAgICAgICBwcm9taXNlLl9zZXRPbkNhbmNlbChyZXNvdXJjZXMpO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9O1xuXG4gICAgUHJvbWlzZS5wcm90b3R5cGUuX3NldERpc3Bvc2FibGUgPSBmdW5jdGlvbiAoZGlzcG9zZXIpIHtcbiAgICAgICAgdGhpcy5fYml0RmllbGQgPSB0aGlzLl9iaXRGaWVsZCB8IDEzMTA3MjtcbiAgICAgICAgdGhpcy5fZGlzcG9zZXIgPSBkaXNwb3NlcjtcbiAgICB9O1xuXG4gICAgUHJvbWlzZS5wcm90b3R5cGUuX2lzRGlzcG9zYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLl9iaXRGaWVsZCAmIDEzMTA3MikgPiAwO1xuICAgIH07XG5cbiAgICBQcm9taXNlLnByb3RvdHlwZS5fZ2V0RGlzcG9zZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kaXNwb3NlcjtcbiAgICB9O1xuXG4gICAgUHJvbWlzZS5wcm90b3R5cGUuX3Vuc2V0RGlzcG9zYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fYml0RmllbGQgPSB0aGlzLl9iaXRGaWVsZCAmICh+MTMxMDcyKTtcbiAgICAgICAgdGhpcy5fZGlzcG9zZXIgPSB1bmRlZmluZWQ7XG4gICAgfTtcblxuICAgIFByb21pc2UucHJvdG90eXBlLmRpc3Bvc2VyID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZm4gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBGdW5jdGlvbkRpc3Bvc2VyKGZuLCB0aGlzLCBjcmVhdGVDb250ZXh0KCkpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICB9O1xuXG59O1xuXG59LHtcIi4vZXJyb3JzXCI6MTIsXCIuL3V0aWxcIjozNn1dLDM2OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcblwidXNlIHN0cmljdFwiO1xudmFyIGVzNSA9IF9kZXJlcV8oXCIuL2VzNVwiKTtcbnZhciBjYW5FdmFsdWF0ZSA9IHR5cGVvZiBuYXZpZ2F0b3IgPT0gXCJ1bmRlZmluZWRcIjtcblxudmFyIGVycm9yT2JqID0ge2U6IHt9fTtcbnZhciB0cnlDYXRjaFRhcmdldDtcbnZhciBnbG9iYWxPYmplY3QgPSB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOlxuICAgIHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOlxuICAgIHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOlxuICAgIHRoaXMgIT09IHVuZGVmaW5lZCA/IHRoaXMgOiBudWxsO1xuXG5mdW5jdGlvbiB0cnlDYXRjaGVyKCkge1xuICAgIHRyeSB7XG4gICAgICAgIHZhciB0YXJnZXQgPSB0cnlDYXRjaFRhcmdldDtcbiAgICAgICAgdHJ5Q2F0Y2hUYXJnZXQgPSBudWxsO1xuICAgICAgICByZXR1cm4gdGFyZ2V0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBlcnJvck9iai5lID0gZTtcbiAgICAgICAgcmV0dXJuIGVycm9yT2JqO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHRyeUNhdGNoKGZuKSB7XG4gICAgdHJ5Q2F0Y2hUYXJnZXQgPSBmbjtcbiAgICByZXR1cm4gdHJ5Q2F0Y2hlcjtcbn1cblxudmFyIGluaGVyaXRzID0gZnVuY3Rpb24oQ2hpbGQsIFBhcmVudCkge1xuICAgIHZhciBoYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHk7XG5cbiAgICBmdW5jdGlvbiBUKCkge1xuICAgICAgICB0aGlzLmNvbnN0cnVjdG9yID0gQ2hpbGQ7XG4gICAgICAgIHRoaXMuY29uc3RydWN0b3IkID0gUGFyZW50O1xuICAgICAgICBmb3IgKHZhciBwcm9wZXJ0eU5hbWUgaW4gUGFyZW50LnByb3RvdHlwZSkge1xuICAgICAgICAgICAgaWYgKGhhc1Byb3AuY2FsbChQYXJlbnQucHJvdG90eXBlLCBwcm9wZXJ0eU5hbWUpICYmXG4gICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lLmNoYXJBdChwcm9wZXJ0eU5hbWUubGVuZ3RoLTEpICE9PSBcIiRcIlxuICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICB0aGlzW3Byb3BlcnR5TmFtZSArIFwiJFwiXSA9IFBhcmVudC5wcm90b3R5cGVbcHJvcGVydHlOYW1lXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBULnByb3RvdHlwZSA9IFBhcmVudC5wcm90b3R5cGU7XG4gICAgQ2hpbGQucHJvdG90eXBlID0gbmV3IFQoKTtcbiAgICByZXR1cm4gQ2hpbGQucHJvdG90eXBlO1xufTtcblxuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZSh2YWwpIHtcbiAgICByZXR1cm4gdmFsID09IG51bGwgfHwgdmFsID09PSB0cnVlIHx8IHZhbCA9PT0gZmFsc2UgfHxcbiAgICAgICAgdHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIiB8fCB0eXBlb2YgdmFsID09PSBcIm51bWJlclwiO1xuXG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiIHx8XG4gICAgICAgICAgIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gbWF5YmVXcmFwQXNFcnJvcihtYXliZUVycm9yKSB7XG4gICAgaWYgKCFpc1ByaW1pdGl2ZShtYXliZUVycm9yKSkgcmV0dXJuIG1heWJlRXJyb3I7XG5cbiAgICByZXR1cm4gbmV3IEVycm9yKHNhZmVUb1N0cmluZyhtYXliZUVycm9yKSk7XG59XG5cbmZ1bmN0aW9uIHdpdGhBcHBlbmRlZCh0YXJnZXQsIGFwcGVuZGVlKSB7XG4gICAgdmFyIGxlbiA9IHRhcmdldC5sZW5ndGg7XG4gICAgdmFyIHJldCA9IG5ldyBBcnJheShsZW4gKyAxKTtcbiAgICB2YXIgaTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgICAgcmV0W2ldID0gdGFyZ2V0W2ldO1xuICAgIH1cbiAgICByZXRbaV0gPSBhcHBlbmRlZTtcbiAgICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBnZXREYXRhUHJvcGVydHlPckRlZmF1bHQob2JqLCBrZXksIGRlZmF1bHRWYWx1ZSkge1xuICAgIGlmIChlczUuaXNFUzUpIHtcbiAgICAgICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwga2V5KTtcblxuICAgICAgICBpZiAoZGVzYyAhPSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVzYy5nZXQgPT0gbnVsbCAmJiBkZXNjLnNldCA9PSBudWxsXG4gICAgICAgICAgICAgICAgICAgID8gZGVzYy52YWx1ZVxuICAgICAgICAgICAgICAgICAgICA6IGRlZmF1bHRWYWx1ZTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB7fS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSA/IG9ialtrZXldIDogdW5kZWZpbmVkO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gbm90RW51bWVyYWJsZVByb3Aob2JqLCBuYW1lLCB2YWx1ZSkge1xuICAgIGlmIChpc1ByaW1pdGl2ZShvYmopKSByZXR1cm4gb2JqO1xuICAgIHZhciBkZXNjcmlwdG9yID0ge1xuICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfTtcbiAgICBlczUuZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lLCBkZXNjcmlwdG9yKTtcbiAgICByZXR1cm4gb2JqO1xufVxuXG5mdW5jdGlvbiB0aHJvd2VyKHIpIHtcbiAgICB0aHJvdyByO1xufVxuXG52YXIgaW5oZXJpdGVkRGF0YUtleXMgPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGV4Y2x1ZGVkUHJvdG90eXBlcyA9IFtcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLFxuICAgICAgICBPYmplY3QucHJvdG90eXBlLFxuICAgICAgICBGdW5jdGlvbi5wcm90b3R5cGVcbiAgICBdO1xuXG4gICAgdmFyIGlzRXhjbHVkZWRQcm90byA9IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV4Y2x1ZGVkUHJvdG90eXBlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKGV4Y2x1ZGVkUHJvdG90eXBlc1tpXSA9PT0gdmFsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICBpZiAoZXM1LmlzRVM1KSB7XG4gICAgICAgIHZhciBnZXRLZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXM7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgICAgIHZhciByZXQgPSBbXTtcbiAgICAgICAgICAgIHZhciB2aXNpdGVkS2V5cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgICAgICB3aGlsZSAob2JqICE9IG51bGwgJiYgIWlzRXhjbHVkZWRQcm90byhvYmopKSB7XG4gICAgICAgICAgICAgICAgdmFyIGtleXM7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAga2V5cyA9IGdldEtleXMob2JqKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZpc2l0ZWRLZXlzW2tleV0pIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB2aXNpdGVkS2V5c1trZXldID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwga2V5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlc2MgIT0gbnVsbCAmJiBkZXNjLmdldCA9PSBudWxsICYmIGRlc2Muc2V0ID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldC5wdXNoKGtleSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgb2JqID0gZXM1LmdldFByb3RvdHlwZU9mKG9iaik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBoYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHk7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgICAgIGlmIChpc0V4Y2x1ZGVkUHJvdG8ob2JqKSkgcmV0dXJuIFtdO1xuICAgICAgICAgICAgdmFyIHJldCA9IFtdO1xuXG4gICAgICAgICAgICAvKmpzaGludCBmb3JpbjpmYWxzZSAqL1xuICAgICAgICAgICAgZW51bWVyYXRpb246IGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgICAgICAgICBpZiAoaGFzUHJvcC5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgICAgICAgICAgICAgICByZXQucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXhjbHVkZWRQcm90b3R5cGVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGFzUHJvcC5jYWxsKGV4Y2x1ZGVkUHJvdG90eXBlc1tpXSwga2V5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlIGVudW1lcmF0aW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldC5wdXNoKGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgfTtcbiAgICB9XG5cbn0pKCk7XG5cbnZhciB0aGlzQXNzaWdubWVudFBhdHRlcm4gPSAvdGhpc1xccypcXC5cXHMqXFxTK1xccyo9LztcbmZ1bmN0aW9uIGlzQ2xhc3MoZm4pIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGZuID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHZhciBrZXlzID0gZXM1Lm5hbWVzKGZuLnByb3RvdHlwZSk7XG5cbiAgICAgICAgICAgIHZhciBoYXNNZXRob2RzID0gZXM1LmlzRVM1ICYmIGtleXMubGVuZ3RoID4gMTtcbiAgICAgICAgICAgIHZhciBoYXNNZXRob2RzT3RoZXJUaGFuQ29uc3RydWN0b3IgPSBrZXlzLmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICAgICAgICAhKGtleXMubGVuZ3RoID09PSAxICYmIGtleXNbMF0gPT09IFwiY29uc3RydWN0b3JcIik7XG4gICAgICAgICAgICB2YXIgaGFzVGhpc0Fzc2lnbm1lbnRBbmRTdGF0aWNNZXRob2RzID1cbiAgICAgICAgICAgICAgICB0aGlzQXNzaWdubWVudFBhdHRlcm4udGVzdChmbiArIFwiXCIpICYmIGVzNS5uYW1lcyhmbikubGVuZ3RoID4gMDtcblxuICAgICAgICAgICAgaWYgKGhhc01ldGhvZHMgfHwgaGFzTWV0aG9kc090aGVyVGhhbkNvbnN0cnVjdG9yIHx8XG4gICAgICAgICAgICAgICAgaGFzVGhpc0Fzc2lnbm1lbnRBbmRTdGF0aWNNZXRob2RzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdG9GYXN0UHJvcGVydGllcyhvYmopIHtcbiAgICAvKmpzaGludCAtVzAyNywtVzA1NSwtVzAzMSovXG4gICAgZnVuY3Rpb24gRmFrZUNvbnN0cnVjdG9yKCkge31cbiAgICBGYWtlQ29uc3RydWN0b3IucHJvdG90eXBlID0gb2JqO1xuICAgIHZhciBsID0gODtcbiAgICB3aGlsZSAobC0tKSBuZXcgRmFrZUNvbnN0cnVjdG9yKCk7XG4gICAgcmV0dXJuIG9iajtcbiAgICBldmFsKG9iaik7XG59XG5cbnZhciByaWRlbnQgPSAvXlthLXokX11bYS16JF8wLTldKiQvaTtcbmZ1bmN0aW9uIGlzSWRlbnRpZmllcihzdHIpIHtcbiAgICByZXR1cm4gcmlkZW50LnRlc3Qoc3RyKTtcbn1cblxuZnVuY3Rpb24gZmlsbGVkUmFuZ2UoY291bnQsIHByZWZpeCwgc3VmZml4KSB7XG4gICAgdmFyIHJldCA9IG5ldyBBcnJheShjb3VudCk7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGNvdW50OyArK2kpIHtcbiAgICAgICAgcmV0W2ldID0gcHJlZml4ICsgaSArIHN1ZmZpeDtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gc2FmZVRvU3RyaW5nKG9iaikge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBvYmogKyBcIlwiO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIFwiW25vIHN0cmluZyByZXByZXNlbnRhdGlvbl1cIjtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGlzRXJyb3Iob2JqKSB7XG4gICAgcmV0dXJuIG9iaiAhPT0gbnVsbCAmJlxuICAgICAgICAgICB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgICAgIHR5cGVvZiBvYmoubWVzc2FnZSA9PT0gXCJzdHJpbmdcIiAmJlxuICAgICAgICAgICB0eXBlb2Ygb2JqLm5hbWUgPT09IFwic3RyaW5nXCI7XG59XG5cbmZ1bmN0aW9uIG1hcmtBc09yaWdpbmF0aW5nRnJvbVJlamVjdGlvbihlKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgbm90RW51bWVyYWJsZVByb3AoZSwgXCJpc09wZXJhdGlvbmFsXCIsIHRydWUpO1xuICAgIH1cbiAgICBjYXRjaChpZ25vcmUpIHt9XG59XG5cbmZ1bmN0aW9uIG9yaWdpbmF0ZXNGcm9tUmVqZWN0aW9uKGUpIHtcbiAgICBpZiAoZSA9PSBudWxsKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuICgoZSBpbnN0YW5jZW9mIEVycm9yW1wiX19CbHVlYmlyZEVycm9yVHlwZXNfX1wiXS5PcGVyYXRpb25hbEVycm9yKSB8fFxuICAgICAgICBlW1wiaXNPcGVyYXRpb25hbFwiXSA9PT0gdHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIGNhbkF0dGFjaFRyYWNlKG9iaikge1xuICAgIHJldHVybiBpc0Vycm9yKG9iaikgJiYgZXM1LnByb3BlcnR5SXNXcml0YWJsZShvYmosIFwic3RhY2tcIik7XG59XG5cbnZhciBlbnN1cmVFcnJvck9iamVjdCA9IChmdW5jdGlvbigpIHtcbiAgICBpZiAoIShcInN0YWNrXCIgaW4gbmV3IEVycm9yKCkpKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKGNhbkF0dGFjaFRyYWNlKHZhbHVlKSkgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgdHJ5IHt0aHJvdyBuZXcgRXJyb3Ioc2FmZVRvU3RyaW5nKHZhbHVlKSk7fVxuICAgICAgICAgICAgY2F0Y2goZXJyKSB7cmV0dXJuIGVycjt9XG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoY2FuQXR0YWNoVHJhY2UodmFsdWUpKSByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEVycm9yKHNhZmVUb1N0cmluZyh2YWx1ZSkpO1xuICAgICAgICB9O1xuICAgIH1cbn0pKCk7XG5cbmZ1bmN0aW9uIGNsYXNzU3RyaW5nKG9iaikge1xuICAgIHJldHVybiB7fS50b1N0cmluZy5jYWxsKG9iaik7XG59XG5cbmZ1bmN0aW9uIGNvcHlEZXNjcmlwdG9ycyhmcm9tLCB0bywgZmlsdGVyKSB7XG4gICAgdmFyIGtleXMgPSBlczUubmFtZXMoZnJvbSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgICAgICBpZiAoZmlsdGVyKGtleSkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZXM1LmRlZmluZVByb3BlcnR5KHRvLCBrZXksIGVzNS5nZXREZXNjcmlwdG9yKGZyb20sIGtleSkpO1xuICAgICAgICAgICAgfSBjYXRjaCAoaWdub3JlKSB7fVxuICAgICAgICB9XG4gICAgfVxufVxuXG52YXIgYXNBcnJheSA9IGZ1bmN0aW9uKHYpIHtcbiAgICBpZiAoZXM1LmlzQXJyYXkodikpIHtcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufTtcblxuaWYgKHR5cGVvZiBTeW1ib2wgIT09IFwidW5kZWZpbmVkXCIgJiYgU3ltYm9sLml0ZXJhdG9yKSB7XG4gICAgdmFyIEFycmF5RnJvbSA9IHR5cGVvZiBBcnJheS5mcm9tID09PSBcImZ1bmN0aW9uXCIgPyBmdW5jdGlvbih2KSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHYpO1xuICAgIH0gOiBmdW5jdGlvbih2KSB7XG4gICAgICAgIHZhciByZXQgPSBbXTtcbiAgICAgICAgdmFyIGl0ID0gdltTeW1ib2wuaXRlcmF0b3JdKCk7XG4gICAgICAgIHZhciBpdFJlc3VsdDtcbiAgICAgICAgd2hpbGUgKCEoKGl0UmVzdWx0ID0gaXQubmV4dCgpKS5kb25lKSkge1xuICAgICAgICAgICAgcmV0LnB1c2goaXRSZXN1bHQudmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfTtcblxuICAgIGFzQXJyYXkgPSBmdW5jdGlvbih2KSB7XG4gICAgICAgIGlmIChlczUuaXNBcnJheSh2KSkge1xuICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgIH0gZWxzZSBpZiAodiAhPSBudWxsICYmIHR5cGVvZiB2W1N5bWJvbC5pdGVyYXRvcl0gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgcmV0dXJuIEFycmF5RnJvbSh2KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xufVxuXG52YXIgaXNOb2RlID0gdHlwZW9mIHByb2Nlc3MgIT09IFwidW5kZWZpbmVkXCIgJiZcbiAgICAgICAgY2xhc3NTdHJpbmcocHJvY2VzcykudG9Mb3dlckNhc2UoKSA9PT0gXCJbb2JqZWN0IHByb2Nlc3NdXCI7XG5cbmZ1bmN0aW9uIGVudihrZXksIGRlZikge1xuICAgIHJldHVybiBpc05vZGUgPyBwcm9jZXNzLmVudltrZXldIDogZGVmO1xufVxuXG5mdW5jdGlvbiBnZXROYXRpdmVQcm9taXNlKCkge1xuICAgIGlmICh0eXBlb2YgUHJvbWlzZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKCl7fSk7XG4gICAgICAgICAgICBpZiAoe30udG9TdHJpbmcuY2FsbChwcm9taXNlKSA9PT0gXCJbb2JqZWN0IFByb21pc2VdXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRvbWFpbkJpbmQoc2VsZiwgY2IpIHtcbiAgICByZXR1cm4gc2VsZi5iaW5kKGNiKTtcbn1cblxudmFyIHJldCA9IHtcbiAgICBpc0NsYXNzOiBpc0NsYXNzLFxuICAgIGlzSWRlbnRpZmllcjogaXNJZGVudGlmaWVyLFxuICAgIGluaGVyaXRlZERhdGFLZXlzOiBpbmhlcml0ZWREYXRhS2V5cyxcbiAgICBnZXREYXRhUHJvcGVydHlPckRlZmF1bHQ6IGdldERhdGFQcm9wZXJ0eU9yRGVmYXVsdCxcbiAgICB0aHJvd2VyOiB0aHJvd2VyLFxuICAgIGlzQXJyYXk6IGVzNS5pc0FycmF5LFxuICAgIGFzQXJyYXk6IGFzQXJyYXksXG4gICAgbm90RW51bWVyYWJsZVByb3A6IG5vdEVudW1lcmFibGVQcm9wLFxuICAgIGlzUHJpbWl0aXZlOiBpc1ByaW1pdGl2ZSxcbiAgICBpc09iamVjdDogaXNPYmplY3QsXG4gICAgaXNFcnJvcjogaXNFcnJvcixcbiAgICBjYW5FdmFsdWF0ZTogY2FuRXZhbHVhdGUsXG4gICAgZXJyb3JPYmo6IGVycm9yT2JqLFxuICAgIHRyeUNhdGNoOiB0cnlDYXRjaCxcbiAgICBpbmhlcml0czogaW5oZXJpdHMsXG4gICAgd2l0aEFwcGVuZGVkOiB3aXRoQXBwZW5kZWQsXG4gICAgbWF5YmVXcmFwQXNFcnJvcjogbWF5YmVXcmFwQXNFcnJvcixcbiAgICB0b0Zhc3RQcm9wZXJ0aWVzOiB0b0Zhc3RQcm9wZXJ0aWVzLFxuICAgIGZpbGxlZFJhbmdlOiBmaWxsZWRSYW5nZSxcbiAgICB0b1N0cmluZzogc2FmZVRvU3RyaW5nLFxuICAgIGNhbkF0dGFjaFRyYWNlOiBjYW5BdHRhY2hUcmFjZSxcbiAgICBlbnN1cmVFcnJvck9iamVjdDogZW5zdXJlRXJyb3JPYmplY3QsXG4gICAgb3JpZ2luYXRlc0Zyb21SZWplY3Rpb246IG9yaWdpbmF0ZXNGcm9tUmVqZWN0aW9uLFxuICAgIG1hcmtBc09yaWdpbmF0aW5nRnJvbVJlamVjdGlvbjogbWFya0FzT3JpZ2luYXRpbmdGcm9tUmVqZWN0aW9uLFxuICAgIGNsYXNzU3RyaW5nOiBjbGFzc1N0cmluZyxcbiAgICBjb3B5RGVzY3JpcHRvcnM6IGNvcHlEZXNjcmlwdG9ycyxcbiAgICBoYXNEZXZUb29sczogdHlwZW9mIGNocm9tZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBjaHJvbWUgJiZcbiAgICAgICAgICAgICAgICAgdHlwZW9mIGNocm9tZS5sb2FkVGltZXMgPT09IFwiZnVuY3Rpb25cIixcbiAgICBpc05vZGU6IGlzTm9kZSxcbiAgICBlbnY6IGVudixcbiAgICBnbG9iYWw6IGdsb2JhbE9iamVjdCxcbiAgICBnZXROYXRpdmVQcm9taXNlOiBnZXROYXRpdmVQcm9taXNlLFxuICAgIGRvbWFpbkJpbmQ6IGRvbWFpbkJpbmRcbn07XG5yZXQuaXNSZWNlbnROb2RlID0gcmV0LmlzTm9kZSAmJiAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZlcnNpb24gPSBwcm9jZXNzLnZlcnNpb25zLm5vZGUuc3BsaXQoXCIuXCIpLm1hcChOdW1iZXIpO1xuICAgIHJldHVybiAodmVyc2lvblswXSA9PT0gMCAmJiB2ZXJzaW9uWzFdID4gMTApIHx8ICh2ZXJzaW9uWzBdID4gMCk7XG59KSgpO1xuXG5pZiAocmV0LmlzTm9kZSkgcmV0LnRvRmFzdFByb3BlcnRpZXMocHJvY2Vzcyk7XG5cbnRyeSB7dGhyb3cgbmV3IEVycm9yKCk7IH0gY2F0Y2ggKGUpIHtyZXQubGFzdExpbmVFcnJvciA9IGU7fVxubW9kdWxlLmV4cG9ydHMgPSByZXQ7XG5cbn0se1wiLi9lczVcIjoxM31dfSx7fSxbNF0pKDQpXG59KTsgICAgICAgICAgICAgICAgICAgIDtpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93ICE9PSBudWxsKSB7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5QID0gd2luZG93LlByb21pc2U7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyAmJiBzZWxmICE9PSBudWxsKSB7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLlAgPSBzZWxmLlByb21pc2U7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM3LmFycmF5LmluY2x1ZGVzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX2NvcmUnKS5BcnJheS5pbmNsdWRlczsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYodHlwZW9mIGl0ICE9ICdmdW5jdGlvbicpdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYSBmdW5jdGlvbiEnKTtcbiAgcmV0dXJuIGl0O1xufTsiLCIvLyAyMi4xLjMuMzEgQXJyYXkucHJvdG90eXBlW0BAdW5zY29wYWJsZXNdXG52YXIgVU5TQ09QQUJMRVMgPSByZXF1aXJlKCcuL193a3MnKSgndW5zY29wYWJsZXMnKVxuICAsIEFycmF5UHJvdG8gID0gQXJyYXkucHJvdG90eXBlO1xuaWYoQXJyYXlQcm90b1tVTlNDT1BBQkxFU10gPT0gdW5kZWZpbmVkKXJlcXVpcmUoJy4vX2hpZGUnKShBcnJheVByb3RvLCBVTlNDT1BBQkxFUywge30pO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihrZXkpe1xuICBBcnJheVByb3RvW1VOU0NPUEFCTEVTXVtrZXldID0gdHJ1ZTtcbn07IiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYoIWlzT2JqZWN0KGl0KSl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhbiBvYmplY3QhJyk7XG4gIHJldHVybiBpdDtcbn07IiwiLy8gZmFsc2UgLT4gQXJyYXkjaW5kZXhPZlxuLy8gdHJ1ZSAgLT4gQXJyYXkjaW5jbHVkZXNcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0JylcbiAgLCB0b0xlbmd0aCAgPSByZXF1aXJlKCcuL190by1sZW5ndGgnKVxuICAsIHRvSW5kZXggICA9IHJlcXVpcmUoJy4vX3RvLWluZGV4Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKElTX0lOQ0xVREVTKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKCR0aGlzLCBlbCwgZnJvbUluZGV4KXtcbiAgICB2YXIgTyAgICAgID0gdG9JT2JqZWN0KCR0aGlzKVxuICAgICAgLCBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aClcbiAgICAgICwgaW5kZXggID0gdG9JbmRleChmcm9tSW5kZXgsIGxlbmd0aClcbiAgICAgICwgdmFsdWU7XG4gICAgLy8gQXJyYXkjaW5jbHVkZXMgdXNlcyBTYW1lVmFsdWVaZXJvIGVxdWFsaXR5IGFsZ29yaXRobVxuICAgIGlmKElTX0lOQ0xVREVTICYmIGVsICE9IGVsKXdoaWxlKGxlbmd0aCA+IGluZGV4KXtcbiAgICAgIHZhbHVlID0gT1tpbmRleCsrXTtcbiAgICAgIGlmKHZhbHVlICE9IHZhbHVlKXJldHVybiB0cnVlO1xuICAgIC8vIEFycmF5I3RvSW5kZXggaWdub3JlcyBob2xlcywgQXJyYXkjaW5jbHVkZXMgLSBub3RcbiAgICB9IGVsc2UgZm9yKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKylpZihJU19JTkNMVURFUyB8fCBpbmRleCBpbiBPKXtcbiAgICAgIGlmKE9baW5kZXhdID09PSBlbClyZXR1cm4gSVNfSU5DTFVERVMgfHwgaW5kZXggfHwgMDtcbiAgICB9IHJldHVybiAhSVNfSU5DTFVERVMgJiYgLTE7XG4gIH07XG59OyIsInZhciB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoaXQpLnNsaWNlKDgsIC0xKTtcbn07IiwidmFyIGNvcmUgPSBtb2R1bGUuZXhwb3J0cyA9IHt2ZXJzaW9uOiAnMi40LjAnfTtcbmlmKHR5cGVvZiBfX2UgPT0gJ251bWJlcicpX19lID0gY29yZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZiIsIi8vIG9wdGlvbmFsIC8gc2ltcGxlIGNvbnRleHQgYmluZGluZ1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4vX2EtZnVuY3Rpb24nKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZm4sIHRoYXQsIGxlbmd0aCl7XG4gIGFGdW5jdGlvbihmbik7XG4gIGlmKHRoYXQgPT09IHVuZGVmaW5lZClyZXR1cm4gZm47XG4gIHN3aXRjaChsZW5ndGgpe1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uKGEpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSk7XG4gICAgfTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbihhLCBiKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIpO1xuICAgIH07XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24oYSwgYiwgYyl7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiLCBjKTtcbiAgICB9O1xuICB9XG4gIHJldHVybiBmdW5jdGlvbigvKiAuLi5hcmdzICovKXtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcbiAgfTtcbn07IiwiLy8gNy4yLjEgUmVxdWlyZU9iamVjdENvZXJjaWJsZShhcmd1bWVudClcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZihpdCA9PSB1bmRlZmluZWQpdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY2FsbCBtZXRob2Qgb24gIFwiICsgaXQpO1xuICByZXR1cm4gaXQ7XG59OyIsIi8vIFRoYW5rJ3MgSUU4IGZvciBoaXMgZnVubnkgZGVmaW5lUHJvcGVydHlcbm1vZHVsZS5leHBvcnRzID0gIXJlcXVpcmUoJy4vX2ZhaWxzJykoZnVuY3Rpb24oKXtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ2EnLCB7Z2V0OiBmdW5jdGlvbigpeyByZXR1cm4gNzsgfX0pLmEgIT0gNztcbn0pOyIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpXG4gICwgZG9jdW1lbnQgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5kb2N1bWVudFxuICAvLyBpbiBvbGQgSUUgdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgaXMgJ29iamVjdCdcbiAgLCBpcyA9IGlzT2JqZWN0KGRvY3VtZW50KSAmJiBpc09iamVjdChkb2N1bWVudC5jcmVhdGVFbGVtZW50KTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXMgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGl0KSA6IHt9O1xufTsiLCJ2YXIgZ2xvYmFsICAgID0gcmVxdWlyZSgnLi9fZ2xvYmFsJylcbiAgLCBjb3JlICAgICAgPSByZXF1aXJlKCcuL19jb3JlJylcbiAgLCBoaWRlICAgICAgPSByZXF1aXJlKCcuL19oaWRlJylcbiAgLCByZWRlZmluZSAgPSByZXF1aXJlKCcuL19yZWRlZmluZScpXG4gICwgY3R4ICAgICAgID0gcmVxdWlyZSgnLi9fY3R4JylcbiAgLCBQUk9UT1RZUEUgPSAncHJvdG90eXBlJztcblxudmFyICRleHBvcnQgPSBmdW5jdGlvbih0eXBlLCBuYW1lLCBzb3VyY2Upe1xuICB2YXIgSVNfRk9SQ0VEID0gdHlwZSAmICRleHBvcnQuRlxuICAgICwgSVNfR0xPQkFMID0gdHlwZSAmICRleHBvcnQuR1xuICAgICwgSVNfU1RBVElDID0gdHlwZSAmICRleHBvcnQuU1xuICAgICwgSVNfUFJPVE8gID0gdHlwZSAmICRleHBvcnQuUFxuICAgICwgSVNfQklORCAgID0gdHlwZSAmICRleHBvcnQuQlxuICAgICwgdGFyZ2V0ICAgID0gSVNfR0xPQkFMID8gZ2xvYmFsIDogSVNfU1RBVElDID8gZ2xvYmFsW25hbWVdIHx8IChnbG9iYWxbbmFtZV0gPSB7fSkgOiAoZ2xvYmFsW25hbWVdIHx8IHt9KVtQUk9UT1RZUEVdXG4gICAgLCBleHBvcnRzICAgPSBJU19HTE9CQUwgPyBjb3JlIDogY29yZVtuYW1lXSB8fCAoY29yZVtuYW1lXSA9IHt9KVxuICAgICwgZXhwUHJvdG8gID0gZXhwb3J0c1tQUk9UT1RZUEVdIHx8IChleHBvcnRzW1BST1RPVFlQRV0gPSB7fSlcbiAgICAsIGtleSwgb3duLCBvdXQsIGV4cDtcbiAgaWYoSVNfR0xPQkFMKXNvdXJjZSA9IG5hbWU7XG4gIGZvcihrZXkgaW4gc291cmNlKXtcbiAgICAvLyBjb250YWlucyBpbiBuYXRpdmVcbiAgICBvd24gPSAhSVNfRk9SQ0VEICYmIHRhcmdldCAmJiB0YXJnZXRba2V5XSAhPT0gdW5kZWZpbmVkO1xuICAgIC8vIGV4cG9ydCBuYXRpdmUgb3IgcGFzc2VkXG4gICAgb3V0ID0gKG93biA/IHRhcmdldCA6IHNvdXJjZSlba2V5XTtcbiAgICAvLyBiaW5kIHRpbWVycyB0byBnbG9iYWwgZm9yIGNhbGwgZnJvbSBleHBvcnQgY29udGV4dFxuICAgIGV4cCA9IElTX0JJTkQgJiYgb3duID8gY3R4KG91dCwgZ2xvYmFsKSA6IElTX1BST1RPICYmIHR5cGVvZiBvdXQgPT0gJ2Z1bmN0aW9uJyA/IGN0eChGdW5jdGlvbi5jYWxsLCBvdXQpIDogb3V0O1xuICAgIC8vIGV4dGVuZCBnbG9iYWxcbiAgICBpZih0YXJnZXQpcmVkZWZpbmUodGFyZ2V0LCBrZXksIG91dCwgdHlwZSAmICRleHBvcnQuVSk7XG4gICAgLy8gZXhwb3J0XG4gICAgaWYoZXhwb3J0c1trZXldICE9IG91dCloaWRlKGV4cG9ydHMsIGtleSwgZXhwKTtcbiAgICBpZihJU19QUk9UTyAmJiBleHBQcm90b1trZXldICE9IG91dClleHBQcm90b1trZXldID0gb3V0O1xuICB9XG59O1xuZ2xvYmFsLmNvcmUgPSBjb3JlO1xuLy8gdHlwZSBiaXRtYXBcbiRleHBvcnQuRiA9IDE7ICAgLy8gZm9yY2VkXG4kZXhwb3J0LkcgPSAyOyAgIC8vIGdsb2JhbFxuJGV4cG9ydC5TID0gNDsgICAvLyBzdGF0aWNcbiRleHBvcnQuUCA9IDg7ICAgLy8gcHJvdG9cbiRleHBvcnQuQiA9IDE2OyAgLy8gYmluZFxuJGV4cG9ydC5XID0gMzI7ICAvLyB3cmFwXG4kZXhwb3J0LlUgPSA2NDsgIC8vIHNhZmVcbiRleHBvcnQuUiA9IDEyODsgLy8gcmVhbCBwcm90byBtZXRob2QgZm9yIGBsaWJyYXJ5YCBcbm1vZHVsZS5leHBvcnRzID0gJGV4cG9ydDsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGV4ZWMpe1xuICB0cnkge1xuICAgIHJldHVybiAhIWV4ZWMoKTtcbiAgfSBjYXRjaChlKXtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTsiLCIvLyBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qcy9pc3N1ZXMvODYjaXNzdWVjb21tZW50LTExNTc1OTAyOFxudmFyIGdsb2JhbCA9IG1vZHVsZS5leHBvcnRzID0gdHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuTWF0aCA9PSBNYXRoXG4gID8gd2luZG93IDogdHlwZW9mIHNlbGYgIT0gJ3VuZGVmaW5lZCcgJiYgc2VsZi5NYXRoID09IE1hdGggPyBzZWxmIDogRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbmlmKHR5cGVvZiBfX2cgPT0gJ251bWJlcicpX19nID0gZ2xvYmFsOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmIiwidmFyIGhhc093blByb3BlcnR5ID0ge30uaGFzT3duUHJvcGVydHk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0LCBrZXkpe1xuICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChpdCwga2V5KTtcbn07IiwidmFyIGRQICAgICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKVxuICAsIGNyZWF0ZURlc2MgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBmdW5jdGlvbihvYmplY3QsIGtleSwgdmFsdWUpe1xuICByZXR1cm4gZFAuZihvYmplY3QsIGtleSwgY3JlYXRlRGVzYygxLCB2YWx1ZSkpO1xufSA6IGZ1bmN0aW9uKG9iamVjdCwga2V5LCB2YWx1ZSl7XG4gIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIHJldHVybiBvYmplY3Q7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gIXJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgJiYgIXJlcXVpcmUoJy4vX2ZhaWxzJykoZnVuY3Rpb24oKXtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShyZXF1aXJlKCcuL19kb20tY3JlYXRlJykoJ2RpdicpLCAnYScsIHtnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiA3OyB9fSkuYSAhPSA3O1xufSk7IiwiLy8gZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBhbmQgbm9uLWVudW1lcmFibGUgb2xkIFY4IHN0cmluZ3NcbnZhciBjb2YgPSByZXF1aXJlKCcuL19jb2YnKTtcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0KCd6JykucHJvcGVydHlJc0VudW1lcmFibGUoMCkgPyBPYmplY3QgOiBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBjb2YoaXQpID09ICdTdHJpbmcnID8gaXQuc3BsaXQoJycpIDogT2JqZWN0KGl0KTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiB0eXBlb2YgaXQgPT09ICdvYmplY3QnID8gaXQgIT09IG51bGwgOiB0eXBlb2YgaXQgPT09ICdmdW5jdGlvbic7XG59OyIsInZhciBhbk9iamVjdCAgICAgICA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpXG4gICwgSUU4X0RPTV9ERUZJTkUgPSByZXF1aXJlKCcuL19pZTgtZG9tLWRlZmluZScpXG4gICwgdG9QcmltaXRpdmUgICAgPSByZXF1aXJlKCcuL190by1wcmltaXRpdmUnKVxuICAsIGRQICAgICAgICAgICAgID0gT2JqZWN0LmRlZmluZVByb3BlcnR5O1xuXG5leHBvcnRzLmYgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gT2JqZWN0LmRlZmluZVByb3BlcnR5IDogZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcyl7XG4gIGFuT2JqZWN0KE8pO1xuICBQID0gdG9QcmltaXRpdmUoUCwgdHJ1ZSk7XG4gIGFuT2JqZWN0KEF0dHJpYnV0ZXMpO1xuICBpZihJRThfRE9NX0RFRklORSl0cnkge1xuICAgIHJldHVybiBkUChPLCBQLCBBdHRyaWJ1dGVzKTtcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuICBpZignZ2V0JyBpbiBBdHRyaWJ1dGVzIHx8ICdzZXQnIGluIEF0dHJpYnV0ZXMpdGhyb3cgVHlwZUVycm9yKCdBY2Nlc3NvcnMgbm90IHN1cHBvcnRlZCEnKTtcbiAgaWYoJ3ZhbHVlJyBpbiBBdHRyaWJ1dGVzKU9bUF0gPSBBdHRyaWJ1dGVzLnZhbHVlO1xuICByZXR1cm4gTztcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihiaXRtYXAsIHZhbHVlKXtcbiAgcmV0dXJuIHtcbiAgICBlbnVtZXJhYmxlICA6ICEoYml0bWFwICYgMSksXG4gICAgY29uZmlndXJhYmxlOiAhKGJpdG1hcCAmIDIpLFxuICAgIHdyaXRhYmxlICAgIDogIShiaXRtYXAgJiA0KSxcbiAgICB2YWx1ZSAgICAgICA6IHZhbHVlXG4gIH07XG59OyIsInZhciBnbG9iYWwgICAgPSByZXF1aXJlKCcuL19nbG9iYWwnKVxuICAsIGhpZGUgICAgICA9IHJlcXVpcmUoJy4vX2hpZGUnKVxuICAsIGhhcyAgICAgICA9IHJlcXVpcmUoJy4vX2hhcycpXG4gICwgU1JDICAgICAgID0gcmVxdWlyZSgnLi9fdWlkJykoJ3NyYycpXG4gICwgVE9fU1RSSU5HID0gJ3RvU3RyaW5nJ1xuICAsICR0b1N0cmluZyA9IEZ1bmN0aW9uW1RPX1NUUklOR11cbiAgLCBUUEwgICAgICAgPSAoJycgKyAkdG9TdHJpbmcpLnNwbGl0KFRPX1NUUklORyk7XG5cbnJlcXVpcmUoJy4vX2NvcmUnKS5pbnNwZWN0U291cmNlID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gJHRvU3RyaW5nLmNhbGwoaXQpO1xufTtcblxuKG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oTywga2V5LCB2YWwsIHNhZmUpe1xuICB2YXIgaXNGdW5jdGlvbiA9IHR5cGVvZiB2YWwgPT0gJ2Z1bmN0aW9uJztcbiAgaWYoaXNGdW5jdGlvbiloYXModmFsLCAnbmFtZScpIHx8IGhpZGUodmFsLCAnbmFtZScsIGtleSk7XG4gIGlmKE9ba2V5XSA9PT0gdmFsKXJldHVybjtcbiAgaWYoaXNGdW5jdGlvbiloYXModmFsLCBTUkMpIHx8IGhpZGUodmFsLCBTUkMsIE9ba2V5XSA/ICcnICsgT1trZXldIDogVFBMLmpvaW4oU3RyaW5nKGtleSkpKTtcbiAgaWYoTyA9PT0gZ2xvYmFsKXtcbiAgICBPW2tleV0gPSB2YWw7XG4gIH0gZWxzZSB7XG4gICAgaWYoIXNhZmUpe1xuICAgICAgZGVsZXRlIE9ba2V5XTtcbiAgICAgIGhpZGUoTywga2V5LCB2YWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZihPW2tleV0pT1trZXldID0gdmFsO1xuICAgICAgZWxzZSBoaWRlKE8sIGtleSwgdmFsKTtcbiAgICB9XG4gIH1cbi8vIGFkZCBmYWtlIEZ1bmN0aW9uI3RvU3RyaW5nIGZvciBjb3JyZWN0IHdvcmsgd3JhcHBlZCBtZXRob2RzIC8gY29uc3RydWN0b3JzIHdpdGggbWV0aG9kcyBsaWtlIExvRGFzaCBpc05hdGl2ZVxufSkoRnVuY3Rpb24ucHJvdG90eXBlLCBUT19TVFJJTkcsIGZ1bmN0aW9uIHRvU3RyaW5nKCl7XG4gIHJldHVybiB0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nICYmIHRoaXNbU1JDXSB8fCAkdG9TdHJpbmcuY2FsbCh0aGlzKTtcbn0pOyIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKVxuICAsIFNIQVJFRCA9ICdfX2NvcmUtanNfc2hhcmVkX18nXG4gICwgc3RvcmUgID0gZ2xvYmFsW1NIQVJFRF0gfHwgKGdsb2JhbFtTSEFSRURdID0ge30pO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihrZXkpe1xuICByZXR1cm4gc3RvcmVba2V5XSB8fCAoc3RvcmVba2V5XSA9IHt9KTtcbn07IiwidmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vX3RvLWludGVnZXInKVxuICAsIG1heCAgICAgICA9IE1hdGgubWF4XG4gICwgbWluICAgICAgID0gTWF0aC5taW47XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGluZGV4LCBsZW5ndGgpe1xuICBpbmRleCA9IHRvSW50ZWdlcihpbmRleCk7XG4gIHJldHVybiBpbmRleCA8IDAgPyBtYXgoaW5kZXggKyBsZW5ndGgsIDApIDogbWluKGluZGV4LCBsZW5ndGgpO1xufTsiLCIvLyA3LjEuNCBUb0ludGVnZXJcbnZhciBjZWlsICA9IE1hdGguY2VpbFxuICAsIGZsb29yID0gTWF0aC5mbG9vcjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXNOYU4oaXQgPSAraXQpID8gMCA6IChpdCA+IDAgPyBmbG9vciA6IGNlaWwpKGl0KTtcbn07IiwiLy8gdG8gaW5kZXhlZCBvYmplY3QsIHRvT2JqZWN0IHdpdGggZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBzdHJpbmdzXG52YXIgSU9iamVjdCA9IHJlcXVpcmUoJy4vX2lvYmplY3QnKVxuICAsIGRlZmluZWQgPSByZXF1aXJlKCcuL19kZWZpbmVkJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIElPYmplY3QoZGVmaW5lZChpdCkpO1xufTsiLCIvLyA3LjEuMTUgVG9MZW5ndGhcbnZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuL190by1pbnRlZ2VyJylcbiAgLCBtaW4gICAgICAgPSBNYXRoLm1pbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXQgPiAwID8gbWluKHRvSW50ZWdlcihpdCksIDB4MWZmZmZmZmZmZmZmZmYpIDogMDsgLy8gcG93KDIsIDUzKSAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MVxufTsiLCIvLyA3LjEuMSBUb1ByaW1pdGl2ZShpbnB1dCBbLCBQcmVmZXJyZWRUeXBlXSlcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xuLy8gaW5zdGVhZCBvZiB0aGUgRVM2IHNwZWMgdmVyc2lvbiwgd2UgZGlkbid0IGltcGxlbWVudCBAQHRvUHJpbWl0aXZlIGNhc2Vcbi8vIGFuZCB0aGUgc2Vjb25kIGFyZ3VtZW50IC0gZmxhZyAtIHByZWZlcnJlZCB0eXBlIGlzIGEgc3RyaW5nXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0LCBTKXtcbiAgaWYoIWlzT2JqZWN0KGl0KSlyZXR1cm4gaXQ7XG4gIHZhciBmbiwgdmFsO1xuICBpZihTICYmIHR5cGVvZiAoZm4gPSBpdC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKXJldHVybiB2YWw7XG4gIGlmKHR5cGVvZiAoZm4gPSBpdC52YWx1ZU9mKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpcmV0dXJuIHZhbDtcbiAgaWYoIVMgJiYgdHlwZW9mIChmbiA9IGl0LnRvU3RyaW5nKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpcmV0dXJuIHZhbDtcbiAgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY29udmVydCBvYmplY3QgdG8gcHJpbWl0aXZlIHZhbHVlXCIpO1xufTsiLCJ2YXIgaWQgPSAwXG4gICwgcHggPSBNYXRoLnJhbmRvbSgpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihrZXkpe1xuICByZXR1cm4gJ1N5bWJvbCgnLmNvbmNhdChrZXkgPT09IHVuZGVmaW5lZCA/ICcnIDoga2V5LCAnKV8nLCAoKytpZCArIHB4KS50b1N0cmluZygzNikpO1xufTsiLCJ2YXIgc3RvcmUgICAgICA9IHJlcXVpcmUoJy4vX3NoYXJlZCcpKCd3a3MnKVxuICAsIHVpZCAgICAgICAgPSByZXF1aXJlKCcuL191aWQnKVxuICAsIFN5bWJvbCAgICAgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5TeW1ib2xcbiAgLCBVU0VfU1lNQk9MID0gdHlwZW9mIFN5bWJvbCA9PSAnZnVuY3Rpb24nO1xuXG52YXIgJGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5hbWUpe1xuICByZXR1cm4gc3RvcmVbbmFtZV0gfHwgKHN0b3JlW25hbWVdID1cbiAgICBVU0VfU1lNQk9MICYmIFN5bWJvbFtuYW1lXSB8fCAoVVNFX1NZTUJPTCA/IFN5bWJvbCA6IHVpZCkoJ1N5bWJvbC4nICsgbmFtZSkpO1xufTtcblxuJGV4cG9ydHMuc3RvcmUgPSBzdG9yZTsiLCIndXNlIHN0cmljdCc7XG4vLyBodHRwczovL2dpdGh1Yi5jb20vdGMzOS9BcnJheS5wcm90b3R5cGUuaW5jbHVkZXNcbnZhciAkZXhwb3J0ICAgPSByZXF1aXJlKCcuL19leHBvcnQnKVxuICAsICRpbmNsdWRlcyA9IHJlcXVpcmUoJy4vX2FycmF5LWluY2x1ZGVzJykodHJ1ZSk7XG5cbiRleHBvcnQoJGV4cG9ydC5QLCAnQXJyYXknLCB7XG4gIGluY2x1ZGVzOiBmdW5jdGlvbiBpbmNsdWRlcyhlbCAvKiwgZnJvbUluZGV4ID0gMCAqLyl7XG4gICAgcmV0dXJuICRpbmNsdWRlcyh0aGlzLCBlbCwgYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWQpO1xuICB9XG59KTtcblxucmVxdWlyZSgnLi9fYWRkLXRvLXVuc2NvcGFibGVzJykoJ2luY2x1ZGVzJyk7IiwiLyohXG4gKiBEcmFnZ2FiaWxseSB2Mi4xLjFcbiAqIE1ha2UgdGhhdCBzaGl6IGRyYWdnYWJsZVxuICogaHR0cDovL2RyYWdnYWJpbGx5LmRlc2FuZHJvLmNvbVxuICogTUlUIGxpY2Vuc2VcbiAqL1xuXG4vKmpzaGludCBicm93c2VyOiB0cnVlLCBzdHJpY3Q6IHRydWUsIHVuZGVmOiB0cnVlLCB1bnVzZWQ6IHRydWUgKi9cblxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLyoganNoaW50IHN0cmljdDogZmFsc2UgKi8gLypnbG9iYWxzIGRlZmluZSwgbW9kdWxlLCByZXF1aXJlICovXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EXG4gICAgZGVmaW5lKCBbXG4gICAgICAgICdnZXQtc2l6ZS9nZXQtc2l6ZScsXG4gICAgICAgICd1bmlkcmFnZ2VyL3VuaWRyYWdnZXInXG4gICAgICBdLFxuICAgICAgZnVuY3Rpb24oIGdldFNpemUsIFVuaWRyYWdnZXIgKSB7XG4gICAgICAgIHJldHVybiBmYWN0b3J5KCB3aW5kb3csIGdldFNpemUsIFVuaWRyYWdnZXIgKTtcbiAgICAgIH0pO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgcmVxdWlyZSgnZ2V0LXNpemUnKSxcbiAgICAgIHJlcXVpcmUoJ3VuaWRyYWdnZXInKVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICB3aW5kb3cuRHJhZ2dhYmlsbHkgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgd2luZG93LmdldFNpemUsXG4gICAgICB3aW5kb3cuVW5pZHJhZ2dlclxuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIGdldFNpemUsIFVuaWRyYWdnZXIgKSB7XG5cbid1c2Ugc3RyaWN0JztcblxuLy8gdmFyc1xudmFyIGRvY3VtZW50ID0gd2luZG93LmRvY3VtZW50O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gaGVscGVycyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vLyBleHRlbmQgb2JqZWN0c1xuZnVuY3Rpb24gZXh0ZW5kKCBhLCBiICkge1xuICBmb3IgKCB2YXIgcHJvcCBpbiBiICkge1xuICAgIGFbIHByb3AgXSA9IGJbIHByb3AgXTtcbiAgfVxuICByZXR1cm4gYTtcbn1cblxuZnVuY3Rpb24gaXNFbGVtZW50KCBvYmogKSB7XG4gIHJldHVybiBvYmogaW5zdGFuY2VvZiBIVE1MRWxlbWVudDtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8vIGdldCByQUYsIHByZWZpeGVkLCBpZiBwcmVzZW50XG52YXIgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cbi8vIGZhbGxiYWNrIHRvIHNldFRpbWVvdXRcbnZhciBsYXN0VGltZSA9IDA7XG5pZiAoICFyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgKSAge1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbiggY2FsbGJhY2sgKSB7XG4gICAgdmFyIGN1cnJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgdmFyIHRpbWVUb0NhbGwgPSBNYXRoLm1heCggMCwgMTYgLSAoIGN1cnJUaW1lIC0gbGFzdFRpbWUgKSApO1xuICAgIHZhciBpZCA9IHNldFRpbWVvdXQoIGNhbGxiYWNrLCB0aW1lVG9DYWxsICk7XG4gICAgbGFzdFRpbWUgPSBjdXJyVGltZSArIHRpbWVUb0NhbGw7XG4gICAgcmV0dXJuIGlkO1xuICB9O1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBzdXBwb3J0IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnZhciBkb2NFbGVtID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xudmFyIHRyYW5zZm9ybVByb3BlcnR5ID0gdHlwZW9mIGRvY0VsZW0uc3R5bGUudHJhbnNmb3JtID09ICdzdHJpbmcnID9cbiAgJ3RyYW5zZm9ybScgOiAnV2Via2l0VHJhbnNmb3JtJztcblxudmFyIGpRdWVyeSA9IHdpbmRvdy5qUXVlcnk7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5mdW5jdGlvbiBEcmFnZ2FiaWxseSggZWxlbWVudCwgb3B0aW9ucyApIHtcbiAgLy8gcXVlcnlTZWxlY3RvciBpZiBzdHJpbmdcbiAgdGhpcy5lbGVtZW50ID0gdHlwZW9mIGVsZW1lbnQgPT0gJ3N0cmluZycgP1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIGVsZW1lbnQgKSA6IGVsZW1lbnQ7XG5cbiAgaWYgKCBqUXVlcnkgKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGpRdWVyeSggdGhpcy5lbGVtZW50ICk7XG4gIH1cblxuICAvLyBvcHRpb25zXG4gIHRoaXMub3B0aW9ucyA9IGV4dGVuZCgge30sIHRoaXMuY29uc3RydWN0b3IuZGVmYXVsdHMgKTtcbiAgdGhpcy5vcHRpb24oIG9wdGlvbnMgKTtcblxuICB0aGlzLl9jcmVhdGUoKTtcbn1cblxuLy8gaW5oZXJpdCBVbmlkcmFnZ2VyIG1ldGhvZHNcbnZhciBwcm90byA9IERyYWdnYWJpbGx5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFVuaWRyYWdnZXIucHJvdG90eXBlICk7XG5cbkRyYWdnYWJpbGx5LmRlZmF1bHRzID0ge1xufTtcblxuLyoqXG4gKiBzZXQgb3B0aW9uc1xuICogQHBhcmFtIHtPYmplY3R9IG9wdHNcbiAqL1xucHJvdG8ub3B0aW9uID0gZnVuY3Rpb24oIG9wdHMgKSB7XG4gIGV4dGVuZCggdGhpcy5vcHRpb25zLCBvcHRzICk7XG59O1xuXG4vLyBjc3MgcG9zaXRpb24gdmFsdWVzIHRoYXQgZG9uJ3QgbmVlZCB0byBiZSBzZXRcbnZhciBwb3NpdGlvblZhbHVlcyA9IHtcbiAgcmVsYXRpdmU6IHRydWUsXG4gIGFic29sdXRlOiB0cnVlLFxuICBmaXhlZDogdHJ1ZVxufTtcblxucHJvdG8uX2NyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuXG4gIC8vIHByb3BlcnRpZXNcbiAgdGhpcy5wb3NpdGlvbiA9IHt9O1xuICB0aGlzLl9nZXRQb3NpdGlvbigpO1xuXG4gIHRoaXMuc3RhcnRQb2ludCA9IHsgeDogMCwgeTogMCB9O1xuICB0aGlzLmRyYWdQb2ludCA9IHsgeDogMCwgeTogMCB9O1xuXG4gIHRoaXMuc3RhcnRQb3NpdGlvbiA9IGV4dGVuZCgge30sIHRoaXMucG9zaXRpb24gKTtcblxuICAvLyBzZXQgcmVsYXRpdmUgcG9zaXRpb25pbmdcbiAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZSggdGhpcy5lbGVtZW50ICk7XG4gIGlmICggIXBvc2l0aW9uVmFsdWVzWyBzdHlsZS5wb3NpdGlvbiBdICkge1xuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdyZWxhdGl2ZSc7XG4gIH1cblxuICB0aGlzLmVuYWJsZSgpO1xuICB0aGlzLnNldEhhbmRsZXMoKTtcblxufTtcblxuLyoqXG4gKiBzZXQgdGhpcy5oYW5kbGVzIGFuZCBiaW5kIHN0YXJ0IGV2ZW50cyB0byAnZW1cbiAqL1xucHJvdG8uc2V0SGFuZGxlcyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmhhbmRsZXMgPSB0aGlzLm9wdGlvbnMuaGFuZGxlID9cbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCggdGhpcy5vcHRpb25zLmhhbmRsZSApIDogWyB0aGlzLmVsZW1lbnQgXTtcblxuICB0aGlzLmJpbmRIYW5kbGVzKCk7XG59O1xuXG4vKipcbiAqIGVtaXRzIGV2ZW50cyB2aWEgRXZFbWl0dGVyIGFuZCBqUXVlcnkgZXZlbnRzXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZSAtIG5hbWUgb2YgZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gb3JpZ2luYWwgZXZlbnRcbiAqIEBwYXJhbSB7QXJyYXl9IGFyZ3MgLSBleHRyYSBhcmd1bWVudHNcbiAqL1xucHJvdG8uZGlzcGF0Y2hFdmVudCA9IGZ1bmN0aW9uKCB0eXBlLCBldmVudCwgYXJncyApIHtcbiAgdmFyIGVtaXRBcmdzID0gWyBldmVudCBdLmNvbmNhdCggYXJncyApO1xuICB0aGlzLmVtaXRFdmVudCggdHlwZSwgZW1pdEFyZ3MgKTtcbiAgdmFyIGpRdWVyeSA9IHdpbmRvdy5qUXVlcnk7XG4gIC8vIHRyaWdnZXIgalF1ZXJ5IGV2ZW50XG4gIGlmICggalF1ZXJ5ICYmIHRoaXMuJGVsZW1lbnQgKSB7XG4gICAgaWYgKCBldmVudCApIHtcbiAgICAgIC8vIGNyZWF0ZSBqUXVlcnkgZXZlbnRcbiAgICAgIHZhciAkZXZlbnQgPSBqUXVlcnkuRXZlbnQoIGV2ZW50ICk7XG4gICAgICAkZXZlbnQudHlwZSA9IHR5cGU7XG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoICRldmVudCwgYXJncyApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBqdXN0IHRyaWdnZXIgd2l0aCB0eXBlIGlmIG5vIGV2ZW50IGF2YWlsYWJsZVxuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCB0eXBlLCBhcmdzICk7XG4gICAgfVxuICB9XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBwb3NpdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vLyBnZXQgeC95IHBvc2l0aW9uIGZyb20gc3R5bGVcbnByb3RvLl9nZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKCB0aGlzLmVsZW1lbnQgKTtcbiAgdmFyIHggPSB0aGlzLl9nZXRQb3NpdGlvbkNvb3JkKCBzdHlsZS5sZWZ0LCAnd2lkdGgnICk7XG4gIHZhciB5ID0gdGhpcy5fZ2V0UG9zaXRpb25Db29yZCggc3R5bGUudG9wLCAnaGVpZ2h0JyApO1xuICAvLyBjbGVhbiB1cCAnYXV0bycgb3Igb3RoZXIgbm9uLWludGVnZXIgdmFsdWVzXG4gIHRoaXMucG9zaXRpb24ueCA9IGlzTmFOKCB4ICkgPyAwIDogeDtcbiAgdGhpcy5wb3NpdGlvbi55ID0gaXNOYU4oIHkgKSA/IDAgOiB5O1xuXG4gIHRoaXMuX2FkZFRyYW5zZm9ybVBvc2l0aW9uKCBzdHlsZSApO1xufTtcblxucHJvdG8uX2dldFBvc2l0aW9uQ29vcmQgPSBmdW5jdGlvbiggc3R5bGVTaWRlLCBtZWFzdXJlICkge1xuICBpZiAoIHN0eWxlU2lkZS5pbmRleE9mKCclJykgIT0gLTEgKSB7XG4gICAgLy8gY29udmVydCBwZXJjZW50IGludG8gcGl4ZWwgZm9yIFNhZmFyaSwgIzc1XG4gICAgdmFyIHBhcmVudFNpemUgPSBnZXRTaXplKCB0aGlzLmVsZW1lbnQucGFyZW50Tm9kZSApO1xuICAgIC8vIHByZXZlbnQgbm90LWluLURPTSBlbGVtZW50IHRocm93aW5nIGJ1ZywgIzEzMVxuICAgIHJldHVybiAhcGFyZW50U2l6ZSA/IDAgOlxuICAgICAgKCBwYXJzZUZsb2F0KCBzdHlsZVNpZGUgKSAvIDEwMCApICogcGFyZW50U2l6ZVsgbWVhc3VyZSBdO1xuICB9XG4gIHJldHVybiBwYXJzZUludCggc3R5bGVTaWRlLCAxMCApO1xufTtcblxuLy8gYWRkIHRyYW5zZm9ybTogdHJhbnNsYXRlKCB4LCB5ICkgdG8gcG9zaXRpb25cbnByb3RvLl9hZGRUcmFuc2Zvcm1Qb3NpdGlvbiA9IGZ1bmN0aW9uKCBzdHlsZSApIHtcbiAgdmFyIHRyYW5zZm9ybSA9IHN0eWxlWyB0cmFuc2Zvcm1Qcm9wZXJ0eSBdO1xuICAvLyBiYWlsIG91dCBpZiB2YWx1ZSBpcyAnbm9uZSdcbiAgaWYgKCB0cmFuc2Zvcm0uaW5kZXhPZignbWF0cml4JykgIT09IDAgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIHNwbGl0IG1hdHJpeCgxLCAwLCAwLCAxLCB4LCB5KVxuICB2YXIgbWF0cml4VmFsdWVzID0gdHJhbnNmb3JtLnNwbGl0KCcsJyk7XG4gIC8vIHRyYW5zbGF0ZSBYIHZhbHVlIGlzIGluIDEydGggb3IgNHRoIHBvc2l0aW9uXG4gIHZhciB4SW5kZXggPSB0cmFuc2Zvcm0uaW5kZXhPZignbWF0cml4M2QnKSA9PT0gMCA/IDEyIDogNDtcbiAgdmFyIHRyYW5zbGF0ZVggPSBwYXJzZUludCggbWF0cml4VmFsdWVzWyB4SW5kZXggXSwgMTAgKTtcbiAgLy8gdHJhbnNsYXRlIFkgdmFsdWUgaXMgaW4gMTN0aCBvciA1dGggcG9zaXRpb25cbiAgdmFyIHRyYW5zbGF0ZVkgPSBwYXJzZUludCggbWF0cml4VmFsdWVzWyB4SW5kZXggKyAxIF0sIDEwICk7XG4gIHRoaXMucG9zaXRpb24ueCArPSB0cmFuc2xhdGVYO1xuICB0aGlzLnBvc2l0aW9uLnkgKz0gdHJhbnNsYXRlWTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGV2ZW50cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vKipcbiAqIHBvaW50ZXIgc3RhcnRcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50IG9yIFRvdWNofSBwb2ludGVyXG4gKi9cbnByb3RvLnBvaW50ZXJEb3duID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLl9kcmFnUG9pbnRlckRvd24oIGV2ZW50LCBwb2ludGVyICk7XG4gIC8vIGtsdWRnZSB0byBibHVyIGZvY3VzZWQgaW5wdXRzIGluIGRyYWdnZXJcbiAgdmFyIGZvY3VzZWQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICAvLyBkbyBub3QgYmx1ciBib2R5IGZvciBJRTEwLCBtZXRhZml6enkvZmxpY2tpdHkjMTE3XG4gIGlmICggZm9jdXNlZCAmJiBmb2N1c2VkLmJsdXIgJiYgZm9jdXNlZCAhPSBkb2N1bWVudC5ib2R5ICkge1xuICAgIGZvY3VzZWQuYmx1cigpO1xuICB9XG4gIC8vIGJpbmQgbW92ZSBhbmQgZW5kIGV2ZW50c1xuICB0aGlzLl9iaW5kUG9zdFN0YXJ0RXZlbnRzKCBldmVudCApO1xuICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtcG9pbnRlci1kb3duJyk7XG4gIHRoaXMuZGlzcGF0Y2hFdmVudCggJ3BvaW50ZXJEb3duJywgZXZlbnQsIFsgcG9pbnRlciBdICk7XG59O1xuXG4vKipcbiAqIGRyYWcgbW92ZVxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgb3IgVG91Y2h9IHBvaW50ZXJcbiAqL1xucHJvdG8ucG9pbnRlck1vdmUgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHZhciBtb3ZlVmVjdG9yID0gdGhpcy5fZHJhZ1BvaW50ZXJNb3ZlKCBldmVudCwgcG9pbnRlciApO1xuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdwb2ludGVyTW92ZScsIGV2ZW50LCBbIHBvaW50ZXIsIG1vdmVWZWN0b3IgXSApO1xuICB0aGlzLl9kcmFnTW92ZSggZXZlbnQsIHBvaW50ZXIsIG1vdmVWZWN0b3IgKTtcbn07XG5cbi8qKlxuICogZHJhZyBzdGFydFxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgb3IgVG91Y2h9IHBvaW50ZXJcbiAqL1xucHJvdG8uZHJhZ1N0YXJ0ID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICBpZiAoICF0aGlzLmlzRW5hYmxlZCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5fZ2V0UG9zaXRpb24oKTtcbiAgdGhpcy5tZWFzdXJlQ29udGFpbm1lbnQoKTtcbiAgLy8gcG9zaXRpb24gX3doZW5fIGRyYWcgYmVnYW5cbiAgdGhpcy5zdGFydFBvc2l0aW9uLnggPSB0aGlzLnBvc2l0aW9uLng7XG4gIHRoaXMuc3RhcnRQb3NpdGlvbi55ID0gdGhpcy5wb3NpdGlvbi55O1xuICAvLyByZXNldCBsZWZ0L3RvcCBzdHlsZVxuICB0aGlzLnNldExlZnRUb3AoKTtcblxuICB0aGlzLmRyYWdQb2ludC54ID0gMDtcbiAgdGhpcy5kcmFnUG9pbnQueSA9IDA7XG5cbiAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lzLWRyYWdnaW5nJyk7XG4gIHRoaXMuZGlzcGF0Y2hFdmVudCggJ2RyYWdTdGFydCcsIGV2ZW50LCBbIHBvaW50ZXIgXSApO1xuICAvLyBzdGFydCBhbmltYXRpb25cbiAgdGhpcy5hbmltYXRlKCk7XG59O1xuXG5wcm90by5tZWFzdXJlQ29udGFpbm1lbnQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGNvbnRhaW5tZW50ID0gdGhpcy5vcHRpb25zLmNvbnRhaW5tZW50O1xuICBpZiAoICFjb250YWlubWVudCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyB1c2UgZWxlbWVudCBpZiBlbGVtZW50XG4gIHZhciBjb250YWluZXIgPSBpc0VsZW1lbnQoIGNvbnRhaW5tZW50ICkgPyBjb250YWlubWVudCA6XG4gICAgLy8gZmFsbGJhY2sgdG8gcXVlcnlTZWxlY3RvciBpZiBzdHJpbmdcbiAgICB0eXBlb2YgY29udGFpbm1lbnQgPT0gJ3N0cmluZycgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCBjb250YWlubWVudCApIDpcbiAgICAvLyBvdGhlcndpc2UganVzdCBgdHJ1ZWAsIHVzZSB0aGUgcGFyZW50XG4gICAgdGhpcy5lbGVtZW50LnBhcmVudE5vZGU7XG5cbiAgdmFyIGVsZW1TaXplID0gZ2V0U2l6ZSggdGhpcy5lbGVtZW50ICk7XG4gIHZhciBjb250YWluZXJTaXplID0gZ2V0U2l6ZSggY29udGFpbmVyICk7XG4gIHZhciBlbGVtUmVjdCA9IHRoaXMuZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgdmFyIGNvbnRhaW5lclJlY3QgPSBjb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgdmFyIGJvcmRlclNpemVYID0gY29udGFpbmVyU2l6ZS5ib3JkZXJMZWZ0V2lkdGggKyBjb250YWluZXJTaXplLmJvcmRlclJpZ2h0V2lkdGg7XG4gIHZhciBib3JkZXJTaXplWSA9IGNvbnRhaW5lclNpemUuYm9yZGVyVG9wV2lkdGggKyBjb250YWluZXJTaXplLmJvcmRlckJvdHRvbVdpZHRoO1xuXG4gIHZhciBwb3NpdGlvbiA9IHRoaXMucmVsYXRpdmVTdGFydFBvc2l0aW9uID0ge1xuICAgIHg6IGVsZW1SZWN0LmxlZnQgLSAoIGNvbnRhaW5lclJlY3QubGVmdCArIGNvbnRhaW5lclNpemUuYm9yZGVyTGVmdFdpZHRoICksXG4gICAgeTogZWxlbVJlY3QudG9wIC0gKCBjb250YWluZXJSZWN0LnRvcCArIGNvbnRhaW5lclNpemUuYm9yZGVyVG9wV2lkdGggKVxuICB9O1xuXG4gIHRoaXMuY29udGFpblNpemUgPSB7XG4gICAgd2lkdGg6ICggY29udGFpbmVyU2l6ZS53aWR0aCAtIGJvcmRlclNpemVYICkgLSBwb3NpdGlvbi54IC0gZWxlbVNpemUud2lkdGgsXG4gICAgaGVpZ2h0OiAoIGNvbnRhaW5lclNpemUuaGVpZ2h0IC0gYm9yZGVyU2l6ZVkgKSAtIHBvc2l0aW9uLnkgLSBlbGVtU2l6ZS5oZWlnaHRcbiAgfTtcbn07XG5cbi8vIC0tLS0tIG1vdmUgZXZlbnQgLS0tLS0gLy9cblxuLyoqXG4gKiBkcmFnIG1vdmVcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50IG9yIFRvdWNofSBwb2ludGVyXG4gKi9cbnByb3RvLmRyYWdNb3ZlID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyLCBtb3ZlVmVjdG9yICkge1xuICBpZiAoICF0aGlzLmlzRW5hYmxlZCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGRyYWdYID0gbW92ZVZlY3Rvci54O1xuICB2YXIgZHJhZ1kgPSBtb3ZlVmVjdG9yLnk7XG5cbiAgdmFyIGdyaWQgPSB0aGlzLm9wdGlvbnMuZ3JpZDtcbiAgdmFyIGdyaWRYID0gZ3JpZCAmJiBncmlkWzBdO1xuICB2YXIgZ3JpZFkgPSBncmlkICYmIGdyaWRbMV07XG5cbiAgZHJhZ1ggPSBhcHBseUdyaWQoIGRyYWdYLCBncmlkWCApO1xuICBkcmFnWSA9IGFwcGx5R3JpZCggZHJhZ1ksIGdyaWRZICk7XG5cbiAgZHJhZ1ggPSB0aGlzLmNvbnRhaW5EcmFnKCAneCcsIGRyYWdYLCBncmlkWCApO1xuICBkcmFnWSA9IHRoaXMuY29udGFpbkRyYWcoICd5JywgZHJhZ1ksIGdyaWRZICk7XG5cbiAgLy8gY29uc3RyYWluIHRvIGF4aXNcbiAgZHJhZ1ggPSB0aGlzLm9wdGlvbnMuYXhpcyA9PSAneScgPyAwIDogZHJhZ1g7XG4gIGRyYWdZID0gdGhpcy5vcHRpb25zLmF4aXMgPT0gJ3gnID8gMCA6IGRyYWdZO1xuXG4gIHRoaXMucG9zaXRpb24ueCA9IHRoaXMuc3RhcnRQb3NpdGlvbi54ICsgZHJhZ1g7XG4gIHRoaXMucG9zaXRpb24ueSA9IHRoaXMuc3RhcnRQb3NpdGlvbi55ICsgZHJhZ1k7XG4gIC8vIHNldCBkcmFnUG9pbnQgcHJvcGVydGllc1xuICB0aGlzLmRyYWdQb2ludC54ID0gZHJhZ1g7XG4gIHRoaXMuZHJhZ1BvaW50LnkgPSBkcmFnWTtcblxuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdkcmFnTW92ZScsIGV2ZW50LCBbIHBvaW50ZXIsIG1vdmVWZWN0b3IgXSApO1xufTtcblxuZnVuY3Rpb24gYXBwbHlHcmlkKCB2YWx1ZSwgZ3JpZCwgbWV0aG9kICkge1xuICBtZXRob2QgPSBtZXRob2QgfHwgJ3JvdW5kJztcbiAgcmV0dXJuIGdyaWQgPyBNYXRoWyBtZXRob2QgXSggdmFsdWUgLyBncmlkICkgKiBncmlkIDogdmFsdWU7XG59XG5cbnByb3RvLmNvbnRhaW5EcmFnID0gZnVuY3Rpb24oIGF4aXMsIGRyYWcsIGdyaWQgKSB7XG4gIGlmICggIXRoaXMub3B0aW9ucy5jb250YWlubWVudCApIHtcbiAgICByZXR1cm4gZHJhZztcbiAgfVxuICB2YXIgbWVhc3VyZSA9IGF4aXMgPT0gJ3gnID8gJ3dpZHRoJyA6ICdoZWlnaHQnO1xuXG4gIHZhciByZWwgPSB0aGlzLnJlbGF0aXZlU3RhcnRQb3NpdGlvblsgYXhpcyBdO1xuICB2YXIgbWluID0gYXBwbHlHcmlkKCAtcmVsLCBncmlkLCAnY2VpbCcgKTtcbiAgdmFyIG1heCA9IHRoaXMuY29udGFpblNpemVbIG1lYXN1cmUgXTtcbiAgbWF4ID0gYXBwbHlHcmlkKCBtYXgsIGdyaWQsICdmbG9vcicgKTtcbiAgcmV0dXJuICBNYXRoLm1pbiggbWF4LCBNYXRoLm1heCggbWluLCBkcmFnICkgKTtcbn07XG5cbi8vIC0tLS0tIGVuZCBldmVudCAtLS0tLSAvL1xuXG4vKipcbiAqIHBvaW50ZXIgdXBcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50IG9yIFRvdWNofSBwb2ludGVyXG4gKi9cbnByb3RvLnBvaW50ZXJVcCA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXBvaW50ZXItZG93bicpO1xuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdwb2ludGVyVXAnLCBldmVudCwgWyBwb2ludGVyIF0gKTtcbiAgdGhpcy5fZHJhZ1BvaW50ZXJVcCggZXZlbnQsIHBvaW50ZXIgKTtcbn07XG5cbi8qKlxuICogZHJhZyBlbmRcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50IG9yIFRvdWNofSBwb2ludGVyXG4gKi9cbnByb3RvLmRyYWdFbmQgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIGlmICggIXRoaXMuaXNFbmFibGVkICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyB1c2UgdG9wIGxlZnQgcG9zaXRpb24gd2hlbiBjb21wbGV0ZVxuICBpZiAoIHRyYW5zZm9ybVByb3BlcnR5ICkge1xuICAgIHRoaXMuZWxlbWVudC5zdHlsZVsgdHJhbnNmb3JtUHJvcGVydHkgXSA9ICcnO1xuICAgIHRoaXMuc2V0TGVmdFRvcCgpO1xuICB9XG4gIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1kcmFnZ2luZycpO1xuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdkcmFnRW5kJywgZXZlbnQsIFsgcG9pbnRlciBdICk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBhbmltYXRpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxucHJvdG8uYW5pbWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAvLyBvbmx5IHJlbmRlciBhbmQgYW5pbWF0ZSBpZiBkcmFnZ2luZ1xuICBpZiAoICF0aGlzLmlzRHJhZ2dpbmcgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5wb3NpdGlvbkRyYWcoKTtcblxuICB2YXIgX3RoaXMgPSB0aGlzO1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIGZ1bmN0aW9uIGFuaW1hdGVGcmFtZSgpIHtcbiAgICBfdGhpcy5hbmltYXRlKCk7XG4gIH0pO1xuXG59O1xuXG4vLyBsZWZ0L3RvcCBwb3NpdGlvbmluZ1xucHJvdG8uc2V0TGVmdFRvcCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IHRoaXMucG9zaXRpb24ueCArICdweCc7XG4gIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgID0gdGhpcy5wb3NpdGlvbi55ICsgJ3B4Jztcbn07XG5cbnByb3RvLnBvc2l0aW9uRHJhZyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmVsZW1lbnQuc3R5bGVbIHRyYW5zZm9ybVByb3BlcnR5IF0gPSAndHJhbnNsYXRlM2QoICcgKyB0aGlzLmRyYWdQb2ludC54ICtcbiAgICAncHgsICcgKyB0aGlzLmRyYWdQb2ludC55ICsgJ3B4LCAwKSc7XG59O1xuXG4vLyAtLS0tLSBzdGF0aWNDbGljayAtLS0tLSAvL1xuXG5wcm90by5zdGF0aWNDbGljayA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5kaXNwYXRjaEV2ZW50KCAnc3RhdGljQ2xpY2snLCBldmVudCwgWyBwb2ludGVyIF0gKTtcbn07XG5cbi8vIC0tLS0tIG1ldGhvZHMgLS0tLS0gLy9cblxucHJvdG8uZW5hYmxlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaXNFbmFibGVkID0gdHJ1ZTtcbn07XG5cbnByb3RvLmRpc2FibGUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pc0VuYWJsZWQgPSBmYWxzZTtcbiAgaWYgKCB0aGlzLmlzRHJhZ2dpbmcgKSB7XG4gICAgdGhpcy5kcmFnRW5kKCk7XG4gIH1cbn07XG5cbnByb3RvLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5kaXNhYmxlKCk7XG4gIC8vIHJlc2V0IHN0eWxlc1xuICB0aGlzLmVsZW1lbnQuc3R5bGVbIHRyYW5zZm9ybVByb3BlcnR5IF0gPSAnJztcbiAgdGhpcy5lbGVtZW50LnN0eWxlLmxlZnQgPSAnJztcbiAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCA9ICcnO1xuICB0aGlzLmVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnJztcbiAgLy8gdW5iaW5kIGhhbmRsZXNcbiAgdGhpcy51bmJpbmRIYW5kbGVzKCk7XG4gIC8vIHJlbW92ZSBqUXVlcnkgZGF0YVxuICBpZiAoIHRoaXMuJGVsZW1lbnQgKSB7XG4gICAgdGhpcy4kZWxlbWVudC5yZW1vdmVEYXRhKCdkcmFnZ2FiaWxseScpO1xuICB9XG59O1xuXG4vLyAtLS0tLSBqUXVlcnkgYnJpZGdldCAtLS0tLSAvL1xuXG4vLyByZXF1aXJlZCBmb3IgalF1ZXJ5IGJyaWRnZXRcbnByb3RvLl9pbml0ID0gbm9vcDtcblxuaWYgKCBqUXVlcnkgJiYgalF1ZXJ5LmJyaWRnZXQgKSB7XG4gIGpRdWVyeS5icmlkZ2V0KCAnZHJhZ2dhYmlsbHknLCBEcmFnZ2FiaWxseSApO1xufVxuXG4vLyAtLS0tLSAgLS0tLS0gLy9cblxucmV0dXJuIERyYWdnYWJpbGx5O1xuXG59KSk7XG4iLCIvKipcbiAqIEV2RW1pdHRlciB2MS4wLjNcbiAqIExpbCcgZXZlbnQgZW1pdHRlclxuICogTUlUIExpY2Vuc2VcbiAqL1xuXG4vKiBqc2hpbnQgdW51c2VkOiB0cnVlLCB1bmRlZjogdHJ1ZSwgc3RyaWN0OiB0cnVlICovXG5cbiggZnVuY3Rpb24oIGdsb2JhbCwgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIC8qIGpzaGludCBzdHJpY3Q6IGZhbHNlICovIC8qIGdsb2JhbHMgZGVmaW5lLCBtb2R1bGUsIHdpbmRvdyAqL1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRCAtIFJlcXVpcmVKU1xuICAgIGRlZmluZSggZmFjdG9yeSApO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTIC0gQnJvd3NlcmlmeSwgV2VicGFja1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFsc1xuICAgIGdsb2JhbC5FdkVtaXR0ZXIgPSBmYWN0b3J5KCk7XG4gIH1cblxufSggdHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHRoaXMsIGZ1bmN0aW9uKCkge1xuXG5cInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gRXZFbWl0dGVyKCkge31cblxudmFyIHByb3RvID0gRXZFbWl0dGVyLnByb3RvdHlwZTtcblxucHJvdG8ub24gPSBmdW5jdGlvbiggZXZlbnROYW1lLCBsaXN0ZW5lciApIHtcbiAgaWYgKCAhZXZlbnROYW1lIHx8ICFsaXN0ZW5lciApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gc2V0IGV2ZW50cyBoYXNoXG4gIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIC8vIHNldCBsaXN0ZW5lcnMgYXJyYXlcbiAgdmFyIGxpc3RlbmVycyA9IGV2ZW50c1sgZXZlbnROYW1lIF0gPSBldmVudHNbIGV2ZW50TmFtZSBdIHx8IFtdO1xuICAvLyBvbmx5IGFkZCBvbmNlXG4gIGlmICggbGlzdGVuZXJzLmluZGV4T2YoIGxpc3RlbmVyICkgPT0gLTEgKSB7XG4gICAgbGlzdGVuZXJzLnB1c2goIGxpc3RlbmVyICk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbnByb3RvLm9uY2UgPSBmdW5jdGlvbiggZXZlbnROYW1lLCBsaXN0ZW5lciApIHtcbiAgaWYgKCAhZXZlbnROYW1lIHx8ICFsaXN0ZW5lciApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gYWRkIGV2ZW50XG4gIHRoaXMub24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKTtcbiAgLy8gc2V0IG9uY2UgZmxhZ1xuICAvLyBzZXQgb25jZUV2ZW50cyBoYXNoXG4gIHZhciBvbmNlRXZlbnRzID0gdGhpcy5fb25jZUV2ZW50cyA9IHRoaXMuX29uY2VFdmVudHMgfHwge307XG4gIC8vIHNldCBvbmNlTGlzdGVuZXJzIG9iamVjdFxuICB2YXIgb25jZUxpc3RlbmVycyA9IG9uY2VFdmVudHNbIGV2ZW50TmFtZSBdID0gb25jZUV2ZW50c1sgZXZlbnROYW1lIF0gfHwge307XG4gIC8vIHNldCBmbGFnXG4gIG9uY2VMaXN0ZW5lcnNbIGxpc3RlbmVyIF0gPSB0cnVlO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxucHJvdG8ub2ZmID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKSB7XG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHMgJiYgdGhpcy5fZXZlbnRzWyBldmVudE5hbWUgXTtcbiAgaWYgKCAhbGlzdGVuZXJzIHx8ICFsaXN0ZW5lcnMubGVuZ3RoICkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgaW5kZXggPSBsaXN0ZW5lcnMuaW5kZXhPZiggbGlzdGVuZXIgKTtcbiAgaWYgKCBpbmRleCAhPSAtMSApIHtcbiAgICBsaXN0ZW5lcnMuc3BsaWNlKCBpbmRleCwgMSApO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5wcm90by5lbWl0RXZlbnQgPSBmdW5jdGlvbiggZXZlbnROYW1lLCBhcmdzICkge1xuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1sgZXZlbnROYW1lIF07XG4gIGlmICggIWxpc3RlbmVycyB8fCAhbGlzdGVuZXJzLmxlbmd0aCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGkgPSAwO1xuICB2YXIgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbaV07XG4gIGFyZ3MgPSBhcmdzIHx8IFtdO1xuICAvLyBvbmNlIHN0dWZmXG4gIHZhciBvbmNlTGlzdGVuZXJzID0gdGhpcy5fb25jZUV2ZW50cyAmJiB0aGlzLl9vbmNlRXZlbnRzWyBldmVudE5hbWUgXTtcblxuICB3aGlsZSAoIGxpc3RlbmVyICkge1xuICAgIHZhciBpc09uY2UgPSBvbmNlTGlzdGVuZXJzICYmIG9uY2VMaXN0ZW5lcnNbIGxpc3RlbmVyIF07XG4gICAgaWYgKCBpc09uY2UgKSB7XG4gICAgICAvLyByZW1vdmUgbGlzdGVuZXJcbiAgICAgIC8vIHJlbW92ZSBiZWZvcmUgdHJpZ2dlciB0byBwcmV2ZW50IHJlY3Vyc2lvblxuICAgICAgdGhpcy5vZmYoIGV2ZW50TmFtZSwgbGlzdGVuZXIgKTtcbiAgICAgIC8vIHVuc2V0IG9uY2UgZmxhZ1xuICAgICAgZGVsZXRlIG9uY2VMaXN0ZW5lcnNbIGxpc3RlbmVyIF07XG4gICAgfVxuICAgIC8vIHRyaWdnZXIgbGlzdGVuZXJcbiAgICBsaXN0ZW5lci5hcHBseSggdGhpcywgYXJncyApO1xuICAgIC8vIGdldCBuZXh0IGxpc3RlbmVyXG4gICAgaSArPSBpc09uY2UgPyAwIDogMTtcbiAgICBsaXN0ZW5lciA9IGxpc3RlbmVyc1tpXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxucmV0dXJuIEV2RW1pdHRlcjtcblxufSkpO1xuIiwiXG4vKipcbiAqIE1vZHVsZSBleHBvcnRzLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0RG9jdW1lbnQ7XG5cbi8vIGRlZmluZWQgYnkgdzNjXG52YXIgRE9DVU1FTlRfTk9ERSA9IDk7XG5cbi8qKlxuICogUmV0dXJucyBgdHJ1ZWAgaWYgYHdgIGlzIGEgRG9jdW1lbnQgb2JqZWN0LCBvciBgZmFsc2VgIG90aGVyd2lzZS5cbiAqXG4gKiBAcGFyYW0gez99IGQgLSBEb2N1bWVudCBvYmplY3QsIG1heWJlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc0RvY3VtZW50IChkKSB7XG4gIHJldHVybiBkICYmIGQubm9kZVR5cGUgPT09IERPQ1VNRU5UX05PREU7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgYGRvY3VtZW50YCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBnaXZlbiBgbm9kZWAsIHdoaWNoIG1heSBiZVxuICogYSBET00gZWxlbWVudCwgdGhlIFdpbmRvdyBvYmplY3QsIGEgU2VsZWN0aW9uLCBhIFJhbmdlLiBCYXNpY2FsbHkgYW55IERPTVxuICogb2JqZWN0IHRoYXQgcmVmZXJlbmNlcyB0aGUgRG9jdW1lbnQgaW4gc29tZSB3YXksIHRoaXMgZnVuY3Rpb24gd2lsbCBmaW5kIGl0LlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IG5vZGUgLSBET00gbm9kZSwgc2VsZWN0aW9uLCBvciByYW5nZSBpbiB3aGljaCB0byBmaW5kIHRoZSBgZG9jdW1lbnRgIG9iamVjdFxuICogQHJldHVybiB7RG9jdW1lbnR9IHRoZSBgZG9jdW1lbnRgIG9iamVjdCBhc3NvY2lhdGVkIHdpdGggYG5vZGVgXG4gKiBAcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZ2V0RG9jdW1lbnQobm9kZSkge1xuICBpZiAoaXNEb2N1bWVudChub2RlKSkge1xuICAgIHJldHVybiBub2RlO1xuXG4gIH0gZWxzZSBpZiAoaXNEb2N1bWVudChub2RlLm93bmVyRG9jdW1lbnQpKSB7XG4gICAgcmV0dXJuIG5vZGUub3duZXJEb2N1bWVudDtcblxuICB9IGVsc2UgaWYgKGlzRG9jdW1lbnQobm9kZS5kb2N1bWVudCkpIHtcbiAgICByZXR1cm4gbm9kZS5kb2N1bWVudDtcblxuICB9IGVsc2UgaWYgKG5vZGUucGFyZW50Tm9kZSkge1xuICAgIHJldHVybiBnZXREb2N1bWVudChub2RlLnBhcmVudE5vZGUpO1xuXG4gIC8vIFJhbmdlIHN1cHBvcnRcbiAgfSBlbHNlIGlmIChub2RlLmNvbW1vbkFuY2VzdG9yQ29udGFpbmVyKSB7XG4gICAgcmV0dXJuIGdldERvY3VtZW50KG5vZGUuY29tbW9uQW5jZXN0b3JDb250YWluZXIpO1xuXG4gIH0gZWxzZSBpZiAobm9kZS5zdGFydENvbnRhaW5lcikge1xuICAgIHJldHVybiBnZXREb2N1bWVudChub2RlLnN0YXJ0Q29udGFpbmVyKTtcblxuICAvLyBTZWxlY3Rpb24gc3VwcG9ydFxuICB9IGVsc2UgaWYgKG5vZGUuYW5jaG9yTm9kZSkge1xuICAgIHJldHVybiBnZXREb2N1bWVudChub2RlLmFuY2hvck5vZGUpO1xuICB9XG59XG4iLCIvKiFcbiAqIGdldFNpemUgdjIuMC4yXG4gKiBtZWFzdXJlIHNpemUgb2YgZWxlbWVudHNcbiAqIE1JVCBsaWNlbnNlXG4gKi9cblxuLypqc2hpbnQgYnJvd3NlcjogdHJ1ZSwgc3RyaWN0OiB0cnVlLCB1bmRlZjogdHJ1ZSwgdW51c2VkOiB0cnVlICovXG4vKmdsb2JhbCBkZWZpbmU6IGZhbHNlLCBtb2R1bGU6IGZhbHNlLCBjb25zb2xlOiBmYWxzZSAqL1xuXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeSgpO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICB3aW5kb3cuZ2V0U2l6ZSA9IGZhY3RvcnkoKTtcbiAgfVxuXG59KSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCkge1xuJ3VzZSBzdHJpY3QnO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBoZWxwZXJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8vIGdldCBhIG51bWJlciBmcm9tIGEgc3RyaW5nLCBub3QgYSBwZXJjZW50YWdlXG5mdW5jdGlvbiBnZXRTdHlsZVNpemUoIHZhbHVlICkge1xuICB2YXIgbnVtID0gcGFyc2VGbG9hdCggdmFsdWUgKTtcbiAgLy8gbm90IGEgcGVyY2VudCBsaWtlICcxMDAlJywgYW5kIGEgbnVtYmVyXG4gIHZhciBpc1ZhbGlkID0gdmFsdWUuaW5kZXhPZignJScpID09IC0xICYmICFpc05hTiggbnVtICk7XG4gIHJldHVybiBpc1ZhbGlkICYmIG51bTtcbn1cblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnZhciBsb2dFcnJvciA9IHR5cGVvZiBjb25zb2xlID09ICd1bmRlZmluZWQnID8gbm9vcCA6XG4gIGZ1bmN0aW9uKCBtZXNzYWdlICkge1xuICAgIGNvbnNvbGUuZXJyb3IoIG1lc3NhZ2UgKTtcbiAgfTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gbWVhc3VyZW1lbnRzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnZhciBtZWFzdXJlbWVudHMgPSBbXG4gICdwYWRkaW5nTGVmdCcsXG4gICdwYWRkaW5nUmlnaHQnLFxuICAncGFkZGluZ1RvcCcsXG4gICdwYWRkaW5nQm90dG9tJyxcbiAgJ21hcmdpbkxlZnQnLFxuICAnbWFyZ2luUmlnaHQnLFxuICAnbWFyZ2luVG9wJyxcbiAgJ21hcmdpbkJvdHRvbScsXG4gICdib3JkZXJMZWZ0V2lkdGgnLFxuICAnYm9yZGVyUmlnaHRXaWR0aCcsXG4gICdib3JkZXJUb3BXaWR0aCcsXG4gICdib3JkZXJCb3R0b21XaWR0aCdcbl07XG5cbnZhciBtZWFzdXJlbWVudHNMZW5ndGggPSBtZWFzdXJlbWVudHMubGVuZ3RoO1xuXG5mdW5jdGlvbiBnZXRaZXJvU2l6ZSgpIHtcbiAgdmFyIHNpemUgPSB7XG4gICAgd2lkdGg6IDAsXG4gICAgaGVpZ2h0OiAwLFxuICAgIGlubmVyV2lkdGg6IDAsXG4gICAgaW5uZXJIZWlnaHQ6IDAsXG4gICAgb3V0ZXJXaWR0aDogMCxcbiAgICBvdXRlckhlaWdodDogMFxuICB9O1xuICBmb3IgKCB2YXIgaT0wOyBpIDwgbWVhc3VyZW1lbnRzTGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIG1lYXN1cmVtZW50ID0gbWVhc3VyZW1lbnRzW2ldO1xuICAgIHNpemVbIG1lYXN1cmVtZW50IF0gPSAwO1xuICB9XG4gIHJldHVybiBzaXplO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBnZXRTdHlsZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vKipcbiAqIGdldFN0eWxlLCBnZXQgc3R5bGUgb2YgZWxlbWVudCwgY2hlY2sgZm9yIEZpcmVmb3ggYnVnXG4gKiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD01NDgzOTdcbiAqL1xuZnVuY3Rpb24gZ2V0U3R5bGUoIGVsZW0gKSB7XG4gIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoIGVsZW0gKTtcbiAgaWYgKCAhc3R5bGUgKSB7XG4gICAgbG9nRXJyb3IoICdTdHlsZSByZXR1cm5lZCAnICsgc3R5bGUgK1xuICAgICAgJy4gQXJlIHlvdSBydW5uaW5nIHRoaXMgY29kZSBpbiBhIGhpZGRlbiBpZnJhbWUgb24gRmlyZWZveD8gJyArXG4gICAgICAnU2VlIGh0dHA6Ly9iaXQubHkvZ2V0c2l6ZWJ1ZzEnICk7XG4gIH1cbiAgcmV0dXJuIHN0eWxlO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBzZXR1cCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG52YXIgaXNTZXR1cCA9IGZhbHNlO1xuXG52YXIgaXNCb3hTaXplT3V0ZXI7XG5cbi8qKlxuICogc2V0dXBcbiAqIGNoZWNrIGlzQm94U2l6ZXJPdXRlclxuICogZG8gb24gZmlyc3QgZ2V0U2l6ZSgpIHJhdGhlciB0aGFuIG9uIHBhZ2UgbG9hZCBmb3IgRmlyZWZveCBidWdcbiAqL1xuZnVuY3Rpb24gc2V0dXAoKSB7XG4gIC8vIHNldHVwIG9uY2VcbiAgaWYgKCBpc1NldHVwICkge1xuICAgIHJldHVybjtcbiAgfVxuICBpc1NldHVwID0gdHJ1ZTtcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBib3ggc2l6aW5nIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbiAgLyoqXG4gICAqIFdlYktpdCBtZWFzdXJlcyB0aGUgb3V0ZXItd2lkdGggb24gc3R5bGUud2lkdGggb24gYm9yZGVyLWJveCBlbGVtc1xuICAgKiBJRSAmIEZpcmVmb3g8MjkgbWVhc3VyZXMgdGhlIGlubmVyLXdpZHRoXG4gICAqL1xuICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGRpdi5zdHlsZS53aWR0aCA9ICcyMDBweCc7XG4gIGRpdi5zdHlsZS5wYWRkaW5nID0gJzFweCAycHggM3B4IDRweCc7XG4gIGRpdi5zdHlsZS5ib3JkZXJTdHlsZSA9ICdzb2xpZCc7XG4gIGRpdi5zdHlsZS5ib3JkZXJXaWR0aCA9ICcxcHggMnB4IDNweCA0cHgnO1xuICBkaXYuc3R5bGUuYm94U2l6aW5nID0gJ2JvcmRlci1ib3gnO1xuXG4gIHZhciBib2R5ID0gZG9jdW1lbnQuYm9keSB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gIGJvZHkuYXBwZW5kQ2hpbGQoIGRpdiApO1xuICB2YXIgc3R5bGUgPSBnZXRTdHlsZSggZGl2ICk7XG5cbiAgZ2V0U2l6ZS5pc0JveFNpemVPdXRlciA9IGlzQm94U2l6ZU91dGVyID0gZ2V0U3R5bGVTaXplKCBzdHlsZS53aWR0aCApID09IDIwMDtcbiAgYm9keS5yZW1vdmVDaGlsZCggZGl2ICk7XG5cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gZ2V0U2l6ZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5mdW5jdGlvbiBnZXRTaXplKCBlbGVtICkge1xuICBzZXR1cCgpO1xuXG4gIC8vIHVzZSBxdWVyeVNlbGV0b3IgaWYgZWxlbSBpcyBzdHJpbmdcbiAgaWYgKCB0eXBlb2YgZWxlbSA9PSAnc3RyaW5nJyApIHtcbiAgICBlbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciggZWxlbSApO1xuICB9XG5cbiAgLy8gZG8gbm90IHByb2NlZWQgb24gbm9uLW9iamVjdHNcbiAgaWYgKCAhZWxlbSB8fCB0eXBlb2YgZWxlbSAhPSAnb2JqZWN0JyB8fCAhZWxlbS5ub2RlVHlwZSApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgc3R5bGUgPSBnZXRTdHlsZSggZWxlbSApO1xuXG4gIC8vIGlmIGhpZGRlbiwgZXZlcnl0aGluZyBpcyAwXG4gIGlmICggc3R5bGUuZGlzcGxheSA9PSAnbm9uZScgKSB7XG4gICAgcmV0dXJuIGdldFplcm9TaXplKCk7XG4gIH1cblxuICB2YXIgc2l6ZSA9IHt9O1xuICBzaXplLndpZHRoID0gZWxlbS5vZmZzZXRXaWR0aDtcbiAgc2l6ZS5oZWlnaHQgPSBlbGVtLm9mZnNldEhlaWdodDtcblxuICB2YXIgaXNCb3JkZXJCb3ggPSBzaXplLmlzQm9yZGVyQm94ID0gc3R5bGUuYm94U2l6aW5nID09ICdib3JkZXItYm94JztcblxuICAvLyBnZXQgYWxsIG1lYXN1cmVtZW50c1xuICBmb3IgKCB2YXIgaT0wOyBpIDwgbWVhc3VyZW1lbnRzTGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIG1lYXN1cmVtZW50ID0gbWVhc3VyZW1lbnRzW2ldO1xuICAgIHZhciB2YWx1ZSA9IHN0eWxlWyBtZWFzdXJlbWVudCBdO1xuICAgIHZhciBudW0gPSBwYXJzZUZsb2F0KCB2YWx1ZSApO1xuICAgIC8vIGFueSAnYXV0bycsICdtZWRpdW0nIHZhbHVlIHdpbGwgYmUgMFxuICAgIHNpemVbIG1lYXN1cmVtZW50IF0gPSAhaXNOYU4oIG51bSApID8gbnVtIDogMDtcbiAgfVxuXG4gIHZhciBwYWRkaW5nV2lkdGggPSBzaXplLnBhZGRpbmdMZWZ0ICsgc2l6ZS5wYWRkaW5nUmlnaHQ7XG4gIHZhciBwYWRkaW5nSGVpZ2h0ID0gc2l6ZS5wYWRkaW5nVG9wICsgc2l6ZS5wYWRkaW5nQm90dG9tO1xuICB2YXIgbWFyZ2luV2lkdGggPSBzaXplLm1hcmdpbkxlZnQgKyBzaXplLm1hcmdpblJpZ2h0O1xuICB2YXIgbWFyZ2luSGVpZ2h0ID0gc2l6ZS5tYXJnaW5Ub3AgKyBzaXplLm1hcmdpbkJvdHRvbTtcbiAgdmFyIGJvcmRlcldpZHRoID0gc2l6ZS5ib3JkZXJMZWZ0V2lkdGggKyBzaXplLmJvcmRlclJpZ2h0V2lkdGg7XG4gIHZhciBib3JkZXJIZWlnaHQgPSBzaXplLmJvcmRlclRvcFdpZHRoICsgc2l6ZS5ib3JkZXJCb3R0b21XaWR0aDtcblxuICB2YXIgaXNCb3JkZXJCb3hTaXplT3V0ZXIgPSBpc0JvcmRlckJveCAmJiBpc0JveFNpemVPdXRlcjtcblxuICAvLyBvdmVyd3JpdGUgd2lkdGggYW5kIGhlaWdodCBpZiB3ZSBjYW4gZ2V0IGl0IGZyb20gc3R5bGVcbiAgdmFyIHN0eWxlV2lkdGggPSBnZXRTdHlsZVNpemUoIHN0eWxlLndpZHRoICk7XG4gIGlmICggc3R5bGVXaWR0aCAhPT0gZmFsc2UgKSB7XG4gICAgc2l6ZS53aWR0aCA9IHN0eWxlV2lkdGggK1xuICAgICAgLy8gYWRkIHBhZGRpbmcgYW5kIGJvcmRlciB1bmxlc3MgaXQncyBhbHJlYWR5IGluY2x1ZGluZyBpdFxuICAgICAgKCBpc0JvcmRlckJveFNpemVPdXRlciA/IDAgOiBwYWRkaW5nV2lkdGggKyBib3JkZXJXaWR0aCApO1xuICB9XG5cbiAgdmFyIHN0eWxlSGVpZ2h0ID0gZ2V0U3R5bGVTaXplKCBzdHlsZS5oZWlnaHQgKTtcbiAgaWYgKCBzdHlsZUhlaWdodCAhPT0gZmFsc2UgKSB7XG4gICAgc2l6ZS5oZWlnaHQgPSBzdHlsZUhlaWdodCArXG4gICAgICAvLyBhZGQgcGFkZGluZyBhbmQgYm9yZGVyIHVubGVzcyBpdCdzIGFscmVhZHkgaW5jbHVkaW5nIGl0XG4gICAgICAoIGlzQm9yZGVyQm94U2l6ZU91dGVyID8gMCA6IHBhZGRpbmdIZWlnaHQgKyBib3JkZXJIZWlnaHQgKTtcbiAgfVxuXG4gIHNpemUuaW5uZXJXaWR0aCA9IHNpemUud2lkdGggLSAoIHBhZGRpbmdXaWR0aCArIGJvcmRlcldpZHRoICk7XG4gIHNpemUuaW5uZXJIZWlnaHQgPSBzaXplLmhlaWdodCAtICggcGFkZGluZ0hlaWdodCArIGJvcmRlckhlaWdodCApO1xuXG4gIHNpemUub3V0ZXJXaWR0aCA9IHNpemUud2lkdGggKyBtYXJnaW5XaWR0aDtcbiAgc2l6ZS5vdXRlckhlaWdodCA9IHNpemUuaGVpZ2h0ICsgbWFyZ2luSGVpZ2h0O1xuXG4gIHJldHVybiBzaXplO1xufVxuXG5yZXR1cm4gZ2V0U2l6ZTtcblxufSk7XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi94cGF0aCcpXG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBET01FeGNlcHRpb24ge1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlLCBuYW1lKSB7XG4gICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZVxuICAgIHRoaXMubmFtZSA9IG5hbWVcbiAgICB0aGlzLnN0YWNrID0gKG5ldyBFcnJvcigpKS5zdGFja1xuICB9XG59XG5cbkRPTUV4Y2VwdGlvbi5wcm90b3R5cGUgPSBuZXcgRXJyb3IoKVxuXG5ET01FeGNlcHRpb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gYCR7dGhpcy5uYW1lfTogJHt0aGlzLm1lc3NhZ2V9YFxufVxuIiwiaW1wb3J0IGdldERvY3VtZW50IGZyb20gJ2dldC1kb2N1bWVudCdcblxuaW1wb3J0IERPTUV4Y2VwdGlvbiBmcm9tICcuL2RvbS1leGNlcHRpb24nXG5cbi8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvWFBhdGhSZXN1bHRcbmNvbnN0IEZJUlNUX09SREVSRURfTk9ERV9UWVBFID0gOVxuXG4vLyBEZWZhdWx0IG5hbWVzcGFjZSBmb3IgWEhUTUwgZG9jdW1lbnRzXG5jb25zdCBIVE1MX05BTUVTUEFDRSA9ICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJ1xuXG5cbi8qKlxuICogQ29tcHV0ZSBhbiBYUGF0aCBleHByZXNzaW9uIGZvciB0aGUgZ2l2ZW4gbm9kZS5cbiAqXG4gKiBJZiB0aGUgb3B0aW9uYWwgcGFyYW1ldGVyIGByb290YCBpcyBzdXBwbGllZCwgdGhlIGNvbXB1dGVkIFhQYXRoIGV4cHJlc3Npb25cbiAqIHdpbGwgYmUgcmVsYXRpdmUgdG8gaXQuIE90aGVyd2lzZSwgdGhlIHJvb3QgZWxlbWVudCBpcyB0aGUgcm9vdCBvZiB0aGVcbiAqIGRvY3VtZW50IHRvIHdoaWNoIGBub2RlYCBiZWxvbmdzLlxuICpcbiAqIEBwYXJhbSB7Tm9kZX0gbm9kZSBUaGUgbm9kZSBmb3Igd2hpY2ggdG8gY29tcHV0ZSBhbiBYUGF0aCBleHByZXNzaW9uLlxuICogQHBhcmFtIHtOb2RlfSBbcm9vdF0gVGhlIHJvb3QgY29udGV4dCBmb3IgdGhlIFhQYXRoIGV4cHJlc3Npb24uXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbU5vZGUobm9kZSwgcm9vdCA9IG51bGwpIHtcbiAgaWYgKG5vZGUgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFcnJvcignbWlzc2luZyByZXF1aXJlZCBwYXJhbWV0ZXIgXCJub2RlXCInKVxuICB9XG5cbiAgcm9vdCA9IHJvb3QgfHwgZ2V0RG9jdW1lbnQobm9kZSlcblxuICBsZXQgcGF0aCA9ICcvJ1xuICB3aGlsZSAobm9kZSAhPT0gcm9vdCkge1xuICAgIGlmICghbm9kZSkge1xuICAgICAgbGV0IG1lc3NhZ2UgPSAnVGhlIHN1cHBsaWVkIG5vZGUgaXMgbm90IGNvbnRhaW5lZCBieSB0aGUgcm9vdCBub2RlLidcbiAgICAgIGxldCBuYW1lID0gJ0ludmFsaWROb2RlVHlwZUVycm9yJ1xuICAgICAgdGhyb3cgbmV3IERPTUV4Y2VwdGlvbihtZXNzYWdlLCBuYW1lKVxuICAgIH1cbiAgICBwYXRoID0gYC8ke25vZGVOYW1lKG5vZGUpfVske25vZGVQb3NpdGlvbihub2RlKX1dJHtwYXRofWBcbiAgICBub2RlID0gbm9kZS5wYXJlbnROb2RlXG4gIH1cbiAgcmV0dXJuIHBhdGgucmVwbGFjZSgvXFwvJC8sICcnKVxufVxuXG5cbi8qKlxuICogRmluZCBhIG5vZGUgdXNpbmcgYW4gWFBhdGggcmVsYXRpdmUgdG8gdGhlIGdpdmVuIHJvb3Qgbm9kZS5cbiAqXG4gKiBUaGUgWFBhdGggZXhwcmVzc2lvbnMgYXJlIGV2YWx1YXRlZCByZWxhdGl2ZSB0byB0aGUgTm9kZSBhcmd1bWVudCBgcm9vdGAuXG4gKlxuICogSWYgdGhlIG9wdGlvbmFsIHBhcmFtZXRlciBgcmVzb2x2ZXJgIGlzIHN1cHBsaWVkLCBpdCB3aWxsIGJlIHVzZWQgdG8gcmVzb2x2ZVxuICogYW55IG5hbWVzcGFjZXMgd2l0aGluIHRoZSBYUGF0aC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aCBBbiBYUGF0aCBTdHJpbmcgdG8gZXZhbHVhdGUuXG4gKiBAcGFyYW0ge05vZGV9IHJvb3QgVGhlIHJvb3QgY29udGV4dCBmb3IgdGhlIFhQYXRoIGV4cHJlc3Npb24uXG4gKiBAcmV0dXJucyB7Tm9kZXxudWxsfSBUaGUgZmlyc3QgbWF0Y2hpbmcgTm9kZSBvciBudWxsIGlmIG5vbmUgaXMgZm91bmQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b05vZGUocGF0aCwgcm9vdCwgcmVzb2x2ZXIgPSBudWxsKSB7XG4gIGlmIChwYXRoID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ21pc3NpbmcgcmVxdWlyZWQgcGFyYW1ldGVyIFwicGF0aFwiJylcbiAgfVxuICBpZiAocm9vdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdtaXNzaW5nIHJlcXVpcmVkIHBhcmFtZXRlciBcInJvb3RcIicpXG4gIH1cblxuICAvLyBNYWtlIHRoZSBwYXRoIHJlbGF0aXZlIHRvIHRoZSByb290LCBpZiBub3QgdGhlIGRvY3VtZW50LlxuICBsZXQgZG9jdW1lbnQgPSBnZXREb2N1bWVudChyb290KVxuICBpZiAocm9vdCAhPT0gZG9jdW1lbnQpIHBhdGggPSBwYXRoLnJlcGxhY2UoL15cXC8vLCAnLi8nKVxuXG4gIC8vIE1ha2UgYSBkZWZhdWx0IHJlc29sdmVyLlxuICBsZXQgZG9jdW1lbnRFbGVtZW50ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XG4gIGlmIChyZXNvbHZlciA9PT0gbnVsbCAmJiBkb2N1bWVudEVsZW1lbnQubG9va3VwTmFtZXNwYWNlVVJJKSB7XG4gICAgbGV0IGRlZmF1bHROUyA9IGRvY3VtZW50RWxlbWVudC5sb29rdXBOYW1lc3BhY2VVUkkobnVsbCkgfHwgSFRNTF9OQU1FU1BBQ0VcbiAgICByZXNvbHZlciA9IChwcmVmaXgpID0+IHtcbiAgICAgIGxldCBucyA9IHsnX2RlZmF1bHRfJzogZGVmYXVsdE5TfVxuICAgICAgcmV0dXJuIG5zW3ByZWZpeF0gfHwgZG9jdW1lbnRFbGVtZW50Lmxvb2t1cE5hbWVzcGFjZVVSSShwcmVmaXgpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc29sdmUocGF0aCwgcm9vdCwgcmVzb2x2ZXIpXG59XG5cblxuLy8gR2V0IHRoZSBYUGF0aCBub2RlIG5hbWUuXG5mdW5jdGlvbiBub2RlTmFtZShub2RlKSB7XG4gIHN3aXRjaCAobm9kZS5ub2RlTmFtZSkge1xuICBjYXNlICcjdGV4dCc6IHJldHVybiAndGV4dCgpJ1xuICBjYXNlICcjY29tbWVudCc6IHJldHVybiAnY29tbWVudCgpJ1xuICBjYXNlICcjY2RhdGEtc2VjdGlvbic6IHJldHVybiAnY2RhdGEtc2VjdGlvbigpJ1xuICBkZWZhdWx0OiByZXR1cm4gbm9kZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpXG4gIH1cbn1cblxuXG4vLyBHZXQgdGhlIG9yZGluYWwgcG9zaXRpb24gb2YgdGhpcyBub2RlIGFtb25nIGl0cyBzaWJsaW5ncyBvZiB0aGUgc2FtZSBuYW1lLlxuZnVuY3Rpb24gbm9kZVBvc2l0aW9uKG5vZGUpIHtcbiAgbGV0IG5hbWUgPSBub2RlLm5vZGVOYW1lXG4gIGxldCBwb3NpdGlvbiA9IDFcbiAgd2hpbGUgKChub2RlID0gbm9kZS5wcmV2aW91c1NpYmxpbmcpKSB7XG4gICAgaWYgKG5vZGUubm9kZU5hbWUgPT09IG5hbWUpIHBvc2l0aW9uICs9IDFcbiAgfVxuICByZXR1cm4gcG9zaXRpb25cbn1cblxuXG4vLyBGaW5kIGEgc2luZ2xlIG5vZGUgd2l0aCBYUGF0aCBgcGF0aGBcbmZ1bmN0aW9uIHJlc29sdmUocGF0aCwgcm9vdCwgcmVzb2x2ZXIpIHtcbiAgdHJ5IHtcbiAgICAvLyBBZGQgYSBkZWZhdWx0IHZhbHVlIHRvIGVhY2ggcGF0aCBwYXJ0IGxhY2tpbmcgYSBwcmVmaXguXG4gICAgbGV0IG5zcGF0aCA9IHBhdGgucmVwbGFjZSgvXFwvKD8hXFwuKShbXlxcLzpcXChdKykoPz1cXC98JCkvZywgJy9fZGVmYXVsdF86JDEnKVxuICAgIHJldHVybiBwbGF0Zm9ybVJlc29sdmUobnNwYXRoLCByb290LCByZXNvbHZlcilcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIGZhbGxiYWNrUmVzb2x2ZShwYXRoLCByb290KVxuICB9XG59XG5cblxuLy8gRmluZCBhIHNpbmdsZSBub2RlIHdpdGggWFBhdGggYHBhdGhgIHVzaW5nIHRoZSBzaW1wbGUsIGJ1aWx0LWluIGV2YWx1YXRvci5cbmZ1bmN0aW9uIGZhbGxiYWNrUmVzb2x2ZShwYXRoLCByb290KSB7XG4gIGxldCBzdGVwcyA9IHBhdGguc3BsaXQoXCIvXCIpXG4gIGxldCBub2RlID0gcm9vdFxuICB3aGlsZSAobm9kZSkge1xuICAgIGxldCBzdGVwID0gc3RlcHMuc2hpZnQoKVxuICAgIGlmIChzdGVwID09PSB1bmRlZmluZWQpIGJyZWFrXG4gICAgaWYgKHN0ZXAgPT09ICcuJykgY29udGludWVcbiAgICBsZXQgW25hbWUsIHBvc2l0aW9uXSA9IHN0ZXAuc3BsaXQoL1tcXFtcXF1dLylcbiAgICBuYW1lID0gbmFtZS5yZXBsYWNlKCdfZGVmYXVsdF86JywgJycpXG4gICAgcG9zaXRpb24gPSBwb3NpdGlvbiA/IHBhcnNlSW50KHBvc2l0aW9uKSA6IDFcbiAgICBub2RlID0gZmluZENoaWxkKG5vZGUsIG5hbWUsIHBvc2l0aW9uKVxuICB9XG4gIHJldHVybiBub2RlXG59XG5cblxuLy8gRmluZCBhIHNpbmdsZSBub2RlIHdpdGggWFBhdGggYHBhdGhgIHVzaW5nIGBkb2N1bWVudC5ldmFsdWF0ZWAuXG5mdW5jdGlvbiBwbGF0Zm9ybVJlc29sdmUocGF0aCwgcm9vdCwgcmVzb2x2ZXIpIHtcbiAgbGV0IGRvY3VtZW50ID0gZ2V0RG9jdW1lbnQocm9vdClcbiAgbGV0IHIgPSBkb2N1bWVudC5ldmFsdWF0ZShwYXRoLCByb290LCByZXNvbHZlciwgRklSU1RfT1JERVJFRF9OT0RFX1RZUEUsIG51bGwpXG4gIHJldHVybiByLnNpbmdsZU5vZGVWYWx1ZVxufVxuXG5cbi8vIEZpbmQgdGhlIGNoaWxkIG9mIHRoZSBnaXZlbiBub2RlIGJ5IG5hbWUgYW5kIG9yZGluYWwgcG9zaXRpb24uXG5mdW5jdGlvbiBmaW5kQ2hpbGQobm9kZSwgbmFtZSwgcG9zaXRpb24pIHtcbiAgZm9yIChub2RlID0gbm9kZS5maXJzdENoaWxkIDsgbm9kZSA7IG5vZGUgPSBub2RlLm5leHRTaWJsaW5nKSB7XG4gICAgaWYgKG5vZGVOYW1lKG5vZGUpID09PSBuYW1lICYmIC0tcG9zaXRpb24gPT09IDApIGJyZWFrXG4gIH1cbiAgcmV0dXJuIG5vZGVcbn1cbiIsIi8qIVxuICogVW5pZHJhZ2dlciB2Mi4xLjBcbiAqIERyYWdnYWJsZSBiYXNlIGNsYXNzXG4gKiBNSVQgbGljZW5zZVxuICovXG5cbi8qanNoaW50IGJyb3dzZXI6IHRydWUsIHVudXNlZDogdHJ1ZSwgdW5kZWY6IHRydWUsIHN0cmljdDogdHJ1ZSAqL1xuXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICAvKmpzaGludCBzdHJpY3Q6IGZhbHNlICovIC8qZ2xvYmFscyBkZWZpbmUsIG1vZHVsZSwgcmVxdWlyZSAqL1xuXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EXG4gICAgZGVmaW5lKCBbXG4gICAgICAndW5pcG9pbnRlci91bmlwb2ludGVyJ1xuICAgIF0sIGZ1bmN0aW9uKCBVbmlwb2ludGVyICkge1xuICAgICAgcmV0dXJuIGZhY3RvcnkoIHdpbmRvdywgVW5pcG9pbnRlciApO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgcmVxdWlyZSgndW5pcG9pbnRlcicpXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHdpbmRvdy5VbmlkcmFnZ2VyID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHdpbmRvdy5Vbmlwb2ludGVyXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgVW5pcG9pbnRlciApIHtcblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyAtLS0tLSAgLS0tLS0gLy9cblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFVuaWRyYWdnZXIgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuZnVuY3Rpb24gVW5pZHJhZ2dlcigpIHt9XG5cbi8vIGluaGVyaXQgVW5pcG9pbnRlciAmIEV2RW1pdHRlclxudmFyIHByb3RvID0gVW5pZHJhZ2dlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBVbmlwb2ludGVyLnByb3RvdHlwZSApO1xuXG4vLyAtLS0tLSBiaW5kIHN0YXJ0IC0tLS0tIC8vXG5cbnByb3RvLmJpbmRIYW5kbGVzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2JpbmRIYW5kbGVzKCB0cnVlICk7XG59O1xuXG5wcm90by51bmJpbmRIYW5kbGVzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2JpbmRIYW5kbGVzKCBmYWxzZSApO1xufTtcblxudmFyIG5hdmlnYXRvciA9IHdpbmRvdy5uYXZpZ2F0b3I7XG4vKipcbiAqIHdvcmtzIGFzIHVuYmluZGVyLCBhcyB5b3UgY2FuIC5iaW5kSGFuZGxlcyggZmFsc2UgKSB0byB1bmJpbmRcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNCaW5kIC0gd2lsbCB1bmJpbmQgaWYgZmFsc2V5XG4gKi9cbnByb3RvLl9iaW5kSGFuZGxlcyA9IGZ1bmN0aW9uKCBpc0JpbmQgKSB7XG4gIC8vIG11bmdlIGlzQmluZCwgZGVmYXVsdCB0byB0cnVlXG4gIGlzQmluZCA9IGlzQmluZCA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6ICEhaXNCaW5kO1xuICAvLyBleHRyYSBiaW5kIGxvZ2ljXG4gIHZhciBiaW5kZXJFeHRyYTtcbiAgaWYgKCBuYXZpZ2F0b3IucG9pbnRlckVuYWJsZWQgKSB7XG4gICAgYmluZGVyRXh0cmEgPSBmdW5jdGlvbiggaGFuZGxlICkge1xuICAgICAgLy8gZGlzYWJsZSBzY3JvbGxpbmcgb24gdGhlIGVsZW1lbnRcbiAgICAgIGhhbmRsZS5zdHlsZS50b3VjaEFjdGlvbiA9IGlzQmluZCA/ICdub25lJyA6ICcnO1xuICAgIH07XG4gIH0gZWxzZSBpZiAoIG5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkICkge1xuICAgIGJpbmRlckV4dHJhID0gZnVuY3Rpb24oIGhhbmRsZSApIHtcbiAgICAgIC8vIGRpc2FibGUgc2Nyb2xsaW5nIG9uIHRoZSBlbGVtZW50XG4gICAgICBoYW5kbGUuc3R5bGUubXNUb3VjaEFjdGlvbiA9IGlzQmluZCA/ICdub25lJyA6ICcnO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgYmluZGVyRXh0cmEgPSBub29wO1xuICB9XG4gIC8vIGJpbmQgZWFjaCBoYW5kbGVcbiAgdmFyIGJpbmRNZXRob2QgPSBpc0JpbmQgPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gIGZvciAoIHZhciBpPTA7IGkgPCB0aGlzLmhhbmRsZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIGhhbmRsZSA9IHRoaXMuaGFuZGxlc1tpXTtcbiAgICB0aGlzLl9iaW5kU3RhcnRFdmVudCggaGFuZGxlLCBpc0JpbmQgKTtcbiAgICBiaW5kZXJFeHRyYSggaGFuZGxlICk7XG4gICAgaGFuZGxlWyBiaW5kTWV0aG9kIF0oICdjbGljaycsIHRoaXMgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0gc3RhcnQgZXZlbnQgLS0tLS0gLy9cblxuLyoqXG4gKiBwb2ludGVyIHN0YXJ0XG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICogQHBhcmFtIHtFdmVudCBvciBUb3VjaH0gcG9pbnRlclxuICovXG5wcm90by5wb2ludGVyRG93biA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgLy8gZGlzbWlzcyByYW5nZSBzbGlkZXJzXG4gIGlmICggZXZlbnQudGFyZ2V0Lm5vZGVOYW1lID09ICdJTlBVVCcgJiYgZXZlbnQudGFyZ2V0LnR5cGUgPT0gJ3JhbmdlJyApIHtcbiAgICAvLyByZXNldCBwb2ludGVyRG93biBsb2dpY1xuICAgIHRoaXMuaXNQb2ludGVyRG93biA9IGZhbHNlO1xuICAgIGRlbGV0ZSB0aGlzLnBvaW50ZXJJZGVudGlmaWVyO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMuX2RyYWdQb2ludGVyRG93biggZXZlbnQsIHBvaW50ZXIgKTtcbiAgLy8ga2x1ZGdlIHRvIGJsdXIgZm9jdXNlZCBpbnB1dHMgaW4gZHJhZ2dlclxuICB2YXIgZm9jdXNlZCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gIGlmICggZm9jdXNlZCAmJiBmb2N1c2VkLmJsdXIgKSB7XG4gICAgZm9jdXNlZC5ibHVyKCk7XG4gIH1cbiAgLy8gYmluZCBtb3ZlIGFuZCBlbmQgZXZlbnRzXG4gIHRoaXMuX2JpbmRQb3N0U3RhcnRFdmVudHMoIGV2ZW50ICk7XG4gIHRoaXMuZW1pdEV2ZW50KCAncG9pbnRlckRvd24nLCBbIGV2ZW50LCBwb2ludGVyIF0gKTtcbn07XG5cbi8vIGJhc2UgcG9pbnRlciBkb3duIGxvZ2ljXG5wcm90by5fZHJhZ1BvaW50ZXJEb3duID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICAvLyB0cmFjayB0byBzZWUgd2hlbiBkcmFnZ2luZyBzdGFydHNcbiAgdGhpcy5wb2ludGVyRG93blBvaW50ID0gVW5pcG9pbnRlci5nZXRQb2ludGVyUG9pbnQoIHBvaW50ZXIgKTtcblxuICB2YXIgY2FuUHJldmVudERlZmF1bHQgPSB0aGlzLmNhblByZXZlbnREZWZhdWx0T25Qb2ludGVyRG93biggZXZlbnQsIHBvaW50ZXIgKTtcbiAgaWYgKCBjYW5QcmV2ZW50RGVmYXVsdCApIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB9XG59O1xuXG4vLyBvdmVyd3JpdGVhYmxlIG1ldGhvZCBzbyBGbGlja2l0eSBjYW4gcHJldmVudCBmb3Igc2Nyb2xsaW5nXG5wcm90by5jYW5QcmV2ZW50RGVmYXVsdE9uUG9pbnRlckRvd24gPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIC8vIHByZXZlbnQgZGVmYXVsdCwgdW5sZXNzIHRvdWNoc3RhcnQgb3IgPHNlbGVjdD5cbiAgcmV0dXJuIGV2ZW50LnRhcmdldC5ub2RlTmFtZSAhPSAnU0VMRUNUJztcbn07XG5cbi8vIC0tLS0tIG1vdmUgZXZlbnQgLS0tLS0gLy9cblxuLyoqXG4gKiBkcmFnIG1vdmVcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50IG9yIFRvdWNofSBwb2ludGVyXG4gKi9cbnByb3RvLnBvaW50ZXJNb3ZlID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB2YXIgbW92ZVZlY3RvciA9IHRoaXMuX2RyYWdQb2ludGVyTW92ZSggZXZlbnQsIHBvaW50ZXIgKTtcbiAgdGhpcy5lbWl0RXZlbnQoICdwb2ludGVyTW92ZScsIFsgZXZlbnQsIHBvaW50ZXIsIG1vdmVWZWN0b3IgXSApO1xuICB0aGlzLl9kcmFnTW92ZSggZXZlbnQsIHBvaW50ZXIsIG1vdmVWZWN0b3IgKTtcbn07XG5cbi8vIGJhc2UgcG9pbnRlciBtb3ZlIGxvZ2ljXG5wcm90by5fZHJhZ1BvaW50ZXJNb3ZlID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB2YXIgbW92ZVBvaW50ID0gVW5pcG9pbnRlci5nZXRQb2ludGVyUG9pbnQoIHBvaW50ZXIgKTtcbiAgdmFyIG1vdmVWZWN0b3IgPSB7XG4gICAgeDogbW92ZVBvaW50LnggLSB0aGlzLnBvaW50ZXJEb3duUG9pbnQueCxcbiAgICB5OiBtb3ZlUG9pbnQueSAtIHRoaXMucG9pbnRlckRvd25Qb2ludC55XG4gIH07XG4gIC8vIHN0YXJ0IGRyYWcgaWYgcG9pbnRlciBoYXMgbW92ZWQgZmFyIGVub3VnaCB0byBzdGFydCBkcmFnXG4gIGlmICggIXRoaXMuaXNEcmFnZ2luZyAmJiB0aGlzLmhhc0RyYWdTdGFydGVkKCBtb3ZlVmVjdG9yICkgKSB7XG4gICAgdGhpcy5fZHJhZ1N0YXJ0KCBldmVudCwgcG9pbnRlciApO1xuICB9XG4gIHJldHVybiBtb3ZlVmVjdG9yO1xufTtcblxuLy8gY29uZGl0aW9uIGlmIHBvaW50ZXIgaGFzIG1vdmVkIGZhciBlbm91Z2ggdG8gc3RhcnQgZHJhZ1xucHJvdG8uaGFzRHJhZ1N0YXJ0ZWQgPSBmdW5jdGlvbiggbW92ZVZlY3RvciApIHtcbiAgcmV0dXJuIE1hdGguYWJzKCBtb3ZlVmVjdG9yLnggKSA+IDMgfHwgTWF0aC5hYnMoIG1vdmVWZWN0b3IueSApID4gMztcbn07XG5cblxuLy8gLS0tLS0gZW5kIGV2ZW50IC0tLS0tIC8vXG5cbi8qKlxuICogcG9pbnRlciB1cFxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgb3IgVG91Y2h9IHBvaW50ZXJcbiAqL1xucHJvdG8ucG9pbnRlclVwID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLmVtaXRFdmVudCggJ3BvaW50ZXJVcCcsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xuICB0aGlzLl9kcmFnUG9pbnRlclVwKCBldmVudCwgcG9pbnRlciApO1xufTtcblxucHJvdG8uX2RyYWdQb2ludGVyVXAgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIGlmICggdGhpcy5pc0RyYWdnaW5nICkge1xuICAgIHRoaXMuX2RyYWdFbmQoIGV2ZW50LCBwb2ludGVyICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gcG9pbnRlciBkaWRuJ3QgbW92ZSBlbm91Z2ggZm9yIGRyYWcgdG8gc3RhcnRcbiAgICB0aGlzLl9zdGF0aWNDbGljayggZXZlbnQsIHBvaW50ZXIgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gZHJhZyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vLyBkcmFnU3RhcnRcbnByb3RvLl9kcmFnU3RhcnQgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMuaXNEcmFnZ2luZyA9IHRydWU7XG4gIHRoaXMuZHJhZ1N0YXJ0UG9pbnQgPSBVbmlwb2ludGVyLmdldFBvaW50ZXJQb2ludCggcG9pbnRlciApO1xuICAvLyBwcmV2ZW50IGNsaWNrc1xuICB0aGlzLmlzUHJldmVudGluZ0NsaWNrcyA9IHRydWU7XG5cbiAgdGhpcy5kcmFnU3RhcnQoIGV2ZW50LCBwb2ludGVyICk7XG59O1xuXG5wcm90by5kcmFnU3RhcnQgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMuZW1pdEV2ZW50KCAnZHJhZ1N0YXJ0JywgWyBldmVudCwgcG9pbnRlciBdICk7XG59O1xuXG4vLyBkcmFnTW92ZVxucHJvdG8uX2RyYWdNb3ZlID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyLCBtb3ZlVmVjdG9yICkge1xuICAvLyBkbyBub3QgZHJhZyBpZiBub3QgZHJhZ2dpbmcgeWV0XG4gIGlmICggIXRoaXMuaXNEcmFnZ2luZyApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLmRyYWdNb3ZlKCBldmVudCwgcG9pbnRlciwgbW92ZVZlY3RvciApO1xufTtcblxucHJvdG8uZHJhZ01vdmUgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIsIG1vdmVWZWN0b3IgKSB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIHRoaXMuZW1pdEV2ZW50KCAnZHJhZ01vdmUnLCBbIGV2ZW50LCBwb2ludGVyLCBtb3ZlVmVjdG9yIF0gKTtcbn07XG5cbi8vIGRyYWdFbmRcbnByb3RvLl9kcmFnRW5kID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICAvLyBzZXQgZmxhZ3NcbiAgdGhpcy5pc0RyYWdnaW5nID0gZmFsc2U7XG4gIC8vIHJlLWVuYWJsZSBjbGlja2luZyBhc3luY1xuICBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcbiAgICBkZWxldGUgdGhpcy5pc1ByZXZlbnRpbmdDbGlja3M7XG4gIH0uYmluZCggdGhpcyApICk7XG5cbiAgdGhpcy5kcmFnRW5kKCBldmVudCwgcG9pbnRlciApO1xufTtcblxucHJvdG8uZHJhZ0VuZCA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5lbWl0RXZlbnQoICdkcmFnRW5kJywgWyBldmVudCwgcG9pbnRlciBdICk7XG59O1xuXG4vLyAtLS0tLSBvbmNsaWNrIC0tLS0tIC8vXG5cbi8vIGhhbmRsZSBhbGwgY2xpY2tzIGFuZCBwcmV2ZW50IGNsaWNrcyB3aGVuIGRyYWdnaW5nXG5wcm90by5vbmNsaWNrID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICBpZiAoIHRoaXMuaXNQcmV2ZW50aW5nQ2xpY2tzICkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH1cbn07XG5cbi8vIC0tLS0tIHN0YXRpY0NsaWNrIC0tLS0tIC8vXG5cbi8vIHRyaWdnZXJlZCBhZnRlciBwb2ludGVyIGRvd24gJiB1cCB3aXRoIG5vL3RpbnkgbW92ZW1lbnRcbnByb3RvLl9zdGF0aWNDbGljayA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgLy8gaWdub3JlIGVtdWxhdGVkIG1vdXNlIHVwIGNsaWNrc1xuICBpZiAoIHRoaXMuaXNJZ25vcmluZ01vdXNlVXAgJiYgZXZlbnQudHlwZSA9PSAnbW91c2V1cCcgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gYWxsb3cgY2xpY2sgaW4gPGlucHV0PnMgYW5kIDx0ZXh0YXJlYT5zXG4gIHZhciBub2RlTmFtZSA9IGV2ZW50LnRhcmdldC5ub2RlTmFtZTtcbiAgaWYgKCBub2RlTmFtZSA9PSAnSU5QVVQnIHx8IG5vZGVOYW1lID09ICdURVhUQVJFQScgKSB7XG4gICAgZXZlbnQudGFyZ2V0LmZvY3VzKCk7XG4gIH1cbiAgdGhpcy5zdGF0aWNDbGljayggZXZlbnQsIHBvaW50ZXIgKTtcblxuICAvLyBzZXQgZmxhZyBmb3IgZW11bGF0ZWQgY2xpY2tzIDMwMG1zIGFmdGVyIHRvdWNoZW5kXG4gIGlmICggZXZlbnQudHlwZSAhPSAnbW91c2V1cCcgKSB7XG4gICAgdGhpcy5pc0lnbm9yaW5nTW91c2VVcCA9IHRydWU7XG4gICAgLy8gcmVzZXQgZmxhZyBhZnRlciAzMDBtc1xuICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuICAgICAgZGVsZXRlIHRoaXMuaXNJZ25vcmluZ01vdXNlVXA7XG4gICAgfS5iaW5kKCB0aGlzICksIDQwMCApO1xuICB9XG59O1xuXG5wcm90by5zdGF0aWNDbGljayA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5lbWl0RXZlbnQoICdzdGF0aWNDbGljaycsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xufTtcblxuLy8gLS0tLS0gdXRpbHMgLS0tLS0gLy9cblxuVW5pZHJhZ2dlci5nZXRQb2ludGVyUG9pbnQgPSBVbmlwb2ludGVyLmdldFBvaW50ZXJQb2ludDtcblxuLy8gLS0tLS0gIC0tLS0tIC8vXG5cbnJldHVybiBVbmlkcmFnZ2VyO1xuXG59KSk7XG4iLCIvKiFcbiAqIFVuaXBvaW50ZXIgdjIuMS4wXG4gKiBiYXNlIGNsYXNzIGZvciBkb2luZyBvbmUgdGhpbmcgd2l0aCBwb2ludGVyIGV2ZW50XG4gKiBNSVQgbGljZW5zZVxuICovXG5cbi8qanNoaW50IGJyb3dzZXI6IHRydWUsIHVuZGVmOiB0cnVlLCB1bnVzZWQ6IHRydWUsIHN0cmljdDogdHJ1ZSAqL1xuXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICAvKiBqc2hpbnQgc3RyaWN0OiBmYWxzZSAqLyAvKmdsb2JhbCBkZWZpbmUsIG1vZHVsZSwgcmVxdWlyZSAqL1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggW1xuICAgICAgJ2V2LWVtaXR0ZXIvZXYtZW1pdHRlcidcbiAgICBdLCBmdW5jdGlvbiggRXZFbWl0dGVyICkge1xuICAgICAgcmV0dXJuIGZhY3RvcnkoIHdpbmRvdywgRXZFbWl0dGVyICk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICByZXF1aXJlKCdldi1lbWl0dGVyJylcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgd2luZG93LlVuaXBvaW50ZXIgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgd2luZG93LkV2RW1pdHRlclxuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIEV2RW1pdHRlciApIHtcblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxuZnVuY3Rpb24gVW5pcG9pbnRlcigpIHt9XG5cbi8vIGluaGVyaXQgRXZFbWl0dGVyXG52YXIgcHJvdG8gPSBVbmlwb2ludGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV2RW1pdHRlci5wcm90b3R5cGUgKTtcblxucHJvdG8uYmluZFN0YXJ0RXZlbnQgPSBmdW5jdGlvbiggZWxlbSApIHtcbiAgdGhpcy5fYmluZFN0YXJ0RXZlbnQoIGVsZW0sIHRydWUgKTtcbn07XG5cbnByb3RvLnVuYmluZFN0YXJ0RXZlbnQgPSBmdW5jdGlvbiggZWxlbSApIHtcbiAgdGhpcy5fYmluZFN0YXJ0RXZlbnQoIGVsZW0sIGZhbHNlICk7XG59O1xuXG4vKipcbiAqIHdvcmtzIGFzIHVuYmluZGVyLCBhcyB5b3UgY2FuIC5fYmluZFN0YXJ0KCBmYWxzZSApIHRvIHVuYmluZFxuICogQHBhcmFtIHtCb29sZWFufSBpc0JpbmQgLSB3aWxsIHVuYmluZCBpZiBmYWxzZXlcbiAqL1xucHJvdG8uX2JpbmRTdGFydEV2ZW50ID0gZnVuY3Rpb24oIGVsZW0sIGlzQmluZCApIHtcbiAgLy8gbXVuZ2UgaXNCaW5kLCBkZWZhdWx0IHRvIHRydWVcbiAgaXNCaW5kID0gaXNCaW5kID09PSB1bmRlZmluZWQgPyB0cnVlIDogISFpc0JpbmQ7XG4gIHZhciBiaW5kTWV0aG9kID0gaXNCaW5kID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuXG4gIGlmICggd2luZG93Lm5hdmlnYXRvci5wb2ludGVyRW5hYmxlZCApIHtcbiAgICAvLyBXM0MgUG9pbnRlciBFdmVudHMsIElFMTEuIFNlZSBodHRwczovL2NvZGVyd2FsbC5jb20vcC9tZnJlY2FcbiAgICBlbGVtWyBiaW5kTWV0aG9kIF0oICdwb2ludGVyZG93bicsIHRoaXMgKTtcbiAgfSBlbHNlIGlmICggd2luZG93Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkICkge1xuICAgIC8vIElFMTAgUG9pbnRlciBFdmVudHNcbiAgICBlbGVtWyBiaW5kTWV0aG9kIF0oICdNU1BvaW50ZXJEb3duJywgdGhpcyApO1xuICB9IGVsc2Uge1xuICAgIC8vIGxpc3RlbiBmb3IgYm90aCwgZm9yIGRldmljZXMgbGlrZSBDaHJvbWUgUGl4ZWxcbiAgICBlbGVtWyBiaW5kTWV0aG9kIF0oICdtb3VzZWRvd24nLCB0aGlzICk7XG4gICAgZWxlbVsgYmluZE1ldGhvZCBdKCAndG91Y2hzdGFydCcsIHRoaXMgKTtcbiAgfVxufTtcblxuLy8gdHJpZ2dlciBoYW5kbGVyIG1ldGhvZHMgZm9yIGV2ZW50c1xucHJvdG8uaGFuZGxlRXZlbnQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHZhciBtZXRob2QgPSAnb24nICsgZXZlbnQudHlwZTtcbiAgaWYgKCB0aGlzWyBtZXRob2QgXSApIHtcbiAgICB0aGlzWyBtZXRob2QgXSggZXZlbnQgKTtcbiAgfVxufTtcblxuLy8gcmV0dXJucyB0aGUgdG91Y2ggdGhhdCB3ZSdyZSBrZWVwaW5nIHRyYWNrIG9mXG5wcm90by5nZXRUb3VjaCA9IGZ1bmN0aW9uKCB0b3VjaGVzICkge1xuICBmb3IgKCB2YXIgaT0wOyBpIDwgdG91Y2hlcy5sZW5ndGg7IGkrKyApIHtcbiAgICB2YXIgdG91Y2ggPSB0b3VjaGVzW2ldO1xuICAgIGlmICggdG91Y2guaWRlbnRpZmllciA9PSB0aGlzLnBvaW50ZXJJZGVudGlmaWVyICkge1xuICAgICAgcmV0dXJuIHRvdWNoO1xuICAgIH1cbiAgfVxufTtcblxuLy8gLS0tLS0gc3RhcnQgZXZlbnQgLS0tLS0gLy9cblxucHJvdG8ub25tb3VzZWRvd24gPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIC8vIGRpc21pc3MgY2xpY2tzIGZyb20gcmlnaHQgb3IgbWlkZGxlIGJ1dHRvbnNcbiAgdmFyIGJ1dHRvbiA9IGV2ZW50LmJ1dHRvbjtcbiAgaWYgKCBidXR0b24gJiYgKCBidXR0b24gIT09IDAgJiYgYnV0dG9uICE9PSAxICkgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMuX3BvaW50ZXJEb3duKCBldmVudCwgZXZlbnQgKTtcbn07XG5cbnByb3RvLm9udG91Y2hzdGFydCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdGhpcy5fcG9pbnRlckRvd24oIGV2ZW50LCBldmVudC5jaGFuZ2VkVG91Y2hlc1swXSApO1xufTtcblxucHJvdG8ub25NU1BvaW50ZXJEb3duID1cbnByb3RvLm9ucG9pbnRlcmRvd24gPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHRoaXMuX3BvaW50ZXJEb3duKCBldmVudCwgZXZlbnQgKTtcbn07XG5cbi8qKlxuICogcG9pbnRlciBzdGFydFxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgb3IgVG91Y2h9IHBvaW50ZXJcbiAqL1xucHJvdG8uX3BvaW50ZXJEb3duID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICAvLyBkaXNtaXNzIG90aGVyIHBvaW50ZXJzXG4gIGlmICggdGhpcy5pc1BvaW50ZXJEb3duICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMuaXNQb2ludGVyRG93biA9IHRydWU7XG4gIC8vIHNhdmUgcG9pbnRlciBpZGVudGlmaWVyIHRvIG1hdGNoIHVwIHRvdWNoIGV2ZW50c1xuICB0aGlzLnBvaW50ZXJJZGVudGlmaWVyID0gcG9pbnRlci5wb2ludGVySWQgIT09IHVuZGVmaW5lZCA/XG4gICAgLy8gcG9pbnRlcklkIGZvciBwb2ludGVyIGV2ZW50cywgdG91Y2guaW5kZW50aWZpZXIgZm9yIHRvdWNoIGV2ZW50c1xuICAgIHBvaW50ZXIucG9pbnRlcklkIDogcG9pbnRlci5pZGVudGlmaWVyO1xuXG4gIHRoaXMucG9pbnRlckRvd24oIGV2ZW50LCBwb2ludGVyICk7XG59O1xuXG5wcm90by5wb2ludGVyRG93biA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5fYmluZFBvc3RTdGFydEV2ZW50cyggZXZlbnQgKTtcbiAgdGhpcy5lbWl0RXZlbnQoICdwb2ludGVyRG93bicsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xufTtcblxuLy8gaGFzaCBvZiBldmVudHMgdG8gYmUgYm91bmQgYWZ0ZXIgc3RhcnQgZXZlbnRcbnZhciBwb3N0U3RhcnRFdmVudHMgPSB7XG4gIG1vdXNlZG93bjogWyAnbW91c2Vtb3ZlJywgJ21vdXNldXAnIF0sXG4gIHRvdWNoc3RhcnQ6IFsgJ3RvdWNobW92ZScsICd0b3VjaGVuZCcsICd0b3VjaGNhbmNlbCcgXSxcbiAgcG9pbnRlcmRvd246IFsgJ3BvaW50ZXJtb3ZlJywgJ3BvaW50ZXJ1cCcsICdwb2ludGVyY2FuY2VsJyBdLFxuICBNU1BvaW50ZXJEb3duOiBbICdNU1BvaW50ZXJNb3ZlJywgJ01TUG9pbnRlclVwJywgJ01TUG9pbnRlckNhbmNlbCcgXVxufTtcblxucHJvdG8uX2JpbmRQb3N0U3RhcnRFdmVudHMgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIGlmICggIWV2ZW50ICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBnZXQgcHJvcGVyIGV2ZW50cyB0byBtYXRjaCBzdGFydCBldmVudFxuICB2YXIgZXZlbnRzID0gcG9zdFN0YXJ0RXZlbnRzWyBldmVudC50eXBlIF07XG4gIC8vIGJpbmQgZXZlbnRzIHRvIG5vZGVcbiAgZXZlbnRzLmZvckVhY2goIGZ1bmN0aW9uKCBldmVudE5hbWUgKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoIGV2ZW50TmFtZSwgdGhpcyApO1xuICB9LCB0aGlzICk7XG4gIC8vIHNhdmUgdGhlc2UgYXJndW1lbnRzXG4gIHRoaXMuX2JvdW5kUG9pbnRlckV2ZW50cyA9IGV2ZW50cztcbn07XG5cbnByb3RvLl91bmJpbmRQb3N0U3RhcnRFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgLy8gY2hlY2sgZm9yIF9ib3VuZEV2ZW50cywgaW4gY2FzZSBkcmFnRW5kIHRyaWdnZXJlZCB0d2ljZSAob2xkIElFOCBidWcpXG4gIGlmICggIXRoaXMuX2JvdW5kUG9pbnRlckV2ZW50cyApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5fYm91bmRQb2ludGVyRXZlbnRzLmZvckVhY2goIGZ1bmN0aW9uKCBldmVudE5hbWUgKSB7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoIGV2ZW50TmFtZSwgdGhpcyApO1xuICB9LCB0aGlzICk7XG5cbiAgZGVsZXRlIHRoaXMuX2JvdW5kUG9pbnRlckV2ZW50cztcbn07XG5cbi8vIC0tLS0tIG1vdmUgZXZlbnQgLS0tLS0gLy9cblxucHJvdG8ub25tb3VzZW1vdmUgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHRoaXMuX3BvaW50ZXJNb3ZlKCBldmVudCwgZXZlbnQgKTtcbn07XG5cbnByb3RvLm9uTVNQb2ludGVyTW92ZSA9XG5wcm90by5vbnBvaW50ZXJtb3ZlID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICBpZiAoIGV2ZW50LnBvaW50ZXJJZCA9PSB0aGlzLnBvaW50ZXJJZGVudGlmaWVyICkge1xuICAgIHRoaXMuX3BvaW50ZXJNb3ZlKCBldmVudCwgZXZlbnQgKTtcbiAgfVxufTtcblxucHJvdG8ub250b3VjaG1vdmUgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHZhciB0b3VjaCA9IHRoaXMuZ2V0VG91Y2goIGV2ZW50LmNoYW5nZWRUb3VjaGVzICk7XG4gIGlmICggdG91Y2ggKSB7XG4gICAgdGhpcy5fcG9pbnRlck1vdmUoIGV2ZW50LCB0b3VjaCApO1xuICB9XG59O1xuXG4vKipcbiAqIHBvaW50ZXIgbW92ZVxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgb3IgVG91Y2h9IHBvaW50ZXJcbiAqIEBwcml2YXRlXG4gKi9cbnByb3RvLl9wb2ludGVyTW92ZSA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5wb2ludGVyTW92ZSggZXZlbnQsIHBvaW50ZXIgKTtcbn07XG5cbi8vIHB1YmxpY1xucHJvdG8ucG9pbnRlck1vdmUgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMuZW1pdEV2ZW50KCAncG9pbnRlck1vdmUnLCBbIGV2ZW50LCBwb2ludGVyIF0gKTtcbn07XG5cbi8vIC0tLS0tIGVuZCBldmVudCAtLS0tLSAvL1xuXG5cbnByb3RvLm9ubW91c2V1cCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdGhpcy5fcG9pbnRlclVwKCBldmVudCwgZXZlbnQgKTtcbn07XG5cbnByb3RvLm9uTVNQb2ludGVyVXAgPVxucHJvdG8ub25wb2ludGVydXAgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIGlmICggZXZlbnQucG9pbnRlcklkID09IHRoaXMucG9pbnRlcklkZW50aWZpZXIgKSB7XG4gICAgdGhpcy5fcG9pbnRlclVwKCBldmVudCwgZXZlbnQgKTtcbiAgfVxufTtcblxucHJvdG8ub250b3VjaGVuZCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdmFyIHRvdWNoID0gdGhpcy5nZXRUb3VjaCggZXZlbnQuY2hhbmdlZFRvdWNoZXMgKTtcbiAgaWYgKCB0b3VjaCApIHtcbiAgICB0aGlzLl9wb2ludGVyVXAoIGV2ZW50LCB0b3VjaCApO1xuICB9XG59O1xuXG4vKipcbiAqIHBvaW50ZXIgdXBcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50IG9yIFRvdWNofSBwb2ludGVyXG4gKiBAcHJpdmF0ZVxuICovXG5wcm90by5fcG9pbnRlclVwID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLl9wb2ludGVyRG9uZSgpO1xuICB0aGlzLnBvaW50ZXJVcCggZXZlbnQsIHBvaW50ZXIgKTtcbn07XG5cbi8vIHB1YmxpY1xucHJvdG8ucG9pbnRlclVwID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLmVtaXRFdmVudCggJ3BvaW50ZXJVcCcsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xufTtcblxuLy8gLS0tLS0gcG9pbnRlciBkb25lIC0tLS0tIC8vXG5cbi8vIHRyaWdnZXJlZCBvbiBwb2ludGVyIHVwICYgcG9pbnRlciBjYW5jZWxcbnByb3RvLl9wb2ludGVyRG9uZSA9IGZ1bmN0aW9uKCkge1xuICAvLyByZXNldCBwcm9wZXJ0aWVzXG4gIHRoaXMuaXNQb2ludGVyRG93biA9IGZhbHNlO1xuICBkZWxldGUgdGhpcy5wb2ludGVySWRlbnRpZmllcjtcbiAgLy8gcmVtb3ZlIGV2ZW50c1xuICB0aGlzLl91bmJpbmRQb3N0U3RhcnRFdmVudHMoKTtcbiAgdGhpcy5wb2ludGVyRG9uZSgpO1xufTtcblxucHJvdG8ucG9pbnRlckRvbmUgPSBub29wO1xuXG4vLyAtLS0tLSBwb2ludGVyIGNhbmNlbCAtLS0tLSAvL1xuXG5wcm90by5vbk1TUG9pbnRlckNhbmNlbCA9XG5wcm90by5vbnBvaW50ZXJjYW5jZWwgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIGlmICggZXZlbnQucG9pbnRlcklkID09IHRoaXMucG9pbnRlcklkZW50aWZpZXIgKSB7XG4gICAgdGhpcy5fcG9pbnRlckNhbmNlbCggZXZlbnQsIGV2ZW50ICk7XG4gIH1cbn07XG5cbnByb3RvLm9udG91Y2hjYW5jZWwgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHZhciB0b3VjaCA9IHRoaXMuZ2V0VG91Y2goIGV2ZW50LmNoYW5nZWRUb3VjaGVzICk7XG4gIGlmICggdG91Y2ggKSB7XG4gICAgdGhpcy5fcG9pbnRlckNhbmNlbCggZXZlbnQsIHRvdWNoICk7XG4gIH1cbn07XG5cbi8qKlxuICogcG9pbnRlciBjYW5jZWxcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50IG9yIFRvdWNofSBwb2ludGVyXG4gKiBAcHJpdmF0ZVxuICovXG5wcm90by5fcG9pbnRlckNhbmNlbCA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5fcG9pbnRlckRvbmUoKTtcbiAgdGhpcy5wb2ludGVyQ2FuY2VsKCBldmVudCwgcG9pbnRlciApO1xufTtcblxuLy8gcHVibGljXG5wcm90by5wb2ludGVyQ2FuY2VsID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLmVtaXRFdmVudCggJ3BvaW50ZXJDYW5jZWwnLCBbIGV2ZW50LCBwb2ludGVyIF0gKTtcbn07XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG4vLyB1dGlsaXR5IGZ1bmN0aW9uIGZvciBnZXR0aW5nIHgveSBjb29yZHMgZnJvbSBldmVudFxuVW5pcG9pbnRlci5nZXRQb2ludGVyUG9pbnQgPSBmdW5jdGlvbiggcG9pbnRlciApIHtcbiAgcmV0dXJuIHtcbiAgICB4OiBwb2ludGVyLnBhZ2VYLFxuICAgIHk6IHBvaW50ZXIucGFnZVlcbiAgfTtcbn07XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG5yZXR1cm4gVW5pcG9pbnRlcjtcblxufSkpO1xuIiwiLyoqXG4gKiBXaXRoaW4gVmlld3BvcnRcbiAqXG4gKiBAZGVzY3JpcHRpb24gRGV0ZXJtaW5lcyB3aGV0aGVyIGFuIGVsZW1lbnQgaXMgY29tcGxldGVseSB3aXRoaW4gdGhlIGJyb3dzZXIgdmlld3BvcnRcbiAqIEBhdXRob3IgICAgICBDcmFpZyBQYXRpaywgaHR0cDovL3BhdGlrLmNvbS9cbiAqIEB2ZXJzaW9uICAgICAxLjAuMFxuICogQGRhdGUgICAgICAgIDIwMTUtMDgtMDJcbiAqL1xuKGZ1bmN0aW9uIChyb290LCBuYW1lLCBmYWN0b3J5KSB7XG4gICAgLy8gQU1EXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW10sIGZhY3RvcnkpO1xuICAgIH1cbiAgICAvLyBOb2RlIGFuZCBDb21tb25KUy1saWtlIGVudmlyb25tZW50c1xuICAgIGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgICB9XG4gICAgLy8gQnJvd3NlciBnbG9iYWxcbiAgICBlbHNlIHtcbiAgICAgICAgcm9vdFtuYW1lXSA9IGZhY3RvcnkoKTtcbiAgICB9XG59KHRoaXMsICd3aXRoaW52aWV3cG9ydCcsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuVXNlV2luZG93RGltZW5zaW9ucyA9IHdpbmRvdy5pbm5lckhlaWdodCAhPT0gdW5kZWZpbmVkOyAvLyBJRSA4IGFuZCBsb3dlciBmYWlsIHRoaXNcblxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgd2hldGhlciBhbiBlbGVtZW50IGlzIHdpdGhpbiB0aGUgdmlld3BvcnRcbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9ICBlbGVtICAgICAgIERPTSBFbGVtZW50IChyZXF1aXJlZClcbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9ICBvcHRpb25zICAgIE9wdGlvbmFsIHNldHRpbmdzXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn0gICAgICAgICAgICBXaGV0aGVyIHRoZSBlbGVtZW50IHdhcyBjb21wbGV0ZWx5IHdpdGhpbiB0aGUgdmlld3BvcnRcbiAgICAqL1xuICAgIHZhciB3aXRoaW52aWV3cG9ydCA9IGZ1bmN0aW9uIHdpdGhpbnZpZXdwb3J0IChlbGVtLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBmYWxzZTtcbiAgICAgICAgdmFyIG1ldGFkYXRhID0ge307XG4gICAgICAgIHZhciBjb25maWcgPSB7fTtcbiAgICAgICAgdmFyIHNldHRpbmdzO1xuICAgICAgICB2YXIgaXNXaXRoaW47XG4gICAgICAgIHZhciBlbGVtQm91bmRpbmdSZWN0O1xuICAgICAgICB2YXIgc2lkZU5hbWVzUGF0dGVybjtcbiAgICAgICAgdmFyIHNpZGVzO1xuICAgICAgICB2YXIgc2lkZTtcbiAgICAgICAgdmFyIGk7XG5cbiAgICAgICAgLy8gSWYgaW52b2tlZCBieSB0aGUgalF1ZXJ5IHBsdWdpbiwgZ2V0IHRoZSBhY3R1YWwgRE9NIGVsZW1lbnRcbiAgICAgICAgaWYgKHR5cGVvZiBqUXVlcnkgIT09ICd1bmRlZmluZWQnICYmIGVsZW0gaW5zdGFuY2VvZiBqUXVlcnkpIHtcbiAgICAgICAgICAgIGVsZW0gPSBlbGVtLmdldCgwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgZWxlbSAhPT0gJ29iamVjdCcgfHwgZWxlbS5ub2RlVHlwZSAhPT0gMSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCBtdXN0IGJlIGFuIGVsZW1lbnQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExvb2sgZm9yIGlubGluZSBzZXR0aW5ncyBvbiB0aGUgZWxlbWVudFxuICAgICAgICBpZiAoZWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtd2l0aGludmlld3BvcnQtc2V0dGluZ3MnKSAmJiB3aW5kb3cuSlNPTikge1xuICAgICAgICAgICAgbWV0YWRhdGEgPSBKU09OLnBhcnNlKGVsZW0uZ2V0QXR0cmlidXRlKCdkYXRhLXdpdGhpbnZpZXdwb3J0LXNldHRpbmdzJykpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0dGluZ3MgYXJndW1lbnQgbWF5IGJlIGEgc2ltcGxlIHN0cmluZyAoYHRvcGAsIGByaWdodGAsIGV0YylcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgc2V0dGluZ3MgPSB7c2lkZXM6IG9wdGlvbnN9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgc2V0dGluZ3MgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQnVpbGQgY29uZmlndXJhdGlvbiBmcm9tIGRlZmF1bHRzIGFuZCB1c2VyLXByb3ZpZGVkIHNldHRpbmdzIGFuZCBtZXRhZGF0YVxuICAgICAgICBjb25maWcuY29udGFpbmVyID0gc2V0dGluZ3MuY29udGFpbmVyIHx8IG1ldGFkYXRhLmNvbnRhaW5lciB8fCB3aXRoaW52aWV3cG9ydC5kZWZhdWx0cy5jb250YWluZXIgfHwgd2luZG93O1xuICAgICAgICBjb25maWcuc2lkZXMgID0gc2V0dGluZ3Muc2lkZXMgIHx8IG1ldGFkYXRhLnNpZGVzICB8fCB3aXRoaW52aWV3cG9ydC5kZWZhdWx0cy5zaWRlcyAgfHwgJ2FsbCc7XG4gICAgICAgIGNvbmZpZy50b3AgICAgPSBzZXR0aW5ncy50b3AgICAgfHwgbWV0YWRhdGEudG9wICAgIHx8IHdpdGhpbnZpZXdwb3J0LmRlZmF1bHRzLnRvcCAgICB8fCAwO1xuICAgICAgICBjb25maWcucmlnaHQgID0gc2V0dGluZ3MucmlnaHQgIHx8IG1ldGFkYXRhLnJpZ2h0ICB8fCB3aXRoaW52aWV3cG9ydC5kZWZhdWx0cy5yaWdodCAgfHwgMDtcbiAgICAgICAgY29uZmlnLmJvdHRvbSA9IHNldHRpbmdzLmJvdHRvbSB8fCBtZXRhZGF0YS5ib3R0b20gfHwgd2l0aGludmlld3BvcnQuZGVmYXVsdHMuYm90dG9tIHx8IDA7XG4gICAgICAgIGNvbmZpZy5sZWZ0ICAgPSBzZXR0aW5ncy5sZWZ0ICAgfHwgbWV0YWRhdGEubGVmdCAgIHx8IHdpdGhpbnZpZXdwb3J0LmRlZmF1bHRzLmxlZnQgICB8fCAwO1xuXG4gICAgICAgIC8vIFVzZSB0aGUgd2luZG93IGFzIHRoZSBjb250YWluZXIgaWYgdGhlIHVzZXIgc3BlY2lmaWVkIHRoZSBib2R5IG9yIGEgbm9uLWVsZW1lbnRcbiAgICAgICAgaWYgKGNvbmZpZy5jb250YWluZXIgPT09IGRvY3VtZW50LmJvZHkgfHwgIWNvbmZpZy5jb250YWluZXIubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgIGNvbmZpZy5jb250YWluZXIgPSB3aW5kb3c7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFbGVtZW50IHRlc3RpbmcgbWV0aG9kc1xuICAgICAgICBpc1dpdGhpbiA9IHtcbiAgICAgICAgICAgIC8vIEVsZW1lbnQgaXMgYmVsb3cgdGhlIHRvcCBlZGdlIG9mIHRoZSB2aWV3cG9ydFxuICAgICAgICAgICAgdG9wOiBmdW5jdGlvbiBfaXNXaXRoaW5fdG9wICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbUJvdW5kaW5nUmVjdC50b3AgPj0gY29uZmlnLnRvcDtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8vIEVsZW1lbnQgaXMgdG8gdGhlIGxlZnQgb2YgdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIHZpZXdwb3J0XG4gICAgICAgICAgICByaWdodDogZnVuY3Rpb24gX2lzV2l0aGluX3JpZ2h0ICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29udGFpbmVyV2lkdGg7XG5cbiAgICAgICAgICAgICAgICBpZiAoY2FuVXNlV2luZG93RGltZW5zaW9ucyB8fCBjb25maWcuY29udGFpbmVyICE9PSB3aW5kb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyV2lkdGggPSBjb25maWcuY29udGFpbmVyLmlubmVyV2lkdGg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb250YWluZXJXaWR0aCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBOb3RlIHRoYXQgYGVsZW1Cb3VuZGluZ1JlY3QucmlnaHRgIGlzIHRoZSBkaXN0YW5jZSBmcm9tIHRoZSAqbGVmdCogb2YgdGhlIHZpZXdwb3J0IHRvIHRoZSBlbGVtZW50J3MgZmFyIHJpZ2h0IGVkZ2VcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbUJvdW5kaW5nUmVjdC5yaWdodCA8PSBjb250YWluZXJXaWR0aCAtIGNvbmZpZy5yaWdodDtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8vIEVsZW1lbnQgaXMgYWJvdmUgdGhlIGJvdHRvbSBlZGdlIG9mIHRoZSB2aWV3cG9ydFxuICAgICAgICAgICAgYm90dG9tOiBmdW5jdGlvbiBfaXNXaXRoaW5fYm90dG9tICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29udGFpbmVySGVpZ2h0O1xuXG4gICAgICAgICAgICAgICAgaWYgKGNhblVzZVdpbmRvd0RpbWVuc2lvbnMgfHwgY29uZmlnLmNvbnRhaW5lciAhPT0gd2luZG93KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lckhlaWdodCA9IGNvbmZpZy5jb250YWluZXIuaW5uZXJIZWlnaHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb250YWluZXJIZWlnaHQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIE5vdGUgdGhhdCBgZWxlbUJvdW5kaW5nUmVjdC5ib3R0b21gIGlzIHRoZSBkaXN0YW5jZSBmcm9tIHRoZSAqdG9wKiBvZiB0aGUgdmlld3BvcnQgdG8gdGhlIGVsZW1lbnQncyBib3R0b20gZWRnZVxuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtQm91bmRpbmdSZWN0LmJvdHRvbSA8PSBjb250YWluZXJIZWlnaHQgLSBjb25maWcuYm90dG9tO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy8gRWxlbWVudCBpcyB0byB0aGUgcmlnaHQgb2YgdGhlIGxlZnQgZWRnZSBvZiB0aGUgdmlld3BvcnRcbiAgICAgICAgICAgIGxlZnQ6IGZ1bmN0aW9uIF9pc1dpdGhpbl9sZWZ0ICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbUJvdW5kaW5nUmVjdC5sZWZ0ID49IGNvbmZpZy5sZWZ0O1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy8gRWxlbWVudCBpcyB3aXRoaW4gYWxsIGZvdXIgYm91bmRhcmllc1xuICAgICAgICAgICAgYWxsOiBmdW5jdGlvbiBfaXNXaXRoaW5fYWxsICgpIHtcbiAgICAgICAgICAgICAgICAvLyBUZXN0IGVhY2ggYm91bmRhcnkgaW4gb3JkZXIgb2YgbW9zdCBlZmZpY2llbnQgYW5kIG1vc3QgbGlrZWx5IHRvIGJlIGZhbHNlIHNvIHRoYXQgd2UgY2FuIGF2b2lkIHJ1bm5pbmcgYWxsIGZvdXIgZnVuY3Rpb25zIG9uIG1vc3QgZWxlbWVudHNcbiAgICAgICAgICAgICAgICAvLyBUb3A6IFF1aWNrZXN0IHRvIGNhbGN1bGF0ZSArIG1vc3QgbGlrZWx5IHRvIGJlIGZhbHNlXG4gICAgICAgICAgICAgICAgLy8gQm90dG9tOiBOb3RlIHF1aXRlIGFzIHF1aWNrIHRvIGNhbGN1bGF0ZSwgYnV0IGFsc28gdmVyeSBsaWtlbHkgdG8gYmUgZmFsc2VcbiAgICAgICAgICAgICAgICAvLyBMZWZ0IGFuZCByaWdodCBhcmUgYm90aCBlcXVhbGx5IHVubGlrZWx5IHRvIGJlIGZhbHNlIHNpbmNlIG1vc3Qgc2l0ZXMgb25seSBzY3JvbGwgdmVydGljYWxseSwgYnV0IGxlZnQgaXMgZmFzdGVyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChpc1dpdGhpbi50b3AoKSAmJiBpc1dpdGhpbi5ib3R0b20oKSAmJiBpc1dpdGhpbi5sZWZ0KCkgJiYgaXNXaXRoaW4ucmlnaHQoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gR2V0IHRoZSBlbGVtZW50J3MgYm91bmRpbmcgcmVjdGFuZ2xlIHdpdGggcmVzcGVjdCB0byB0aGUgdmlld3BvcnRcbiAgICAgICAgZWxlbUJvdW5kaW5nUmVjdCA9IGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgLy8gVGVzdCB0aGUgZWxlbWVudCBhZ2FpbnN0IGVhY2ggc2lkZSBvZiB0aGUgdmlld3BvcnQgdGhhdCB3YXMgcmVxdWVzdGVkXG4gICAgICAgIHNpZGVOYW1lc1BhdHRlcm4gPSAvXnRvcCR8XnJpZ2h0JHxeYm90dG9tJHxebGVmdCR8XmFsbCQvO1xuICAgICAgICAvLyBMb29wIHRocm91Z2ggYWxsIG9mIHRoZSBzaWRlc1xuICAgICAgICBzaWRlcyA9IGNvbmZpZy5zaWRlcy5zcGxpdCgnICcpO1xuICAgICAgICBpID0gc2lkZXMubGVuZ3RoO1xuICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgICBzaWRlID0gc2lkZXNbaV0udG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAgICAgaWYgKHNpZGVOYW1lc1BhdHRlcm4udGVzdChzaWRlKSkge1xuICAgICAgICAgICAgICAgIGlmIChpc1dpdGhpbltzaWRlXSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBRdWl0IGFzIHNvb24gYXMgdGhlIGZpcnN0IGZhaWx1cmUgaXMgZm91bmRcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgLy8gRGVmYXVsdCBzZXR0aW5nc1xuICAgIHdpdGhpbnZpZXdwb3J0LnByb3RvdHlwZS5kZWZhdWx0cyA9IHtcbiAgICAgICAgY29udGFpbmVyOiBkb2N1bWVudC5ib2R5LFxuICAgICAgICBzaWRlczogJ2FsbCcsXG4gICAgICAgIHRvcDogMCxcbiAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgIGJvdHRvbTogMCxcbiAgICAgICAgbGVmdDogMFxuICAgIH07XG5cbiAgICB3aXRoaW52aWV3cG9ydC5kZWZhdWx0cyA9IHdpdGhpbnZpZXdwb3J0LnByb3RvdHlwZS5kZWZhdWx0cztcblxuICAgIC8qKlxuICAgICAqIE9wdGlvbmFsIGVuaGFuY2VtZW50cyBhbmQgc2hvcnRjdXRzXG4gICAgICpcbiAgICAgKiBAZGVzY3JpcHRpb24gVW5jb21tZW50IG9yIGNvbW1lbnQgdGhlc2UgcGllY2VzIGFzIHRoZXkgYXBwbHkgdG8geW91ciBwcm9qZWN0IGFuZCBjb2RpbmcgcHJlZmVyZW5jZXNcbiAgICAgKi9cblxuICAgIC8vIFNob3J0Y3V0IG1ldGhvZHMgZm9yIGVhY2ggc2lkZSBvZiB0aGUgdmlld3BvcnRcbiAgICAvLyBFeGFtcGxlOiBgd2l0aGludmlld3BvcnQudG9wKGVsZW0pYCBpcyB0aGUgc2FtZSBhcyBgd2l0aGludmlld3BvcnQoZWxlbSwgJ3RvcCcpYFxuICAgIHdpdGhpbnZpZXdwb3J0LnByb3RvdHlwZS50b3AgPSBmdW5jdGlvbiBfd2l0aGludmlld3BvcnRfdG9wIChlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiB3aXRoaW52aWV3cG9ydChlbGVtZW50LCAndG9wJyk7XG4gICAgfTtcblxuICAgIHdpdGhpbnZpZXdwb3J0LnByb3RvdHlwZS5yaWdodCA9IGZ1bmN0aW9uIF93aXRoaW52aWV3cG9ydF9yaWdodCAoZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gd2l0aGludmlld3BvcnQoZWxlbWVudCwgJ3JpZ2h0Jyk7XG4gICAgfTtcblxuICAgIHdpdGhpbnZpZXdwb3J0LnByb3RvdHlwZS5ib3R0b20gPSBmdW5jdGlvbiBfd2l0aGludmlld3BvcnRfYm90dG9tIChlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiB3aXRoaW52aWV3cG9ydChlbGVtZW50LCAnYm90dG9tJyk7XG4gICAgfTtcblxuICAgIHdpdGhpbnZpZXdwb3J0LnByb3RvdHlwZS5sZWZ0ID0gZnVuY3Rpb24gX3dpdGhpbnZpZXdwb3J0X2xlZnQgKGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIHdpdGhpbnZpZXdwb3J0KGVsZW1lbnQsICdsZWZ0Jyk7XG4gICAgfTtcblxuICAgIHJldHVybiB3aXRoaW52aWV3cG9ydDtcbn0pKTtcbiIsImNvbnN0IGRyYWdnYWJpbGx5ID0gcmVxdWlyZSgnZHJhZ2dhYmlsbHknKTtcblxuY29uc3Qgc2hvdyA9ICgpID0+IHtcbiAgICAkKCdib2R5JykuYXBwZW5kKGh0bWwpO1xuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudmhzLWNvbnRyb2xzJyk7XG4gICAgbmV3IGRyYWdnYWJpbGx5KGVsZW1lbnQpO1xufTtcblxuY29uc3QgdG9nZ2xlUmVjb3JkaW5nU3RhdGUgPSAoKSA9PiB7XG4gICAgJCgnLnZocy1yZWNvcmQtY2lyY2xlJykudG9nZ2xlQ2xhc3MoJ3Zocy1yZWNvcmRpbmcnKTtcbn07XG5cbmNvbnN0IHRvZ2dsZVBsYXlpbmdTdGF0ZSA9ICgpID0+IHtcbiAgICAkKCcudmhzLXBsYXktYnV0dG9uJykudG9nZ2xlQ2xhc3MoJ3Zocy1wbGF5aW5nJyk7XG59O1xuXG5jb25zdCB0b2dnbGVQYXVzZWRTdGF0ZSA9ICgpID0+IHtcbiAgICAkKCcudmhzLXBsYXktYnV0dG9uJykudG9nZ2xlQ2xhc3MoJ2lubGluZS1ibG9jaycpO1xuICAgICQoJy52aHMtcmVzdW1lLWJ1dHRvbicpLnRvZ2dsZUNsYXNzKCdpbmxpbmUtYmxvY2snKTtcbn07XG5cbmNvbnN0IHN0eWxlcyA9IGA8c3R5bGU+XG4gICAgLnZocy1jb250cm9scyB7XG4gICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgdG9wOiAxMHB4O1xuICAgICAgICBsZWZ0OiAxMHB4O1xuICAgIH1cbiAgICAudmhzLWJ1dHRvbiB7XG4gICAgICAgIHdpZHRoOiAzMHB4O1xuICAgICAgICBoZWlnaHQ6IDMwcHg7XG4gICAgICAgIGJhY2tncm91bmQ6ICNGRkY7XG4gICAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNEREQ7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDVweDtcbiAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgfVxuICAgIC52aHMtcmVjb3JkLWNpcmNsZSB7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgICAgd2lkdGg6IDEwcHg7XG4gICAgICAgIGhlaWdodDogMTBweDtcbiAgICAgICAgbWFyZ2luOiAxMHB4O1xuICAgICAgICBiYWNrZ3JvdW5kOiAjRkUzNTQ4O1xuICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgfVxuICAgIC52aHMtcmVjb3JkaW5nIHtcbiAgICAgICAgYW5pbWF0aW9uOiB2aHMtcmVjb3JkaW5nLWFuaW1hdGlvbiAycyBpbmZpbml0ZTtcbiAgICB9XG4gICAgQGtleWZyYW1lcyB2aHMtcmVjb3JkaW5nLWFuaW1hdGlvbiB7XG4gICAgICAgIDAlICAge29wYWNpdHk6IDF9XG4gICAgICAgIDUwJSAge29wYWNpdHk6IDB9XG4gICAgICAgIDEwMCUge29wYWNpdHk6IDF9XG4gICAgfVxuICAgIC52aHMtcGxheS1idXR0b24sIC52aHMtcmVzdW1lLWJ1dHRvbiB7XG4gICAgICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgfVxuICAgIC52aHMtcGxheWluZyB7XG4gICAgICAgIGJhY2tncm91bmQ6ICMwMEFERTk7XG4gICAgICAgIGJvcmRlci1jb2xvcjogIzAwQURFOTtcbiAgICB9XG4gICAgLnZocy1wbGF5aW5nIC52aHMtcGxheS10cmlhbmdsZSB7XG4gICAgICAgIGJhY2tncm91bmQ6ICNGRkY7XG4gICAgfVxuICAgIC52aHMtcmVzdW1lLWJ1dHRvbiB7XG4gICAgICAgIGJhY2tncm91bmQ6ICNmZmQ1OTA7XG4gICAgICAgIGJvcmRlci1jb2xvcjogI2ZmZDU5MDtcbiAgICB9XG4gICAgLnZocy1wbGF5LXRyaWFuZ2xlIHtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzY2NjtcbiAgICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgICAgICBtYXJnaW46IDEycHg7XG4gICAgfVxuICAgIC52aHMtcmVzdW1lLWJ1dHRvbiAudmhzLXBsYXktdHJpYW5nbGUge1xuICAgICAgICBiYWNrZ3JvdW5kOiAjRkZGO1xuICAgIH1cbiAgICAudmhzLXBsYXktdHJpYW5nbGU6YmVmb3JlLFxuICAgIC52aHMtcGxheS10cmlhbmdsZTphZnRlciB7XG4gICAgICAgIGNvbnRlbnQ6ICcnO1xuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IGluaGVyaXQ7XG4gICAgfVxuICAgIC52aHMtcGxheS10cmlhbmdsZSxcbiAgICAudmhzLXBsYXktdHJpYW5nbGU6YmVmb3JlLFxuICAgIC52aHMtcGxheS10cmlhbmdsZTphZnRlciB7XG4gICAgICAgIHdpZHRoOiAgNnB4O1xuICAgICAgICBoZWlnaHQ6IDZweDtcbiAgICAgICAgYm9yZGVyLXRvcC1yaWdodC1yYWRpdXM6IDMwJTtcbiAgICB9XG4gICAgLnZocy1wbGF5LXRyaWFuZ2xlIHtcbiAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMzBkZWcpIHNrZXdYKC0zMGRlZykgc2NhbGUoMSwgLjg2Nik7XG4gICAgfVxuICAgIC52aHMtcGxheS10cmlhbmdsZTpiZWZvcmUge1xuICAgICAgICB0cmFuc2Zvcm06IHJvdGF0ZSgtMTM1ZGVnKSBza2V3WCgtNDVkZWcpIHNjYWxlKDEuNDE0LCAuNzA3KSB0cmFuc2xhdGUoMCwgLTUwJSk7XG4gICAgfVxuICAgIC52aHMtcGxheS10cmlhbmdsZTphZnRlciB7XG4gICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDEzNWRlZykgc2tld1koLTQ1ZGVnKSBzY2FsZSguNzA3LCAxLjQxNCkgdHJhbnNsYXRlKDUwJSk7XG4gICAgfVxuICAgIC52aHMtY29udHJvbHMgLmlubGluZS1ibG9jayB7XG4gICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jayAhaW1wb3J0YW50O1xuICAgIH1cbjwvc3R5bGU+YDtcblxuY29uc3QgaHRtbCA9IGBcbiAgICA8ZGl2IGNsYXNzPVwidmhzLWNvbnRyb2xzXCI+XG4gICAgICAgICR7c3R5bGVzfVxuICAgICAgICA8c3BhbiBjbGFzcz1cInZocy1idXR0b25cIiBvbmNsaWNrPVwidmhzLnRvZ2dsZVJlY29yZGluZygpXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInZocy1yZWNvcmQtY2lyY2xlXCI+PC9zcGFuPlxuICAgICAgICA8L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwidmhzLWJ1dHRvbiB2aHMtcGxheS1idXR0b24gaW5saW5lLWJsb2NrXCIgb25jbGljaz1cInZocy5zZXR1cFBsYXliYWNrKClcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidmhzLXBsYXktdHJpYW5nbGVcIj48L3NwYW4+XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJ2aHMtYnV0dG9uIHZocy1yZXN1bWUtYnV0dG9uXCIgb25jbGljaz1cInZocy5yZXN1bWVQbGF5YmFjaygpXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInZocy1wbGF5LXRyaWFuZ2xlXCI+PC9zcGFuPlxuICAgICAgICA8L3NwYW4+XG4gICAgPC9kaXY+XG5gO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzaG93LFxuICAgIHRvZ2dsZVJlY29yZGluZ1N0YXRlLFxuICAgIHRvZ2dsZVBsYXlpbmdTdGF0ZSxcbiAgICB0b2dnbGVQYXVzZWRTdGF0ZVxufVxuIiwiY29uc3QgeHBhdGggPSByZXF1aXJlKCdzaW1wbGUteHBhdGgtcG9zaXRpb24nKTtcbmNvbnN0IHZpc2libGUgPSByZXF1aXJlKCd3aXRoaW52aWV3cG9ydCcpO1xud2luZG93LnZpc2JsZSA9IHZpc2libGU7XG5cbmNvbnN0IHNob3cgPSAoKSA9PiB7XG4gICAgJCgnYm9keScpLmFwcGVuZChodG1sKTtcbn07XG5cbmxldCBldmVudHMgPSBbXTtcblxuY29uc3QgcmVuZGVyID0gKGV2ZW50c0FycmF5LCBsYXN0RXZlbnRJbmRleCkgPT4ge1xuICAgICQoJy52aHMtc2lkZWJhci1ldmVudHMnKS5lbXB0eSgpO1xuICAgIGV2ZW50cyA9IGV2ZW50c0FycmF5O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXZlbnRzLmxlbmd0aDsgaSsrKSBhZGRFdmVudChpLCBsYXN0RXZlbnRJbmRleCk7XG4gICAgZm9sbG93TG9ncygpO1xufTtcblxuY29uc3QgZm9sbG93TG9ncyA9ICgpID0+IHtcbiAgICBsZXQgbGF0ZXN0UGFzc2VkVGVzdCA9ICQoJy52aHMtc2lkZWJhci1ldmVudC1wYXNzZWQnKS5sYXN0KCk7XG4gICAgaWYgKCFsYXRlc3RQYXNzZWRUZXN0Lmxlbmd0aCkgcmV0dXJuO1xuXG4gICAgaWYgKCF2aXNpYmxlKGxhdGVzdFBhc3NlZFRlc3QpKSB7XG4gICAgICAgIGxldCBzY3JvbGxUb3AgID0gJCgnLnZocy1zaWRlYmFyJykuc2Nyb2xsVG9wKCk7XG4gICAgICAgICQoJy52aHMtc2lkZWJhcicpLnN0b3AoKS5hbmltYXRlKHtcbiAgICAgICAgICAgIHNjcm9sbFRvcDogc2Nyb2xsVG9wICsgNTAwXG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbmNvbnN0IGFkZEV2ZW50ID0gKGluZGV4LCBsYXN0RXZlbnRJbmRleCkgPT4ge1xuICAgIGxldCBldmVudCA9IGV2ZW50c1tpbmRleF07XG4gICAgZXZlbnQuaW5kZXggPSBpbmRleDtcblxuICAgIGlmIChldmVudC5wYXVzZWQpIGV2ZW50LnN0YXR1cyA9ICdwYXVzZWQnO1xuICAgIGVsc2UgZXZlbnQuc3RhdHVzID0gaW5kZXggPD0gbGFzdEV2ZW50SW5kZXggPyAncGFzc2VkJzogJ3BlbmRpbmcnO1xuXG5cbiAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ3dhaXQnICYmIGV2ZW50LmR1cmF0aW9uIDwgMzAwKSByZXR1cm47XG5cbiAgICBldmVudC5pZGVudGlmaWVyID0gZ2V0UHJldHR5SWRlbnRpZmllcihldmVudC5wYXRoKTtcblxuICAgIGlmIChldmVudC53aGljaCA9PT0gMSkgZGVsZXRlIGV2ZW50LndoaWNoOyAvLyBjbGljayBldmVudHNcbiAgICBpZiAoZXZlbnQud2hpY2gpIGV2ZW50LmtleSA9IGdldFByZXR0eUtleShldmVudC53aGljaCk7XG5cbiAgICAkKCcudmhzLXNpZGViYXItZXZlbnRzJykuYXBwZW5kKGdldE5ld0V2ZW50SFRNTChldmVudCkpO1xufTtcblxuY29uc3QgZ2V0UHJldHR5SWRlbnRpZmllciA9IChwYXRoKSA9PiB7XG4gICAgbGV0IGlkZW50aWZpZXIgPSAnJztcbiAgICBpZiAoIXBhdGgpIHJldHVybiBpZGVudGlmaWVyO1xuXG4gICAgbGV0IGVsZW1lbnQgPSB4cGF0aC50b05vZGUocGF0aCwgZG9jdW1lbnQpO1xuICAgIGlmICghZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gaWRlbnRpZmllcjtcbiAgICB9XG5cbiAgICBpZGVudGlmaWVyICs9IGVsZW1lbnQudGFnTmFtZSA/IGAke2VsZW1lbnQudGFnTmFtZX1gOiAnJztcbiAgICBpZGVudGlmaWVyICs9IGVsZW1lbnQuaWQgPyBgIyR7ZWxlbWVudC5pZH1gOiAnJztcbiAgICBpZGVudGlmaWVyICs9IGVsZW1lbnQuY2xhc3NOYW1lID8gYC4ke2VsZW1lbnQuY2xhc3NOYW1lfWA6ICcnO1xuICAgIGlkZW50aWZpZXIgKz0gZWxlbWVudC50ZXh0ID8gYCgke2VsZW1lbnQudGV4dH0pYDogJyc7XG4gICAgcmV0dXJuIGlkZW50aWZpZXI7XG59O1xuXG5jb25zdCBnZXRQcmV0dHlLZXkgPSAod2hpY2gpID0+IHtcbiAgICBsZXQgbWFwID0ge1xuICAgICAgICA4OiAn4oaQJyxcbiAgICAgICAgMTM6ICfihrUnLFxuICAgICAgICAzMjogJ18nIC8vcHJveHkgZm9yIHNwYWNlXG4gICAgfVxuICAgIHJldHVybiBtYXBbd2hpY2hdIHx8IFN0cmluZy5mcm9tQ2hhckNvZGUod2hpY2gpO1xufTtcblxuY29uc3Qgc3R5bGVzID0gYDxzdHlsZT5cbiAgICAudmhzLXNpZGViYXIge1xuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgIHRvcDogMDtcbiAgICAgICAgcmlnaHQ6IDA7XG4gICAgICAgIHdpZHRoOiAzMDBweDtcbiAgICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgICAgICB6LWluZGV4OiA5OTk7XG4gICAgICAgIGJhY2tncm91bmQ6ICMyNTM0NDc7XG4gICAgICAgIGJvcmRlci1sZWZ0OiAxcHggc29saWQgIzFDMjkzOTtcbiAgICAgICAgb3ZlcmZsb3cteTogYXV0bztcbiAgICAgICAgY29sb3I6ICNGRkY7XG4gICAgICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICAgICAgZm9udC1mYW1pbHk6IG1vbm9zcGFjZTtcbiAgICB9XG4gICAgLnZocy1zaWRlYmFyLWhlYWRlciB7XG4gICAgICAgIGJhY2tncm91bmQ6ICMxQzI5Mzk7XG4gICAgICAgIHBhZGRpbmc6IDIwcHggMzBweDtcbiAgICAgICAgZm9udC1zaXplOiAxOHB4O1xuICAgIH1cbiAgICAudmhzLXNpZGViYXItZXZlbnQge1xuICAgICAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgICAgICBwYWRkaW5nOiAxMHB4O1xuICAgIH1cbiAgICAudmhzLXNpZGViYXItZXZlbnQtdHlwZSwgLnZocy1zaWRlYmFyLWV2ZW50LWtleSB7XG4gICAgICAgIGZsb2F0OiByaWdodDtcbiAgICB9XG4gICAgLnZocy1zaWRlYmFyLWV2ZW50LWtleSB7XG4gICAgICAgIGNvbG9yOiAjRDI0MjZFO1xuICAgICAgICBiYWNrZ3JvdW5kOiAjRjdGN0Y5O1xuICAgICAgICBib3JkZXI6IDFweCBzb2xpZCAjREREO1xuICAgICAgICBib3JkZXItcmFkaXVzOiAzcHg7XG4gICAgICAgIHBhZGRpbmc6IDAgM3B4O1xuICAgICAgICBtYXJnaW4tbGVmdDogNXB4O1xuICAgICAgICBkaXNwbGF5OiBpbmxpbmU7XG4gICAgfVxuICAgIC52aHMtc2lkZWJhci1zdGF0dXMge1xuICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgICAgIHdpZHRoOiA3LjVweDtcbiAgICAgICAgaGVpZ2h0OiA3LjVweDtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgICBtYXJnaW46IDAgNXB4O1xuICAgIH1cbiAgICAudmhzLXNpZGViYXItZXZlbnQtcGVuZGluZyB7XG4gICAgICAgIGNvbG9yOiAjNzA3Qzg4O1xuICAgIH1cbiAgICAudmhzLXNpZGViYXItZXZlbnQtcGVuZGluZyAudmhzLXNpZGViYXItc3RhdHVzIHtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzcwN0M4ODtcbiAgICB9XG4gICAgLnZocy1zaWRlYmFyLWV2ZW50LXBhc3NlZCB7XG4gICAgICAgIGNvbG9yOiAjOEVERkJBO1xuICAgIH1cbiAgICAudmhzLXNpZGViYXItZXZlbnQtcGFzc2VkIC52aHMtc2lkZWJhci1zdGF0dXMge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjOEVERkJBO1xuICAgIH1cbiAgICAudmhzLXNpZGViYXItZXZlbnQtZmFpbGVkIC52aHMtc2lkZWJhci1zdGF0dXMge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZWQ7XG4gICAgfVxuICAgIC52aHMtc2lkZWJhci1ldmVudC1wYXVzZWQge1xuICAgICAgICBjb2xvcjogI2ZmZDU5MDtcbiAgICB9XG4gICAgLnZocy1zaWRlYmFyLWV2ZW50LXBhdXNlZCAudmhzLXNpZGViYXItc3RhdHVzIHtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZDU5MDtcbiAgICB9XG48L3N0eWxlPmA7XG5cbmNvbnN0IGh0bWwgPSBgXG4gICAgPGRpdiBjbGFzcz1cInZocy1zaWRlYmFyXCI+XG4gICAgICAgICR7c3R5bGVzfVxuICAgICAgICA8ZGl2IGNsYXNzPVwidmhzLXNpZGViYXItaGVhZGVyXCI+XG4gICAgICAgICAgICBFdmVudHNcbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ2aHMtc2lkZWJhci1ldmVudHNcIj5cblxuICAgICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbmA7XG5cbmNvbnN0IGdldERldGFpbEhUTUwgPSAoZGF0YSwgdHlwZSkgPT4ge1xuICAgIGlmICghZGF0YSkgcmV0dXJuIGBgO1xuICAgIGlmICh0eXBlID09PSAnZHVyYXRpb24nKSBkYXRhID0gYCYjMTI4MzM3OyAke2RhdGF9YDtcbiAgICByZXR1cm4gYDxzcGFuIGNsYXNzPVwidmhzLXNpZGViYXItZXZlbnQtJHt0eXBlfVwiPiR7ZGF0YX08L3NwYW4+YDtcbn07XG5cbmNvbnN0IGdldE5ld0V2ZW50SFRNTCA9ICh7dHlwZSwgZHVyYXRpb24sIGtleSwgaWRlbnRpZmllciwgc3RhdHVzLCBpbmRleH0pID0+IHtcbiAgICByZXR1cm4gYFxuICAgICAgICA8ZGl2XG4gICAgICAgICAgICBjbGFzcz1cInZocy1zaWRlYmFyLWV2ZW50IHZocy1zaWRlYmFyLWV2ZW50LSR7c3RhdHVzfVwiXG4gICAgICAgICAgICBkYXRhLWluZGV4PSR7aW5kZXh9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInZocy1zaWRlYmFyLXN0YXR1c1wiIG9uY2xpY2s9XCJ2aHMuZGVidWcoJHtpbmRleH0pXCI+PC9zcGFuPlxuICAgICAgICAgICAgJHtnZXREZXRhaWxIVE1MKGlkZW50aWZpZXIsICdpZGVudGlmaWVyJyl9XG4gICAgICAgICAgICAke2dldERldGFpbEhUTUwoZHVyYXRpb24sICdkdXJhdGlvbicpfVxuXG4gICAgICAgICAgICAke2dldERldGFpbEhUTUwoa2V5LCAna2V5Jyl9XG4gICAgICAgICAgICAke2dldERldGFpbEhUTUwodHlwZSwgJ3R5cGUnKX1cbiAgICAgICAgPC9kaXY+XG4gICAgYDtcbn07XG5cbmNvbnN0IHRvZ2dsZUJyZWFrcG9pbnQgPSAoaW5kZXgpID0+IHtcbiAgICBsZXQgc2VsZWN0b3IgPSBgLnZocy1zaWRlYmFyLWV2ZW50W2RhdGEtaW5kZXg9JHtpbmRleH1dYDtcbiAgICAkKHNlbGVjdG9yKS50b2dnbGVDbGFzcygndmhzLXNpZGViYXItZXZlbnQtcGF1c2VkJyk7XG5cbiAgICAvKiBTZXQgcGVuZGluZyBvciBwYXNzZWQgc3RhdGUgYmFzZWQgb24gbGFzdFBhc3NlZFRlc3QgKi9cbiAgICBsZXQgbGFzdFBhc3NlZFRlc3QgPSAkKCcudmhzLXNpZGViYXItZXZlbnQtcGFzc2VkJykubGFzdCgpO1xuICAgIGlmIChpbmRleCA8IGxhc3RQYXNzZWRUZXN0LmRhdGEoJ2luZGV4JykpICQoc2VsZWN0b3IpLnRvZ2dsZUNsYXNzKCd2aHMtc2lkZWJhci1ldmVudC1wYXNzZWQnKTtcbiAgICBlbHNlICQoc2VsZWN0b3IpLnRvZ2dsZUNsYXNzKCd2aHMtc2lkZWJhci1ldmVudC1wZW5kaW5nJyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzaG93LFxuICAgIHJlbmRlcixcbiAgICB0b2dnbGVCcmVha3BvaW50XG59XG4iLCIvKiBMaWIgdG8gZ2V0IHhwYXRoIGZvciBhIERPTSBub2RlICovXG5jb25zdCB4cGF0aCA9IHJlcXVpcmUoJ3NpbXBsZS14cGF0aC1wb3NpdGlvbicpO1xuXG4vKiBQb2x5ZmlsbCBmb3IgQXJyYXkucHJvdG90eXBlLmluY2x1ZGVzICovXG5yZXF1aXJlKCdjb3JlLWpzL2ZuL2FycmF5L2luY2x1ZGVzJyk7XG5cbmNvbnN0IGNvbnRyb2xzID0gcmVxdWlyZSgnLi9jb250cm9scycpO1xuY29uc3Qgc2lkZWJhciA9IHJlcXVpcmUoJy4vc2lkZWJhcicpO1xuXG4vKiBXaGl0ZWxpc3Qgb2YgRE9NIGV2ZW50cyB0aGF0IGFyZSByZWNvcmRlZCAqL1xuY29uc3QgZXZlbnRUeXBlcyA9IFsnY2xpY2snLCAna2V5cHJlc3MnLCAnZGJsY2xpY2snXTtcblxuLyogSGFja3kgZXZlbnRzICovXG5jb25zdCBzcGVjaWFsRXZlbnRUeXBlcyA9IFsna2V5ZG93biddO1xuXG5sZXQgZXZlbnRzID0gW107XG5cbi8qIENyZWF0ZSBldmVudCBoYW5kbGVycyBmb3IgZWFjaCBldmVudCB0eXBlIC0gY2FsbCBgcmVjb3JkYCBmdW5jdGlvbiAqL1xuY29uc3QgZ2V0RXZlbnRIYW5kbGVycyA9ICgpID0+IHtcbiAgICBsZXQgaGFuZGxlcnMgPSB7fTtcbiAgICBldmVudFR5cGVzLm1hcCh0eXBlID0+IGhhbmRsZXJzW3R5cGVdID0gcmVjb3JkRXZlbnQpO1xuICAgIHNwZWNpYWxFdmVudFR5cGVzLm1hcCh0eXBlID0+IGhhbmRsZXJzW3R5cGVdID0gcmVjb3JkRXZlbnQpO1xuICAgIHJldHVybiBoYW5kbGVycztcbn07XG5cbmNvbnN0IHdyYXBCb2R5SW5SZWNvcmRhYmxlID0gKCkgPT4ge1xuICAgICQoJ2JvZHknKS53cmFwSW5uZXIoJzxkaXYgY2xhc3M9XCJ2aHMtcmVjb3JkYWJsZVwiPjwvZGl2PicpXG59O1xuXG5jb25zdCBhdHRhY2hIYW5kbGVycyA9ICgpID0+IHtcbiAgICBsZXQgaGFuZGxlcnMgPSBnZXRFdmVudEhhbmRsZXJzKCk7XG4gICAgJCgnLnZocy1yZWNvcmRhYmxlJykub24oaGFuZGxlcnMpO1xufTtcblxuY29uc3QgZGV0YWNoSGFuZGxlcnMgPSAoKSA9PiB7XG4gICAgbGV0IGhhbmRsZXJzID0gZ2V0RXZlbnRIYW5kbGVycygpO1xuICAgICQoJy52aHMtcmVjb3JkYWJsZScpLm9mZihoYW5kbGVycyk7XG59O1xuXG5jb25zdCByZWNvcmRFdmVudCA9IChldmVudCkgPT4ge1xuICAgIC8qIE9ubHkgcmVjb3JkIHdoaXRlbGlzdGVkIGV2ZW50IHR5cGVzICovXG4gICAgaWYgKCFldmVudFR5cGVzLmluY2x1ZGVzKGV2ZW50LnR5cGUpKSB7XG4gICAgICAgIC8qIFNvbWUgZXZlbnRzIGxpa2Uga2V5ZG93biBuZWVkIHNwZWNpYWwgdHJlYXRtZW50ICovXG4gICAgICAgIGlmIChzcGVjaWFsRXZlbnRUeXBlcy5pbmNsdWRlcyhldmVudC50eXBlKSkgaGFuZGxlSGFja3MoZXZlbnQpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBXZSB3YW50IHRvIGdldCB0aGUgeHBhdGggb2YgdGhlIERPTSBlbGVtZW50LlxuICAgICAqXG4gICAgICogRGVwZW5kaW5nIG9uIHRoZSBpbnRlcmZhY2UsIHRoZSBlbGVtZW50IG1pZ2h0IG9yXG4gICAgICogbWlnaHQgbm90IHN0YXkgaW4gdGhlIERPTSB0cmVlIGFmdGVyIHRoZSBldmVudC5cbiAgICAgKlxuICAgICAqIFdlIG5lZWQgdG8gaGlqYWNrIHRoZSBldmVudCwgcnVuIG91ciBjb2RlIGZpcnN0XG4gICAgICogYW5kIHRoZW4gcGxheSB0aGUgZXZlbnQuXG4gICAgICovXG4gICAgaWYgKGV2ZW50LnByZXZlbnREZWZhdWx0KSBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgLyogQWRkaW5nIGEgd2FpdCBiZWZvcmUgZWFjaCB1c2VyIGV2ZW50ICovXG4gICAgZXZlbnRzLnB1c2goZ2V0V2FpdEV2ZW50KCkpO1xuXG4gICAgbGV0IHN5bnRoZXRpY0V2ZW50ID0ge1xuICAgICAgICB0eXBlOiBldmVudC50eXBlLFxuICAgICAgICB3aGljaDogZXZlbnQud2hpY2gsXG4gICAgICAgIHBhdGg6IHhwYXRoLmZyb21Ob2RlKGV2ZW50LnRhcmdldCwgZG9jdW1lbnQpXG4gICAgfTtcbiAgICBldmVudHMucHVzaChzeW50aGV0aWNFdmVudCk7XG5cbiAgICBpZiAoIWV2ZW50LmhhY2t5KSBwbGF5RXZlbnQoc3ludGhldGljRXZlbnQpO1xufTtcblxuY29uc3QgaGFuZGxlSGFja3MgPSAoZXZlbnQpID0+IHtcbiAgICAvKiBUaGUga2V5cHJlc3MgZXZlbnQgZG9lcyBub3QgY2F0Y2ggYmFjayBzcGFjZSBrZXkgKi9cbiAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ2tleWRvd24nICYmIGV2ZW50LndoaWNoID09PSA4KSBiYWNrc3BhY2VIYWNrKGV2ZW50KTtcbn07XG5cbmNvbnN0IGJhY2tzcGFjZUhhY2sgPSAoe3doaWNoLCB0YXJnZXR9KSA9PiB7XG4gICAgbGV0IGN1c3RvbUV2ZW50ID0ge1xuICAgICAgICB0eXBlOiAna2V5cHJlc3MnLFxuICAgICAgICB3aGljaCxcbiAgICAgICAgdGFyZ2V0LFxuICAgICAgICBoYWNreTogdHJ1ZVxuICAgIH07XG4gICAgcmVjb3JkRXZlbnQoY3VzdG9tRXZlbnQpO1xufTtcblxubGV0IGxhc3RFdmVudFRpbWVzdGFtcDtcbmNvbnN0IGdldFdhaXRFdmVudCA9ICgpID0+IHtcbiAgICBsZXQgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgbGV0IGV2ZW50ID0ge1xuICAgICAgICB0eXBlOiAnd2FpdCcsXG4gICAgICAgIC8qIFJldHVybiB0aW1lIHNpbmNlIGxhc3QgZXZlbnQgKi9cbiAgICAgICAgZHVyYXRpb246IChub3cgLSBsYXN0RXZlbnRUaW1lc3RhbXApIHx8IDBcbiAgICB9O1xuXG4gICAgbGFzdEV2ZW50VGltZXN0YW1wID0gbm93O1xuICAgIHJldHVybiBldmVudDtcbn07XG5cbmNvbnN0IGdldEVsZW1lbnQgPSAocGF0aCkgPT4ge1xuICAgIHJldHVybiB4cGF0aC50b05vZGUocGF0aCwgZG9jdW1lbnQpO1xufTtcblxuLyogUGxheSBhbiBldmVudCAqL1xuY29uc3QgcGxheUV2ZW50ID0gKGV2ZW50KSA9PiB7XG4gICAgLy8gVE9ETzogU2ltcGxpZnkgdGhpcyBmdW5jdGlvbiB3aXRoIGFzeW5jLWF3YWl0XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAvKlxuICAgICAgICAgKiBEb24ndCB3YW50IHN5bnRoZXRpYyBldmVudHMgdG8gYmUgcmVjb3JkZWQgd2hpbGUgd2hlbiB3ZSBwbGF5IHRoZW0uXG4gICAgICAgICAqIFdlIHdpbGwgZW5kIHVwIGluIGFuIGluZmluaXRlIGxvb3Agb3RoZXJ3aXNlXG4gICAgICAgICovXG4gICAgICAgIHN0b3BSZWNvcmRpbmcoKTtcblxuICAgICAgICAvKiBJbiBkZWJ1ZyBtb2RlLCBkb24ndCBwbGF5IHRoZSBldmVudC5cbiAgICAgICAgICogTm90IHJlc29sdmluZyB0aGUgcHJvbWlzZSBmcmVlemVzIHRoZSBwbGF5YmFjayBvbiB0aGlzIHN0ZXBcbiAgICAgICAgICogVG8gcmVwbGF5IGFnYWluLCBjYWxsIHBsYXlFdmVudCB3aXRoIHRoZSBuZXh0IGV2ZW50IGV4cGxpY2l0bHlcbiAgICAgICAgICovXG4gICAgICAgIGlmIChldmVudC5wYXVzZWQpIHtcbiAgICAgICAgICAgIHZocy5wYXVzZWRfYXQgPSBldmVudC5pbmRleDtcbiAgICAgICAgICAgIGNvbnRyb2xzLnRvZ2dsZVBhdXNlZFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvKlxuICAgICAgICAqIEFsbCBldmVudHMgcmV0dXJuIGEgcHJvbWlzZSB3aGljaCBpcyByZXNvbHZlZCBhZnRlclxuICAgICAgICAqIHRoZSBldmVudCBpcyBjb21wbGV0ZWQuIFVzZWZ1bCBmb3Igd2FpdCBldmVudHNcbiAgICAgICAgKi9cbiAgICAgICAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbGV0IHR5cGUgPSBldmVudC50eXBlO1xuICAgICAgICAgICAgLy8gVE9ETzogQ3JlYXRlIGFuIGV2ZW50IG1hcCBmb3IgZXZlbnRzXG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ2NsaWNrJykgY2xpY2soZXZlbnQsIHJlc29sdmUpO1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdkYmxjbGljaycpIGRibGNsaWNrKGV2ZW50LCByZXNvbHZlKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGUgPT09ICdrZXlwcmVzcycpIGtleXByZXNzKGV2ZW50LCByZXNvbHZlKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGUgPT09ICd3YWl0Jykgd2FpdChldmVudCwgcmVzb2x2ZSk7XG4gICAgICAgICAgICBlbHNlIHJlamVjdChuZXcgRXJyb3IoJ1Vua25vd24gZXZlbnQgdHlwZS4gQ291bGQgbm90IHBsYXknKSk7XG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLyogUmUtYXR0YWNoIGhhbmRsZXJzIGFmdGVyIGV2ZW50IGlzIHBsYXllZCAqL1xuICAgICAgICAgICAgcmVzdW1lUmVjb3JkaW5nKCk7IC8vVE9ETzogRG9uJ3QgYXR0YWNoIGluIHBsYXliYWNrIG1vZGVcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG4vKlxuICogU2ltdWxhdGUgZXZlbnRzXG4gKiBFYWNoIGhhbmRsZXIgZ2V0cyB0aGUgZXZlbnQgb2JqZWN0XG4gKiBhbmQgdGhlIHJlc29sdmUgZnVuY3Rpb24gZm9yIGl0J3MgcHJvbWlzZVxuICogcmVzb2x2ZSgpIG11c3QgYmUgY2FsbGVkIGF0IHRoZSBlbmQgb2YgdGhlIGZ1bmN0aW9uXG4gKi9cblxuY29uc3QgY2xpY2sgPSAoe3BhdGh9LCByZXNvbHZlKSA9PiB7XG4gICAgbGV0IGVsZW1lbnQgPSBnZXRFbGVtZW50KHBhdGgpO1xuICAgICQoZWxlbWVudCkudHJpZ2dlcignY2xpY2snKTtcbiAgICByZXNvbHZlKCk7XG59O1xuXG5jb25zdCBkYmxjbGljayA9ICh7cGF0aH0sIHJlc29sdmUpID0+IHtcbiAgICBsZXQgZWxlbWVudCA9IGdldEVsZW1lbnQocGF0aCk7XG4gICAgJChlbGVtZW50KS50cmlnZ2VyKCdkYmxjbGljaycpO1xuICAgIHJlc29sdmUoKTtcbn07XG5cbmNvbnN0IGtleXByZXNzID0gKHtwYXRoLCB3aGljaH0scmVzb2x2ZSkgPT4ge1xuICAgIGxldCBlbGVtZW50ID0gZ2V0RWxlbWVudChwYXRoKTtcbiAgICBsZXQgY3VycmVudFZhbHVlID0gJChlbGVtZW50KS52YWwoKTtcbiAgICBpZiAod2hpY2ggPT09IDgpIHtcbiAgICAgICAgLyogTWFudWFsbHkgaGFuZGxlIGJhY2tzcGFjZSAqL1xuICAgICAgICAkKGVsZW1lbnQpLnZhbChjdXJyZW50VmFsdWUuc3Vic3RyaW5nKDAsIGN1cnJlbnRWYWx1ZS5sZW5ndGgtMSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBrZXkgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHdoaWNoKTtcbiAgICAgICAgLyogTWFudWFsbHkgYWRkIGNoYXJhY2h0ZXIgKi9cbiAgICAgICAgJChlbGVtZW50KS52YWwoY3VycmVudFZhbHVlICsga2V5KTtcbiAgICB9XG4gICAgLyogVHJpZ2dlciBldmVudCAqL1xuICAgICQoZWxlbWVudCkudHJpZ2dlcihqUXVlcnkuRXZlbnQoJ2tleWRvd24nLCB7d2hpY2h9KSk7XG4gICAgJChlbGVtZW50KS50cmlnZ2VyKGpRdWVyeS5FdmVudCgna2V5dXAnLCB7d2hpY2h9KSk7XG4gICAgcmVzb2x2ZSgpO1xufTtcblxuY29uc3Qgd2FpdCA9ICh7ZHVyYXRpb259LCByZXNvbHZlKSA9PiB7XG4gICAgc2V0VGltZW91dCgoKSA9PiByZXNvbHZlKCksIGR1cmF0aW9uKTtcbn07XG5cbi8qIFBsYXkgYWxsIHJlY29yZGVkIGV2ZW50cyAqL1xuY29uc3QgcGxheSA9ICgpID0+IHtcbiAgICBjb250cm9scy50b2dnbGVQbGF5aW5nU3RhdGUoKTtcbiAgICBwbGF5RXZlbnRzUmVjdXJzaXZlbHkoMCk7XG59XG5cbmNvbnN0IHNldHVwUGxheWJhY2sgPSAoKSA9PiB7XG4gICAgaWYgKGlzUmVjb3JkaW5nKSB0b2dnbGVSZWNvcmRpbmcoKTtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndmhzLXBsYXliYWNrJywgdHJ1ZSk7XG4gICAgbG9jYXRpb24ucmVsb2FkKCk7XG59O1xuXG5jb25zdCBpbml0UGxheWJhY2sgPSAoKSA9PiB7XG4gICAgZXZlbnRzID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndmhzJykpLmV2ZW50cztcbiAgICBzaWRlYmFyLnNob3coKTtcbiAgICBzaWRlYmFyLnJlbmRlcihldmVudHMpO1xuICAgIHBsYXkoKTtcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndmhzLXBsYXliYWNrJyk7XG59O1xuXG5jb25zdCByZXN1bWVQbGF5YmFjayA9ICgpID0+IHtcbiAgICBsZXQgaW5kZXggPSB2aHMucGF1c2VkX2F0O1xuICAgIGNvbnRyb2xzLnRvZ2dsZVBhdXNlZFN0YXRlKCk7XG4gICAgcGxheUV2ZW50c1JlY3Vyc2l2ZWx5KCsraW5kZXgpO1xufTtcblxuY29uc3QgcGxheUV2ZW50c1JlY3Vyc2l2ZWx5ID0gKGluZGV4KSA9PiB7XG4gICAgaWYgKCFldmVudHNbaW5kZXhdKSB7XG4gICAgICAgIGNvbnRyb2xzLnRvZ2dsZVBsYXlpbmdTdGF0ZSgpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIC8qXG4gICAgICogSXQncyB1c2VmdWwgdG8gcmUtcmVuZGVyIHRoZSBzaWRlYmFyIGJlY2F1c2VcbiAgICAgKiB0aGUgZWxlbWVudCBpbiBhbiBldmVudCBtaWdodCBvbmx5IGVudGVyIHRoZSBET01cbiAgICAgKiBhZnRlciBpdCdzIHByZXZpb3VzIGV2ZW50LlxuICAgICAqIFBhc3NpbmcgbGFzdCBldmVudCBpbmRleCBmb3IgbWFya2luZyBwcm9ncmVzc1xuICAgICAqL1xuICAgIHNpZGViYXIucmVuZGVyKGV2ZW50cywgaW5kZXgpO1xuICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGV2ZW50c1tpbmRleF0pKTtcblxuICAgIC8qIFBsYXkgZXZlbnQgKi9cbiAgICBwbGF5RXZlbnQoZXZlbnRzW2luZGV4XSkudGhlbigoKSA9PiBwbGF5RXZlbnRzUmVjdXJzaXZlbHkoKytpbmRleCkpO1xufTtcblxubGV0IGlzUmVjb3JkaW5nID0gZmFsc2U7XG5jb25zdCB0b2dnbGVSZWNvcmRpbmcgPSAoKSA9PiB7XG4gICAgaWYgKGlzUmVjb3JkaW5nKSBzdG9wUmVjb3JkaW5nKCk7XG4gICAgZWxzZSByZWNvcmQoKTtcbiAgICBjb250cm9scy50b2dnbGVSZWNvcmRpbmdTdGF0ZSgpO1xufTtcblxuY29uc3QgcmVjb3JkID0gKCkgPT4ge1xuICAgIGV2ZW50cyA9IFtdO1xuICAgIHJlc3VtZVJlY29yZGluZygpO1xufTtcblxuY29uc3Qgc3RvcFJlY29yZGluZyA9ICgpID0+IHtcbiAgICBkZXRhY2hIYW5kbGVycygpO1xuICAgIGlzUmVjb3JkaW5nID0gZmFsc2U7XG4gICAgcGVyc2lzdEV2ZW50cygpO1xufTtcblxuY29uc3QgcGVyc2lzdEV2ZW50cyA9ICgpID0+IGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd2aHMnLCBKU09OLnN0cmluZ2lmeSh7ZXZlbnRzfSkpO1xuXG5jb25zdCByZXN1bWVSZWNvcmRpbmcgPSAoKSA9PiB7XG4gICAgYXR0YWNoSGFuZGxlcnMoKTtcbiAgICBpc1JlY29yZGluZyA9IHRydWU7XG59O1xuXG5jb25zdCBkZWJ1ZyA9IChpbmRleCkgPT4ge1xuICAgIGV2ZW50c1tpbmRleF0ucGF1c2VkID0gISEhZXZlbnRzW2luZGV4XS5wYXVzZWQ7IC8vIFRvZ2dsZSBwYXVzZSBhZnRlciB0aGlzIGV2ZW50XG4gICAgcGVyc2lzdEV2ZW50cygpO1xuICAgIHNpZGViYXIudG9nZ2xlQnJlYWtwb2ludChpbmRleCk7XG59XG5cbiQoKCkgPT4ge1xuICAgIC8qIEV4cG9zZSBwdWJsaWMgZnVuY3Rpb25zICovXG4gICAgd2luZG93LnZocyA9IHtcbiAgICAgICAgZXZlbnRzLFxuICAgICAgICB0b2dnbGVSZWNvcmRpbmcsXG4gICAgICAgIHNldHVwUGxheWJhY2ssXG4gICAgICAgIGRlYnVnLFxuICAgICAgICByZXN1bWVQbGF5YmFja1xuICAgIH1cbiAgICB3cmFwQm9keUluUmVjb3JkYWJsZSgpO1xuICAgIGNvbnRyb2xzLnNob3coKTtcblxuICAgIGxldCBwbGF5YmFjayA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd2aHMtcGxheWJhY2snKTtcbiAgICBpZiAocGxheWJhY2spIGluaXRQbGF5YmFjaygpO1xufSk7XG4iXX0=
