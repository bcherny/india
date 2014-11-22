

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

  // interface1.forEach(function (method) {

  //   const method2 = _.find(interface2, { name: method.name })

  //   // was the method removed?
  //   if (!method2) {
  //     console.warn('[DESTRUCTIVE CHANGE]', hash1, 'contains method', method.name + ', but', hash2, 'does not')
  //   }

  //   // did the method's arity decrease?
  //   if (method.params.length > method2.params.length) {
  //     console.warn('[DESTRUCTIVE CHANGE] method', method.name, 'has arity', method.params.length, 'at', hash1 + ', but has decreased to', method2.params.length, 'at', hash2)
  //   }

  //   // did the method's arity increase?
  //   if (method.params.length < method2.params.length) {
  //     console.warn('[ADDITIVE CHANGE] method', method.name, 'has arity', method.params.length, 'at', hash1 + ', and has increased to', method2.params.length, 'at', hash2)
  //   }

  //   method.params.forEach(function (param, n) {

  //     const param2 = method2.params[n]

  //     if (!param2) {
  //       return
  //     }

  //     // did a parameter's name change?
  //     if (param.name !== param2.name) {
  //       console.warn('[DESTRUCTIVE CHANGE] parameter', param.name, 'exists in method', method.name, 'at', hash1 + ', but is changed to', param2.name, 'at', hash2)
  //     }

  //     // did a parameter's type change?
  //     if (!param.type.names.every(function (type) {
  //       return param2.type.names.indexOf(type) > -1
  //     })) {
  //       console.warn('[DESTRUCTIVE CHANGE] parameter', param.name, 'is of type', param.type.names.join('|'), 'in method', method.name, 'at', hash1 + ', but has changed to', param2.type.names.join('|'), 'at', hash2)
  //     }

  //   })

  // })

  // interface2.forEach(function (method) {

  //   const method1 = _.find(interface1, { name: method.name })

  //   // was a method added?
  //   if (!method1) {
  //     console.warn('[ADDITIVE CHANGE]', hash1, 'contains method', method.name + ', but', hash2, 'does not')
  //   }

  //   // did a method's arity increase?

  // })

}

_.extend(module.exports, {
  diffInterface: diffInterface,
  getInterfaceFromContent: getInterfaceFromContent,
  // getInterfaceFromFile: getInterfaceFromFile
})