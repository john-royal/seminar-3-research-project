'use strict'

const t = require('tap')
const { Song, Genre } = require('../../../server/models/content') // eslint-disable-line no-unused-vars

t.test('gets song from requested genre', t => {
  t.plan(Genre.all.length)

  for (const genre of Genre.all) {
    t.test(genre, t => {
      t.plan(1)
      const song = Song.getRandom(genre)
      t.equal(song.genre, genre)
    })
  }
})

t.test('does not return an excluded song', t => {
  t.plan(3)
  const genre = Genre.getRandom([Genre.CLASSICAL])
  const song1 = Song.getRandom(genre)
  const song2 = Song.getRandom(genre, [song1])
  t.deepInequal(song1, song2)
  const song3 = Song.getRandom(genre, [song1, song2])
  t.deepInequal(song1, song3)
  t.deepInequal(song2, song3)
})
