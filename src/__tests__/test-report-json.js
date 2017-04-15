'use babel';

const LIB_REPORT_JSON = '../lib/report-json';
const LIB_PROMISIFIED = '../lib/promisified';

beforeEach(() => {
  jest.resetModules();
});

it('generate JSON report', async () => {
  const mockMkdirp = jest.fn();
  const mockWriteFile = jest.fn();

  jest.mock(LIB_PROMISIFIED, () => ({
    mkdirp: mockMkdirp,
    writeFile: mockWriteFile
  }));

  const reportJSON = require(LIB_REPORT_JSON).default;

  mockMkdirp.mockReturnValue(Promise.resolve());
  mockWriteFile.mockReturnValue(Promise.resolve());

  const fakeData = {fakeCoverageSummaryData: true};
  const options = {
    projectDir: '/projectDir',
    globIncludePatterns: ['src/*.js']
  };

  await reportJSON.generate(fakeData, options);

  expect(mockMkdirp.mock.calls.length).toBe(1);
  expect(mockWriteFile.mock.calls.length).toBe(1);
});

test.skip('generate JSON report failures');
