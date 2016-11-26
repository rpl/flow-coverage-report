'use strict';

// @flow

import React from 'react';

import HTMLReportFooter from './footer';
import FlowCoverageSummaryTable from './coverage-summary-table';
import FlowCoverageFileTableHead from './coverage-file-table-head';
import FlowCoverageFileTableRow from './coverage-file-table-row';
import FlowCoverageMeterBar from './coverage-meter-bar';

import type {FlowCoverageReportProps} from './html-report-page';

module.exports = function HTMLReportBodySummary(props: FlowCoverageReportProps) {
  const summary = props.coverageSummaryData;
  if (!summary) {
    throw new Error('Missing coverageSummaryData from props');
  }
  const filenames = Object.keys(summary.files).sort();
  const percent = summary.percent;

  const filesSummaryTableProps = {
    id: 'files',
    className: 'ui small celled table sortable'
  };
  const filesSummaryTable = (
    <table {...filesSummaryTableProps}>
      <FlowCoverageFileTableHead/>
      <tbody>
      {
        filenames.map(filename => {
          const fileSummary = summary.files[filename];
          const key = filename;
          const fileRowProps = {
            filename: filename,
            isError: fileSummary.isError,
            flowCoverageParsingError: fileSummary.flowCoverageParsingError,
            flowCoverageError: fileSummary.flowCoverageError,
            flowCoverageException: fileSummary.flowCoverageException,
            flowCoverageStderr: fileSummary.flowCoverageStderr,

            percent: fileSummary.percent,
            /* eslint-disable camelcase */
            covered_count: fileSummary.expressions.covered_count,
            uncovered_count: fileSummary.expressions.uncovered_count
            /* eslint-enable camelcase */
          };
          return <FlowCoverageFileTableRow key={key} {...fileRowProps}/>;
        })
      }
      </tbody>
    </table>
  );

  let meterBar;

  if (props.htmlTemplateOptions && props.htmlTemplateOptions.showMeterBar) {
    meterBar = <FlowCoverageMeterBar percent={percent} threshold={props.threshold}/>;
  }

  return (
    <body>
      <div className="ui grid container">
        <div className="row">
          <h2>Flow Coverage Report</h2>
        </div>
        <div className="row">
          <h4 className="ui header">Summary</h4>
          <FlowCoverageSummaryTable {...props}/>
        </div>
        {
          meterBar
        }
        <div className="row">
          <h4 className="ui header">Files</h4>
          {filesSummaryTable}
        </div>
        <div className="row centered">
          <HTMLReportFooter {...props}/>
        </div>
      </div>
    </body>
  );
};
