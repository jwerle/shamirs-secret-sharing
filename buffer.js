/**
 * TypedArray
 * @typedef {Int8Array|Int16Array|Int32Array|BigInt64Array|Uint8Array|Uint16Array|Uint32Array|BigUint64Array|Float32Array|Float64Array} TypedArray
 */

/**
 * ArrayLike
 * @typedef {Array|{ length: number }} ArrayLike
 */

/**
 * BufferLike
 * @typedef {TypedArray|ArrayBuffer|ArrayLike} BufferLike
 */

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

const ALPHA16_CHARS = '0123456789abcdef'
const ALPHA16_ARRAY_TABLE = new Array(256)

for (let i = 0; i < 16; ++i) {
  const i16 = i * 16
  for (let j = 0; j < 16; ++j) {
    ALPHA16_ARRAY_TABLE[i16 + j] = ALPHA16_CHARS[i] + ALPHA16_CHARS[j]
  }
}


// lifted from Socket Runtime
const RANDOM_BYTES_QUOTA = 64 * 1024

/**
 * The set of all known prototypes of `TypedArray` descendants.
 * @type {Set<object>}
 */
export const TypedArrayPrototypeSet = new Set([
  Int8Array.prototype,
  Int16Array.prototype,
  Int32Array.prototype,
  BigInt64Array.prototype,
  Uint8Array.prototype,
  Uint16Array.prototype,
  Uint32Array.prototype,
  BigUint64Array.prototype,
  Float32Array.prototype,
  Float64Array.prototype
])

/**
 * Allocates a `Uint8Array` of size `byteLength` bytes.
 * @param {number} byteLength
 * @return {Uint8Array}
 */
export function alloc (byteLength) {
  if (byteLength < 0 || !Number.isFinite(byteLength) || !Number.isSafeInteger(byteLength)) {
    throw new RangeError(
      `The argument 'byteLength' is invalid: Received ${byteLength}`
    )
  }

  return new Buffer(byteLength)
}

/**
 * Predicate function to determine if `input` is a "buffer like"
 * object:
 * - an `ArrayBuffer` or `ArrayBuffer` ancestor
 * - an `ArrayBuffer` "view" (exlcluding `DataView`)
 * - an `Array` or `Array` ancestor
 * - an "arra like" object, something with `length`
 * @param {any} input
 * @return {boolean}
 */
export function isBufferLike (input) {
  if (!input) {
    return false
  }

  return (
    input instanceof ArrayBuffer ||
    ArrayBuffer.isView(input) ||
    Array.isArray(input) ||
    (
      typeof input === 'object' &&
      'length' in input &&
      typeof input.length === 'number'
    )
  )
}

/**
 * Predicate function to determine if `input` is a `TypedArray`.
 * @param {any} input
 * @param {?Function} [TypedArray]
 * @return {boolean}
 */
export function isTypedArray (input, TypedArray = null) {
  if (!isBufferLike(input)) {
    return false
  }

  // narrow check
  if (typeof TypedArray === 'function') {
    if (TypedArrayPrototypeSet.has(TypedArray.prototype)) {
      const prototype = Object.getPrototypeOf(input)
      return (
        prototype === TypedArray.prototype ||
        TypedArray.prototype.isPrototypeOf(prototype)
      )
    }
  }

  const prototype = Object.getPrototypeOf(input)
  for (const TypedArrayPrototype of TypedArrayPrototypeSet) {
    if (
      TypedArrayPrototype === prototype ||
      TypedArrayPrototype.isPrototypeOf(prototype)
    ) {
      return true
    }
  }

  return false
}

/**
 * Predicate function to determine if `input` is an `ArrayBuffer`.
 * @param {any} input
 * @return {boolean}
 */
export function isArrayBuffer (input) {
  if (!input) {
    return false
  }

  const TypeClass = /** @type {object} */ (input).constructor
  return (
    TypeClass === ArrayBuffer ||
    ArrayBuffer.prototype.isPrototypeOf(Object.getPrototypeOf(input))
  )
}

/**
 * Computes byte length for "buffer like" or string `input`.
 * @param {BufferLike|string} input
 * @param {string} [encoding]
 * @return {number}
 */
