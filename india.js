

const _ = require('lodash')
const chalk = require('chalk')
const fs = require('fs')
const parse = require('jsdoc-parse')
const q = require('q')
const vm = require('vm')
const pluralize = require('pluralize')
const semver = require('semver')
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

function diffInterface (interface1, interface2, hash1, hash2, fileContentsAtHash1, fileContentsAtHash2, filename) {

  var breaks = {
    major: 0,
    minor: 0
  }

  console.log('\n')

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

        breaks[rule.type]++

      } else {

        throw e

      }

    }

  })

  return breaks

}

function suggestVersion (version, breaks) {

  var newVersion

  console.log('\n')

  if (semver.lt(version, '1.0.0') && (breaks.major || breaks.minor)) {

    newVersion = semver.inc(version, 'minor')

    console.info(chalk.bold(
      chalk.red('Found', breaks.major, 'backwards-incompatible API ' + pluralize('changes', breaks.major) + '.\n') +
      (breaks.minor ? chalk.blue('Found', breaks.minor, 'backwards-compatible API ' + pluralize('changes', breaks.minor) + '.') + '\n' : '') +
      'Recommend minor version bump',
      '(' + version + ' => ' + newVersion + ').'
    ))

  } else if (breaks.major) {

    newVersion = semver.inc(version, 'major')

    console.info(chalk.bold(
      chalk.red('Found', breaks.major, 'backwards-incompatible API ' + pluralize('changes', breaks.major) + '.\n') +
      (breaks.minor ? chalk.blue('Found', breaks.minor, 'backwards-compatible API ' + pluralize('changes', breaks.minor) + '.') + '\n' : '') +
      'Recommend major version bump',
      '(' + version + ' => ' + newVersion + ').'
    ))

  } else if (breaks.minor) {

    newVersion = semver.inc(version, 'minor')

    console.info(chalk.bold(
      chalk.blue('Found', breaks.minor, 'backwards-compatible API ' + pluralize('changes', breaks.minor) + '.\n') +
      'Recommend minor version bump',
      '(' + version + ' => ' + newVersion + ').'
    ))

  } else {

    newVersion = semver.inc(version, 'patch')

    console.info(chalk.bold(
      chalk.green('No API changes detected.\n') +
      'Recommend patch version bump',
      '(' + version + ' => ' + newVersion + ').'
    ))

  }

  console.log('\n')

  return newVersion

}

_.extend(module.exports, {
  diffInterface: diffInterface,
  getInterfaceFromContent: getInterfaceFromContent,
  suggestVersion: suggestVersion
})