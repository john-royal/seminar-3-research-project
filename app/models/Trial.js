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
   * @param {Photo[]} input.photos
   * @param {Object?} input.test
   * @param {number[]} input.test.recalled
   * @param {number[]} input.test.leftover
   */
  constructor (input) {
    /** @type {number} */
    this.number = input.number
    /** @type {Type} */
    this.type = input.type
    /** @type {Song?} */
    this.song = input.song || null
    /** @type {Photo[]}  */
    this.photos = input.photos
    this.test = {
      /** @type {number[]}  */
      recalled: input.test ? input.test.recalled || [] : [],
      /** @type {number[]}  */
      leftover: input.test ? input.test.leftover || [] : []
    }

    if (this.song && !(this.song instanceof Song)) {
      this.song = new Song(this.song)
    }

    Object.defineProperty(this, 'isPending', { value: this.isPending.bind(this) })
    Object.defineProperty(this, 'getScore', { value: this.getScore.bind(this) })
  }

  isPending () {
    return this.test.recalled.length === 0 && this.test.leftover.length === 0
  }

  getScore () {
    if (this.isPending()) { return null }

    let score = 0
    for (let i = 0; i < this.photos.length; i++) {
      if (this.photos[i].number === this.test.recalled[i]) {
        score++
      }
    }
    return score
  }

  get testResult () {
    let correct = 0
    for (let i = 0; i < this.photos.length; i++) {
      if (this.photos[i].number === this.test.recalled[i]) {
        correct++
      }
    }
    return { correct, missed: 16 - correct }
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
    photos: photos.slice(0, 16)
  })
  const preferredGenreTrial = new Trial({
    type: Trial.Type.PREFERRED_GENRE,
    song: Song.getRandom(survey.preferredGenre),
    photos: photos.slice(16, 32)
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
    photos: photos.slice(32, 48)
  })

  const classicalTrial = new Trial({
    type: Trial.Type.CLASSICAL,
    song: Song.getRandom(Genre.CLASSICAL, [
      preferredGenreTrial.song,
      randomAssignedGenreTrial.song
    ]),
    photos: photos.slice(48, 64)
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
