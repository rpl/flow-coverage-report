'use strict';

// @flow

import type {FlowCoverageSummaryData} from './flow';
import type {FlowCoverageReportOptions} from './index';

var path = require('path');
var react = require('react-dom/server');
var mkdirp = require('./promisified').mkdirp;
var readFile = require('./promisified').readFile;
var writeFile = require('./promisified').writeFile;

var FlowCoverageHTMLReport = require('./components/html-report-page');

var baseSemanticAssets = ['themes', 'default', 'assets'];
var assetsList = [
  'jquery-3.1.0.min.js',
  'semantic.min.js',
  'semantic.min.css',
  'semantic-tablesort.js',
  'index.js',
  'codemirror.js',
  'codemirror.css',
  'codemirror-javascript-mode.js',
  'codemirror-annotatescrollbar-addon.js',
  'codemirror-simplescrollbars-addon.js',
  'codemirror-simplescrollbars-addon.css',
  'flow-highlight-source.js',
  'flow-highlight-source.css',
  'flow-coverage-report.css'
].concat(
[
    ['images', 'flags.png'],
    ['fonts', 'icons.eot'],
    ['fonts', 'icons.otf'],
    ['fonts', 'icons.svg'],
    ['fonts', 'icons.ttf'],
    ['fonts', 'icons.woff'],
    ['fonts', 'icons.woff2']
].map(function (el) {
  return path.join.apply(null, baseSemanticAssets.concat(el));
})
);

function copyAsset(outputDir, assetName) {
  var srcfileReady = readFile(path.join(__dirname, '..', '..', 'assets', assetName));
  var createDestDir = mkdirp(path.join(outputDir, 'assets', path.dirname(assetName)));

  function destFileWritten(data) {
    return writeFile(path.join(outputDir, 'assets', assetName), data);
  }

  return Promise.all([
    srcfileReady, createDestDir
  ]).then(function (res) {
    var srcFileData = res[0];

    return destFileWritten(srcFileData);
  });
}

function copyAssets(outputDir/* : string */) {
  return Promise.all(assetsList.map(copyAsset.bind(null, outputDir)));
}

function renderHTMLReport(opt/* : Object */) {
  if (opt.filename &&
      opt.filename.indexOf('..') >= 0) {
    return Promise.reject(new Error(
      'filename is not relative to the projectDir: ' +
        [opt.projectDir, opt.filename].join(' - ')
    ));
  }

  function relativeToFilename(prefixDir, dest) {
    return path.relative(path.join(prefixDir, path.dirname(opt.filename || '')), dest);
  }

  function prefixAssets(filePath) {
    return path.join('assets', filePath);
  }

  function summaryReportContent() {
    return new Promise(function (resolve) {
      var reportFilePath;
      var reportFileContent;
      var toRelative = relativeToFilename.bind(null, '');

      reportFilePath = path.join(opt.outputDir, 'index.html');

      reportFileContent = '<!DOCTYPE html>\n' +
        // $FLOW_FIXME: incompatible type with React$Element
        react.renderToStaticMarkup(new FlowCoverageHTMLReport({
          htmlTemplateOptions: opt.htmlTemplateOptions,
          reportType: opt.type,
          coverageGeneratedAt: opt.coverageGeneratedAt,
          coverageSummaryData: opt.data,
          assets: {
            css: [
              'semantic.min.css',
              'flow-coverage-report.css'
            ].map(prefixAssets).map(toRelative),
            js: [
              'jquery-3.1.0.min.js',
              'semantic.min.js',
              'semantic-tablesort.js',
              'index.js'
            ].map(prefixAssets).map(toRelative)
          }
        }));

      resolve({
        reportFilePath: reportFilePath,
        reportFileContent: reportFileContent
      });
    });
  }

  function sourceReportContent() {
    return new Promise(function (resolve, reject) {
      var srcPath = path.join(opt.projectDir, opt.filename);
      var dirName = path.dirname(opt.filename);
      var toRelative = relativeToFilename.bind(null, 'sourcefiles');

      return mkdirp(path.join(opt.outputDir, 'sourcefiles', dirName)).then(function () {
        return readFile(srcPath).then(function (buff) {
          var reportFileContent = '<!DOCTYPE html>\n' +
                // $FLOW_FIXME: incompatible type with React$Element
                react.renderToStaticMarkup(new FlowCoverageHTMLReport({
                  htmlTemplateOptions: opt.htmlTemplateOptions,
                  reportType: opt.type,
                  coverageGeneratedAt: opt.coverageGeneratedAt,
                  coverageData: opt.data,
                  fileName: opt.filename,
                  fileContent: buff,
                  summaryRelLink: toRelative('index.html'),
                  assets: {
                    css: [
                      'semantic.min.css',
                      'codemirror.css',
                      'flow-highlight-source.css',
                      'flow-coverage-report.css',
                      'codemirror-simplescrollbars-addon.css'
                    ].map(prefixAssets).map(toRelative),
                    js: [
                      'jquery-3.1.0.min.js',
                      'semantic.min.js',
                      'semantic-tablesort.js',
                      'codemirror.js',
                      'codemirror-javascript-mode.js',
                      'codemirror-annotatescrollbar-addon.js',
                      'codemirror-simplescrollbars-addon.js',
                      'flow-highlight-source.js',
                      'index.js'
                    ].map(prefixAssets).map(toRelative)
                  }
                }));

          var reportFilePath = path.join(opt.outputDir, 'sourcefiles', opt.filename) + '.html';
          resolve({
            reportFilePath: reportFilePath,
            reportFileContent: reportFileContent
          });
        }, reject);
      }, reject);
    });
  }

  var waitForReportContent;

  if (opt.type === 'summary') {
    waitForReportContent = summaryReportContent();
  }

  if (opt.type === 'sourcefile') {
    waitForReportContent = sourceReportContent();
  }

  if (waitForReportContent) {
    return waitForReportContent.then(function (res) {
      var reportFilePath = res.reportFilePath;
      var reportFileContent = res.reportFileContent;

      return mkdirp(path.dirname(reportFilePath)).then(function () {
        return writeFile(reportFilePath, new Buffer(reportFileContent));
      });
    });
  }

  return Promise.reject(new Error('Unknown report type: ' + opt.type));
}

function generateFlowCoverageReportHTML(
  coverageSummaryData: FlowCoverageSummaryData,
  opts: FlowCoverageReportOptions
) {
  var projectDir = opts.projectDir;
  var outputDir = opts.outputDir;
  var coverageGeneratedAt = coverageSummaryData.generatedAt;
  var generateSummary = renderHTMLReport({
    type: 'summary', filename: null,
    htmlTemplateOptions: opts.htmlTemplateOptions,
    coverageGeneratedAt, projectDir, data: coverageSummaryData, outputDir
  });

  if (!outputDir) {
    throw new Error('Unexpected empty outputDir option');
  }

  var waitForCopyAssets = copyAssets(outputDir);
  var generateSourceFiles = Object.keys(coverageSummaryData.files)
        .map(function (filename) {
          var data = coverageSummaryData.files[filename];
          return renderHTMLReport({
            type: 'sourcefile', coverageGeneratedAt,
            htmlTemplateOptions: opts.htmlTemplateOptions,
            projectDir, filename, data, outputDir
          });
        });
  return Promise.all(
    [
      waitForCopyAssets,
      generateSummary
    ].concat(generateSourceFiles)
  );
}

module.exports = {
  assetsList: assetsList,
  copyAssets: copyAssets,
  render: renderHTMLReport,
  generate: generateFlowCoverageReportHTML
};
