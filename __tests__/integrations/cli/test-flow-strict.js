'use babel';

import path from 'path';

import {
  FIXTURE_PATH,
  runFlowCoverageReport
} from '../../common';

const testProjectDir = path.join(FIXTURE_PATH, 'flow-strict');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; // 10 second timeout

test('Accept \'@flow strict\' and \'@flow strict-local\' pragmas', async () => {
  const {stdout, stderr} = await runFlowCoverageReport([
    '-i', `"src/*.js"`
  ], {cwd: testProjectDir});

  const filteredStdoutMain = stdout.split('\n').filter(line => line.indexOf('src/main') >= 0);
  const filteredStdoutLocal = stdout.split('\n').filter(line => line.indexOf('src/local') >= 0);

  expect({filteredStdoutMain, filteredStdoutLocal, stderr}).toMatchSnapshot();
});
