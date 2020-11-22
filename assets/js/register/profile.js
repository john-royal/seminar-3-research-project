/* global Turbolinks */
'use strict'

const configureForm = require('../shared/form')

configureForm('/register/profile', () => {
  Turbolinks.visit('/register/survey')
})
