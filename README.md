# india

> INterface Diffing and Inspection Assistant

**Status: UNSTABLE & UNFINISHED**

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

```bash
india f66bf74 -- ./demo/demo.js
```