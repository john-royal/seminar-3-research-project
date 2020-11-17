'use strict'

const fs = require('fs')
const path = require('path')
const { getRandomElementsFromArray } = require('../../util')

class Photo {
  /**
   * Create a photo from the given file name
   * @param {string} name
   */
  constructor (name) {
    this.number = Number(name.slice(0, name.length - 4))
    this.name = name
    this.path = `/static/images/${name}`
  }
}

Photo.all = (() => {
  const directory = path.join(__dirname, '../../../public/images')
  return fs.readdirSync(directory).map(photo => new Photo(photo))
})()

/**
 * Randomly select the requested number of photos.
 * @param {number} numberOfPhotos
 * @returns {Photo[]}
 */
Photo.getRandom = numberOfPhotos => {
  return getRandomElementsFromArray(Photo.all, numberOfPhotos)
}

module.exports = Photo
