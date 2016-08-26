'use babel';

import mockRequire from 'mock-require';
import sinon from 'sinon';

import {test} from 'ava';

const LIB_PROMISIFIED = '../../../lib/promisified';

test.afterEach(() => {
  mockRequire.stopAll();
});

test('promised mkdirp', async function(t) {
  const mkdirpStub = sinon.stub();
  mockRequire('mkdirp', mkdirpStub);

  mkdirpStub
    .onFirstCall().callsArg(1)
    .onSecondCall().callsArgWith(1, new Error('Fake mkdir error'));

  const promisified = mockRequire.reRequire(LIB_PROMISIFIED);

  await t.notThrows(async function () {
    await promisified.mkdirp('/my/fake/dir');
  });

  t.true(mkdirpStub.calledOnce);

  await t.throws(promisified.mkdirp('/my/fake/dir'), 'Fake mkdir error');

  t.true(mkdirpStub.calledTwice);
});
