'use strict'

const { Photo } = require('../models/content')

module.exports = async function (fastify, options) {
  fastify.get('/steps/1', async function (request, reply) {
    return reply.view('study-photos', {
      trial: 'Trial 1 of 3',
      images: Photo.getRandom(16),
      timer: {
        label: 'Photos will be hidden in',
        length: 1 / 6,
        destination: '/steps/2'
      }
    })
  })
}
