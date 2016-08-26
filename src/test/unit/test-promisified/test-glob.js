'use babel';

import mockRequire from 'mock-require';
import sinon from 'sinon';

import {test} from 'ava';

const LIB_PROMISIFIED = '../../../lib/promisified';

test.afterEach(() => {
  mockRequire.stopAll();
});

test('promisified glob', async function (t) {
  const glob = sinon.stub();
  mockRequire('glob', glob);

  const fakeGlobResult = [
    'dir1/file1.txt',
    'dir1/dir2/file2.txt'
  ];

  glob.onFirstCall().callsArgWith(2, new Error('Fake glob error'))
      .onSecondCall().callsArgWith(2, null, fakeGlobResult);

  const promisified = mockRequire.reRequire(LIB_PROMISIFIED);

  await t.throws(promisified.glob('**/*.js', {}), 'Fake glob error');
  t.true(glob.calledOnce);

  await t.notThrows(async function () {
    const files = await promisified.glob('**/*.txt', {fakeOption: true});
    t.true(Array.isArray(files));
    t.deepEqual(files, fakeGlobResult);
  });

  t.true(glob.calledTwice);
  t.is(glob.secondCall.args[0], '**/*.txt');
  t.deepEqual(glob.secondCall.args[1], {fakeOption: true});
});
