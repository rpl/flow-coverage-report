'use strict';

// @flow

import {exec as nodeExec} from 'child_process';
import fs from 'fs';
import npmGlob from 'glob';
import npmMkdirp from 'mkdirp';
import temp from 'temp';

// Automatically cleanup temp file on process.exit
temp.track();

export type ExecResult = {err?: Error, stdout?: string|Buffer, stderr?: string|Buffer};
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

export function mkdirp(path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    npmMkdirp(path, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
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

export type GlobOptions = {
  cwd?: string,
  root?: string,
};

export type GlobFilelist = Array<string>;

export function glob(pattern: string, options: GlobOptions): Promise<GlobFilelist> {
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

export function withTmpDir(tempFileId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    temp.mkdir(tempFileId, (err, dirPath) => {
      if (err) {
        reject(err);
      } else {
        resolve(dirPath);
      }
    });
  });
}
