

const _ = require('lodash')
const chalk = require('chalk')
const handlebars = require('handlebars')
const parse = require('jsdoc-parse')
const q = require('q')
const pluralize = require('pluralize')
const semver = require('semver')
const streamifier = require('streamifier')
const util = require('util')


// validation rules
const rules = require('./rules')


/**
 * Gets an interface from stringified JavaScript code
 * @param  {String} content Stringified JavaScript code (eg. "var foo = 1;")
 * @return {Promise}
 */
function getInterface (content) {

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

function diffInterface (interface1, interface2, hash1, hash2) {

  const data = {
    hash1: hash1,
    hash2: hash2
  }

  var breaks = {
    major: 0,
    minor: 0
  }

  util.puts('\n')

  rules.forEach(function (rule) {

    try {

      rule.fn(interface1, interface2)

      util.puts(chalk.green('✔ ' + rule.name))

    } catch (e) {

      if (e.name == 'AssertionError') {

        util.puts(
          chalk.red('✘ ' + rule.name),
          '  ' + handlebars.compile(e.message)(data)
        )

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

  util.puts('\n')

  if (semver.lt(version, '1.0.0') && (breaks.major || breaks.minor)) {

    newVersion = semver.inc(version, 'minor')

    util.puts(chalk.bold(
      chalk.red('Found', breaks.major, 'backwards-incompatible API ' + pluralize('changes', breaks.major) + '.\n') +
      (breaks.minor ? chalk.blue('Found', breaks.minor, 'backwards-compatible API ' + pluralize('changes', breaks.minor) + '.') + '\n' : '') +
      'Recommend minor version bump',
      '(' + version + ' => ' + newVersion + ').'
    ))

  } else if (breaks.major) {

    newVersion = semver.inc(version, 'major')

    util.puts(chalk.bold(
      chalk.red('Found', breaks.major, 'backwards-incompatible API ' + pluralize('changes', breaks.major) + '.\n') +
      (breaks.minor ? chalk.blue('Found', breaks.minor, 'backwards-compatible API ' + pluralize('changes', breaks.minor) + '.') + '\n' : '') +
      'Recommend major version bump',
      '(' + version + ' => ' + newVersion + ').'
    ))

  } else if (breaks.minor) {

    newVersion = semver.inc(version, 'minor')

    util.puts(chalk.bold(
      chalk.blue('Found', breaks.minor, 'backwards-compatible API ' + pluralize('changes', breaks.minor) + '.\n') +
      'Recommend minor version bump',
      '(' + version + ' => ' + newVersion + ').'
    ))

  } else {

    newVersion = semver.inc(version, 'patch')

    util.puts(chalk.bold(
      chalk.green('No API changes detected.\n') +
      'Recommend patch version bump',
      '(' + version + ' => ' + newVersion + ').'
    ))

  }

  util.puts('\n')

  return newVersion

}

_.extend(module.exports, {
  diffInterface: diffInterface,
  getInterface: getInterface,
  suggestVersion: suggestVersion
})