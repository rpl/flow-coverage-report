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

export type FlowReportMetaProps = {
  assets: {
    css?: Array<string>,
    js?: Array<string>
  },
  coverageGeneratedAt: string,
  htmlTemplateOptions: {
    autoHeightSource?: boolean,
  },
};

export type FlowCoverageSummaryReportProps = {
  assets: {
    css?: Array<string>,
    js?: Array<string>
  },
  coverageGeneratedAt: string,
  htmlTemplateOptions: {
    autoHeightSource?: boolean,
  },
  coverageSummaryData: FlowCoverageSummaryData,
};

export type FlowCoverageSourceFileReportProps = {
  assets: {
    css?: Array<string>,
    js?: Array<string>
  },
  coverageGeneratedAt: string,
  htmlTemplateOptions: {
    autoHeightSource?: boolean,
  },
  coverageSummaryData: FlowCoverageSummaryData,
  coverageData: FlowCoverageJSONData,
  fileName: string,
  fileContent: string|Buffer,
  summaryRelLink: string,
};

export function HTMLReportSummaryPage(props: FlowCoverageSummaryReportProps) {
  return (<html>
    <HTMLReportHead {...props}/>
    <HTMLReportBodySummary {...props}/>
  </html>);
}

export function HTMLReportSourceFilePage(props: FlowCoverageSourceFileReportProps) {
  return (<html>
    <HTMLReportHead {...props}/>
    <HTMLReportBodySourceFile {...props}/>
  </html>);
}
