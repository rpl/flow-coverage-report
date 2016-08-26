'use babel';

import mockRequire from 'mock-require';
import sinon from 'sinon';

import {test} from 'ava';

const LIB_REPORT_JSON = '../../lib/report-json';
const LIB_PROMISIFIED = '../../lib/promisified';

test.afterEach(() => {
  mockRequire.stopAll();
});

test('generate JSON report', async function(t) {
  const mkdirp = sinon.stub();
  const writeFile = sinon.stub();

  mockRequire(LIB_PROMISIFIED, {mkdirp, writeFile});

  const reportJSON = mockRequire.reRequire(LIB_REPORT_JSON);

  mkdirp.returns(Promise.resolve());
  writeFile.returns(Promise.resolve());

  const fakeData = {fakeCoverageSummaryData: true};
  const options = {
    projectDir: '/projectDir',
    globIncludePatterns: ['src/*.js']
  };

  await reportJSON.generate(fakeData, options);

  t.true(mkdirp.calledOnce);
  t.true(writeFile.calledOnce);
});

test.todo('generate JSON report failures');
