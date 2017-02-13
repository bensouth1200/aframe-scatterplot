/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 37);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



var base64 = __webpack_require__(12)
var ieee754 = __webpack_require__(17)
var isArray = __webpack_require__(21)

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}


/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = function(dtype) {
  switch (dtype) {
    case 'int8':
      return Int8Array
    case 'int16':
      return Int16Array
    case 'int32':
      return Int32Array
    case 'uint8':
      return Uint8Array
    case 'uint16':
      return Uint16Array
    case 'uint32':
      return Uint32Array
    case 'float32':
      return Float32Array
    case 'float64':
      return Float64Array
    case 'array':
      return Array
    case 'uint8_clamped':
      return Uint8ClampedArray
  }
}


/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = isFunction

var toString = Object.prototype.toString

function isFunction (fn) {
  var string = toString.call(fn)
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
};


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/


/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};


/***/ }),
/* 5 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = {
	"jet": [
		"rgb(0,0,127)",
		"rgb(0,0,132)",
		"rgb(0,0,136)",
		"rgb(0,0,141)",
		"rgb(0,0,145)",
		"rgb(0,0,150)",
		"rgb(0,0,154)",
		"rgb(0,0,159)",
		"rgb(0,0,163)",
		"rgb(0,0,168)",
		"rgb(0,0,172)",
		"rgb(0,0,177)",
		"rgb(0,0,182)",
		"rgb(0,0,186)",
		"rgb(0,0,191)",
		"rgb(0,0,195)",
		"rgb(0,0,200)",
		"rgb(0,0,204)",
		"rgb(0,0,209)",
		"rgb(0,0,213)",
		"rgb(0,0,218)",
		"rgb(0,0,222)",
		"rgb(0,0,227)",
		"rgb(0,0,232)",
		"rgb(0,0,236)",
		"rgb(0,0,241)",
		"rgb(0,0,245)",
		"rgb(0,0,250)",
		"rgb(0,0,254)",
		"rgb(0,0,255)",
		"rgb(0,0,255)",
		"rgb(0,0,255)",
		"rgb(0,0,255)",
		"rgb(0,4,255)",
		"rgb(0,8,255)",
		"rgb(0,12,255)",
		"rgb(0,16,255)",
		"rgb(0,20,255)",
		"rgb(0,24,255)",
		"rgb(0,28,255)",
		"rgb(0,32,255)",
		"rgb(0,36,255)",
		"rgb(0,40,255)",
		"rgb(0,44,255)",
		"rgb(0,48,255)",
		"rgb(0,52,255)",
		"rgb(0,56,255)",
		"rgb(0,60,255)",
		"rgb(0,64,255)",
		"rgb(0,68,255)",
		"rgb(0,72,255)",
		"rgb(0,76,255)",
		"rgb(0,80,255)",
		"rgb(0,84,255)",
		"rgb(0,88,255)",
		"rgb(0,92,255)",
		"rgb(0,96,255)",
		"rgb(0,100,255)",
		"rgb(0,104,255)",
		"rgb(0,108,255)",
		"rgb(0,112,255)",
		"rgb(0,116,255)",
		"rgb(0,120,255)",
		"rgb(0,124,255)",
		"rgb(0,128,255)",
		"rgb(0,132,255)",
		"rgb(0,136,255)",
		"rgb(0,140,255)",
		"rgb(0,144,255)",
		"rgb(0,148,255)",
		"rgb(0,152,255)",
		"rgb(0,156,255)",
		"rgb(0,160,255)",
		"rgb(0,164,255)",
		"rgb(0,168,255)",
		"rgb(0,172,255)",
		"rgb(0,176,255)",
		"rgb(0,180,255)",
		"rgb(0,184,255)",
		"rgb(0,188,255)",
		"rgb(0,192,255)",
		"rgb(0,196,255)",
		"rgb(0,200,255)",
		"rgb(0,204,255)",
		"rgb(0,208,255)",
		"rgb(0,212,255)",
		"rgb(0,216,255)",
		"rgb(0,220,254)",
		"rgb(0,224,250)",
		"rgb(0,228,247)",
		"rgb(2,232,244)",
		"rgb(5,236,241)",
		"rgb(8,240,237)",
		"rgb(12,244,234)",
		"rgb(15,248,231)",
		"rgb(18,252,228)",
		"rgb(21,255,225)",
		"rgb(25,255,221)",
		"rgb(28,255,218)",
		"rgb(31,255,215)",
		"rgb(34,255,212)",
		"rgb(37,255,208)",
		"rgb(41,255,205)",
		"rgb(44,255,202)",
		"rgb(47,255,199)",
		"rgb(50,255,195)",
		"rgb(54,255,192)",
		"rgb(57,255,189)",
		"rgb(60,255,186)",
		"rgb(63,255,183)",
		"rgb(66,255,179)",
		"rgb(70,255,176)",
		"rgb(73,255,173)",
		"rgb(76,255,170)",
		"rgb(79,255,166)",
		"rgb(83,255,163)",
		"rgb(86,255,160)",
		"rgb(89,255,157)",
		"rgb(92,255,154)",
		"rgb(95,255,150)",
		"rgb(99,255,147)",
		"rgb(102,255,144)",
		"rgb(105,255,141)",
		"rgb(108,255,137)",
		"rgb(112,255,134)",
		"rgb(115,255,131)",
		"rgb(118,255,128)",
		"rgb(121,255,125)",
		"rgb(125,255,121)",
		"rgb(128,255,118)",
		"rgb(131,255,115)",
		"rgb(134,255,112)",
		"rgb(137,255,108)",
		"rgb(141,255,105)",
		"rgb(144,255,102)",
		"rgb(147,255,99)",
		"rgb(150,255,95)",
		"rgb(154,255,92)",
		"rgb(157,255,89)",
		"rgb(160,255,86)",
		"rgb(163,255,83)",
		"rgb(166,255,79)",
		"rgb(170,255,76)",
		"rgb(173,255,73)",
		"rgb(176,255,70)",
		"rgb(179,255,66)",
		"rgb(183,255,63)",
		"rgb(186,255,60)",
		"rgb(189,255,57)",
		"rgb(192,255,54)",
		"rgb(195,255,50)",
		"rgb(199,255,47)",
		"rgb(202,255,44)",
		"rgb(205,255,41)",
		"rgb(208,255,37)",
		"rgb(212,255,34)",
		"rgb(215,255,31)",
		"rgb(218,255,28)",
		"rgb(221,255,25)",
		"rgb(225,255,21)",
		"rgb(228,255,18)",
		"rgb(231,255,15)",
		"rgb(234,255,12)",
		"rgb(237,255,8)",
		"rgb(241,252,5)",
		"rgb(244,248,2)",
		"rgb(247,244,0)",
		"rgb(250,240,0)",
		"rgb(254,237,0)",
		"rgb(255,233,0)",
		"rgb(255,229,0)",
		"rgb(255,226,0)",
		"rgb(255,222,0)",
		"rgb(255,218,0)",
		"rgb(255,215,0)",
		"rgb(255,211,0)",
		"rgb(255,207,0)",
		"rgb(255,203,0)",
		"rgb(255,200,0)",
		"rgb(255,196,0)",
		"rgb(255,192,0)",
		"rgb(255,189,0)",
		"rgb(255,185,0)",
		"rgb(255,181,0)",
		"rgb(255,177,0)",
		"rgb(255,174,0)",
		"rgb(255,170,0)",
		"rgb(255,166,0)",
		"rgb(255,163,0)",
		"rgb(255,159,0)",
		"rgb(255,155,0)",
		"rgb(255,152,0)",
		"rgb(255,148,0)",
		"rgb(255,144,0)",
		"rgb(255,140,0)",
		"rgb(255,137,0)",
		"rgb(255,133,0)",
		"rgb(255,129,0)",
		"rgb(255,126,0)",
		"rgb(255,122,0)",
		"rgb(255,118,0)",
		"rgb(255,115,0)",
		"rgb(255,111,0)",
		"rgb(255,107,0)",
		"rgb(255,103,0)",
		"rgb(255,100,0)",
		"rgb(255,96,0)",
		"rgb(255,92,0)",
		"rgb(255,89,0)",
		"rgb(255,85,0)",
		"rgb(255,81,0)",
		"rgb(255,77,0)",
		"rgb(255,74,0)",
		"rgb(255,70,0)",
		"rgb(255,66,0)",
		"rgb(255,63,0)",
		"rgb(255,59,0)",
		"rgb(255,55,0)",
		"rgb(255,52,0)",
		"rgb(255,48,0)",
		"rgb(255,44,0)",
		"rgb(255,40,0)",
		"rgb(255,37,0)",
		"rgb(255,33,0)",
		"rgb(255,29,0)",
		"rgb(255,26,0)",
		"rgb(255,22,0)",
		"rgb(254,18,0)",
		"rgb(250,15,0)",
		"rgb(245,11,0)",
		"rgb(241,7,0)",
		"rgb(236,3,0)",
		"rgb(232,0,0)",
		"rgb(227,0,0)",
		"rgb(222,0,0)",
		"rgb(218,0,0)",
		"rgb(213,0,0)",
		"rgb(209,0,0)",
		"rgb(204,0,0)",
		"rgb(200,0,0)",
		"rgb(195,0,0)",
		"rgb(191,0,0)",
		"rgb(186,0,0)",
		"rgb(182,0,0)",
		"rgb(177,0,0)",
		"rgb(172,0,0)",
		"rgb(168,0,0)",
		"rgb(163,0,0)",
		"rgb(159,0,0)",
		"rgb(154,0,0)",
		"rgb(150,0,0)",
		"rgb(145,0,0)",
		"rgb(141,0,0)",
		"rgb(136,0,0)",
		"rgb(132,0,0)",
		"rgb(127,0,0)"
	],
	"grey": [
		"rgb(0,0,0)",
		"rgb(1,1,1)",
		"rgb(2,2,2)",
		"rgb(3,3,3)",
		"rgb(4,4,4)",
		"rgb(5,5,5)",
		"rgb(6,6,6)",
		"rgb(7,7,7)",
		"rgb(8,8,8)",
		"rgb(9,9,9)",
		"rgb(10,10,10)",
		"rgb(11,11,11)",
		"rgb(12,12,12)",
		"rgb(13,13,13)",
		"rgb(14,14,14)",
		"rgb(15,15,15)",
		"rgb(16,16,16)",
		"rgb(17,17,17)",
		"rgb(18,18,18)",
		"rgb(19,19,19)",
		"rgb(20,20,20)",
		"rgb(21,21,21)",
		"rgb(22,22,22)",
		"rgb(23,23,23)",
		"rgb(24,24,24)",
		"rgb(25,25,25)",
		"rgb(26,26,26)",
		"rgb(27,27,27)",
		"rgb(28,28,28)",
		"rgb(29,29,29)",
		"rgb(30,30,30)",
		"rgb(31,31,31)",
		"rgb(32,32,32)",
		"rgb(33,33,33)",
		"rgb(34,34,34)",
		"rgb(35,35,35)",
		"rgb(36,36,36)",
		"rgb(37,37,37)",
		"rgb(38,38,38)",
		"rgb(39,39,39)",
		"rgb(40,40,40)",
		"rgb(41,41,41)",
		"rgb(42,42,42)",
		"rgb(43,43,43)",
		"rgb(44,44,44)",
		"rgb(45,45,45)",
		"rgb(46,46,46)",
		"rgb(47,47,47)",
		"rgb(48,48,48)",
		"rgb(49,49,49)",
		"rgb(50,50,50)",
		"rgb(51,51,51)",
		"rgb(52,52,52)",
		"rgb(53,53,53)",
		"rgb(54,54,54)",
		"rgb(55,55,55)",
		"rgb(56,56,56)",
		"rgb(57,57,57)",
		"rgb(58,58,58)",
		"rgb(59,59,59)",
		"rgb(60,60,60)",
		"rgb(61,61,61)",
		"rgb(62,62,62)",
		"rgb(63,63,63)",
		"rgb(64,64,64)",
		"rgb(65,65,65)",
		"rgb(66,66,66)",
		"rgb(67,67,67)",
		"rgb(68,68,68)",
		"rgb(69,69,69)",
		"rgb(70,70,70)",
		"rgb(71,71,71)",
		"rgb(72,72,72)",
		"rgb(73,73,73)",
		"rgb(74,74,74)",
		"rgb(75,75,75)",
		"rgb(76,76,76)",
		"rgb(77,77,77)",
		"rgb(78,78,78)",
		"rgb(79,79,79)",
		"rgb(80,80,80)",
		"rgb(81,81,81)",
		"rgb(82,82,82)",
		"rgb(83,83,83)",
		"rgb(84,84,84)",
		"rgb(85,85,85)",
		"rgb(86,86,86)",
		"rgb(87,87,87)",
		"rgb(88,88,88)",
		"rgb(89,89,89)",
		"rgb(90,90,90)",
		"rgb(91,91,91)",
		"rgb(92,92,92)",
		"rgb(93,93,93)",
		"rgb(94,94,94)",
		"rgb(95,95,95)",
		"rgb(96,96,96)",
		"rgb(97,97,97)",
		"rgb(98,98,98)",
		"rgb(99,99,99)",
		"rgb(100,100,100)",
		"rgb(101,101,101)",
		"rgb(102,102,102)",
		"rgb(103,103,103)",
		"rgb(104,104,104)",
		"rgb(105,105,105)",
		"rgb(106,106,106)",
		"rgb(107,107,107)",
		"rgb(108,108,108)",
		"rgb(109,109,109)",
		"rgb(110,110,110)",
		"rgb(111,111,111)",
		"rgb(112,112,112)",
		"rgb(113,113,113)",
		"rgb(114,114,114)",
		"rgb(115,115,115)",
		"rgb(116,116,116)",
		"rgb(117,117,117)",
		"rgb(118,118,118)",
		"rgb(119,119,119)",
		"rgb(120,120,120)",
		"rgb(121,121,121)",
		"rgb(122,122,122)",
		"rgb(123,123,123)",
		"rgb(124,124,124)",
		"rgb(125,125,125)",
		"rgb(126,126,126)",
		"rgb(127,127,127)",
		"rgb(128,128,128)",
		"rgb(129,129,129)",
		"rgb(130,130,130)",
		"rgb(131,131,131)",
		"rgb(132,132,132)",
		"rgb(133,133,133)",
		"rgb(134,134,134)",
		"rgb(135,135,135)",
		"rgb(136,136,136)",
		"rgb(137,137,137)",
		"rgb(138,138,138)",
		"rgb(139,139,139)",
		"rgb(140,140,140)",
		"rgb(141,141,141)",
		"rgb(142,142,142)",
		"rgb(143,143,143)",
		"rgb(144,144,144)",
		"rgb(145,145,145)",
		"rgb(146,146,146)",
		"rgb(147,147,147)",
		"rgb(148,148,148)",
		"rgb(149,149,149)",
		"rgb(150,150,150)",
		"rgb(151,151,151)",
		"rgb(152,152,152)",
		"rgb(153,153,153)",
		"rgb(154,154,154)",
		"rgb(155,155,155)",
		"rgb(156,156,156)",
		"rgb(157,157,157)",
		"rgb(158,158,158)",
		"rgb(159,159,159)",
		"rgb(160,160,160)",
		"rgb(161,161,161)",
		"rgb(162,162,162)",
		"rgb(163,163,163)",
		"rgb(164,164,164)",
		"rgb(165,165,165)",
		"rgb(166,166,166)",
		"rgb(167,167,167)",
		"rgb(168,168,168)",
		"rgb(169,169,169)",
		"rgb(170,170,170)",
		"rgb(171,171,171)",
		"rgb(172,172,172)",
		"rgb(173,173,173)",
		"rgb(174,174,174)",
		"rgb(175,175,175)",
		"rgb(176,176,176)",
		"rgb(177,177,177)",
		"rgb(178,178,178)",
		"rgb(179,179,179)",
		"rgb(180,180,180)",
		"rgb(181,181,181)",
		"rgb(182,182,182)",
		"rgb(183,183,183)",
		"rgb(184,184,184)",
		"rgb(185,185,185)",
		"rgb(186,186,186)",
		"rgb(187,187,187)",
		"rgb(188,188,188)",
		"rgb(189,189,189)",
		"rgb(190,190,190)",
		"rgb(191,191,191)",
		"rgb(192,192,192)",
		"rgb(193,193,193)",
		"rgb(194,194,194)",
		"rgb(195,195,195)",
		"rgb(196,196,196)",
		"rgb(197,197,197)",
		"rgb(198,198,198)",
		"rgb(199,199,199)",
		"rgb(200,200,200)",
		"rgb(201,201,201)",
		"rgb(202,202,202)",
		"rgb(203,203,203)",
		"rgb(204,204,204)",
		"rgb(205,205,205)",
		"rgb(206,206,206)",
		"rgb(207,207,207)",
		"rgb(208,208,208)",
		"rgb(209,209,209)",
		"rgb(210,210,210)",
		"rgb(211,211,211)",
		"rgb(212,212,212)",
		"rgb(213,213,213)",
		"rgb(214,214,214)",
		"rgb(215,215,215)",
		"rgb(216,216,216)",
		"rgb(217,217,217)",
		"rgb(218,218,218)",
		"rgb(219,219,219)",
		"rgb(220,220,220)",
		"rgb(221,221,221)",
		"rgb(222,222,222)",
		"rgb(223,223,223)",
		"rgb(224,224,224)",
		"rgb(225,225,225)",
		"rgb(226,226,226)",
		"rgb(227,227,227)",
		"rgb(228,228,228)",
		"rgb(229,229,229)",
		"rgb(230,230,230)",
		"rgb(231,231,231)",
		"rgb(232,232,232)",
		"rgb(233,233,233)",
		"rgb(234,234,234)",
		"rgb(235,235,235)",
		"rgb(236,236,236)",
		"rgb(237,237,237)",
		"rgb(238,238,238)",
		"rgb(239,239,239)",
		"rgb(240,240,240)",
		"rgb(241,241,241)",
		"rgb(242,242,242)",
		"rgb(243,243,243)",
		"rgb(244,244,244)",
		"rgb(245,245,245)",
		"rgb(246,246,246)",
		"rgb(247,247,247)",
		"rgb(248,248,248)",
		"rgb(249,249,249)",
		"rgb(250,250,250)",
		"rgb(251,251,251)",
		"rgb(252,252,252)",
		"rgb(253,253,253)",
		"rgb(254,254,254)",
		"rgb(255,255,255)"
	],
	"terrain": [
		"rgb(51,51,153)",
		"rgb(49,53,155)",
		"rgb(48,56,158)",
		"rgb(47,59,161)",
		"rgb(45,61,163)",
		"rgb(44,64,166)",
		"rgb(43,67,169)",
		"rgb(41,69,171)",
		"rgb(40,72,174)",
		"rgb(39,75,177)",
		"rgb(37,77,179)",
		"rgb(36,80,182)",
		"rgb(35,83,185)",
		"rgb(33,85,187)",
		"rgb(32,88,190)",
		"rgb(31,91,193)",
		"rgb(29,93,195)",
		"rgb(28,96,198)",
		"rgb(27,99,201)",
		"rgb(25,101,203)",
		"rgb(24,104,206)",
		"rgb(23,107,209)",
		"rgb(21,109,211)",
		"rgb(20,112,214)",
		"rgb(19,115,217)",
		"rgb(17,117,219)",
		"rgb(16,120,222)",
		"rgb(15,123,225)",
		"rgb(13,125,227)",
		"rgb(12,128,230)",
		"rgb(11,131,233)",
		"rgb(9,133,235)",
		"rgb(8,136,238)",
		"rgb(7,139,241)",
		"rgb(5,141,243)",
		"rgb(4,144,246)",
		"rgb(3,147,249)",
		"rgb(1,149,251)",
		"rgb(0,152,254)",
		"rgb(0,154,250)",
		"rgb(0,156,244)",
		"rgb(0,158,238)",
		"rgb(0,160,232)",
		"rgb(0,162,226)",
		"rgb(0,164,220)",
		"rgb(0,166,214)",
		"rgb(0,168,208)",
		"rgb(0,170,202)",
		"rgb(0,172,196)",
		"rgb(0,174,190)",
		"rgb(0,176,184)",
		"rgb(0,178,178)",
		"rgb(0,180,172)",
		"rgb(0,182,166)",
		"rgb(0,184,160)",
		"rgb(0,186,154)",
		"rgb(0,188,148)",
		"rgb(0,190,142)",
		"rgb(0,192,136)",
		"rgb(0,194,130)",
		"rgb(0,196,124)",
		"rgb(0,198,118)",
		"rgb(0,200,112)",
		"rgb(0,202,106)",
		"rgb(1,204,102)",
		"rgb(5,205,103)",
		"rgb(9,205,103)",
		"rgb(13,206,104)",
		"rgb(17,207,105)",
		"rgb(21,208,106)",
		"rgb(25,209,107)",
		"rgb(29,209,107)",
		"rgb(33,210,108)",
		"rgb(37,211,109)",
		"rgb(41,212,110)",
		"rgb(45,213,111)",
		"rgb(49,213,111)",
		"rgb(53,214,112)",
		"rgb(57,215,113)",
		"rgb(61,216,114)",
		"rgb(65,217,115)",
		"rgb(69,217,115)",
		"rgb(73,218,116)",
		"rgb(77,219,117)",
		"rgb(81,220,118)",
		"rgb(85,221,119)",
		"rgb(89,221,119)",
		"rgb(93,222,120)",
		"rgb(97,223,121)",
		"rgb(101,224,122)",
		"rgb(105,225,123)",
		"rgb(109,225,123)",
		"rgb(113,226,124)",
		"rgb(117,227,125)",
		"rgb(121,228,126)",
		"rgb(125,229,127)",
		"rgb(129,229,127)",
		"rgb(133,230,128)",
		"rgb(137,231,129)",
		"rgb(141,232,130)",
		"rgb(145,233,131)",
		"rgb(149,233,131)",
		"rgb(153,234,132)",
		"rgb(157,235,133)",
		"rgb(161,236,134)",
		"rgb(165,237,135)",
		"rgb(169,237,135)",
		"rgb(173,238,136)",
		"rgb(177,239,137)",
		"rgb(181,240,138)",
		"rgb(185,241,139)",
		"rgb(189,241,139)",
		"rgb(193,242,140)",
		"rgb(197,243,141)",
		"rgb(201,244,142)",
		"rgb(205,245,143)",
		"rgb(209,245,143)",
		"rgb(213,246,144)",
		"rgb(217,247,145)",
		"rgb(221,248,146)",
		"rgb(225,249,147)",
		"rgb(229,249,147)",
		"rgb(233,250,148)",
		"rgb(237,251,149)",
		"rgb(241,252,150)",
		"rgb(245,253,151)",
		"rgb(249,253,151)",
		"rgb(253,254,152)",
		"rgb(254,253,152)",
		"rgb(252,251,151)",
		"rgb(250,248,150)",
		"rgb(248,246,149)",
		"rgb(246,243,148)",
		"rgb(244,240,147)",
		"rgb(242,238,145)",
		"rgb(240,235,144)",
		"rgb(238,233,143)",
		"rgb(236,230,142)",
		"rgb(234,228,141)",
		"rgb(232,225,140)",
		"rgb(230,223,139)",
		"rgb(228,220,138)",
		"rgb(226,217,137)",
		"rgb(224,215,136)",
		"rgb(222,212,135)",
		"rgb(220,210,134)",
		"rgb(218,207,133)",
		"rgb(216,205,131)",
		"rgb(214,202,130)",
		"rgb(212,199,129)",
		"rgb(210,197,128)",
		"rgb(208,194,127)",
		"rgb(206,192,126)",
		"rgb(204,189,125)",
		"rgb(202,187,124)",
		"rgb(200,184,123)",
		"rgb(198,182,122)",
		"rgb(196,179,121)",
		"rgb(194,176,120)",
		"rgb(192,174,118)",
		"rgb(190,171,117)",
		"rgb(188,169,116)",
		"rgb(186,166,115)",
		"rgb(184,164,114)",
		"rgb(182,161,113)",
		"rgb(180,159,112)",
		"rgb(178,156,111)",
		"rgb(176,153,110)",
		"rgb(174,151,109)",
		"rgb(172,148,108)",
		"rgb(170,146,107)",
		"rgb(168,143,106)",
		"rgb(166,141,104)",
		"rgb(164,138,103)",
		"rgb(162,135,102)",
		"rgb(160,133,101)",
		"rgb(158,130,100)",
		"rgb(156,128,99)",
		"rgb(154,125,98)",
		"rgb(152,123,97)",
		"rgb(150,120,96)",
		"rgb(148,118,95)",
		"rgb(146,115,94)",
		"rgb(144,112,93)",
		"rgb(142,110,91)",
		"rgb(140,107,90)",
		"rgb(138,105,89)",
		"rgb(136,102,88)",
		"rgb(134,100,87)",
		"rgb(132,97,86)",
		"rgb(130,95,85)",
		"rgb(128,92,84)",
		"rgb(129,93,86)",
		"rgb(131,96,88)",
		"rgb(133,98,91)",
		"rgb(135,101,94)",
		"rgb(137,103,96)",
		"rgb(139,106,99)",
		"rgb(141,109,102)",
		"rgb(143,111,104)",
		"rgb(145,114,107)",
		"rgb(147,116,110)",
		"rgb(149,119,112)",
		"rgb(151,121,115)",
		"rgb(153,124,118)",
		"rgb(155,127,121)",
		"rgb(157,129,123)",
		"rgb(159,132,126)",
		"rgb(161,134,129)",
		"rgb(163,137,131)",
		"rgb(165,139,134)",
		"rgb(167,142,137)",
		"rgb(169,144,139)",
		"rgb(171,147,142)",
		"rgb(173,150,145)",
		"rgb(175,152,147)",
		"rgb(177,155,150)",
		"rgb(179,157,153)",
		"rgb(181,160,155)",
		"rgb(183,162,158)",
		"rgb(185,165,161)",
		"rgb(187,167,163)",
		"rgb(189,170,166)",
		"rgb(191,173,169)",
		"rgb(193,175,171)",
		"rgb(195,178,174)",
		"rgb(197,180,177)",
		"rgb(199,183,179)",
		"rgb(201,185,182)",
		"rgb(203,188,185)",
		"rgb(205,191,188)",
		"rgb(207,193,190)",
		"rgb(209,196,193)",
		"rgb(211,198,196)",
		"rgb(213,201,198)",
		"rgb(215,203,201)",
		"rgb(217,206,204)",
		"rgb(219,208,206)",
		"rgb(221,211,209)",
		"rgb(223,214,212)",
		"rgb(225,216,214)",
		"rgb(227,219,217)",
		"rgb(229,221,220)",
		"rgb(231,224,222)",
		"rgb(233,226,225)",
		"rgb(235,229,228)",
		"rgb(237,231,230)",
		"rgb(239,234,233)",
		"rgb(241,237,236)",
		"rgb(243,239,238)",
		"rgb(245,242,241)",
		"rgb(247,244,244)",
		"rgb(249,247,246)",
		"rgb(251,249,249)",
		"rgb(253,252,252)",
		"rgb(255,255,255)"
	],
	"cool": [
		"rgb(0,255,255)",
		"rgb(1,254,255)",
		"rgb(2,253,255)",
		"rgb(3,252,255)",
		"rgb(4,251,255)",
		"rgb(5,250,255)",
		"rgb(6,249,255)",
		"rgb(7,248,255)",
		"rgb(8,247,255)",
		"rgb(9,246,255)",
		"rgb(10,245,255)",
		"rgb(11,244,255)",
		"rgb(12,243,255)",
		"rgb(13,242,255)",
		"rgb(14,241,255)",
		"rgb(15,240,255)",
		"rgb(16,239,255)",
		"rgb(17,238,255)",
		"rgb(18,237,255)",
		"rgb(19,236,255)",
		"rgb(20,235,255)",
		"rgb(21,234,255)",
		"rgb(22,233,255)",
		"rgb(23,232,255)",
		"rgb(24,231,255)",
		"rgb(25,230,255)",
		"rgb(26,229,255)",
		"rgb(27,228,255)",
		"rgb(28,227,255)",
		"rgb(29,226,255)",
		"rgb(30,225,255)",
		"rgb(31,224,255)",
		"rgb(32,223,255)",
		"rgb(33,222,255)",
		"rgb(34,221,255)",
		"rgb(35,220,255)",
		"rgb(36,219,255)",
		"rgb(37,218,255)",
		"rgb(38,217,255)",
		"rgb(39,216,255)",
		"rgb(40,215,255)",
		"rgb(41,214,255)",
		"rgb(42,213,255)",
		"rgb(43,212,255)",
		"rgb(44,211,255)",
		"rgb(45,210,255)",
		"rgb(46,209,255)",
		"rgb(47,208,255)",
		"rgb(48,207,255)",
		"rgb(49,206,255)",
		"rgb(50,205,255)",
		"rgb(51,204,255)",
		"rgb(52,203,255)",
		"rgb(53,202,255)",
		"rgb(54,201,255)",
		"rgb(55,200,255)",
		"rgb(56,199,255)",
		"rgb(57,198,255)",
		"rgb(58,197,255)",
		"rgb(59,196,255)",
		"rgb(60,195,255)",
		"rgb(61,194,255)",
		"rgb(62,193,255)",
		"rgb(63,192,255)",
		"rgb(64,191,255)",
		"rgb(65,190,255)",
		"rgb(66,189,255)",
		"rgb(67,188,255)",
		"rgb(68,187,255)",
		"rgb(69,186,255)",
		"rgb(70,185,255)",
		"rgb(71,184,255)",
		"rgb(72,183,255)",
		"rgb(73,182,255)",
		"rgb(74,181,255)",
		"rgb(75,180,255)",
		"rgb(76,179,255)",
		"rgb(77,178,255)",
		"rgb(78,177,255)",
		"rgb(79,176,255)",
		"rgb(80,175,255)",
		"rgb(81,174,255)",
		"rgb(82,173,255)",
		"rgb(83,172,255)",
		"rgb(84,171,255)",
		"rgb(85,170,255)",
		"rgb(86,169,255)",
		"rgb(87,168,255)",
		"rgb(88,167,255)",
		"rgb(89,166,255)",
		"rgb(90,165,255)",
		"rgb(91,164,255)",
		"rgb(92,163,255)",
		"rgb(93,162,255)",
		"rgb(94,161,255)",
		"rgb(95,160,255)",
		"rgb(96,159,255)",
		"rgb(97,158,255)",
		"rgb(98,157,255)",
		"rgb(99,156,255)",
		"rgb(100,155,255)",
		"rgb(101,154,255)",
		"rgb(102,153,255)",
		"rgb(103,152,255)",
		"rgb(104,151,255)",
		"rgb(105,150,255)",
		"rgb(106,149,255)",
		"rgb(107,148,255)",
		"rgb(108,147,255)",
		"rgb(109,146,255)",
		"rgb(110,145,255)",
		"rgb(111,144,255)",
		"rgb(112,143,255)",
		"rgb(113,142,255)",
		"rgb(114,141,255)",
		"rgb(115,140,255)",
		"rgb(116,139,255)",
		"rgb(117,138,255)",
		"rgb(118,137,255)",
		"rgb(119,136,255)",
		"rgb(120,135,255)",
		"rgb(121,134,255)",
		"rgb(122,133,255)",
		"rgb(123,132,255)",
		"rgb(124,131,255)",
		"rgb(125,130,255)",
		"rgb(126,129,255)",
		"rgb(127,128,255)",
		"rgb(128,127,255)",
		"rgb(129,126,255)",
		"rgb(130,125,255)",
		"rgb(131,124,255)",
		"rgb(132,123,255)",
		"rgb(133,122,255)",
		"rgb(134,121,255)",
		"rgb(135,120,255)",
		"rgb(136,119,255)",
		"rgb(137,118,255)",
		"rgb(138,117,255)",
		"rgb(139,116,255)",
		"rgb(140,115,255)",
		"rgb(141,114,255)",
		"rgb(142,113,255)",
		"rgb(143,112,255)",
		"rgb(144,111,255)",
		"rgb(145,110,255)",
		"rgb(146,109,255)",
		"rgb(147,108,255)",
		"rgb(148,107,255)",
		"rgb(149,106,255)",
		"rgb(150,105,255)",
		"rgb(151,104,255)",
		"rgb(152,103,255)",
		"rgb(153,102,255)",
		"rgb(154,101,255)",
		"rgb(155,100,255)",
		"rgb(156,99,255)",
		"rgb(157,98,255)",
		"rgb(158,97,255)",
		"rgb(159,96,255)",
		"rgb(160,95,255)",
		"rgb(161,94,255)",
		"rgb(162,93,255)",
		"rgb(163,92,255)",
		"rgb(164,91,255)",
		"rgb(165,90,255)",
		"rgb(166,89,255)",
		"rgb(167,88,255)",
		"rgb(168,87,255)",
		"rgb(169,86,255)",
		"rgb(170,85,255)",
		"rgb(171,84,255)",
		"rgb(172,83,255)",
		"rgb(173,82,255)",
		"rgb(174,81,255)",
		"rgb(175,80,255)",
		"rgb(176,79,255)",
		"rgb(177,78,255)",
		"rgb(178,77,255)",
		"rgb(179,76,255)",
		"rgb(180,75,255)",
		"rgb(181,74,255)",
		"rgb(182,73,255)",
		"rgb(183,72,255)",
		"rgb(184,71,255)",
		"rgb(185,70,255)",
		"rgb(186,69,255)",
		"rgb(187,68,255)",
		"rgb(188,67,255)",
		"rgb(189,66,255)",
		"rgb(190,65,255)",
		"rgb(191,64,255)",
		"rgb(192,63,255)",
		"rgb(193,62,255)",
		"rgb(194,61,255)",
		"rgb(195,60,255)",
		"rgb(196,59,255)",
		"rgb(197,58,255)",
		"rgb(198,57,255)",
		"rgb(199,56,255)",
		"rgb(200,55,255)",
		"rgb(201,54,255)",
		"rgb(202,53,255)",
		"rgb(203,52,255)",
		"rgb(204,51,255)",
		"rgb(205,50,255)",
		"rgb(206,49,255)",
		"rgb(207,48,255)",
		"rgb(208,47,255)",
		"rgb(209,46,255)",
		"rgb(210,45,255)",
		"rgb(211,44,255)",
		"rgb(212,43,255)",
		"rgb(213,42,255)",
		"rgb(214,41,255)",
		"rgb(215,40,255)",
		"rgb(216,39,255)",
		"rgb(217,38,255)",
		"rgb(218,37,255)",
		"rgb(219,36,255)",
		"rgb(220,35,255)",
		"rgb(221,34,255)",
		"rgb(222,33,255)",
		"rgb(223,32,255)",
		"rgb(224,31,255)",
		"rgb(225,30,255)",
		"rgb(226,29,255)",
		"rgb(227,28,255)",
		"rgb(228,27,255)",
		"rgb(229,26,255)",
		"rgb(230,25,255)",
		"rgb(231,24,255)",
		"rgb(232,23,255)",
		"rgb(233,22,255)",
		"rgb(234,21,255)",
		"rgb(235,20,255)",
		"rgb(236,19,255)",
		"rgb(237,18,255)",
		"rgb(238,17,255)",
		"rgb(239,16,255)",
		"rgb(240,15,255)",
		"rgb(241,14,255)",
		"rgb(242,13,255)",
		"rgb(243,12,255)",
		"rgb(244,11,255)",
		"rgb(245,10,255)",
		"rgb(246,9,255)",
		"rgb(247,8,255)",
		"rgb(248,7,255)",
		"rgb(249,6,255)",
		"rgb(250,5,255)",
		"rgb(251,4,255)",
		"rgb(252,3,255)",
		"rgb(253,2,255)",
		"rgb(254,1,255)",
		"rgb(255,0,255)"
	],
	"hot": [
		"rgb(10,0,0)",
		"rgb(13,0,0)",
		"rgb(15,0,0)",
		"rgb(18,0,0)",
		"rgb(21,0,0)",
		"rgb(23,0,0)",
		"rgb(26,0,0)",
		"rgb(28,0,0)",
		"rgb(31,0,0)",
		"rgb(34,0,0)",
		"rgb(36,0,0)",
		"rgb(39,0,0)",
		"rgb(42,0,0)",
		"rgb(44,0,0)",
		"rgb(47,0,0)",
		"rgb(49,0,0)",
		"rgb(52,0,0)",
		"rgb(55,0,0)",
		"rgb(57,0,0)",
		"rgb(60,0,0)",
		"rgb(63,0,0)",
		"rgb(65,0,0)",
		"rgb(68,0,0)",
		"rgb(70,0,0)",
		"rgb(73,0,0)",
		"rgb(76,0,0)",
		"rgb(78,0,0)",
		"rgb(81,0,0)",
		"rgb(84,0,0)",
		"rgb(86,0,0)",
		"rgb(89,0,0)",
		"rgb(91,0,0)",
		"rgb(94,0,0)",
		"rgb(97,0,0)",
		"rgb(99,0,0)",
		"rgb(102,0,0)",
		"rgb(105,0,0)",
		"rgb(107,0,0)",
		"rgb(110,0,0)",
		"rgb(112,0,0)",
		"rgb(115,0,0)",
		"rgb(118,0,0)",
		"rgb(120,0,0)",
		"rgb(123,0,0)",
		"rgb(126,0,0)",
		"rgb(128,0,0)",
		"rgb(131,0,0)",
		"rgb(133,0,0)",
		"rgb(136,0,0)",
		"rgb(139,0,0)",
		"rgb(141,0,0)",
		"rgb(144,0,0)",
		"rgb(147,0,0)",
		"rgb(149,0,0)",
		"rgb(152,0,0)",
		"rgb(154,0,0)",
		"rgb(157,0,0)",
		"rgb(160,0,0)",
		"rgb(162,0,0)",
		"rgb(165,0,0)",
		"rgb(168,0,0)",
		"rgb(170,0,0)",
		"rgb(173,0,0)",
		"rgb(175,0,0)",
		"rgb(178,0,0)",
		"rgb(181,0,0)",
		"rgb(183,0,0)",
		"rgb(186,0,0)",
		"rgb(189,0,0)",
		"rgb(191,0,0)",
		"rgb(194,0,0)",
		"rgb(196,0,0)",
		"rgb(199,0,0)",
		"rgb(202,0,0)",
		"rgb(204,0,0)",
		"rgb(207,0,0)",
		"rgb(210,0,0)",
		"rgb(212,0,0)",
		"rgb(215,0,0)",
		"rgb(217,0,0)",
		"rgb(220,0,0)",
		"rgb(223,0,0)",
		"rgb(225,0,0)",
		"rgb(228,0,0)",
		"rgb(231,0,0)",
		"rgb(233,0,0)",
		"rgb(236,0,0)",
		"rgb(238,0,0)",
		"rgb(241,0,0)",
		"rgb(244,0,0)",
		"rgb(246,0,0)",
		"rgb(249,0,0)",
		"rgb(252,0,0)",
		"rgb(254,0,0)",
		"rgb(255,2,0)",
		"rgb(255,5,0)",
		"rgb(255,7,0)",
		"rgb(255,10,0)",
		"rgb(255,12,0)",
		"rgb(255,15,0)",
		"rgb(255,18,0)",
		"rgb(255,20,0)",
		"rgb(255,23,0)",
		"rgb(255,26,0)",
		"rgb(255,28,0)",
		"rgb(255,31,0)",
		"rgb(255,33,0)",
		"rgb(255,36,0)",
		"rgb(255,39,0)",
		"rgb(255,41,0)",
		"rgb(255,44,0)",
		"rgb(255,47,0)",
		"rgb(255,49,0)",
		"rgb(255,52,0)",
		"rgb(255,54,0)",
		"rgb(255,57,0)",
		"rgb(255,60,0)",
		"rgb(255,62,0)",
		"rgb(255,65,0)",
		"rgb(255,68,0)",
		"rgb(255,70,0)",
		"rgb(255,73,0)",
		"rgb(255,75,0)",
		"rgb(255,78,0)",
		"rgb(255,81,0)",
		"rgb(255,83,0)",
		"rgb(255,86,0)",
		"rgb(255,89,0)",
		"rgb(255,91,0)",
		"rgb(255,94,0)",
		"rgb(255,96,0)",
		"rgb(255,99,0)",
		"rgb(255,102,0)",
		"rgb(255,104,0)",
		"rgb(255,107,0)",
		"rgb(255,110,0)",
		"rgb(255,112,0)",
		"rgb(255,115,0)",
		"rgb(255,117,0)",
		"rgb(255,120,0)",
		"rgb(255,123,0)",
		"rgb(255,125,0)",
		"rgb(255,128,0)",
		"rgb(255,131,0)",
		"rgb(255,133,0)",
		"rgb(255,136,0)",
		"rgb(255,138,0)",
		"rgb(255,141,0)",
		"rgb(255,144,0)",
		"rgb(255,146,0)",
		"rgb(255,149,0)",
		"rgb(255,151,0)",
		"rgb(255,154,0)",
		"rgb(255,157,0)",
		"rgb(255,159,0)",
		"rgb(255,162,0)",
		"rgb(255,165,0)",
		"rgb(255,167,0)",
		"rgb(255,170,0)",
		"rgb(255,172,0)",
		"rgb(255,175,0)",
		"rgb(255,178,0)",
		"rgb(255,180,0)",
		"rgb(255,183,0)",
		"rgb(255,186,0)",
		"rgb(255,188,0)",
		"rgb(255,191,0)",
		"rgb(255,193,0)",
		"rgb(255,196,0)",
		"rgb(255,199,0)",
		"rgb(255,201,0)",
		"rgb(255,204,0)",
		"rgb(255,207,0)",
		"rgb(255,209,0)",
		"rgb(255,212,0)",
		"rgb(255,214,0)",
		"rgb(255,217,0)",
		"rgb(255,220,0)",
		"rgb(255,222,0)",
		"rgb(255,225,0)",
		"rgb(255,228,0)",
		"rgb(255,230,0)",
		"rgb(255,233,0)",
		"rgb(255,235,0)",
		"rgb(255,238,0)",
		"rgb(255,241,0)",
		"rgb(255,243,0)",
		"rgb(255,246,0)",
		"rgb(255,249,0)",
		"rgb(255,251,0)",
		"rgb(255,254,0)",
		"rgb(255,255,2)",
		"rgb(255,255,6)",
		"rgb(255,255,10)",
		"rgb(255,255,14)",
		"rgb(255,255,18)",
		"rgb(255,255,22)",
		"rgb(255,255,26)",
		"rgb(255,255,30)",
		"rgb(255,255,34)",
		"rgb(255,255,38)",
		"rgb(255,255,42)",
		"rgb(255,255,46)",
		"rgb(255,255,50)",
		"rgb(255,255,54)",
		"rgb(255,255,58)",
		"rgb(255,255,62)",
		"rgb(255,255,65)",
		"rgb(255,255,69)",
		"rgb(255,255,73)",
		"rgb(255,255,77)",
		"rgb(255,255,81)",
		"rgb(255,255,85)",
		"rgb(255,255,89)",
		"rgb(255,255,93)",
		"rgb(255,255,97)",
		"rgb(255,255,101)",
		"rgb(255,255,105)",
		"rgb(255,255,109)",
		"rgb(255,255,113)",
		"rgb(255,255,117)",
		"rgb(255,255,121)",
		"rgb(255,255,125)",
		"rgb(255,255,128)",
		"rgb(255,255,132)",
		"rgb(255,255,136)",
		"rgb(255,255,140)",
		"rgb(255,255,144)",
		"rgb(255,255,148)",
		"rgb(255,255,152)",
		"rgb(255,255,156)",
		"rgb(255,255,160)",
		"rgb(255,255,164)",
		"rgb(255,255,168)",
		"rgb(255,255,172)",
		"rgb(255,255,176)",
		"rgb(255,255,180)",
		"rgb(255,255,184)",
		"rgb(255,255,188)",
		"rgb(255,255,191)",
		"rgb(255,255,195)",
		"rgb(255,255,199)",
		"rgb(255,255,203)",
		"rgb(255,255,207)",
		"rgb(255,255,211)",
		"rgb(255,255,215)",
		"rgb(255,255,219)",
		"rgb(255,255,223)",
		"rgb(255,255,227)",
		"rgb(255,255,231)",
		"rgb(255,255,235)",
		"rgb(255,255,239)",
		"rgb(255,255,243)",
		"rgb(255,255,247)",
		"rgb(255,255,251)",
		"rgb(255,255,255)"
	],
	"jetseg": [
		"rgb(0,0,128)",
		"rgb(0,18,255)",
		"rgb(0,164,255)",
		"rgb(65,255,182)",
		"rgb(182,255,65)",
		"rgb(255,185,0)",
		"rgb(255,50,0)",
		"rgb(128,0,0)"
	],
	"coolseg": [
		"rgb(0,255,255)",
		"rgb(36,219,255)",
		"rgb(73,182,255)",
		"rgb(109,146,255)",
		"rgb(146,109,255)",
		"rgb(182,73,255)",
		"rgb(219,36,255)",
		"rgb(255,0,255)"
	],
	"hotseg": [
		"rgb(11,0,0)",
		"rgb(106,0,0)",
		"rgb(202,0,0)",
		"rgb(255,43,0)",
		"rgb(255,138,0)",
		"rgb(255,234,0)",
		"rgb(255,255,112)",
		"rgb(255,255,255)"
	],
	"terrainseg": [
		"rgb(51,51,153)",
		"rgb(2,148,250)",
		"rgb(36,211,109)",
		"rgb(182,240,138)",
		"rgb(219,208,133)",
		"rgb(146,115,94)",
		"rgb(182,162,157)",
		"rgb(255,255,255)"
	],
	"greyseg": [
		"rgb(255,255,255)",
		"rgb(237,237,237)",
		"rgb(209,209,209)",
		"rgb(172,172,172)",
		"rgb(130,130,130)",
		"rgb(91,91,91)",
		"rgb(43,43,43)",
		"rgb(0,0,0)"
	]
};

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var assign = __webpack_require__(4)

module.exports = function createSDFShader (opt) {
  opt = opt || {}
  var opacity = typeof opt.opacity === 'number' ? opt.opacity : 1
  var alphaTest = typeof opt.alphaTest === 'number' ? opt.alphaTest : 0.0001
  var precision = opt.precision || 'highp'
  var color = opt.color
  var map = opt.map

  // remove to satisfy r73
  delete opt.map
  delete opt.color
  delete opt.precision
  delete opt.opacity

  return assign({
    uniforms: {
      opacity: { type: 'f', value: opacity },
      map: { type: 't', value: map || new THREE.Texture() },
      color: { type: 'c', value: new THREE.Color(color) }
    },
    vertexShader: [
      'attribute vec2 uv;',
      'attribute vec4 position;',
      'uniform mat4 projectionMatrix;',
      'uniform mat4 modelViewMatrix;',
      'varying vec2 vUv;',
      'void main() {',
      'vUv = uv;',
      'gl_Position = projectionMatrix * modelViewMatrix * position;',
      '}'
    ].join('\n'),
    fragmentShader: [
      '#ifdef GL_OES_standard_derivatives',
      '#extension GL_OES_standard_derivatives : enable',
      '#endif',
      'precision ' + precision + ' float;',
      'uniform float opacity;',
      'uniform vec3 color;',
      'uniform sampler2D map;',
      'varying vec2 vUv;',

      'float aastep(float value) {',
      '  #ifdef GL_OES_standard_derivatives',
      '    float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;',
      '  #else',
      '    float afwidth = (1.0 / 32.0) * (1.4142135623730951 / (2.0 * gl_FragCoord.w));',
      '  #endif',
      '  return smoothstep(0.5 - afwidth, 0.5 + afwidth, value);',
      '}',

      'void main() {',
      '  vec4 texColor = texture2D(map, vUv);',
      '  float alpha = aastep(texColor.a);',
      '  gl_FragColor = vec4(color, opacity * alpha);',
      alphaTest === 0
        ? ''
        : '  if (gl_FragColor.a < ' + alphaTest + ') discard;',
      '}'
    ].join('\n')
  }, opt)
}


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {var xhr = __webpack_require__(35)
var noop = function(){}
var parseASCII = __webpack_require__(24)
var parseXML = __webpack_require__(26)
var readBinary = __webpack_require__(25)
var isBinaryFormat = __webpack_require__(23)
var xtend = __webpack_require__(1)

var xml2 = (function hasXML2() {
  return self.XMLHttpRequest && "withCredentials" in new XMLHttpRequest
})()

module.exports = function(opt, cb) {
  cb = typeof cb === 'function' ? cb : noop

  if (typeof opt === 'string')
    opt = { uri: opt }
  else if (!opt)
    opt = {}

  var expectBinary = opt.binary
  if (expectBinary)
    opt = getBinaryOpts(opt)

  xhr(opt, function(err, res, body) {
    if (err)
      return cb(err)
    if (!/^2/.test(res.statusCode))
      return cb(new Error('http status code: '+res.statusCode))
    if (!body)
      return cb(new Error('no body result'))

    var binary = false 

    //if the response type is an array buffer,
    //we need to convert it into a regular Buffer object
    if (isArrayBuffer(body)) {
      var array = new Uint8Array(body)
      body = new Buffer(array, 'binary')
    }

    //now check the string/Buffer response
    //and see if it has a binary BMF header
    if (isBinaryFormat(body)) {
      binary = true
      //if we have a string, turn it into a Buffer
      if (typeof body === 'string') 
        body = new Buffer(body, 'binary')
    } 

    //we are not parsing a binary format, just ASCII/XML/etc
    if (!binary) {
      //might still be a buffer if responseType is 'arraybuffer'
      if (Buffer.isBuffer(body))
        body = body.toString(opt.encoding)
      body = body.trim()
    }

    var result
    try {
      var type = res.headers['content-type']
      if (binary)
        result = readBinary(body)
      else if (/json/.test(type) || body.charAt(0) === '{')
        result = JSON.parse(body)
      else if (/xml/.test(type)  || body.charAt(0) === '<')
        result = parseXML(body)
      else
        result = parseASCII(body)
    } catch (e) {
      cb(new Error('error parsing font '+e.message))
      cb = noop
    }
    cb(null, result)
  })
}

function isArrayBuffer(arr) {
  var str = Object.prototype.toString
  return str.call(arr) === '[object ArrayBuffer]'
}

function getBinaryOpts(opt) {
  //IE10+ and other modern browsers support array buffers
  if (xml2)
    return xtend(opt, { responseType: 'arraybuffer' })
  
  if (typeof self.XMLHttpRequest === 'undefined')
    throw new Error('your browser does not support XHR loading')

  //IE9 and XML1 browsers could still use an override
  var req = new self.XMLHttpRequest()
  req.overrideMimeType('text/plain; charset=x-user-defined')
  return xtend({
    xhr: req
  }, opt)
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0).Buffer))

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var createLayout = __webpack_require__(22)
var inherits = __webpack_require__(19)
var createIndices = __webpack_require__(29)
var buffer = __webpack_require__(32)
var assign = __webpack_require__(4)

var vertices = __webpack_require__(31)
var utils = __webpack_require__(30)

var Base = THREE.BufferGeometry

module.exports = function createTextGeometry (opt) {
  return new TextGeometry(opt)
}

function TextGeometry (opt) {
  Base.call(this)

  if (typeof opt === 'string') {
    opt = { text: opt }
  }

  // use these as default values for any subsequent
  // calls to update()
  this._opt = assign({}, opt)

  // also do an initial setup...
  if (opt) this.update(opt)
}

inherits(TextGeometry, Base)

TextGeometry.prototype.update = function (opt) {
  if (typeof opt === 'string') {
    opt = { text: opt }
  }

  // use constructor defaults
  opt = assign({}, this._opt, opt)

  if (!opt.font) {
    throw new TypeError('must specify a { font } in options')
  }

  this.layout = createLayout(opt)

  // get vec2 texcoords
  var flipY = opt.flipY !== false

  // the desired BMFont data
  var font = opt.font

  // determine texture size from font file
  var texWidth = font.common.scaleW
  var texHeight = font.common.scaleH

  // get visible glyphs
  var glyphs = this.layout.glyphs.filter(function (glyph) {
    var bitmap = glyph.data
    return bitmap.width * bitmap.height > 0
  })

  // provide visible glyphs for convenience
  this.visibleGlyphs = glyphs

  // get common vertex data
  var positions = vertices.positions(glyphs)
  var uvs = vertices.uvs(glyphs, texWidth, texHeight, flipY)
  var indices = createIndices({
    clockwise: true,
    type: 'uint16',
    count: glyphs.length
  })

  // update vertex data
  buffer.index(this, indices, 1, 'uint16')
  buffer.attr(this, 'position', positions, 2)
  buffer.attr(this, 'uv', uvs, 2)

  // update multipage data
  if (!opt.multipage && 'page' in this.attributes) {
    // disable multipage rendering
    this.removeAttribute('page')
  } else if (opt.multipage) {
    var pages = vertices.pages(glyphs)
    // enable multipage rendering
    buffer.attr(this, 'page', pages, 1)
  }
}

TextGeometry.prototype.computeBoundingSphere = function () {
  if (this.boundingSphere === null) {
    this.boundingSphere = new THREE.Sphere()
  }

  var positions = this.attributes.position.array
  var itemSize = this.attributes.position.itemSize
  if (!positions || !itemSize || positions.length < 2) {
    this.boundingSphere.radius = 0
    this.boundingSphere.center.set(0, 0, 0)
    return
  }
  utils.computeSphere(positions, this.boundingSphere)
  if (isNaN(this.boundingSphere.radius)) {
    console.error('THREE.BufferGeometry.computeBoundingSphere(): ' +
      'Computed radius is NaN. The ' +
      '"position" attribute is likely to have NaN values.')
  }
}

TextGeometry.prototype.computeBoundingBox = function () {
  if (this.boundingBox === null) {
    this.boundingBox = new THREE.Box3()
  }

  var bbox = this.boundingBox
  var positions = this.attributes.position.array
  var itemSize = this.attributes.position.itemSize
  if (!positions || !itemSize || positions.length < 2) {
    bbox.makeEmpty()
    return
  }
  utils.computeBox(positions, bbox)
}


/***/ }),
/* 10 */
/***/ (function(module, exports) {

var str = Object.prototype.toString

module.exports = anArray

function anArray(arr) {
  return (
       arr.BYTES_PER_ELEMENT
    && str.call(arr.buffer) === '[object ArrayBuffer]'
    || Array.isArray(arr)
  )
}


/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = function numtype(num, def) {
	return typeof num === 'number'
		? num 
		: (typeof def === 'number' ? def : 0)
}

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return b64.length * 3 / 4 - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

var Buffer = __webpack_require__(0).Buffer; // for use with browserify

module.exports = function (a, b) {
    if (!Buffer.isBuffer(a)) return undefined;
    if (!Buffer.isBuffer(b)) return undefined;
    if (typeof a.equals === 'function') return a.equals(b);
    if (a.length !== b.length) return false;
    
    for (var i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    
    return true;
};


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

/*eslint new-cap:0*/
var dtype = __webpack_require__(2)
module.exports = flattenVertexData
function flattenVertexData (data, output, offset) {
  if (!data) throw new TypeError('must specify data as first parameter')
  offset = +(offset || 0) | 0

  if (Array.isArray(data) && Array.isArray(data[0])) {
    var dim = data[0].length
    var length = data.length * dim

    // no output specified, create a new typed array
    if (!output || typeof output === 'string') {
      output = new (dtype(output || 'float32'))(length + offset)
    }

    var dstLength = output.length - offset
    if (length !== dstLength) {
      throw new Error('source length ' + length + ' (' + dim + 'x' + data.length + ')' +
        ' does not match destination length ' + dstLength)
    }

    for (var i = 0, k = offset; i < data.length; i++) {
      for (var j = 0; j < dim; j++) {
        output[k++] = data[i][j]
      }
    }
  } else {
    if (!output || typeof output === 'string') {
      // no output, create a new one
      var Ctor = dtype(output || 'float32')
      if (offset === 0) {
        output = new Ctor(data)
      } else {
        output = new Ctor(data.length + offset)
        output.set(data, offset)
      }
    } else {
      // store output in existing array
      output.set(data, offset)
    }
  }

  return output
}


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

var isFunction = __webpack_require__(3)

module.exports = forEach

var toString = Object.prototype.toString
var hasOwnProperty = Object.prototype.hasOwnProperty

function forEach(list, iterator, context) {
    if (!isFunction(iterator)) {
        throw new TypeError('iterator must be a function')
    }

    if (arguments.length < 3) {
        context = this
    }
    
    if (toString.call(list) === '[object Array]')
        forEachArray(list, iterator, context)
    else if (typeof list === 'string')
        forEachString(list, iterator, context)
    else
        forEachObject(list, iterator, context)
}

function forEachArray(array, iterator, context) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            iterator.call(context, array[i], i, array)
        }
    }
}

