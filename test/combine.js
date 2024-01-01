import combine from '../combine.js'
import split from '../split.js'
import codec from '../codec.js'

export default async function (test) {
  test('combine(shares, opts) is a function', (t) => {
    t.ok('function' === typeof combine)
  })

  test('combine(shares) simple buffers', (t) => {
    const secret = Buffer.from('secret')
    const shares = split(secret, { shares: 3, threshold: 2 })
    const recovered = combine(shares)
    t.equal(Buffer.compare(recovered, secret), 0)
  })

  test('combine(shares) simple with strings', (t) => {
    const secret = 'secret'
    const shares = split(secret, { shares: 3, threshold: 2 })
    const recovered = combine(shares.map(toString))

    t.equal(Buffer.compare(recovered, Buffer.from(secret)), 0)

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

    t.equal(Buffer.compare(secret, combine(shares)), 0)
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

    t.equal(Buffer.compare(codec.decode(secret), combine(shares)), 0)
  })
}
