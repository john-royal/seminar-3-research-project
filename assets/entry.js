'use strict'

console.log(['%c', 'Seminar 3 Research Project'].join(''), 'font-family: sans-serif; font-size: 2rem;')

const Turbolinks = require('turbolinks')
const runMemoryTest = require('./memory-test')
const Timer = require('./timer')

Turbolinks.start()

document.addEventListener('turbolinks:load', () => {
  const timer = Timer.init()
  runMemoryTest()
  window.timer = timer
  if (timer) {
    timer.run()
      .then(() => {
        window.timer = null
        Turbolinks.visit(timer.destination)
      })
      .catch(error => {
        console.error(error)
      })
  }
})

document.addEventListener('turbolinks:before-visit', () => {
  if (window.timer) {
    window.timer.cancel()
  }
})
