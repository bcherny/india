#!/usr/bin/env node

const _ = require('lodash')
const exec = require('child_process').exec
const india = require('./india')
const q = require('q')
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

    console.log('got contents')

    return q.all([
      india.getInterfaceFromContent(fileContentsAtHash1),
      india.getInterfaceFromContent(fileContentsAtHash2)
    ]).spread(function (interface1, interface2) {

      console.info('got interfaces', require('util').inspect(interface1[0].params[0].type))

      india.diffInterface(interface1, interface2, hash1, hash2)

    })
    .done()

  })
  .done()

})
.done()




function getFileContentsAtCommit (filename, hash) {

  return cmd('git show ' + hash + ':' + filename)

}


function getCurrentBranchName () {

  return cmd('git branch | grep "*"')
    .then(function (output) {

      const branch = output
        .split(' ')[1]
        .split('\n')[0]

      console.info('current branch is:', branch)

      return branch
    
    })

}

function cmd (command) {

  console.info('[cmd]', command)

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