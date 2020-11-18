'use strict'

const t = require('tap')
const util = require('../server/util')

class ExampleClass {
  constructor (number) {
    this.number = number
    this.property1 = 'string'
    this.property2 = true

    Object.defineProperty(this, 'isEqual', {
      enumerable: false,
      value: this.isEqual.bind(this)
    })
  }

  isEqual (el) {
    return el.number === this.number
  }
}

t.test('getRandomElementsFromArray', t => {
  t.plan(2)

  const input = (() => {
    const input = []
    for (let i = 0; i < 100; i++) {
      input.push(new ExampleClass(i))
    }
    return input
  })()

  t.test('returns correct number of elements from array', t => {
    t.plan(1)
    const output = util.getRandomElementsFromArray(input, 48)
    t.equal(output.length, 48)
  })

  t.test('returns unique elements from array', t => {
    const numberRequested = 99
    t.plan(numberRequested)
    const output = util.getRandomElementsFromArray(input, numberRequested)
    const used = []
    for (const item of output) {
      t.notOk(used.find(item1 => item1.isEqual(item)), `Item ${item.number} appeared more than once`)
      used.push(item)
    }
    t.done()
  })
})
