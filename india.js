

const _ = require('lodash')
const fs = require('fs')
const parse = require('jsdoc-parse')
const q = require('q')


function getJsDoc (fileName) {

  var stream = parse(fileName)
    , deferred = q.defer()
    , jsdoc = ''

  stream.on('data', function (data) {
    jsdoc += data
  })

  stream.on('end', function () {
    deferred.resolve(JSON.parse(jsdoc))
  })

  stream.on('error', deferred.reject)

  return deferred.promise

}


function getInterface (fileName) {

  const module = require (fileName)

  getJsDoc(fileName).then(function (jsdoc) {

    const methods = Object
      .keys(module)
      .map(function (name) {
        return _.find(jsdoc, { name: name })
      })

    console.log(methods)

  })

}

function diffInterface (/* interface... */) {

  return _.difference.apply(_, interface)

}

module.exports.diffInterface = diffInterface
module.exports.getInterface = getInterface
