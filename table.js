const {
  PRIMITIVE_POLYNOMIAL,
  MAX_SHARES,
  BIT_SIZE,
} = require('./constants')

const zeroes = new Array(4 * BIT_SIZE).join('0')
const logs = new Array(BIT_SIZE).fill(0)
const exps = new Array(BIT_SIZE).fill(0)

for (let i = 0, x = 1; i < BIT_SIZE; ++i) {
  exps[i] = x
  logs[x] = i
  x = x << 1
  if (x >= BIT_SIZE) {
    x = x ^ PRIMITIVE_POLYNOMIAL
    x = x & MAX_SHARES
  }
}

module.exports = {
  zeroes,
  logs,
  exps,
}
