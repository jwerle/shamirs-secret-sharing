const { horner } = require('./horner')

function points(a0, opts) {
  const prng = opts.random
  const a = [ a0 ] // p(0) = a0 = secret
  const p = []
  const t = opts.threshold
  const n = opts.shares

  for (let i = 1; i < t; ++i) {
    a[i] = parseInt(prng(1).toString('hex'), 16)
  }

  for (let i = 1; i < 1 + n; ++i) {
    p[i - 1] = {
      x: i,
      y: horner(i, a)
    }
  }

  return p
}

module.exports = {
  points
}
