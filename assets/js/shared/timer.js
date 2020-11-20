'use strict'

const events = require('./events')

const internals = {}

/** @param {number} ms */
internals.timeout = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

/** @param {number} seconds */
internals.formatTime = seconds => {
  const minute = Math.floor(seconds / 60)
  const second = Math.round(seconds % 60)
  return `${minute}:${`${second}`.padStart(2, '0')}`
}

class Timer {
  /** @param {HTMLElement} element */
  constructor (element = document.querySelector('[data-timer-length]')) {
    this.element = element
    this.length = Number(element.dataset.timerLength)
    this.isCancelled = false

    this.cancel = this.cancel.bind(this)
    this.run = this.run.bind(this)
  }

  cancel () {
    console.log(`[Timer] Cancelling ${this.length} minute timer`)
    this.isCancelled = true
  }

  async run () {
    console.log(`[Timer] Starting ${this.length} minute timer`)
    const startTime = Date.now()
    const finishTime = startTime + (this.length * 60 * 1000)

    // Cancel automatically if page is closed
    const cancel = () => {
      this.cancel()
      document.removeEventListener('turbolinks:before-visit', cancel)
    }
    document.addEventListener('turbolinks:before-visit', cancel)

    while (finishTime > Date.now()) {
      const seconds = Math.round((finishTime - Date.now()) / 1000)
      this.element.textContent = internals.formatTime(seconds)
      await internals.timeout(1000)
    }

    console.log(`[Timer] Completed ${this.length} minute timer`)
  }

  static createWithDefaults () {
    events.ready(() => {
      const element = document.querySelector('[data-timer-length]')
      const redirect = element.dataset.timerRedirect
      const timer = new Timer(element)
      if (timer) {
        timer.run()
          .then(() => {
            Turbolinks.visit(redirect) // eslint-disable-line no-undef
          })
          .catch(error => {
            console.error(error)
          })
      }
    })
  }
}

module.exports = Timer
