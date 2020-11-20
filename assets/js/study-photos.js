/* global Turbolinks */

'use strict'

const events = require('./shared/events')
const loadAudio = require('./shared/audio')
const setModal = require('./shared/modal')
const study = require('./shared/study')
const Timer = require('./shared/timer')

const internals = {}

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
    study.preparePhotos(photoUrls)
  ])
  return { song }
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
  study.dismissSplashScreen()
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
  const button = document.getElementById('start-button')
  const trialReadyPromise = internals.prepare(window.TRIAL_DESCRIPTION)
  await study.startButtonPressed(button)
  button.classList.add('button--loading')
  try {
    const { song } = await Promise.race([
      trialReadyPromise,
      study.timeout(10000)
    ])
    button.classList.remove('button--loading')
    await internals.runTrial(song)
  } catch (error) {
    button.classList.remove('button--loading')
    console.log('[S3RP][Study Photos] Error')
    console.error(error)
    setModal({
      title: 'Something went wrong',
      message: 'We ran into a problem while preparing your test. Please try again, or if this keeps happening, try refreshing the page.',
      onDismiss: internals.init
    })
  }
}

events.ready(() => {
  internals.href = window.location.href
  internals.init()
})
