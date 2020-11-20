'use strict'

const MINUTES_IN_STEP_1 = 1
const MINUTES_IN_STEP_2 = 3

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
      photos: trial.photos,
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
        redirect: Routes.getMemoryTest.url.replace(':trial', trial.number)
      }
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
    return reply.view('memory-test', {
      trial: `Trial ${trial.number} of ${request.participant.trials.length}`,
      photos: util.shuffleArray(trial.photos),
      jsonTrialDescription: JSON.stringify(trial)
    })
  }
}

/** @type {import('fastify').RouteOptions} */
Routes.postMemoryTest = {
  method: 'POST',
  url: '/trials/:trial/memory-test',
  schema: {
    body: S.object()
      .prop('recalled', S.array(S.number().raw({ nullable: true })).minItems(16).maxItems(16).required())
      .prop('leftover', S.array(S.number().raw({ nullable: false })).minItems(0).maxItems(16).required())
  },
  async handler (request, reply) {
    /** @type {import('../models/Participant')} */
    const participant = request.participant
    const i = participant.trials.findIndex(trial => trial.number === Number(request.params.trial))
    participant.trials[i].test = {
      recalled: request.body.recalled,
      leftover: request.body.leftover
    }
    await participant.save()
    return {
      status: 'success',
      data: participant.trials[i].testResult
    }
  }
}

/** @type {import('fastify').RouteOptions} */
Routes.getEndOfTrialSplash = {
  method: 'GET',
  path: '/trials/:trial/complete',
  handler (request, reply) {
    /** @type {import('../models/Participant')} */
    const participant = request.participant
    const trialNumber = Number(request.params.trial)
    const i = participant.trials.findIndex(trial => trial.number === trialNumber)
    const result = participant.trials[i].testResult
    const nextTrial = trialNumber === request.participant.trials.length ? null : trialNumber + 1
    const singularOrPlural = (number, singular, plural) => number === 1 ? `1 ${singular}` : `${number} ${plural}`
    const context = {
      trial: `Trial ${trialNumber} of ${request.participant.trials.length}`,
      caption: nextTrial ? `${singularOrPlural(request.participant.trials.length - trialNumber, 'Trial', 'Trials')} Remaining` : 'You\'re Done',
      heading: `Finished Trial ${trialNumber} of ${request.participant.trials.length}`,
      subheading: [
        `You missed ${singularOrPlural(result.missed, 'photo', 'photos')} and got ${singularOrPlural(result.correct, 'photo', 'photos')} correct.`,
        nextTrial ? 'When you\'re ready, click Next to begin the next trial.' : 'Thank you for participating in our study.'
      ],
      nextTrialUrl: nextTrial ? `/trials/${nextTrial}/study-photos` : null
    }
    console.dir(context)
    return reply.view('trial-complete', context)
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
    route.schema = Object.assign({}, route.schema, {
      params: S.object().prop('trial', S.number().enum([1, 2, 3, 4]).required())
    })
    fastify.route(route)
  }
}
