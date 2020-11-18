'use strict'

const fp = require('fastify-plugin')
const path = require('path')
const FastifyStatic = require('fastify-static')

module.exports = fp(async function (fastify, opts) {
  // Serve static assets
  fastify.register(FastifyStatic, {
    root: path.join(__dirname, '../../public'),
    prefix: '/static',
    decorateReply: false
  })

  // Serve built assets
  fastify.register(FastifyStatic, {
    root: path.join(__dirname, '../../dist'),
    prefix: '/static/js',
    decorateReply: false
  })
})
