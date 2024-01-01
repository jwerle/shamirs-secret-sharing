import { BIN_ENCODING, BIT_SIZE, MAX_SHARES } from './constants.js'
import { Buffer, isBufferLike } from './buffer.js'
import { logs, exps } from './table.js'
import codec from './codec.js'

export const MAX_BITS = BIT_SIZE - 1

/**
 * @typedef {{ id?: number, bits?: number, data?: string }} ShareData
 * @typedef {import('./buffer.js').BufferLike} BufferLike
 */

export class Share {
  id = 0
  bits = 0
  data = ''

  /**
   * Creates a `Share` object from a variety of input
   * @param {ShareData|number|string} [id]
   * @param {?number} [bits = 0]
   * @param {?string} [data = null]
   */
  static from (id = 0, bits = 0, data = null) {
    if (id !== null && typeof id === 'object') {
      const share = /** @type {ShareData} */ (id)
      // @ts-ignore
      return new this(share.id, share.bits || bits, share.data || data)
    }

    return new this(id || 0, bits || 0, data)
  }

  /**
   * `Share` class constructor.
   * @param {string|number} [id]
   * @param {string|number} [bits]
   * @param {?string} [data]
   */
  constructor (id = 0, bits = 0, data = null) {
    this.id = typeof id === 'number' ? id : parseInt(id, 16)
    this.bits = typeof bits === 'number' ? bits : parseInt(bits, 36)
    this.data = typeof data === 'string' ? data : ''
  }
}

/**
 * Parsed `input` string or buffer into a `Share` object.
 * @param {string|BufferLike} input
 * @return {Share}
 */
export function parse (input) {
  const share = new Share()
  const string = isBufferLike(input)
    ? Buffer.from(input).toString('hex')
    : input

  const normalized = string[0] === '0'
    ? string.slice(1)
    : string

  // bit count is in base36
  share.bits = parseInt(normalized.slice(0, 1), 36)
  const idLength = MAX_BITS.toString(16).length
  const regex = `^([a-kA-K3-9]{1})([a-fA-F0-9]{${idLength}})([a-fA-F0-9]+)$`
  const matches = new RegExp(regex).exec(normalized)

  if (matches && matches.length) {
    share.id = parseInt(matches[2], 16)
    share.data = matches[3]
  }

  return share
}

/**
 * Computes the lagrange interoplation aof `x` for node points `p`
 * @param {number} x
 * @param {number[][]} p
 * @return {number}
 */
export function lagrange (x, p) {
  const n = MAX_SHARES
  let product = 0
  let sum = 0

  for (let i = 0; i < p[0].length; ++i) {
    if (p[1][i]) {
      product = logs[p[1][i]]

      for (let j = 0; j < p[0].length; ++j) {
        // m != j
        if (i !== j) {
          if (x === p[0][j]) {
            product = -1
            break
          }

          const a = logs[x ^ p[0][j]] - logs[p[0][i] ^ p[0][j]]
          product = (product + a + n) % n
        }
      }

      sum = -1 === sum ? sum : sum ^ exps[product]
    }
  }

  return sum
}

/**
 * Reconstruct a secret from a distinct set of shares.
 * @public
 * @param {string[]|BufferLike[]} shares
 * @return {Buffer}
 */
export function combine (shares) {
  const chunks = []
  const x = []
  const y = []
  const t = shares.length

  for (let i = 0; i < t; ++i) {
    const share = parse(shares[i])

    // @ts-ignore
    if (x.indexOf(share.id) === -1) {
      // @ts-ignore
      x.push(share.id)

      const bin = codec.bin(share.data, 16)
      const parts = codec.split(bin, 0, 2)

      for (let j = 0; j < parts.length; ++j) {
        if (!y[j]) {
          // @ts-ignore
          y[j] = []
        }

        // @ts-ignore
        y[j][x.length - 1] = parts[j]
      }
    }
  }

  for (let i = 0; i < y.length; ++i) {
    const p = lagrange(0, [x, y[i]])
    const padded = codec.pad(p.toString(2))
    // @ts-ignore
    chunks.unshift(padded)
  }

  const string = chunks.join('')
  const bin = string.slice(1 + string.indexOf('1')) // >= 0
  const hex = codec.hex(bin, BIN_ENCODING)
  const value = codec.decode(hex)

  return Buffer.from(value)
}

export default combine
