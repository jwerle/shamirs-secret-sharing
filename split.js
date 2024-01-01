import { BIN_ENCODING, BIT_PADDING, MAX_SHARES, } from './constants.js'
import { exps, logs } from './table.js'
import Buffer from './buffer.js'
import codec from './codec.js'

/**
 * @typedef {import('./buffer.js').BufferLike} BufferLike
 */

/**
 * @typedef {{ x: number, y: number }} Point
 * @typedef {{
 *   random: function(number): Buffer,
 *   threshold: number,
 *   shares: number
 * }} ComputePointsOptions
 */

/**
 * @typedef {{
 *   random?: function(number): Buffer,
 *   threshold: number,
 *   shares: number
 * }} SplitOptions
 */

// n = MAX_SHARES
// x = 0 ... n
// y = n ... 2n
const scratch = new Array(2 * MAX_SHARES)

/**
 * Performs polynomial evaluation using the Horner Method for a given `x` term
 * and a setup of polynomial `a`
 * @param {number} x
 * @param {number[]} a
 * @return {number}
 */
export function horner (x, a) {
  const n = MAX_SHARES
  const t = a.length - 1
  let b = 0

  for (let i = t; i >= 0; --i) {
    b = 0 === b ? a[i] : exps[(logs[x] + logs[b]) % n] ^ a[i]
  }

  return b
}

/**
 * Generates variable terms for a polynomial
 * @param {number} a0
 * @param {ComputePointsOptions} options
 * @return {Point[]}
 */
export function computePoints (a0, options) {
  const prng = options.random
  const a = [ a0 ] // p(0) = a0 = secret
  const p = []
  const t = options.threshold
  const n = options.shares

  for (let i = 1; i < t; ++i) {
    a[i] = parseInt(prng(1).toString('hex'), 16)
  }

  for (let i = 1; i < 1 + n; ++i) {
    // @ts-ignore
    p[i - 1] = {
      x: i,
      y: horner(i, a)
    }
  }

  return p
}

/**
 * Split a secret into a set of distinct shares with a configured threshold
 * of shares needed for construction.
 * @public
 * @param {string|BufferLike} input
 * @param {SplitOptions} options
 * @returns {Array<Buffer>}
 * @throws TypeError
 * @throws RangeError
 */
export function split (input, options) {
  if (!input) {
    throw new TypeError('An input secret must be provided')
  }

  const secret = Buffer.from(input)

  if (secret.byteLength === 0) {
    throw new TypeError('Secret cannot be empty')
  }

  if (!options || typeof options !== 'object') {
    throw new TypeError('Expecting options to be an object.')
  }

  if ('shares' in options && typeof options.shares !== 'number') {
    throw new TypeError('Expecting shares to be a number.')
  }

  if ('threshold' in options && typeof options.threshold !== 'number') {
    throw new TypeError('Expecting threshold to be a number.')
  }

  if (
    !Number.isFinite(options.shares) ||
    !Number.isInteger(options.shares) ||
    !Number.isSafeInteger(options.shares)
  ) {
    throw new RangeError('Expecting shares to be a positive integer')
  }

  if (
    !Number.isFinite(options.threshold) ||
    !Number.isInteger(options.threshold) ||
    !Number.isSafeInteger(options.threshold)
  ) {
    throw new RangeError('Expecting threshold to be a positive integer')
  }

  if (options.shares <= 0 || options.shares > MAX_SHARES) {
    throw new RangeError(`Shares must be 0 < shares <= ${MAX_SHARES}.`)
  }

  if (options.threshold <= 0 || options.threshold > options.shares) {
    throw new RangeError(`Threshold must be 0 < threshold <= ${options.shares}.`)
  }

  if (options.random !== null && options.random !== undefined) {
    throw new TypeError('Expecting random to be a function')
  }

  if (typeof options.random !== 'function') {
    options.random = Buffer.random
  }

  const hex = codec.hex(secret)
  const bin = codec.bin(hex, 16)
  // prepend 1 to get extra padding, we'll account for this later
  const parts = codec.split('1' + bin, BIT_PADDING, 2)

  for (let i = 0; i < parts.length; ++i) {
    const p = computePoints(parts[i], {
      shares: options.shares,
      threshold: options.threshold,
      random: options.random
    })

    for (let j = 0; j < options.shares; ++j) {

      if (!scratch[j]) {
        // @ts-ignore
        scratch[j] = p[j].x.toString(16)
      }

      // @ts-ignore
      const z = p[j].y.toString(2)
      const y = scratch[j + MAX_SHARES] || ''

      // y[j] = p[j][y] + y[j]
      scratch[j + MAX_SHARES] = codec.pad(z) + y
    }
  }

  for (let i = 0; i < options.shares; ++i) {
    const x = scratch[i]
    const y = codec.hex(scratch[i + MAX_SHARES], BIN_ENCODING)
    scratch[i] = codec.encode(x, y)
    scratch[i] = Buffer.from('0' + scratch[i], 'hex')
  }

  const result = scratch.slice(0, options.shares)
  scratch.fill(0)
  return result
}

export default split
