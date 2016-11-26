'use strict';

// @flow

import React from 'react';

import HTMLReportFooter from './footer';
import FlowCoverageFileTableHead from './coverage-file-table-head';
import FlowCoverageFileTableRow from './coverage-file-table-row';
import FlowCoverageMeterBar from './coverage-meter-bar';

import type {
  FlowCoverageReportProps,
  FlowUncoveredLocsProps
} from './html-report-page';

function FlowCoverageLocsForm(props: FlowUncoveredLocsProps) {
  var uncovered_locs = props.uncovered_locs; // eslint-disable-line camelcase

  return (
    <div className="ui form">
      <div className="fields">
        <div key="uncovered-locs-dropdown" className="sixteen wide inline field">
          <select className="ui search dropdown uncovered-locations">
          {
            [
              <option key="placeholder" value="">Uncovered Locations</option>
            ].concat(
              uncovered_locs.map((loc, i) => { // eslint-disable-line camelcase
                const text =
                  'Start: ' + [loc.start.line, loc.start.column].join(',') + ' - ' +
                  'End: ' + [loc.end.line, loc.end.column].join(',');
                const value = loc.start.line;

                return <option key={i} value={value}>{text}</option>;
              })
            )
          }
          </select>
        </div>
        <div key="syntax-highlighting-dropdown" className="four wide inline field">
          <select className="ui search dropdown syntax-highlighting">
            <option key="es" value="es">ES6/ES7</option>
            <option key="js" value="js">JavaScript</option>
            <option key="no" value="no">None</option>
          </select>
        </div>
      </div>
    </div>
  );
}

module.exports = function HTMLReportBodySourceFile(props: FlowCoverageReportProps) {
  const {fileName, fileContent} = props;
  if (!fileName) {
    throw new Error('Missing fileName in props');
  }

  const {coverageData} = props;
  if (!coverageData) {
    throw new Error('Missing coverageData in props');
  }
  const percent = coverageData.percent || NaN;

  if (!coverageData.percent) {
    throw new Error('Missing percent in coverageData');
  }

  const {
    covered_count, uncovered_count, uncovered_locs // eslint-disable-line camelcase
  } = coverageData.expressions;

  const {summaryRelLink} = props;

  let meterBar;

  if (props.htmlTemplateOptions && props.htmlTemplateOptions.showMeterBar) {
    meterBar = <FlowCoverageMeterBar percent={percent} threshold={props.threshold}/>;
  }

  return (
    <body>
      <div className="ui grid container">
        <div className="row">
          <div className="twelve wide column">
            <h2 className="ui header">
              <a href={summaryRelLink} id="link-to-summary">
                Flow Coverage Report
              </a>
            </h2>
          </div>
        </div>
        <div className="row">
          <table className="ui small celled unstackable table">
            <FlowCoverageFileTableHead/>
            <tbody>
              <FlowCoverageFileTableRow
                {...{
                  disableLink: true,
                  filename: fileName,
                  flowCoverageParsingError: coverageData.flowCoverageParsingError,
                  flowCoverageError: coverageData.flowCoverageError,
                  flowCoverageException: coverageData.flowCoverageException,
                  flowCoverageStderr: coverageData.flowCoverageStderr,
                  isError: coverageData.isError,
                  percent,
                  /* eslint-disable camelcase */
                  covered_count,
                  uncovered_count
                  /* eslint-enable camelcase */
                }}
                />
            </tbody>
          </table>
        </div>
        {
          meterBar
        }
        <div className="row ui one column centered grid">
          <div className="column" style={{textAlign: 'left'}}>
            <div className="row">
              <FlowCoverageLocsForm
                uncovered_locs={
                  uncovered_locs // eslint-disable-line camelcase
                }
                />
            </div>
            <textarea id="file-content" value={String(fileContent)} readOnly/>
          </div>
        </div>
        <div className="row centered">
          <HTMLReportFooter {...props}/>
        </div>

      </div>
      <pre id="file-coverage-data" style={{display: 'none'}}>
        {JSON.stringify(coverageData)}
      </pre>
    </body>
  );
};
