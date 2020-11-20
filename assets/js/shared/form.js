'use strict'

const ky = require('ky/umd')
const events = require('./events')
const setModal = require('./modal')

function initializeForm (form, action, callback) {
  const submit = async () => {
    console.log(`[S3RP][Form:${action}] Submitting`)
    const button = document.getElementById('form-submit')
    button.classList.add('button--loading')

    const elements = form.elements
    const formData = {}
    for (const element of elements) {
      if (element.name && element.value) {
        formData[element.name] = element.value
      }
      element.disabled = true
    }
    try {
      await ky.post(action, {
        json: formData,
        retry: { limit: 3 }
      })
      callback()
      button.classList.remove('button--loading')
      console.log(`[S3RP][Form: ${action}] Done`)
    } catch (error) {
      button.classList.remove('button--loading')
      for (const element of elements) {
        element.disabled = false
      }
      console.log(`[S3RP][Form: ${action}] Error`)
      console.error(error)
      setModal({
        title: 'Something went wrong',
        message: 'We ran into a problem while submitting your information. Please try again.'
      })
    }
  }
  events.lifetime(form, 'submit', e => {
    e.preventDefault()
    submit()
  })
}

/**
 *
 * @param {string} action
 * @param {function} callback
 */
module.exports = (action, callback) => {
  events.ready(() => {
    const form = document.forms[0]
    initializeForm(form, action, callback)
    console.log(`[S3RP][Form: ${action}] Initialized`)
  })
}
