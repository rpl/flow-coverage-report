'use babel';

import path from 'path';

import {
  FIXTURE_PATH,
  runFlowCoverageReport
} from '../../common';

const testProjectDir = path.join(FIXTURE_PATH, 'flow-strict');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; // 10 second timeout

test('Accept \'@flow strict\' pragma and treat it like \'@flow\' pragma', async () => {
  const {stdout, stderr} = await runFlowCoverageReport([
    '-i', `"src/*.js"`
  ], {cwd: testProjectDir});

  const filteredStdout = stdout.split('\n').filter(line => line.indexOf('src/main') >= 0);

  expect({filteredStdout, stderr}).toMatchSnapshot();
});
