'use strict'

const fp = require('fastify-plugin')
const path = require('path')
const FastifyStatic = require('fastify-static')

module.exports = fp(async function (fastify, opts) {
  // Serve built assets
  fastify.register(FastifyStatic, {
    root: path.join(__dirname, '../../dist/css'),
    prefix: '/static/css',
    decorateReply: false
  })
  fastify.register(FastifyStatic, {
    root: path.join(__dirname, '../../dist/js'),
    prefix: '/static/js',
    decorateReply: false
  })

  // Serve static assets
  fastify.register(FastifyStatic, {
    root: path.join(__dirname, '../../resources'),
    prefix: '/static',
    decorateReply: false
  })
})
