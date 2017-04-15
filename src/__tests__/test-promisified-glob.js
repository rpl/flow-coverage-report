'use babel';

const LIB_PROMISIFIED = '../lib/promisified';

beforeEach(() => {
  jest.resetModules();
});

it('promisified glob', async () => {
  const mockGlob = jest.fn();
  jest.mock('glob', () => mockGlob);

  const mockGlobResult = [
    'dir1/file1.txt',
    'dir1/dir2/file2.txt'
  ];

  mockGlob.mockImplementationOnce((...args) => {
    args[2](new Error('Fake glob error'));
  });
  mockGlob.mockImplementationOnce((...args) => {
    args[2](null, mockGlobResult);
  });

  const promisified = require(LIB_PROMISIFIED);

  let exception;
  try {
    await promisified.glob('**/*.js', {});
  } catch (err) {
    exception = err;
  }
  expect(exception && exception.message).toMatch(
    'Fake glob error'
  );
  expect(mockGlob.mock.calls.length).toBe(1);

  await expect(async () => {
    const files = await promisified.glob('**/*.txt', {fakeOption: true});
    expect(Array.isArray(files)).toBe(true);
    expect(files).toEqual(mockGlobResult);
  }).not.toThrow();

  expect(mockGlob.mock.calls.length).toBe(2);
  expect(mockGlob.mock.calls[1][0]).toBe('**/*.txt');
  expect(mockGlob.mock.calls[1][1]).toEqual({fakeOption: true});
});
