'use strict'

const { getRandomElementFromArray } = require('../../util')

/** @enum {string} */
const Genre = {
  CLASSICAL: 'Classical',
  JAZZ: 'Jazz',
  POP: 'Pop',
  HIP_HOP: 'Hip-Hop/Rap',
  RB: 'R&B/Soul',
  COUNTRY: 'Country',
  ROCK: 'Rock'
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
