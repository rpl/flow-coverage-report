'use babel';

import mockRequire from 'mock-require';
import sinon from 'sinon';

import {test} from 'ava';

const LIB_PROMISIFIED = '../../../lib/promisified';

test.afterEach(() => {
  mockRequire.stopAll();
});

test('promised readFile', async function(t) {
  const readFile = sinon.stub();
  mockRequire('fs', {readFile});

  const fakeFileContent = 'file content';
  readFile
    .onFirstCall().callsArgWith(1, null, new Buffer(fakeFileContent))
    .onSecondCall().callsArgWith(1, new Error('Fake readFile error'));

  const promisified = mockRequire.reRequire(LIB_PROMISIFIED);

  await t.notThrows(async function () {
    const fileContent = await promisified.readFile('/my/fake/dir');
    t.true(fileContent instanceof Buffer);
    t.is(String(fileContent), fakeFileContent);
  });

  t.true(readFile.calledOnce);

  await t.throws(promisified.readFile('/my/fake/file'), 'Fake readFile error');

  t.true(readFile.calledTwice);
});

test('promised writeFile', async function(t) {
  const writeFile = sinon.stub();
  mockRequire('fs', {writeFile});

  writeFile
    .onFirstCall().callsArgWith(2, null)
    .onSecondCall().callsArgWith(2, new Error('Fake writeFile error'));

  const promisified = mockRequire.reRequire(LIB_PROMISIFIED);

  await t.notThrows(async function () {
    await promisified.writeFile('/my/fake/dir');
  });

  t.true(writeFile.calledOnce);

  await t.throws(promisified.writeFile('/my/fake/file', 'Fake data'));

  t.true(writeFile.calledTwice);
});
