#!/usr/bin/env node

const _ = require('lodash')
const india = require('./india')

if (process.argv[2] && process.argv[3]) {

  const interface1 = india.getInterface(process.argv[2])
  const interface2 = india.getInterface(process.argv[3])

  console.log(india.diffInterface(interface1, interface2))

} else {
  throw new TypeError('india expects 2 filenames')
}
