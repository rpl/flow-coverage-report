'use strict';

// @flow

import {exec as nodeExec} from 'child_process';
import fs from 'fs';
import npmGlob from 'glob';
import temp from 'temp';

// Automatically cleanup temp file on process.exit
temp.track();

export type ExecError = Error & {
  code: number | string | null,
};
export type ExecResult = {err?: ExecError, stdout?: string|Buffer, stderr?: string|Buffer};
export type ExecOptions = child_process$execOpts; // eslint-disable-line camelcase
export type ExecExtras = {dontReject?: boolean};

export function exec(
  command: string, options: ExecOptions,
  extra: ?ExecExtras
): Promise<ExecResult> {
  return new Promise((resolve, reject) => {
    nodeExec(command, options, (err, stdout, stderr) => {
      if (err) {
        if (extra && extra.dontReject) {
          resolve({err, stdout, stderr});
        } else {
          reject(err);
        }
      } else {
        resolve({stdout, stderr});
      }
    });
  });
}

export function readFile(path: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, buff) => {
      if (err) {
        reject(err);
      } else {
        resolve(buff);
      }
    });
  });
}

export function writeFile(path: string, data: string|Buffer): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export type GlobFilelist = Array<string>;

export function glob(pattern: string, options: *): Promise<GlobFilelist> {
  return new Promise((resolve, reject) => {
    npmGlob(pattern, options, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

// eslint-disable-next-line unicorn/prevent-abbreviations
export function withTmpDir(temporaryFileId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    temp.mkdir(temporaryFileId, (err, dirPath) => {
      if (err) {
        reject(err);
      } else {
        resolve(dirPath);
      }
    });
  });
}
