'use babel';

const LIB_PROMISIFIED = '../lib/promisified';

beforeEach(() => {
  jest.resetModules();
});

it('promised mkdirp', async () => {
  const mockMkdirpStub = jest.fn();
  jest.mock('mkdirp', () => mockMkdirpStub);

  mockMkdirpStub.mockImplementationOnce((...args) => {
    args[1]();
  });
  mockMkdirpStub.mockImplementationOnce((...args) => {
    args[1](new Error('Fake mkdir error'));
  });

  const promisified = require(LIB_PROMISIFIED);

  let noException;

  try {
    await promisified.mkdirp('/my/fake/dir');
  } catch (err) {
    noException = err;
  }
  expect(noException).toBe(undefined);

  expect(mockMkdirpStub.mock.calls.length).toBe(1);

  let exception;

  try {
    await promisified.mkdirp('/my/fake/dir');
  } catch (err) {
    exception = err;
  }
  expect(exception && exception.message).toMatch(
    'Fake mkdir error'
  );

  expect(mockMkdirpStub.mock.calls.length).toBe(2);
});
