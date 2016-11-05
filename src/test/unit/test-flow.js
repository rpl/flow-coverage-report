'use babel';

import minimatch from 'minimatch';
import mockRequire from 'mock-require';
import sinon from 'sinon';

import {test} from 'ava';

import {DEFAULT_FLOW_TIMEOUT} from '../../lib/index';

const LIB_FLOW = '../../lib/flow';
const LIB_PROMISIFIED = '../../lib/promisified';
const NPM_TEMP = 'temp';

const tmpDirPath = '/tmp/fake-tmp-path';
const tmpFilePath = `${tmpDirPath}/fake-tmp-file.json`;

test.afterEach(() => {
  mockRequire.stopAll();
});

test('checkFlowStatus does not catch arbitrary errors', async function (t) {
  const exec = sinon.stub();
  const writeFile = sinon.stub();
  const tempPath = sinon.stub();

  mockRequire(NPM_TEMP, {path: tempPath});
  mockRequire(LIB_PROMISIFIED, {exec, writeFile});

  tempPath.onFirstCall()
          .returns(tmpFilePath);
  exec.onFirstCall()
      .returns(Promise.resolve({
        err: new Error('Fake flow status error')
      }));

  const flow = mockRequire.reRequire(LIB_FLOW);

  t.is(tempPath.callCount, 0);

  await t.throws(
    flow.checkFlowStatus('flow', '/fake/projectDir/', tmpDirPath),
    'Fake flow status error'
  );

  t.true(exec.calledOnce);
  t.is(exec.firstCall.args[0], `flow status --json`);
  t.deepEqual(exec.firstCall.args[1], {
    cwd: '/fake/projectDir/',
    maxBuffer: Infinity
  });
  t.deepEqual(exec.firstCall.args[2], {dontReject: true});

  // No file should be created if the VERBOSE and
  // DEBUG_DUMP_JSON env var are not set
  t.is(tempPath.callCount, 0);
  t.is(writeFile.callCount, 0);
});

test('checkFlowStatus resolves to flow types errors in json format',
  async function (t) {
    const exec = sinon.stub();
    const writeFile = sinon.stub();
    const tempPath = sinon.stub();

    mockRequire(NPM_TEMP, {path: tempPath});
    mockRequire(LIB_PROMISIFIED, {exec, writeFile});

    const fakeJSONStatusReply = {
      passed: false,
      flowVersion: '0.30.0',
      errors: []
    };

    tempPath.onCall().returns(tmpFilePath);
    exec.onFirstCall().returns(Promise.resolve({
      err: {code: 2},
      stdout: JSON.stringify(fakeJSONStatusReply)
    }));
    exec.onSecondCall().returns(Promise.resolve({err: {code: 2}, stdout: ''}));

    const flow = mockRequire.reRequire(LIB_FLOW);

    const res = await flow.checkFlowStatus('flow', '/fake/projectDir/', tmpDirPath);

    t.deepEqual(res, fakeJSONStatusReply);

    await t.throws(
      flow.checkFlowStatus('flow', '/fake/projectDir/', tmpDirPath),
      /Parsing error on Flow status JSON result: SyntaxError: Unexpected end/
    );
  }
);

test('checkFlowStatus rejects on invalid flow status json format',
  async function (t) {
    const exec = sinon.stub();
    const tempPath = sinon.stub();

    mockRequire(NPM_TEMP, {path: tempPath});
    mockRequire(LIB_PROMISIFIED, {exec});

    const fakeJSONStatusReply = {
      notFlowStatusJSON: true
    };

    exec.onFirstCall().returns(Promise.resolve({
      stdout: JSON.stringify(fakeJSONStatusReply)
    }));

    const flow = mockRequire.reRequire(LIB_FLOW);
    await t.throws(
      flow.checkFlowStatus('flow', '/fake/projectDir/'),
      'Invalid Flow status JSON format'
    );
  }
);

