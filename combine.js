const { BIN_ENCODING } = require('./constants')
const { lagrange } = require('./lagrange')
const { parse } = require('./share')
const codec = require('./codec')

/**
 * Reconstruct a secret from a distinct set of shares.
 * @public
 * @param {Array<String|Buffer>} shares
 * @return {Buffer}
 */
function combine(shares) {
  const chunks = []
  const x = []
  const y = []
  const t = shares.length

  for (let i = 0; i < t; ++i) {
    const share = parse(shares[i])

    if (-1 === x.indexOf(share.id)) {
      x.push(share.id)

      const bin = codec.bin(share.data, 16)
      const parts = codec.split(bin, 0, 2)

      for (let j = 0; j < parts.length; ++j) {
        if (!y[j]) { y[j] = [] }
        y[j][x.length - 1] = parts[j]
      }
    }
  }

  for (let i = 0; i < y.length; ++i) {
    const p = lagrange(0, [x, y[i]])
    chunks.unshift(codec.pad(p.toString(2)))
  }

  const string = chunks.join('')
  const bin = string.slice(1 + string.indexOf('1')) // >= 0
  const hex = codec.hex(bin, BIN_ENCODING)
  const value = codec.decode(hex)

  return Buffer.from(value)
}

module.exports = {
  combine
}
