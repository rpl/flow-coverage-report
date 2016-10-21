'use strict';

// @flow

import {spawn, glob} from './promisified';

// getCoveredPercent helper.

/* eslint-disable camelcase */
function getCoveredPercent(
  {
    covered_count, uncovered_count
  }: {
    covered_count: number, uncovered_count: number
  }
) {
  const total = covered_count + uncovered_count;

  if (total === 0) {
    return 100;
  }

  return Math.floor(covered_count / total * 100);
}
/* eslint-disable-line camelcase */
exports.getCoveredPercent = getCoveredPercent;

// checkFlowStatus definitions and its related flow types.

export type FlowTypeErrorPosition = {
  offset: number,
  column: number,
  line: number
}

export type FlowTypeErrorMessage = {
  type: string,
  start: number,
  end: number,
  line: number,
  endline: number,
  path: string,
  descr: string,
  context?: string,
  loc?: {
    start: FlowTypeErrorPosition,
    end: FlowTypeErrorPosition,
    type: string,
    source: string
  }
}

export type FlowTypeError = {
  kind: string,
  level: string,
  message: Array<FlowTypeErrorMessage>
}

export type FlowStatus = {
  passed: boolean,
  flowVersion: string,
  errors: Array<FlowTypeError>
}

function checkFlowStatus(
  flowCommandPath: string,
  projectDir: string
): Promise<FlowStatus> {
  return spawn(
    flowCommandPath, ['status', '--json'], {cwd: projectDir}, {dontReject: true}
  ).then(res => {
    // $FLOW_FIXME: code is there, but flow doesn't seem to know about it.
    if (res.err && res.err.code !== 2) {
      throw res.err;
    }
    if (res.stdout) {
      const statusData = JSON.parse(String(res.stdout));

      // Verify the integrity of the format of the JSON status result.
      if (!statusData.flowVersion) {
        throw new Error('Invalid Flow status JSON format');
      }

      return statusData;
    }

    throw res.err;
  });
}

exports.checkFlowStatus = checkFlowStatus;

// collectFlowCoverageForFile definitions and its related flow types.

export type FlowUncoveredPos = {
  line: number,
  column: number,
  offset: number,
  source: string
}

export type FlowUncoveredLoc = {
  start: FlowUncoveredPos,
  end: FlowUncoveredPos
}

export type FlowCoverageJSONData = {
  expressions: {
    covered_count: number,
    uncovered_count: number,
    uncovered_locs: Array<FlowUncoveredLoc>
  },
  percent?: number
}

function collectFlowCoverageForFile(
  flowCommandPath: string,
  projectDir: string,
  filename: string
): Promise<FlowCoverageJSONData> {
  return spawn(
    flowCommandPath, ['coverage', '--json', filename], {cwd: projectDir}
  ).then(res => {
    if (!res.stdout || res.stdout.length === 0 || res.err) {
      throw new Error(
        `Unexpected error collected flow coverage data on '${filename}'`
      );
    }
    return JSON.parse(String(res.stdout));
  });
}

exports.collectFlowCoverageForFile = collectFlowCoverageForFile;

// collectForCoverage definitions and its related flow types.

export type FlowCoverageSummaryData = {
  covered_count: number,
  uncovered_count: number,
  percent: number,
  threshold: number,
  generatedAt: string,
  flowStatus: FlowStatus,
  globIncludePatterns: Array<string>,
  files: {
    [key: string]: FlowCoverageJSONData
  }
}

exports.collectFlowCoverage = function (
  flowCommandPath: string,
  projectDir: string,
  globIncludePatterns: Array<string>,
  threshold: number
): Promise<FlowCoverageSummaryData> {
  return checkFlowStatus(flowCommandPath, projectDir).then(flowStatus => {
    var now = new Date();
    var coverageGeneratedAt = now.toDateString() + ' ' + now.toTimeString();

    var coverageSummaryData: FlowCoverageSummaryData = {
      threshold,
      covered_count: 0, uncovered_count: 0, // eslint-disable-line camelcase
      percent: 0,
      generatedAt: coverageGeneratedAt,
      flowStatus: flowStatus,
      files: {},
      globIncludePatterns: globIncludePatterns
    };

    // Remove the source attribute from all ucovered_locs entry.
    function cleanupUncoveredLoc(loc) {
      delete loc.start.source;
      delete loc.end.source;
      return loc;
    }

    function collectCoverageAndGenerateReportForGlob(globIncludePattern) {
      return glob(globIncludePattern, {cwd: projectDir, root: projectDir})
        .then(files => {
          return Promise.all(
            files.map(filename =>
              collectFlowCoverageForFile(
                flowCommandPath, projectDir, filename
              ).then((data: FlowCoverageJSONData) => {
                /* eslint-disable camelcase */
                coverageSummaryData.covered_count += data.expressions.covered_count;
                coverageSummaryData.uncovered_count += data.expressions.uncovered_count;
                data.percent = getCoveredPercent(data.expressions);
                coverageSummaryData.files[filename] = data;

                data.expressions.uncovered_locs =
                  data.expressions.uncovered_locs.map(cleanupUncoveredLoc);
                /* eslint-enable camelcase */
              })
            )
          ).then(() => {
            return files;
          });
        });
    }

    return Promise
      .all(globIncludePatterns.map(collectCoverageAndGenerateReportForGlob))
      .then(() => {
        coverageSummaryData.percent = getCoveredPercent(coverageSummaryData);

        return coverageSummaryData;
      });
  });
};
