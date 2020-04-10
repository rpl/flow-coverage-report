const FLOW_STATUS_PASSED = {
  passed: true,
  errors: [],
  flowVersion: '0.30.0'
};

const now = new Date();
const generatedAt = now.toDateString() + ' ' + now.toTimeString();

const firstGlob = 'src/*.js';
const secondGlob = 'src/*/*.js';
const firstGlobResults = ['src/a.js', 'src/b.js', 'src/c.js'];
const secondGlobResults = ['src/d1/d.js', 'src/d1/e.js'];

const fakeTypeAnnotations = {
  'src/c.js': 'no flow',
  'src/d1/d.js': 'flow strict',
  'src/d1/e.js': 'flow strict-local'
};

const fakeIsFlow = {
  'src/c.js': false,
  'src/d1/d.js': true,
  'src/d1/e.js': true
};

const allFiles = [].concat(firstGlobResults, secondGlobResults);

/* eslint-disable camelcase */
const FLOW_COVERAGE_SUMMARY_DATA = {
  flowStatus: {...FLOW_STATUS_PASSED},
  generatedAt,
  covered_count: 5,
  uncovered_count: 5,
  threshold: 40,
  uncoveredThreshold: 3,
  percent: 50,
  globIncludePatterns: [firstGlob, secondGlob],
  files: allFiles.reduce((acc, filename) => {
    acc[filename] = {
      percent: 50,
      annotation: fakeTypeAnnotations[filename] || 'flow',
      isFlow: filename in fakeIsFlow ? fakeIsFlow[filename] : true,
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
