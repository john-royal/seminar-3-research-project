'use strict'

const fp = require('fastify-plugin')
const FastifyCookie = require('fastify-cookie')
const Keyv = require('keyv')
const { Participant, Profile } = require('../models')

module.exports = fp(async function (fastify, options) {
  const participantsKeyv = new Keyv({
    store: options.store,
    namespace: 'participants'
  })
  const profilesKeyv = new Keyv({
    store: options.store,
    namespace: 'profiles'
  })
  const store = {
    participants: new Participant.Store(participantsKeyv),
    profiles: new Profile.Store(profilesKeyv)
  }
  fastify.decorate('store', store) // access from tests
  fastify.decorateRequest('store', store) // access from route handlers

  // Cookie
  fastify.register(FastifyCookie, {
    secret: 'FLxl9yEnFfMALWrH7CPbwZHIcshf4M24',
    secure: false
  })

  fastify.decorateRequest('participant', null)
  fastify.addHook('preHandler', async (request, reply) => {
    if (request.cookies.participantId) {
      request.participant = await request.store.participants.findById(request.cookies.participantId)
    } else {
      request.participant = null
    }
  })
})

module.exports.autoload = false
