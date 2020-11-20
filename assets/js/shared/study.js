/* global Image */
'use strict'

const events = require('./events')

const internals = {}

internals.wait = ms => new Promise(resolve => setTimeout(resolve, ms))

class TimeoutExceededError extends Error {}
exports.TimeoutExceededError = TimeoutExceededError
exports.timeout = ms => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new TimeoutExceededError())
    }, ms)
  })
}

/**
 * Prepare photos for trial
 * @param {string} url
 */
exports.preparePhotos = urls => {
  const waitForPhotoNoRetry = url => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = reject
      img.src = url
    })
  }
  const waitForPhoto = async (url, attempt = 0) => {
    try {
      return await waitForPhotoNoRetry(url)
    } catch (error) {
      if (attempt > 2) {
        console.warn(`[S3RP][Study Photos] Image at URL ${url} failed to load after ${attempt} attempts`)
        throw error
      }
      await internals.wait(0.3 * (2 ** (attempt - 1)) * 1000) // Retry wait time used by Ky module
      return waitForPhoto(url, attempt + 1)
    }
  }
  return Promise.all(urls.map(url => waitForPhoto(url)))
}

/**
 * Return a promise that resolves when the start button is pressed
 */
exports.startButtonPressed = button => {
  return new Promise(resolve => {
    events.once(button, 'click', resolve)
  })
}

/**
 * Close the splash screen and show main content instead
 */
exports.dismissSplashScreen = () => {
  const hideSplash = () => {
    const elements = [
      document.querySelector('.splash'),
      document.querySelector('.button-wrapper')
    ]
    elements.forEach(element => {
      element.classList.add('hidden')
    })
  }
  const showPageContent = () => {
    const header = document.querySelector('.study-header')
    header.classList.remove('study-header--hidden')
    const content = document.querySelector('.study-content')
    content.classList.remove('study-content--hidden')
  }
  hideSplash()
  showPageContent()
}
