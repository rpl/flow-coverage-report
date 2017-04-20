'use strict';

// @flow

import React from 'react';

import type {
  FlowCoverageSummaryData,
  FlowCoverageJSONData,
  FlowUncoveredLoc
} from '../flow';

/* eslint-disable import/no-unresolved */
import HTMLReportHead from './head';
import HTMLReportBodySummary from './body-coverage-summary';
import HTMLReportBodySourceFile from './body-coverage-sourcefile';
/* eslint-enable */

export type FlowUncoveredLocsProps = {
  uncovered_locs: Array<FlowUncoveredLoc>
};

/* eslint-disable react/no-unused-prop-types */
export type FlowCoverageReportProps = {
  reportType: 'summary' | 'sourcefile',
  coverageGeneratedAt: string,
  assets: {
    css?: Array<string>,
    js?: Array<string>
  },
  coverageSummaryData: FlowCoverageSummaryData,
  coverageData?: FlowCoverageJSONData,
  fileName?: string,
  fileContent?: string|Buffer,
  summaryRelLink?: string,
  htmlTemplateOptions?: Object,
};
/* eslint-enable */

export default function HTMLReportPage(props: FlowCoverageReportProps) {
  const HTMLReportBody = props.reportType === 'sourcefile' ?
        HTMLReportBodySourceFile : HTMLReportBodySummary;

  return (<html>
    <HTMLReportHead {...props}/>
    <HTMLReportBody {...props}/>
  </html>);
}

HTMLReportPage.defaultProps = {
  coverageData: null,
  fileName: null,
  fileContent: null,
  htmlTemplateOptions: null,
  summaryRelLink: null
};
