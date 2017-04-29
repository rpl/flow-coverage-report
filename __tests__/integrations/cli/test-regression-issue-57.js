'use babel';

import path from 'path';

import {
  FIXTURE_PATH,
  runFlowCoverageReport
} from '../../common';

const testProjectDir = path.join(FIXTURE_PATH, 'issue-57');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; // 10 second timeout

test('Fixed #57 - NaN in text report', async () => {
  const {stdout} = await runFlowCoverageReport([
    '-i', `"src/*.js"`
  ], {cwd: testProjectDir});

  const filteredStdout = stdout.split('\n').filter(line => line.indexOf('src/url.js') >= 0);

  expect({filteredStdout}).toMatchSnapshot();
});
