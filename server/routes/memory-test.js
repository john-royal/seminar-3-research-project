'use strict'

module.exports = async function (fastify, options) {
  fastify.get('/steps/3/splash', async function (request, reply) {
    return reply.view('splash', {
      trial: 'Trial 1 of 3',

      caption: 'Step 3 of 3',
      heading: 'Memory Test',
      subheading: [
        'The photos will be shown to you again out of order. Try to re-assemble the grid from memory.'
      ],
      button: {
        label: 'Continue',
        destination: '/steps/3'
      }
    })
  })

  fastify.get('/steps/3', async function (request, reply) {
    return reply.view('memory-test')
  })
}
