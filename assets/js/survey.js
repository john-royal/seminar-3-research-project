/* global Turbolinks */
'use strict'

const Form = require('./shared/form')

Form.configure('/register/survey', () => {
  Turbolinks.visit('/trials/1/study-photos')
})
