'use strict'

const routes = [
  page({ url: '/', view: 'home' })
]

module.exports = async function (fastify, options) {
  for (const route of routes) {
    fastify.route(route)
  }
}

/**
 * Create a route that serves a view
 * @param {Object} options
 * @param {string} options.url
 * @param {string} options.view
 * @returns {import('fastify').RouteOptions}
 */
function page ({ url, view }) {
  return {
    method: 'GET',
    url,
    handler (request, reply) {
      return reply.view(view)
    }
  }
}
