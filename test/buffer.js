import Buffer from '../buffer.js'

export default async function (test) {
  test('Buffer.alloc', (t) => {
    t.equal(Buffer.alloc(0).byteLength, 0)
    t.equal(Buffer.alloc(123).byteLength, 123)
    t.throws(() => Buffer.alloc(-1))
  })

  test('Buffer.byteLength', (t) => {
    // @ts-ignore
    t.equal(Buffer.byteLength(0), 0, 'Buffer.byteLength(0) === 0')
    // @ts-ignore
    t.equal(Buffer.byteLength(null), 0, 'Buffer.byteLength(null) === 0')
    // @ts-ignore
    t.equal(Buffer.byteLength({}), 0, 'Buffer.byteLength({}) === 0')
    t.equal(Buffer.byteLength([]), 0, 'Buffer.byteLength([]) === 0')
    t.equal(Buffer.byteLength(['foo']), 0, 'Buffer.byteLength([\'foo\']) === 0')
    t.equal(Buffer.byteLength([0, 1]), 2, 'Buffer.byteLength([0, 1]) === 2')
    t.equal(Buffer.byteLength(new ArrayBuffer(2)), 2, 'Buffer.byteLength(new ArrayBuffer(2) === 2')
  })

  test('Buffer.compare', (t) => {
    const a = Buffer.from('hello')
    const b = Buffer.from('776f726c64', 'hex')
    t.equal(Buffer.compare(a, b), -1, 'Buffer.compare(a, b) === -1')
    t.equal(Buffer.compare(b, a), 1, 'Buffer.compare(b, a) === 1')
    t.equal(Buffer.compare(a, a), 0, 'Buffer.compare(a, a) === 0')
    t.equal(Buffer.compare(b, b), 0, 'Buffer.compare(b, b) === 0')
  })

  test('Buffer.from', (t) => {
    const a = Buffer.from('hello')
    const b = Buffer.from('776f726c64', 'hex')
    t.equal(a.byteLength, 5)
    t.equal(b.byteLength, 5)
  })

  test('Buffer.concat', (t) => {
    const a = Buffer.from('hello')
    const b = Buffer.from('776f726c64', 'hex')
    const c = Buffer.concat(a, b)
    t.equal(c.toString(), 'helloworld', 'Buffer.concat(a, b) === \'helloworld\'')
  })

  test('Buffer.isBuffer', (t) => {
    t.ok(Buffer.isBuffer(new Uint8Array(32)))
    t.ok(Buffer.isBuffer(Buffer.alloc(32)))
    t.ok(Buffer.isBuffer(new TextEncoder().encode('foo')))
  })

  test('Buffer.toString', (t) => {
    const a = Buffer.from('hello')
    const b = Buffer.from('776f726c64', 'hex')
    t.equal(a.toString(), 'hello')
    t.equal(b.toString(), 'world')
  })

  test('Buffer.random', (t) => {
    t.equal(Buffer.random(32).byteLength, 32)
    t.equal(Buffer.random(64).byteLength, 64)
    t.throws(() => Buffer.random(-1))
    t.throws(() => Buffer.random(0))
  })
}