function forEachString(string, iterator, context) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        iterator.call(context, string.charAt(i), i, string)
    }
}

function forEachObject(object, iterator, context) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            iterator.call(context, object[k], k, object)
        }
    }
}


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = {};
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 17 */
/***/ (function(module, exports) {

exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


/***/ }),
/* 18 */
/***/ (function(module, exports) {

module.exports = function compile(property) {
	if (!property || typeof property !== 'string')
		throw new Error('must specify property for indexof search')

	return new Function('array', 'value', 'start', [
		'start = start || 0',
		'for (var i=start; i<array.length; i++)',
		'  if (array[i]["' + property +'"] === value)',
		'      return i',
		'return -1'
	].join('\n'))
}

/***/ }),
/* 19 */
/***/ (function(module, exports) {

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}


/***/ }),
/* 20 */
/***/ (function(module, exports) {

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}


/***/ }),
/* 21 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

var wordWrap = __webpack_require__(34)
var xtend = __webpack_require__(1)
var findChar = __webpack_require__(18)('id')
var number = __webpack_require__(11)

var X_HEIGHTS = ['x', 'e', 'a', 'o', 'n', 's', 'r', 'c', 'u', 'm', 'v', 'w', 'z']
var M_WIDTHS = ['m', 'w']
var CAP_HEIGHTS = ['H', 'I', 'N', 'E', 'F', 'K', 'L', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']


var TAB_ID = '\t'.charCodeAt(0)
var SPACE_ID = ' '.charCodeAt(0)
var ALIGN_LEFT = 0, 
    ALIGN_CENTER = 1, 
    ALIGN_RIGHT = 2

module.exports = function createLayout(opt) {
  return new TextLayout(opt)
}

function TextLayout(opt) {
  this.glyphs = []
  this._measure = this.computeMetrics.bind(this)
  this.update(opt)
}

TextLayout.prototype.update = function(opt) {
  opt = xtend({
    measure: this._measure
  }, opt)
  this._opt = opt
  this._opt.tabSize = number(this._opt.tabSize, 4)

  if (!opt.font)
    throw new Error('must provide a valid bitmap font')

  var glyphs = this.glyphs
  var text = opt.text||'' 
  var font = opt.font
  this._setupSpaceGlyphs(font)
  
  var lines = wordWrap.lines(text, opt)
  var minWidth = opt.width || 0

  //clear glyphs
  glyphs.length = 0

  //get max line width
  var maxLineWidth = lines.reduce(function(prev, line) {
    return Math.max(prev, line.width, minWidth)
  }, 0)

  //the pen position
  var x = 0
  var y = 0
  var lineHeight = number(opt.lineHeight, font.common.lineHeight)
  var baseline = font.common.base
  var descender = lineHeight-baseline
  var letterSpacing = opt.letterSpacing || 0
  var height = lineHeight * lines.length - descender
  var align = getAlignType(this._opt.align)

  //draw text along baseline
  y -= height
  
  //the metrics for this text layout
  this._width = maxLineWidth
  this._height = height
  this._descender = lineHeight - baseline
  this._baseline = baseline
  this._xHeight = getXHeight(font)
  this._capHeight = getCapHeight(font)
  this._lineHeight = lineHeight
  this._ascender = lineHeight - descender - this._xHeight
    
  //layout each glyph
  var self = this
  lines.forEach(function(line, lineIndex) {
    var start = line.start
    var end = line.end
    var lineWidth = line.width
    var lastGlyph
    
    //for each glyph in that line...
    for (var i=start; i<end; i++) {
      var id = text.charCodeAt(i)
      var glyph = self.getGlyph(font, id)
      if (glyph) {
        if (lastGlyph) 
          x += getKerning(font, lastGlyph.id, glyph.id)

        var tx = x
        if (align === ALIGN_CENTER) 
          tx += (maxLineWidth-lineWidth)/2
        else if (align === ALIGN_RIGHT)
          tx += (maxLineWidth-lineWidth)

        glyphs.push({
          position: [tx, y],
          data: glyph,
          index: i,
          line: lineIndex
        })  

        //move pen forward
        x += glyph.xadvance + letterSpacing
        lastGlyph = glyph
      }
    }

    //next line down
    y += lineHeight
    x = 0
  })
  this._linesTotal = lines.length;
}

TextLayout.prototype._setupSpaceGlyphs = function(font) {
  //These are fallbacks, when the font doesn't include
  //' ' or '\t' glyphs
  this._fallbackSpaceGlyph = null
  this._fallbackTabGlyph = null

  if (!font.chars || font.chars.length === 0)
    return

  //try to get space glyph
  //then fall back to the 'm' or 'w' glyphs
  //then fall back to the first glyph available
  var space = getGlyphById(font, SPACE_ID) 
          || getMGlyph(font) 
          || font.chars[0]

  //and create a fallback for tab
  var tabWidth = this._opt.tabSize * space.xadvance
  this._fallbackSpaceGlyph = space
  this._fallbackTabGlyph = xtend(space, {
    x: 0, y: 0, xadvance: tabWidth, id: TAB_ID, 
    xoffset: 0, yoffset: 0, width: 0, height: 0
  })
}

TextLayout.prototype.getGlyph = function(font, id) {
  var glyph = getGlyphById(font, id)
  if (glyph)
    return glyph
  else if (id === TAB_ID) 
    return this._fallbackTabGlyph
  else if (id === SPACE_ID) 
    return this._fallbackSpaceGlyph
  return null
}

TextLayout.prototype.computeMetrics = function(text, start, end, width) {
  var letterSpacing = this._opt.letterSpacing || 0
  var font = this._opt.font
  var curPen = 0
  var curWidth = 0
  var count = 0
  var glyph
  var lastGlyph

  if (!font.chars || font.chars.length === 0) {
    return {
      start: start,
      end: start,
      width: 0
    }
  }

  end = Math.min(text.length, end)
  for (var i=start; i < end; i++) {
    var id = text.charCodeAt(i)
    var glyph = this.getGlyph(font, id)

    if (glyph) {
      //move pen forward
      var xoff = glyph.xoffset
      var kern = lastGlyph ? getKerning(font, lastGlyph.id, glyph.id) : 0
      curPen += kern

      var nextPen = curPen + glyph.xadvance + letterSpacing
      var nextWidth = curPen + glyph.width

      //we've hit our limit; we can't move onto the next glyph
      if (nextWidth >= width || nextPen >= width)
        break

      //otherwise continue along our line
      curPen = nextPen
      curWidth = nextWidth
      lastGlyph = glyph
    }
    count++
  }
  
  //make sure rightmost edge lines up with rendered glyphs
  if (lastGlyph)
    curWidth += lastGlyph.xoffset

  return {
    start: start,
    end: start + count,
    width: curWidth
  }
}

//getters for the private vars
;['width', 'height', 
  'descender', 'ascender',
  'xHeight', 'baseline',
  'capHeight',
  'lineHeight' ].forEach(addGetter)

function addGetter(name) {
  Object.defineProperty(TextLayout.prototype, name, {
    get: wrapper(name),
    configurable: true
  })
}

//create lookups for private vars
function wrapper(name) {
  return (new Function([
    'return function '+name+'() {',
    '  return this._'+name,
    '}'
  ].join('\n')))()
}

function getGlyphById(font, id) {
  if (!font.chars || font.chars.length === 0)
    return null

  var glyphIdx = findChar(font.chars, id)
  if (glyphIdx >= 0)
    return font.chars[glyphIdx]
  return null
}

function getXHeight(font) {
  for (var i=0; i<X_HEIGHTS.length; i++) {
    var id = X_HEIGHTS[i].charCodeAt(0)
    var idx = findChar(font.chars, id)
    if (idx >= 0) 
      return font.chars[idx].height
  }
  return 0
}

function getMGlyph(font) {
  for (var i=0; i<M_WIDTHS.length; i++) {
    var id = M_WIDTHS[i].charCodeAt(0)
    var idx = findChar(font.chars, id)
    if (idx >= 0) 
      return font.chars[idx]
  }
  return 0
}

function getCapHeight(font) {
  for (var i=0; i<CAP_HEIGHTS.length; i++) {
    var id = CAP_HEIGHTS[i].charCodeAt(0)
    var idx = findChar(font.chars, id)
    if (idx >= 0) 
      return font.chars[idx].height
  }
  return 0
}

function getKerning(font, left, right) {
  if (!font.kernings || font.kernings.length === 0)
    return 0

  var table = font.kernings
  for (var i=0; i<table.length; i++) {
    var kern = table[i]
    if (kern.first === left && kern.second === right)
      return kern.amount
  }
  return 0
}

function getAlignType(align) {
  if (align === 'center')
    return ALIGN_CENTER
  else if (align === 'right')
    return ALIGN_RIGHT
  return ALIGN_LEFT
}

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {var equal = __webpack_require__(13)
var HEADER = new Buffer([66, 77, 70, 3])

module.exports = function(buf) {
  if (typeof buf === 'string')
    return buf.substring(0, 3) === 'BMF'
  return buf.length > 4 && equal(buf.slice(0, 4), HEADER)
}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0).Buffer))

/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = function parseBMFontAscii(data) {
  if (!data)
    throw new Error('no data provided')
  data = data.toString().trim()

  var output = {
    pages: [],
    chars: [],
    kernings: []
  }

  var lines = data.split(/\r\n?|\n/g)

  if (lines.length === 0)
    throw new Error('no data in BMFont file')

  for (var i = 0; i < lines.length; i++) {
    var lineData = splitLine(lines[i], i)
    if (!lineData) //skip empty lines
      continue

    if (lineData.key === 'page') {
      if (typeof lineData.data.id !== 'number')
        throw new Error('malformed file at line ' + i + ' -- needs page id=N')
      if (typeof lineData.data.file !== 'string')
        throw new Error('malformed file at line ' + i + ' -- needs page file="path"')
      output.pages[lineData.data.id] = lineData.data.file
    } else if (lineData.key === 'chars' || lineData.key === 'kernings') {
      //... do nothing for these two ...
    } else if (lineData.key === 'char') {
      output.chars.push(lineData.data)
    } else if (lineData.key === 'kerning') {
      output.kernings.push(lineData.data)
    } else {
      output[lineData.key] = lineData.data
    }
  }

  return output
}

function splitLine(line, idx) {
  line = line.replace(/\t+/g, ' ').trim()
  if (!line)
    return null

  var space = line.indexOf(' ')
  if (space === -1) 
    throw new Error("no named row at line " + idx)

  var key = line.substring(0, space)

  line = line.substring(space + 1)
  //clear "letter" field as it is non-standard and
  //requires additional complexity to parse " / = symbols
  line = line.replace(/letter=[\'\"]\S+[\'\"]/gi, '')  
  line = line.split("=")
  line = line.map(function(str) {
    return str.trim().match((/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g))
  })

  var data = []
  for (var i = 0; i < line.length; i++) {
    var dt = line[i]
    if (i === 0) {
      data.push({
        key: dt[0],
        data: ""
      })
    } else if (i === line.length - 1) {
      data[data.length - 1].data = parseData(dt[0])
    } else {
      data[data.length - 1].data = parseData(dt[0])
      data.push({
        key: dt[1],
        data: ""
      })
    }
  }

  var out = {
    key: key,
    data: {}
  }

  data.forEach(function(v) {
    out.data[v.key] = v.data;
  })

  return out
}

function parseData(data) {
  if (!data || data.length === 0)
    return ""

  if (data.indexOf('"') === 0 || data.indexOf("'") === 0)
    return data.substring(1, data.length - 1)
  if (data.indexOf(',') !== -1)
    return parseIntList(data)
  return parseInt(data, 10)
}

function parseIntList(data) {
  return data.split(',').map(function(val) {
    return parseInt(val, 10)
  })
}

/***/ }),
/* 25 */
/***/ (function(module, exports) {

var HEADER = [66, 77, 70]

module.exports = function readBMFontBinary(buf) {
  if (buf.length < 6)
    throw new Error('invalid buffer length for BMFont')

  var header = HEADER.every(function(byte, i) {
    return buf.readUInt8(i) === byte
  })

  if (!header)
    throw new Error('BMFont missing BMF byte header')

  var i = 3
  var vers = buf.readUInt8(i++)
  if (vers > 3)
    throw new Error('Only supports BMFont Binary v3 (BMFont App v1.10)')
  
  var target = { kernings: [], chars: [] }
  for (var b=0; b<5; b++)
    i += readBlock(target, buf, i)
  return target
}

function readBlock(target, buf, i) {
  if (i > buf.length-1)
    return 0

  var blockID = buf.readUInt8(i++)
  var blockSize = buf.readInt32LE(i)
  i += 4

  switch(blockID) {
    case 1: 
      target.info = readInfo(buf, i)
      break
    case 2:
      target.common = readCommon(buf, i)
      break
    case 3:
      target.pages = readPages(buf, i, blockSize)
      break
    case 4:
      target.chars = readChars(buf, i, blockSize)
      break
    case 5:
      target.kernings = readKernings(buf, i, blockSize)
      break
  }
  return 5 + blockSize
}

function readInfo(buf, i) {
  var info = {}
  info.size = buf.readInt16LE(i)

  var bitField = buf.readUInt8(i+2)
  info.smooth = (bitField >> 7) & 1
  info.unicode = (bitField >> 6) & 1
  info.italic = (bitField >> 5) & 1
  info.bold = (bitField >> 4) & 1
  
  //fixedHeight is only mentioned in binary spec 
  if ((bitField >> 3) & 1)
    info.fixedHeight = 1
  
  info.charset = buf.readUInt8(i+3) || ''
  info.stretchH = buf.readUInt16LE(i+4)
  info.aa = buf.readUInt8(i+6)
  info.padding = [
    buf.readInt8(i+7),
    buf.readInt8(i+8),
    buf.readInt8(i+9),
    buf.readInt8(i+10)
  ]
  info.spacing = [
    buf.readInt8(i+11),
    buf.readInt8(i+12)
  ]
  info.outline = buf.readUInt8(i+13)
  info.face = readStringNT(buf, i+14)
  return info
}

function readCommon(buf, i) {
  var common = {}
  common.lineHeight = buf.readUInt16LE(i)
  common.base = buf.readUInt16LE(i+2)
  common.scaleW = buf.readUInt16LE(i+4)
  common.scaleH = buf.readUInt16LE(i+6)
  common.pages = buf.readUInt16LE(i+8)
  var bitField = buf.readUInt8(i+10)
  common.packed = 0
  common.alphaChnl = buf.readUInt8(i+11)
  common.redChnl = buf.readUInt8(i+12)
  common.greenChnl = buf.readUInt8(i+13)
  common.blueChnl = buf.readUInt8(i+14)
  return common
}

function readPages(buf, i, size) {
  var pages = []
  var text = readNameNT(buf, i)
  var len = text.length+1
  var count = size / len
  for (var c=0; c<count; c++) {
    pages[c] = buf.slice(i, i+text.length).toString('utf8')
    i += len
  }
  return pages
}

function readChars(buf, i, blockSize) {
  var chars = []

  var count = blockSize / 20
  for (var c=0; c<count; c++) {
    var char = {}
    var off = c*20
    char.id = buf.readUInt32LE(i + 0 + off)
    char.x = buf.readUInt16LE(i + 4 + off)
    char.y = buf.readUInt16LE(i + 6 + off)
    char.width = buf.readUInt16LE(i + 8 + off)
    char.height = buf.readUInt16LE(i + 10 + off)
    char.xoffset = buf.readInt16LE(i + 12 + off)
    char.yoffset = buf.readInt16LE(i + 14 + off)
    char.xadvance = buf.readInt16LE(i + 16 + off)
    char.page = buf.readUInt8(i + 18 + off)
    char.chnl = buf.readUInt8(i + 19 + off)
    chars[c] = char
  }
  return chars
}

function readKernings(buf, i, blockSize) {
  var kernings = []
  var count = blockSize / 10
  for (var c=0; c<count; c++) {
    var kern = {}
    var off = c*10
    kern.first = buf.readUInt32LE(i + 0 + off)
    kern.second = buf.readUInt32LE(i + 4 + off)
    kern.amount = buf.readInt16LE(i + 8 + off)
    kernings[c] = kern
  }
  return kernings
}

function readNameNT(buf, offset) {
  var pos=offset
  for (; pos<buf.length; pos++) {
    if (buf[pos] === 0x00) 
      break
  }
  return buf.slice(offset, pos)
}

function readStringNT(buf, offset) {
  return readNameNT(buf, offset).toString('utf8')
}

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

var parseAttributes = __webpack_require__(27)
var parseFromString = __webpack_require__(36)

//In some cases element.attribute.nodeName can return
//all lowercase values.. so we need to map them to the correct 
//case
var NAME_MAP = {
  scaleh: 'scaleH',
  scalew: 'scaleW',
  stretchh: 'stretchH',
  lineheight: 'lineHeight',
  alphachnl: 'alphaChnl',
  redchnl: 'redChnl',
  greenchnl: 'greenChnl',
  bluechnl: 'blueChnl'
}

module.exports = function parse(data) {
  data = data.toString()
  
  var xmlRoot = parseFromString(data)
  var output = {
    pages: [],
    chars: [],
    kernings: []
  }

  //get config settings
  ;['info', 'common'].forEach(function(key) {
    var element = xmlRoot.getElementsByTagName(key)[0]
    if (element)
      output[key] = parseAttributes(getAttribs(element))
  })

  //get page info
  var pageRoot = xmlRoot.getElementsByTagName('pages')[0]
  if (!pageRoot)
    throw new Error('malformed file -- no <pages> element')
  var pages = pageRoot.getElementsByTagName('page')
  for (var i=0; i<pages.length; i++) {
    var p = pages[i]
    var id = parseInt(p.getAttribute('id'), 10)
    var file = p.getAttribute('file')
    if (isNaN(id))
      throw new Error('malformed file -- page "id" attribute is NaN')
    if (!file)
      throw new Error('malformed file -- needs page "file" attribute')
    output.pages[parseInt(id, 10)] = file
  }

  //get kernings / chars
  ;['chars', 'kernings'].forEach(function(key) {
    var element = xmlRoot.getElementsByTagName(key)[0]
    if (!element)
      return
    var childTag = key.substring(0, key.length-1)
    var children = element.getElementsByTagName(childTag)
    for (var i=0; i<children.length; i++) {      
      var child = children[i]
      output[key].push(parseAttributes(getAttribs(child)))
    }
  })
  return output
}

function getAttribs(element) {
  var attribs = getAttribList(element)
  return attribs.reduce(function(dict, attrib) {
    var key = mapName(attrib.nodeName)
    dict[key] = attrib.nodeValue
    return dict
  }, {})
}

function getAttribList(element) {
  //IE8+ and modern browsers
  var attribs = []
  for (var i=0; i<element.attributes.length; i++)
    attribs.push(element.attributes[i])
  return attribs
}

function mapName(nodeName) {
  return NAME_MAP[nodeName.toLowerCase()] || nodeName
}

/***/ }),
/* 27 */
/***/ (function(module, exports) {

//Some versions of GlyphDesigner have a typo
//that causes some bugs with parsing. 
//Need to confirm with recent version of the software
//to see whether this is still an issue or not.
var GLYPH_DESIGNER_ERROR = 'chasrset'

module.exports = function parseAttributes(obj) {
  if (GLYPH_DESIGNER_ERROR in obj) {
    obj['charset'] = obj[GLYPH_DESIGNER_ERROR]
    delete obj[GLYPH_DESIGNER_ERROR]
  }

  for (var k in obj) {
    if (k === 'face' || k === 'charset') 
      continue
    else if (k === 'padding' || k === 'spacing')
      obj[k] = parseIntList(obj[k])
    else
      obj[k] = parseInt(obj[k], 10) 
  }
  return obj
}

function parseIntList(data) {
  return data.split(',').map(function(val) {
    return parseInt(val, 10)
  })
}

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

var trim = __webpack_require__(33)
  , forEach = __webpack_require__(15)
  , isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    }

module.exports = function (headers) {
  if (!headers)
    return {}

  var result = {}

  forEach(
      trim(headers).split('\n')
    , function (row) {
        var index = row.indexOf(':')
          , key = trim(row.slice(0, index)).toLowerCase()
          , value = trim(row.slice(index + 1))

        if (typeof(result[key]) === 'undefined') {
          result[key] = value
        } else if (isArray(result[key])) {
          result[key].push(value)
        } else {
          result[key] = [ result[key], value ]
        }
      }
  )

  return result
}

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

var dtype = __webpack_require__(2)
var anArray = __webpack_require__(10)
var isBuffer = __webpack_require__(20)

var CW = [0, 2, 3]
var CCW = [2, 1, 3]

module.exports = function createQuadElements(array, opt) {
    //if user didn't specify an output array
    if (!array || !(anArray(array) || isBuffer(array))) {
        opt = array || {}
        array = null
    }

    if (typeof opt === 'number') //backwards-compatible
        opt = { count: opt }
    else
        opt = opt || {}

    var type = typeof opt.type === 'string' ? opt.type : 'uint16'
    var count = typeof opt.count === 'number' ? opt.count : 1
    var start = (opt.start || 0) 

    var dir = opt.clockwise !== false ? CW : CCW,
        a = dir[0], 
        b = dir[1],
        c = dir[2]

    var numIndices = count * 6

    var indices = array || new (dtype(type))(numIndices)
    for (var i = 0, j = 0; i < numIndices; i += 6, j += 4) {
        var x = i + start
        indices[x + 0] = j + 0
        indices[x + 1] = j + 1
        indices[x + 2] = j + 2
        indices[x + 3] = j + a
        indices[x + 4] = j + b
        indices[x + 5] = j + c
    }
    return indices
}

/***/ }),
/* 30 */
/***/ (function(module, exports) {

var itemSize = 2
var box = { min: [0, 0], max: [0, 0] }

function bounds (positions) {
  var count = positions.length / itemSize
  box.min[0] = positions[0]
  box.min[1] = positions[1]
  box.max[0] = positions[0]
  box.max[1] = positions[1]

  for (var i = 0; i < count; i++) {
    var x = positions[i * itemSize + 0]
    var y = positions[i * itemSize + 1]
    box.min[0] = Math.min(x, box.min[0])
    box.min[1] = Math.min(y, box.min[1])
    box.max[0] = Math.max(x, box.max[0])
    box.max[1] = Math.max(y, box.max[1])
  }
}

module.exports.computeBox = function (positions, output) {
  bounds(positions)
  output.min.set(box.min[0], box.min[1], 0)
  output.max.set(box.max[0], box.max[1], 0)
}

module.exports.computeSphere = function (positions, output) {
  bounds(positions)
  var minX = box.min[0]
  var minY = box.min[1]
  var maxX = box.max[0]
  var maxY = box.max[1]
  var width = maxX - minX
  var height = maxY - minY
  var length = Math.sqrt(width * width + height * height)
  output.center.set(minX + width / 2, minY + height / 2, 0)
  output.radius = length / 2
}


/***/ }),
/* 31 */
/***/ (function(module, exports) {

module.exports.pages = function pages (glyphs) {
  var pages = new Float32Array(glyphs.length * 4 * 1)
  var i = 0
  glyphs.forEach(function (glyph) {
    var id = glyph.data.page || 0
    pages[i++] = id
    pages[i++] = id
    pages[i++] = id
    pages[i++] = id
  })
  return pages
}

module.exports.uvs = function uvs (glyphs, texWidth, texHeight, flipY) {
  var uvs = new Float32Array(glyphs.length * 4 * 2)
  var i = 0
  glyphs.forEach(function (glyph) {
    var bitmap = glyph.data
    var bw = (bitmap.x + bitmap.width)
    var bh = (bitmap.y + bitmap.height)

    // top left position
    var u0 = bitmap.x / texWidth
    var v1 = bitmap.y / texHeight
    var u1 = bw / texWidth
    var v0 = bh / texHeight

    if (flipY) {
      v1 = (texHeight - bitmap.y) / texHeight
      v0 = (texHeight - bh) / texHeight
    }

    // BL
    uvs[i++] = u0
    uvs[i++] = v1
    // TL
    uvs[i++] = u0
    uvs[i++] = v0
    // TR
    uvs[i++] = u1
    uvs[i++] = v0
    // BR
    uvs[i++] = u1
    uvs[i++] = v1
  })
  return uvs
}

module.exports.positions = function positions (glyphs) {
  var positions = new Float32Array(glyphs.length * 4 * 2)
  var i = 0
  glyphs.forEach(function (glyph) {
    var bitmap = glyph.data

    // bottom left position
    var x = glyph.position[0] + bitmap.xoffset
    var y = glyph.position[1] + bitmap.yoffset

    // quad size
    var w = bitmap.width
    var h = bitmap.height

    // BL
    positions[i++] = x
    positions[i++] = y
    // TL
    positions[i++] = x
    positions[i++] = y + h
    // TR
    positions[i++] = x + w
    positions[i++] = y + h
    // BR
    positions[i++] = x + w
    positions[i++] = y
  })
  return positions
}


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

var flatten = __webpack_require__(14)
var warned = false;

module.exports.attr = setAttribute
module.exports.index = setIndex

function setIndex (geometry, data, itemSize, dtype) {
  if (typeof itemSize !== 'number') itemSize = 1
  if (typeof dtype !== 'string') dtype = 'uint16'

  var isR69 = !geometry.index && typeof geometry.setIndex !== 'function'
  var attrib = isR69 ? geometry.getAttribute('index') : geometry.index
  var newAttrib = updateAttribute(attrib, data, itemSize, dtype)
  if (newAttrib) {
    if (isR69) geometry.addAttribute('index', newAttrib)
    else geometry.index = newAttrib
  }
}

function setAttribute (geometry, key, data, itemSize, dtype) {
  if (typeof itemSize !== 'number') itemSize = 3
  if (typeof dtype !== 'string') dtype = 'float32'
  if (Array.isArray(data) &&
    Array.isArray(data[0]) &&
    data[0].length !== itemSize) {
    throw new Error('Nested vertex array has unexpected size; expected ' +
      itemSize + ' but found ' + data[0].length)
  }

  var attrib = geometry.getAttribute(key)
  var newAttrib = updateAttribute(attrib, data, itemSize, dtype)
  if (newAttrib) {
    geometry.addAttribute(key, newAttrib)
  }
}

function updateAttribute (attrib, data, itemSize, dtype) {
  data = data || []
  if (!attrib || rebuildAttribute(attrib, data, itemSize)) {
    // create a new array with desired type
    data = flatten(data, dtype)

    var needsNewBuffer = attrib && typeof attrib.setArray !== 'function'
    if (!attrib || needsNewBuffer) {
      // We are on an old version of ThreeJS which can't
      // support growing / shrinking buffers, so we need
      // to build a new buffer
      if (needsNewBuffer && !warned) {
        warned = true
        console.warn([
          'A WebGL buffer is being updated with a new size or itemSize, ',
          'however this version of ThreeJS only supports fixed-size buffers.',
          '\nThe old buffer may still be kept in memory.\n',
          'To avoid memory leaks, it is recommended that you dispose ',
          'your geometries and create new ones, or update to ThreeJS r82 or newer.\n',
          'See here for discussion:\n',
          'https://github.com/mrdoob/three.js/pull/9631'
        ].join(''))
      }

      // Build a new attribute
      attrib = new THREE.BufferAttribute(data, itemSize);
    }

    attrib.itemSize = itemSize
    attrib.needsUpdate = true

    // New versions of ThreeJS suggest using setArray
    // to change the data. It will use bufferData internally,
    // so you can change the array size without any issues
    if (typeof attrib.setArray === 'function') {
      attrib.setArray(data)
    }

    return attrib
  } else {
    // copy data into the existing array
    flatten(data, attrib.array)
    attrib.needsUpdate = true
    return null
  }
}

// Test whether the attribute needs to be re-created,
// returns false if we can re-use it as-is.
function rebuildAttribute (attrib, data, itemSize) {
  if (attrib.itemSize !== itemSize) return true
  if (!attrib.array) return true
  var attribLength = attrib.array.length
  if (Array.isArray(data) && Array.isArray(data[0])) {
    // [ [ x, y, z ] ]
    return attribLength !== data.length * itemSize
  } else {
    // [ x, y, z ]
    return attribLength !== data.length
  }
  return false
}


/***/ }),
/* 33 */
/***/ (function(module, exports) {


exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};


/***/ }),
/* 34 */
/***/ (function(module, exports) {

var newline = /\n/
var newlineChar = '\n'
var whitespace = /\s/

module.exports = function(text, opt) {
    var lines = module.exports.lines(text, opt)
    return lines.map(function(line) {
        return text.substring(line.start, line.end)
    }).join('\n')
}

module.exports.lines = function wordwrap(text, opt) {
    opt = opt||{}

    //zero width results in nothing visible
    if (opt.width === 0 && opt.mode !== 'nowrap') 
        return []

    text = text||''
    var width = typeof opt.width === 'number' ? opt.width : Number.MAX_VALUE
    var start = Math.max(0, opt.start||0)
    var end = typeof opt.end === 'number' ? opt.end : text.length
    var mode = opt.mode

    var measure = opt.measure || monospace
    if (mode === 'pre')
        return pre(measure, text, start, end, width)
    else
        return greedy(measure, text, start, end, width, mode)
}

function idxOf(text, chr, start, end) {
    var idx = text.indexOf(chr, start)
    if (idx === -1 || idx > end)
        return end
    return idx
}

function isWhitespace(chr) {
    return whitespace.test(chr)
}

function pre(measure, text, start, end, width) {
    var lines = []
    var lineStart = start
    for (var i=start; i<end && i<text.length; i++) {
        var chr = text.charAt(i)
        var isNewline = newline.test(chr)

        //If we've reached a newline, then step down a line
        //Or if we've reached the EOF
        if (isNewline || i===end-1) {
            var lineEnd = isNewline ? i : i+1
            var measured = measure(text, lineStart, lineEnd, width)
            lines.push(measured)
            
            lineStart = i+1
        }
    }
    return lines
}

function greedy(measure, text, start, end, width, mode) {
    //A greedy word wrapper based on LibGDX algorithm
    //https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/BitmapFontCache.java
    var lines = []

    var testWidth = width
    //if 'nowrap' is specified, we only wrap on newline chars
    if (mode === 'nowrap')
        testWidth = Number.MAX_VALUE

    while (start < end && start < text.length) {
        //get next newline position
        var newLine = idxOf(text, newlineChar, start, end)

        //eat whitespace at start of line
        while (start < newLine) {
            if (!isWhitespace( text.charAt(start) ))
                break
            start++
        }

        //determine visible # of glyphs for the available width
        var measured = measure(text, start, newLine, testWidth)

        var lineEnd = start + (measured.end-measured.start)
        var nextStart = lineEnd + newlineChar.length

        //if we had to cut the line before the next newline...
        if (lineEnd < newLine) {
            //find char to break on
            while (lineEnd > start) {
                if (isWhitespace(text.charAt(lineEnd)))
                    break
                lineEnd--
            }
            if (lineEnd === start) {
                if (nextStart > start + newlineChar.length) nextStart--
                lineEnd = nextStart // If no characters to break, show all.
            } else {
                nextStart = lineEnd
                //eat whitespace at end of line
                while (lineEnd > start) {
                    if (!isWhitespace(text.charAt(lineEnd - newlineChar.length)))
                        break
                    lineEnd--
                }
            }
        }
        if (lineEnd >= start) {
            var result = measure(text, start, lineEnd, testWidth)
            lines.push(result)
        }
        start = nextStart
    }
    return lines
}

//determines the visible number of glyphs within a given width
function monospace(text, start, end, width) {
    var glyphs = Math.min(width, end-start)
    return {
        start: start,
        end: start+glyphs
    }
}

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var window = __webpack_require__(16)
var isFunction = __webpack_require__(3)
var parseHeaders = __webpack_require__(28)
var xtend = __webpack_require__(1)

module.exports = createXHR
createXHR.XMLHttpRequest = window.XMLHttpRequest || noop
createXHR.XDomainRequest = "withCredentials" in (new createXHR.XMLHttpRequest()) ? createXHR.XMLHttpRequest : window.XDomainRequest

forEachArray(["get", "put", "post", "patch", "head", "delete"], function(method) {
    createXHR[method === "delete" ? "del" : method] = function(uri, options, callback) {
        options = initParams(uri, options, callback)
        options.method = method.toUpperCase()
        return _createXHR(options)
    }
})

function forEachArray(array, iterator) {
    for (var i = 0; i < array.length; i++) {
        iterator(array[i])
    }
}

function isEmpty(obj){
    for(var i in obj){
        if(obj.hasOwnProperty(i)) return false
    }
    return true
}

function initParams(uri, options, callback) {
    var params = uri

    if (isFunction(options)) {
        callback = options
        if (typeof uri === "string") {
            params = {uri:uri}
        }
    } else {
        params = xtend(options, {uri: uri})
    }

    params.callback = callback
    return params
}

function createXHR(uri, options, callback) {
    options = initParams(uri, options, callback)
    return _createXHR(options)
}

function _createXHR(options) {
    if(typeof options.callback === "undefined"){
        throw new Error("callback argument missing")
    }

    var called = false
    var callback = function cbOnce(err, response, body){
        if(!called){
            called = true
            options.callback(err, response, body)
        }
    }

    function readystatechange() {
        if (xhr.readyState === 4) {
            loadFunc()
        }
    }

    function getBody() {
        // Chrome with requestType=blob throws errors arround when even testing access to responseText
        var body = undefined

        if (xhr.response) {
            body = xhr.response
        } else {
            body = xhr.responseText || getXml(xhr)
        }

        if (isJson) {
            try {
                body = JSON.parse(body)
            } catch (e) {}
        }

        return body
    }

    function errorFunc(evt) {
        clearTimeout(timeoutTimer)
        if(!(evt instanceof Error)){
            evt = new Error("" + (evt || "Unknown XMLHttpRequest Error") )
        }
        evt.statusCode = 0
        return callback(evt, failureResponse)
    }

    // will load the data & process the response in a special response object
    function loadFunc() {
        if (aborted) return
        var status
        clearTimeout(timeoutTimer)
        if(options.useXDR && xhr.status===undefined) {
            //IE8 CORS GET successful response doesn't have a status field, but body is fine
            status = 200
        } else {
            status = (xhr.status === 1223 ? 204 : xhr.status)
        }
        var response = failureResponse
        var err = null

        if (status !== 0){
            response = {
                body: getBody(),
                statusCode: status,
                method: method,
                headers: {},
                url: uri,
                rawRequest: xhr
            }
            if(xhr.getAllResponseHeaders){ //remember xhr can in fact be XDR for CORS in IE
                response.headers = parseHeaders(xhr.getAllResponseHeaders())
            }
        } else {
            err = new Error("Internal XMLHttpRequest Error")
        }
        return callback(err, response, response.body)
    }

    var xhr = options.xhr || null

    if (!xhr) {
        if (options.cors || options.useXDR) {
            xhr = new createXHR.XDomainRequest()
        }else{
            xhr = new createXHR.XMLHttpRequest()
        }
    }

    var key
    var aborted
    var uri = xhr.url = options.uri || options.url
    var method = xhr.method = options.method || "GET"
    var body = options.body || options.data
    var headers = xhr.headers = options.headers || {}
    var sync = !!options.sync
    var isJson = false
    var timeoutTimer
    var failureResponse = {
        body: undefined,
        headers: {},
        statusCode: 0,
        method: method,
        url: uri,
        rawRequest: xhr
    }

    if ("json" in options && options.json !== false) {
        isJson = true
        headers["accept"] || headers["Accept"] || (headers["Accept"] = "application/json") //Don't override existing accept header declared by user
        if (method !== "GET" && method !== "HEAD") {
            headers["content-type"] || headers["Content-Type"] || (headers["Content-Type"] = "application/json") //Don't override existing accept header declared by user
            body = JSON.stringify(options.json === true ? body : options.json)
        }
    }

    xhr.onreadystatechange = readystatechange
    xhr.onload = loadFunc
    xhr.onerror = errorFunc
    // IE9 must have onprogress be set to a unique function.
    xhr.onprogress = function () {
        // IE must die
    }
    xhr.onabort = function(){
        aborted = true;
    }
    xhr.ontimeout = errorFunc
    xhr.open(method, uri, !sync, options.username, options.password)
    //has to be after open
    if(!sync) {
        xhr.withCredentials = !!options.withCredentials
    }
    // Cannot set timeout with sync request
    // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
    // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
    if (!sync && options.timeout > 0 ) {
        timeoutTimer = setTimeout(function(){
            if (aborted) return
            aborted = true//IE9 may still call readystatechange
            xhr.abort("timeout")
            var e = new Error("XMLHttpRequest timeout")
            e.code = "ETIMEDOUT"
            errorFunc(e)
        }, options.timeout )
    }

    if (xhr.setRequestHeader) {
        for(key in headers){
            if(headers.hasOwnProperty(key)){
                xhr.setRequestHeader(key, headers[key])
            }
        }
    } else if (options.headers && !isEmpty(options.headers)) {
        throw new Error("Headers cannot be set on an XDomainRequest object")
    }

    if ("responseType" in options) {
        xhr.responseType = options.responseType
    }

    if ("beforeSend" in options &&
        typeof options.beforeSend === "function"
    ) {
        options.beforeSend(xhr)
    }

    // Microsoft Edge browser sends "undefined" when send is called with undefined value.
    // XMLHttpRequest spec says to pass null as body to indicate no body
    // See https://github.com/naugtur/xhr/issues/100.
    xhr.send(body || null)

    return xhr


}

function getXml(xhr) {
    if (xhr.responseType === "document") {
        return xhr.responseXML
    }
    var firefoxBugTakenEffect = xhr.status === 204 && xhr.responseXML && xhr.responseXML.documentElement.nodeName === "parsererror"
    if (xhr.responseType === "" && !firefoxBugTakenEffect) {
        return xhr.responseXML
    }

    return null
}

function noop() {}


/***/ }),
/* 36 */
/***/ (function(module, exports) {

module.exports = (function xmlparser() {
  //common browsers
  if (typeof window.DOMParser !== 'undefined') {
    return function(str) {
      var parser = new window.DOMParser()
      return parser.parseFromString(str, 'application/xml')
    }
  } 

  //IE8 fallback
  if (typeof window.ActiveXObject !== 'undefined'
      && new window.ActiveXObject('Microsoft.XMLDOM')) {
    return function(str) {
      var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM")
      xmlDoc.async = "false"
      xmlDoc.loadXML(str)
      return xmlDoc
    }
  }

  //last resort fallback
  return function(str) {
    var div = document.createElement('div')
    div.innerHTML = str
    return div
  }
})()

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

var createText = __webpack_require__(9)
var loadFont = __webpack_require__(8)
var colors = __webpack_require__(6)
var SDFShader = __webpack_require__(7)

AFRAME.registerComponent('dataplot', {
  	schema: {
  		src: { type: 'asset', default: 'none' },
  		raw: {
  			default: 'none',
    		parse: function(data) { return data }
  		},
  		title: { type: 'string' },
	    x: { type: 'string' },
	    y: { type: 'string' },
	    z: { type: 'string' },
	    val: { type: 'string' },
	    colorpreset: { default: 'jet', type: 'string' },
	    valfill: { 
			default: [],
	    	type: 'array'
	    },
	    xfill: { 
			default: [],
	    	type: 'array'
	    },
	    yfill: { 
			default: [],
	    	type: 'array'
	    },
	    zfill: { 
			default: [],
	    	type: 'array'
	    },
	    xlimit: {
	    	type: 'number',
	    	default: 1
	    },
	    ylimit: {
	    	type: 'number',
	    	default: 1
	    },
	    zlimit: {
	    	type: 'number',
	    	default: 1
	    },
	    relationship: {
	    	default: 'none',
    		type: 'string'
	    },
	    xflip: { type: 'boolean' },
	    yflip: { type: 'boolean' },
	    zflip: { type: 'boolean' },
	    pointsize: { 
	    	type: 'number',
	    	default: 1 
	    }
  	},

  	init: function() {
  		var data = this.data
  	},

	update: function (oldData) {
		var data = this.data
    	var el = this.el

    	if (data !== oldData) {
    		if (data.raw !== "none") {
				renderGeometryFromRaw(el, data)		
    		} else if (data.src !== "none") {
    			renderGeometryAndKeyFromPath(el, data)			
    		} else {
    			console.log("no data")
    		}	
    	}
    }
})

function renderGeometryAndKeyFromPath(el, data) {
	d3.json(data.src, function(json) {
		var colorPreset = "colors." + data.colorpreset
		var geometry = new THREE.Geometry()
		json.slice().reverse().forEach(function(point, index, object) {
  			if (data.valfill.indexOf(String(point[data.val])) !== -1) {
    			json.splice(object.length - 1 - index, 1);
  			}
		})
		json.slice().reverse().forEach(function(point, index, object) {
  			if (data.xfill.indexOf(String(point[data.x])) !== -1) {
    			json.splice(object.length - 1 - index, 1);
    			
  			}
		})
		json.slice().reverse().forEach(function(point, index, object) {
  			if (data.yfill.indexOf(String(point[data.y])) !== -1) {
    			json.splice(object.length - 1 - index, 1);
    			
  			}
		})
		json.slice().reverse().forEach(function(point, index, object) {
  			if (data.zfill.indexOf(String(point[data.z])) !== -1) {
    			json.splice(object.length - 1 - index, 1);
    			
  			}
		})
		var stats = getDataStats(json, data, colorPreset)
		json.forEach(function(point){
			var vertex = new THREE.Vector3()
			if (data.xflip) {
				stats.scaleX.range([stats.width, 0])
			} else {
				stats.scaleX.range([0, stats.width])
			}

			if (data.yflip) {
				stats.scaleY.range([stats.height, 0])
			} else {
				stats.scaleY.range([0, stats.height])
			}

			if (data.zflip) {
				stats.scaleZ.range([stats.depth, 0])
			} else {
				stats.scaleZ.range([0, stats.depth])
			}

			vertex.x = stats.scaleX(point[data.x])
			vertex.y = stats.scaleY(point[data.y])
			vertex.z = stats.scaleZ(point[data.z])
			geometry.vertices.push( vertex )
			var c = stats.colorScale(point[data.val])
			geometry.colors.push(new THREE.Color(c))
		})
		var material = new THREE.PointsMaterial({
			size: data.pointsize * 0.006,
			vertexColors: THREE.VertexColors
		})
		var model = new THREE.Points( geometry, material )
		makeAxisAndKey(el, data, stats)

		el.setObject3D('particles', model)
	})	
}

function makeAxisAndKey(el, data, stats) {

	var lineDim = []
	var xDim = {}
		yDim = {}
		zDim = {}
	lineDim.push(xDim, yDim, zDim)

	xDim.v = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(stats.width, 0, 0)]
	yDim.v = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, stats.height, 0)]
	zDim.v = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, stats.depth)]

	lineDim.forEach(function(dim, i){
		makeLine(el, dim.v, i, 'baseLine')
		var textHeight = 0.05
		if (i == 0) {
			var marks = Math.round(stats.width/textHeight)
			if (marks == 1) {
				marks++;
			}
			makeAxisTicks(i, dim.v, el, marks, stats.minX, stats.maxX)
		} else if (i == 1) {
			var marks = Math.round(stats.height/textHeight)
			if (marks == 1) {
				marks++;
			}
			makeAxisTicks(i, dim.v, el, marks, stats.minY, stats.maxY)
		} else if (i == 2) {
			var marks = Math.round(stats.depth/textHeight)
			if (marks == 1) {
				marks++;
			}
			makeAxisTicks(i, dim.v, el, marks, stats.minZ, stats.maxZ)
		}

	})

	var colorPreset = "colors." + data.colorpreset
	createColorKey(el, stats, colorPreset)
	createAxisLabels(el, data, stats)
}


