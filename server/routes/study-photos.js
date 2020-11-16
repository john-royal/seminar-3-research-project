'use strict'

const fs = require('fs').promises
const path = require('path')

const internals = {
  IMAGE_DIRECTORY: path.join(__dirname, '../../public/img'),
  getRandom (arr, n) {
    const result = new Array(n)
    let len = arr.length
    const taken = new Array(len)
    if (n > len) { throw new RangeError('getRandom: more elements taken than available') }
    while (n--) {
      const x = Math.floor(Math.random() * len)
      result[n] = arr[x in taken ? taken[x] : x]
      taken[x] = --len in taken ? taken[len] : len
    }
    return result
  }
}

module.exports = async function (fastify, options) {
  const images = await fs.readdir(internals.IMAGE_DIRECTORY)
  const getRandomImages = () => {
    return internals.getRandom(images, 16).map(image => `/assets/img/${image}`)
  }

  fastify.get('/steps/1', async function (request, reply) {
    return reply.view('study-photos', {
      trial: 'Trial 1 of 3',
      images: getRandomImages(),
      timer: {
        label: 'Photos will be hidden in',
        length: 1 / 6,
        destination: '/steps/2'
      }
    })
  })
}
