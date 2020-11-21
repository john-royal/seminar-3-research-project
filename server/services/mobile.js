'use strict'

const fp = require('fastify-plugin')
const UserAgentParser = require('ua-parser-js')

module.exports = fp(async function (fastify, opts) {
  fastify.addHook('preHandler', function (request, reply, done) {
    const parser = new UserAgentParser(request.headers['user-agent'])
    const os = parser.getOS()
    console.log(os)
    if (['iOS', 'Android'].includes(os.name)) {
      return reply.view('mobile')
    }
    done()
  })
})
