'use strict'

const t = require('tap')
const { build } = require('../helper')

t.test('GET /register/profile', async t => {
  // Given
  t.plan(2)
  const app = build(t)
  // When
  const response = await app.inject({
    method: 'GET',
    url: '/register/profile'
  })
  // Then
  t.equal(response.statusCode, 200)
  t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
})

t.test('POST /register/profile', t => {
  t.plan(3)

  t.beforeEach(async (done, t) => {
    // Given
    const app = build(t)
    const payload = {
      name: 'Jane Doe',
      email: 'Jane.Doe@macaulay.cuny.edu'
    }
    // When
    const response = await app.inject({
      method: 'POST',
      url: '/register/profile',
      payload: payload
    })
    const data = await response.json()
    t.context = { app, response, data }
    done()
  })

  t.test('returns 200 status code', t => {
    t.plan(1)
    // Then
    const { response } = t.context
    t.equal(response.statusCode, 200)
  })

  t.test('sets cookie with participant ID', t => {
    t.plan(4)
    // Then
    const { response } = t.context
    t.equal(response.cookies.length, 1)
    t.equal(response.cookies[0].name, 'participantId')
    t.type(response.cookies[0].value, 'string')
    t.equal(response.cookies[0].path, '/')
  })

  t.test('returns expected response body', t => {
    t.plan(1)
    // Then
    const { response, data } = t.context
    const participantId = response.cookies[0].value
    t.deepEqual(data, {
      success: true,
      participantId
    })
  })
})

t.test('GET /register/survey', async t => {
  t.plan(2)

  t.test('returns HTML with 200 status code', async t => {
    // Given
    t.plan(2)
    const app = build(t)
    const profileResponse = await app.inject({
      method: 'POST',
      url: '/register/profile',
      payload: { name: 'Jane Doe', email: 'Jane.Doe@macaulay.cuny.edu' }
    })
    const profileResponseData = await profileResponse.json()
    const participantId = profileResponseData.participantId
    // When
    const response = await app.inject({
      method: 'GET',
      url: '/register/survey',
      cookies: { participantId }
    })
    // Then
    t.equal(response.statusCode, 200)
    t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
  })

  t.test('redirects to /register/profile if profile could not be found', async t => {
    // Given
    t.plan(1)
    const app = build(t)
    // When
    const response = await app.inject({
      method: 'GET',
      url: '/register/survey',
      cookies: { participantId: 'invalid participant ID' }
    })
    // Then
    t.equal(response.statusCode, 302)
  })
})

t.test('POST /register/survey', async t => {
  t.beforeEach(async (done, t) => {
    const app = build(t)
    const profileResponse = await app.inject({
      method: 'POST',
      url: '/register/profile',
      payload: { name: 'Jane Doe', email: 'Jane.Doe1@macaulay.cuny.edu' }
    })
    const profileResponseData = await profileResponse.json()
    const participantId = profileResponseData.participantId
    const surveyResponse = await app.inject({
      method: 'POST',
      url: '/register/survey',
      payload: {
        'approximate-age': '18-24',
        'preferred-genre': 'hip-hop-rap',
        'prefers-music-while-studying': 'yes'
      },
      cookies: { participantId }
    })
    const surveyResponseData = await surveyResponse.json()
    if (surveyResponseData.statusCode === 500) {
      console.error(surveyResponseData)
      t.fail()
    }
    t.context = { app, response: surveyResponse, responseData: surveyResponseData, participantId }
    done()
  })

  t.plan(2)

  t.test('returns JSON with 200 status code', async t => {
    t.plan(2)
    const { response } = t.context
    t.equal(response.statusCode, 200)
    t.equal(response.headers['content-type'], 'application/json; charset=utf-8')
  })

  t.test('returns valid trials', async t => {
    t.plan(5)
    const trials = Array.from(t.context.responseData)
    t.equal(trials.length, 4)
    const controlTrial = trials.find(trial => trial.type === 'Control')
    const randomAssignedGenreTrial = trials.find(trial => trial.type === 'Randomly Assigned Genre')
    const preferredGenreTrial = trials.find(trial => trial.type === 'Preferred Genre')
    const classicalTrial = trials.find(trial => trial.type === 'Classical')
    t.ok(controlTrial)
    t.ok(randomAssignedGenreTrial)
    t.ok(preferredGenreTrial)
    t.ok(classicalTrial)
  })
})

t.test('POST /register/survey fails without valid participant ID', async t => {
  t.plan(1)

  const app = build(t)
  const response = await app.inject({
    method: 'POST',
    url: '/register/survey',
    cookies: { participantId: 'invalid participant ID' }
  })
  t.equal(response.statusCode, 400)
})
