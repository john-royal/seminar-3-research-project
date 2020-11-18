'use strict'

const fp = require('fastify-plugin')
const FastifyCookie = require('fastify-cookie')
const FastifySession = require('fastify-session')

module.exports = fp(async function (fastify, opts) {
  // Sessions
  fastify.register(FastifyCookie)
  fastify.register(FastifySession, {
    secret: 'FLxl9yEnFfMALWrH7CPbwZHIcshf4M24',
    secure: false
  })
})