function createAxisLabels(el, data, stats) {
	var pos = new THREE.Vector3(stats.width + 0.05,0,stats.depth)
	var objName = "title"
	var textString = data.title
	var align = "center"
	var rot = {x: THREE.Math.degToRad(90), y: THREE.Math.degToRad(0), z: THREE.Math.degToRad(-90)}
	addText(el, pos, objName, textString, align, rot)

}

function makeAxisTicks(i, dim, el, marks, min, max) {
	var axisStats = []
	var d = []

	for (m = 0; m < marks; m++) {
		var val = m / (marks - 1)
		d.push(val)
	}

	d.forEach(function(v) {
		var vScale = d3.scaleLinear().domain([0, 1]).range([min, max])
		axisStats.push(vScale(v))
	})
	makeTicks(el, d, dim, i, axisStats)
}

function makeTicks(el, d, v, i, axisStats) {
	d.forEach(function(perc, j) {
		var v1 = getPointInBetweenByPerc(v[0], v[1], perc)
		var v2;
		var v2Text;
		var objName = "" + i + "" + j
		var textString = ""
		if (i == 0) {
			v2 = new THREE.Vector3(v1.x, v1.y, v1.z - 0.03)
			v2Text = new THREE.Vector3(v1.x - 0.01, v1.y, v1.z - 0.04)
			var rot = {x: THREE.Math.degToRad(90), y: THREE.Math.degToRad(0), z: THREE.Math.degToRad(-90)}
			textString += parseFloat(axisStats[j].toFixed(4))
		} else if (i == 1) {
			v2 = new THREE.Vector3(v1.x - 0.03, v1.y, v1.z - 0.03)
			v2Text = new THREE.Vector3(v1.x - 0.75, v1.y, v1.z + 0.25)
			var rot = {x: THREE.Math.degToRad(90), y: THREE.Math.degToRad(0), z: THREE.Math.degToRad(225)}
			textString += parseFloat(axisStats[j].toFixed(4))
		} else if (i == 2) {
			v2 = new THREE.Vector3(v1.x - 0.03, v1.y, v1.z)
			v2Text = new THREE.Vector3(v1.x - 1.035, v1.y, v1.z + 1.01)
			var rot = {x: THREE.Math.degToRad(90), y: THREE.Math.degToRad(0), z: THREE.Math.degToRad(-180)}
			textString += parseFloat(axisStats[j].toFixed(4))
		}

		var nV = [v1, v2]
		makeLine(el, nV, objName, 'xLine')
		addText(el, v2Text, objName, textString, 'right', rot)
	
	})

}

