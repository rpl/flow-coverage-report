// @flow

import generateFlowCoverageReport from '../../lib';
import processArgv from './args';
import {loadConfig, validateConfig, UsageError} from './config';

exports.run = () => {
  let args = processArgv(process.argv);

  try {
    args = loadConfig(args);
    validateConfig(args);
  } catch (err) {
    if (err instanceof UsageError) {
      console.error('Configuration error:', err.message);
    } else {
      console.error('Unexpected exception: ' + err + ' ' + err.stack);
    }
    process.exit(255); // eslint-disable-line unicorn/no-process-exit
  }

  generateFlowCoverageReport({...args}).then(([coverageSummaryData]) => {
    const {percent, threshold, flowStatus} = coverageSummaryData;

    if (!flowStatus.passed) {
      process.exit(1); // eslint-disable-line unicorn/no-process-exit
    }

    if (percent < threshold) {
      console.error(
        `Flow Coverage ${percent}% is below the required threshold ${threshold}%`
      );
      process.exit(2); // eslint-disable-line unicorn/no-process-exit
    }
  }).catch(err => {
    console.error('Error while generating Flow Coverage Report: ' + err + ' ' + err.stack);
    process.exit(255); // eslint-disable-line unicorn/no-process-exit
  });
};
