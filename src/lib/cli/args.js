import path from 'path';
import yargs from 'yargs';

import npm from '../../../package';

const examples = appName => `
Examples:

  ${appName} report -i "src/**/*.js"
  ${appName} report -p /path/to/project -i "src/**/*.js" -x "src/test/**/*.js"
  ${appName} report -t html -p /path/to/project -i "src/**/*.js"
  ${appName} report -t html -t json -t text /path/to/project -i "src/**/*.js"
  ${appName} report -i "src/**/*.js" -c 5

For more informations:

  https://github.com/rpl/flow-coverage-report
`;

module.exports = {
  processArgv(argv) {
    const appName = path.basename(argv[1]).split('.')[0];
    const toArray = value => Array.isArray(value) ? value : [value];

    return yargs(argv).usage('Usage: $0 COMMAND PROJECTDIR [...globs]')
      .command('report', 'Generate Flow Coverage Report on file selected by the GLOB parameter')
      .help('h')
      .alias('h', 'help')
      .version(() => npm.name + ' ' + npm.version)
      .alias('v', 'version')
      // --type text
      .option('flow-command-path', {
        alias: 'f',
        type: 'string',
        default: 'flow',
        coerce: value => value.slice(0, 2) === './' ? path.resolve(value) : value
      })
      // --type text
      .option('type', {
        alias: 't',
        type: 'choice',
        choices: ['html', 'json', 'text'],
        default: 'text'
        // coerce: toArray
      })
      // --project-dir "/project/dir/path"
      .option('project-dir', {
        alias: 'p',
        type: 'string',
        describe: 'select the project dir path',
        default: process.cwd(),
        coerce: path.resolve
      })
      // --include-glob "src/**/*.js"
      .option('include-glob', {
        alias: 'i',
        type: 'string',
        describe: 'include the files selected by the specified glob',
        default: '**/*.js'
      })
      .option('exclude-glob', {
        alias: 'x',
        type: 'string',
        describe: 'exclude the files selected by the specified glob',
        default: 'node_modules/**'
      })
      .options('threshold', {
        type: 'number',
        describe: 'the minimum coverage percent requested.',
        default: 80
      })
      // --output-dir "/var/public_html/flow-coverage"
      .option('output-dir', {
        alias: 'o',
        type: 'string',
        describe: 'output html or json files to this folder relative to project-dir',
        default: './flow-coverage'
      })
      // --concurrent-files 5
      .option('concurrent-files', {
        alias: 'c',
        type: 'number',
        describe: 'the maximum number of files concurrently submitted to flow',
        default: 1
      })
      .check(argv => {
        argv.includeGlob = toArray(argv.includeGlob);

        function raiseErrorIfArray(value, msg) {
          if (Array.isArray(value)) {
            throw new Error(`ERROR: Only one ${msg} can be specified.`);
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
          raiseErrorIfArray(argv[option], msg);
        }

        const {includeGlob} = argv;

        if (!includeGlob || includeGlob.length === 0) {
          throw new Error('ERROR: No glob has been specified.');
        }

        if (argv._.length > 2) {
          throw new Error('ERROR: The include glob needs to be quoted.');
        }

        for (const glob of includeGlob) {
          if (glob[0] === '!') {
            throw new Error('ERROR: Only include glob syntax are supported.');
          }
        }

        return true;
      })
      .epilogue(examples(appName))
    .argv;
  }
};
