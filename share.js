const { BIT_COUNT, BIT_SIZE } = require('./constants')

function parse(input) {
  const share = { id: null, bits: null, data: null }

  if (Buffer.isBuffer(input)) {
    input = input.toString('hex')
  }

  if ('0' === input[0]) {
    input = input.slice(1)
  }

  // bit count is in base36
  share.bits = parseInt(input.slice(0, 1), 36)
  const maxBits = BIT_SIZE - 1
  const idLength = maxBits.toString(16).length
  const regex = `^([a-kA-K3-9]{1})([a-fA-F0-9]{${idLength}})([a-fA-F0-9]+)$`
  const matches = new RegExp(regex).exec(input)

  if (matches && matches.length) {
    share.id = parseInt(matches[2], 16)
    share.data = matches[3]
  }

  return share
}

module.exports = {
  parse
}
