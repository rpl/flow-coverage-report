'use babel';

import minimatch from 'minimatch';

import {DEFAULT_FLOW_TIMEOUT} from '../lib/index';

const LIB_FLOW = '../lib/flow';
const LIB_PROMISIFIED = '../lib/promisified';
const NPM_FLOW_ANNOTATION_CHECK = 'flow-annotation-check';
const NPM_TEMP = 'temp';

const tmpDirPath = '/tmp/fake-tmp-path';
const tmpFilePath = `${tmpDirPath}/fake-tmp-file.json`;

beforeEach(() => {
  jest.resetModules();
});

it('checkFlowStatus does not catch arbitrary errors', async () => {
  const mockExec = jest.fn();
  const mockWriteFile = jest.fn();
  const mockTempPath = jest.fn();

  jest.mock(NPM_TEMP, () => ({
    path: mockTempPath
  }));
  jest.mock(LIB_PROMISIFIED, () => ({
    exec: mockExec,
    writeFile: mockWriteFile
  }));

  mockTempPath.mockReturnValueOnce(tmpFilePath);
  mockExec.mockReturnValueOnce(Promise.resolve({
    err: new Error('Fake flow status error')
  }));

  const flow = require(LIB_FLOW);

  expect(mockTempPath.mock.calls.length).toBe(0);

  let exception;

  try {
    await flow.checkFlowStatus('flow', '/fake/projectDir/', tmpDirPath);
  } catch (err) {
    exception = err;
  }
  expect(exception && exception.message).toMatch(
    'Fake flow status error'
  );
  expect(mockExec.mock.calls.length).toBe(1);
  expect(mockExec.mock.calls[0][0]).toBe(`flow status --json`);
  expect(mockExec.mock.calls[0][1]).toEqual({
    cwd: '/fake/projectDir/',
    maxBuffer: Infinity
  });
  expect(mockExec.mock.calls[0][2]).toEqual({dontReject: true});

  // No file should be created if the VERBOSE and
  // DEBUG_DUMP_JSON env var are not set
  expect(mockTempPath.mock.calls.length).toBe(0);
  expect(mockWriteFile.mock.calls.length).toBe(0);
});

it(
  'checkFlowStatus resolves to flow types errors in json format',
  async () => {
    const mockExec = jest.fn();
    const mockWriteFile = jest.fn();
    const mockTempPath = jest.fn();

    jest.mock(NPM_TEMP, () => ({
      path: mockTempPath
    }));
    jest.mock(LIB_PROMISIFIED, () => ({
      exec: mockExec,
      writeFile: mockWriteFile
    }));

    const fakeJSONStatusReply = {
      passed: false,
      flowVersion: '0.30.0',
      errors: []
    };

    mockTempPath.mockReturnValueOnce(tmpFilePath);
    mockExec.mockReturnValueOnce(Promise.resolve({
      err: {code: 2},
      stdout: JSON.stringify(fakeJSONStatusReply)
    }));
    mockExec.mockReturnValueOnce(Promise.resolve({err: {code: 2}, stdout: ''}));

    const flow = require(LIB_FLOW);

    const res = await flow.checkFlowStatus('flow', '/fake/projectDir/', tmpDirPath);

    expect(res).toEqual(fakeJSONStatusReply);

    let exception;
    try {
      await flow.checkFlowStatus('flow', '/fake/projectDir/', tmpDirPath);
    } catch (err) {
      exception = err;
    }
    expect(exception && exception.message).toMatch(
      /Parsing error on Flow status JSON result: SyntaxError: Unexpected end/
    );
  }
);

it(
  'checkFlowStatus rejects on invalid flow status json format',
  async () => {
    const mockExec = jest.fn();
    const mockTempPath = jest.fn();

    jest.mock(NPM_TEMP, () => ({
      path: mockTempPath
    }));
    jest.mock(LIB_PROMISIFIED, () => ({
      exec: mockExec
    }));

    const fakeJSONStatusReply = {
      notFlowStatusJSON: true
    };

    mockExec.mockReturnValueOnce(Promise.resolve({
      stdout: JSON.stringify(fakeJSONStatusReply)
    }));

    const flow = require(LIB_FLOW);
    let exception;
    try {
      await flow.checkFlowStatus('flow', '/fake/projectDir/');
    } catch (err) {
      exception = err;
    }
    expect(exception && exception.message).toMatch(
      'Invalid Flow status JSON format'
    );
  }
);

