'use strict'

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
  constructor (element) {
    this.element = element
    this.length = Number(element.dataset.timer)
    this.destination = element.dataset.timerRedirect
    this.isCancelled = false

    this.cancel = this.cancel.bind(this)
    this.run = this.run.bind(this)
  }

  static compare (timer1, timer2) {
    return timer1.id === timer2.id && timer1.length === timer2.length && timer1.destination === timer2.destination
  }

  static init () {
    const element = document.querySelector('[data-timer]')
    if (element) {
      return new Timer(element)
    }
  }

  cancel () {
    console.log(`[Timer] Cancelling ${this.length} minute timer`)
    this.isCancelled = true
  }

  async run () {
    console.log(`[Timer] Starting ${this.length} minute timer`)
    for (let seconds = this.length * 60; seconds >= 0; seconds--) {
      this.element.textContent = internals.formatTime(seconds)
      await internals.timeout(1000)

      if (this.isCancelled) {
        throw new Error('Timer cancelled')
      }
    }
    console.log(`[Timer] Completed ${this.length} minute timer; should now redirect to ${this.destination}`)
  }
}

module.exports = Timer
