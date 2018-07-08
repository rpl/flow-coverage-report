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

// eslint-disable-next-line no-duplicate-imports
import type {ConfigParams, ReportType} from './cli/config';
// eslint-disable-next-line no-duplicate-imports
import type {FlowCoverageSummaryData} from './flow';

export type FlowCoverageReportType = ReportType;

export type FlowCoverageReportOptions = {
  ...ConfigParams,
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

export default async function generateFlowCoverageReport(opts: FlowCoverageReportOptions) {
  // Apply defaults to options.
  const projectDir = opts.projectDir;

  let tmpDirPath: ?string;

  if (process.env.VERBOSE && process.env.VERBOSE === 'DUMP_JSON') {
    tmpDirPath = await withTmpDir('flow-coverage-report');
    console.log(`Verbose DUMP_JSON mode enabled (${tmpDirPath})`);
  }

  opts.flowCommandPath = opts.flowCommandPath || 'flow';
  opts.flowCommandTimeout = opts.flowCommandTimeout || DEFAULT_FLOW_TIMEOUT; // Defaults to 15s
  opts.outputDir = opts.outputDir || './flow-coverage';
  opts.outputDir = path.isAbsolute(opts.outputDir) ?
    opts.outputDir : path.resolve(path.join(projectDir, opts.outputDir));
  opts.globIncludePatterns = opts.globIncludePatterns || [];
  opts.globExcludePatterns = opts.globExcludePatterns || [];
  opts.concurrentFiles = opts.concurrentFiles || 1;

  if (!Array.isArray(opts.globExcludePatterns)) {
    opts.globExcludePatterns = [opts.globExcludePatterns];
  }

  // Apply validation checks.
  if (!projectDir) {
    return Promise.reject(new TypeError('projectDir option is mandatory'));
  }

  if (opts.globIncludePatterns.length === 0) {
    return Promise.reject(new TypeError('empty globIncludePatterns option'));
  }

  if (!opts.threshold) {
    return Promise.reject(new TypeError('threshold option is mandatory'));
  }

  const coverageData: FlowCoverageSummaryData = await collectFlowCoverage(
    opts, tmpDirPath);

  const reportResults = [];
  const reportTypes = opts.reportTypes || ['text'];

  if (reportTypes.indexOf('json') >= 0) {
    reportResults.push(reportJSON.generate(coverageData, opts));
  }

  if (reportTypes.indexOf('text') >= 0) {
    reportResults.push(reportText.generate(coverageData, opts));
  }

  // Run the badge reporter implicitly if the html report has been included.
  if (reportTypes.indexOf('badge') >= 0 || reportTypes.indexOf('html') >= 0) {
    reportResults.push(reportBadge.generate(coverageData, opts));
  }

  if (reportTypes.indexOf('html') >= 0) {
    reportResults.push(reportHTML.generate(coverageData, opts).then(() => {
      console.log(`View generated HTML Report at file://${opts.outputDir}/index.html`);
    }));
  }

  return Promise.all(reportResults).then(() => {
    return [coverageData, opts];
  });
}
