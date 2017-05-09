'use babel';

import {
  FLOW_COVERAGE_SUMMARY_DATA
} from './fixtures';

const LIB_REPORT_HTML = '../lib/report-html';
const LIB_PROMISIFIED = '../lib/promisified';
const LIB_REACT_COMPONENT = '../lib/components/html-report-page.jsx';
const NPM_REACT = 'react-dom/server';

jest.mock(NPM_REACT);
jest.mock(LIB_REACT_COMPONENT);

beforeEach(() => {
  jest.resetModules();
});

it('generate HTML report', async () => {
  const mockMkdirp = jest.fn();
  const mockReadFile = jest.fn();
  const mockWriteFile = jest.fn();
  jest.mock(LIB_PROMISIFIED, () => ({
    mkdirp: mockMkdirp,
    readFile: mockReadFile,
    writeFile: mockWriteFile
  }));

  mockMkdirp.mockReturnValue(Promise.resolve());
  mockWriteFile.mockReturnValue(Promise.resolve());
  mockReadFile.mockReturnValue(Promise.resolve('fake file content'));

  const reportHTML = require(LIB_REPORT_HTML).default;

  const options = {
    projectDir: '/projectDir',
    outputDir: '/projectDir/flow-coverage/'
  };
  await reportHTML.generate(FLOW_COVERAGE_SUMMARY_DATA, options);

  expect(true).toBe(true);
});

test.skip('generate HTML report failures');
