'use babel';

import mockRequire from 'mock-require';
import sinon from 'sinon';

import {test} from 'ava';

const LIB_FLOW = '../../lib/flow';
const LIB_PROMISIFIED = '../../lib/promisified';

test.afterEach(() => {
  mockRequire.stopAll();
});

test('checkFlowStatus does not catch arbitrary errors', async function (t) {
  const exec = sinon.stub();
  mockRequire(LIB_PROMISIFIED, {exec});

  exec.onFirstCall()
      .returns(Promise.resolve({
        err: new Error('Fake flow status error')
      }));

  const flow = mockRequire.reRequire(LIB_FLOW);

  await t.throws(
    flow.checkFlowStatus('flow', '/fake/projectDir/'),
    'Fake flow status error'
  );

  t.true(exec.calledOnce);
  t.is(exec.firstCall.args[0], 'flow status --json');
  t.deepEqual(exec.firstCall.args[1], {cwd: '/fake/projectDir/'});
  t.deepEqual(exec.firstCall.args[2], {dontReject: true});
});

test('checkFlowStatus resolves to flow types errors in json format',
  async function (t) {
    const exec = sinon.stub();
    mockRequire(LIB_PROMISIFIED, {exec});

    const fakeJSONStatusReply = {
      passed: false,
      flowVersion: '0.30.0',
      errors: []
    };
    const fakeFlowCheckError = {
      err: {
        code: 2
      },
      stdout: new Buffer(JSON.stringify(fakeJSONStatusReply))
    };

    exec.onFirstCall().returns(Promise.resolve(fakeFlowCheckError));
    exec.onSecondCall().returns(Promise.resolve({
      err: {
        message: 'Fake flow error without stdout',
        code: 2
      }
    }));

    const flow = mockRequire.reRequire(LIB_FLOW);

    const res = await flow.checkFlowStatus('flow', '/fake/projectDir/');

    t.deepEqual(res, fakeJSONStatusReply);

    await t.throws(
      flow.checkFlowStatus('flow', '/fake/projectDir/'),
      'Fake flow error without stdout'
    );
  }
);

test('checkFlowStatus rejects on invalid flow status json format',
  async function (t) {
    const exec = sinon.stub();
    mockRequire(LIB_PROMISIFIED, {exec});

    const fakeJSONStatusReply = {
      notFlowStatusJSON: true
    };
    const fakeFlowStatusResult = {
      stdout: new Buffer(JSON.stringify(fakeJSONStatusReply))
    };

    exec.onFirstCall().returns(Promise.resolve(fakeFlowStatusResult));

    const flow = mockRequire.reRequire(LIB_FLOW);
    await t.throws(
      flow.checkFlowStatus('flow', '/fake/projectDir/'),
      'Invalid Flow status JSON format'
    );
  }
);

test('collectFlowCoverageForFile rejects', async function (t) {
  const exec = sinon.stub();
  mockRequire(LIB_PROMISIFIED, {exec});

  exec.onFirstCall().returns(Promise.resolve({stdout: new Buffer('')}))
      .onSecondCall().returns(Promise.resolve({
        stdout: new Buffer('fake flow output with errors'),
        err: {
          message: 'Fake flow error without stdout',
          code: 2
        }
      }));

  const flow = mockRequire.reRequire(LIB_FLOW);
  const filename = 'src/fakeFilename.js';

  await t.throws(
    flow.collectFlowCoverageForFile(
      'flow', '/fake/projectDir/', filename
    ),
    `Unexpected error collected flow coverage data on '${filename}'`
  );

  t.true(exec.calledOnce);

  await t.throws(
    flow.collectFlowCoverageForFile(
      'flow', '/fake/projectDir/', filename
    ),
    `Unexpected error collected flow coverage data on '${filename}'`
  );

  t.true(exec.calledTwice);
});

test('collectFlowCoverageForFile resolve coverage data', async function (t) {
  const exec = sinon.stub();
  mockRequire(LIB_PROMISIFIED, {exec});

  const fakeFlowCoverageData = {
    fakeCoverageData: {
      ok: true
    }
  };
  exec.onFirstCall().returns(Promise.resolve({
    stdout: new Buffer(JSON.stringify(fakeFlowCoverageData))
  }));

  const flow = mockRequire.reRequire(LIB_FLOW);
  const filename = 'src/fakeFilename.js';

  const res = await flow.collectFlowCoverageForFile(
    'flow', '/fake/projectDir', filename
  );

  t.true(exec.calledOnce);
  t.is(exec.firstCall.args[0], `flow coverage --json ${filename}`);
  t.deepEqual(exec.firstCall.args[1], {cwd: '/fake/projectDir'});
  t.deepEqual(res, fakeFlowCoverageData);
});

test('collectFlowCoverage', async function (t) {
  const exec = sinon.stub();
  const glob = sinon.stub();
  mockRequire(LIB_PROMISIFIED, {exec, glob});

  const fakeFlowStatus = {
    passed: true,
    errors: [],
    flowVersion: '0.30.0'
  };

  const firstGlobResults = ['src/a.js', 'src/b.js'];
  const secondGlobResults = ['src/d1/c.js', 'src/d1/d.js'];
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

  t.deepEqual(Object.keys(resFiles), allFiles);

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