function addText(el, pos, objName, textString, align, rot) {

	fontLoader({
      font: 'https://cdn.rawgit.com/bryik/aframe-bmfont-text-component/aa0655cf90f646e12c40ab4708ea90b4686cfb45/assets/DejaVu-sdf.fnt',
      image: 'https://cdn.rawgit.com/bryik/aframe-bmfont-text-component/aa0655cf90f646e12c40ab4708ea90b4686cfb45/assets/DejaVu-sdf.png'
    }, start)

	function start (font, texture) {
      texture.needsUpdate = true
      texture.anisotropy = 16

      var options = {
        font: font,
        text: textString,
        width: 1000,
        align: align,
        letterSpacing: 0,
        lineHeight: 38,
        mode: 'normal'
      }

      var geometry = createText(options)

      var material = new THREE.RawShaderMaterial(SDFShader({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        color: '#000',
        opacity: 1.0
      }))

      var text = new THREE.Mesh(geometry, material)
      
      text.scale.multiplyScalar(-0.001)
      text.rotation.set(rot.x, rot.y, rot.z)
      text.position.set(pos.x, pos.y, pos.z - 1.0)

      el.setObject3D('bmfont-text' + objName, text)
    }
}

function fontLoader (opt, cb) {
  loadFont(opt.font, function (err, font) {
    if (err) {
      throw err
    }

    var textureLoader = new THREE.TextureLoader()
    textureLoader.load(opt.image, function (texture) {
      cb(font, texture)
    })
  })
}

