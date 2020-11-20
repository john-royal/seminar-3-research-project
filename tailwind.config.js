'use strict'

module.exports = {
  purge: [
    './server/views/**/*.njk'
  ],
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/ui')
  ]
}
