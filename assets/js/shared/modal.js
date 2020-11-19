'use strict'

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 *
 * @param {Object} content
 * @param {string} content.title
 * @param {string} content.message
 * @param {function?} content.onDismiss
 */
module.exports = content => {
  const modal = document.querySelector('.modal')

  const title = modal.querySelector('.modal__title')
  const message = modal.querySelector('.modal__message')
  title.textContent = content.title
  message.textContent = content.message

  modal.classList.add('modal--will-enter')
  timeout(10)
    .then(() => {
      modal.classList.add('modal--visible')
      return timeout(300)
    })
    .then(() => {
      modal.classList.remove('modal--will-enter')
    })

  const dismiss = () => {
    if (content.onDismiss) {
      content.onDismiss()
    }
    modal.classList.add('modal--will-leave')
    timeout(10)
      .then(() => {
        modal.classList.remove('modal--visible')
        return timeout(200)
      })
      .then(() => {
        title.textContent = ''
        message.textContent = ''
        modal.classList.remove('modal--will-leave')
      })
  }
  document.querySelector('.modal__background-wrapper').onclick = dismiss
  document.querySelector('.modal__button').onclick = dismiss
}
