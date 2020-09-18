'use babel';

import {
  FLOW_COVERAGE_SUMMARY_DATA
} from './fixtures';

const LIB_REPORT_TEXT = '../lib/report-text';
const NPM_TABLE = 'terminal-table';

beforeEach(() => {
  jest.resetModules();
});

it('generate Text report', async () => {
  const mockPrint = jest.fn();
  const mockTables = [];
  const mockTable = jest.fn(() => {
    const table = {
      push: jest.fn(),
      attrRange: jest.fn()
    };
    mockTables.push(table);
    return table;
  });

  jest.mock(NPM_TABLE, () => mockTable);

  const reportText = require(LIB_REPORT_TEXT).default;

  const options = {
    projectDir: '/projectDir',
    log: mockPrint
  };
  await reportText.generate(FLOW_COVERAGE_SUMMARY_DATA, options);

  expect(mockPrint.mock.calls.length).toBe(3);
  expect(mockTable.mock.calls.length).toBe(3);

  // The files table contains an header and a file for every file in the
  // coverage data.
  expect(mockTables[0].push.mock.calls.length)
    .toBe(1 + Object.keys(FLOW_COVERAGE_SUMMARY_DATA.files).length);
});

test.todo('generate Text report failures');
