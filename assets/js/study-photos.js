/* global Turbolinks, Image */

'use strict'

const loadAudio = require('./shared/audio')
const events = require('./shared/events')
const setModal = require('./shared/modal')
const Timer = require('./shared/timer')

const internals = {}

internals.wait = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Prepare photos for trial
 * @param {string} url
 */
internals.preparePhotos = urls => {
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
 * Prepare audio for trial
 * @param {string} url
 * @returns {Audio}
 */
internals.prepareSong = async url => {
  if (!url) {
    // Return stub so we don't constantly have to check if there's a song
    return { play () {}, pause () {} }
  }

  const audio = await loadAudio(url, 'canplaythrough')

  // Ensure audio stops playing when page changes
  events.unload(() => {
    audio.pause()
  })

  return {
    play () {
      audio.play()
    },
    pause () {
      audio.pause()
    }
  }
}

/**
 * Prepare for trial to start
 * @param {import('../../server/models/Trial')} trial
 */
internals.prepare = async trial => {
  const songUrl = trial.song ? trial.song.path : null // optional chaining not supported in all browsers
  const photoUrls = trial.photos.map(photo => photo.path)
  const [song] = await Promise.all([
    internals.prepareSong(songUrl),
    internals.preparePhotos(photoUrls)
  ])
  return { song }
}

/**
 * Return a promise that resolves when the start button is pressed
 */
internals.startButtonPressed = () => {
  return new Promise(resolve => {
    const button = document.getElementById('start-button')
    events.once(button, 'click', resolve)
  })
}

/**
 * Close the splash screen and show main content instead
 */
internals.dismissSplashScreen = () => {
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

/**
 * Navigate to next step
 */
internals.navigateToNextStep = () => {
  const nextUrl = window.location.href.replace('study-photos', 'break')
  Turbolinks.visit(nextUrl)
}

/**
 * Dismiss the splash screen, play the music, start the timer, and navigate away when time is up
 * @param {Audio} song
 */
internals.runTrial = async (song) => {
  const timer = new Timer()
  internals.dismissSplashScreen()
  song.play()
  await timer.run()
  song.pause()
  internals.navigateToNextStep()
}

/**
 * Save the URL so we don't attempt to initialize the trial on a different page.
 */
internals.href = null

/**
 * Start and run the trial
 * @todo Add a timeout in case the trial isn't ready
 * @todo Make the button show a loading state
 */
internals.init = async () => {
  if (window.location.href !== internals.href) {
    console.log(`[S3RP][Study Photos] Location changed from "${internals.href}", not running init`)
    return
  }
  console.log('[S3RP][Study Photos] Running')
  const trialReadyPromise = internals.prepare(window.TRIAL_DESCRIPTION)
  await internals.startButtonPressed()
  try {
    const { song } = await trialReadyPromise
    await internals.runTrial(song)
  } catch (error) {
    console.log('[S3RP][Study Photos] Error')
    console.error(error)
    setModal({
      title: 'Something went wrong',
      message: 'We ran into a problem while preparing this trial. Please try again.',
      onDismiss: internals.init
    })
  }
}

events.ready(() => {
  internals.href = window.location.href
  internals.init()
})
