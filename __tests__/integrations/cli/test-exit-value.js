'use babel';

import path from 'path';

import {
  FIXTURE_PATH,
  runFlowCoverageReport
} from '../../common';

const testProjectDir = path.join(FIXTURE_PATH, 'project-low-coverage');

describe('CLI exit value', () => {
  it('should exit with code 2 when total coverage is lower than the default threshold', async () => {
    const {exitCode, error} = await runFlowCoverageReport([
      '-i', '"src/*.js"'
    ], {cwd: testProjectDir});

    expect({exitCode, error}).toMatchSnapshot();
  });

  it('should exit with code 2 when total coverage is lower than the custom threshold', async () => {
    const {exitCode, error} = await runFlowCoverageReport([
      '-i',
      '"src/*.js"',
      '--threshold',
      '22'
    ], {cwd: testProjectDir});

    expect({exitCode, error}).toMatchSnapshot();
  });

  it('should exit with code 0 when total coverage is higher than the custom threshold', async () => {
    const {exitCode, error} = await runFlowCoverageReport([
      '-i',
      '"src/*.js"',
      '--threshold',
      '10'
    ], {cwd: testProjectDir});

    expect({exitCode, error}).toMatchSnapshot();
  });
});
