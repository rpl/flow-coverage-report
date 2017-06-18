'use babel';

import path from 'path';

import {
  FIXTURE_PATH,
  runFlowCoverageReport
} from '../../common';

const testProjectDir = path.join(FIXTURE_PATH, 'file-special-chars-escape');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; // 10 second timeout

test('Fixed #92 - Escape special chars in filenames', async () => {
  const {stdout, stderr} = await runFlowCoverageReport([
    '-i', `"src/*.js"`
  ], {cwd: testProjectDir});

  const filteredStdout = stdout.split('\n').filter(
    line => line.indexOf('src/file-with-a') >= 0
  );

  expect({filteredStdout, stderr}).toMatchSnapshot();
});
