'use strict';

// @flow

import {exec} from 'child_process';
import fs from 'fs';
import glob from 'glob';
import mkdirp from 'mkdirp';
import temp from 'temp';

// Automatically cleanup temp file on process.exit
temp.track();

export type ExecResult = {err?: Error, stdout?: string|Buffer, stderr?: string|Buffer};
export type ExecOptions = child_process$execOpts; // eslint-disable-line camelcase
export type ExecExtras = {dontReject?: boolean};

exports.exec = function (
  command: string, options: ExecOptions,
  extra: ?ExecExtras
): Promise<ExecResult> {
  return new Promise((resolve, reject) => {
    exec(command, options, (err, stdout, stderr) => {
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
};

exports.mkdirp = function (path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    mkdirp(path, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

exports.readFile = function (path: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, buff) => {
      if (err) {
        reject(err);
      } else {
        resolve(buff);
      }
    });
  });
};

exports.writeFile = function (path: string, data: string|Buffer): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

export type GlobOptions = {
  cwd?: string,
  root?: string,
};

export type GlobFilelist = Array<string>;

exports.glob = function (pattern: string, options: GlobOptions): Promise<GlobFilelist> {
  return new Promise((resolve, reject) => {
    glob(pattern, options, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
};

exports.withTmpDir = function (tempFileId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    temp.mkdir(tempFileId, (err, dirPath) => {
      if (err) {
        reject(err);
      } else {
        resolve(dirPath);
      }
    });
  });
};
