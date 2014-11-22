
const _ = require('lodash')
const assert = require('assert')

var rules = {

  rules: [],

  add: function (name, fn) {
    this.rules.push({
      name: name,
      fn: fn
    })
  },

  remove: function (name) {
    _.remove(this.rules, function (rule) {
      return rule.name === name
    })
  },

  forEach: function (fn) {
    return this.rules.forEach(fn)
  }

}

// Major

rules.add('A method can\'t be removed', function (int1, int2, meta) {

	int1.forEach(function (method) {
		assert(_.find(int2, { name: method.name }), 'Commit 1 contains method "' + method.name + '", which is not defined at commit 2')
	})
	
})

rules.add('A method\'s arity can\'t decrease', function (int1, int2, meta) {

	int1.forEach(function (method) {

		const method2 = _.find(int2, { name: method.name })
		const arity1 = method.params.length
		const arity2 = method2.params.length

		assert(!(arity1 > arity2), 'Method "' + method.name + '" has arity of ' + arity1 + ' at commit 1, but arity has decreased to ' + arity2 + ' at commit 2')

	})

})

rules.add('A parameter\'s type can\'t become more restrictive', function (int1, int2, meta) {

	
	
})

// Minor

rules.add('A method can\'t be added', function (int1, int2, meta) {

	int2.forEach(function (method) {
		assert(_.find(int1, { name: method.name }), 'Commit 2 contains method "' + method.name + '", which is not defined at commit 1')
	})
	
})

rules.add('A method\'s arity can\'t increase', function (int1, int2, meta) {

	int2.forEach(function (method) {

		const method1 = _.find(int1, { name: method.name })
		const arity2 = method.params.length
		const arity1 = method1.params.length

		assert(!(arity1 < arity2), 'Method "' + method.name + '" has arity of ' + arity1 + ' at commit 1, but arity has increased to ' + arity2 + ' at commit 2')

	})

})

module.exports = rules