export function getByteLength (input, encoding = 'utf8') {
  if (typeof input === 'string') {
    if (encoding === 'hex') {
      return input.length >>> 1
    } else if (encoding === 'utf8') {
      return textEncoder.encode(input).byteLength
    } else {
      return input.length
    }
  }

  if (!isBufferLike(input)) {
    return 0
  }

  if ('byteLength' in /** @type {BufferLike} */ (input)) {
    return input.byteLength
  }

  // verify that elements in such `input` are safe finite integers
  if ('length' in input) {
    for (const element of /** @type {Array} */ (input)) {
      if (
        !Number.isFinite(element) ||
        !Number.isInteger(element) ||
        !Number.isSafeInteger(element)
      ) {
        return 0
      }
    }

    return input.length
  }

  return 0
}

/**
 * Computes and returns `ArrayBuffer` for a given `input`. If `input` is
 * an `ArrayBuffer`, then it is returned. If an `ArrayBuffer` cannot be
 * determined, then `null` is returned
 * @param {any} input
 * @return {?ArrayBuffer}
 */
export function getArrayBuffer (input) {
  if (!isBufferLike(input)) {
    return null
  }

  if (isArrayBuffer(input)) {
    return input
  }

  if (isTypedArray(/** @type {TypedArray} */ (input))) {
    return /** @type {TypedArray} */ (input).buffer
  }

  if (isArrayBuffer(input.buffer)) {
    return /** @type {ArrayBuffer} */ (input.buffer)
  }

  return null
}

/**
 * Concat an arbitrary number of "buffer like" objects into a single
 * instance. Inputs must be "buffer like" and the final instance returned
 * is determined by the first object class constructor. If invalid input is
 * given, then `null` is returned.
 * @param {...BufferLike|Array} args
 */
export function concat (...args) {
  if (args.length === 0) {
    return null
  }

  if (args.length === 1 && Array.isArray(args[0])) {
    return concat(...args[0])
  }

  for (const arg of args) {
    if (!isBufferLike(arg)) {
      return null
    }
  }

  /**
   * @type {?Uint8Array}
   */
  let view

  /**
   * @type {BufferLike}
   */
  let buffer

  /**
   * @type {?BufferLike | undefined}
   */
  const first = args.shift()

  if (first === undefined || first === null) {
    return null
  }

  /**
   * @type {Function}
   */
  const TypeClass = first.constructor

  /**
   * @type {number}
   */
  const totalSize = [first]
    .concat(args)
    .map((arg) => getByteLength(arg))
    .reduce((a, b) => a + b, 0)

  if ( // handle `ArrayBuffer` or `ArrayBuffer` ancestor
    TypeClass === ArrayBuffer ||
    ArrayBuffer.prototype.isPrototypeOf(Object.getPrototypeOf(first))
  ) {
    buffer = new /** @type {typeof ArrayBuffer} */ (TypeClass)(totalSize)
    // validate that we created a new `ArrayBuffer` or `ArrayBuffer` ancestor
    // that provides the correct `byteLength` accessor value
    if (buffer.byteLength !== totalSize) {
      throw new TypeError('Unable to correctly allocate output buffer')
    }

    view = new Uint8Array(buffer)
  } else if ( // handle `Array` or `Array` ancestor
    TypeClass === Array ||
    Array.isArray(first) ||
    Array.prototype.isPrototypeOf(Object.getPrototypeOf(first))
  ) {
    buffer = new /** @type {typeof Array} */ (TypeClass)(totalSize)
    // ensure computed byte length is equivalent to the computed total size
    if (getByteLength(buffer) !== totalSize) {
      throw new TypeError('Unable to correctly allocate output buffer')
    }

    const arrayBuffer = getArrayBuffer(buffer)
    view = isArrayBuffer(arrayBuffer)
      ? new Uint8Array(/** @type {ArrayBuffer} */ (arrayBuffer))
      : Uint8Array.from(buffer)
  } else if ( // handle `TypedArray` descendants
    isTypedArray(first)
  ) {
    buffer = /** @type {TypedArray} */ (
      new /** @type {{ new (number) }} */ (TypeClass)(totalSize)
    )
    // validate that we created a new `TypedArray` or `TypedArray` ancestor
    // that provides the correct `byteLength` accessor value
    if (/** @type {TypedArray} */ (buffer).byteLength !== totalSize) {
      throw new TypeError('Unable to correctly allocate output buffer')
    }

    const arrayBuffer = getArrayBuffer(buffer)
    view = new Uint8Array(/** @type {ArrayBuffer} */ (arrayBuffer))
  } else { // must be "array" like in some way
    buffer = new /** @type {typeof Array} */ (TypeClass)(totalSize)
    // ensure computed byte length is equivalent to the computed total size
    if (getByteLength(buffer) !== totalSize) {
      throw new TypeError('Unable to correctly allocate output buffer')
    }

    const arrayBuffer = getArrayBuffer(buffer)
    view = isArrayBuffer(arrayBuffer)
      ? new Uint8Array(/** @type {ArrayBuffer} */ (arrayBuffer))
      : Uint8Array.from(buffer)
  }

  const buffers = [first].concat(args)
  let offset = 0

  while (buffers.length) {
    const arrayBuffer = getArrayBuffer(buffers.shift())

    if (!arrayBuffer) {
      throw new TypeError('Unable to determine ArrayBuffer in arguments')
    }

    const array = new Uint8Array(arrayBuffer)
    view.set(array, offset)
    offset += array.byteLength
  }

  return buffer
}

