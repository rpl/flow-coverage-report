'use babel';

import path from 'path';

import badge from '@rpl/badge-up';

const LIB_REPORT_BADGE = '../lib/report-badge';
const LIB_PROMISIFIED = '../lib/promisified';
const NPM_BADGE = '@rpl/badge-up';

beforeEach(() => {
  jest.resetModules();
});

function getPromisifiedMocks() {
  const mockMkdirp = jest.fn();
  jest.mock('mkdirp', () => mockMkdirp);
  const mockWriteFile = jest.fn();
  jest.mock(LIB_PROMISIFIED, () => ({
    writeFile: mockWriteFile
  }));

  mockMkdirp.mockReturnValue(Promise.resolve());
  mockWriteFile.mockReturnValue(Promise.resolve());

  return {mockMkdirp, mockWriteFile};
}

function getBadgeUpMocks() {
  const mockBadge = jest.fn((label, result, color, cb) => {
    cb(null, `fake-svg-data ${label} ${result} ${color}`);
  });
  mockBadge.colors = badge.colors;

  jest.mock(NPM_BADGE, () => mockBadge);

  return {mockBadge};
}

function expectGeneratedBadge({
  mockWriteFile, outputDir, fileName, label, result, color
}) {
  expect(mockWriteFile).toHaveBeenCalledWith(
    path.join(outputDir, fileName),
    `fake-svg-data ${label} ${result} ${color}`
  );
}

it('creates red badges on flow errors and low coverage', async () => {
  const {mockMkdirp, mockWriteFile} = getPromisifiedMocks();
  const {mockBadge} = getBadgeUpMocks();

  const reportBadge = require(LIB_REPORT_BADGE).default;

  const options = {
    projectDir: '/projectDir',
    outputDir: '/projectDir/flow-coverage',
    threshold: 80
  };

  const coverageData = {
    flowStatus: {passed: false},
    percent: 20
  };

  await reportBadge.generate(coverageData, options);

  expect(mockMkdirp).toHaveBeenCalledTimes(1);
  expect(mockMkdirp).toHaveBeenCalledWith(options.outputDir);

  expect(mockWriteFile).toHaveBeenCalledTimes(2);
  expect(mockBadge).toHaveBeenCalledTimes(2);

  const sharedExpectations = {
    mockWriteFile,
    outputDir: options.outputDir,
    color: badge.colors.red
  };

  expectGeneratedBadge({
    ...sharedExpectations,
    fileName: 'flow-badge.svg',
    label: 'flow',
    result: 'failing'
  });

  expectGeneratedBadge({
    ...sharedExpectations,
    fileName: 'flow-coverage-badge.svg',
    label: 'flow-coverage',
    result: `${coverageData.percent}%`
  });
});

it('creates green badges on no flow errors and high coverage', async () => {
  const {mockMkdirp, mockWriteFile} = getPromisifiedMocks();
  const {mockBadge} = getBadgeUpMocks();

  const reportBadge = require(LIB_REPORT_BADGE).default;

  const options = {
    projectDir: '/projectDir',
    outputDir: '/projectDir/flow-coverage',
    threshold: 80
  };

  const coverageData = {
    flowStatus: {passed: true},
    percent: 90
  };

  await reportBadge.generate(coverageData, options);

  expect(mockMkdirp).toHaveBeenCalledTimes(1);
  expect(mockMkdirp).toHaveBeenCalledWith(options.outputDir);

  expect(mockWriteFile).toHaveBeenCalledTimes(2);
  expect(mockBadge).toHaveBeenCalledTimes(2);

  const sharedExpectations = {
    mockWriteFile,
    outputDir: options.outputDir,
    color: badge.colors.brightgreen
  };

  expectGeneratedBadge({
    ...sharedExpectations,
    fileName: 'flow-badge.svg',
    label: 'flow',
    result: 'passing'
  });

  expectGeneratedBadge({
    ...sharedExpectations,
    fileName: 'flow-coverage-badge.svg',
    label: 'flow-coverage',
    result: `${coverageData.percent}%`
  });
});

it('uses brighter colors based on the distance from the threshold', async () => {
  const {mockWriteFile} = getPromisifiedMocks();
  getBadgeUpMocks();

  const reportBadge = require(LIB_REPORT_BADGE).default;

  const baseOptions = {
    projectDir: '/projectDir',
    outputDir: '/projectDir/flow-coverage'
  };

  const baseCoverageData = {
    flowStatus: {passed: true}
  };

  const sharedExpectations = {
    mockWriteFile,
    outputDir: baseOptions.outputDir,
    fileName: 'flow-coverage-badge.svg',
    label: 'flow-coverage'
  };

  let coverageData;
  let options;

  // The coverage badge should turn orange when the percentage is
  // >= (threshold / 2) but < (threshold * 5 / 8).
  coverageData = {...baseCoverageData, percent: 50};
  options = {...baseOptions, threshold: 100};
  await reportBadge.generate(coverageData, options);
  expectGeneratedBadge({
    ...sharedExpectations,
    color: badge.colors.orange,
    result: `${coverageData.percent}%`
  });

  jest.clearAllMocks();

  // The coverage badge should turn yellow when the percentage is
  // >= (threshold * 5 / 8) but < (threshold * 6 / 8).
  coverageData = {...baseCoverageData, percent: 65};
  options = {...baseOptions, threshold: 100};
  await reportBadge.generate(coverageData, options);
  expectGeneratedBadge({
    ...sharedExpectations,
    color: badge.colors.yellow,
    result: `${coverageData.percent}%`
  });

  jest.clearAllMocks();

  // The coverage badge should turn yellowgreen when the percentage is
  // >= (threshold * 6 / 8) but < (threshold * 7 / 8).
  coverageData = {...baseCoverageData, percent: 75};
  options = {...baseOptions, threshold: 100};
  await reportBadge.generate(coverageData, options);
  expectGeneratedBadge({
    ...sharedExpectations,
    color: badge.colors.yellowgreen,
    result: `${coverageData.percent}%`
  });

  jest.clearAllMocks();

  // The coverage badge should turn green when the percentage is
  // >= (threshold * 7 / 8) but < threshold.
  coverageData = {...baseCoverageData, percent: 88};
  options = {...baseOptions, threshold: 100};
  await reportBadge.generate(coverageData, options);
  expectGeneratedBadge({
    ...sharedExpectations,
    color: badge.colors.green,
    result: `${coverageData.percent}%`
  });
});
