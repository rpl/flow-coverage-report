'use babel';

import {Buffer} from 'buffer';
import mockRequire from 'mock-require';
import sinon from 'sinon';

import {test} from 'ava';

const LIB_PROMISIFIED = '../../../src/promisified';

test.afterEach(() => {
  mockRequire.stopAll();
});

function mockChildProcessExec(exec) {
  const childProcessMock = {exec};
  const execSpy = sinon.spy(childProcessMock, 'exec');

  mockRequire('child_process', childProcessMock);

  return {
    childProcessMock,
    execSpy
  };
}

test('promisified exec resolved', async function(t) {
  const {
    execSpy: exec
  } = mockChildProcessExec((command, options, cb) => {
    cb(null, new Buffer('stdout'), new Buffer('stderr'));
  });

  const promisified = mockRequire.reRequire(LIB_PROMISIFIED);

  await t.notThrows(async function () {
    const {
      stdout, stderr
    } = await promisified.exec('fake-executable --fake', {cwd: '/fake/dir'});

    t.true(exec.calledOnce);
    t.is(exec.firstCall.args[0], 'fake-executable --fake');
    t.deepEqual(exec.firstCall.args[1], {cwd: '/fake/dir'});

    t.true(stdout instanceof Buffer);
    t.true(stderr instanceof Buffer);
    t.is(String(stdout), 'stdout');
    t.is(String(stderr), 'stderr');
  });
});

test('promisified exec throws', async function(t) {
  const fakeErrorMessage = 'Fake Unknown Error';
  mockChildProcessExec((command, options, cb) => {
    return cb(Error(fakeErrorMessage));
  });

  const promisified = mockRequire.reRequire(LIB_PROMISIFIED);

  await t.throws(
    promisified.exec('fake-executable --fake', {cwd: '/fake/dir'}),
    fakeErrorMessage
  );
});

test('promisified exec doNotReject', async function(t) {
  const fakeErrorMessage = 'Fake Unknown Error';
  mockChildProcessExec((command, options, cb) => {
    const fakeStdout = new Buffer('stdout');
    const fakeStderr = new Buffer('stderr');
    return cb(Error(fakeErrorMessage), fakeStdout, fakeStderr);
  });

  const promisified = mockRequire.reRequire(LIB_PROMISIFIED);

  const {err, stdout, stderr} = await promisified.exec(
    'fake-executable --fake',
    {cwd: '/fake/dir'}, {dontReject: true}
  );

  t.is(err.message, fakeErrorMessage);
  t.true(stdout instanceof Buffer);
  t.true(stderr instanceof Buffer);
  t.is(String(stdout), 'stdout');
  t.is(String(stderr), 'stderr');
});
