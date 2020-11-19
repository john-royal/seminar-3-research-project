/* global Turbolinks */

'use strict'

console.log('[S3RP] Study photos script loaded')

const loadAudio = require('./shared/audio')
const setModal = require('./shared/modal')
const Timer = require('./shared/timer')

const internals = {}

internals.waitForImage = src => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

internals.wait = ms => new Promise(resolve => setTimeout(resolve, ms))

internals.waitForImageWithRetry = async (src, retry = 0) => {
  try {
    return await internals.waitForImage(src)
  } catch (error) {
    console.error(`[S3RP] Failed to load image with url ${src}`)
    if (retry >= 3) {
      throw error
    }
    await internals.wait(50)
    return internals.waitForImageWithRetry(src, retry + 1)
  }
}

internals.waitForAllImages = imageUrls => {
  return Promise.all(imageUrls.map(src => internals.waitForImageWithRetry(src)))
}

internals.setOpacity = (elementIds, opacity) => {
  elementIds.forEach(elementId => {
    const element = document.getElementById(elementId)
    if (!element) {
      console.warn(`Couldn't find element #${elementId}`)
    }
    element.style.opacity = opacity
  })
}

internals.prepareForTrial = async (imageUrls, songUrl) => {
  const audioPromise = songUrl ? loadAudio(songUrl, 'canplaythrough') : Promise.resolve()
  const imagesPromise = internals.waitForAllImages(imageUrls)
  const [audio] = await Promise.all([audioPromise, imagesPromise])
  return { audio }
}

internals.run = callback => {
  let didRun = false
  const run = () => {
    document.removeEventListener('turbolinks:load', run)
    didRun = true
    callback()
  }
  const backupRun = () => {
    document.removeEventListener('DOMContentLoaded', backupRun)
    if (!didRun) {
      console.warn('Unable to initialize photo grid via Turbolinks; doing so via DOMContentLoaded instead')
      callback()
    }
  }
  document.addEventListener('turbolinks:load', run)
  document.addEventListener('DOMContentLoaded', backupRun)
}

internals.startButtonPromise = () => {
  return new Promise(resolve => {
    const startButton = document.getElementById('start-button')
    const onClick = () => {
      startButton.removeEventListener('click', onClick)
      resolve()
    }
    startButton.addEventListener('click', onClick)
  })
}

async function studyPhotosHandler () {
  try {
    console.log('[S3RP] Study photos script is running')
    const trial = window.TRIAL_DESCRIPTION
    const [{ audio }] = await Promise.all([
      internals.prepareForTrial(trial.photosDisplayed.map(photo => photo.path), trial.song ? trial.song.path : null),
      internals.startButtonPromise()
    ])
    if (audio) {
      audio.play()
    }
    const timerElement = document.querySelector('[data-timer-length]')
    const timer = new Timer(timerElement)
    for (const element of document.querySelectorAll('.collapsed')) {
      element.classList.remove('collapsed')
    }
    for (const element of document.querySelectorAll('.hidden')) {
      element.classList.remove('hidden')
    }
    for (const element of [document.querySelector('.button'), document.querySelector('.splash')]) {
      element.classList.add('hidden')
    }
    try {
      await timer.run()
    } catch (error) {}
    if (audio) {
      audio.pause()
    }
    Turbolinks.visit(window.location.href.replace('study-photos', 'break'))
  } catch (error) {
    console.error(error)
    setModal({
      title: 'Something went wrong',
      message: 'We ran into a problem while preparing this trial. Please try again.',
      onDismiss: studyPhotosHandler
    })
  }
}
internals.run(studyPhotosHandler)
