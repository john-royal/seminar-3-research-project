'use strict'

const { getRandomElementFromArray } = require('../../util')
const songs = require('../../../public/songs/songs.json')

class Song {
  /**
   * Create a song from the given information
   * @param {Object} input
   * @param {string} input.name
   * @param {string} input.artist
   * @param {import('./Genre').Genre} input.genre
   * @param {string} input.url
   * @param {string} input.path
   */
  constructor (input) {
    this.name = input.name
    this.artist = input.artist
    this.genre = input.genre
    this.url = input.url
    this.path = input.path
  }
}

Song.all = songs.map(song => new Song(song))

/**
 * Randomly select a song from the given genre.
 * @param {import('./Genre').Genre} genre
 * @param {Song[]} excludeSongs
 * @returns {Song}
 */
Song.getRandom = (genre, excludeSongs = []) => {
  const options = [...Song.all]
    .filter(song => {
      return song.genre === genre
    })
    .filter(song => {
      return !excludeSongs.includes(song)
    })
  return getRandomElementFromArray(options)
}

module.exports = Song
