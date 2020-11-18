'use strict'

const { strict: assert } = require('assert')
const crypto = require('crypto')

const internals = {}

/**
 * Synchronously generate a cryptographically secure pseudo-random number.
 * @param {number} min
 * @param {number} max
 * @see https://gist.github.com/almic/7007eafe54e44839635bfb8ce0b6942e
 */
internals.csprng = (min, max) => {
  const range = max - min
  if (range >= Math.pow(2, 32)) {
    throw new Error(`Range ${range} is too large`)
  }

  let tmp = range
  let bitsNeeded = 0
  let bytesNeeded = 0
  let mask = 1

  while (tmp > 0) {
    if (bitsNeeded % 8 === 0) bytesNeeded += 1
    bitsNeeded += 1
    mask = mask << 1 | 1
    tmp = tmp >>> 1
  }
  const randomBytes = crypto.randomBytes(bytesNeeded)
  let randomValue = 0

  for (let index = 0; index < bytesNeeded; index++) {
    randomValue |= randomBytes[index] << 8 * index
  }

  randomValue = randomValue & mask

  if (randomValue <= range) {
    return min + randomValue
  } else {
    return internals.csprng(min, max)
  }
}

/**
 * Run some assertions to make sure the given array is valid.
 * @param {*[]} array
 */
internals.checkArray = array => {
  assert(Array.isArray(array), 'Input must be an array')
  assert(array.length > 0, 'Array cannot be empty')
}

/**
 * Randomly select an element from an array.
 * This uses a CSPRNG internally.
 * @param {*[]} array
 */
exports.getRandomElementFromArray = array => {
  internals.checkArray(array)
  const randomNumber = internals.csprng(0, array.length - 1)
  return array[randomNumber]
}

/**
 * Randomly select the requested number of elements from an array.
 * This uses a CSPRNG internally.
 * @param {*[]} source
 * @param {number} numberOfElements
 */
exports.getRandomElementsFromArray = (source, requestedNumberOfElements) => {
  internals.checkArray(source)
  if (requestedNumberOfElements > source.length) {
    throw new RangeError(`More elements requested than available (requested ${requestedNumberOfElements} from array of length ${source.length}; array contents: ${source.join()})`)
  }
  const mutableSourceCopy = [...source]
  const result = []
  while (result.length < requestedNumberOfElements) {
    if (mutableSourceCopy.length === 0) {
      throw new Error('Cannot select items from empty array')
    }
    const index = internals.csprng(0, mutableSourceCopy.length - 1)
    const [item] = mutableSourceCopy.splice(index, 1)
    result.push(item)
  }
  return result
}

/**
 * Shuffle an array.
 * This uses `Math.random()` internally.
 * @param {*[]} array
 */
exports.shuffleArray = array => {
  for (let index = array.length - 1; index > 0; index--) {
    const j = Math.floor(Math.random() * (index + 1))
    ;[array[index], array[j]] = [array[j], array[index]]
  }
  return array
}
