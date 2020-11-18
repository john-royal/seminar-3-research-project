'use strict'

module.exports = async function (fastify, options) {
  fastify.get('/steps/2', async function (request, reply) {
    return reply.view('splash', {
      trial: 'Trial 1 of 3',

      caption: 'Step 2 of 3',
      heading: 'Take a Break',
      subheading: [
        'Come back in a few minutes.'
      ],
      timer: {
        label: 'Next step will be available in',
        length: 1 / 6,
        destination: '/steps/3/splash'
      }
    })
  })

  fastify.get('/register', async function (request, reply) {
    return reply.view('register')
  })

  fastify.get('/survey', async function (request, reply) {
    return reply.view('survey')
  })
}
