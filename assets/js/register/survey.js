/* global Turbolinks */
'use strict'

const configureForm = require('../shared/form')

configureForm('/register/survey', () => {
  Turbolinks.visit('/trials/1/study-photos')
})
