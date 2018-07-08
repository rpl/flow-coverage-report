// @flow
import path from 'path';
import fs from 'fs';
import parseJSON from 'parse-json';
import stripJSONComments from 'strip-json-comments';

export type HTMLTemplateOptions = {|
  autoHeightSource: bool,
  showMeterBar: bool
|}

export type ReportType = 'json' | 'text' | 'badge' |'html';

export type ConfigParams = {|
  reportTypes?: Array<ReportType>,
  flowCommandPath: string,
  flowCommandTimeout: number,
  projectDir: string,
  globExcludePatterns?: Array<string>,
  globIncludePatterns: Array<string>,
  threshold: number,
  percentDecimals: number,
  outputDir: string,
  concurrentFiles?: number,
  strictCoverage: bool,
  excludeNonFlow: bool,
  noConfig: bool,
  htmlTemplateOptions?: HTMLTemplateOptions,

  // Legacy params.
  includeGlob?: ?Array<string>,
  excludeGlob?: ?Array<string>,
  type?: ?Array<ReportType>,
|}

export type DefaultConfigParams = {
  ...ConfigParams,
  reportTypes: Array<ReportType>,
  concurrentFiles: number,
}

export class UsageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UsageError';
  }
}

const toArray = (value: any): Array<any> => Array.isArray(value) ? value : [value];

// Default timeout for flow coverage commands.
export const DEFAULT_FLOW_TIMEOUT = 15 * 1000;

export const defaultConfig: DefaultConfigParams = {
  reportTypes: ['text'],
  flowCommandPath: 'flow',
  flowCommandTimeout: DEFAULT_FLOW_TIMEOUT,
  projectDir: path.resolve(process.cwd()),
  globExcludePatterns: ['node_modules/**'],
  globIncludePatterns: [],
  threshold: 80,
  percentDecimals: 0,
  outputDir: './flow-coverage',
  concurrentFiles: 1,
  strictCoverage: false,
  excludeNonFlow: false,
  noConfig: false,
  htmlTemplateOptions: {
    autoHeightSource: true,
    showMeterBar: false
  }
};

const getProjectDir = (config: Object): string => {
  const {projectDir} = ({...defaultConfig, ...config});

  if (!projectDir) {
    throw new UsageError('projectDir option is mandatory');
  }

  if (typeof projectDir !== 'string') {
    throw new UsageError('Unexpected non-string projectDir option');
  }

  return projectDir;
};

/**
 * Normalize config properties to match the property name used internally
 * when it has multiple aliases.
 *
 * @param {object} config
 */
function normalizedConfig(config: ConfigParams): ConfigParams {
  if (typeof config.includeGlob !== 'undefined') {
    console.warn('WARN: "includeGlob" config file property has been renamed to "globIncludePatterns"');
    config.globIncludePatterns = toArray(config.includeGlob);
  }

  if (typeof config.excludeGlob !== 'undefined') {
    console.warn('WARN: "excludeGlob" config file property has been renamed to "globExcludePatterns"');
    config.globExcludePatterns = toArray(config.excludeGlob);
  }

  if (typeof config.type !== 'undefined') {
    console.warn('WARN: "type" config file property has been renamed to "reportTypes"');
    config.reportTypes = toArray(config.type);
  }

  return config;
}

/**
 * Try to load configuration parameters from the project dir if the following order:
 * - do not load any config if --no-config option is specified
 * - from the package.json "flow-coverage-report" property, if any
 * - from a .flow-coverage-report.json, if any
 * - from the --config cli parameter, if any
 */
export function loadConfig(args: Object): Object {
  // Remove any undefined property from the yargs object.
  for (const key of Object.keys(args)) {
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

  if (args.globIncludePatterns) {
    args.globIncludePatterns = toArray(args.globIncludePatterns);
  }

  if (args.config) {
    const filePath = path.resolve(args.config);
    const fileRawData = fs.readFileSync(filePath);
    const fileConfigData = parseJSON(stripJSONComments(String(fileRawData)));

    if (process.env.VERBOSE) {
      console.log('Loaded config from file', filePath, fileConfigData);
    }

    return {
      ...defaultConfig,
      ...normalizedConfig(fileConfigData),
      ...args
    };
  }

  let packageJSONPath;

  try {
    packageJSONPath = path.resolve(path.join(getProjectDir(args), 'package.json'));
    // $FlowIgnoreMe: the following dynamic require loads only the package.json file.
    const pkg = require(packageJSONPath); // eslint-disable-line import/no-dynamic-require
    if (pkg['flow-coverage-report']) {
      if (process.env.VERBOSE) {
        console.log('Loaded config from package.json', pkg['flow-coverage-report']);
      }

      return {
        ...defaultConfig,
        ...normalizedConfig(pkg['flow-coverage-report']),
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
    const projectConfigRaw = fs.readFileSync(projectConfigPath);
    const projectConfigData = parseJSON(stripJSONComments(String(projectConfigRaw)));

    if (process.env.VERBOSE) {
      console.log('Loaded config from project dir', projectConfigPath, projectConfigData);
    }

    return {
      ...defaultConfig,
      ...normalizedConfig(projectConfigData),
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

export function validateConfig(args: Object): Object {
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

  const {globIncludePatterns} = args;
  if (!globIncludePatterns || globIncludePatterns.length === 0 ||
      !globIncludePatterns[0]) {
    throw new UsageError('ERROR: No glob has been specified.');
  }

  for (const glob of globIncludePatterns) {
    if (glob[0] === '!') {
      throw new UsageError('ERROR: Only include glob syntax are supported.');
    }
  }

  return args;
}
