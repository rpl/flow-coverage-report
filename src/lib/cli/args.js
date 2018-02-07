import path from 'path';
import yargs from 'yargs';

import npm from '../../../package';

import {defaultConfig} from './config';

const examples = appName => `
Examples:

  ${appName} -i "src/**/*.js"
  ${appName} -p /path/to/project -i "src/**/*.js" -x "src/test/**/*.js"
  ${appName} -t html -p /path/to/project -i "src/**/*.js"
  ${appName} -t html -t json -t text /path/to/project -i "src/**/*.js"
  ${appName} -i "src/**/*.js" -c 5

For more informations:

  https://github.com/rpl/flow-coverage-report
`;

export default function processArgv(argv) {
  const appName = path.basename(argv[1]).split('.')[0];

  return yargs(argv).usage('Usage: $0 COMMAND PROJECTDIR [...globs]')
    .help('h')
    .alias('h', 'help')
    .version(() => npm.name + ' ' + npm.version)
    .alias('v', 'version')
    // -f flow-command-path
    .option('flow-command-path', {
      alias: 'f',
      type: 'string',
      coerce: value => value.slice(0, 2) === './' ? path.resolve(value) : value,
      describe: `path to the flow executable (defaults to "${defaultConfig.flowCommandPath}")`
    })
    // --type text
    .option('type', {
      alias: 't',
      type: 'choice',
      choices: ['html', 'json', 'text'],
      describe: `format of the generated reports (defaults to "${defaultConfig.type.join(', ')}")`
    })
    // --project-dir "/project/dir/path"
    .option('project-dir', {
      alias: 'p',
      type: 'string',
      describe: `select the project dir path (defaults to "${defaultConfig.projectDir}")`
    })
    // --include-glob "src/**/*.js"
    .option('include-glob', {
      alias: 'i',
      type: 'string',
      describe: 'include the files selected by the specified glob'
    })
    .option('exclude-glob', {
      alias: 'x',
      type: 'string',
      describe: 'exclude the files selected by the specified glob ' +
        `(defaults to "${defaultConfig.excludeGlob}")`
    })
    .options('threshold', {
      type: 'number',
      describe: `the minimum coverage percent requested (defaults to ${defaultConfig.threshold})`
    })
    // --output-dir "/var/public_html/flow-coverage"
    .option('output-dir', {
      alias: 'o',
      type: 'string',
      describe: `output html or json files to this folder relative to project-dir (defaults to "${defaultConfig.outputDir}")`
    })
    // --concurrent-files 5
    .option('concurrent-files', {
      alias: 'c',
      type: 'number',
      describe: `the maximum number of files concurrently submitted to flow (defaults to ${defaultConfig.concurrentFiles})`
    })
    // --no-coverage-unflowed-files
    .option('unflowed-files-no-coverage', {
      type: 'boolean',
      describe: "expressions in unflowed files are counted towards total expressions but none are considered flow typed. default behavior is for flow to best-guess unflowed files.",
    })
    // --no-config
    .option('no-config', {
      type: 'boolean',
      describe: 'do not load any config file from the project dir'
    })
    .option('config', {
      type: 'string',
      describe: 'file path of the config file to load'
    })
    .check(argv => {
      if (argv._.length > 2) {
        throw new Error('ERROR: The include glob needs to be quoted.');
      }

      return true;
    })
    .epilogue(examples(appName))
    .argv;
}
