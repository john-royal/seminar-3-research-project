'use strict'

const t = require('tap')
const Genre = require('../../../server/models/content/Genre')

t.test('selects random genre', t => {
  // When
  t.plan(2)
  const output = Genre.getRandom()
  // Then
  t.ok(output)
  t.ok(Object.values(Genre).includes(output))
})

t.test('does not return an excluded genre', t => {
  // Given
  t.plan(2)
  const exclude = Genre.CLASSICAL
  // When
  const output = Genre.getRandom([exclude])
  // Then
  t.ok(output)
  t.notEqual(output, exclude)
})
