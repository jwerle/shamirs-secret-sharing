import Buffer from '../../buffer.js'
import runner from '../runner.js'
// @ts-ignore
import test from 'socket:test'

// patch globalThis Buffer
globalThis.Buffer = Buffer

export default runner(async function (name, callback) {
  await test(name, async (t) => {
    const throws = t.throws.bind(t)
    t.throws = async (fn, expected, message) => {
      if (typeof expected === 'function') {
        try {
          await fn()
        } catch (err) {
          if (err.constructor === expected) {
            throws(() => { throw err }, null, message || `throws ${err.constructor.name}`)
          } else {
            throws(() => { throw err }, expected, message || `throws ${err.constructor.name}`)
          }
        }
      } else {
        throws(fn, expected, message)
      }
    }

    const result = callback(t)
    if (result && result instanceof Promise) {
      await result
    }
  })
})
