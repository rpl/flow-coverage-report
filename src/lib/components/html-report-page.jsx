'use strict';

// @flow

import React from 'react';

import type {
  FlowCoverageSummaryData,
  FlowCoverageJSONData,
  FlowUncoveredLoc
} from '../flow';

import HTMLReportHead from './head';
import HTMLReportBodySummary from './body-coverage-summary';
import HTMLReportBodySourceFile from './body-coverage-sourcefile';

export type FlowUncoveredLocsProps = {
  uncovered_locs: Array<FlowUncoveredLoc>
};

export type FlowCoverageReportProps = {
  reportType: 'summary' | 'sourcefile',
  coverageGeneratedAt: string,
  assets: {
    css?: Array<string>,
    js?: Array<string>
  },
  coverageSummaryData?: FlowCoverageSummaryData,
  coverageData?: FlowCoverageJSONData,
  fileName?: string,
  fileContent?: string|Buffer,
  summaryRelLink?: string,
  threshold?: number,
  htmlTemplateOptions?: Object,
};

module.exports = function HTMLReportPage(props: FlowCoverageReportProps) {
  var HTMLReportBody = props.reportType === 'sourcefile' ?
        HTMLReportBodySourceFile : HTMLReportBodySummary;

  return (<html>
    <HTMLReportHead {...props}/>
    <HTMLReportBody {...props}/>
  </html>);
};
