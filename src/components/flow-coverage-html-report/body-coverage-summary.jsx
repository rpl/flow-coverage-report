'use strict';

// @flow

import React from 'react';

import HTMLReportFooter from './footer';
import FlowCoverageSummaryTable from './coverage-summary-table';
import FlowCoverageFileTableHead from './coverage-file-table-head';
import FlowCoverageFileTableRow from './coverage-file-table-row';
import FlowCoverageMeterBar from './coverage-meter-bar';

import type {FlowCoverageReportProps} from './index';

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
            /* eslint-disable camelcase */
            covered_count: fileSummary.expressions.covered_count,
            uncovered_count: fileSummary.expressions.uncovered_count,
            percent: fileSummary.percent || NaN
            /* eslint-enable camelcase */
          };
          return <FlowCoverageFileTableRow key={key} {...fileRowProps}/>;
        })
      }
      </tbody>
    </table>
  );

  return (
    <body>
      <div className="ui grid container">
        <div className="row">
          <h1>Flow Coverage Report - Summary</h1>
        </div>
        <div className="row">
          <FlowCoverageSummaryTable {...props}/>
        </div>
        <FlowCoverageMeterBar percent={percent} threshold={props.threshold}/>
        <div className="row">
          {filesSummaryTable}
        </div>
        <div className="row centered">
          <HTMLReportFooter {...props}/>
        </div>
      </div>
    </body>
  );
};
