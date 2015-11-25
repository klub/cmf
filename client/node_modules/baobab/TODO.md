TODO
====

* Bugs in solvePath with -1 in path
* Test those fucking cases
* Bugs when getting solvedPath `null`
* Cut a 1.1.2
* Check deps
* Fix traversal methods for dynamic paths

---

* DYNAMIC PATHS IN FACETS BITCH

* Mutative perf versions.
* Make the facets update work
* Unset in array path
* Implement memoized fast getters
* Better helpers tests
* Deferred setter
* Create Cursor.find
* Multisplicing
* Test the new setters' return values
* Test append/prepend
* test the write event
* Splicer type checker
* overhead may be reduced (in docs)
* Performant slice and clone etc.
* Facet index by path so we can release them efficiently
* Pure option
* make setters variadic
* add tree.watch

For the facets: they should listen on write if they still exist and act upon it.
Demander à benj si ça leak

Serialize should use getIn