/**
 * Creates a "buffer" (`Uint8Array`) from `input`
 * @param {BufferLike|string} input
 * @param {number} [byteOffset]
 * @param {number} [byteLength]
 * @param {string} [encoding = 'utf8']
 * @return {Buffer}
 */
export function create (
  input,
  byteOffset = input.byteOffset || 0,
  byteLength = getByteLength(input),
  encoding = 'utf8'
) {
  if (typeof input === 'string') {
    if (encoding === 'hex') {
      byteLength = getByteLength(input, 'hex')
      const buffer = new Buffer(byteLength)

      for (let i = 0; i < input.length; ++i) {
        const offset = 2 * i
        const byte = parseInt(input.slice(offset, offset + 2), 16)

        if (Number.isNaN(byte)) {
          break
        }

        buffer[i] = byte
      }

      return buffer
    }

    if (encoding === 'base64') {
      const string = globalThis.atob(input)
      const buffer = new Buffer(string.length)
      for (let i = 0; i < string.length; ++i) {
        buffer[i] = string.charCodeAt(i)
      }

      return buffer
    }

    return create(textEncoder.encode(input))
  }

  if (isBufferLike(input)) {
    const arrayBuffer = getArrayBuffer(input)
    if (isArrayBuffer(arrayBuffer)) {
      return new Buffer(
        /** @type {ArrayBuffer} */ (arrayBuffer),
        input.byteOffset || byteOffset,
        byteLength
      )
    }
  }

  if (Array.isArray(input)) {
    return new Buffer(input)
  }

  return new Buffer(0)
}

/**
 * Creates `Uint8Array` buffer from a variety of input.
 * @param {BufferLike|string} input
 * @param {number|string} [byteOffset]
 * @param {number} [byteLength]
 * @param {string} [encoding = 'utf8']
 * @return {Buffer}
 */
export function from (input, byteOffset, byteLength, encoding = 'utf8') {
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    return create(input, 0, getByteLength(input), encoding)
  }

  return create(input, byteOffset || 0, byteLength || getByteLength(input), encoding)
}

/**
 * Compares two `a` and `b` buffers.
 * @param {BufferLike|string} a
 * @param {BufferLike|string} b
 * @param {string} [encoding]
 * @return {-1 | 0 | 1}
 */
