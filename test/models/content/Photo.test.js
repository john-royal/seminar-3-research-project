'use strict'

const t = require('tap')
const Photo = require('../../../server/models/content/Photo')

t.test('returns requested number of photos', t => {
  // Given
  t.plan(1)
  const requestNumberOfPhotos = 25
  // When
  const output = Photo.getRandom(requestNumberOfPhotos)
  // Then
  t.equal(output.length, requestNumberOfPhotos)
})

t.test('does not repeat photos', t => {
  // Given
  t.plan(25)
  // When
  const output = Photo.getRandom(25)
  // Then
  const alreadyShown = []
  for (const photo of output) {
    t.notOk(alreadyShown.includes(photo))
    alreadyShown.push(photo)
  }
})
