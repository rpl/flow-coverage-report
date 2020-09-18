'use babel';

import path from 'path';

import {
  FIXTURE_PATH,
  runFlowCoverageReport
} from '../../common';

const testProjectDir = path.join(FIXTURE_PATH, 'flow-strict');

jest.setTimeout(10000); // 10 second timeout

test('Accept \'@flow strict\' and \'@flow strict-local\' pragmas', async () => {
  const {stdout, stderr} = await runFlowCoverageReport([
    '-i', '"src/*.js"'
  ], {cwd: testProjectDir});

  const filteredStdoutMain = stdout.split('\n').filter(line => line.includes('src/main'));
  const filteredStdoutLocal = stdout.split('\n').filter(line => line.includes('src/local'));

  expect({filteredStdoutMain, filteredStdoutLocal, stderr}).toMatchSnapshot();
});
