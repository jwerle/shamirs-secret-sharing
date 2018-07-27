const { logs, exps, max } = require('./table')

const { MAX_SHARES } = require('./constants')

function lagrange(x, p) {
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

module.exports = {
  lagrange
}
