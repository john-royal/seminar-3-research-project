'use strict'

console.log('[S3RP] Form script loaded')

const ky = require('ky/umd')
const setModal = require('./shared/modal')

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

    this.form.onsubmit = e => {
      e.preventDefault()
      this.submit()
    }
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

  static configure (action, callback) {
    let didInit = false
    const init = () => {
      didInit = true
      const form = document.forms[0]
      if (!form) { return }
      return new Form(document.forms[0], action, callback)
    }
    document.addEventListener('turbolinks:load', init)
    document.addEventListener('DOMContentLoaded', () => {
      if (!didInit) {
        console.warn('Unable to initialize form via Turbolinks; doing so via DOMContentLoaded instead')
        init()
      }
    })
  }
}

window.Form = Form