function createColorKey(el, stats, colorPreset) {

	var axisStatsVal = [stats.minVal, (stats.minVal + ((stats.maxVal + stats.minVal) * 0.5))/2, (stats.minVal + stats.maxVal)  * 0.5, (stats.maxVal + ((stats.maxVal + stats.minVal) * 0.5))/2, stats.maxVal]
	var v1, v2;

	var geometry = new THREE.CubeGeometry( 0.075, 0.001, 0.4)

	var texture = new THREE.Texture( generateTexture(colorPreset) )
	texture.needsUpdate = true

    var material = new THREE.MeshBasicMaterial( { map: texture, transparent: true } )
	
	mesh = new THREE.Mesh( geometry, material )

	mesh.position.set(stats.width * 0.5, 0, stats.depth + 0.1)
	mesh.rotateY(THREE.Math.degToRad(90))

	v1 = new THREE.Vector3((stats.width * 0.5) - 0.2, 0, stats.depth + 0.1375)
	v2 = new THREE.Vector3((stats.width * 0.5) + 0.2, 0, stats.depth + 0.1375)

	var d = [0, 0.25, 0.5, 0.75, 1]

	d.forEach(function(dVal, i){
		var v1Tick = getPointInBetweenByPerc(v1, v2, dVal)
		var v2Tick = new THREE.Vector3(v1Tick.x, v1Tick.y, v1Tick.z + 0.03)
		var labelV = new THREE.Vector3(v1Tick.x - 0.01, v1Tick.y, v1Tick.z + 1.04)
		var rot = {x: THREE.Math.degToRad(90), y: THREE.Math.degToRad(0), z: THREE.Math.degToRad(-90)}
		makeLine(el,[v1Tick,v2Tick], i, "colorKeyBaseLine")
		addText(el, labelV, "colorKeyLabel" + i, "" + parseFloat(axisStatsVal[i].toFixed(4)), 'left', rot)
	})

	el.setObject3D('colorcube', mesh)

}

