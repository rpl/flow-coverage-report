'use strict';

// @flow

import path from 'path';
import mkdirp from 'mkdirp';

import {writeFile} from './promisified';

import type {FlowCoverageSummaryData} from './flow';
import type {FlowCoverageReportOptions} from '.';

async function saveFlowCoverageReportJSON(
  coverageSummaryData: FlowCoverageSummaryData,
  options: FlowCoverageReportOptions
) {
  const {projectDir} = options;
  const outputDir = options.outputDir || path.join(projectDir, 'flow-coverage');

  coverageSummaryData.globIncludePatterns = options.globIncludePatterns;

  await mkdirp(outputDir);
  await writeFile(
    path.join(outputDir, 'flow-coverage.json'),
    Buffer.from(JSON.stringify(coverageSummaryData))
  );
  return [coverageSummaryData, options];
}

const ReportJson = {
  generate: saveFlowCoverageReportJSON
};

export default ReportJson;
