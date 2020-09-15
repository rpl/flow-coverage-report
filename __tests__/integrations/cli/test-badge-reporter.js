'use babel';

import path from 'path';

import rimraf from 'rimraf';
import tempy from 'tempy';
import * as svgson from 'svgson';

import {
  FIXTURE_PATH,
  runFlowCoverageReport
} from '../../common';
import {readFile} from '../../../src/lib/promisified';

const testLowCoverageDir = path.join(FIXTURE_PATH, 'project-low-coverage-with-error');
const testFullCoverageDir = path.join(FIXTURE_PATH, 'project-full-coverage');

async function svg2json(filePath) {
  const svgData = await readFile(filePath);
  return svgson.parse(svgData.toString(), {camelcase: true});
}

describe('badge reporter', () => {
  it('should generate red badges on project-low-coverage-with-error', async () => {
    const temporaryDir = tempy.directory();

    const {exitCode} = await runFlowCoverageReport([
      '-i', '"src/*.js"', '-t', 'badge', '-o', temporaryDir
    ], {cwd: testLowCoverageDir});

    // Expect flow-coverage-report to exit with 2 on low coverage.
    expect(exitCode).toBe(2);

    const flowBadge = await svg2json(path.join(temporaryDir, 'flow-badge.svg'));
    const flowCoverageBadge = await svg2json(path.join(temporaryDir, 'flow-coverage-badge.svg'));

    expect(flowBadge).toMatchSnapshot('flow-badge red');
    expect(flowCoverageBadge).toMatchSnapshot('flow-coverage-badge red');

    await new Promise(resolve => rimraf(path.join(temporaryDir, '*.svg'), resolve));
  });

  it('should generate green badges on full covered project', async () => {
    const temporaryDir = tempy.directory();

    const {exitCode} = await runFlowCoverageReport([
      '-i', '"src/*.js"', '-t', 'badge', '-o', temporaryDir
    ], {cwd: testFullCoverageDir});

    expect(exitCode).toBe(0);

    const flowBadge = await svg2json(path.join(temporaryDir, 'flow-badge.svg'));
    const flowCoverageBadge = await svg2json(path.join(temporaryDir, 'flow-coverage-badge.svg'));

    expect(flowBadge).toMatchSnapshot('flow-badge green');
    expect(flowCoverageBadge).toMatchSnapshot('flow-coverage-badge green');

    await new Promise(resolve => rimraf(path.join(temporaryDir, '*.svg'), resolve));
  });
});
