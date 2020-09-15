'use babel';

import path from 'path';

import {
  FIXTURE_PATH,
  runFlowCoverageReport
} from '../../common';

const testProjectDir = path.join(FIXTURE_PATH, 'project-decimal-coverage');

describe('--percent-decimals option', () => {
  it('should round percent values using the requested precision', async () => {
    const {exitCode, error, stderr, stdout} = await runFlowCoverageReport([
      '--percent-decimals',
      '2',
      '-i',
      '"src/**.js"'
    ], {cwd: testProjectDir});

    const filteredStdout = stdout.split('\n').filter(
      line => line.includes('src/main.js') || line.includes('project-decimal-coverage'));

    expect({exitCode, error, stderr, filteredStdout}).toMatchSnapshot();
  });
});
