import codec from '../codec.js'
import constants from '../constants.js'

export default async function (test) {
  test('codec.pad', (t) => {
    t.equal(codec.pad('foo', 4), '0foo')
    t.equal(codec.pad('foo', 8), '00000foo')
    t.equal(codec.pad(Buffer.from('foo'), 16), '0000000000000foo')
    t.equal(codec.pad(Buffer.from('foo')), '0'.repeat(constants.BIT_COUNT - 3) + 'foo')
  })

  test('codec.bin', (t) => {
    t.equal(codec.bin(Buffer.from('hello').toString('hex')), '0110100001100101011011000110110001101111')
    t.equal(codec.bin(Buffer.from('world').toString('hex')), '0111011101101111011100100110110001100100')
    t.equal(codec.bin(Buffer.from('helloworld').toString('hex')), '01101000011001010110110001101100011011110111011101101111011100100110110001100100')
  })

  test('codec.encode', (t) => {
  })

  test('codec.decode', (t) => {
  })

  test('codec.split', (t) => {
  })
}
