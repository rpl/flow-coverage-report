'use strict';

// @flow

import path from 'path';
import Table from 'terminal-table';

import type {FlowCoverageSummaryData} from './flow';
import type {FlowCoverageReportOptions} from './index';

function renderTextReport(
  coverageData: FlowCoverageSummaryData,
  opts: FlowCoverageReportOptions
): Promise<void> {
  const print = opts.log || console.log.bind(console);

  const filesTable = new Table({
    leftPadding: 1,
    rightPadding: 1,
    borderStyle: 2
  });
  filesTable.push([
    'filename',
    'annotation',
    'percent',
    'total',
    'covered',
    'uncovered'
  ]);

  let row = 0;
  for (const filename of Object.keys(coverageData.files).sort()) {
    row += 1;
    const data = coverageData.files[filename];

    const annotation = data.annotation || 'no flow';
    const covered = data.expressions.covered_count;
    const uncovered = data.expressions.uncovered_count;
    const {percent} = data;

    filesTable.push([
      filename,
      annotation,
      data.isError ? '\u26A0 Error' : percent + ' %',
      covered + uncovered,
      covered,
      uncovered
    ]);

    let rowColor;
    if (data.isFlow && percent >= (opts.threshold || 80)) {
      rowColor = 'green';
    } else {
      rowColor = 'red';
    }

    if (data.isError) {
      rowColor = 'red';
    }

    filesTable.attrRange({row: [row]}, {
      color: rowColor
    });
  }

  filesTable.attrRange({column: [1, 5]}, {
    align: 'right'
  });

  const summaryTablePre = new Table({
    leftPadding: 1,
    rightPadding: 1,
    borderStyle: 2
  });

  const thresholdValue = coverageData.thresholdUncovered ?
    ['thresholdUncovered', coverageData.thresholdUncovered] :
    ['threshold', coverageData.threshold];

  summaryTablePre.push([
    'included glob patterns:',
    coverageData.globIncludePatterns.join(', ')
  ]);
  summaryTablePre.push([
    'excluded glob patterns:',
    (coverageData.globExcludePatterns || []).join(', ')
  ]);
  summaryTablePre.push(thresholdValue);
  summaryTablePre.push([
    'concurrent files:',
    coverageData.concurrentFiles
  ]);

  summaryTablePre.push(['generated at:', coverageData.generatedAt]);
  summaryTablePre.push(['flow version:', coverageData.flowStatus.flowVersion]);
  summaryTablePre.push([
    'flow check passed:',
    (coverageData.flowStatus.passed ? 'yes' : 'no') + ' (' +
    (coverageData.flowStatus.errors.length >= 50 ?
      ' >= 50' : coverageData.flowStatus.errors.length) +
    ' errors)'
  ]);
  summaryTablePre.attrRange({row: [6]}, {
    color: coverageData.flowStatus.passed ? 'green' : 'red'
  });

  summaryTablePre.attrRange({column: [0, 1]}, {
    align: 'right'
  });

  const summaryTable = new Table({
    leftPadding: 1,
    rightPadding: 1,
    borderStyle: 2
  });

  summaryTable.push(['project', 'percent', 'total', 'covered', 'uncovered']);
  const summaryTotal = coverageData.covered_count + coverageData.uncovered_count;
  const summaryPercent = coverageData.percent;

  let withinThreshold;
  if (opts.thresholdUncovered) {
    withinThreshold = coverageData.uncovered_count <= opts.thresholdUncovered;
  } else {
    withinThreshold = summaryPercent >= opts.threshold;
  }

  let summaryColor;
  if (withinThreshold) {
    summaryColor = 'green';
  } else {
    summaryColor = 'red';
  }

  summaryTable.push([
    path.basename(opts.projectDir),
    summaryPercent + ' %',
    summaryTotal,
    coverageData.covered_count,
    coverageData.uncovered_count
  ]);

  summaryTable.attrRange({row: [1]}, {color: summaryColor});

  summaryTable.attrRange({column: [1, 5]}, {
    align: 'right'
  });

  const waitForDrain = new Promise(resolve => {
    process.stdout.once('drain', resolve);

    const flushed = process.stdout.write('');

    if (flushed || opts.log) {
      resolve();
    }
  });

  print(String(filesTable));
  print(String(summaryTablePre));
  print(String(summaryTable));

  return waitForDrain;
}

function generateFlowCoverageReportText(
  coverageData: FlowCoverageSummaryData,
  opts: Object
): Promise<void> {
  return renderTextReport(coverageData, opts);
}

export default {
  render: renderTextReport,
  generate: generateFlowCoverageReportText
};
