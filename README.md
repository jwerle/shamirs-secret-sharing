shamirs-secret-sharing
======================

A simple implementation of Shamir's Secret Sharing configured to use a
finite field in GF(2^8) with 128 bit padding.

## Preface

Much of what you see in this module has been ported from or
directly influenced by
[secrets.js](https://github.com/grempe/secrets.js),
[c-sss](https://github.com/fletcher/c-sss), and
[libgfshare](https://launchpad.net/libgfshare)

## Installation

```sh
$ npm install shamirs-secret-sharing
```

## Example Usage (Node.js)

```js
import sss from 'shamirs-secret-sharing'

const secret = Buffer.from('secret key')
const shares = sss.split(secret, { shares: 10, threshold: 4 })
const recovered = sss.combine(shares.slice(3, 7))

console.log(recovered.toString()) // 'secret key'
```

## Example Usage ([Socket Runtime](https://github.com/socketsupply/socket))

Configure the `[build.copy-map]` section in `socket.ini`:

```ini
[build.copy-map]
node_modules/shamirs-secret-sharing = shares-secret-sharing
```

```js
import Buffer form 'socket:buffer'
import combine from '/shares-secret-sharing/combine.js'
import split from '/shares-secret-sharing/split.js'

const secret = Buffer.from('secret key')
const shares = sss.split(secret, { shares: 10, threshold: 4 })
const recovered = sss.combine(shares.slice(3, 7))

console.log(recovered.toString()) // 'secret key'
```

## API

### `shares = sss.split(secret, opts)`

Generate a set of unique and distinct shares for a secret with a
configured threshold.

* `secret` (**required**) - A `Buffer` instance or `string` that represents a
  secret for which shares are created for
* `opts` (**required**) - An object of options for configuring how
  shares are created for a secret
  * `opts.shares` (**required**) - The number of `n` shares that should
    be created for this secret
  * `opts.threshold` (**required**) - The number of `t` of `n` distinct share
    that are required to reconstruct this secret
  * `opts.random` (*optional*) - An optional _Pseudorandom number
    generator_ (PRNG) function that should generate a random value
    buffer based on some input. e.g `opts.random = (size) =>
    randomBytes(size)`

### `secret = sss.combine(shares)`

Reconstruct a secret from a distinct set of shares. This function _will
not_ throw an error for incorrect shares or if `p(0)` is not the correct
secret for the given shares.

* `shares` (**required**) - An array of shares, that is an array of
  equally sized and distinct `Buffer` instances, or _strings_

## See Also

* https://en.wikipedia.org/wiki/Shamir%27s_Secret_Sharing
* https://en.wikipedia.org/wiki/Secret_sharing
* https://en.wikipedia.org/wiki/Lagrange_polynomial
* https://en.wikipedia.org/wiki/Horner%27s_method
* https://en.wikipedia.org/wiki/Pseudorandom_number_generator
* https://codesandbox.io/s/shamirs-secret-sharing-pcsbk

## License

MIT
