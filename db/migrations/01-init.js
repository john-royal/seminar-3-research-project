'use strict'

/**
 * Create all database tables required for the application.
 * @param {import('knex')} knex
*/
exports.up = async knex => {
  const participants = () => {
    return knex.schema.createTable('participants', t => {
      t.uuid('id')
      t.timestamp('createdAt')
      t.string('name')
      t.string('emailAddress')
      t.string('normalizedEmailAddress')
    })
  }
  const surveys = () => {
    return knex.schema.createTable('surveys', t => {
      t.uuid('id')
      t.timestamp('createdAt')
      t.string('approximateAge')
      t.string('favoriteMusicGenre')
      t.boolean('prefersMusicWhileStudying')
    })
  }
  const sessions = () => {
    return knex.schema.createTable('sessions', t => {
      t.uuid('id')
      t.timestamp('createdAt')

      t.uuid('participant')
      t.foreign('participant').references('id').inTable('participants')

      t.uuid('survey')
      t.foreign('survey').references('id').inTable('surveys')
    })
  }
  const trials = () => {
    return knex.schema.createTable('trials', t => {
      t.uuid('id')
      t.timestamp('createdAt')
      t.timestamp('updatedAt')

      t.uuid('session')
      t.foreign('session').references('id').inTable('sessions')

      t.string('type')
      t.string('song')

      // These are really arrays of numbers, but we're storing them as strings for compatibility with SQLite.
      // We will convert to and from strings in JavaScript.
      t.string('imagesDisplayed')
      t.string('imagesRecalled')
      t.string('imagesLeftover')
    })
  }

  await participants()
  await surveys()
  await sessions()
  await trials()
}

/**
 * Drop all database tables.
 * @param {import('knex')} knex
*/
exports.down = knex => {
  return Promise.all([
    knex.schema.dropTable('participants'),
    knex.schema.dropTable('surveys'),
    knex.schema.dropTable('sessions'),
    knex.schema.dropTable('trials')
  ])
}
