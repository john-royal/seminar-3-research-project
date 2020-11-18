'use strict'

const { shuffleArray } = require('../util')
const { Genre, Photo, Song } = require('./content')

class Trial {
  /**
   * Create a trial from the given information
   * @param {Object} input
   * @param {number} input.number
   * @param {Trial.Type} input.type
   * @param {Song?} input.song
   * @param {number[]} input.photosDisplayed
   * @param {number[]} input.photosRecalled
   */
  constructor (input) {
    /** @type {number} */
    this.number = input.number
    /** @type {Type} */
    this.type = input.type
    /** @type {Song?} */
    this.song = input.song || null
    /** @type {number[]}  */
    this.photosDisplayed = input.photosDisplayed
    /** @type {number[]}  */
    this.photosRecalled = input.photosRecalled

    if (this.song && !(this.song instanceof Song)) {
      this.song = new Song(this.song)
    }
  }
}

/** @enum {string} */
Trial.Type = {
  CONTROL: 'Control',
  PREFERRED_GENRE: 'Preferred Genre',
  RANDOM_ASSIGNED_GENRE: 'Randomly Assigned Genre',
  CLASSICAL: 'Classical'
}

/**
 * Generate trials for a participant using the given survey answers as a guide.
 * @param {import('./Survey')} survey
 */
Trial.generate = survey => {
  const photos = Photo.getRandom(16 * 4)
  const controlTrial = new Trial({
    type: Trial.Type.CONTROL,
    song: null,
    photosDisplayed: photos.slice(0, 16)
  })
  const preferredGenreTrial = new Trial({
    type: Trial.Type.PREFERRED_GENRE,
    song: Song.getRandom(survey.preferredGenre),
    photosDisplayed: photos.slice(16, 32)
  })

  const randomAssignedGenre = Genre.getRandom([
    Genre.CLASSICAL,
    survey.preferredGenre
  ])
  const randomAssignedGenreTrial = new Trial({
    type: Trial.Type.RANDOM_ASSIGNED_GENRE,
    song: Song.getRandom(randomAssignedGenre, [
      preferredGenreTrial.song
    ]),
    photosDisplayed: photos.slice(32, 48)
  })

  const classicalTrial = new Trial({
    type: Trial.Type.CLASSICAL,
    song: Song.getRandom(Genre.CLASSICAL, [
      preferredGenreTrial.song,
      randomAssignedGenreTrial.song
    ]),
    photosDisplayed: photos.slice(48, 64)
  })

  const trials = shuffleArray([
    controlTrial,
    preferredGenreTrial,
    randomAssignedGenreTrial,
    classicalTrial
  ])
  for (let i = 0; i < trials.length; i++) {
    trials[i].number = i + 1
  }
  return trials
}

module.exports = Trial
