'use babel';

const LIB_PROMISIFIED = '../lib/promisified';

beforeEach(() => {
  jest.resetModules();
});

it('promised readFile', async () => {
  const mockReadFile = jest.fn();
  jest.mock('fs', () => ({
    readFile: mockReadFile
  }));

  const fakeFileContent = 'file content';
  mockReadFile.mockImplementationOnce((...args) => {
    args[1](null, Buffer.from(fakeFileContent));
  });
  mockReadFile.mockImplementationOnce((...args) => {
    args[1](new Error('Fake readFile error'));
  });

  const promisified = require(LIB_PROMISIFIED);

  await expect(async () => {
    const fileContent = await promisified.readFile('/my/fake/dir');
    expect(fileContent instanceof Buffer).toBe(true);
    expect(String(fileContent)).toBe(fakeFileContent);
  }).not.toThrow();

  expect(mockReadFile.mock.calls.length).toBe(1);

  let exception;

  try {
    await promisified.readFile('/my/fake/file');
  } catch (error) {
    exception = error;
  }

  expect(exception && exception.message).toMatch(
    'Fake readFile error'
  );

  expect(mockReadFile.mock.calls.length).toBe(2);
});

it('promised writeFile', async () => {
  const mockWriteFile = jest.fn();
  jest.mock('fs', () => ({
    writeFile: mockWriteFile
  }));

  mockWriteFile.mockImplementationOnce((...args) => {
    args[2]();
  });

  const promisified = require(LIB_PROMISIFIED);

  let exception;

  try {
    await promisified.writeFile('/my/fake/dir');
  } catch (error) {
    exception = error;
  }

  expect(exception).toBe(undefined);
  expect(mockWriteFile.mock.calls.length).toBe(1);

  mockWriteFile.mockImplementationOnce((...args) => {
    args[2](new Error('Fake writeFile error'));
  });

  exception = undefined;
  try {
    await promisified.writeFile('/my/fake/file', 'Fake data');
  } catch (error) {
    exception = error;
  }

  expect(`${exception}`).toMatch(/Fake writeFile error/);

  expect(mockWriteFile.mock.calls.length).toBe(2);
});
