'use strict'

const S = require('fluent-schema').default
const { Survey: { Age }, content: { Genre }, Survey } = require('../models')

const Routes = {}

/** @type {import('fastify').RouteOptions} */
Routes.getRegister = {
  method: 'GET',
  url: '/register/profile',
  handler (request, reply) {
    reply.view('register')
  }
}

/** @type {import('fastify').RouteOptions} */
Routes.postRegister = {
  method: 'POST',
  url: '/register/profile',
  schema: {
    body: S.object()
      .prop('name', S.string()).required()
      .prop('email', S.string().format('email')).required()
  },
  async handler (request, reply) {
    /** @type {import('../models/Profile').Store} */
    const profiles = request.store.profiles
    const profile = await profiles.findByEmailAddressOrCreate(request.body.email)
    profile.name = request.body.name
    await profile.save()
    await request.store.participants.findByIdOrCreate(profile.id)
    return reply
      .setCookie('participantId', profile.id, { path: '/' })
      .send({ success: true, participantId: profile.id })
  }
}

/** @type {import('fastify').RouteOptions} */
Routes.getSurvey = {
  method: 'GET',
  url: '/register/survey',
  preHandler (request, reply, done) {
    if (!request.participant) {
      return reply.redirect('/register/profile')
    }
    done()
  },
  handler (request, reply) {
    reply.view('survey')
  }
}

/** @type {import('fastify').RouteOptions} */
Routes.postSurvey = {
  method: 'POST',
  url: '/register/survey',
  schema: {
    body: S.object()
      .prop('approximate-age', S.enum(Object.values(Age))).required()
      .prop('preferred-genre', S.enum(Genre.all)).required()
      .prop('prefers-music-while-studying', S.enum(['yes', 'no'])).required()
  },
  async handler (request, reply) {
    if (!request.participant) {
      return reply.code(400).send()
    }
    /** @type {import('../models/Participant')} */
    const participant = request.participant
    participant.survey = new Survey({
      approximateAge: request.body['approximate-age'],
      preferredGenre: request.body['preferred-genre'],
      prefersMusicWhileStudying: request.body['prefers-music-while-studying'] === 'yes'
    })
    await participant.generateTrials() // calls participant.save() automatically
    return participant.trials
  }
}

module.exports = async function (fastify, options) {
  for (const route of Object.values(Routes)) {
    fastify.route(route)
  }
}
