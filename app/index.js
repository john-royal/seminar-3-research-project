'use strict'

const path = require('path')
const AutoLoad = require('fastify-autoload')
const DataService = require('./services/data')
const { KeyvFile } = require('keyv-file')

module.exports = async function (fastify, opts) {
  // Place here your custom code!
  fastify.register(DataService, {
    store: opts.store || new KeyvFile({
      filename: path.join(__dirname, '../data.json')
    })
  })

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'services'),
    options: Object.assign({}, opts)
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'controllers'),
    options: Object.assign({}, opts)
  })
}
