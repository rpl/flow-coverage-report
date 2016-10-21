'use strict';

// @flow

import {spawn} from 'child_process';
import fs from 'fs';
import glob from 'glob';
import mkdirp from 'mkdirp';

export type ExecResult = {err?: Error, stdout?: Buffer, stderr?: Buffer};
export type ExecOptions = child_process$spawnOpts; // eslint-disable-line camelcase
export type ExecExtras = {dontReject?: boolean};

exports.spawn = function (
  command: string,
  args: Array<string>,
  options: ExecOptions,
  extra: ?ExecExtras
): Promise<ExecResult> {
  return new Promise((resolve, reject) => {
    let stdout = [];
    let stderr = [];

    const child = spawn(command, args, options);
    child.stdout.on('data', data => {
      stdout.push(data);
    });
    child.stderr.on('data', data => {
      stderr.push(data);
    });
    child.on('close', err => {
      if (!err) {
        resolve({stdout: Buffer.concat(stdout), stderr: Buffer.concat(stderr)});
      } else if (extra && extra.dontReject) {
        resolve({err, stdout: Buffer.concat(stdout), stderr: Buffer.concat(stderr)});
      } else {
        reject(err);
      }
    });
    child.on('error', err => {
      if (extra && extra.dontReject) {
        resolve({err, stdout: Buffer.concat(stdout), stderr: Buffer.concat(stderr)});
      } else {
        reject(err);
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
