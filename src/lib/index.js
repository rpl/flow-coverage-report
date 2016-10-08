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
  flowCommandPath?: string,
  globIncludePatterns: Array<string>,
  outputDir?: string,
  reportTypes?: Array<FlowCoverageReportType>,
  threshold?: number
};

// User Scenarios
// 1. generate text report from a project dir
// 2. generate text report from a project dir and save json to file
// 3. generate text report from a project dir and html report
// 4. generate text/html report from a saved json file
// 5. set a custom threshold
// 6. set a custom output dir
// 7. usa a saved json file to compute coverage trend (and fail on negative trends)

function generateFlowCoverageReport(opts: FlowCoverageReportOptions) {
  // Apply defaults to options.
  var projectDir = opts.projectDir;

  return withTmpDir('flow-coverage-report')
    .then(dirPath => {
      opts.flowCommandPath = opts.flowCommandPath || 'flow';
      opts.outputDir = opts.outputDir || path.join(projectDir, 'flow-coverage');
      opts.globIncludePatterns = opts.globIncludePatterns || [];

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

      return collectFlowCoverage(
        opts.flowCommandPath, opts.projectDir, opts.globIncludePatterns,
        opts.threshold, dirPath,
      );
    })
    .then((coverageData: FlowCoverageSummaryData) => {
      var reportResults = [];
      const reportTypes = opts.reportTypes || ['text'];

      if (reportTypes.indexOf('json') >= 0) {
        reportResults.push(reportJSON.generate(coverageData, opts));
      }

      if (reportTypes.indexOf('text') >= 0) {
        reportResults.push(reportText.generate(coverageData, opts));
      }

      if (reportTypes.indexOf('html') >= 0) {
        reportResults.push(reportHTML.generate(coverageData, opts));
      }

      return Promise.all(reportResults).then(() => {
        return [coverageData, opts];
      });
    });
}

module.exports = {
  generateFlowCoverageReport: generateFlowCoverageReport
};
