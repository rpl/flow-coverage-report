'use babel';

import mockRequire from 'mock-require';
import sinon from 'sinon';

import {test} from 'ava';

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
  const readFile = sinon.stub();
  const tempPath = sinon.stub();

  mockRequire(NPM_TEMP, {path: tempPath});
  mockRequire(LIB_PROMISIFIED, {exec, readFile});

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
  t.is(exec.firstCall.args[0], `flow status --json > ${tmpFilePath}`);
  t.deepEqual(exec.firstCall.args[1], {cwd: '/fake/projectDir/'});
  t.deepEqual(exec.firstCall.args[2], {dontReject: true});

  t.is(tempPath.callCount, 1);
  t.deepEqual(tempPath.firstCall.args[0], {suffix: '.json', dir: tmpDirPath});
});

test('checkFlowStatus resolves to flow types errors in json format',
  async function (t) {
    const exec = sinon.stub();
    const readFile = sinon.stub();
    const tempPath = sinon.stub();

    mockRequire(NPM_TEMP, {path: tempPath});
    mockRequire(LIB_PROMISIFIED, {exec, readFile});

    const fakeJSONStatusReply = {
      passed: false,
      flowVersion: '0.30.0',
      errors: []
    };

    tempPath.onCall().returns(tmpFilePath);
    exec.onFirstCall().returns(Promise.resolve({err: {code: 2}}));
    exec.onSecondCall().returns(Promise.resolve({err: {code: 2}}));
    readFile.onFirstCall().returns(Promise.resolve(JSON.stringify(fakeJSONStatusReply)));
    readFile.onSecondCall().returns(Promise.resolve('')); // empty flow output

    const flow = mockRequire.reRequire(LIB_FLOW);

    const res = await flow.checkFlowStatus('flow', '/fake/projectDir/', tmpDirPath);

    t.deepEqual(res, fakeJSONStatusReply);

    await t.throws(
      flow.checkFlowStatus('flow', '/fake/projectDir/', tmpDirPath),
      'Invalid Flow status JSON format'
    );
  }
);

test('checkFlowStatus rejects on invalid flow status json format',
  async function (t) {
    const exec = sinon.stub();
    const readFile = sinon.stub();
    const tempPath = sinon.stub();

    mockRequire(NPM_TEMP, {path: tempPath});
    mockRequire(LIB_PROMISIFIED, {exec, readFile});

    const fakeJSONStatusReply = {
      notFlowStatusJSON: true
    };

    exec.onFirstCall().returns(Promise.resolve({}));
    readFile.onFirstCall().returns(Promise.resolve(JSON.stringify(fakeJSONStatusReply)));

    const flow = mockRequire.reRequire(LIB_FLOW);
    await t.throws(
      flow.checkFlowStatus('flow', '/fake/projectDir/'),
      'Invalid Flow status JSON format'
    );
  }
);

test('collectFlowCoverageForFile collects unexpected errors', async function (t) {
  const exec = sinon.stub();
  const readFile = sinon.stub();
  const tempPath = sinon.stub();

  mockRequire(NPM_TEMP, {path: tempPath});
  mockRequire(LIB_PROMISIFIED, {exec, readFile});

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
  t.is(readFile.callCount, 0);
});

test('collectFlowCoverageForFile resolve coverage data', async function (t) {
  const exec = sinon.stub();
  const readFile = sinon.stub();
  const tempPath = sinon.stub();

  mockRequire(NPM_TEMP, {path: tempPath});
  mockRequire(LIB_PROMISIFIED, {exec, readFile});

  const fakeFlowCoverageData = {
    fakeCoverageData: {
      ok: true
    }
  };

  tempPath.onFirstCall().returns(tmpFilePath);
  exec.onFirstCall().returns(Promise.resolve({}));
  readFile.onFirstCall().returns(Promise.resolve(
    new Buffer(JSON.stringify(fakeFlowCoverageData))
  ));

  const flow = mockRequire.reRequire(LIB_FLOW);
  const filename = 'src/fakeFilename.js';

  const res = await flow.collectFlowCoverageForFile(
    'flow', '/fake/projectDir', filename
  );

  t.true(readFile.calledOnce);
  t.is(readFile.firstCall.args[0], tmpFilePath);
  t.true(exec.calledOnce);
  t.is(exec.firstCall.args[0], `flow coverage --json ${filename} > ${tmpFilePath}`);
  t.deepEqual(exec.firstCall.args[1], {cwd: '/fake/projectDir'});
  t.deepEqual(res, fakeFlowCoverageData);
});

test('collectFlowCoverage', async function (t) {
  const exec = sinon.stub();
  const readFile = sinon.stub();
  const tempPath = sinon.stub();
  const glob = sinon.stub();

  mockRequire(NPM_TEMP, {path: tempPath});
  mockRequire(LIB_PROMISIFIED, {exec, glob, readFile});

  const fakeFlowStatus = {
    passed: true,
    errors: [],
    flowVersion: '0.30.0'
  };

  const firstGlobResults = ['src/a.js', 'src/b.js'];
  const secondGlobResults = ['src/d1/c.js', 'src/d1/d.js'];

  // Fake reply to flow status command.
  exec.onCall(0).returns(Promise.resolve({}));
  readFile.onCall(0).returns(Promise.resolve(
    JSON.stringify(fakeFlowStatus)
  ));

  // Fake the glob results.
  glob.onCall(0).returns(Promise.resolve(firstGlobResults));
  glob.onCall(1).returns(Promise.resolve(secondGlobResults));

  const allFiles = [].concat(firstGlobResults, secondGlobResults);

  // Fake the flow coverage commands results.
  for (var i = 1; i <= allFiles.length; i++) {
    exec.onCall(i).returns(Promise.resolve({}));
    readFile.onCall(i).returns(Promise.resolve(
      JSON.stringify({
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
    ));
  }

  const flow = mockRequire.reRequire(LIB_FLOW);

  const globIncludePatterns = [
    'src/*.js', 'src/*/*.js'
  ];

  const res = await flow.collectFlowCoverage(
    'flow', '/projectDir', globIncludePatterns
  );

  t.is(typeof res.generatedAt, 'string');
  delete res.generatedAt;

  const resFiles = res.files;
  delete res.files;

  t.deepEqual(res, {
    /* eslint-disable camelcase */
    percent: 50,
    threshold: undefined,
    covered_count: 4,
    uncovered_count: 4,
    flowStatus: {...fakeFlowStatus},
    globIncludePatterns
    /* eslint-enable camelcase */
  });

  t.deepEqual(Object.keys(resFiles).sort(), allFiles.sort());

  for (const filename of allFiles) {
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
      expressions: {
        /* eslint-disable camelcase */
        covered_count: 1,
        uncovered_count: 1
        /* eslint-enable camelcase */
      }
    });
  }

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
