'use strict'

const { Photo } = require('../models/content')

const routes = [
  page({ url: '/', view: 'home' }),
  {
    method: 'GET',
    url: '/steps/1',
    handler (request, reply) {
      return reply.view('study-photos', {
        trial: 'Trial 1 of 3',
        images: Photo.getRandom(16),
        timer: {
          label: 'Photos will be hidden in',
          length: 1 / 6,
          destination: '/steps/2'
        }
      })
    }
  },
  page({ url: '/steps/2', view: 'break' }),
  page({ url: '/steps/3/splash', view: 'memory-test/splash' }),
  {
    method: 'GET',
    url: '/steps/3',
    handler (request, reply) {
      const images = Photo.getRandom(16)
      const state = {}
      for (let i = 0; i < images.length; i++) {
        state[`source-${i}`] = `image-${i}`
        state[`target-${i}`] = null
      }
      return reply.view('memory-test/memory-test', {
        trial: 'Trial 1 of 3',
        images,
        json: JSON.stringify(state)
      })
    }
  }
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
