'use strict'

const ky = require('ky/umd')
const events = require('./events')
const setModal = require('./modal')

function initializeForm (form, action, callback) {
  const submit = async () => {
    console.log(`[S3RP][Form:${action}] Submitting`)

    const elements = form.elements
    const formData = {}
    for (const element of elements) {
      if (element.name && element.value) {
        formData[element.name] = element.value
      }
    }
    try {
      await ky.post(action, {
        json: formData,
        retry: { limit: 3 }
      })
      callback()
      console.log(`[S3RP][Form: ${action}] Done`)
    } catch (error) {
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
