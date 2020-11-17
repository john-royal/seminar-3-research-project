'use strict'

const Keyv = require('keyv')
const t = require('tap')
const Participant = require('../../server/models/Participant')

t.beforeEach((done, t) => {
  t.context.keyv = new Keyv()
  t.context.store = new Participant.Store(t.context.keyv)
  done()
})

t.afterEach((done, t) => {
  t.context.keyv = null
  t.context.store = null
  done()
})

t.todo('reads existing participant from store')
t.todo('returns new participant if one does not exist in store')
t.todo('saves new participant to store')
t.todo('updates store after saving updates')
t.todo('generates trials')
t.todo('updates store after generating trials')
