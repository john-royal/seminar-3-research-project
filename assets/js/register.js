/* global Turbolinks */
'use strict'

const Form = require('./shared/form')

Form.configure('/register/profile', () => {
  Turbolinks.visit('/register/survey')
})
