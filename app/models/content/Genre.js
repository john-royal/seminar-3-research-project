'use strict'

const { getRandomElementFromArray } = require('../../util')

/** @enum {string} */
const Genre = {
  CLASSICAL: 'classical',
  JAZZ: 'jazz',
  POP: 'pop',
  HIP_HOP_RAP: 'hip-hop-rap',
  RB_SOUL: 'rb-soul',
  COUNTRY: 'country',
  ROCK: 'rock'
}

Object.defineProperty(Genre, 'all', {
  enumerable: false,
  value: Object.values(Genre)
})

Object.defineProperty(Genre, 'getRandom', {
  enumerable: false,
  /**
   * Randomly select a genre of music.
   * @param {Genre[]} excludeGenres
   * @returns {Genre}
   */
  value: (excludeGenres = []) => {
    const options = [...Genre.all].filter(value => {
      return !excludeGenres.includes(value)
    })
    return getRandomElementFromArray(options)
  }
})

module.exports = Genre
