import { expect } from 'chai';
import TaskSet from '../lib/taskset.js';

describe('TaskSet', function() {
  it('is initially empty', function() {
    let ts = new TaskSet();
    expect(ts.tasks).to.be.empty;
  }),

  describe('addTask', function() {
    it('adds a task when called', function() {
      let ts = new TaskSet();
      ts.addTask({
        name: 'bob'
      });
      expect(ts.tasks).to.have.property('bob');
      expect(ts.tasks.bob).to.have.property('name', 'bob');
    });
  }),

  describe('run', function() {
    it('runs a single task', async function() {
      let ts = new TaskSet();
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
      let ts = new TaskSet();
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
      let ts = new TaskSet();
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
  })
});
