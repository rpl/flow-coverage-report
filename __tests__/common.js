import path from 'path';
import {exec} from 'child_process';

export const FIXTURE_PATH = path.join(__dirname, 'fixtures');
export const BIN_PATH = path.join(__dirname, '../bin/');

export function runFlowCoverageReport(args, options = {}) {
  return new Promise(resolve => {
    options.env = options.env || {};
    // Put the binary in the executable path to make the error message the same
    // on different machines.
    options.env.PATH = `${process.env.PATH}:${BIN_PATH}`;
    exec(`flow-coverage-report.js ${args.join(' ')}`, options, (error, stdout, stderr) => {
      const exitCode = error ? error.code : 0;

      resolve({
        error,
        exitCode,
        stdout,
        stderr
      });
    });
  });
}

export function removeGeneratedAtFromStdout(stdout) {
  let foundGeneratedAt = false;

  stdout = stdout ? stdout.split('\n').filter(line => {
    if (line.includes('generated at: ')) {
      foundGeneratedAt = true;
      return false;
    }

    return true;
  }).join('\n') : stdout;

  return {
    stdout,
    foundGeneratedAt
  };
}