test('collectFlowCoverageForFile collects flow command exit errors', async function (t) {
  const exec = sinon.stub();
  const tempPath = sinon.stub();
  const writeFile = sinon.stub();

  mockRequire(NPM_TEMP, {path: tempPath});
  mockRequire(LIB_PROMISIFIED, {exec, writeFile});

  const fakeExecError = {
    err: {
      message: 'Fake flow error without stdout',
      code: 2
    }
  };

  exec.onFirstCall().returns(Promise.resolve(fakeExecError));

  const flow = mockRequire.reRequire(LIB_FLOW);
  const filename = 'src/fakeFilename.js';

  const collectData = await flow.collectFlowCoverageForFile(
      'flow', '/fake/projectDir/', filename, tmpDirPath
    );

  // Expect a flow coverage exception in the collected data.
  t.true(collectData.isError);
  t.is(collectData.flowCoverageException, fakeExecError.err.message);

  // Expect empty flow coverage data when a coverage exception has been collected.
  t.deepEqual(collectData.expressions, {
    /* eslint-disable camelcase */
    covered_count: 0,
    uncovered_count: 0,
    uncovered_locs: []
    /* eslint-enable camelcase */
  });

  t.true(exec.calledOnce);
  t.is(writeFile.callCount, 0);
});

test('collectFlowCoverageForFile collects parsing errors', async function (t) {
  const exec = sinon.stub();
  const tempPath = sinon.stub();
  const writeFile = sinon.stub();

  mockRequire(NPM_TEMP, {path: tempPath});
  mockRequire(LIB_PROMISIFIED, {exec, writeFile});

  exec.onFirstCall().returns(Promise.resolve({
    stdout: '{'
  }));

  const flow = mockRequire.reRequire(LIB_FLOW);
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
  t.true(collectData.isError);
  t.is(collectData.flowCoverageParsingError, expectedParsingError.message);

  // Expect empty flow coverage data when a coverage exception has been collected.
  t.deepEqual(collectData.expressions, {
    /* eslint-disable camelcase */
    covered_count: 0,
    uncovered_count: 0,
    uncovered_locs: []
    /* eslint-enable camelcase */
  });

  t.true(exec.calledOnce);
  t.is(writeFile.callCount, 0);
});

test('collectFlowCoverageForFile collects coverage errors', async function (t) {
  const exec = sinon.stub();
  const tempPath = sinon.stub();
  const writeFile = sinon.stub();

  mockRequire(NPM_TEMP, {path: tempPath});
  mockRequire(LIB_PROMISIFIED, {exec, writeFile});

  exec.onFirstCall().returns(Promise.resolve({
    stderr: '{"error": "Fake flow coverage message"}'
  }));

  const flow = mockRequire.reRequire(LIB_FLOW);
  const filename = 'src/fakeFilename.js';

  const collectData = await flow.collectFlowCoverageForFile(
      'flow', '/fake/projectDir/', filename, tmpDirPath
    );

  // Expect a flow coverage exception in the collected data.
  t.true(collectData.isError);
  t.is(collectData.flowCoverageError, 'Fake flow coverage message');

  // Expect empty flow coverage data when a coverage exception has been collected.
  t.deepEqual(collectData.expressions, {
    /* eslint-disable camelcase */
    covered_count: 0,
    uncovered_count: 0,
    uncovered_locs: []
    /* eslint-enable camelcase */
  });

  t.true(exec.calledOnce);
  t.is(writeFile.callCount, 0);
});

test('collectFlowCoverageForFile resolve coverage data', async function (t) {
  const exec = sinon.stub();
  const writeFile = sinon.stub();
  const tempPath = sinon.stub();

  mockRequire(NPM_TEMP, {path: tempPath});
  mockRequire(LIB_PROMISIFIED, {exec, writeFile});

  const filename = 'src/fakeFilename.js';
  const fakeFlowCoverageData = {
    filename,
    fakeCoverageData: {
      ok: true
    }
  };

  tempPath.onFirstCall().returns(tmpFilePath);
  exec.onFirstCall().returns(Promise.resolve({
    stdout: new Buffer(JSON.stringify(fakeFlowCoverageData))
  }));

  const flow = mockRequire.reRequire(LIB_FLOW);

  const res = await flow.collectFlowCoverageForFile(
    'flow', DEFAULT_FLOW_TIMEOUT, '/fake/projectDir', filename
  );

  t.is(writeFile.callCount, 0);
  t.true(exec.calledOnce);
  t.is(exec.firstCall.args[0], `flow coverage --json ${filename}`);
  t.deepEqual(exec.firstCall.args[1], {
    cwd: '/fake/projectDir', maxBuffer: Infinity, timeout: DEFAULT_FLOW_TIMEOUT
  });
  t.deepEqual(res, fakeFlowCoverageData);
});

