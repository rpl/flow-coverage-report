'use babel';

import path from 'path';

import rimraf from 'rimraf';
import tempy from 'tempy';
import svgson from 'svgson';

import {
  FIXTURE_PATH,
  runFlowCoverageReport
} from '../../common';
import {readFile} from '../../../src/lib/promisified';

const testLowCoverageDir = path.join(FIXTURE_PATH, 'project-low-coverage-with-error');
const testFullCoverageDir = path.join(FIXTURE_PATH, 'project-full-coverage');

function svg2json(filePath) {
  return new Promise(async resolve => {
    const svgData = await readFile(filePath);
    svgson(svgData.toString(), {}, resolve);
  });
}

describe('badge reporter', () => {
  it('should generate red badges on project-low-coverage-with-error', async () => {
    const tmpDir = tempy.directory();

    const {exitCode} = await runFlowCoverageReport([
      '-i', `"src/*.js"`, '-t', 'badge', '-o', tmpDir
    ], {cwd: testLowCoverageDir});

    // Expect flow-coverage-report to exit with 2 on low coverage.
    expect(exitCode).toBe(2);

    const flowBadge = await svg2json(path.join(tmpDir, 'flow-badge.svg'));
    const flowCoverageBadge = await svg2json(path.join(tmpDir, 'flow-coverage-badge.svg'));

    expect(flowBadge).toMatchSnapshot('flow-badge red');
    expect(flowCoverageBadge).toMatchSnapshot('flow-coverage-badge red');

    await new Promise(resolve => rimraf(path.join(tmpDir, '*.svg'), resolve));
  });

  it('should generate green badges on full covered project', async () => {
    const tmpDir = tempy.directory();

    const {exitCode} = await runFlowCoverageReport([
      '-i', `"src/*.js"`, '-t', 'badge', '-o', tmpDir
    ], {cwd: testFullCoverageDir});

    expect(exitCode).toBe(0);

    const flowBadge = await svg2json(path.join(tmpDir, 'flow-badge.svg'));
    const flowCoverageBadge = await svg2json(path.join(tmpDir, 'flow-coverage-badge.svg'));

    expect(flowBadge).toMatchSnapshot('flow-badge green');
    expect(flowCoverageBadge).toMatchSnapshot('flow-coverage-badge green');

    await new Promise(resolve => rimraf(path.join(tmpDir, '*.svg'), resolve));
  });
});
