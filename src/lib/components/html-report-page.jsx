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

export function HTMLReportSummaryPage(props: FlowCoverageReportProps) {
  return (<html>
    <HTMLReportHead {...props}/>
    <HTMLReportBodySummary {...props}/>
  </html>);
}

export function HTMLReportSourceFilePage(props: FlowCoverageReportProps) {
  return (<html>
    <HTMLReportHead {...props}/>
    <HTMLReportBodySourceFile {...props}/>
  </html>);
}

HTMLReportPage.defaultProps = {
  coverageData: null,
  fileName: null,
  fileContent: null,
  htmlTemplateOptions: null,
  summaryRelLink: null
};
