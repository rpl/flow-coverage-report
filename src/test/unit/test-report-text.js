'use babel';

import mockRequire from 'mock-require';
import sinon from 'sinon';

import {test} from 'ava';

import {
  FLOW_COVERAGE_SUMMARY_DATA
} from './fixtures';

const LIB_REPORT_TEXT = '../../lib/report-text';
const NPM_TABLE = 'terminal-table';

test.afterEach(() => {
  mockRequire.stopAll();
});

test('generate Text report', async function(t) {
  const print = sinon.stub();
  const npmTable = sinon.stub();

  mockRequire(NPM_TABLE, npmTable);

  const reportText = mockRequire.reRequire(LIB_REPORT_TEXT);

  const fakeTable = () => {
    return {
      push: () => {},
      attrRange: () => {}
    };
  };
  const mockTableFiles = sinon.stub(fakeTable());
  const mockTablePreSummary = sinon.stub(fakeTable());
  const mockTableSummary = sinon.stub(fakeTable());

  npmTable.onCall(0).returns(mockTableFiles);
  npmTable.onCall(1).returns(mockTablePreSummary);
  npmTable.onCall(2).returns(mockTableSummary);

  const options = {
    projectDir: '/projectDir',
    log: print
  };
  await reportText.generate(FLOW_COVERAGE_SUMMARY_DATA, options);

  t.is(print.callCount, 3);
  t.is(npmTable.callCount, 3);

  // The files table contains an header and a file for every file in the
  // coverage data.
  t.is(
    mockTableFiles.push.callCount,
    1 + Object.keys(FLOW_COVERAGE_SUMMARY_DATA.files).length
  );
});

test.todo('generate Text report failures');
