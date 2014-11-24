#!/usr/bin/env node

const _ = require('lodash')
const exec = require('child_process').exec
const fs = require('fs')
const india = require('./india')
const q = require('q')
const semver = require('semver')
const argv = process.argv

var hash1, hash2, filename




// check for arguments
if (argv[2] !== '--' && argv[3] !== '--' && argv[4] !== '--') {
  throw new TypeError('india CLI expects to be called in the form "india :hash -- file.js"')
}

// india :hash -- file.js
if (argv[2] && argv[3] === '--' && argv[4]) {
  hash1 = q.when(argv[2])
  hash2 = getCurrentBranchName()
  filename = q.when(argv[4])
}

// india :hash1 :hash2 -- file.js
else if (argv[2] && argv[3] !== '--' && argv[4] === '--' && argv[5]) {
  hash1 = argv[2]
  hash2 = argv[3]
  filename = q.when(argv[5])
}




q.all([hash1, hash2, filename])
.spread(function (hash1, hash2, filename) {

  return q.all([
    getFileContentsAtCommit(filename, hash1),
    getFileContentsAtCommit(filename, hash2)
  ]).spread(function (fileContentsAtHash1, fileContentsAtHash2) {

    return q.all([
      india.getInterfaceFromContent(fileContentsAtHash1),
      india.getInterfaceFromContent(fileContentsAtHash2)
    ]).spread(function (interface1, interface2) {

      const breaks = india.diffInterface(interface1, interface2, hash1, hash2, fileContentsAtHash1, fileContentsAtHash2, filename)

      getVerisonFromPackageJson().then(function (version) {
        india.suggestVersion(version, breaks)
      })

    })
    .done()

  })
  .done()

})
.done()


function getVerisonFromPackageJson () {

  const deferred = q.defer()

  fs.readFile('./package.json', function (err, data) {

    if (err) {
      deferred.reject(err)
    }

    try {
      deferred.resolve(
        semver.clean(
          JSON.parse(data).version
        )
      )
    } catch (e) {
      deferred.reject(e)
    }

  })

  return deferred.promise

}


function getFileContentsAtCommit (filename, hash) {

  return cmd('git show ' + hash + ':' + filename)

}


function getCurrentBranchName () {

  return cmd('git branch | grep "*"')
    .then(function (output) {

      const branch = output
        .split(' ')[1]
        .split('\n')[0]

      return branch
    
    })

}

function cmd (command) {

  var deferred = q.defer()

  exec(command, function (err, stdout, stderr) {

    if (err || stderr) {
      deferred.reject(err || stderr)
    }

    deferred.resolve(stdout)

  })
  .on('error', deferred.reject)

  return deferred.promise

}