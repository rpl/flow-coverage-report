'use strict';

// @flow

import path from 'path';
import React from 'react';
import react from 'react-dom/server';

import {mkdirp, readFile, writeFile} from './promisified';
import {HTMLReportSummaryPage, HTMLReportSourceFilePage} from './components/html-report-page'; // eslint-disable-line import/no-unresolved

import type {FlowCoverageSummaryData} from './flow';
import type {FlowCoverageReportOptions} from './index';

const baseSemanticAssets = ['themes', 'default', 'assets'];
const assetsList = [
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
].concat([
  ['images', 'flags.png'],
  ['fonts', 'icons.eot'],
  ['fonts', 'icons.otf'],
  ['fonts', 'icons.svg'],
  ['fonts', 'icons.ttf'],
  ['fonts', 'icons.woff'],
  ['fonts', 'icons.woff2']
].map(el => {
  return path.join.apply(null, baseSemanticAssets.concat(el));
}));

function copyAsset(outputDir, assetName) {
  const srcfileReady = readFile(path.join(__dirname, '..', '..', 'assets', assetName));
  const createDestDir = mkdirp(path.join(outputDir, 'assets', path.dirname(assetName)));

  function destFileWritten(data) {
    return writeFile(path.join(outputDir, 'assets', assetName), data);
  }

  return Promise.all([
    srcfileReady, createDestDir
  ]).then(res => {
    const srcFileData = res[0];

    return destFileWritten(srcFileData);
  });
}

function copyAssets(outputDir/* : string */) {
  return Promise.all(assetsList.map(copyAsset.bind(null, outputDir)));
}

function renderHTMLReport(opt/* : Object */)/* : Promise<*> */ {
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
    return new Promise(resolve => {
      const toRelative = relativeToFilename.bind(null, '');

      const reportFilePath = path.join(opt.outputDir, 'index.html');
      const reportFileContent = '<!DOCTYPE html>\n' +
        react.renderToStaticMarkup(React.createElement(HTMLReportSummaryPage, {
          htmlTemplateOptions: opt.htmlTemplateOptions,
          coverageGeneratedAt: opt.coverageGeneratedAt,
          coverageSummaryData: opt.coverageSummaryData,
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
        reportFilePath,
        reportFileContent
      });
    });
  }

  function sourceReportContent() {
    return new Promise((resolve, reject) => {
      const srcPath = path.join(opt.projectDir, opt.filename);
      const dirName = path.dirname(opt.filename);
      const toRelative = relativeToFilename.bind(null, 'sourcefiles');

      return mkdirp(path.join(opt.outputDir, 'sourcefiles', dirName)).then(() => {
        return readFile(srcPath).then(buff => {
          const reportFileContent = '<!DOCTYPE html>\n' +
                react.renderToStaticMarkup(React.createElement(HTMLReportSourceFilePage, {
                  htmlTemplateOptions: opt.htmlTemplateOptions,
                  coverageGeneratedAt: opt.coverageGeneratedAt,
                  coverageSummaryData: opt.coverageSummaryData,
                  coverageData: opt.coverageData,
                  fileName: opt.filename,
                  fileContent: buff,
                  summaryRelLink: toRelative('index.html'),
                  threshold: opt.threshold,
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

          const reportFilePath = path.join(opt.outputDir, 'sourcefiles', opt.filename) + '.html';
          resolve({
            reportFilePath,
            reportFileContent
          });
        }, reject);
      }, reject);
    });
  }

  let waitForReportContent;

  switch (opt.type) {
    case 'summary':
      waitForReportContent = summaryReportContent();
      break;
    case 'sourcefile':
      waitForReportContent = sourceReportContent();
      break;
    default:
      return Promise.reject(new Error('Unknown report type: ' + opt.type));
  }

  return waitForReportContent.then(res => {
    const reportFilePath = res.reportFilePath;
    const reportFileContent = res.reportFileContent;

    return mkdirp(path.dirname(reportFilePath)).then(() => {
      return writeFile(reportFilePath, Buffer.from(reportFileContent));
    });
  });
}

function generateFlowCoverageReportHTML(
  coverageSummaryData: FlowCoverageSummaryData,
  opts: FlowCoverageReportOptions
) {
  const projectDir = opts.projectDir;
  const outputDir = opts.outputDir;

  if (!outputDir) {
    throw new Error('Unexpected empty outputDir option');
  }

  const coverageGeneratedAt = coverageSummaryData.generatedAt;
  const generateSummary = renderHTMLReport({
    type: 'summary',
    filename: null,
    htmlTemplateOptions: opts.htmlTemplateOptions,
    coverageSummaryData,
    coverageGeneratedAt,
    projectDir,
    outputDir
  });

  const waitForCopyAssets = copyAssets(outputDir);
  const generateSourceFiles = Object.keys(coverageSummaryData.files)
        .map(filename => {
          const coverageData = coverageSummaryData.files[filename];
          return renderHTMLReport({
            type: 'sourcefile',
            coverageGeneratedAt,
            htmlTemplateOptions: opts.htmlTemplateOptions,
            coverageSummaryData,
            projectDir,
            filename,
            coverageData,
            outputDir
          });
        });
  return Promise.all(
    [
      waitForCopyAssets,
      generateSummary
    ].concat(generateSourceFiles)
  );
}

export default {
  assetsList,
  copyAssets,
  render: renderHTMLReport,
  generate: generateFlowCoverageReportHTML
};
