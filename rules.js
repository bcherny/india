
const _ = require('lodash')
const assert = require('assert')
const ordinal = require('ordinal').english

var rules = {

  rules: [],

  add: function (name, fn, type) {
    this.rules.push({
      name: name,
      fn: fn,
      type: type
    })
  },

  major: function (name, fn) {
    this.add(name, fn, 'major')
  },

  minor: function (name, fn) {
    this.add(name, fn, 'minor')
  },

  remove: function (ns, name) {
    _.remove(this.rules[ns], function (rule) {
      return rule.name === name
    })
  },

  forEach: function (fn) {
    return this.rules.forEach(fn)
  }

}

// Major

rules.major('A method can\'t be removed', function (int1, int2) {

    int1.forEach(function (method) {
        assert(_.find(int2, { name: method.name }), '{{ hash1 }} contains method "' + method.name + '", which is not defined at {{ hash2 }}')
    })
    
})

rules.major('A method\'s arity can\'t decrease', function (int1, int2) {

    int1.forEach(function (method) {

        const method2 = _.find(int2, { name: method.name })
        const arity1 = method.params.length
        const arity2 = method2.params.length

        assert(!(arity1 > arity2), 'Method "' + method.name + '" has arity of ' + arity1 + ' at {{ hash1 }}, but arity has decreased to ' + arity2 + ' at {{ hash2 }}')

    })

})

rules.major('A method\'s parameters can\'t be removed', function (int1, int2) {

    int1.forEach(function (method) {

        const method2 = _.find(int2, { name: method.name })

        method.params.forEach(function (param) {

            assert(_.find(method2.params, { name: param.name }), 'Method "' + method.name + '" accepts a  parameter "' + param.name + '" at {{ hash1 }}, but was removed at {{ hash2 }}')

        })

    })

})

rules.major('A method\'s parameters can\'t be reordered', function (int1, int2) {

    int1.forEach(function (method) {

        const method2 = _.find(int2, { name: method.name })

        method.params.forEach(function (param, n) {

            const param2 = _.find(method2.params, { name: param.name })
            const n2 = method2.params.indexOf(param2)

            // if the parameter doesn't exist at commit 2, we can't check order
            if (n2 < 0) return

            assert(param2 && n == n2, 'Method "' + method.name + '"\'s ' + ordinal(n) + ' parameter is "' + param.name + '" at {{ hash1 }}, but is the ' + ordinal(n2) + ' parameter at {{ hash2 }}')

        })

    })

})

rules.major('A parameter\'s type can\'t become more restrictive', function (int1, int2) {

    int1.forEach(function (method) {

        const method2 = _.find(int2, { name: method.name })

        if (!method2) return

        method.params.forEach(function (param) {

            const param2 = _.find(method2.params, { name: param.name })

            // if the parameter doesn't exist at commit 2, we can't check its type
            if (!param2) return

            const types1 = param.type.names
            const types2 = param2.type.names

            assert(
                types1.every(function (type) { return types2.indexOf(type) > -1 }
             || types2.indexOf('Any') > -1),
                'Method "' + method.name + '"\'s parameter "' + param.name + '" is of type "' + types1.join('|') + '" at {{ hash1 }}, but is "' + types2.join('|') + '" at {{ hash2 }}')

        })

    })

})

rules.major('A method\'s return type can\'t change', function (int1, int2) {

    int1.forEach(function (method) {

        const method2 = _.find(int2, { name: method.name })

        if (!method2) return

        const returnType1 = method.returns[0].type.names[0]
        const returnType2 = method2.returns[0].type.names[0]

        assert(returnType1 == returnType2, 'Method "' + method.name + '" has a return type of "' + returnType1 + '" at {{ hash1 }}, but the return type has changed to "' + returnType2 + '" at {{ hash2 }}')

    })

})

rules.major('A method\'s return type can\'t become less restrictive', function (int1, int2) {

    int1.forEach(function (method) {

        const method2 = _.find(int2, { name: method.name })

        if (!method2) return

        const returnType1 = method.returns[0].type.names[0]
        const returnType2 = method2.returns[0].type.names[0]

        assert(!(returnType1 != 'Any' && returnType2 == 'Any'), 'Method "' + method.name + '" has a return type of "' + returnType1 + '" at {{ hash1 }}, but the return type has changed to "' + returnType2 + '" at {{ hash2 }}')

    })

})

// Minor

rules.minor('A method can\'t be added', function (int1, int2) {

    int2.forEach(function (method) {
        assert(_.find(int1, { name: method.name }), '{{ hash2 }} contains method "' + method.name + '", which is not defined at {{ hash1 }}')
    })
    
})

rules.minor('A method\'s arity can\'t increase', function (int1, int2) {

    int2.forEach(function (method) {

        const method1 = _.find(int1, { name: method.name })

        // if the method doesn't exist at hash2 in the first place, we can't test this
        if (!method1) return

        const arity2 = method.params.length
        const arity1 = method1.params.length

        assert(!(arity1 < arity2), 'Method "' + method.name + '" has arity of ' + arity1 + ' at {{ hash1 }}, but arity has increased to ' + arity2 + ' at {{ hash2 }}')

    })

})

rules.minor('A parameter\'s type can\'t become less restrictive', function (int1, int2) {

    int2.forEach(function (method) {

        const method1 = _.find(int1, { name: method.name })

        if (!method1) return

        method.params.forEach(function (param) {

            const param1 = _.find(method1.params, { name: param.name })

            // if the parameter doesn't exist at commit 2, we can't check its type
            if (!param1) return

            const types2 = param.type.names
            const types1 = param1.type.names

            assert(
                types2.every(function (type) { return types1.indexOf(type) > -1 }
             || types1.indexOf('Any') > -1),
                'Method "' + method.name + '"\'s parameter "' + param.name + '" is of type "' + types1.join('|') + '" at {{ hash1 }}, but is "' + types2.join('|') + '" at {{ hash2 }}')

        })

    })

})

rules.minor('A method\'s return type can\'t become more restrictive', function (int1, int2) {

    int1.forEach(function (method) {

        const method2 = _.find(int2, { name: method.name })

        if (!method2) return

        const returnType1 = method.returns[0].type.names[0]
        const returnType2 = method2.returns[0].type.names[0]

        assert(!(returnType1 == 'Any' && returnType2 != 'Any'), 'Method "' + method.name + '" has a return type of "' + returnType1 + '" at {{ hash1 }}, but the return type has changed to "' + returnType2 + '" at {{ hash2 }}')

    })

})

module.exports = rules