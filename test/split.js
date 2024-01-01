import { MAX_SHARES } from '../constants.js'
import { isBufferLike } from '../buffer.js'
import split from '../split.js'

export default async function (test) {
  test('split(secret, opts) is a function', (t) => {
    t.ok('function' === typeof split)
  })

  test('split(secret, opts) throws on bad input', (t) => {
    // @ts-ignore
    t.throws(() => split(null), TypeError)
    // @ts-ignore
    t.throws(() => split(), TypeError)
    // @ts-ignore
    t.throws(() => split(123), TypeError)
    // @ts-ignore
    t.throws(() => split(''), TypeError)
    // @ts-ignore
    t.throws(() => split(Buffer.from('')), TypeError)

    // valid secret inputs
    const secret1 = Buffer.from('secret')
    const secret2 = 'secret'

    // @ts-ignore
    t.throws(() => split(secret1), TypeError)
    // @ts-ignore
    t.throws(() => split(secret1, ''), TypeError)
    // @ts-ignore
    t.throws(() => split(secret1, null), TypeError)
    // @ts-ignore
    t.throws(() => split(secret1, 1234), TypeError)
    // @ts-ignore
    t.throws(() => split(secret1, false), TypeError)
    // @ts-ignore
    t.throws(() => split(secret1, () => { }), TypeError)
    // @ts-ignore
    t.throws(() => split(secret1, { shares: '' }), TypeError)
    // @ts-ignore
    t.throws(() => split(secret1, { shares: {} }), TypeError)
    // @ts-ignore
    t.throws(() => split(secret1, { shares: true }), TypeError)

    // @ts-ignore
    t.throws(() => split(secret1, { shares: 0 }), RangeError)
    // @ts-ignore
    t.throws(() => split(secret1, { shares: -1 }), RangeError)
    // @ts-ignore
    t.throws(() => split(secret1, { shares: NaN }), RangeError)
    // @ts-ignore
    t.throws(() => split(secret1, { shares: MAX_SHARES + 1 }), RangeError)

    // @ts-ignore
    t.throws(() => split(secret1, { shares: 1, threshold: '' }), TypeError)
    // @ts-ignore
    t.throws(() => split(secret1, { shares: 1, threshold: {} }), TypeError)
    // @ts-ignore
    t.throws(() => split(secret1, { shares: 1, threshold: true }), TypeError)
    t.throws(() => split(secret1, { shares: 1, threshold: 0 }), RangeError)
    t.throws(() => split(secret1, { shares: 1, threshold: 2 }), RangeError)
    t.throws(() => split(secret1, { shares: 1, threshold: -1 }), RangeError)
    t.throws(() => split(secret1, { shares: 1, threshold: NaN }), RangeError)

    // @ts-ignore
    t.throws(() => split(secret2), TypeError)
    // @ts-ignore
    t.throws(() => split(secret2, ''), TypeError)
    // @ts-ignore
    t.throws(() => split(secret2, null), TypeError)
    // @ts-ignore
    t.throws(() => split(secret2, 1234), TypeError)
    // @ts-ignore
    t.throws(() => split(secret2, false), TypeError)
    // @ts-ignore
    t.throws(() => split(secret2, () => { }), TypeError)
    // @ts-ignore
    t.throws(() => split(secret2, { shares: 0 }), RangeError)
    // @ts-ignore
    t.throws(() => split(secret2, { shares: '' }), TypeError)
    // @ts-ignore
    t.throws(() => split(secret2, { shares: {} }), TypeError)
    // @ts-ignore
    t.throws(() => split(secret2, { shares: -1 }), RangeError)
    // @ts-ignore
    t.throws(() => split(secret2, { shares: NaN }), RangeError)
    // @ts-ignore
    t.throws(() => split(secret2, { shares: true }), TypeError)
    // @ts-ignore
    t.throws(() => split(secret2, { shares: MAX_SHARES + 1 }), RangeError)
    // @ts-ignore
    t.throws(() => split(secret2, { shares: 1, threshold: '' }), TypeError)
    // @ts-ignore
    t.throws(() => split(secret2, { shares: 1, threshold: {} }), TypeError)
    // @ts-ignore
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

    t.ok(Array.isArray(shares))
    t.ok(n === shares.length)
    t.ok(shares.every(isBufferLike))
  })

  test('split(secret, opts) simple with buffer', (t) => {
    const threshold = 3
    const n = 5
    const secret = Buffer.from('secret')
    const shares = split(secret, { shares: n, threshold })

    t.ok(Array.isArray(shares))
    t.ok(n === shares.length)
    t.ok(shares.every(isBufferLike))
  })
}
