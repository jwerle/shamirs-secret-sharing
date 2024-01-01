import { Buffer, isBufferLike } from './buffer.js'
import { zeroes } from './table.js'

import {
  BYTES_PER_CHARACTER,
  UTF8_ENCODING,
  BIN_ENCODING,
  BIT_COUNT,
  BIT_SIZE,
} from './constants.js'

/**
 * @typedef {import('./buffer.js').BufferLike} BufferLike
 */

/**
 * Pads an input `string` with `multiple` zeroes. If `multiple` is not given,
 * then `constants.BIT_COUNT` is used by default.
 * @param {string|BufferLike} input
 * @param {number} [multiple]
 * @return {string}
 */
export function pad (input, multiple = BIT_COUNT) {
  const string = Buffer.from(input).toString()

  if (multiple === 0) {
    return string
  } else if (!multiple) {
    multiple = BIT_COUNT
  }

  const missing = string
    ? string.length % multiple
    : 0

  if (missing) {
    const offset = -1 * ((multiple - missing) + string.length)
    return (zeroes + string).slice(offset)
  }

  return string
}

/**
 * Encodes input string or TypedArray as a hex string.
 * @param {string|BufferLike} input
 * @param {string} [encoding]
 * @return {string}
 */
export function hex (input, encoding = UTF8_ENCODING) {
  const padding = 2 * BYTES_PER_CHARACTER

  if (!encoding) {
    encoding = UTF8_ENCODING
  }

  if (typeof input === 'string') {
    return fromString(/** @type {string} */ (input))
  }

  if (isBufferLike(input)) {
    return fromBuffer(Buffer.from(/** @type {BufferLike} */ (input)))
  }

  throw new TypeError('Expecting a string or buffer as input.')

  function fromString (string) {
    const chunks = /** @type {string[]} */ ([])

    if (UTF8_ENCODING === encoding) {
      for (let i = 0; i < /** @type {string} */ (string).length; ++i) {
        const chunk = String.fromCharCode(string[i].toString(16))
        const padded = pad(chunk, padding)
        // @ts-ignore
        chunks.unshift(padded)
      }
    }

    if (BIN_ENCODING === encoding) {
      string = pad(input, 4)

      for (let i = string.length; i >= 4; i -= 4) {
        const bits = string.slice(i - 4, i)
        const chunk = parseInt(bits, 2).toString(16)
        // @ts-ignore
        chunks.unshift(chunk)
      }
    }

    return chunks.join('')
  }

  function fromBuffer (buffer) {
    const chunks = []

    for (let i = 0; i < buffer.length; ++i) {
      const chunk = buffer[i].toString(16)
      const padded = pad(chunk, padding)
      // @ts-ignore
      chunks.unshift(padded)
    }

    return chunks.join('')
  }
}

/**
 * Encodes `input` as a binary string. An optional `radix` value that defaults
 * to `16` can be used to indicate the chunk type in an `input` string.
 * @param {string|BufferLike} input
 * @param {number} [radix = 16]
 * @return {string}
 */
export function bin (input, radix = 16) {
  const chunks = []

  if (!radix) {
    radix = 16
  }

  const byteLength = Buffer.byteLength(input)

  for (let i = byteLength - 1; i >= 0; --i) {
    let chunk

    if (isBufferLike(input)) {
      chunk = input[i]
    }

    if (typeof input === 'string') {
      chunk = parseInt(input[i], radix)
    }

    if (Array.isArray(input)) {
      chunk = input[i]

      if (typeof chunk === 'string') {
        chunk = parseInt(chunk, radix)
      }
    }

    if (chunk === undefined) {
      throw new TypeError('Unsupported type for chunk in input.')
    }

    const padded = pad(chunk.toString(2), 4)
    // @ts-ignore
    chunks.unshift(padded)
  }

  return chunks.join('')
}

/**
 * Encodes input `id` and `data` vector as a `Buffer`
 * @param {string|number|BufferLike} id
 * @param {string|BufferLike} data
 * @return {Buffer}
 */
export function encode (id, data) {
  id = typeof id === 'number'
    ? id
    : /** @type {number} */ (parseInt(Buffer.from(id).toString(), 16))

  const padding = (BIT_SIZE - 1).toString(16).length
  const header = Buffer.concat([
    // `BIT_COUNT` is stored as a base36 value, which in this case is the literal '8'
    Buffer.from(BIT_COUNT.toString(36).toUpperCase()), // 8
    Buffer.from(pad(id.toString(16), padding))
  ])

  if (!isBufferLike(data)) {
    data = Buffer.from(data)
  }

  return Buffer.concat([header, data])
}

/**
 * Decodes `input` previously encoded with `encoded` and returns the
 * `data` part
 * @param {string|BufferLike} input
 * @param {string} [encoding = 'utf8']
 * @return {Buffer}
 */
export function decode (input, encoding = 'utf8') {
  const padding = 2 * BYTES_PER_CHARACTER
  const string = pad(Buffer.from(input).toString(encoding), padding)
  const offset = padding
  const chunks = []

  for (let i = 0; i < string.length; i += offset) {
    const bits = string.slice(i, i + offset)
    const chunk = parseInt(bits, 16)
    // @ts-ignore
    chunks.unshift(chunk)
  }

  return Buffer.from(chunks)
}

/**
 * Splits an `input` into paged byte chunks where an optional `padding`
 * is applied. Chunks are parsed integers of `radix` (default: 2).
 * @param {string|BufferLike} input
 * @param {number} [padding = 0]
 * @param {number} [radix = 2]
 * @return {number[]}
 */
export function split (input, padding = 0, radix = 2) {
  const chunks = []
  const string = pad(Buffer.from(input).toString(), padding)
  let i = 0

  for (i = string.length; i > BIT_COUNT; i -= BIT_COUNT) {
    const bits = string.slice(i  - BIT_COUNT, i)
    const chunk = parseInt(bits, radix)
    // @ts-ignore
    chunks.push(chunk)
  }

  // @ts-ignore
  chunks.push(parseInt(string.slice(0, i), radix))

  return chunks
}

export default {
  bin,
  decode,
  encode,
  hex,
  pad,
  split
}