it(
  'collectFlowCoverageForFile collects flow command exit errors',
  async () => {
    const mockExec = jest.fn();
    const mockTempPath = jest.fn();
    const mockWriteFile = jest.fn();

    jest.mock(NPM_TEMP, () => ({
      path: mockTempPath
    }));
    jest.mock(LIB_PROMISIFIED, () => ({
      exec: mockExec,
      writeFile: mockWriteFile
    }));

    const fakeExecError = {
      err: {
        message: 'Fake flow error without stdout',
        code: 2
      }
    };

    mockExec.mockReturnValueOnce(Promise.resolve(fakeExecError));

    const flow = require(LIB_FLOW);

    const filename = 'src/fakeFilename.js';

    const collectData = await flow.collectFlowCoverageForFile(
        'flow', '/fake/projectDir/', filename, tmpDirPath
      );

    // Expect a flow coverage exception in the collected data.
    expect(collectData.isError).toBe(true);
    expect(collectData.flowCoverageException).toBe(fakeExecError.err.message);

    // Expect empty flow coverage data when a coverage exception has been collected.
    expect(collectData.expressions).toEqual({
      /* eslint-disable camelcase */
      covered_count: 0,
      uncovered_count: 0,
      uncovered_locs: []
      /* eslint-enable camelcase */
    });

    expect(mockExec.mock.calls.length).toBe(1);
    expect(mockWriteFile.mock.calls.length).toBe(0);
  }
);

it('collectFlowCoverageForFile collects parsing errors', async () => {
  const mockExec = jest.fn();
  const mockTempPath = jest.fn();
  const mockWriteFile = jest.fn();

  jest.mock(NPM_TEMP, () => ({
    path: mockTempPath
  }));
  jest.mock(LIB_PROMISIFIED, () => ({
    exec: mockExec,
    writeFile: mockWriteFile
  }));

  mockExec.mockReturnValueOnce(Promise.resolve({
    stdout: '{'
  }));

  const flow = require(LIB_FLOW);
  const filename = 'src/fakeFilename.js';

  const collectData = await flow.collectFlowCoverageForFile(
      'flow', '/fake/projectDir/', filename, tmpDirPath
    );

  let expectedParsingError;
  try {
    JSON.parse('{');
  } catch (err) {
    expectedParsingError = err;
  }

  // Expect a flow coverage exception in the collected data.
  expect(collectData.isError).toBe(true);
  expect(collectData.flowCoverageParsingError).toBe(expectedParsingError.message);

  // Expect empty flow coverage data when a coverage exception has been collected.
  expect(collectData.expressions).toEqual({
    /* eslint-disable camelcase */
    covered_count: 0,
    uncovered_count: 0,
    uncovered_locs: []
    /* eslint-enable camelcase */
  });

  expect(mockExec.mock.calls.length).toBe(1);
  expect(mockWriteFile.mock.calls.length).toBe(0);
});

it('collectFlowCoverageForFile collects coverage errors', async () => {
  const mockExec = jest.fn();
  const mockTempPath = jest.fn();
  const mockWriteFile = jest.fn();

  jest.mock(NPM_TEMP, () => ({
    path: mockTempPath
  }));
  jest.mock(LIB_PROMISIFIED, () => ({
    exec: mockExec,
    writeFile: mockWriteFile
  }));

  mockExec.mockReturnValueOnce(Promise.resolve({
    stderr: '{"error": "Fake flow coverage message"}'
  }));

  const flow = require(LIB_FLOW);
  const filename = 'src/fakeFilename.js';

  const collectData = await flow.collectFlowCoverageForFile(
      'flow', '/fake/projectDir/', filename, tmpDirPath
    );

  // Expect a flow coverage exception in the collected data.
  expect(collectData.isError).toBe(true);
  expect(collectData.flowCoverageError).toBe('Fake flow coverage message');

  // Expect empty flow coverage data when a coverage exception has been collected.
  expect(collectData.expressions).toEqual({
    /* eslint-disable camelcase */
    covered_count: 0,
    uncovered_count: 0,
    uncovered_locs: []
    /* eslint-enable camelcase */
  });

  expect(mockExec.mock.calls.length).toBe(1);
  expect(mockWriteFile.mock.calls.length).toBe(0);
});

