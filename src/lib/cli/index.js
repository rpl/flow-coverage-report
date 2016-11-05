import {generateFlowCoverageReport} from '../../lib';
import {processArgv} from './args';

exports.run = () => {
  const args = processArgv(process.argv);

  generateFlowCoverageReport({
    concurrentFiles: args.concurrentFiles,
    flowCommandPath: args.flowCommandPath,
    globExcludePatterns: args.excludeGlob,
    globIncludePatterns: args.includeGlob,
    outputDir: args.outputDir,
    projectDir: args.projectDir,
    reportTypes: args.type,
    threshold: args.threshold
  }).catch(err => {
    console.error('Error while generating Flow Coverage Report: ' + err + ' ' + err.stack);
    process.exit(255); // eslint-disable-line xo/no-process-exit
  }).then(([coverageSummaryData]) => {
    const {percent, threshold} = coverageSummaryData;
    if (percent < threshold) {
      console.error(
        `Flow Coverage ${percent}% is below the required threshold ${threshold}%`
      );
      process.exit(2); // eslint-disable-line xo/no-process-exit
    }
  });
};
