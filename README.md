# JavaScript Module-Implemented Task Executor

jsmite is an extremely simple JavaScript task executor.  It's somewhat like the
task part of Gulp, but it handles dependencies (like gulp 3 but unlike gulp 4),
has very few dependencies, and only supports `Promise` (or `async`) functions
rather than trying to automatically handle multiple asynchronous response
formats.  If you just need to run some tasks, it works.

## Example Task File

```javascript
import { task } from 'jsmite';

// basic task
task('hello', async function() {
    console.log('hello');
});

// it can extract task names from function names
task(async function hello2() {
    console.log('hello again');
});

// tasks can have dependencies
task('goodbye', ['hello', 'hello2'], async function() {
    console.log('goodbye');
});
```

## Invocation

You can then run this with:

```javascript
npx jsmite goodbye
```
