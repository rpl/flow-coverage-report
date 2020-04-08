'use strict';

// @flow

import path from 'path';

import badge from '@rpl/badge-up';
import mkdirp from 'mkdirp';

import {writeFile} from './promisified';

import type {FlowCoverageSummaryData} from './flow';
import type {FlowCoverageReportOptions} from './index';

async function saveBadgeReport(
  coverageData: FlowCoverageSummaryData,
  opts: FlowCoverageReportOptions
): Promise<void> {
  const percent = coverageData.percent;
  const threshold = opts.threshold || 80;
  const hasFlowErrors = !coverageData.flowStatus.passed;

  const generateFlowCoverageBadge = () => new Promise((resolve, reject) => {
    let color;

    if (percent < (threshold / 2)) {
      color = 'red';
    } else if (percent < (threshold * 5 / 8)) {
      color = 'orange';
    } else if (percent < (threshold * 6 / 8)) {
      color = 'yellow';
    } else if (percent < (threshold * 7 / 8)) {
      color = 'yellowgreen';
    } else if (percent < threshold) {
      color = 'green';
    } else {
      color = 'brightgreen';
    }

    badge('flow-coverage', `${percent}%`, badge.colors[color], (err, svg) => {
      if (err) {
        reject(err);
      } else {
        resolve(svg);
      }
    });
  });

  const generateFlowBadge = () => new Promise((resolve, reject) => {
    const color = hasFlowErrors ? 'red' : 'brightgreen';
    const result = hasFlowErrors ? 'failing' : 'passing';

    badge('flow', result, badge.colors[color], (err, svg) => {
      if (err) {
        reject(err);
      } else {
        resolve(svg);
      }
    });
  });

  const projectDir = opts.projectDir;
  const outputDir = opts.outputDir || path.join(projectDir, 'flow-coverage');

  await mkdirp(outputDir);
  const flowCoverageSVG = await generateFlowCoverageBadge();
  await writeFile(path.join(outputDir, 'flow-coverage-badge.svg'), flowCoverageSVG);

  const flowSVG = await generateFlowBadge();
  await writeFile(path.join(outputDir, 'flow-badge.svg'), flowSVG);
}

export default {
  generate: saveBadgeReport
};
