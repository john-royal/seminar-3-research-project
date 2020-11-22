'use strict'

const EMAIL_ADDRESS_SCRAMBLED = 'P.e.R.s.O.n+Muahahaha@gMaIl.cOm'
const EMAIL_ADDRESS_NORMALIZED = 'person@gmail.com'

const Keyv = require('keyv')
const t = require('tap')
const Profile = require('../../app/models/Profile')

t.beforeEach((done, t) => {
  t.context.keyv = new Keyv()
  t.context.store = new Profile.Store(t.context.keyv)
  done()
})

t.afterEach((done, t) => {
  t.context.keyv = null
  t.context.store = null
  done()
})

t.test('reads existing profile from store', async t => {
  // Given
  t.plan(1)
  const expected = new Profile({
    id: '1',
    name: 'Person',
    emailAddress: EMAIL_ADDRESS_SCRAMBLED,
    normalizedEmailAddress: EMAIL_ADDRESS_NORMALIZED
  })
  await t.context.keyv.set(EMAIL_ADDRESS_NORMALIZED, expected)
  // When
  const actual = await t.context.store.findByEmailAddressOrCreate(EMAIL_ADDRESS_NORMALIZED)
  // Then
  t.deepEqual(actual, expected)
})

t.test('normalizes email address and reads existing profile from store', async t => {
  // Given
  t.plan(1)
  const expected = new Profile({
    id: '1',
    name: 'Person',
    emailAddress: EMAIL_ADDRESS_SCRAMBLED,
    normalizedEmailAddress: EMAIL_ADDRESS_NORMALIZED
  })
  await t.context.keyv.set(EMAIL_ADDRESS_NORMALIZED, expected)
  // When
  const actual = await t.context.store.findByEmailAddressOrCreate(EMAIL_ADDRESS_SCRAMBLED)
  // Then
  t.deepEqual(actual, expected)
})

t.test('returns new profile if one does not exist in store', async t => {
  // Given
  t.plan(4)
  // When
  const actual = await t.context.store.findByEmailAddressOrCreate(EMAIL_ADDRESS_SCRAMBLED)
  // Then
  t.ok(actual.id)
  t.notOk(actual.name)
  t.equal(actual.emailAddress, EMAIL_ADDRESS_SCRAMBLED)
  t.equal(actual.normalizedEmailAddress, EMAIL_ADDRESS_NORMALIZED)
})

t.test('saves new profile to store', async t => {
  // Given
  t.plan(4)
  await t.context.store.findByEmailAddressOrCreate(EMAIL_ADDRESS_SCRAMBLED)
  // When
  const actual = await t.context.keyv.get(EMAIL_ADDRESS_NORMALIZED)
  // Then
  t.ok(actual.id)
  t.notOk(actual.name)
  t.equal(actual.emailAddress, EMAIL_ADDRESS_SCRAMBLED)
  t.equal(actual.normalizedEmailAddress, EMAIL_ADDRESS_NORMALIZED)
})

t.test('updates store when Profile#save() is called', async t => {
  // Given
  t.plan(1)
  const EXAMPLE_NAME = 'Jane Doe'
  const sut = await t.context.store.findByEmailAddressOrCreate(EMAIL_ADDRESS_SCRAMBLED)
  sut.name = EXAMPLE_NAME
  await sut.save()
  // When
  const actual = await t.context.keyv.get(EMAIL_ADDRESS_NORMALIZED)
  // Then
  t.equal(actual.name, EXAMPLE_NAME)
})