export function compare (a, b, encoding = 'utf8') {
  if (
    a instanceof Uint8Array ||
    Uint8Array.prototype.isPrototypeOf(Object.getPrototypeOf(a))
  ) {
    a = from(
      a,
      /** @type {Uint8Array} */ (a).byteOffset,
      /** @type {Uint8Array} */ (a).byteLength
    )
  }

  if (
    b instanceof Uint8Array ||
    Uint8Array.prototype.isPrototypeOf(Object.getPrototypeOf(b))
  ) {
    b = from(
      b,
      /** @type {Uint8Array} */ (b).byteOffset,
      /** @type {Uint8Array} */ (b).byteLength
    )
  }

  if (typeof a === 'string') {
    a = from(a, encoding)
  }

  if (typeof b === 'string') {
    b = from(b, encoding)
  }

  if (!isBufferLike(a) || !isBufferLike(b)) {
    throw new TypeError(
      'Input buffers must be "buffer like"'
    )
  }

  if (a === b) {
    return 0
  }

  if (isArrayBuffer(a)) {
    a = from(a)
  }

  if (isArrayBuffer(b)) {
    b = from(b)
  }

  let x = /** @type {Uint8Array} */ (a).byteLength
  let y = /** @type {Uint8Array} */ (b).byteLength

  for (let i = 0, length = Math.min(x, y); i < length; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) {
    return -1
  } else if (y < x) {
    return 1
  }

  return 0
}

/**
 * Converts a "buffer like" object to a string.
 * @param {BufferLike} input
 * @param {string} [encoding = 'utf8']
 * @return {string}
 */
export function toString (input, encoding = 'utf8') {
  const buffer = from(input)

  if (encoding === 'hex') {
    const output = []

    for (let i = 0; i < buffer.byteLength; ++i) {
      output.push(ALPHA16_ARRAY_TABLE[buffer[i]])
    }

    return output.join('')
  }

  if (encoding === 'base64') {
    const output = []

    for (let i = 0; i < buffer.byteLength; ++i) {
      output.push(String.fromCharCode(buffer[i]))
    }

    return globalThis.btoa(output.join(''))
  }

  return textDecoder.decode(buffer)
}

/**
 * Generates random bytes of `size` bytes.
 * @param {number} byteLength
 * @return {Buffer}
 */
export function randomBytes (byteLength) {
  const buffers = []

  if (typeof globalThis.crypto?.getRandomValues !== 'function') {
    throw new TypeError(
      'Missing globalThis.crypto.getRandomValues implementation'
    )
  }

  if (byteLength <= 0 || !Number.isFinite(byteLength) || !Number.isSafeInteger(byteLength)) {
    throw new RangeError(
      `The argument 'byteLength' is invalid: Received ${byteLength}`
    )
  }

  let byteLengthRemaining = byteLength

  do {
    // clamp `byteLengthRemaining`
    const byteLength = byteLengthRemaining > RANDOM_BYTES_QUOTA
      ? RANDOM_BYTES_QUOTA
      : byteLengthRemaining

    const bytes = globalThis.crypto.getRandomValues(new Int8Array(byteLength))
    const buffer = Buffer.from(bytes)
    // @ts-ignore
    buffers.push(buffer)
    byteLengthRemaining = Math.max(0, byteLengthRemaining - RANDOM_BYTES_QUOTA)
  } while (byteLengthRemaining > 0)

  return Buffer.concat(buffers)
}

/**
 * A simple `Buffer` class based on an `Uint8Array` used
 * within this module. It is similar to the Node.js and Socket Runtime
 * `Buffer` class.
 */
// @ts-ignore
export class Buffer extends Uint8Array {
  static alloc = alloc
  static byteLength = getByteLength
  static compare = compare
  static concat = concat

  static from = from
  static isBufferLike = isBufferLike
  static random = randomBytes

  static get Buffer () {
    return Buffer
  }

  /**
   * Predicate function to deterine if `input` is a `Buffer`
   * @param {any} input
   * @return {boolean}
   */
  static isBuffer (input) {
    return isTypedArray(input, this) || isTypedArray(input, Uint8Array)
  }

  /**
   * Computed byte length
   * @type {number}
   */
  get length () {
    return this.byteLength
  }

  /**
   * Converts this `Buffer` instance to a string with an optional
   * encoding
   * @param {string} [encoding]
   */
  toString (encoding = 'utf8') {
    return toString(this, encoding)
  }

  /**
   * Converts this `Buffer` class to a JSON object.
   */
  toJSON () {
    return {
      type: 'Buffer',
      data: Array.from(this)
    }
  }
}

TypedArrayPrototypeSet.add(Buffer.prototype)

export default Buffer
