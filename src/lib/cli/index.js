// @flow

import generateFlowCoverageReport from '../../lib';
import processArgv from './args';
import {loadConfig, validateConfig, UsageError} from './config';

exports.run = () => {
  let args = processArgv(process.argv);

  try {
    args = loadConfig(args);
    validateConfig(args);
  } catch (error) {
    if (error instanceof UsageError) {
      console.error('Configuration error:', error.message);
    } else {
      console.error('Unexpected exception: ' + error + ' ' + error.stack);
    }

    process.exit(255); // eslint-disable-line unicorn/no-process-exit
  }

  generateFlowCoverageReport({...args}).then(([coverageSummaryData]) => {
    const {percent, threshold} = coverageSummaryData;
    if (percent < threshold) {
      console.error(
        `Flow Coverage ${percent}% is below the required threshold ${threshold}%`
      );
      process.exit(2); // eslint-disable-line unicorn/no-process-exit
    }
  }).catch(error => {
    console.error('Error while generating Flow Coverage Report: ' + error + ' ' + error.stack);
    process.exit(255); // eslint-disable-line unicorn/no-process-exit
  });
};
