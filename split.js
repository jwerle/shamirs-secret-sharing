const { lagrange } = require('./lagrange')
const { horner } = require('./horner')
const { points } = require('./points')
const { random } = require('./random')
const codec = require('./codec')

const {
  BIN_ENCODING,
  BIT_PADDING,
  MAX_SHARES,
} = require('./constants')

// n = MAX_SHARES
// x = 0 ... n
// y = n ... 2n
const scratch = new Array(2 * MAX_SHARES)

/**
 * Split a secret into a set of distinct shares with a configured threshold
 * of shares needed for construction.
 * @public
 * @param {String|Buffer} secret
 * @param {Object} opts
 * @param {Object} opts.shares
 * @param {Object} opts.threshold
 * @param {?(Function)} opts.random
 * @returns {Array<Buffer>}
 * @throws TypeError
 * @throws RangeError
 */
function split(secret, opts) {
  if (!secret || (secret && 0 === secret.length)) {
    throw new TypeError('Secret cannot be empty.')
  }

  if ('string' === typeof secret) {
    secret = Buffer.from(secret)
  }

  if (false === Buffer.isBuffer(secret)) {
    throw new TypeError('Expecting secret to be a buffer.')
  }

  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting options to be an object.')
  }

  if ('number' !== typeof opts.shares) {
    throw new TypeError('Expecting shares to be a number.')
  }

  if (!opts.shares || opts.shares < 0 || opts.shares > MAX_SHARES) {
    throw new RangeError(`Shares must be 0 < shares <= ${MAX_SHARES}.`)
  }

  if ('number' !== typeof opts.threshold) {
    throw new TypeError('Expecting threshold to be a number.')
  }

  if (!opts.threshold || opts.threshold < 0 || opts.threshold > opts.shares) {
    throw new RangeError(`Threshold must be 0 < threshold <= ${opts.shares}.`)
  }

  if (!opts.random || 'function' !== typeof opts.random) {
    opts.random = random
  }

  const hex = codec.hex(secret)
  const bin = codec.bin(hex, 16)
  // prepend 1 to get extra padding, we'll account for this later
  const parts = codec.split('1' + bin, BIT_PADDING, 2)

  for (let i = 0; i < parts.length; ++i) {
    const p = points(parts[i], opts)
    for (let j = 0; j < opts.shares; ++j) {

      if (!scratch[j]) {
        scratch[j] = p[j].x.toString(16)
      }

      const z = p[j].y.toString(2)
      const y = scratch[j + MAX_SHARES] || ''

      // y[j] = p[j][y] + y[j]
      scratch[j + MAX_SHARES] = codec.pad(z) + y
    }
  }

  for (let i = 0; i < opts.shares; ++i) {
    const x = scratch[i]
    const y = codec.hex(scratch[i + MAX_SHARES], BIN_ENCODING)
    scratch[i] = codec.encode(x, y)
    scratch[i] = Buffer.from('0' + scratch[i], 'hex')
  }

  const result = scratch.slice(0, opts.shares)
  scratch.fill(0)
  return result
}

module.exports = {
  split
}
