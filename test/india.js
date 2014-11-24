const india = require('../india')

// mocks
require('util').puts = function(){}

// tests
exports.suggestVersion = function (test) {

  const ios = [
    { in: ['0.0.0', { major: 0, minor: 0 }], out: '0.0.1' },
    { in: ['0.0.1', { major: 0, minor: 0 }], out: '0.0.2' },
    { in: ['0.1.0', { major: 0, minor: 0 }], out: '0.1.1' },
    { in: ['1.0.0', { major: 0, minor: 0 }], out: '1.0.1' },
    { in: ['1.1.0', { major: 0, minor: 0 }], out: '1.1.1' },
    { in: ['0.0.0', { major: 0, minor: 1 }], out: '0.1.0' },
    { in: ['0.0.0', { major: 2, minor: 1 }], out: '0.1.0' },
    { in: ['0.1.0', { major: 0, minor: 3 }], out: '0.2.0' },
    { in: ['0.1.0', { major: 3, minor: 0 }], out: '0.2.0' },
    { in: ['0.1.0', { major: 3, minor: 3 }], out: '0.2.0' },
    { in: ['1.2.3', { major: 0, minor: 3 }], out: '1.3.0' },
    { in: ['1.2.3', { major: 3, minor: 0 }], out: '2.0.0' },
    { in: ['1.2.3', { major: 3, minor: 3 }], out: '2.0.0' }
  ]

  ios.forEach(function (io) {
    test.equal(india.suggestVersion.apply(null, io.in), io.out)
  })

  test.expect(ios.length)
  test.done()

}

// TODO: test for #diffInterface and #getInterface