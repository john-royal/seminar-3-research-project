'use strict'

console.log('[S3RP] Form script loaded')

const ky = require('ky/umd')
const events = require('./events')
const setModal = require('./modal')

class Form {
  /**
   *
   * @param {HTMLFormElement} form
   * @param {string} action
   * @param {string} callback
   */
  constructor (form, action, callback) {
    this.form = form
    this.action = action
    this.callback = callback

    events.lifetime(this.form, 'submit', e => {
      e.preventDefault()
      this.submit()
    })
  }

  async submit () {
    const elements = this.form.elements
    const formData = {}
    for (const element of elements) {
      if (element.name && element.value) {
        formData[element.name] = element.value
      }
    }
    try {
      const response = await ky.post(this.action, {
        json: formData,
        retry: { limit: 3 }
      })
      this.callback()
    } catch (error) {
      console.error(error)
      setModal({
        title: 'Something went wrong',
        message: 'We ran into a problem while submitting your information. Please try again.'
      })
    }
  }
}

module.exports = Form
