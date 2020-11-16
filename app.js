'use strict'

const path = require('path')
const AutoLoad = require('fastify-autoload')

module.exports = async function (fastify, opts) {
  // Place here your custom code!

  fastify.register(require('./server/plugins'))

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'server/routes'),
    options: Object.assign({}, opts)
  })
}
