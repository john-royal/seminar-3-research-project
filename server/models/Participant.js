'use strict'

const assert = require('assert').strict
const Survey = require('./Survey')
const Trial = require('./Trial')

class Participant {
  /**
   * Create a participant from the given information
   * @param {Object} input
   * @param {string} input.id
   * @param {Survey?} input.survey
   * @param {Trial[]} input.trials
   * @param {SaveFunction} saveFunction
   */
  constructor (input, saveFunction) {
    /** @type {string} */
    this.id = input.id
    /** @type {Survey?} */
    this.survey = input.survey
    /** @type {Trial[]} */
    this.trials = input.trials ?? []

    if (this.survey && !(this.survey instanceof Survey)) {
      this.survey = new Survey(this.survey)
    }
    for (let i = 0; i < this.trials.length; i++) {
      if (!(this.trials[i] instanceof Trial)) {
        this.trials[i] = new Trial(this.trials[i])
      }
    }

    Object.defineProperties(this, {
      _save: {
        enumerable: false,
        value: saveFunction
      },
      save: {
        enumerable: false,
        value: this.save.bind(this)
      },
      generateTrials: {
        enumerable: false,
        value: this.generateTrials.bind(this)
      }
    })
  }

  async generateTrials () {
    assert.equal(this.trials.length, 0, 'Trials already generated')
    assert(this.survey, 'Survey must be complete before generating trials')
    this.trials = Trial.generate(this.survey)
    await this.save()
  }

  save () {
    assert(this._save)
    return this._save(this)
  }
}

Participant.Store = class {
  /**
   * Create profile store
   * @param {import('keyv')} keyv
   */
  constructor (keyv) {
    this.keyv = keyv

    this.findByIdOrCreate = this.findByIdOrCreate.bind(this)
  }

  /**
   * Find a participant record with the given ID. If the record cannot be found, one will be created.
   * @param {string} id
   * @returns {Promise<Participant>}
   */
  async findByIdOrCreate (id) {
    const saveFunction = participant => {
      return this.keyv.set(id, participant)
    }
    const existingParticipant = await this.keyv.get(id)
    if (existingParticipant) {
      return new Participant(existingParticipant, saveFunction)
    }
    const newParticipant = new Participant({
      id,
      survey: null,
      trials: []
    })
    await this.keyv.set(id, newParticipant)
    return newParticipant
  }
}

module.exports = Participant

/**
 * @callback SaveFunction
 * @param {Profile} profile
 * @returns {Promise}
 */
