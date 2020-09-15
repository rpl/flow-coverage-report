'use babel';

const LIB_INDEX = '../lib/index';
const LIB_FLOW = '../lib/flow';
const LIB_REPORT_BADGE = '../lib/report-badge';
const LIB_REPORT_HTML = '../lib/report-html';
const LIB_REPORT_JSON = '../lib/report-json';
const LIB_REPORT_TEXT = '../lib/report-text';

beforeEach(() => {
  jest.resetModules();
});

it('generateFlowCoverageReport', async () => {
  const mockCollectFlowCoverage = jest.fn();
  jest.mock(LIB_FLOW, () => ({
    collectFlowCoverage: mockCollectFlowCoverage
  }));

  const mockGenerateBadge = jest.fn();
  jest.mock(LIB_REPORT_BADGE, () => ({
    generate: mockGenerateBadge
  }));
  const mockGenerateHTML = jest.fn();
  jest.mock(LIB_REPORT_HTML, () => ({
    generate: mockGenerateHTML
  }));
  const mockGenerateJSON = jest.fn();
  jest.mock(LIB_REPORT_JSON, () => ({
    generate: mockGenerateJSON
  }));
  const mockGenerateText = jest.fn();
  jest.mock(LIB_REPORT_TEXT, () => ({
    generate: mockGenerateText
  }));

  const generateFlowCoverageReport = require(LIB_INDEX).default;

  const fakeData = {fakeData: true, flowStatus: {passed: true}};
  mockCollectFlowCoverage.mockReturnValue(Promise.resolve(fakeData));

  mockGenerateJSON.mockReturnValue(Promise.resolve());
  mockGenerateHTML.mockReturnValue(Promise.resolve());
  mockGenerateText.mockReturnValue(Promise.resolve());
  mockGenerateBadge.mockReturnValue(Promise.resolve());

  const options = {
    projectDir: '/projectDir',
    globIncludePatterns: ['src/*.js'],
    threshold: 80
  };

  const res = await generateFlowCoverageReport(options);

  expect(res).toEqual([fakeData, options]);
  expect(mockCollectFlowCoverage.mock.calls.length).toBe(1);
  expect(mockGenerateText.mock.calls.length).toBe(1);
  expect(mockGenerateHTML.mock.calls.length).toBe(0);
  expect(mockGenerateJSON.mock.calls.length).toBe(0);

  jest.clearAllMocks();

  await generateFlowCoverageReport({
    ...options,
    reportTypes: ['html', 'json']
  });

  expect(mockGenerateJSON.mock.calls.length).toBe(1);
  expect(mockGenerateHTML.mock.calls.length).toBe(1);
  // Called implicitly because of the 'html' reportType.
  expect(mockGenerateBadge.mock.calls.length).toBe(1);
  expect(mockGenerateText.mock.calls.length).toBe(0);

  jest.clearAllMocks();

  await generateFlowCoverageReport({
    ...options,
    reportTypes: ['badge']
  });

  expect(mockGenerateBadge.mock.calls.length).toBe(1);
  expect(mockGenerateJSON.mock.calls.length).toBe(0);
  expect(mockGenerateHTML.mock.calls.length).toBe(0);
  expect(mockGenerateText.mock.calls.length).toBe(0);

  jest.clearAllMocks();

  let exception;

  try {
    await generateFlowCoverageReport({...options, projectDir: null});
  } catch (error) {
    exception = error;
  }

  expect(exception && exception.message).toMatch(
    /projectDir option is mandatory/
  );

  let exception2;

  try {
    await generateFlowCoverageReport({...options, globIncludePatterns: null});
  } catch (error) {
    exception2 = error;
  }

  expect(exception2 && exception2.message).toMatch(
    /empty globIncludePatterns option/
  );

  let exception3;
  try {
    await generateFlowCoverageReport({...options, globIncludePatterns: []});
  } catch (error) {
    exception3 = error;
  }

  expect(exception3 && exception3.message).toMatch(
    /empty globIncludePatterns option/
  );
});
