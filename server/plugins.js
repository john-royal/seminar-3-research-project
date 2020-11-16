'use strict'

const fp = require('fastify-plugin')
const nunjucks = require('nunjucks')
const path = require('path')
const PointOfView = require('point-of-view')
const FastifyStatic = require('fastify-static')

module.exports = fp(async function (fastify, opts) {
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
    prefix: '/assets',
    decorateReply: false
  })

  // Serve built assets
  fastify.register(FastifyStatic, {
    root: path.join(__dirname, '../dist'),
    prefix: '/assets/js',
    decorateReply: false
  })
})
