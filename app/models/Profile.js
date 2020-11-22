'use strict'

const assert = require('assert')
const normalize = require('normalize-email')
const { v4: uuidv4 } = require('uuid')

class Profile {
  /**
   * Create a profile from the given information
   * @param {Object} input
   * @param {string} input.id
   * @param {string} input.name
   * @param {string} input.emailAddress
   * @param {string} input.normalizedEmailAddress
   * @param {SaveFunction?} saveFunction
   */
  constructor (input, saveFunction) {
    this.id = input.id
    this.name = input.name
    this.emailAddress = input.emailAddress
    this.normalizedEmailAddress = input.normalizedEmailAddress

    Object.defineProperties(this, {
      _save: {
        enumerable: false,
        value: saveFunction
      },
      save: {
        enumerable: false,
        value: this.save.bind(this)
      }
    })
  }

  /** @returns {Promise} */
  save () {
    assert(this._save)
    return this._save(this)
  }
}

Profile.Store = class {
  /**
   * Create profile store
   * @param {import('keyv')} keyv
   */
  constructor (keyv) {
    this.keyv = keyv

    this.findByEmailAddressOrCreate = this.findByEmailAddressOrCreate.bind(this)
  }

  /**
   * Find a profile with the given email address. If the profile cannot be found, one will be created.
   * @param {string} emailAddress
   * @returns {Promise<Profile>}
   */
  async findByEmailAddressOrCreate (emailAddress) {
    const normalizedEmailAddress = normalize(emailAddress)
    const saveFunction = profile => {
      return this.keyv.set(normalizedEmailAddress, profile)
    }
    const existingProfile = await this.keyv.get(normalizedEmailAddress)
    if (existingProfile) {
      return new Profile(existingProfile, saveFunction)
    }
    const newProfile = new Profile({
      id: uuidv4(),
      name: '',
      emailAddress,
      normalizedEmailAddress
    }, saveFunction)
    await this.keyv.set(normalizedEmailAddress, newProfile)
    return newProfile
  }
}

module.exports = Profile

/**
 * @callback SaveFunction
 * @param {Profile} profile
 * @returns {Promise}
 */
