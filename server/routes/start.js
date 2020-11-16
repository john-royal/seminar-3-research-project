'use strict'

module.exports = async function (fastify, options) {
  fastify.get('/', async function (request, reply) {
    return reply.view('splash', {
      heading: 'Effects of Music Genre on Memory and Recollection',
      subheading: [
        'For this study, you will complete a few trials of a task meant to test your memory and recollection.',
        'This will take about 15 minutes.'
      ],
      button: {
        label: 'Start',
        destination: '/steps/1'
      }
    })
  })
}
