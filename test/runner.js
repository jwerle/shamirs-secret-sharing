import constants from './constants.js'
import combine from './combine.js'
import buffer from './buffer.js'
import codec from './codec.js'
import split from './split.js'

// top level module
import sss from '../index.js'

/**
 * TestFunction
 * @typedef {function (string, function (object): any): any} TestFunction
 */

/**
 * @param {TestFunction} test
 * @return {Promise}
 */
export default async function runner (test) {
  test('shamirs-secret-sharing - top level', (t) => {
    t.ok(typeof sss.Buffer === 'function', 'sss.Buffer')
    t.ok(typeof sss.combine === 'function', 'sss.combine')
    t.ok(typeof sss.constants === 'object', 'sss.constants')
    t.ok(typeof sss.split === 'function', 'sss.split')
  })

  await buffer(test)
  await codec(test)
  await combine(test)
  await constants(test)
  await split(test)
}
