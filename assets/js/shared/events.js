'use strict'

/**
 * Attach an event listener that lasts the lifetime of the page.
 * This will be removed when the page is unloaded.
 * @param {HTMLElement[]} elements
 * @param {string} event
 * @param {function} action
 */
exports.lifetime = (elements, event, action) => {
  if (!Array.isArray(elements)) {
    elements = [elements]
  }
  for (const element of elements) {
    element.addEventListener(event, action)
  }
  exports.once(document, 'turbolinks:before-visit', () => {
    for (const element of elements) {
      element.removeEventListener(event, action)
    }
  })
}

/**
 * Respond to an event with the given callback function.
 * The event listener will be removed after one use.
 * @param {HTMLElement[]} elements
 * @param {string} event
 * @param {function} action
 */
exports.once = (elements, event, action) => {
  if (!Array.isArray(elements)) {
    elements = [elements]
  }
  const callback = () => {
    for (const element of elements) {
      element.removeEventListener(event, callback)
    }
    action()
  }
  for (const element of elements) {
    element.addEventListener(event, callback)
  }
}

/**
 * Run the given callback function when the page is ready.
 * @param {function} action
 */
exports.ready = action => {
  if (window.contentDidRender) {
    return action()
  }
  const callback = () => {
    document.removeEventListener('turbolinks:render', callback)
    document.removeEventListener('DOMContentLoaded', callback)
    action()
  }
  document.addEventListener('turbolinks:render', callback)
  document.addEventListener('DOMContentLoaded', callback)
}

/**
 * Run the given callback function when the page is unloaded.
 * @param {function} action
 */
exports.unload = action => {
  const callback = () => {
    document.removeEventListener('turbolinks:before-visit', callback)
    action()
  }
  document.addEventListener('turbolinks:before-visit', callback)
}
