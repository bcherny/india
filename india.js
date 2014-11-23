

const _ = require('lodash')
const chalk = require('chalk')
const fs = require('fs')
const parse = require('jsdoc-parse')
const q = require('q')
const vm = require('vm')
const streamifier = require('streamifier')

// validation rules
const rules = require('./rules')

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

function diffInterface (interface1, interface2, hash1, hash2, fileContentsAtHash1, fileContentsAtHash2, filename) {

  rules.forEach(function (rule) {

    try {

      rule.fn(interface1, interface2, {
        hash1: hash1,
        hash2: hash2,
        contents1: fileContentsAtHash1,
        contents2: fileContentsAtHash2,
        filename: filename
      })

      console.info(chalk.green('✔ ' + rule.name))

    } catch (e) {

      if (e.name == 'AssertionError') {

        console.info(chalk.red('✘ ' + rule.name), '\n\t', e.message)

      } else {

        throw e

      }

    }

  })

}

_.extend(module.exports, {
  diffInterface: diffInterface,
  getInterfaceFromContent: getInterfaceFromContent,
  // getInterfaceFromFile: getInterfaceFromFile
})