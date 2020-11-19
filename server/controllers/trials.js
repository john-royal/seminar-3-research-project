'use strict'

const MINUTES_IN_STEP_1 = 1 / 6
const MINUTES_IN_STEP_2 = 1 / 6

const S = require('fluent-schema')
const util = require('../util')

const Routes = {}

/** @type {import('fastify').RouteOptions} */
Routes.getStudyPhotos = {
  method: 'GET',
  url: '/trials/:trial/study-photos',
  handler (request, reply) {
    /** @type {import('../models/Trial')} */
    const trial = request.trial
    return reply.view('study-photos', {
      trial: `Trial ${trial.number} of ${request.participant.trials.length}`,
      images: trial.photosDisplayed,
      jsonTrialDescription: JSON.stringify(trial),
      timer: {
        length: MINUTES_IN_STEP_1,
        redirect: Routes.getBreak.url.replace(':trial', trial.number)
      }
    })
  }
}

/** @type {import('fastify').RouteOptions} */
Routes.getBreak = {
  method: 'GET',
  url: '/trials/:trial/break',
  handler (request, reply) {
    /** @type {import('../models/Trial')} */
    const trial = request.trial
    return reply.view('break', {
      trial: `Trial ${trial.number} of ${request.participant.trials.length}`,
      timer: {
        length: MINUTES_IN_STEP_2,
        redirect: Routes.getMemoryTestSplash.url.replace(':trial', trial.number)
      }
    })
  }
}

/** @type {import('fastify').RouteOptions} */
Routes.getMemoryTestSplash = {
  method: 'GET',
  url: '/trials/:trial/memory-test-splash',
  handler (request, reply) {
    /** @type {import('../models/Trial')} */
    const trial = request.trial
    return reply.view('memory-test/splash', {
      trial: `Trial ${trial.number} of ${request.participant.trials.length}`,
      nextUrl: Routes.getMemoryTest.url.replace(':trial', trial.number)
    })
  }
}

/** @type {import('fastify').RouteOptions} */
Routes.getMemoryTest = {
  method: 'GET',
  url: '/trials/:trial/memory-test',
  handler (request, reply) {
    /** @type {import('../models/Trial')} */
    const trial = request.trial
    return reply.view('memory-test/memory-test', {
      trial: `Trial ${trial.number} of ${request.participant.trials.length}`,
      images: util.shuffleArray(trial.photosDisplayed)
    })
  }
}

module.exports = async function (fastify, options) {
  fastify.decorateRequest('trial', null)
  fastify.addHook('preHandler', function (request, reply, done) {
    if (!request.participant) {
      return reply.code(400).send('Cannot find participant')
    }
    request.trial = request.participant.trials.find(trial => trial.number === Number(request.params.trial))
    if (!request.trial) {
      return reply.code(400).send(`Cannot find trial ${request.params.trial}`)
    }
    done()
  })
  for (const route of Object.values(Routes)) {
    route.schema = {
      params: S.object()
        .prop('trial', S.number().required())
    }
    fastify.route(route)
  }
}
