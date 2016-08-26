import path from 'path';
import yargs from 'yargs';

import npm from '../../../package';

const examples = appName => `
Examples:

  ${appName} report -i "src/**/*.js"
  ${appName} report -p /path/to/project -i "src/**/*.js"
  ${appName} report -t html -p /path/to/project -i "src/**/*.js"
  ${appName} report -t html -t json -t text /path/to/project -i "src/**/*.js"

For more informations:

  https://github/rpl/flow-coverage-report
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
      .options('threshold', {
        type: 'number',
        describe: 'the minimum coverage percent requested.',
        default: 80
      })
      .check(argv => {
        argv.includeGlob = toArray(argv.includeGlob);

        const {projectDir} = argv;

        if (!projectDir) {
          throw new Error('ERROR: No project dir has been specified.');
        }

        if (Array.isArray(projectDir)) {
          throw new Error('ERROR: Only one project dir can be specified.');
        }

        const {flowCommandPath} = argv;

        if (!flowCommandPath) {
          throw new Error('ERROR: No flow command path has been specified.');
        }

        if (Array.isArray(flowCommandPath)) {
          throw new Error('ERROR: Only one flow command path can be specified.');
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
