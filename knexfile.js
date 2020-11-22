'use strict'

module.exports = (() => {
  const config = {}

  for (const environment of ['production', 'staging', 'development']) {
    /** @type {import('knex').Config} */
    config[environment] = {
      client: 'sqlite3',
      connection: {
        filename: `./${environment}.sqlite3`
      },
      migrations: {
        directory: './db/migrations'
      },
      useNullAsDefault: true
    }
  }

  return config
})()
