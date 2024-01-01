var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from2, except, desc) => {
  if (from2 && typeof from2 === "object" || typeof from2 === "function") {
    for (let key of __getOwnPropNames(from2))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from2[key], enumerable: !(desc = __getOwnPropDesc(from2, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// index.js
var shamirs_secret_sharing_exports = {};
__export(shamirs_secret_sharing_exports, {
  Buffer: () => buffer_default,
  VERSION: () => VERSION,
  combine: () => combine_default,
  constants: () => constants_default,
  default: () => shamirs_secret_sharing_default,
  split: () => split_default
});
module.exports = __toCommonJS(shamirs_secret_sharing_exports);

// constants.js
var PRIMITIVE_POLYNOMIAL = 29;
var BIT_PADDING = 128;
var BIT_COUNT = 8;
var BIT_SIZE = 2 ** BIT_COUNT;
var BYTES_PER_CHARACTER = 2;
var MAX_BYTES_PER_CHARACTER = 6;
var MAX_SHARES = BIT_SIZE - 1;
var UTF8_ENCODING = "utf8";
var BIN_ENCODING = "binary";
var HEX_ENCODING = "hex";
var constants_default = {
  PRIMITIVE_POLYNOMIAL,
  BIT_PADDING,
  BIT_COUNT,
  BIT_SIZE,
  MAX_SHARES,
  MAX_BYTES_PER_CHARACTER,
  BYTES_PER_CHARACTER,
  UTF8_ENCODING,
  BIN_ENCODING,
  HEX_ENCODING
};

// buffer.js
var textEncoder = new TextEncoder();
var textDecoder = new TextDecoder();
var ALPHA16_CHARS = "0123456789abcdef";
var ALPHA16_ARRAY_TABLE = new Array(256);
for (let i = 0; i < 16; ++i) {
  const i16 = i * 16;
  for (let j = 0; j < 16; ++j) {
    ALPHA16_ARRAY_TABLE[i16 + j] = ALPHA16_CHARS[i] + ALPHA16_CHARS[j];
  }
}
var RANDOM_BYTES_QUOTA = 64 * 1024;
var TypedArrayPrototypeSet = /* @__PURE__ */ new Set([
  Int8Array.prototype,
  Int16Array.prototype,
  Int32Array.prototype,
  BigInt64Array.prototype,
  Uint8Array.prototype,
  Uint16Array.prototype,
  Uint32Array.prototype,
  BigUint64Array.prototype,
  Float32Array.prototype,
  Float64Array.prototype
]);
function alloc(byteLength) {
  if (byteLength < 0 || !Number.isFinite(byteLength) || !Number.isSafeInteger(byteLength)) {
    throw new RangeError(
      `The argument 'byteLength' is invalid: Received ${byteLength}`
    );
  }
  return new Buffer2(byteLength);
}
function isBufferLike(input) {
  if (!input) {
    return false;
  }
  return input instanceof ArrayBuffer || ArrayBuffer.isView(input) || Array.isArray(input) || typeof input === "object" && "length" in input && typeof input.length === "number";
}
function isTypedArray(input, TypedArray = null) {
  if (!isBufferLike(input)) {
    return false;
  }
  if (typeof TypedArray === "function") {
    if (TypedArrayPrototypeSet.has(TypedArray.prototype)) {
      const prototype2 = Object.getPrototypeOf(input);
      return prototype2 === TypedArray.prototype || TypedArray.prototype.isPrototypeOf(prototype2);
    }
  }
  const prototype = Object.getPrototypeOf(input);
  for (const TypedArrayPrototype of TypedArrayPrototypeSet) {
    if (TypedArrayPrototype === prototype || TypedArrayPrototype.isPrototypeOf(prototype)) {
      return true;
    }
  }
  return false;
}
function isArrayBuffer(input) {
  if (!input) {
    return false;
  }
  const TypeClass = (
    /** @type {object} */
    input.constructor
  );
  return TypeClass === ArrayBuffer || ArrayBuffer.prototype.isPrototypeOf(Object.getPrototypeOf(input));
}
function getByteLength(input, encoding = "utf8") {
  if (typeof input === "string") {
    if (encoding === "hex") {
      return input.length >>> 1;
    } else if (encoding === "utf8") {
      return textEncoder.encode(input).byteLength;
    } else {
      return input.length;
    }
  }
  if (!isBufferLike(input)) {
    return 0;
  }
  if ("byteLength" in /** @type {BufferLike} */
  input) {
    return input.byteLength;
  }
  if ("length" in input) {
    for (
      const element of
      /** @type {Array} */
      input
    ) {
      if (!Number.isFinite(element) || !Number.isInteger(element) || !Number.isSafeInteger(element)) {
        return 0;
      }
    }
    return input.length;
  }
  return 0;
}
function getArrayBuffer(input) {
  if (!isBufferLike(input)) {
    return null;
  }
  if (isArrayBuffer(input)) {
    return input;
  }
  if (isTypedArray(
    /** @type {TypedArray} */
    input
  )) {
    return (
      /** @type {TypedArray} */
      input.buffer
    );
  }
  if (isArrayBuffer(input.buffer)) {
    return (
      /** @type {ArrayBuffer} */
      input.buffer
    );
  }
  return null;
}
function concat(...args) {
  if (args.length === 0) {
    return null;
  }
  if (args.length === 1 && Array.isArray(args[0])) {
    return concat(...args[0]);
  }
  for (const arg of args) {
    if (!isBufferLike(arg)) {
      return null;
    }
  }
  let view;
  let buffer;
  const first = args.shift();
  if (first === void 0 || first === null) {
    return null;
  }
  const TypeClass = first.constructor;
  const totalSize = [first].concat(args).map((arg) => getByteLength(arg)).reduce((a, b) => a + b, 0);
  if (
    // handle `ArrayBuffer` or `ArrayBuffer` ancestor
    TypeClass === ArrayBuffer || ArrayBuffer.prototype.isPrototypeOf(Object.getPrototypeOf(first))
  ) {
    buffer = new /** @type {typeof ArrayBuffer} */
    TypeClass(totalSize);
    if (buffer.byteLength !== totalSize) {
      throw new TypeError("Unable to correctly allocate output buffer");
    }
    view = new Uint8Array(buffer);
  } else if (
    // handle `Array` or `Array` ancestor
    TypeClass === Array || Array.isArray(first) || Array.prototype.isPrototypeOf(Object.getPrototypeOf(first))
  ) {
    buffer = new /** @type {typeof Array} */
    TypeClass(totalSize);
    if (getByteLength(buffer) !== totalSize) {
      throw new TypeError("Unable to correctly allocate output buffer");
    }
    const arrayBuffer = getArrayBuffer(buffer);
    view = isArrayBuffer(arrayBuffer) ? new Uint8Array(
      /** @type {ArrayBuffer} */
      arrayBuffer
    ) : Uint8Array.from(buffer);
  } else if (
    // handle `TypedArray` descendants
    isTypedArray(first)
  ) {
    buffer = /** @type {TypedArray} */
    new /** @type {{ new (number) }} */
    TypeClass(totalSize);
    if (
      /** @type {TypedArray} */
      buffer.byteLength !== totalSize
    ) {
      throw new TypeError("Unable to correctly allocate output buffer");
    }
    const arrayBuffer = getArrayBuffer(buffer);
    view = new Uint8Array(
      /** @type {ArrayBuffer} */
      arrayBuffer
    );
  } else {
    buffer = new /** @type {typeof Array} */
    TypeClass(totalSize);
    if (getByteLength(buffer) !== totalSize) {
      throw new TypeError("Unable to correctly allocate output buffer");
    }
    const arrayBuffer = getArrayBuffer(buffer);
    view = isArrayBuffer(arrayBuffer) ? new Uint8Array(
      /** @type {ArrayBuffer} */
      arrayBuffer
    ) : Uint8Array.from(buffer);
  }
  const buffers = [first].concat(args);
  let offset = 0;
  while (buffers.length) {
    const arrayBuffer = getArrayBuffer(buffers.shift());
    if (!arrayBuffer) {
      throw new TypeError("Unable to determine ArrayBuffer in arguments");
    }
    const array = new Uint8Array(arrayBuffer);
    view.set(array, offset);
    offset += array.byteLength;
  }
  return buffer;
}
function create(input, byteOffset = input.byteOffset || 0, byteLength = getByteLength(input), encoding = "utf8") {
  if (typeof input === "string") {
    if (encoding === "hex") {
      byteLength = getByteLength(input, "hex");
      const buffer = new Buffer2(byteLength);
      for (let i = 0; i < input.length; ++i) {
        const offset = 2 * i;
        const byte = parseInt(input.slice(offset, offset + 2), 16);
        if (Number.isNaN(byte)) {
          break;
        }
        buffer[i] = byte;
      }
      return buffer;
    }
    if (encoding === "base64") {
      const string = globalThis.atob(input);
      const buffer = new Buffer2(string.length);
      for (let i = 0; i < string.length; ++i) {
        buffer[i] = string.charCodeAt(i);
      }
      return buffer;
    }
    return create(textEncoder.encode(input));
  }
  if (isBufferLike(input)) {
    const arrayBuffer = getArrayBuffer(input);
    if (isArrayBuffer(arrayBuffer)) {
      return new Buffer2(
        /** @type {ArrayBuffer} */
        arrayBuffer,
        input.byteOffset || byteOffset,
        byteLength
      );
    }
  }
  if (Array.isArray(input)) {
    return new Buffer2(input);
  }
  return new Buffer2(0);
}
function from(input, byteOffset, byteLength, encoding = "utf8") {
  if (typeof byteOffset === "string") {
    encoding = byteOffset;
    return create(input, 0, getByteLength(input), encoding);
  }
  return create(input, byteOffset || 0, byteLength || getByteLength(input), encoding);
}
function compare(a, b, encoding = "utf8") {
  if (a instanceof Uint8Array || Uint8Array.prototype.isPrototypeOf(Object.getPrototypeOf(a))) {
    a = from(
      a,
      /** @type {Uint8Array} */
      a.byteOffset,
      /** @type {Uint8Array} */
      a.byteLength
    );
  }
  if (b instanceof Uint8Array || Uint8Array.prototype.isPrototypeOf(Object.getPrototypeOf(b))) {
    b = from(
      b,
      /** @type {Uint8Array} */
      b.byteOffset,
      /** @type {Uint8Array} */
      b.byteLength
    );
  }
  if (typeof a === "string") {
    a = from(a, encoding);
  }
  if (typeof b === "string") {
    b = from(b, encoding);
  }
  if (!isBufferLike(a) || !isBufferLike(b)) {
    throw new TypeError(
      'Input buffers must be "buffer like"'
    );
  }
  if (a === b) {
    return 0;
  }
  if (isArrayBuffer(a)) {
    a = from(a);
  }
  if (isArrayBuffer(b)) {
    b = from(b);
  }
  let x = (
    /** @type {Uint8Array} */
    a.byteLength
  );
  let y = (
    /** @type {Uint8Array} */
    b.byteLength
  );
  for (let i = 0, length = Math.min(x, y); i < length; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }
  if (x < y) {
    return -1;
  } else if (y < x) {
    return 1;
  }
  return 0;
}
function toString(input, encoding = "utf8") {
  const buffer = from(input);
  if (encoding === "hex") {
    const output = [];
    for (let i = 0; i < buffer.byteLength; ++i) {
      output.push(ALPHA16_ARRAY_TABLE[buffer[i]]);
    }
    return output.join("");
  }
  if (encoding === "base64") {
    const output = [];
    for (let i = 0; i < buffer.byteLength; ++i) {
      output.push(String.fromCharCode(buffer[i]));
    }
    return globalThis.btoa(output.join(""));
  }
  return textDecoder.decode(buffer);
}
function randomBytes(byteLength) {
  const buffers = [];
  if (typeof globalThis.crypto?.getRandomValues !== "function") {
    throw new TypeError(
      "Missing globalThis.crypto.getRandomValues implementation"
    );
  }
  if (byteLength <= 0 || !Number.isFinite(byteLength) || !Number.isSafeInteger(byteLength)) {
    throw new RangeError(
      `The argument 'byteLength' is invalid: Received ${byteLength}`
    );
  }
  let byteLengthRemaining = byteLength;
  do {
    const byteLength2 = byteLengthRemaining > RANDOM_BYTES_QUOTA ? RANDOM_BYTES_QUOTA : byteLengthRemaining;
    const bytes = globalThis.crypto.getRandomValues(new Int8Array(byteLength2));
    const buffer = Buffer2.from(bytes);
    buffers.push(buffer);
    byteLengthRemaining = Math.max(0, byteLengthRemaining - RANDOM_BYTES_QUOTA);
  } while (byteLengthRemaining > 0);
  return Buffer2.concat(buffers);
}
var _Buffer = class extends Uint8Array {
  static get Buffer() {
    return _Buffer;
  }
  /**
   * Predicate function to deterine if `input` is a `Buffer`
   * @param {any} input
   * @return {boolean}
   */
  static isBuffer(input) {
    return isTypedArray(input, this) || isTypedArray(input, Uint8Array);
  }
  /**
   * Computed byte length
   * @type {number}
   */
  get length() {
    return this.byteLength;
  }
  /**
   * Converts this `Buffer` instance to a string with an optional
   * encoding
   * @param {string} [encoding]
   */
  toString(encoding = "utf8") {
    return toString(this, encoding);
  }
  /**
   * Converts this `Buffer` class to a JSON object.
   */
  toJSON() {
    return {
      type: "Buffer",
      data: Array.from(this)
    };
  }
};
var Buffer2 = _Buffer;
__publicField(Buffer2, "alloc", alloc);
__publicField(Buffer2, "byteLength", getByteLength);
__publicField(Buffer2, "compare", compare);
__publicField(Buffer2, "concat", concat);
__publicField(Buffer2, "from", from);
__publicField(Buffer2, "isBufferLike", isBufferLike);
__publicField(Buffer2, "random", randomBytes);
TypedArrayPrototypeSet.add(Buffer2.prototype);
var buffer_default = Buffer2;

// table.js
var zeroes = new Array(4 * BIT_SIZE).join("0");
var logs = new Array(BIT_SIZE).fill(0);
var exps = new Array(BIT_SIZE).fill(0);
for (let i = 0, x = 1; i < BIT_SIZE; ++i) {
  exps[i] = x;
  logs[x] = i;
  x = x << 1;
  if (x >= BIT_SIZE) {
    x = x ^ PRIMITIVE_POLYNOMIAL;
    x = x & MAX_SHARES;
  }
}

// codec.js
function pad(input, multiple = BIT_COUNT) {
  const string = Buffer2.from(input).toString();
  if (multiple === 0) {
    return string;
  } else if (!multiple) {
    multiple = BIT_COUNT;
  }
  const missing = string ? string.length % multiple : 0;
  if (missing) {
    const offset = -1 * (multiple - missing + string.length);
    return (zeroes + string).slice(offset);
  }
  return string;
}
function hex(input, encoding = UTF8_ENCODING) {
  const padding = 2 * BYTES_PER_CHARACTER;
  if (!encoding) {
    encoding = UTF8_ENCODING;
  }
  if (typeof input === "string") {
    return fromString(
      /** @type {string} */
      input
    );
  }
  if (isBufferLike(input)) {
    return fromBuffer(Buffer2.from(
      /** @type {BufferLike} */
      input
    ));
  }
  throw new TypeError("Expecting a string or buffer as input.");
  function fromString(string) {
    const chunks = (
      /** @type {string[]} */
      []
    );
    if (UTF8_ENCODING === encoding) {
      for (let i = 0; i < /** @type {string} */
      string.length; ++i) {
        const chunk = String.fromCharCode(string[i].toString(16));
        const padded = pad(chunk, padding);
        chunks.unshift(padded);
      }
    }
    if (BIN_ENCODING === encoding) {
      string = pad(input, 4);
      for (let i = string.length; i >= 4; i -= 4) {
        const bits = string.slice(i - 4, i);
        const chunk = parseInt(bits, 2).toString(16);
        chunks.unshift(chunk);
      }
    }
    return chunks.join("");
  }
  function fromBuffer(buffer) {
    const chunks = [];
    for (let i = 0; i < buffer.length; ++i) {
      const chunk = buffer[i].toString(16);
      const padded = pad(chunk, padding);
      chunks.unshift(padded);
    }
    return chunks.join("");
  }
}
function bin(input, radix = 16) {
  const chunks = [];
  if (!radix) {
    radix = 16;
  }
  const byteLength = Buffer2.byteLength(input);
  for (let i = byteLength - 1; i >= 0; --i) {
    let chunk;
    if (isBufferLike(input)) {
      chunk = input[i];
    }
    if (typeof input === "string") {
      chunk = parseInt(input[i], radix);
    }
    if (Array.isArray(input)) {
      chunk = input[i];
      if (typeof chunk === "string") {
        chunk = parseInt(chunk, radix);
      }
    }
    if (chunk === void 0) {
      throw new TypeError("Unsupported type for chunk in input.");
    }
    const padded = pad(chunk.toString(2), 4);
    chunks.unshift(padded);
  }
  return chunks.join("");
}
function encode(id, data) {
  id = typeof id === "number" ? id : (
    /** @type {number} */
    parseInt(Buffer2.from(id).toString(), 16)
  );
  const padding = (BIT_SIZE - 1).toString(16).length;
  const header = Buffer2.concat([
    // `BIT_COUNT` is stored as a base36 value, which in this case is the literal '8'
    Buffer2.from(BIT_COUNT.toString(36).toUpperCase()),
    // 8
    Buffer2.from(pad(id.toString(16), padding))
  ]);
  if (!isBufferLike(data)) {
    data = Buffer2.from(data);
  }
  return Buffer2.concat([header, data]);
}
function decode(input, encoding = "utf8") {
  const padding = 2 * BYTES_PER_CHARACTER;
  const string = pad(Buffer2.from(input).toString(encoding), padding);
  const offset = padding;
  const chunks = [];
  for (let i = 0; i < string.length; i += offset) {
    const bits = string.slice(i, i + offset);
    const chunk = parseInt(bits, 16);
    chunks.unshift(chunk);
  }
  return Buffer2.from(chunks);
}
function split(input, padding = 0, radix = 2) {
  const chunks = [];
  const string = pad(Buffer2.from(input).toString(), padding);
  let i = 0;
  for (i = string.length; i > BIT_COUNT; i -= BIT_COUNT) {
    const bits = string.slice(i - BIT_COUNT, i);
    const chunk = parseInt(bits, radix);
    chunks.push(chunk);
  }
  chunks.push(parseInt(string.slice(0, i), radix));
  return chunks;
}
var codec_default = {
  bin,
  decode,
  encode,
  hex,
  pad,
  split
};

// combine.js
var MAX_BITS = BIT_SIZE - 1;
var Share = class {
  id = 0;
  bits = 0;
  data = "";
  /**
   * Creates a `Share` object from a variety of input
   * @param {ShareData|number|string} [id]
   * @param {?number} [bits = 0]
   * @param {?string} [data = null]
   */
  static from(id = 0, bits = 0, data = null) {
    if (id !== null && typeof id === "object") {
      const share = (
        /** @type {ShareData} */
        id
      );
      return new this(share.id, share.bits || bits, share.data || data);
    }
    return new this(id || 0, bits || 0, data);
  }
  /**
   * `Share` class constructor.
   * @param {string|number} [id]
   * @param {string|number} [bits]
   * @param {?string} [data]
   */
  constructor(id = 0, bits = 0, data = null) {
    this.id = typeof id === "number" ? id : parseInt(id, 16);
    this.bits = typeof bits === "number" ? bits : parseInt(bits, 36);
    this.data = typeof data === "string" ? data : "";
  }
};
function parse(input) {
  const share = new Share();
  const string = isBufferLike(input) ? Buffer2.from(input).toString("hex") : input;
  const normalized = string[0] === "0" ? string.slice(1) : string;
  share.bits = parseInt(normalized.slice(0, 1), 36);
  const idLength = MAX_BITS.toString(16).length;
  const regex = `^([a-kA-K3-9]{1})([a-fA-F0-9]{${idLength}})([a-fA-F0-9]+)$`;
  const matches = new RegExp(regex).exec(normalized);
  if (matches && matches.length) {
    share.id = parseInt(matches[2], 16);
    share.data = matches[3];
  }
  return share;
}
function lagrange(x, p) {
  const n = MAX_SHARES;
  let product = 0;
  let sum = 0;
  for (let i = 0; i < p[0].length; ++i) {
    if (p[1][i]) {
      product = logs[p[1][i]];
      for (let j = 0; j < p[0].length; ++j) {
        if (i !== j) {
          if (x === p[0][j]) {
            product = -1;
            break;
          }
          const a = logs[x ^ p[0][j]] - logs[p[0][i] ^ p[0][j]];
          product = (product + a + n) % n;
        }
      }
      sum = -1 === sum ? sum : sum ^ exps[product];
    }
  }
  return sum;
}
function combine(shares) {
  const chunks = [];
  const x = [];
  const y = [];
  const t = shares.length;
  for (let i = 0; i < t; ++i) {
    const share = parse(shares[i]);
    if (x.indexOf(share.id) === -1) {
      x.push(share.id);
      const bin3 = codec_default.bin(share.data, 16);
      const parts = codec_default.split(bin3, 0, 2);
      for (let j = 0; j < parts.length; ++j) {
        if (!y[j]) {
          y[j] = [];
        }
        y[j][x.length - 1] = parts[j];
      }
    }
  }
  for (let i = 0; i < y.length; ++i) {
    const p = lagrange(0, [x, y[i]]);
    const padded = codec_default.pad(p.toString(2));
    chunks.unshift(padded);
  }
  const string = chunks.join("");
  const bin2 = string.slice(1 + string.indexOf("1"));
  const hex2 = codec_default.hex(bin2, BIN_ENCODING);
  const value = codec_default.decode(hex2);
  return Buffer2.from(value);
}
var combine_default = combine;

// split.js
var scratch = new Array(2 * MAX_SHARES);
function horner(x, a) {
  const n = MAX_SHARES;
  const t = a.length - 1;
  let b = 0;
  for (let i = t; i >= 0; --i) {
    b = 0 === b ? a[i] : exps[(logs[x] + logs[b]) % n] ^ a[i];
  }
  return b;
}
function computePoints(a0, options) {
  const prng = options.random;
  const a = [a0];
  const p = [];
  const t = options.threshold;
  const n = options.shares;
  for (let i = 1; i < t; ++i) {
    a[i] = parseInt(prng(1).toString("hex"), 16);
  }
  for (let i = 1; i < 1 + n; ++i) {
    p[i - 1] = {
      x: i,
      y: horner(i, a)
    };
  }
  return p;
}
function split2(input, options) {
  if (!input) {
    throw new TypeError("An input secret must be provided");
  }
  const secret = buffer_default.from(input);
  if (secret.byteLength === 0) {
    throw new TypeError("Secret cannot be empty");
  }
  if (!options || typeof options !== "object") {
    throw new TypeError("Expecting options to be an object.");
  }
  if ("shares" in options && typeof options.shares !== "number") {
    throw new TypeError("Expecting shares to be a number.");
  }
  if ("threshold" in options && typeof options.threshold !== "number") {
    throw new TypeError("Expecting threshold to be a number.");
  }
  if (!Number.isFinite(options.shares) || !Number.isInteger(options.shares) || !Number.isSafeInteger(options.shares)) {
    throw new RangeError("Expecting shares to be a positive integer");
  }
  if (!Number.isFinite(options.threshold) || !Number.isInteger(options.threshold) || !Number.isSafeInteger(options.threshold)) {
    throw new RangeError("Expecting threshold to be a positive integer");
  }
  if (options.shares <= 0 || options.shares > MAX_SHARES) {
    throw new RangeError(`Shares must be 0 < shares <= ${MAX_SHARES}.`);
  }
  if (options.threshold <= 0 || options.threshold > options.shares) {
    throw new RangeError(`Threshold must be 0 < threshold <= ${options.shares}.`);
  }
  if (options.random !== null && options.random !== void 0) {
    throw new TypeError("Expecting random to be a function");
  }
  if (typeof options.random !== "function") {
    options.random = buffer_default.random;
  }
  const hex2 = codec_default.hex(secret);
  const bin2 = codec_default.bin(hex2, 16);
  const parts = codec_default.split("1" + bin2, BIT_PADDING, 2);
  for (let i = 0; i < parts.length; ++i) {
    const p = computePoints(parts[i], {
      shares: options.shares,
      threshold: options.threshold,
      random: options.random
    });
    for (let j = 0; j < options.shares; ++j) {
      if (!scratch[j]) {
        scratch[j] = p[j].x.toString(16);
      }
      const z = p[j].y.toString(2);
      const y = scratch[j + MAX_SHARES] || "";
      scratch[j + MAX_SHARES] = codec_default.pad(z) + y;
    }
  }
  for (let i = 0; i < options.shares; ++i) {
    const x = scratch[i];
    const y = codec_default.hex(scratch[i + MAX_SHARES], BIN_ENCODING);
    scratch[i] = codec_default.encode(x, y);
    scratch[i] = buffer_default.from("0" + scratch[i], "hex");
  }
  const result = scratch.slice(0, options.shares);
  scratch.fill(0);
  return result;
}
var split_default = split2;

// index.js
var VERSION = "2";
var shamirs_secret_sharing_default = { Buffer: buffer_default, combine: combine_default, constants: constants_default, split: split_default };
