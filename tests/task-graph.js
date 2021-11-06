import { expect } from 'chai';
import TaskSet from '../lib/taskset.js';

let ts;

describe('TaskSet', function() {
  beforeEach(function() {
    ts = new TaskSet();
  });

  it('is initially empty', function() {
    expect(ts.tasks).to.be.empty;
  }),

  describe('addTask', function() {
    it('adds a task when called', function() {
      ts.addTask({
        name: 'bob'
      });
      expect(ts.tasks).to.have.property('bob');
      expect(ts.tasks.bob).to.have.property('name', 'bob');
    });
  }),

  describe('run', function() {
    it('runs a single task', async function() {
      let ran = false;
      ts.addTask({
        name: 'bob',
        action() {
          ran = true;
        }
      });
      await ts.run('bob');
      expect(ran).to.be.true;
    });

    it('runs only the specified task', async function() {
      let ran = [];
      ts.addTask({
        name: 'bob',
        action() {
          ran.push('bob');
        }
      });
      ts.addTask({
        name: 'albert',
        action() {
          ran.push('albert');
        }
      });
      await ts.run('bob');
      expect(ran).to.have.members(['bob']);
    });

    it('runs task dependencies', async function() {
      let ran = [];
      ts.addTask({
        name: 'bob',
        action() {
          ran.push('bob');
        }
      });
      ts.addTask({
        name: 'albert',
        dependencies: ['bob'],
        action() {
          ran.push('albert');
        }
      });
      ts.addTask({
        name: 'humperdink',
        dependencies: ['bob'],
        action() {
          ran.push('humperdink');
        }
      });
      await ts.run('albert');
      expect(ran).to.have.ordered.members(['bob', 'albert']);
    });

    it('runs tasks in order', async function() {
      let ran = {};
      ts.task(async function humperdink() {
        expect(ran).to.not.have.property('humperdink');
        ran.humperdink = true;
      });
      ts.task(function wumpus() {
        expect(ran).to.not.have.property('wumpus');
        ran.wumpus = true;
      });
      ts.task(function wesley() {
        expect(ran.humperdink).to.be.true;
        expect(ran.wumpus).to.be.true;
        expect(ran).to.not.have.property('wesley');
        ran.wesley = true;
      }, 'humperdink', 'wumpus')
      await ts.run('wesley');
      expect(ran.wesley).to.be.true;
    })

    it('supports a meta-task', async function() {
      let ran = {};
      ts.task(async function humperdink() {
        expect(ran).to.not.have.property('humperdink');
        ran.humperdink = true;
      });
      ts.task(function wumpus() {
        expect(ran).to.not.have.property('wumpus');
        ran.wumpus = true;
      });
      ts.task('wesley', ['humperdink', 'wumpus'])
      await ts.run('wesley');
      expect(ran.humperdink).to.be.true;
      expect(ran.wumpus).to.be.true;
    })
  });

  describe('task api', function() {
    it('adds a task with a name', function() {
      ts.task('hello', function() {
        throw new Error("I should not run");
      });
      expect(ts.tasks.hello).to.not.be.null;
    });

    it('adds a task from a named function', function() {
      let t = ts.task(function humperdink() {
        throw new Error("I should not run");
      });
      expect(ts.tasks.humperdink).to.not.be.null;
      expect(t.name).to.equal('humperdink');
    });

    it('adds a task with dependencies', function() {
      ts.task(function humperdink() {
        throw new Error("I should not run");
      });
      ts.task('wesley', ['humperdink'], function() {
        throw new Error("skip me");
      })
      expect(ts.tasks.humperdink).to.not.be.null;
      expect(ts.tasks.humperdink.dependencies).to.be.empty;
      expect(ts.tasks.wesley).to.not.be.null;
      expect(ts.tasks.wesley.dependencies).to.have.members(['humperdink']);
    });

    it('adds a task from a named function with dependencies', function() {
      ts.task(function humperdink() {
        throw new Error("I should not run");
      });
      ts.task(function wesley() {
        throw new Error("skip me");
      }, ['humperdink'])
      expect(ts.tasks.humperdink).to.not.be.null;
      expect(ts.tasks.humperdink.dependencies).to.be.empty;
      expect(ts.tasks.wesley).to.not.be.null;
      expect(ts.tasks.wesley.dependencies).to.have.members(['humperdink']);
    });

    it('supports a string dependency', function() {
      ts.task(function humperdink() {
        throw new Error("I should not run");
      });
      ts.task(function wesley() {
        throw new Error("skip me");
      }, 'humperdink')
      expect(ts.tasks.humperdink).to.not.be.null;
      expect(ts.tasks.humperdink.dependencies).to.be.empty;
      expect(ts.tasks.wesley).to.not.be.null;
      expect(ts.tasks.wesley.dependencies).to.have.members(['humperdink']);
    });

    it('supports multiple string dependencies', function() {
      ts.task(function humperdink() {
        throw new Error("I should not run");
      });
      ts.task(function wumpus() {
        throw new Error("I should not run");
      });
      ts.task(function wesley() {
        throw new Error("skip me");
      }, 'humperdink', 'wumpus')
      expect(ts.tasks.humperdink).to.not.be.null;
      expect(ts.tasks.humperdink.dependencies).to.be.empty;
      expect(ts.tasks.wesley).to.not.be.null;
      expect(ts.tasks.wesley.dependencies).to.have.members(['humperdink', 'wumpus']);
    });
  });
});
