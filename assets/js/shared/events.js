'use strict'

/**
 * Attach an event listener that lasts the lifetime of the page.
 * This will be removed when the page is unloaded.
 * @param {HTMLElement} element
 * @param {string} event
 * @param {function} action
 */
exports.lifetime = (element, event, action) => {
  element.addEventListener(event, action)
  exports.once(document, 'turbolinks:before-visit', () => {
    element.removeEventListener(event, action)
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
  const callback = () => {
    document.removeEventListener('DOMContentLoaded', callback)
    document.removeEventListener('turbolinks:visit', callback)
    action()
  }
  document.addEventListener('DOMContentLoaded', callback)
  document.addEventListener('turbolinks:visit', callback)
}
