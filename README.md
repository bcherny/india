# india

[![][build]](https://travis-ci.org/bcherny/india)

[build]: https://img.shields.io/travis/bcherny/india.svg?branch=master&style=flat-square

> INterface Diffing and Inspection Assistant

diff a module's interface between 2 commits

## use case

[semver](http://semver.org/spec/v2.0.0.html) is pretty cool. in theory, it should lead to stable software that gets the latest updates as soon as they are available.

in practice, **many packages don't follow semver** ([angular <2](http://angularjs.blogspot.com/2013/12/angularjs-13-new-release-approaches.html), [coffeescript](https://github.com/jashkenas/coffeescript/issues/3352), [nodejs <4](https://medium.com/@nodesource/node-js-is-semver-8b3938ae8d24#.httbe7ydu)).

for the packages that do, **tagging a build with a new version is a manual process**, which makes it prone to human errors (ie. many types of false negatives and false positives).

so let's try to automate the process. **run india as part of your build to automate new version tagging**.

## install

```bash
npm install -g india
```

## usage

```bash
# diff between 2 commits
india hash1 hash2 -- file.js

# diff between a commit and HEAD
india hash1 -- file.js
```

**example:**

```text
$ india f66bf74 -- ./demo/demo.js

✔ A method can't be removed
✘ A method's arity can't decrease 
	 Method "bar" has arity of 3 at f66bf74, but arity has decreased to 2 at HEAD
✘ A method's parameters can't be removed 
	 Method "bar" accepts a  parameter "baz" at f66bf74, but was removed at HEAD
✔ A method's parameters can't be reordered
✔ A parameter's type can't become more restrictive
✘ A method's return type can't change 
	 Method "foo" has a return type of "Object" at f66bf74, but the return type has changed to "Array" at HEAD
✔ A method's return type can't become less restrictive
✘ A method can't be added 
	 HEAD contains method "baz", which is not defined at f66bf74
✔ A method's arity can't increase
✔ A parameter's type can't become less restrictive
✔ A method's return type can't become more restrictive

Found 3 backwards-incompatible API changes.
Found 1 backwards-compatible API change.
Recommend minor version bump (0.0.0 => 0.1.0).
```

## how does it work?

INDIA looks at your file's exports, and parses the jsdoc for each exported method. It then diffs the jsdocs at the given git commits, and runs the resultant diff through its validation rules. Based on the result, INDIA suggests an appropriate next version for your file.

## running the tests

```bash
npm install
npm test
```