'use strict';

// @flow

import path from 'path';

import {DEFAULT_FLOW_TIMEOUT} from './cli/config';
import {collectFlowCoverage} from './flow';
import {withTmpDir} from './promisified';
import reportHTML from './report-html';
import reportBadge from './report-badge';
import reportJSON from './report-json';
import reportText from './report-text';

import type {ConfigParameters, ReportType} from './cli/config';
import type {FlowCoverageSummaryData} from './flow';

export type FlowCoverageReportType = ReportType;

export type FlowCoverageReportOptions = {
  ...ConfigParameters,
  log?: Function
};

// User Scenarios
// 1. generate text report from a project dir
// 2. generate text report from a project dir and save json to file
// 3. generate text report from a project dir and html report
// 4. generate text/html report from a saved json file
// 5. set a custom threshold
// 6. set a custom output dir
// 7. usa a saved json file to compute coverage trend (and fail on negative trends)

export default async function generateFlowCoverageReport(options: FlowCoverageReportOptions) {
  // Apply defaults to options.
  const {projectDir} = options;

  let temporaryDirPath: ?string;

  if (process.env.VERBOSE && process.env.VERBOSE === 'DUMP_JSON') {
    temporaryDirPath = await withTmpDir('flow-coverage-report');
    console.log(`Verbose DUMP_JSON mode enabled (${temporaryDirPath})`);
  }

  options.flowCommandPath = options.flowCommandPath || 'flow';
  options.flowCommandTimeout = options.flowCommandTimeout || DEFAULT_FLOW_TIMEOUT; // Defaults to 15s
  options.outputDir = options.outputDir || './flow-coverage';
  options.outputDir = path.isAbsolute(options.outputDir) ?
    options.outputDir : path.resolve(path.join(projectDir, options.outputDir));
  options.globIncludePatterns = options.globIncludePatterns || [];
  options.globExcludePatterns = options.globExcludePatterns || [];
  options.concurrentFiles = options.concurrentFiles || 1;

  if (!Array.isArray(options.globExcludePatterns)) {
    options.globExcludePatterns = [options.globExcludePatterns];
  }

  // Apply validation checks.
  if (!projectDir) {
    throw new TypeError('projectDir option is mandatory');
  }

  if (options.globIncludePatterns.length === 0) {
    throw new TypeError('empty globIncludePatterns option');
  }

  if (!options.threshold) {
    throw new TypeError('threshold option is mandatory');
  }

  const coverageData: FlowCoverageSummaryData = await collectFlowCoverage(
    options, temporaryDirPath);

  const reportResults = [];
  const reportTypes = options.reportTypes || ['text'];

  if (reportTypes.includes('json')) {
    reportResults.push(reportJSON.generate(coverageData, options));
  }

  if (reportTypes.includes('text')) {
    reportResults.push(reportText.generate(coverageData, options));
  }

  // Run the badge reporter implicitly if the html report has been included.
  if (reportTypes.includes('badge') || reportTypes.includes('html')) {
    reportResults.push(reportBadge.generate(coverageData, options));
  }

  if (reportTypes.includes('html')) {
    // eslint-disable-next-line promise/prefer-await-to-then
    reportResults.push(reportHTML.generate(coverageData, options).then(() => {
      console.log(`View generated HTML Report at file://${options.outputDir}/index.html`);
    }));
  }

  await Promise.all(reportResults);
  return [coverageData, options];
}
