'use babel';

import mockRequire from 'mock-require';
import sinon from 'sinon';

import {test} from 'ava';

const LIB_PROMISIFIED = '../../../lib/promisified';

test.afterEach(() => {
  mockRequire.stopAll();
});

test('promisified spawn resolved', async function(t) {
  const child = {
    stdout: {on: sinon.stub()},
    stderr: {on: sinon.stub()},
    on: sinon.stub()
  };
  const spawn = sinon.stub().returns(child);
  mockRequire('child_process', {spawn});

  const fakeStdout = new Buffer('stdout');
  const fakeStderr = new Buffer('stderr');
  child.stdout.on.onFirstCall().callsArgWith(1, fakeStdout);
  child.stderr.on.onFirstCall().callsArgWith(1, fakeStderr);
  child.on.onFirstCall().callsArgWith(1, null);

  const promisified = mockRequire.reRequire(LIB_PROMISIFIED);

  await t.notThrows(async function () {
    const {
      stdout, stderr
    } = await promisified.spawn('fake-executable', ['--fake'], {cwd: '/fake/dir'});

    t.true(spawn.calledOnce);
    t.is(spawn.firstCall.args[0], 'fake-executable');
    t.deepEqual(spawn.firstCall.args[1], ['--fake']);
    t.deepEqual(spawn.firstCall.args[2], {cwd: '/fake/dir'});

    t.true(stdout instanceof Buffer);
    t.true(stderr instanceof Buffer);
    t.is(String(stdout), 'stdout');
    t.is(String(stderr), 'stderr');
  });
});

test('promisified spawn throws', async function(t) {
  const child = {
    stdout: {on: sinon.stub()},
    stderr: {on: sinon.stub()},
    on: sinon.stub()
  };
  const spawn = sinon.stub().returns(child);
  mockRequire('child_process', {spawn});

  const fakeErrorMessage = 'Fake Unknown Error - throws!!!';
  child.on.onFirstCall().callsArgWith(1, new Error(fakeErrorMessage));

  const promisified = mockRequire.reRequire(LIB_PROMISIFIED);

  await t.throws(
    promisified.spawn('fake-executable', ['--fake'], {cwd: '/fake/dir'}),
    fakeErrorMessage
  );
});

test('promisified spawn doNotReject', async function(t) {
  const child = {
    stdout: {on: sinon.stub()},
    stderr: {on: sinon.stub()},
    on: sinon.stub()
  };
  const spawn = sinon.stub().returns(child);
  mockRequire('child_process', {spawn});

  const fakeStdout = new Buffer('stdout');
  const fakeStderr = new Buffer('stderr');
  child.stdout.on.onFirstCall().callsArgWith(1, fakeStdout);
  child.stderr.on.onFirstCall().callsArgWith(1, fakeStderr);
  child.on.onFirstCall().callsArgWith(1, new Error('Fake Unknown Error'));

  const promisified = mockRequire.reRequire(LIB_PROMISIFIED);

  const {err, stdout, stderr} = await promisified.spawn(
    'fake-executable', ['--fake'],
    {cwd: '/fake/dir'}, {dontReject: true}
  );

  t.is(err.message, 'Fake Unknown Error');
  t.true(stdout instanceof Buffer);
  t.true(stderr instanceof Buffer);
  t.is(String(stdout), 'stdout');
  t.is(String(stderr), 'stderr');
});
