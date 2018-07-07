'use babel';

import path from 'path';

import {
  FIXTURE_PATH,
  runFlowCoverageReport
} from '../../common';

const testProjectDir = path.join(FIXTURE_PATH, 'legacy-config-warns');

describe('Legacy config warnings', () => {
  it('should log warning messages for legacy config names', async () => {
    const {exitCode, error, stderr} = await runFlowCoverageReport([
      '--config', 'legacy-config.json'
    ], {cwd: testProjectDir});

    expect({exitCode, error, stderr}).toMatchSnapshot();
  });
});
