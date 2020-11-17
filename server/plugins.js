'use strict'

const fp = require('fastify-plugin')
const nunjucks = require('nunjucks')
const path = require('path')
const FastifyCookie = require('fastify-cookie')
const FastifySession = require('fastify-session')
const FastifyStatic = require('fastify-static')
const PointOfView = require('point-of-view')

module.exports = fp(async function (fastify, opts) {
  // Sessions
  fastify.register(FastifyCookie)
  fastify.register(FastifySession, {
    secret: 'FLxl9yEnFfMALWrH7CPbwZHIcshf4M24',
    secure: false
  })

  // Render views
  fastify.register(PointOfView, {
    engine: {
      nunjucks
    },
    root: path.join(__dirname, './views'),
    viewExt: 'njk'
  })

  // Serve static assets
  fastify.register(FastifyStatic, {
    root: path.join(__dirname, '../public'),
    prefix: '/static',
    decorateReply: false
  })

  // Serve built assets
  fastify.register(FastifyStatic, {
    root: path.join(__dirname, '../dist'),
    prefix: '/static/js',
    decorateReply: false
  })
})
