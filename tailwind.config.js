'use strict'

module.exports = {
  purge: [
    './app/views/**/*.njk'
  ],
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/ui')
  ]
}
