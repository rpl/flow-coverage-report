'use strict';

// @flow

import path from 'path';

import badge from 'badge-up';

import {mkdirp, writeFile} from './promisified';

import type {FlowCoverageSummaryData} from './flow';
import type {FlowCoverageReportOptions} from './index';

function saveBadgeReport(
  coverageData: FlowCoverageSummaryData,
  opts: FlowCoverageReportOptions
): Promise<void> {
  const percent = coverageData.percent;
  const threshold = opts.threshold || 80;
  const difference = percent - threshold;

  let color;

  if (difference < -40) {
    color = 'red';
  } else if (difference < -30) {
    color = 'orange';
  } else if (difference < -20) {
    color = 'yellow';
  } else if (difference < -10) {
    color = 'yellowgreen';
  } else if (difference < 0) {
    color = 'green';
  } else {
    color = 'brightgreen';
  }

  const badgeGen = () => new Promise((resolve, reject) => {
    badge('flow', `${percent}%`, badge.colors[color], (err, svg) => {
      if (err) {
        reject(err);
      } else {
        resolve(svg);
      }
    });
  });

  const projectDir = opts.projectDir;
  const outputDir = opts.outputDir || path.join(projectDir, 'flow-coverage');

  return mkdirp(outputDir).then(badgeGen).then(svg => {
    return writeFile(path.join(outputDir, 'flow-coverage.svg'), svg);
  });
}

export default {
  generate: saveBadgeReport
};
