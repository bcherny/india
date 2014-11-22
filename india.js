

const _ = require('lodash')
const fs = require('fs')
const parse = require('jsdoc-parse')
const q = require('q')
const vm = require('vm')
const streamifier = require('streamifier')


function getJsDocFromFileName (fileName) {

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

function getJsDocFromFileStream (fileName) {

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


/**
 * Gets an interface from stringified JavaScript code
 * @param  {String} content Stringified JavaScript code (eg. "var foo = 1;")
 * @return {Promise}
 */
function getInterfaceFromContent (content) {

  var jsdoc = ''
  var deferred = q.defer()

  var stream = streamifier
    .createReadStream(content)
    .pipe(parse())

  stream.on('data', function (data) {
    jsdoc += data
  })

  stream.on('end', function () {
    deferred.resolve(JSON.parse(jsdoc))
  })

  stream.on('error', deferred.reject)
  
  return deferred.promise

}


// function getInterfaceFromFile (fileName) {

//   const module = require (fileName)

//   getJsDoc(fileName).then(function (jsdoc) {

//     const methods = Object
//       .keys(module)
//       .map(function (name) {
//         return _.find(jsdoc, { name: name })
//       })

//     console.log(methods)

//   })

// }

function diffInterface (/* interface... */) {

  return _.difference.apply(_, arguments)

}

_.extend(module.exports, {
  diffInterface: diffInterface,
  getInterfaceFromContent: getInterfaceFromContent,
  // getInterfaceFromFile: getInterfaceFromFile
})