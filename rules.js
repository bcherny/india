
const _ = require('lodash')
const assert = require('assert')
const ordinal = require('ordinal').english

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

rules.add('A method\'s parameters can\'t be removed', function (int1, int2, meta) {

	int1.forEach(function (method) {

		const method2 = _.find(int2, { name: method.name })

		method.params.forEach(function (param) {

			assert(_.find(method2.params, { name: param.name }), 'Method "' + method.name + '" accepts a  parameter "' + param.name + '" at commit 1, but was removed at commit 2')

		})

	})

})

rules.add('A method\'s parameters can\'t be reordered', function (int1, int2, meta) {

	int1.forEach(function (method) {

		const method2 = _.find(int2, { name: method.name })

		method.params.forEach(function (param, n) {

			const param2 = _.find(method2.params, { name: param.name })
			const n2 = method2.params.indexOf(param2)

			// if the parameter doesn't exist at commit 2, we can't check order
			if (n2 < 0) return

			assert(param2 && n == n2, 'Method "' + method.name + '"\'s ' + ordinal(n) + ' parameter is "' + param.name + '" at commit 1, but is the ' + ordinal(n2) + ' parameter at commit 2')

		})

	})

})

rules.add('A parameter\'s type can\'t become more restrictive', function (int1, int2, meta) {

	int1.forEach(function (method) {

		const method2 = _.find(int2, { name: method.name })

		method.params.forEach(function (param) {

			const param2 = _.find(method2.params, { name: param.name })
			const types1 = param.type.names
			const types2 = param2.type.names

			assert(types1.every(function (type) {
				return types2.indexOf(type) > -1
			}), 'Method "' + method.name + '"\'s parameter "' + param.name + '" is of type "' + types1.join('|') + '" at commit 1, but is "' + types2.join('|') + '" at commit 2')

		})

	})

})

rules.add('A method\'s return type can\'t change', function (int1, int2, meta) {

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

		// if the method doesn't exist at hash2 in the first place, we can't test this
		if (!method1) return

		const arity2 = method.params.length
		const arity1 = method1.params.length

		assert(!(arity1 < arity2), 'Method "' + method.name + '" has arity of ' + arity1 + ' at commit 1, but arity has increased to ' + arity2 + ' at commit 2')

	})

})

rules.add('A parameter\'s type can\'t become less restrictive', function (int1, int2, meta) {

	
	
})

module.exports = rules