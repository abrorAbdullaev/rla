!function(t){var e={};function r(n){if(e[n])return e[n].exports;var o=e[n]={i:n,l:!1,exports:{}};return t[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}r.m=t,r.c=e,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)r.d(n,o,function(e){return t[e]}.bind(null,o));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=9)}([function(t,e,r){"use strict";var n;r.r(e),function(t){t[t.Transient=0]="Transient",t[t.Singleton=1]="Singleton",t[t.ResolutionScoped=2]="ResolutionScoped",t[t.ContainerScoped=3]="ContainerScoped"}(n||(n={}));var o=n,i=function(t,e){return(i=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var r in e)e.hasOwnProperty(r)&&(t[r]=e[r])})(t,e)};
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */function u(t){var e="function"==typeof Symbol&&t[Symbol.iterator],r=0;return e?e.call(t):{next:function(){return t&&r>=t.length&&(t=void 0),{value:t&&t[r++],done:!t}}}}function c(t,e){var r="function"==typeof Symbol&&t[Symbol.iterator];if(!r)return t;var n,o,i=r.call(t),u=[];try{for(;(void 0===e||e-- >0)&&!(n=i.next()).done;)u.push(n.value)}catch(t){o={error:t}}finally{try{n&&!n.done&&(r=i.return)&&r.call(i)}finally{if(o)throw o.error}}return u}function s(){for(var t=[],e=0;e<arguments.length;e++)t=t.concat(c(arguments[e]));return t}function a(t){var e=Reflect.getMetadata("design:paramtypes",t)||[],r=Reflect.getOwnMetadata("injectionTokens",t)||{};return Object.keys(r).forEach((function(t){e[+t]=r[t]})),e}function f(t){return function(e,r,n){var o=Reflect.getOwnMetadata("injectionTokens",e)||{};o[n]=t,Reflect.defineMetadata("injectionTokens",o,e)}}function l(t){return!!t.useClass}function p(t){return!!t.useFactory}function y(t){return"string"==typeof t||"symbol"==typeof t}function h(t){return"object"==typeof t&&"token"in t&&"multiple"in t}function d(t){return!!t.useToken}function v(t){return null!=t.useValue}var g=function(){function t(){this._registryMap=new Map}return t.prototype.entries=function(){return this._registryMap.entries()},t.prototype.getAll=function(t){return this.ensure(t),this._registryMap.get(t)},t.prototype.get=function(t){this.ensure(t);var e=this._registryMap.get(t);return e[e.length-1]||null},t.prototype.set=function(t,e){this.ensure(t),this._registryMap.get(t).push(e)},t.prototype.setAll=function(t,e){this._registryMap.set(t,e)},t.prototype.has=function(t){return this.ensure(t),this._registryMap.get(t).length>0},t.prototype.clear=function(){this._registryMap.clear()},t.prototype.ensure=function(t){this._registryMap.has(t)||this._registryMap.set(t,[])},t}(),_=function(){this.scopedResolutions=new Map},w=new Map,m=new(function(){function t(t){this.parent=t,this._registry=new g}return t.prototype.register=function(t,e,r){var n;if(void 0===r&&(r={lifecycle:o.Transient}),n=function(t){return l(t)||v(t)||d(t)||p(t)}(e)?e:{useClass:e},(r.lifecycle===o.Singleton||r.lifecycle==o.ContainerScoped||r.lifecycle==o.ResolutionScoped)&&(v(n)||p(n)))throw'Cannot use lifecycle "'+o[r.lifecycle]+'" with ValueProviders or FactoryProviders';return this._registry.set(t,{provider:n,options:r}),this},t.prototype.registerType=function(t,e){return y(e)?this.register(t,{useToken:e}):this.register(t,{useClass:e})},t.prototype.registerInstance=function(t,e){return this.register(t,{useValue:e})},t.prototype.registerSingleton=function(t,e){if(y(t)){if(y(e))return this.register(t,{useToken:e},{lifecycle:o.Singleton});if(e)return this.register(t,{useClass:e},{lifecycle:o.Singleton});throw'Cannot register a type name as a singleton without a "to" token'}var r=t;return e&&!y(e)&&(r=e),this.register(t,{useClass:r},{lifecycle:o.Singleton})},t.prototype.resolve=function(t,e){void 0===e&&(e=new _);var r=this.getRegistration(t);if(!r&&y(t))throw"Attempted to resolve unregistered dependency token: "+t.toString();return r?this.resolveRegistration(r,e):this.construct(t,e)},t.prototype.resolveRegistration=function(t,e){if(t.options.lifecycle===o.ResolutionScoped&&e.scopedResolutions.has(t))return e.scopedResolutions.get(t);var r,n=t.options.lifecycle===o.Singleton,i=t.options.lifecycle===o.ContainerScoped,u=n||i;return r=v(t.provider)?t.provider.useValue:d(t.provider)?u?t.instance||(t.instance=this.resolve(t.provider.useToken,e)):this.resolve(t.provider.useToken,e):l(t.provider)?u?t.instance||(t.instance=this.construct(t.provider.useClass,e)):this.construct(t.provider.useClass,e):p(t.provider)?t.provider.useFactory(this):this.construct(t.provider,e),t.options.lifecycle===o.ResolutionScoped&&e.scopedResolutions.set(t,r),r},t.prototype.resolveAll=function(t,e){var r=this;void 0===e&&(e=new _);var n=this.getAllRegistrations(t);if(!n&&y(t))throw"Attempted to resolve unregistered dependency token: "+t.toString();return n?n.map((function(t){return r.resolveRegistration(t,e)})):[this.construct(t,e)]},t.prototype.isRegistered=function(t,e){return void 0===e&&(e=!1),this._registry.has(t)||e&&(this.parent||!1)&&this.parent.isRegistered(t,!0)},t.prototype.reset=function(){this._registry.clear()},t.prototype.createChildContainer=function(){var e,r,n=new t(this);try{for(var i=u(this._registry.entries()),s=i.next();!s.done;s=i.next()){var a=c(s.value,2),f=a[0],l=a[1];l.some((function(t){return t.options.lifecycle===o.ContainerScoped}))&&n._registry.setAll(f,l.map((function(t){return t.options.lifecycle===o.ContainerScoped?{provider:t.provider,options:t.options}:t})))}}catch(t){e={error:t}}finally{try{s&&!s.done&&(r=i.return)&&r.call(i)}finally{if(e)throw e.error}}return n},t.prototype.getRegistration=function(t){return this.isRegistered(t)?this._registry.get(t):this.parent?this.parent.getRegistration(t):null},t.prototype.getAllRegistrations=function(t){return this.isRegistered(t)?this._registry.getAll(t):this.parent?this.parent.getAllRegistrations(t):null},t.prototype.construct=function(t,e){var r=this;if(0===t.length)return new t;var n=w.get(t);if(!n||0===n.length)throw"TypeInfo not known for "+t;var o=n.map((function(t){return h(t)?t.multiple?r.resolveAll(t.token):r.resolve(t.token,e):r.resolve(t,e)}));return new(t.bind.apply(t,s([void 0],o)))},t}());var b=function(){return function(t){var e=a(t);return function(r){function n(){for(var n=[],o=0;o<arguments.length;o++)n[o]=arguments[o];return r.apply(this,s(n.concat(e.slice(n.length).map((function(e,r){try{return h(e)?e.multiple?m.resolveAll(e.token):m.resolve(e.token):m.resolve(e)}catch(e){var o=r+n.length,i=c(t.toString().match(/constructor\(([\w, ]+)\)/)||[],2)[1],u=void 0===i?null:i;throw"Cannot inject the dependency "+(u?u.split(",")[o]:"#"+o)+" of "+t.name+" constructor. "+e}})))))||this}return function(t,e){function r(){this.constructor=t}i(t,e),t.prototype=null===e?Object.create(e):(r.prototype=e.prototype,new r)}(n,r),n}(t)}};var k=function(t){return f(t)};var T=function(){return function(t){w.set(t,a(t))}};var O=function(t){return void 0===t&&(t=[]),function(e){return t.forEach((function(t){var e=t.token,r=t.options,n=function(t,e){var r={};for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&e.indexOf(n)<0&&(r[n]=t[n]);if(null!=t&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(n=Object.getOwnPropertySymbols(t);o<n.length;o++)e.indexOf(n[o])<0&&Object.prototype.propertyIsEnumerable.call(t,n[o])&&(r[n[o]]=t[n[o]])}return r}(t,["token","options"]);return m.register(e,n,r)})),e}};var j=function(){return function(t){T()(t),m.registerSingleton(t)}};var S=function(t){return f({token:t,multiple:!0})};function M(t,e){return function(r){T()(r),m.register(e||r,r,{lifecycle:t})}}function R(t){var e;return function(r){return null==e&&(e=t(r)),e}}function P(t,e,r,n){var o,i;return void 0===n&&(n=!0),function(u){var c=t(u);return n&&i===c||(o=(i=c)?u.resolve(e):u.resolve(r)),o}}if(r.d(e,"Lifecycle",(function(){return o})),r.d(e,"autoInjectable",(function(){return b})),r.d(e,"inject",(function(){return k})),r.d(e,"injectable",(function(){return T})),r.d(e,"registry",(function(){return O})),r.d(e,"singleton",(function(){return j})),r.d(e,"injectAll",(function(){return S})),r.d(e,"scoped",(function(){return M})),r.d(e,"instanceCachingFactory",(function(){return R})),r.d(e,"predicateAwareClassFactory",(function(){return P})),r.d(e,"isClassProvider",(function(){return l})),r.d(e,"isFactoryProvider",(function(){return p})),r.d(e,"isNormalToken",(function(){return y})),r.d(e,"isTokenProvider",(function(){return d})),r.d(e,"isValueProvider",(function(){return v})),r.d(e,"container",(function(){return m})),"undefined"==typeof Reflect||!Reflect.getMetadata)throw"tsyringe requires a reflect polyfill. Please add 'import \"reflect-metadata\"' to the top of your entry point."},function(t,e,r){(function(t,e){
/*! *****************************************************************************
Copyright (C) Microsoft. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var r;!function(r){!function(n){var o="object"==typeof e?e:"object"==typeof self?self:"object"==typeof this?this:Function("return this;")(),i=u(r);function u(t,e){return function(r,n){"function"!=typeof t[r]&&Object.defineProperty(t,r,{configurable:!0,writable:!0,value:n}),e&&e(r,n)}}void 0===o.Reflect?o.Reflect=r:i=u(o.Reflect,i),function(e){var r=Object.prototype.hasOwnProperty,n="function"==typeof Symbol,o=n&&void 0!==Symbol.toPrimitive?Symbol.toPrimitive:"@@toPrimitive",i=n&&void 0!==Symbol.iterator?Symbol.iterator:"@@iterator",u="function"==typeof Object.create,c={__proto__:[]}instanceof Array,s=!u&&!c,a={create:u?function(){return C(Object.create(null))}:c?function(){return C({__proto__:null})}:function(){return C({})},has:s?function(t,e){return r.call(t,e)}:function(t,e){return e in t},get:s?function(t,e){return r.call(t,e)?t[e]:void 0}:function(t,e){return t[e]}},f=Object.getPrototypeOf(Function),l="object"==typeof t&&t.env&&"true"===t.env.REFLECT_METADATA_USE_MAP_POLYFILL,p=l||"function"!=typeof Map||"function"!=typeof Map.prototype.entries?function(){var t={},e=[],r=function(){function t(t,e,r){this._index=0,this._keys=t,this._values=e,this._selector=r}return t.prototype["@@iterator"]=function(){return this},t.prototype[i]=function(){return this},t.prototype.next=function(){var t=this._index;if(t>=0&&t<this._keys.length){var r=this._selector(this._keys[t],this._values[t]);return t+1>=this._keys.length?(this._index=-1,this._keys=e,this._values=e):this._index++,{value:r,done:!1}}return{value:void 0,done:!0}},t.prototype.throw=function(t){throw this._index>=0&&(this._index=-1,this._keys=e,this._values=e),t},t.prototype.return=function(t){return this._index>=0&&(this._index=-1,this._keys=e,this._values=e),{value:t,done:!0}},t}();return function(){function e(){this._keys=[],this._values=[],this._cacheKey=t,this._cacheIndex=-2}return Object.defineProperty(e.prototype,"size",{get:function(){return this._keys.length},enumerable:!0,configurable:!0}),e.prototype.has=function(t){return this._find(t,!1)>=0},e.prototype.get=function(t){var e=this._find(t,!1);return e>=0?this._values[e]:void 0},e.prototype.set=function(t,e){var r=this._find(t,!0);return this._values[r]=e,this},e.prototype.delete=function(e){var r=this._find(e,!1);if(r>=0){for(var n=this._keys.length,o=r+1;o<n;o++)this._keys[o-1]=this._keys[o],this._values[o-1]=this._values[o];return this._keys.length--,this._values.length--,e===this._cacheKey&&(this._cacheKey=t,this._cacheIndex=-2),!0}return!1},e.prototype.clear=function(){this._keys.length=0,this._values.length=0,this._cacheKey=t,this._cacheIndex=-2},e.prototype.keys=function(){return new r(this._keys,this._values,n)},e.prototype.values=function(){return new r(this._keys,this._values,o)},e.prototype.entries=function(){return new r(this._keys,this._values,u)},e.prototype["@@iterator"]=function(){return this.entries()},e.prototype[i]=function(){return this.entries()},e.prototype._find=function(t,e){return this._cacheKey!==t&&(this._cacheIndex=this._keys.indexOf(this._cacheKey=t)),this._cacheIndex<0&&e&&(this._cacheIndex=this._keys.length,this._keys.push(t),this._values.push(void 0)),this._cacheIndex},e}();function n(t,e){return t}function o(t,e){return e}function u(t,e){return[t,e]}}():Map,y=l||"function"!=typeof Set||"function"!=typeof Set.prototype.entries?function(){function t(){this._map=new p}return Object.defineProperty(t.prototype,"size",{get:function(){return this._map.size},enumerable:!0,configurable:!0}),t.prototype.has=function(t){return this._map.has(t)},t.prototype.add=function(t){return this._map.set(t,t),this},t.prototype.delete=function(t){return this._map.delete(t)},t.prototype.clear=function(){this._map.clear()},t.prototype.keys=function(){return this._map.keys()},t.prototype.values=function(){return this._map.values()},t.prototype.entries=function(){return this._map.entries()},t.prototype["@@iterator"]=function(){return this.keys()},t.prototype[i]=function(){return this.keys()},t}():Set,h=new(l||"function"!=typeof WeakMap?function(){var t=a.create(),e=n();return function(){function t(){this._key=n()}return t.prototype.has=function(t){var e=o(t,!1);return void 0!==e&&a.has(e,this._key)},t.prototype.get=function(t){var e=o(t,!1);return void 0!==e?a.get(e,this._key):void 0},t.prototype.set=function(t,e){return o(t,!0)[this._key]=e,this},t.prototype.delete=function(t){var e=o(t,!1);return void 0!==e&&delete e[this._key]},t.prototype.clear=function(){this._key=n()},t}();function n(){var e;do{e="@@WeakMap@@"+u()}while(a.has(t,e));return t[e]=!0,e}function o(t,n){if(!r.call(t,e)){if(!n)return;Object.defineProperty(t,e,{value:a.create()})}return t[e]}function i(t,e){for(var r=0;r<e;++r)t[r]=255*Math.random()|0;return t}function u(){var t,e=(t=16,"function"==typeof Uint8Array?"undefined"!=typeof crypto?crypto.getRandomValues(new Uint8Array(t)):"undefined"!=typeof msCrypto?msCrypto.getRandomValues(new Uint8Array(t)):i(new Uint8Array(t),t):i(new Array(t),t));e[6]=79&e[6]|64,e[8]=191&e[8]|128;for(var r="",n=0;n<16;++n){var o=e[n];4!==n&&6!==n&&8!==n||(r+="-"),o<16&&(r+="0"),r+=o.toString(16).toLowerCase()}return r}}():WeakMap);function d(t,e,r){var n=h.get(t);if(b(n)){if(!r)return;n=new p,h.set(t,n)}var o=n.get(e);if(b(o)){if(!r)return;o=new p,n.set(e,o)}return o}function v(t,e,r){var n=d(e,r,!1);return!b(n)&&!!n.has(t)}function g(t,e,r){var n=d(e,r,!1);if(!b(n))return n.get(t)}function _(t,e,r,n){d(r,n,!0).set(t,e)}function w(t,e){var r=[],n=d(t,e,!1);if(b(n))return r;for(var o=function(t){var e=P(t,i);if(!M(e))throw new TypeError;var r=e.call(t);if(!T(r))throw new TypeError;return r}(n.keys()),u=0;;){var c=A(o);if(!c)return r.length=u,r;var s=c.value;try{r[u]=s}catch(t){try{E(o)}finally{throw t}}u++}}function m(t){if(null===t)return 1;switch(typeof t){case"undefined":return 0;case"boolean":return 2;case"string":return 3;case"symbol":return 4;case"number":return 5;case"object":return null===t?1:6;default:return 6}}function b(t){return void 0===t}function k(t){return null===t}function T(t){return"object"==typeof t?null!==t:"function"==typeof t}function O(t,e){switch(m(t)){case 0:case 1:case 2:case 3:case 4:case 5:return t}var r=3===e?"string":5===e?"number":"default",n=P(t,o);if(void 0!==n){var i=n.call(t,r);if(T(i))throw new TypeError;return i}return function(t,e){if("string"===e){var r=t.toString;if(M(r))if(!T(o=r.call(t)))return o;if(M(n=t.valueOf))if(!T(o=n.call(t)))return o}else{var n;if(M(n=t.valueOf))if(!T(o=n.call(t)))return o;var o,i=t.toString;if(M(i))if(!T(o=i.call(t)))return o}throw new TypeError}(t,"default"===r?"number":r)}function j(t){var e=O(t,3);return"symbol"==typeof e?e:function(t){return""+t}(e)}function S(t){return Array.isArray?Array.isArray(t):t instanceof Object?t instanceof Array:"[object Array]"===Object.prototype.toString.call(t)}function M(t){return"function"==typeof t}function R(t){return"function"==typeof t}function P(t,e){var r=t[e];if(null!=r){if(!M(r))throw new TypeError;return r}}function A(t){var e=t.next();return!e.done&&e}function E(t){var e=t.return;e&&e.call(t)}function x(t){var e=Object.getPrototypeOf(t);if("function"!=typeof t||t===f)return e;if(e!==f)return e;var r=t.prototype,n=r&&Object.getPrototypeOf(r);if(null==n||n===Object.prototype)return e;var o=n.constructor;return"function"!=typeof o?e:o===t?e:o}function C(t){return t.__=void 0,delete t.__,t}e("decorate",(function(t,e,r,n){if(b(r)){if(!S(t))throw new TypeError;if(!R(e))throw new TypeError;return function(t,e){for(var r=t.length-1;r>=0;--r){var n=(0,t[r])(e);if(!b(n)&&!k(n)){if(!R(n))throw new TypeError;e=n}}return e}(t,e)}if(!S(t))throw new TypeError;if(!T(e))throw new TypeError;if(!T(n)&&!b(n)&&!k(n))throw new TypeError;return k(n)&&(n=void 0),function(t,e,r,n){for(var o=t.length-1;o>=0;--o){var i=(0,t[o])(e,r,n);if(!b(i)&&!k(i)){if(!T(i))throw new TypeError;n=i}}return n}(t,e,r=j(r),n)})),e("metadata",(function(t,e){return function(r,n){if(!T(r))throw new TypeError;if(!b(n)&&!function(t){switch(m(t)){case 3:case 4:return!0;default:return!1}}(n))throw new TypeError;_(t,e,r,n)}})),e("defineMetadata",(function(t,e,r,n){if(!T(r))throw new TypeError;return b(n)||(n=j(n)),_(t,e,r,n)})),e("hasMetadata",(function(t,e,r){if(!T(e))throw new TypeError;return b(r)||(r=j(r)),function t(e,r,n){if(v(e,r,n))return!0;var o=x(r);return!k(o)&&t(e,o,n)}(t,e,r)})),e("hasOwnMetadata",(function(t,e,r){if(!T(e))throw new TypeError;return b(r)||(r=j(r)),v(t,e,r)})),e("getMetadata",(function(t,e,r){if(!T(e))throw new TypeError;return b(r)||(r=j(r)),function t(e,r,n){if(v(e,r,n))return g(e,r,n);var o=x(r);return k(o)?void 0:t(e,o,n)}(t,e,r)})),e("getOwnMetadata",(function(t,e,r){if(!T(e))throw new TypeError;return b(r)||(r=j(r)),g(t,e,r)})),e("getMetadataKeys",(function(t,e){if(!T(t))throw new TypeError;return b(e)||(e=j(e)),function t(e,r){var n=w(e,r),o=x(e);if(null===o)return n;var i=t(o,r);if(i.length<=0)return n;if(n.length<=0)return i;for(var u=new y,c=[],s=0,a=n;s<a.length;s++){var f=a[s];u.has(f)||(u.add(f),c.push(f))}for(var l=0,p=i;l<p.length;l++){f=p[l];u.has(f)||(u.add(f),c.push(f))}return c}(t,e)})),e("getOwnMetadataKeys",(function(t,e){if(!T(t))throw new TypeError;return b(e)||(e=j(e)),w(t,e)})),e("deleteMetadata",(function(t,e,r){if(!T(e))throw new TypeError;b(r)||(r=j(r));var n=d(e,r,!1);if(b(n))return!1;if(!n.delete(t))return!1;if(n.size>0)return!0;var o=h.get(e);return o.delete(r),o.size>0||(h.delete(e),!0)}))}(i)}()}(r||(r={}))}).call(this,r(2),r(3))},function(t,e){var r,n,o=t.exports={};function i(){throw new Error("setTimeout has not been defined")}function u(){throw new Error("clearTimeout has not been defined")}function c(t){if(r===setTimeout)return setTimeout(t,0);if((r===i||!r)&&setTimeout)return r=setTimeout,setTimeout(t,0);try{return r(t,0)}catch(e){try{return r.call(null,t,0)}catch(e){return r.call(this,t,0)}}}!function(){try{r="function"==typeof setTimeout?setTimeout:i}catch(t){r=i}try{n="function"==typeof clearTimeout?clearTimeout:u}catch(t){n=u}}();var s,a=[],f=!1,l=-1;function p(){f&&s&&(f=!1,s.length?a=s.concat(a):l=-1,a.length&&y())}function y(){if(!f){var t=c(p);f=!0;for(var e=a.length;e;){for(s=a,a=[];++l<e;)s&&s[l].run();l=-1,e=a.length}s=null,f=!1,function(t){if(n===clearTimeout)return clearTimeout(t);if((n===u||!n)&&clearTimeout)return n=clearTimeout,clearTimeout(t);try{n(t)}catch(e){try{return n.call(null,t)}catch(e){return n.call(this,t)}}}(t)}}function h(t,e){this.fun=t,this.array=e}function d(){}o.nextTick=function(t){var e=new Array(arguments.length-1);if(arguments.length>1)for(var r=1;r<arguments.length;r++)e[r-1]=arguments[r];a.push(new h(t,e)),1!==a.length||f||c(y)},h.prototype.run=function(){this.fun.apply(null,this.array)},o.title="browser",o.browser=!0,o.env={},o.argv=[],o.version="",o.versions={},o.on=d,o.addListener=d,o.once=d,o.off=d,o.removeListener=d,o.removeAllListeners=d,o.emit=d,o.prependListener=d,o.prependOnceListener=d,o.listeners=function(t){return[]},o.binding=function(t){throw new Error("process.binding is not supported")},o.cwd=function(){return"/"},o.chdir=function(t){throw new Error("process.chdir is not supported")},o.umask=function(){return 0}},function(t,e){var r;r=function(){return this}();try{r=r||new Function("return this")()}catch(t){"object"==typeof window&&(r=window)}t.exports=r},,,,,,function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),r(1);const n=r(0),o=r(10),i=n.container.resolve(o.App);i.init(),setInterval(()=>{i.liveCheck()},5e3)},function(t,e,r){"use strict";var n=this&&this.__decorate||function(t,e,r,n){var o,i=arguments.length,u=i<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,r):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)u=Reflect.decorate(t,e,r,n);else for(var c=t.length-1;c>=0;c--)(o=t[c])&&(u=(i<3?o(u):i>3?o(e,r,u):o(e,r))||u);return i>3&&u&&Object.defineProperty(e,r,u),u};Object.defineProperty(e,"__esModule",{value:!0});let o=class{init(){this.isPageRelay().then(t=>{t?console.log("Relay"):console.log("Not Relay")})}liveCheck(){console.log("Live Check: ")}isPageRelay(){return new Promise(t=>{chrome.tabs.query({active:!0,currentWindow:!0},e=>{const r=e[0];t(Boolean(r&&r.url&&r.url.includes("relay.amazon.com/tours/loadboard")))})})}};o=n([r(0).injectable()],o),e.App=o}]);