#!/usr/bin/env node

const india = require('./india')

if (process.argv[2]) {
  india.getInterface(process.argv[2])
} else {
  throw new TypeError('india expects a filename')
}
