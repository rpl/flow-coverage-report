# flow-coverage-report

[![Build Status](https://travis-ci.org/rpl/flow-coverage-report.svg?branch=master)](https://travis-ci.org/rpl/flow-coverage-report)

**flow-coverage-report** is a node command line tool to help projects which are
using [flow types][flow] in their JavaScript code to keep track and visualize
the coverage of the flow types checks.

![Screenshot flow coverage report summary][screenshot-summary]

![Screenshot flow coverage report sourcefile][screenshot-sourcefile]


## How to generate flow coverage reports for your project

Install the command line tool (globally or as a dev dependency of your project)

```
$ npm install -g flow-coverage-report

or

$ npm install --save-dev flow-coverage-report
```

Run the flow reporter

```
flow-coverage-report -i 'src/**/*.js' -i 'src/**/*.jsx' -t html -t json -t text
```

If the **flow** executable is not in your PATH, you can specified it using the
`-f` option:

```
flow-coverage-report -f /path/to/flow ...
```

## Background

As a gradual typing system for JavaScript, flow will help you to statically checks
parts of your JavaScript code by:

- supporting syntaxes to annotate your code with types;
- supporting syntaxes to declare, export and import new types implicitly and explicitly;
- inferencing the type of the identifier used in your code as much as possible;  

Unfortunately, even with a good amount of powerful inferencing strategies,
sometimes flow is not able to inference the types in some chunks of our code.

That's usually the source of a "Meh!" moment, and we blame flow for not being able to catch
some issue that we thought it would catch statically.

Fortunately, flow has a **coverage** command which can give us a quantitative
info of the flow types coverage, and optionally a color-based visualization of the
parts of the source file that are not covered, for a single file.

How to generate this quantitative info and this very useful visualization of the
uncoverage parts of our sources for our entire project?

You have just found it ;-)

[flow]: https://flowtypes.org
[screenshot-summary]: https://raw.githubusercontent.com/rpl/flow-coverage-report/master/doc/screenshot-summary.png
[screenshot-sourcefile]: https://raw.githubusercontent.com/rpl/flow-coverage-report/master/doc/screenshot-sourcefile.png
