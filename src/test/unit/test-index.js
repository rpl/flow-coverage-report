'use babel';

import mockRequire from 'mock-require';
import sinon from 'sinon';

import {test} from 'ava';

const LIB_INDEX = '../../lib/index';
const LIB_FLOW = '../../lib/flow';
const LIB_REPORT_HTML = '../../lib/report-html';
const LIB_REPORT_JSON = '../../lib/report-json';
const LIB_REPORT_TEXT = '../../lib/report-text';

test.afterEach(() => {
  mockRequire.stopAll();
});

test('generateFlowCoverageReport', async function(t) {
  const collectFlowCoverage = sinon.stub();
  mockRequire(LIB_FLOW, {collectFlowCoverage});

  const generateHTML = sinon.stub();
  mockRequire(LIB_REPORT_HTML, {generate: generateHTML});
  const generateJSON = sinon.stub();
  mockRequire(LIB_REPORT_JSON, {generate: generateJSON});
  const generateText = sinon.stub();
  mockRequire(LIB_REPORT_TEXT, {generate: generateText});

  const {generateFlowCoverageReport} = mockRequire.reRequire(LIB_INDEX);

  const fakeData = {fakeData: true};
  collectFlowCoverage.returns(Promise.resolve(fakeData));

  generateJSON.returns(Promise.resolve());
  generateHTML.returns(Promise.resolve());
  generateText.returns(Promise.resolve());

  const options = {
    projectDir: '/projectDir',
    globIncludePatterns: ['src/*.js'],
    threshold: 80
  };

  let res = await generateFlowCoverageReport(options);

  t.deepEqual(res, [fakeData, options]);
  t.true(collectFlowCoverage.calledOnce);
  t.true(generateText.calledOnce);
  t.false(generateHTML.calledOnce);
  t.false(generateJSON.calledOnce);

  await generateFlowCoverageReport({
    ...options,
    reportTypes: ['html', 'json']
  });

  t.true(generateHTML.calledOnce);
  t.true(generateJSON.calledOnce);
  t.is(generateText.callCount, 1);

  await t.throws(
    generateFlowCoverageReport({...options, projectDir: null}),
    /projectDir option is mandatory/
  );

  await t.throws(
    generateFlowCoverageReport({...options, globIncludePatterns: null}),
    /empty globIncludePatterns option/
  );

  await t.throws(
    generateFlowCoverageReport({...options, globIncludePatterns: []}),
    /empty globIncludePatterns option/
  );
});
