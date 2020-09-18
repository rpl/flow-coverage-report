'use strict';

// @flow

import React from 'react';

import type {FlowCoverageSummaryReportProps} from './html-report-page';

const FlowCoverageSummaryTable = (props: FlowCoverageSummaryReportProps) => {
  if (!props.coverageSummaryData) {
    throw new Error('Missing coverageSummaryData in props');
  }

  const summary = props.coverageSummaryData;
  const {percent} = summary;
  const className = percent >= summary.threshold ? 'positive' : 'negative';

  return (
    <table className="ui small celled table">
      <thead>
        <tr>
          <th key="percent">Percent</th>
          <th key="total">Total</th>
          <th key="covered">Covered</th>
          <th key="uncovered">Uncovered</th>
        </tr>
      </thead>
      <tbody>
        <tr className={className}>
          <td key="percent">{percent} %</td>
          <td key="total">{summary.covered_count + summary.uncovered_count}</td>
          <td key="covered">{summary.covered_count}</td>
          <td key="uncovered">{summary.uncovered_count}</td>
        </tr>
      </tbody>
    </table>
  );
};

export default FlowCoverageSummaryTable;
