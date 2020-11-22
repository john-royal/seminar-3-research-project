'use strict'

class Survey {
  /**
   * Create a survey with the given information
   * @param {Object} input
   * @param {Survey.Age} input.approximateAge
   * @param {import('./content/Genre')} input.preferredGenre
   * @param {boolean} input.prefersMusicWhileStudying
   */
  constructor (input) {
    this.approximateAge = input.approximateAge
    this.preferredGenre = input.preferredGenre
    this.prefersMusicWhileStudying = input.prefersMusicWhileStudying
  }
}

/** @enum {string} */
Survey.Age = {
  AGE_UNDER_18: 'under-18',
  AGE_18_TO_24: '18-24',
  AGE_25_TO_34: '25-34',
  AGE_35_TO_44: '35-44',
  AGE_45_TO_54: '45-54',
  AGE_55_TO_64: '55-64',
  AGE_65_OR_OLDER: '65-or-older'
}

module.exports = Survey
