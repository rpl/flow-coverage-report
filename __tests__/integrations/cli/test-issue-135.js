'use babel';

import path from 'path';

import {
  FIXTURE_PATH,
  runFlowCoverageReport
} from '../../common';

const testProjectDir = path.join(FIXTURE_PATH, 'issue-135');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; // 10 second timeout

test('Fixed #135 - Annotation wrong on multiple pragma on the same line', async () => {
  const {stdout, stderr} = await runFlowCoverageReport([
    '-i', `"src/*.js"`
  ], {cwd: testProjectDir});

  const filteredStdout = stdout.split('\n').filter(line => line.indexOf('src/multiple-pragmas') >= 0);

  expect({filteredStdout, stderr}).toMatchSnapshot();
});
