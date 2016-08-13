const FLOW_STATUS_PASSED = {
  passed: true,
  errors: [],
  flowVersion: '0.30.0'
};

const now = new Date();
const generatedAt = now.toDateString() + ' ' + now.toTimeString();

const firstGlob = 'src/*.js';
const secondGlob = 'src/*/*.js';
const firstGlobResults = ['src/a.js', 'src/b.js'];
const secondGlobResults = ['src/d1/c.js', 'src/d1/d.js'];

const allFiles = [].concat(firstGlobResults, secondGlobResults);

/* eslint-disable camelcase */
const FLOW_COVERAGE_SUMMARY_DATA = {
  flowStatus: {...FLOW_STATUS_PASSED},
  generatedAt,
  covered_count: 4,
  uncovered_count: 4,
  globIncludePatterns: [firstGlob, secondGlob],
  files: allFiles.reduce((acc, filename) => {
    acc[filename] = {
      percent: 50,
      expressions: {
        covered_count: 1,
        uncovered_count: 1,
        uncovered_locs: [{
          start: {
            line: 1,
            column: 1,
            offset: 10
          },
          end: {
            line: 2,
            column: 2,
            offset: 30
          }
        }]
      }
    };
    return acc;
  }, {})
};
/* eslint-enable camelcase */

module.exports = {
  FLOW_COVERAGE_SUMMARY_DATA,
  FLOW_STATUS_PASSED
};
