'use strict'

const ky = require('ky/umd')
const events = require('./shared/events')
const setModal = require('./shared/modal')
const study = require('./shared/study')

const internals = {}

internals.href = null
internals.photoFollowingCursor = null
internals.photoMoveCandidate = null
internals.photoSlots = []

internals.updatePhotoFollowingCursor = event => {
  internals.photoFollowingCursor.style.left = `${event.pageX}px`
  internals.photoFollowingCursor.style.top = `${event.pageY}px`
}

internals.findPhotoMoveCandidate = (x, y) => {
  return internals.photoSlots.find(slot => {
    const rect = slot.getBoundingClientRect()
    return (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    )
  })
}

internals.setPhotoMoveCandidate = newPhotoMoveCandidate => {
  if (internals.photoMoveCandidate) {
    internals.photoMoveCandidate.classList.remove('slot--highlight')
  }
  if (newPhotoMoveCandidate) {
    newPhotoMoveCandidate.classList.add('slot--highlight')
  }
  internals.photoMoveCandidate = newPhotoMoveCandidate
}

internals.updatePhotoMoveCandidate = event => {
  const x = event.pageX
  const y = event.pageY
  const foundPhotoMoveCandidate = internals.findPhotoMoveCandidate(x, y)
  if (foundPhotoMoveCandidate) {
    internals.setPhotoMoveCandidate(foundPhotoMoveCandidate)
  } else if (internals.photoMoveCandidate) {
    internals.setPhotoMoveCandidate(null)
  }
}

internals.handleCursorLocationChange = event => {
  internals.updatePhotoFollowingCursor(event)
  internals.updatePhotoMoveCandidate(event)
}

internals.setPhotoFollowingCursor = photoNumber => {
  const element = internals.photoFollowingCursor
  const formerPhotoNumber = element.dataset.photoNumber
  if (formerPhotoNumber) {
    element.classList.remove(`photo-${formerPhotoNumber}`)
  }
  element.dataset.photoNumber = photoNumber
  if (photoNumber) {
    element.classList.add(`photo-${photoNumber}`)
    if (element.classList.contains('hidden')) {
      element.classList.remove('hidden')
    }
  } else if (!element.classList.contains('hidden')) {
    element.classList.add('hidden')
  }
}

internals.movePhoto = (sourceSlot, targetSlot) => {
  const movedPhotoNumber = sourceSlot.dataset.photoNumber
  const displacedPhotoNumber = targetSlot.dataset.photoNumber

  sourceSlot.dataset.photoNumber = displacedPhotoNumber
  targetSlot.dataset.photoNumber = movedPhotoNumber

  const movedPhotoClassName = `photo-${movedPhotoNumber}`
  sourceSlot.classList.remove(movedPhotoClassName)
  targetSlot.classList.add(movedPhotoClassName)

  if (displacedPhotoNumber) {
    const displacedPhotoClassName = `photo-${displacedPhotoNumber}`
    targetSlot.classList.remove(displacedPhotoClassName)
    sourceSlot.classList.add(displacedPhotoClassName)
  } else {
    sourceSlot.classList.remove('slot--has-photo')
    targetSlot.classList.add('slot--has-photo')
  }
}

/** @param {HTMLElement} slot */
internals.attachEventListenerToSlot = slot => {
  const handleMouseDown = event => {
    const photoNumber = slot.dataset.photoNumber
    if (!photoNumber) {
      if (slot.classList.contains('slot--has-photo')) {
        throw new Error(`Slot "${slot.id}" has class "slot--has-photo" even though data-photo-number is undefined`)
      } else {
        console.warn(`[S3RP] Slot "${slot.id}" cannot be selected because it does not have a photo number set`)
        return
      }
    }

    slot.classList.add('slot--highlight')
    document.body.classList.add('unselectable')

    internals.handleCursorLocationChange(event)
    internals.setPhotoFollowingCursor(photoNumber)

    const handleMouseUp = event => {
      slot.classList.remove('slot--highlight')
      document.body.classList.remove('unselectable')

      internals.handleCursorLocationChange(event)
      internals.setPhotoFollowingCursor(null)

      if (internals.photoMoveCandidate) {
        internals.movePhoto(slot, internals.photoMoveCandidate)
      }

      document.removeEventListener('mousemove', internals.handleCursorLocationChange)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', internals.handleCursorLocationChange)
    document.addEventListener('mouseup', handleMouseUp)
  }
  events.lifetime(slot, 'mousedown', handleMouseDown)
}

/**
 * Navigate to next step
 */
internals.navigateToNextStep = () => {
  const nextUrl = window.location.href.replace('memory-test', 'complete')
  Turbolinks.visit(nextUrl)
}

internals.submitTestResults = async () => {
  if (window.location.href !== internals.href) {
    console.log(`[S3RP][Memory Test] Location changed from "${internals.href}", not attempting to submit test results`)
    return
  }

  const testResults = (() => {
    const extractPhotoNumbers = elements => {
      return Array.from(elements)
        .map(slot => {
          return slot.dataset.photoNumber || null
        })
        .map(photoNumber => {
          return photoNumber ? Number(photoNumber) : null
        })
    }

    const recalled = extractPhotoNumbers(document.querySelectorAll('.js-target-slot'))
    const leftover = extractPhotoNumbers(document.querySelectorAll('.js-source-slot')).filter(photoNumber => !!photoNumber)
    return { recalled, leftover }
  })()

  try {
    const response = await ky.post(window.location.href, {
      json: testResults,
      retry: { limit: 3 }
    }).json()
    if (response.status !== 'success') {
      throw new Error('Unexpected response from server')
    }
    console.log(response)
    internals.navigateToNextStep()
  } catch (error) {
    console.log('[S3RP][Memory Test] Error submitting test results')
    console.error(error)
    setModal({
      title: 'Something went wrong',
      message: 'We ran into a problem while submitting your test results. Please try again.',
      onDismiss: internals.submitTestResults
    })
  }
}

internals.prepare = async trial => {
  const photoUrls = trial.photos.map(photo => photo.path)
  await study.preparePhotos(photoUrls)

  internals.photoFollowingCursor = document.getElementById('photo-following-cursor')
  internals.photoSlots = Array.from(document.querySelectorAll('.slot'))

  internals.photoSlots.forEach(internals.attachEventListenerToSlot)

  events.lifetime(document.getElementById('finish-button'), 'click', internals.submitTestResults)
}

internals.init = async () => {
  if (window.location.href !== internals.href) {
    console.log(`[S3RP][Memory Test] Location changed from "${internals.href}", not attempting to init`)
    return
  }

  console.log('[S3RP][Memory Test] Preparing')
  const trialReadyPromise = internals.prepare(window.TRIAL_DESCRIPTION)
  await study.startButtonPressed()

  console.log('[S3RP][Memory Test] Button pressed')
  try {
    await trialReadyPromise
    console.log('[S3RP][Memory Test] Running')
    study.dismissSplashScreen()
  } catch (error) {
    console.log('[S3RP][Memory Test] Error')
    console.error(error)
    setModal({
      title: 'Something went wrong',
      message: 'We ran into a problem while preparing your test. Please try again.',
      onDismiss: internals.init
    })
  }
}

events.ready(() => {
  internals.href = window.location.href
  internals.init()
})
