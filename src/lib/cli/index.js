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
    /* eslint-disable camelcase */
    const {percent, threshold, thresholdUncovered, uncovered_count} = coverageSummaryData;

    if (thresholdUncovered && uncovered_count > thresholdUncovered) {
    /* eslint-enable camelcase */
      console.error(
        `Flow Coverage: uncovered count is higher than the uncoveredThreshold`
      );
      process.exit(2); // eslint-disable-line unicorn/no-process-exit
    }
    if (!thresholdUncovered && percent < threshold) {
      console.error(
        `Flow Coverage: ${percent}% is below the required threshold ${threshold}%`
      );
      process.exit(2); // eslint-disable-line unicorn/no-process-exit
    }
  }).catch(err => {
    console.error('Error while generating Flow Coverage Report: ' + err + ' ' + err.stack);
    process.exit(255); // eslint-disable-line unicorn/no-process-exit
  });
};
