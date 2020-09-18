'use babel';

import path from 'path';

import {
  FIXTURE_PATH,
  runFlowCoverageReport
} from '../../common';

const testProjectDir = path.join(FIXTURE_PATH, 'issue-57');

jest.setTimeout(10000); // 10 second timeout

test('Fixed #57 - NaN in text report', async () => {
  const {stdout, stderr} = await runFlowCoverageReport([
    '-i', '"src/*.js"'
  ], {cwd: testProjectDir});

  const filteredStdout = stdout.split('\n').filter(line => line.includes('src/url.js'));

  expect({filteredStdout, stderr}).toMatchSnapshot();
});
