'use strict';

// @flow

import path from 'path';

import {collectFlowCoverage} from './flow';
import {withTmpDir} from './promisified';
import reportHTML from './report-html';
import reportJSON from './report-json';
import reportText from './report-text';

import type {FlowCoverageSummaryData} from './flow'; // eslint-disable-line no-duplicate-imports

export type FlowCoverageReportType = 'json' | 'text' | 'html';

export type FlowCoverageReportOptions = {
  projectDir: string,
  flowCommandPath: string,
  flowCommandTimeout: number,
  globIncludePatterns: Array<string>,
  globExcludePatterns: Array<string>,
  outputDir: string,
  reportTypes?: Array<FlowCoverageReportType>,
  htmlTemplateOptions?: Object,
  threshold?: number,
  concurrentFiles?: number,
  log: Function
};

// Default timeout for flow coverage commands.
const DEFAULT_FLOW_TIMEOUT = 15 * 1000;

// User Scenarios
// 1. generate text report from a project dir
// 2. generate text report from a project dir and save json to file
// 3. generate text report from a project dir and html report
// 4. generate text/html report from a saved json file
// 5. set a custom threshold
// 6. set a custom output dir
// 7. usa a saved json file to compute coverage trend (and fail on negative trends)

async function generateFlowCoverageReport(opts: FlowCoverageReportOptions) {
  // Apply defaults to options.
  var projectDir = opts.projectDir;

  let tmpDirPath: ?string;

  if (process.env.VERBOSE && process.env.VERBOSE === 'DUMP_JSON') {
    tmpDirPath = await withTmpDir('flow-coverage-report');
    console.log(`Verbose DUMP_JSON mode enabled (${tmpDirPath})`);
  }

  opts.flowCommandPath = opts.flowCommandPath || 'flow';
  opts.flowCommandTimeout = opts.flowCommandTimeout || DEFAULT_FLOW_TIMEOUT; // defaults to 15s
  opts.outputDir = opts.outputDir || './flow-coverage';
  opts.outputDir = path.isAbsolute(opts.outputDir) ?
    opts.outputDir : path.resolve(path.join(projectDir, opts.outputDir));
  opts.globIncludePatterns = opts.globIncludePatterns || [];
  opts.globExcludePatterns = opts.globExcludePatterns || [];

  if (!Array.isArray(opts.globExcludePatterns)) {
    opts.globExcludePatterns = [opts.globExcludePatterns];
  }

  // Apply validation checks.
  if (!projectDir) {
    return Promise.reject(new Error('projectDir option is mandatory'));
  }

  if (opts.globIncludePatterns.length === 0) {
    return Promise.reject(new Error('empty globIncludePatterns option'));
  }

  if (!opts.threshold) {
    return Promise.reject(new Error('threshold option is mandatory'));
  }

  let coverageData: FlowCoverageSummaryData = await collectFlowCoverage(
    opts.flowCommandPath, opts.flowCommandTimeout,
    opts.projectDir, opts.globIncludePatterns, opts.globExcludePatterns,
    opts.threshold, opts.concurrentFiles || 1,
    tmpDirPath
  );

  var reportResults = [];
  const reportTypes = opts.reportTypes || ['text'];

  if (reportTypes.indexOf('json') >= 0) {
    reportResults.push(reportJSON.generate(coverageData, opts));
  }

  if (reportTypes.indexOf('text') >= 0) {
    reportResults.push(reportText.generate(coverageData, opts));
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

module.exports = {
  generateFlowCoverageReport: generateFlowCoverageReport
};