it('collectFlowCoverageForFile resolve coverage data', async () => {
  const mockExec = jest.fn();
  const mockWriteFile = jest.fn();
  const mockTempPath = jest.fn();
  const mockGenCheckFlowStatus = jest.fn();

  jest.mock(NPM_TEMP, () => ({
    path: mockTempPath
  }));
  jest.mock(LIB_PROMISIFIED, () => ({
    exec: mockExec,
    writeFile: mockWriteFile
  }));
  jest.mock(NPM_FLOW_ANNOTATION_CHECK, () => ({
    genCheckFlowStatus: mockGenCheckFlowStatus
  }));

  const filename = 'src/fakeFilename.js';
  const fakeFlowCoverageData = {
    filename,
    fakeCoverageData: {
      ok: true
    }
  };

  mockTempPath.mockReturnValueOnce(tmpFilePath);
  mockExec.mockReturnValueOnce(Promise.resolve({
    stdout: Buffer.from(JSON.stringify(fakeFlowCoverageData))
  }));
  mockGenCheckFlowStatus.mockReturnValueOnce(Promise.resolve('flow'));

  const flow = require(LIB_FLOW);

  const res = await flow.collectFlowCoverageForFile(
    'flow', DEFAULT_FLOW_TIMEOUT, '/fake/projectDir', filename
  );

  expect(mockWriteFile.mock.calls.length).toBe(0);
  expect(mockExec.mock.calls.length).toBe(1);
  expect(mockExec.mock.calls[0][0]).toBe(`flow coverage --json ${filename}`);
  expect(mockExec.mock.calls[0][1]).toEqual({
    cwd: '/fake/projectDir', maxBuffer: Infinity, timeout: DEFAULT_FLOW_TIMEOUT
  });
  expect(res).toEqual({
    ...fakeFlowCoverageData,
    annotation: 'flow'
  });
});

