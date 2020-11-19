'use strict'

const Turbolinks = require('turbolinks')
Turbolinks.start()

// This is a workaround that helps us figure out whether the page is rendered or not.
// See  shared/events.js for how this is used.
window.contentDidRender = false
document.addEventListener('DOMContentLoaded', () => {
  window.contentDidRender = true
})
document.addEventListener('turbolinks:before-visit', () => {
  window.contentDidRender = false
})
document.addEventListener('turbolinks:render', () => {
  window.contentDidRender = true
})

console.log('[S3RP][Global] Initialized')