test('collectFlowCoverage', async function (t) {
  const exec = sinon.stub();
  const writeFile = sinon.stub();
  const tempPath = sinon.stub();
  const glob = sinon.stub();

  mockRequire(NPM_TEMP, {path: tempPath});
  mockRequire(LIB_PROMISIFIED, {exec, glob, writeFile});

  const fakeFlowStatus = {
    passed: true,
    errors: [],
    flowVersion: '0.30.0'
  };

  const firstGlobResults = ['src/a.js', 'src/b.js', 'test/test-a.js'];
  const secondGlobResults = ['src/d1/c.js', 'src/d1/d.js', 'test/subdir/test-d.js'];

  // Fake reply to flow status command.
  exec.onCall(0).returns(Promise.resolve({
    stdout: JSON.stringify(fakeFlowStatus)
  }));

  // Fake the glob results.
  glob.onCall(0).returns(Promise.resolve(firstGlobResults));
  glob.onCall(1).returns(Promise.resolve(secondGlobResults));

  const allFiles = [].concat(firstGlobResults, secondGlobResults);

  // Fake the flow coverage commands results.
  for (var i = 1; i <= allFiles.length; i++) {
    exec.onCall(i).returns(Promise.resolve({
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

  const flow = mockRequire.reRequire(LIB_FLOW);

  const globIncludePatterns = [
    'src/*.js', 'src/*/*.js'
  ];

  const globExcludePatterns = [
    'test/**'
  ];

  const res = await flow.collectFlowCoverage(
    'flow', DEFAULT_FLOW_TIMEOUT, '/projectDir',
    globIncludePatterns, globExcludePatterns,
    80, 5
  );

  t.is(typeof res.generatedAt, 'string');
  delete res.generatedAt;

  const resFiles = res.files;
  delete res.files;

  t.deepEqual(res, {
    flowStatus: {...fakeFlowStatus},
    globIncludePatterns,
    globExcludePatterns,
    concurrentFiles: 5,
    percent: 50,
    threshold: 80,
    /* eslint-disable camelcase */
    covered_count: 4,
    uncovered_count: 4
    /* eslint-enable camelcase */
  });

  const filteredFiles = allFiles.filter(
    file => !minimatch(file, globExcludePatterns[0])
  ).sort();

  t.deepEqual(Object.keys(resFiles).sort(), filteredFiles);

  for (const filename of filteredFiles) {
    t.deepEqual(resFiles[filename].expressions.uncovered_locs, [{
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
    t.deepEqual(resFiles[filename], {
      percent: 50,
      filename,
      expressions: {
        /* eslint-disable camelcase */
        covered_count: 1,
        uncovered_count: 1
        /* eslint-enable camelcase */
      }
    });
  }

  t.is(writeFile.callCount, 0);
  t.is(exec.callCount, 5);
  t.is(glob.callCount, 2);
});

test('getCoveredPercent', function (t) {
  const flow = mockRequire.reRequire(LIB_FLOW);

  /* eslint-disable camelcase */
  t.is(flow.getCoveredPercent({covered_count: 0, uncovered_count: 0}), 100);
  t.is(flow.getCoveredPercent({covered_count: 0, uncovered_count: 10}), 0);
  t.is(flow.getCoveredPercent({covered_count: 3, uncovered_count: 11}), 21);
  /* eslint-enable camelcase */
});
