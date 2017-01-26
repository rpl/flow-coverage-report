import path from 'path';
import fs from 'fs';
import parseJSON from 'parse-json';
import stripJSONComments from 'strip-json-comments';

export class UsageError {
  constructor(message) {
    this.message = message;
  }
}

const toArray = value => Array.isArray(value) ? value : [value];

export const defaultConfig = {
  type: ['text'],
  flowCommandPath: 'flow',
  projectDir: path.resolve(process.cwd()),
  excludeGlob: ['node_modules/**'],
  threshold: 80,
  outputDir: './flow-coverage',
  concurrentFiles: 1,
  noConfig: false,
  htmlTemplateOptions: {
    autoHeightSource: true,
    showMeterBar: false
  }
};

const getProjectDir = config => ({...defaultConfig, ...config}).projectDir;

/**
 * try to load configuration parameters from the project dir if the following order:
 * - do not load any config if --no-config option is specified
 * - from the package.json "flow-coverage-report" property, if any
 * - from a .flow-coverage-report.json, if any
 * - from the --config cli parameter, if any
 */
export function loadConfig(args) {
  // remove any undefined property from the yargs object.
  for (let key of Object.keys(args)) {
    if (typeof args[key] === 'undefined') {
      delete args[key];
    }
  }

  if (args.noConfig) {
    return {
      ...defaultConfig,
      ...args
    };
  }

  if (args.includeGlob) {
    args.includeGlob = toArray(args.includeGlob);
  }

  if (args.config) {
    let filePath = path.resolve(args.config);
    let fileRawData = fs.readFileSync(filePath);
    let fileConfigData = parseJSON(stripJSONComments(`${fileRawData}`));

    if (process.env.VERBOSE) {
      console.log('Loaded config from file', filePath, fileConfigData);
    }

    return {
      ...defaultConfig,
      ...fileConfigData,
      ...args
    };
  }

  let packageJSONPath;

  try {
    packageJSONPath = path.resolve(path.join(getProjectDir(args), 'package.json'));
    let pkg = require(packageJSONPath);
    if (pkg['flow-coverage-report']) {
      if (process.env.VERBOSE) {
        console.log('Loaded config from package.json', pkg['flow-coverage-report']);
      }

      return {
        ...defaultConfig,
        ...pkg['flow-coverage-report'],
        ...args
      };
    }
  } catch (err) {
    if (process.env.VERBOSE) {
      console.error('Unable to load config from project package.json', packageJSONPath, err);
    }
  }

  let projectConfigPath;

  try {
    projectConfigPath = path.resolve(path.join(getProjectDir(args), '.flow-coverage-report.json'));
    let projectConfigRaw = fs.readFileSync(projectConfigPath);
    let projectConfigData = parseJSON(stripJSONComments(`${projectConfigRaw}`));

    if (process.env.VERBOSE) {
      console.log('Loaded config from project dir', projectConfigPath, projectConfigData);
    }

    return {
      ...defaultConfig,
      ...projectConfigData,
      ...args
    };
  } catch (err) {
    if (process.env.VERBOSE) {
      console.error('Unable to load config from file', projectConfigPath, err);
    }
  }

  return {
    ...defaultConfig,
    ...args
  };
}

/**
 * Validate the arguments collected from the command line and config files and
 * ensure that it is a valid FlowCoverageReportOptions object (as described by its
 * flow type declaration in the "src/lib/index.js module")
 */

export function validateConfig(args) {
  function raiseErrorIfArray(value, msg) {
    if (Array.isArray(value)) {
      throw new UsageError(`ERROR: Only one ${msg} can be specified.`);
    }
  }

  const preventDuplicatedOptions = {
    projectDir: 'project dir',
    outputDir: 'output dir',
    threshold: 'threshold',
    flowCommandPath: 'flow command',
    concurrentFiles: '--concurrent-files option'
  };

  for (const option of Object.keys(preventDuplicatedOptions)) {
    const msg = preventDuplicatedOptions[option];
    raiseErrorIfArray(args[option], msg);
  }

  const {includeGlob} = args;
  if (!includeGlob || includeGlob.length === 0 || !includeGlob[0]) {
    throw new UsageError('ERROR: No glob has been specified.');
  }

  for (const glob of includeGlob) {
    if (glob[0] === '!') {
      throw new UsageError('ERROR: Only include glob syntax are supported.');
    }
  }

  return args;
}
