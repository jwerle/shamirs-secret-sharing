const { split, combine } = require('../')
const codec = require('../codec')
const test = require('ava')

const { MAX_SHARES } = require('../constants')

test('split(secret, opts) is a function', (t) => {
  t.true('function' === typeof split)
})

test('combine(shares, opts) is a function', (t) => {
  t.true('function' === typeof combine)
})

test('split(secret, opts) throws on bad input', (t) => {
  t.throws(() => split(), TypeError)
  t.throws(() => split(null), TypeError)
  t.throws(() => split(123), TypeError)
  t.throws(() => split(''), TypeError)
  t.throws(() => split(Buffer.from('')), TypeError)

  // valid secret inputs
  const secret1 = Buffer.from('secret')
  const secret2 = 'secret'

  t.throws(() => split(secret1), TypeError)
  t.throws(() => split(secret1, ''), TypeError)
  t.throws(() => split(secret1, null), TypeError)
  t.throws(() => split(secret1, 1234), TypeError)
  t.throws(() => split(secret1, false), TypeError)
  t.throws(() => split(secret1, () => { }), TypeError)
  t.throws(() => split(secret1, { shares: '' }), TypeError)
  t.throws(() => split(secret1, { shares: {} }), TypeError)
  t.throws(() => split(secret1, { shares: true }), TypeError)

  t.throws(() => split(secret1, { shares: 0 }), RangeError)
  t.throws(() => split(secret1, { shares: -1 }), RangeError)
  t.throws(() => split(secret1, { shares: NaN }), RangeError)
  t.throws(() => split(secret1, { shares: MAX_SHARES + 1 }), RangeError)

  t.throws(() => split(secret1, { shares: 1, threshold: '' }), TypeError)
  t.throws(() => split(secret1, { shares: 1, threshold: {} }), TypeError)
  t.throws(() => split(secret1, { shares: 1, threshold: true }), TypeError)
  t.throws(() => split(secret1, { shares: 1, threshold: 0 }), RangeError)
  t.throws(() => split(secret1, { shares: 1, threshold: 2 }), RangeError)
  t.throws(() => split(secret1, { shares: 1, threshold: -1 }), RangeError)
  t.throws(() => split(secret1, { shares: 1, threshold: NaN }), RangeError)

  t.throws(() => split(secret2), TypeError)
  t.throws(() => split(secret2, ''), TypeError)
  t.throws(() => split(secret2, null), TypeError)
  t.throws(() => split(secret2, 1234), TypeError)
  t.throws(() => split(secret2, false), TypeError)
  t.throws(() => split(secret2, () => { }), TypeError)
  t.throws(() => split(secret2, { shares: 0 }), RangeError)
  t.throws(() => split(secret2, { shares: '' }), TypeError)
  t.throws(() => split(secret2, { shares: {} }), TypeError)
  t.throws(() => split(secret2, { shares: -1 }), RangeError)
  t.throws(() => split(secret2, { shares: NaN }), RangeError)
  t.throws(() => split(secret2, { shares: true }), TypeError)
  t.throws(() => split(secret2, { shares: MAX_SHARES + 1 }), RangeError)
  t.throws(() => split(secret2, { shares: 1, threshold: '' }), TypeError)
  t.throws(() => split(secret2, { shares: 1, threshold: {} }), TypeError)
  t.throws(() => split(secret2, { shares: 1, threshold: true }), TypeError)
  t.throws(() => split(secret2, { shares: 1, threshold: 0 }), RangeError)
  t.throws(() => split(secret2, { shares: 1, threshold: 2 }), RangeError)
  t.throws(() => split(secret2, { shares: 1, threshold: -1 }), RangeError)
  t.throws(() => split(secret2, { shares: 1, threshold: NaN }), RangeError)
})

test('split(secret, opts) simple with string', (t) => {
  const threshold = 2
  const n = 3
  const secret = 'secret'
  const shares = split(secret, { shares: n, threshold })

  t.true(Array.isArray(shares))
  t.true(n === shares.length)
  t.true(shares.every(Buffer.isBuffer))
})

test('split(secret, opts) simple with buffer', (t) => {
  const threshold = 3
  const n = 5
  const secret = Buffer.from('secret')
  const shares = split(secret, { shares: n, threshold })

  t.true(Array.isArray(shares))
  t.true(n === shares.length)
  t.true(shares.every(Buffer.isBuffer))
})

test('combine(shares) simple buffers', (t) => {
  const secret = Buffer.from('secret')
  const shares = split(secret, { shares: 3, threshold: 2 })
  const recovered = combine(shares)
  t.true(0 === Buffer.compare(recovered, secret))
})

test('combine(shares) simple with strings', (t) => {
  const secret = 'secret'
  const shares = split(secret, { shares: 3, threshold: 2 })
  const recovered = combine(shares.map(toString))

  t.true(0 === Buffer.compare(recovered, Buffer.from(secret)))

  function toString(share) {
    return share.toString('hex')
  }
})

test('compat 1', (t) => {
  const secret = Buffer.from('key')
  const shares = [
    '801a4a3ab36c3cdfb4544b9cbd8b73f5a7f',
    '802a63a4324f56b6f5c4eb27c39853a67cb',
    '8032158752f240ad2b21c14506e3ab1a555',
    '804321a970c058a5293e285780d77caa5c4',
    '8055c0555b4aa88200bd279dba2f04c88cb',
    '806916648dd60e837fe1cc66faeb2537640',
    '807dcb81758dd4603cd3a242bf73d04c3c5',
    '8085169c1fe708999b607f9f849cd6f49c2',
    '80976239d3e56d57936d634352f9a0188a8',
    '80ae9daeddec2d4ca4cce50e379d59eb1ba'
  ]

  t.true(0 === Buffer.compare(secret, combine(shares)))
})

test('compat 2', (t) => {
  const secret = Buffer.from('82585c749a3db7f73009d0d6107dd650')
  const shares = [
    '80111001e523b02029c58aceebead70329000',
    '802eeb362b5be82beae3499f09bd7f9f19b1c',
    '803d5f7e5216d716a172ebe0af46ca81684f4',
    '804e1fa5670ee4c919ffd9f8c71f32a7bfbb0',
    '8050bd6ac05ceb3eeffcbbe251932ece37657',
    '8064bb52a3db02b1962ff879d32bc56de4455',
    '8078a5f11d20cbf8d907c1d295bbda1ee900a',
    '808808ff7fae45529eb13b1e9d78faeab435f',
    '809f3b0585740fd80830c355fa501a8057733',
    '80aeca744ec715290906c995aac371ed118c2'
  ]

  t.true(0 === Buffer.compare(codec.decode(secret), combine(shares)))
})
