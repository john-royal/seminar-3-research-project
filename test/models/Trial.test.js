'use strict'

const t = require('tap')
const { Trial, Survey, content: { Genre } } = require('../../server/models') // eslint-disable-line no-unused-vars

const PREFERRED_GENRE = Genre.HIP_HOP_RAP

t.beforeEach((done, t) => {
  t.context.survey = new Survey({
    approximateAge: '18-24',
    preferredGenre: PREFERRED_GENRE,
    prefersMusicWhileStudying: true
  })
  t.context.trials = Trial.generate(t.context.survey)
  done()
})

t.test('generates 4 trials', t => {
  t.plan(1)
  const { trials } = t.context
  t.equal(trials.length, 4)
})

t.test('assigns 16 unique photos to each trial', t => {
  t.plan(17 * 4)
  const { trials } = t.context
  const photos = []

  for (const trial of trials) {
    t.equal(trial.photosDisplayed.length, 16)

    for (const photo of trial.photosDisplayed) {
      t.notOk(photos.includes(photo.number), `Photo must only be used once; photo ${photo.number} found more than once`)
      photos.push(photo.number)
    }
  }
})

t.test('generates control trial', t => {
  t.plan(1)
  const { trials } = t.context
  const trial = trials.find(trial => trial.type === 'Control')
  t.equal(trial.song, null)
})

t.test('generates randomly assigned genre trial', t => {
  t.plan(2)
  const { trials } = t.context
  const trial = trials.find(trial => trial.type === 'Randomly Assigned Genre')
  t.notEqual(trial.song.genre, PREFERRED_GENRE)
  t.notEqual(trial.song.genre, Genre.CLASSICAL)
})

t.test('generates preferred genre trial', t => {
  t.plan(1)
  const { trials } = t.context
  const trial = trials.find(trial => trial.type === 'Preferred Genre')
  t.equal(trial.song.genre, PREFERRED_GENRE)
})

t.test('generates classical trial', t => {
  t.plan(1)
  const { trials } = t.context
  const trial = trials.find(trial => trial.type === 'Classical')
  t.equal(trial.song.genre, Genre.CLASSICAL)
})

t.todo('does not repeat songs between trials')
t.todo('does not repeat genres')
