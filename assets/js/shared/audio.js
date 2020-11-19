'use strict'

/**
 * Load the given audio resource and resolve when the audio is ready.
 * @param {string} url
 * @param {'canplay'|'canplaythrough'} event
 */
module.exports = (url, event = 'canplay') => {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url)
    if (audio.error) {
      return reject(audio.error)
    }
    audio.addEventListener(event, () => {
      resolve(audio)
    })
    audio.addEventListener('error', e => {
      reject(e.error)
    })
  })
}
