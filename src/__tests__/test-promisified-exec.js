'use babel';

const LIB_PROMISIFIED = '../lib/promisified';

beforeEach(() => {
  jest.resetModules();
});

test('promisified exec resolved', async () => {
  const mockExec = jest.fn((...args) => {
    args[2](null, Buffer.from('stdout'), Buffer.from('stderr'));
  });

  jest.mock('child_process', () => {
    return {exec: mockExec};
  });

  const promisified = require(LIB_PROMISIFIED);

  const {
    stdout, stderr
  } = await promisified.exec('fake-executable --fake', {cwd: '/fake/dir'});

  expect(mockExec.mock.calls.length).toBe(1);
  expect(mockExec.mock.calls[0][0]).toBe('fake-executable --fake');
  expect(mockExec.mock.calls[0][1]).toMatchObject({cwd: '/fake/dir'});

  expect(stdout instanceof Buffer).toBe(true);
  expect(stderr instanceof Buffer).toBe(true);
  expect(String(stdout)).toBe('stdout');
  expect(String(stderr)).toBe('stderr');
});

test('promisified exec throws', async () => {
  const mockErrorMessage = 'Fake Unknown Error';
  jest.mock('child_process', () => {
    return {
      exec: jest.fn((...args) => {
        args[2](new Error(mockErrorMessage));
      })
    };
  });

  const promisified = require(LIB_PROMISIFIED);

  let exception;
  try {
    await promisified.exec('fake-executable --fake', {cwd: '/fake/dir'});
  } catch (error) {
    exception = error;
  }

  expect({message: exception.message}).toMatchObject({message: mockErrorMessage});
});

test('promisified exec doNotReject', async () => {
  const mockStdout = Buffer.from('stdout');
  const mockStderr = Buffer.from('stderr');
  const mockErrorMessage = 'Fake Unknown Error';

  const mockExec = jest.fn((...args) => {
    args[2](new Error(mockErrorMessage), mockStdout, mockStderr);
  });

  jest.mock('child_process', () => {
    return {exec: mockExec};
  });
  const promisified = require(LIB_PROMISIFIED);

  const {err, stdout, stderr} = await promisified.exec(
    'fake-executable --fake',
    {cwd: '/fake/dir'}, {dontReject: true}
  );

  expect(err && err.message).toBe(mockErrorMessage);
  expect(stdout instanceof Buffer).toBe(true);
  expect(stderr instanceof Buffer).toBe(true);
  expect(String(stdout)).toBe('stdout');
  expect(String(stderr)).toBe('stderr');
});
