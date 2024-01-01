import runner from '../runner.js'
// @ts-ignore
import assert from 'node:assert'
// @ts-ignore
import test from 'node:test'

export default runner(async function (name, callback) {
  await test(name, async (t) => {
    t.ok = assert.ok
    t.equal = assert.equal
    t.equals = assert.equal
    t.notEqual = assert.notEqual
    t.notOk = (c, ...args) => assert(!c, ...args)
    t.throws = assert.throws
    t.fail = assert.fail
    const result = callback(t)
    if (result && result instanceof Promise) {
      await result
    }
  })
})
