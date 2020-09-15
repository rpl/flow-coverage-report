'use strict';

// @flow

import path from 'path';
import mkdirp from 'mkdirp';

import {writeFile} from './promisified';

import type {FlowCoverageSummaryData} from './flow';
import type {FlowCoverageReportOptions} from '.';

function saveFlowCoverageReportJSON(
  coverageSummaryData: FlowCoverageSummaryData,
  options: FlowCoverageReportOptions
) {
  const {projectDir} = options;
  const outputDir = options.outputDir || path.join(projectDir, 'flow-coverage');

  coverageSummaryData.globIncludePatterns = options.globIncludePatterns;

  return mkdirp(outputDir).then(() =>
    writeFile(
      path.join(outputDir, 'flow-coverage.json'),
      Buffer.from(JSON.stringify(coverageSummaryData))
    )
  ).then(() => {
    return [coverageSummaryData, options];
  });
}

export default {
  generate: saveFlowCoverageReportJSON
};
