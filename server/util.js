'use strict'

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
 * Randomly select an element from an array.
 * This uses a CSPRNG internally.
 * @param {*[]} array
 */
exports.getRandomElementFromArray = array => {
  const randomNumber = internals.csprng(0, array.length - 1)
  return array[randomNumber]
}

/**
 * Randomly select the requested number of elements from an array.
 * This uses a CSPRNG internally.
 * @param {*[]} array
 * @param {number} numberOfElements
 */
exports.getRandomElementsFromArray = (array, numberOfElements) => {
  const result = new Array(numberOfElements)
  let length = array.length
  const usedElements = new Array(length)
  if (numberOfElements > length) { throw new RangeError('More elements requested than available') }
  while (numberOfElements--) {
    const index = internals.csprng(0, length)
    result[numberOfElements] = array[index in usedElements ? usedElements[index] : index]
    usedElements[index] = --length in usedElements ? usedElements[length] : length
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
