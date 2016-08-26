'use babel';

import mockRequire from 'mock-require';
import sinon from 'sinon';

import {test} from 'ava';

import {
  FLOW_COVERAGE_SUMMARY_DATA
} from './fixtures';

const LIB_REPORT_HTML = '../../lib/report-html';
const LIB_PROMISIFIED = '../../lib/promisified';
const LIB_REACT_COMPONENT = '../../lib/components/flow-coverage-html-report';
const NPM_REACT = 'react-dom/server';

test.afterEach(() => {
  mockRequire.stopAll();
});

test('generate HTML report', async function(t) {
  const stubReact = sinon.stub({
    renderToStaticMarkup: () => {}
  });
  mockRequire(NPM_REACT, stubReact);

  const fakeReactComponent = () => {
    return {};
  };
  mockRequire(LIB_REACT_COMPONENT, fakeReactComponent);

  const mkdirp = sinon.stub();
  const readFile = sinon.stub();
  const writeFile = sinon.stub();
  mockRequire(LIB_PROMISIFIED, {mkdirp, readFile, writeFile});

  mkdirp.returns(Promise.resolve());
  writeFile.returns(Promise.resolve());
  readFile.returns(Promise.resolve('fake file content'));

  const reportHTML = mockRequire.reRequire(LIB_REPORT_HTML);

  const options = {
    projectDir: '/projectDir',
    outputDir: '/projectDir/flow-coverage/'
  };
  await reportHTML.generate(FLOW_COVERAGE_SUMMARY_DATA, options);

  t.true(true);
});

test.todo('generate HTML report failures');
