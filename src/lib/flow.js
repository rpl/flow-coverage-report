'use strict';

// @flow

import minimatch from 'minimatch';
import temp from 'temp';
import {genCheckFlowStatus} from 'flow-annotation-check';
import {exec, glob, writeFile} from './promisified';

import type {FlowCoverageReportOptions} from './index';

// Load the Array.prototype.find polyfill if needed (e.g. nodejs 0.12).
/* istanbul ignore if  */
if (!Array.prototype.find) {
  require('array.prototype.find').shim();
}

// Escape special characters in file names.
export function escapeFileName(fileName: string): string {
  return fileName.replace(/(["\s'$`\\])/g, '\\$1');
}

export function roundNumber(n: number, numDecimals: number = 0): number {
  if (numDecimals > 0) {
    const fact = Math.pow(10, Math.floor(numDecimals));
    return Math.round(n * fact) / fact;
  }
  return Math.floor(n);
}

/* eslint-disable camelcase */
export function getCoveredPercent(
  {
    covered_count, uncovered_count
  }: {
    covered_count: number, uncovered_count: number
  },
  numDecimals: number = 0
) {
  const total = covered_count + uncovered_count;

  if (total === 0) {
    return 100;
  }

  return roundNumber(covered_count / total * 100, numDecimals);
}
/* eslint-disable-line camelcase */

export function isFlowAnnotation(
  annotation: string, strict: boolean = false
): boolean {
  const validFlowAnnotation = new Set([
    'flow', 'flow weak', 'flow strict', 'flow strict-local'
  ]);

  if (strict) {
    validFlowAnnotation.delete('flow weak');
  }

  return validFlowAnnotation.has(annotation);
}

// Definitions and flow types related to checkFlowStatus.

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

export async function checkFlowStatus(
  flowCommandPath: string,
  projectDir: string,
  tmpDirPath: ?string
): Promise<FlowStatus> {
  let tmpFilePath: ?string;

  if (process.env.VERBOSE && process.env.VERBOSE === 'DUMP_JSON') {
    tmpFilePath = temp.path(tmpDirPath ?
      {suffix: '.json', dir: tmpDirPath} : {suffix: '.json'});
  }

  const res = await exec(`${flowCommandPath} status --json`,
                         {cwd: projectDir, maxBuffer: Infinity},
                         {dontReject: true});

  if (res.err && res.err.code !== 2) {
    if (process.env.VERBOSE) {
      console.error('Flow status error', res.err, res.stderr, res.stdout);
    }

    throw res.err;
  }

  let statusData: ?FlowStatus;

  if (tmpFilePath) {
    await writeFile(tmpFilePath, res.stdout || '');
    console.log('Flow status result saved to', tmpFilePath);
  }

  try {
    statusData = JSON.parse(String(res.stdout));
  } catch (err) {
    const unexpectedException: ?SyntaxError = err;

    // Verify the integrity of the format of the JSON status result.
    if (unexpectedException) {
      throw new Error(`Parsing error on Flow status JSON result: ${err}`);
    }
  }

  if (statusData && statusData.flowVersion) {
    return statusData;
  }

  throw new Error('Invalid Flow status JSON format');
}

// Definitions and flow types related to collectFlowCoverageForFile.

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
  filename?: string,
  // eslint-disable-next-line flowtype/space-after-type-colon
  annotation?:
    | 'no flow'
    | 'flow weak'
    | 'flow'
    | 'flow strict'
    | 'flow strict-local',
  percent: number,
  error?: string,
  isError?: boolean,
  isFlow: boolean,
  flowCoverageError?: ?string,
  flowCoverageException?: ?string,
  flowCoverageParsingError?: ?string,
  flowCoverageStderr?: string|Buffer
}

export async function collectFlowCoverageForFile(
  flowCommandPath: string,
  flowCommandTimeout: number,
  projectDir: string,
  filename: string,
  tmpDirPath: ?string,
  strictCoverage: ?boolean,
): Promise<FlowCoverageJSONData> {
  let tmpFilePath: ?string;

  if (process.env.VERBOSE && process.env.VERBOSE === 'DUMP_JSON') {
    tmpFilePath = temp.path(tmpDirPath ?
      {suffix: '.json', dir: tmpDirPath} : {suffix: '.json'});
  }

  const emptyCoverageData = {
    filename,
    annotation: 'no flow',
    isFlow: false,
    expressions: {
      covered_count: 0,
      uncovered_count: 0,
      uncovered_locs: []
    }
  };

  if (process.env.VERBOSE) {
    console.log(`Collecting coverage data from ${filename} (timeouts in ${flowCommandTimeout})...`);
  }

  const res = await exec(
    `${flowCommandPath} coverage --json ${escapeFileName(filename)}`,
    // NOTE: set a default timeouts and maxButter to Infinity to prevent,
    // misconfigured projects and source files that should raises errors
    // or hangs the flow daemon to prevent the coverage reporter to complete
    // the data collection. (See https://github.com/rpl/flow-coverage-report/pull/4
    // and https://github.com/rpl/flow-coverage-report/pull/5 for rationale,
    // thanks to to @mynameiswhm and @ryan953  for their help on hunting down this issue)
    {cwd: projectDir, timeout: flowCommandTimeout, maxBuffer: Infinity},
    {dontReject: true});

  if (res.err) {
    console.error('ERROR Collecting coverage data from', filename, res.err, res.stderr);

    if (process.env.VERBOSE) {
      if (tmpFilePath) {
        await writeFile(tmpFilePath, res.stdout || '');
      }
    }

    // TODO: collect errors and put them in a visible place in the
    // generated report.
    return {
      ...emptyCoverageData,
      percent: NaN,
      isError: true,
      flowCoverageError: undefined,
      flowCoverageException: res.err && res.err.message,
      flowCoverageStderr: res.stderr,
      flowCoverageParsingError: undefined
    };
  }

  if (process.env.VERBOSE) {
    console.log(`Collecting coverage data from ${filename} completed.`);
    if (tmpFilePath) {
      await writeFile(tmpFilePath, res.stdout || '');
      console.log(`Saved json dump of collected coverage data from ${filename} to ${tmpFilePath}.`);
    }
  }

  let parsedData: ?FlowCoverageJSONData;
  let flowCoverageParsingError: string;

  if (res.stdout) {
    try {
      parsedData = JSON.parse(String(res.stdout));
    } catch (err) {
      flowCoverageParsingError = err.message;
    }
  }

  if (res.stderr) {
    try {
      parsedData = JSON.parse(String(res.stderr));
      delete res.stderr;
    } catch (err) {
    }
  }

  if (parsedData && !parsedData.error) {
    parsedData.filename = filename;
    parsedData.annotation = await genCheckFlowStatus(flowCommandPath, filename);
    parsedData.isFlow = isFlowAnnotation(parsedData.annotation, Boolean(strictCoverage));

    // In strictCoverage mode all files that are not strictly flow
    // (e.g. non annotated and flow weak files) are considered
    // as completely uncovered.
    if (strictCoverage && !parsedData.isFlow) {
      parsedData.expressions.uncovered_count += parsedData.expressions.covered_count;
      parsedData.expressions.covered_count = 0;
    }
    return parsedData;
  }

  return {
    ...emptyCoverageData,
    percent: NaN,
    isError: true,
    isFlow: Boolean(parsedData && parsedData.isFlow),
    flowCoverageError: parsedData && parsedData.error,
    flowCoverageException: undefined,
    flowCoverageParsingError,
    flowCoverageStderr: res.stderr
  };
}

// Definition and flow types related to collectForCoverage.

type FlowAnnotationSummary = {
  passed: boolean,
  flowFiles: number,
  flowWeakFiles: number,
  noFlowFiles: number,
  totalFiles: number,
};

export type FlowCoverageSummaryData = {
  covered_count: number,
  uncovered_count: number,
  percent: number,
  threshold: number,
  strictCoverage: boolean,
  generatedAt: string,
  flowStatus: FlowStatus,
  flowAnnotations: FlowAnnotationSummary,
  globIncludePatterns: Array<string>,
  globExcludePatterns: Array<string>,
  concurrentFiles: number,
  files: {
    [key: string]: FlowCoverageJSONData
  }
}

export function summarizeAnnotations(
  coverageSummaryData: FlowCoverageSummaryData
): FlowAnnotationSummary {
  let flowFiles = 0;
  let flowWeakFiles = 0;
  let noFlowFiles = 0;

  const filenames = Object.keys(coverageSummaryData.files);

  filenames.forEach(filename => {
    const {annotation} = coverageSummaryData.files[filename];
    switch (annotation) {
      case 'flow weak':
        flowWeakFiles += 1;
        break;
      case 'no flow':
        noFlowFiles += 1;
        break;
      default:
        if (typeof annotation === 'string' &&
            isFlowAnnotation(annotation, true)) {
          flowFiles += 1;
          return;
        }
        throw new Error(`Unexpected missing flow annotation on ${filename}`);
    }
  });

  return {
    passed: (flowWeakFiles + noFlowFiles) === 0,
    flowFiles,
    flowWeakFiles,
    noFlowFiles,
    totalFiles: filenames.length
  };
}

export function collectFlowCoverage(
  opts: FlowCoverageReportOptions,
  tmpDirPath: ?string,
): Promise<FlowCoverageSummaryData> {
  const {
    flowCommandPath,
    flowCommandTimeout,
    projectDir,
    globIncludePatterns,
    globExcludePatterns = [],
    threshold,
    percentDecimals,
    concurrentFiles = 1,
    strictCoverage,
    excludeNonFlow
  } = opts;

  return checkFlowStatus(flowCommandPath, projectDir, tmpDirPath).then(flowStatus => {
    const now = new Date();
    const coverageGeneratedAt = now.toDateString() + ' ' + now.toTimeString();

    const annotationSummary = {
      passed: false,
      flowFiles: 0,
      flowWeakFiles: 0,
      noFlowFiles: 0,
      totalFiles: 0
    };

    const coverageSummaryData: FlowCoverageSummaryData = {
      threshold,
      covered_count: 0, uncovered_count: 0, // eslint-disable-line camelcase
      percent: 0,
      generatedAt: coverageGeneratedAt,
      flowStatus,
      flowAnnotations: annotationSummary,
      files: {},
      globIncludePatterns,
      globExcludePatterns,
      concurrentFiles,
      strictCoverage: Boolean(strictCoverage),
      excludeNonFlow
    };

    // Remove the source attribute from all ucovered_locs entry.
    function cleanupUncoveredLoc(loc) {
      delete loc.start.source;
      delete loc.end.source;
      return loc;
    }

    let waitForCollectedDataFromFiles = [];

    async function drainQueue() {
      if (process.env.VERBOSE) {
        console.log(`Wait for ${waitForCollectedDataFromFiles.length} queued files.`);
      }
      // Wait the queued files.
      await Promise.all(waitForCollectedDataFromFiles);
      // Empty the collected Data From files queue.
      waitForCollectedDataFromFiles = [];
    }

    function collectCoverageAndGenerateReportForGlob(globIncludePattern) {
      return glob(globIncludePattern, {cwd: projectDir, root: projectDir})
        .then(async files => {
          for (const filename of files) {
            // Skip files that match any of the exclude patterns.
            if (globExcludePatterns && globExcludePatterns.find(pattern => minimatch(filename, pattern)) !== undefined) {
              if (process.env.VERBOSE) {
                console.log(`Skip ${filename}, matched excluded pattern.`);
              }
              continue;
            }

            if (excludeNonFlow) {
              // eslint-disable-next-line no-await-in-loop
              const annotation = await genCheckFlowStatus(flowCommandPath, filename);
              if (annotation === 'no flow') {
                if (process.env.VERBOSE) {
                  console.log(`Skip ${filename}, matched 'no flow' in excludeNonFlow mode.`);
                }
                continue;
              }
            }

            if (process.env.VERBOSE) {
              console.log(`Queue ${filename} flow coverage data collection`);
            }

            waitForCollectedDataFromFiles.push(collectFlowCoverageForFile(
              flowCommandPath, flowCommandTimeout, projectDir, filename, tmpDirPath, strictCoverage
            ).then(data => {
              /* eslint-disable camelcase */
              coverageSummaryData.covered_count += data.expressions.covered_count;
              coverageSummaryData.uncovered_count += data.expressions.uncovered_count;
              data.percent = getCoveredPercent(data.expressions, percentDecimals);

              if (!data.filename) {
                throw new Error('Unxepected missing filename from collected coverage data');
              }

              coverageSummaryData.files[data.filename] = data;

              data.expressions.uncovered_locs =
                data.expressions.uncovered_locs.map(cleanupUncoveredLoc);
              /* eslint-enable camelcase */
            }));

            // If we have collected at least `concurrentFiles` number of files,
            // wait the queue to be drained.
            if (waitForCollectedDataFromFiles.length >= concurrentFiles) {
              await drainQueue(); // eslint-disable-line no-await-in-loop
            }
          }

          // Wait for any remaining queued file.
          if (waitForCollectedDataFromFiles.length > 0) {
            await drainQueue();
          }

          return files;
        });
    }

    return Promise
      .all(globIncludePatterns.map(collectCoverageAndGenerateReportForGlob))
      .then(() => {
        coverageSummaryData.percent = getCoveredPercent(coverageSummaryData, percentDecimals);
        coverageSummaryData.flowAnnotations = summarizeAnnotations(
          coverageSummaryData
        );

        return coverageSummaryData;
      });
  });
}