const testCollectFlowCoverage = async ({expectedResults, strictCoverage} = {}) => {
  const mockExec = jest.fn();
  const mockWriteFile = jest.fn();
  const mockTempPath = jest.fn();
  const mockGlob = jest.fn();
  const mockGenCheckFlowStatus = jest.fn();

  jest.mock(NPM_TEMP, () => ({
    path: mockTempPath
  }));
  jest.mock(LIB_PROMISIFIED, () => ({
    exec: mockExec,
    glob: mockGlob,
    writeFile: mockWriteFile
  }));
  jest.mock(NPM_FLOW_ANNOTATION_CHECK, () => ({
    genCheckFlowStatus: mockGenCheckFlowStatus
  }));

  const fakeFlowStatus = {
    passed: true,
    errors: [],
    flowVersion: '0.30.0'
  };

  const firstGlobResults = ['src/a.js', 'src/b.js', 'test/test-a.js'];
  const secondGlobResults = ['src/d1/c.js', 'src/d1/d.js', 'test/subdir/test-d.js'];
  const expectedFlowAnnotations = {
    'src/a.js': 'flow',
    'src/b.js': 'flow strict',
    'src/d1/c.js': 'no flow',
    'src/d1/d.js': 'flow weak'
  };

  // Fake reply to flow status command.
  mockExec.mockReturnValueOnce(Promise.resolve({
    stdout: JSON.stringify(fakeFlowStatus)
  }));

  // Fake the glob results.
  mockGlob.mockReturnValueOnce(Promise.resolve(firstGlobResults));
  mockGlob.mockReturnValueOnce(Promise.resolve(secondGlobResults));

  // Fake flow-annotation-check
  mockGenCheckFlowStatus.mockImplementation((flowommentPath, filename) => {
    return Promise.resolve(expectedFlowAnnotations[filename]);
  });

  const allFiles = [].concat(firstGlobResults, secondGlobResults);

  // Fake the flow coverage commands results.
  for (let i = 1; i <= allFiles.length; i++) {
    mockExec.mockReturnValueOnce(Promise.resolve({
      stdout: JSON.stringify({
        /* eslint-disable camelcase */
        expressions: {
          covered_count: 1,
          uncovered_count: 1,
          uncovered_locs: [{
            start: {
              source: allFiles[i],
              line: 1,
              column: 1,
              offset: 10
            },
            end: {
              source: allFiles[i],
              line: 2,
              column: 2,
              offset: 30
            }
          }]
        }
        /* eslint-enable camelcase */
      })
    }));
  }

  const flow = require(LIB_FLOW);

  const globIncludePatterns = [
    'src/*.js', 'src/*/*.js'
  ];

  const globExcludePatterns = [
    'test/**'
  ];

  const res = await flow.collectFlowCoverage(
    'flow', DEFAULT_FLOW_TIMEOUT, '/projectDir',
    globIncludePatterns, globExcludePatterns,
    80, 5, '/tmp/fakeTmpDir', strictCoverage
  );

  expect(typeof res.generatedAt).toBe('string');
  delete res.generatedAt;

  const resFiles = res.files;
  delete res.files;

  const filteredFiles = allFiles.filter(
    file => !minimatch(file, globExcludePatterns[0])
  ).sort();

  expect(res).toEqual({
    flowStatus: {...fakeFlowStatus},
    flowAnnotations: {
      passed: false,
      flowFiles: filteredFiles.length - 2,
      flowWeakFiles: 1,
      noFlowFiles: 1,
      totalFiles: filteredFiles.length
    },
    globIncludePatterns,
    globExcludePatterns,
    strictCoverage,
    concurrentFiles: 5,
    percent: 50,
    threshold: 80,
    /* eslint-disable camelcase */
    covered_count: 4,
    uncovered_count: 4,
    /* eslint-enable camelcase */
    ...expectedResults
  });

  expect(Object.keys(resFiles).sort()).toEqual(filteredFiles);

  for (const filename of filteredFiles) {
    expect(resFiles[filename].expressions.uncovered_locs).toEqual([{
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
    }]);
    delete resFiles[filename].expressions.uncovered_locs;

    // Detect if the single file coverage is expected to be 0.
    const forceNoCoverage = !(!strictCoverage || ['flow', 'flow strict'].indexOf(expectedFlowAnnotations[filename]) !== -1);

    expect(resFiles[filename]).toEqual({
      percent: forceNoCoverage ? 0 : 50,
      filename,
      annotation: expectedFlowAnnotations[filename],
      expressions: {
        /* eslint-disable camelcase */
        covered_count: forceNoCoverage ? 0 : 1,
        uncovered_count: forceNoCoverage ? 2 : 1
        /* eslint-enable camelcase */
      }
    });
  }

  expect(mockWriteFile.mock.calls.length).toBe(0);
  expect(mockExec.mock.calls.length).toBe(5);
  expect(mockGlob.mock.calls.length).toBe(2);
};

it('collectFlowCoverage', async () => {
  await testCollectFlowCoverage();
});

it('collectFlowCoverage - strictCoverage mode', async () => {
  await testCollectFlowCoverage({strictCoverage: true, expectedResults: {
    percent: 25,
    /* eslint-disable camelcase */
    covered_count: 2,
    uncovered_count: 6
    /* eslint-enable camelcase */
  }});
});

it('getCoveredPercent', () => {
  const flow = require(LIB_FLOW);

  /* eslint-disable camelcase */
  expect(flow.getCoveredPercent({covered_count: 0, uncovered_count: 0})).toBe(100);
  expect(flow.getCoveredPercent({covered_count: 0, uncovered_count: 10})).toBe(0);
  expect(flow.getCoveredPercent({covered_count: 3, uncovered_count: 11})).toBe(21);
  /* eslint-enable camelcase */
});