function generateTexture(colorPreset) {

	var size = 512

	canvas = document.createElement( 'canvas' )
	canvas.width = size
	canvas.height = size

	var colorPresetPath = eval(colorPreset)

	var context = canvas.getContext( '2d' )

	context.rect( 0, 0, size, size )
	var gradient = context.createLinearGradient( 0, 0, 0, size )

	colorPresetPath.forEach(function(c, i){
		var step = i/256
		gradient.addColorStop(step, c)
	})
	
	context.fillStyle = gradient
	context.fill()

	return canvas

}

function getPointInBetweenByPerc(pointA, pointB, percentage) {

    var dir = pointB.clone().sub(pointA)
    var len = dir.length()
    dir = dir.normalize().multiplyScalar(len*percentage)
    return pointA.clone().add(dir)

}

function makeLine(el, v, i, objName) {
	var material = new THREE.LineBasicMaterial({
		color: 0x000000,
		opacity: 0.45, 
		transparent: true, 
		depthWrite: false
	})

	var geometry = new THREE.Geometry()
	geometry.vertices = v

	var line = new THREE.Line( geometry, material )
	el.setObject3D(objName + i, line)
}

function renderGeometryFromRaw(el, data) {
	var json = JSON.parse(data.raw)
	var colorPreset = "colors." + data.colorpreset
	var geometry = new THREE.Geometry()
	json.slice().reverse().forEach(function(point, index, object) {
			if (data.valfill.indexOf(String(point[data.val])) !== -1) {
			json.splice(object.length - 1 - index, 1);
			}
	})
	json.slice().reverse().forEach(function(point, index, object) {
			if (data.xfill.indexOf(String(point[data.x])) !== -1) {
			json.splice(object.length - 1 - index, 1);
			
			}
	})
	json.slice().reverse().forEach(function(point, index, object) {
			if (data.yfill.indexOf(String(point[data.y])) !== -1) {
			json.splice(object.length - 1 - index, 1);
			
			}
	})
	json.slice().reverse().forEach(function(point, index, object) {
			if (data.zfill.indexOf(String(point[data.z])) !== -1) {
			json.splice(object.length - 1 - index, 1);
			
			}
	})
	var stats = getDataStats(json, data, colorPreset)
	json.forEach(function(point){
		var vertex = new THREE.Vector3()
		if (data.xflip) {
			stats.scaleX.range([stats.width, 0])
		} else {
			stats.scaleX.range([0, stats.width])
		}

		if (data.yflip) {
			stats.scaleY.range([stats.height, 0])
		} else {
			stats.scaleY.range([0, stats.height])
		}

		if (data.zflip) {
			stats.scaleZ.range([stats.depth, 0])
		} else {
			stats.scaleZ.range([0, stats.depth])
		}

		vertex.x = stats.scaleX(point[data.x])
		vertex.y = stats.scaleY(point[data.y])
		vertex.z = stats.scaleZ(point[data.z])
		geometry.vertices.push( vertex )
		var c = stats.colorScale(point[data.val])
		geometry.colors.push(new THREE.Color(c))
	})
	var material = new THREE.PointsMaterial({
		size: data.pointsize * 0.006,
		vertexColors: THREE.VertexColors
	})
	var model = new THREE.Points( geometry, material )
	makeAxisAndKey(el, data, stats)

	el.setObject3D('particles', model)
}

