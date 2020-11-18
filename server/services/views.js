'use strict'

const fp = require('fastify-plugin')
const nunjucks = require('nunjucks')
const path = require('path')
const FastifyCookie = require('fastify-cookie')
const FastifySession = require('fastify-session')
const FastifyStatic = require('fastify-static')
const PointOfView = require('point-of-view')

module.exports = fp(async function (fastify, opts) {
  // Render views
  fastify.register(PointOfView, {
    engine: {
      nunjucks
    },
    root: path.join(__dirname, '../views'),
    viewExt: 'njk'
  })
})
