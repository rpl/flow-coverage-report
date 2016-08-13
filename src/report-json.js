'use strict';

// @flow

import path from 'path';

import {mkdirp, writeFile} from './promisified';

import type {FlowCoverageSummaryData} from './flow';
import type {FlowCoverageReportOptions} from './index';

function saveFlowCoverageReportJSON(
  coverageSummaryData: FlowCoverageSummaryData,
  opts: FlowCoverageReportOptions
) {
  var projectDir = opts.projectDir;
  var outputDir = opts.outputDir || path.join(projectDir, 'flow-coverage');

  coverageSummaryData.globIncludePatterns = opts.globIncludePatterns;

  return mkdirp(outputDir).then(() =>
    writeFile(
      path.join(outputDir, 'flow-coverage.json'),
      new Buffer(JSON.stringify(coverageSummaryData))
    )
  ).then(() => {
    return [coverageSummaryData, opts];
  });
}

module.exports = {
  generate: saveFlowCoverageReportJSON
};