function getDataStats(json, data, colorPreset) {
	var stats = {}

	stats.minX = d3.min(json, function(d) { return d[data.x]})
	stats.maxX = d3.max(json, function(d) { return d[data.x]})
	stats.minY = d3.min(json, function(d) { return d[data.y]})
	stats.maxY = d3.max(json, function(d) { return d[data.y]})
	stats.minZ = d3.min(json, function(d) { return d[data.z]})
	stats.maxZ = d3.max(json, function(d) { return d[data.z]})
	stats.minVal = d3.min(json, function(d) { return d[data.val]})
	stats.maxVal = d3.max(json, function(d) { return d[data.val]})

	stats.totalX = Math.abs(stats.minX) + Math.abs(stats.maxX)
	stats.totalZ = Math.abs(stats.minZ) + Math.abs(stats.maxZ)
	stats.totalY = Math.abs(stats.minY) + Math.abs(stats.maxY)

	var xz = false
	var xy = false
	var yz = false
	var xyz = false

	if (data.relationship == "xy" || data.relationship == "yx") {
		xy = true
	} else if (data.relationship == "xz" || data.relationship == "zx") {
		xz = true
	} else if (data.relationship == "yz" || data.relationship == "zy") {
		yz = true
	} else if (data.relationship == "xyz" || data.relationship == "yzx" || data.relationship == "zxy" || data.relationship == "xzy" || data.relationship == "yxz" || data.relationship == "zyx") {
		xyz = true
	}

	if (xy) {
		if (stats.totalX < stats.totalY) {
			var shape = stats.totalX/stats.totalY
			stats.height = 1
			stats.width = shape
		} else {
			var shape = stats.totalY/stats.totalX
			stats.height = shape
			stats.width = 1
		}
		stats.depth = data.zlimit
	} else if (xz) {
		if (stats.totalX < stats.totalZ) {
			var shape = stats.totalX/stats.totalZ
			stats.width = shape
			stats.depth = 1
		} else {
			var shape = stats.totalZ/stats.totalX
			stats.width = 1
			stats.depth = shape
		}
		stats.height = data.ylimit
	} else if (yz) {
		if (stats.totalY < stats.totalZ) {
			var shape = stats.totalY/stats.totalZ
			stats.height = shape
			stats.depth = 1
		} else {
			var shape = stats.totalZ/stats.totalY
			stats.depth = shape
			stats.height = 1
		}
		stats.width = data.xlimit
	} else if (xyz) {
		if (stats.totalX >= stats.totalY && stats.totalX >= stats.totalZ) {
			var shape1 = stats.totalZ/stats.totalX
			var shape2 = stats.totalY/stats.totalX
			stats.width = 1
			stats.height = shape2
			stats.depth = shape1
		} else if (stats.totalY >= stats.totalZ && stats.totalY >= stats.totalX) {
			var shape1 = stats.totalZ/stats.totalY
			var shape2 = stats.totalX/stats.totalY
			stats.width = shape2
			stats.height = 1
			stats.depth = shape1
		} else if (stats.totalZ >= stats.totalY && stats.totalZ >= stats.totalX) {
			var shape1 = stats.totalX/stats.totalZ
			var shape2 = stats.totalY/stats.totalZ
			stats.width = shape1
			stats.height = shape2
			stats.depth = 1
		}
	} else {
		stats.width = data.xlimit
		stats.height = data.ylimit
		stats.depth = data.zlimit
	}

	stats.scaleX = d3.scaleLinear().domain([stats.minX, stats.maxX]).range([0, stats.width])
	stats.scaleY = d3.scaleLinear().domain([stats.minY, stats.maxY]).range([0, stats.height])
	stats.scaleZ = d3.scaleLinear().domain([stats.minZ, stats.maxZ]).range([0, stats.depth])
	
	stats.colorScale = d3.scaleQuantile().domain([stats.minVal, stats.maxVal]).range(eval(colorPreset))
	
	return stats
}

AFRAME.registerPrimitive('a-scatterplot', {
	defaultComponents: {
		dataplot: {}
	},
	mappings: {
		src: 'dataplot.src',
		raw: 'dataplot.raw',
		title: 'dataplot.title',
		x: 'dataplot.x',
		y: 'dataplot.y',
		z: 'dataplot.z',
		val: 'dataplot.val',
		colorpreset: 'dataplot.colorpreset',
		fillval: 'dataplot.valfill',
		xfill: 'dataplot.xfill',
		yfill: 'dataplot.yfill',
		zfill: 'dataplot.zfill',
		xlimit: 'dataplot.xlimit',
		ylimit: 'dataplot.ylimit',
		zlimit: 'dataplot.zlimit',
		relationship: 'dataplot.relationship',
		xflip: 'dataplot.xflip',
		yflip: 'dataplot.yflip',
		zflip: 'dataplot.zflip',
		pointsize: 'dataplot.pointsize'
	}
})



/***/ })
/******/ ]);