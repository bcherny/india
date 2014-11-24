# india

> INterface Diffing and Inspection Assistant

**Status: UNSTABLE**

diff a module's interface between 2 commits

## install

```bash
npm install -g india
```

## usage

```bash
# diff between 2 commits
india hash1 hash2 -- file.js

# diff between a commit and master
india hash1 -- file.js
```

**example:**

```text
$ india f66bf74 -- ./demo/demo.js

✔ A method can't be removed
✘ A method's arity can't decrease 
	 Method "bar" has arity of 3 at commit 1, but arity has decreased to 2 at commit 2
✘ A method's parameters can't be removed 
	 Method "bar" accepts a  parameter "baz" at commit 1, but was removed at commit 2
✔ A method's parameters can't be reordered
✔ A parameter's type can't become more restrictive
✘ A method's return type can't change 
	 Method "foo" has a return type of "Object" at commit 1, but the return type has changed to "Array" at commit 2
✔ A method's return type can't become less restrictive
✘ A method can't be added 
	 Commit 2 contains method "baz", which is not defined at commit 1
✔ A method's arity can't increase
✔ A parameter's type can't become less restrictive
✔ A method's return type can't become more restrictive

Found 3 backwards-incompatible API changes. 
Recommend major version bump (0.0.0 => 0.1.0).
```