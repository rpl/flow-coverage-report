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

export type FlowReportMetaProps = {
  +assets: {
    css?: Array<string>,
    js?: Array<string>
  },
  +coverageGeneratedAt: string,
  +htmlTemplateOptions: {
    autoHeightSource?: boolean,
    showMeterBar?: boolean,
  },
};

export type FlowCoverageSummaryReportProps = FlowReportMetaProps & {
  +coverageSummaryData: FlowCoverageSummaryData,
};

export type FlowCoverageSourceFileReportProps = FlowReportMetaProps & {
  +coverageSummaryData: FlowCoverageSummaryData,
  +coverageData: FlowCoverageJSONData,
  +fileName: string,
  +fileContent: string|Buffer,
  +summaryRelLink: string,
};

export const HTMLReportSummaryPage = (props: FlowCoverageSummaryReportProps) => {
  return (
    <html>
      <HTMLReportHead {...props}/>
      <HTMLReportBodySummary
        assets={props.assets}
        coverageGeneratedAt={props.coverageGeneratedAt}
        htmlTemplateOptions={props.htmlTemplateOptions}
        coverageSummaryData={props.coverageSummaryData}
      />
    </html>
  );
};

export const HTMLReportSourceFilePage = (props: FlowCoverageSourceFileReportProps) => {
  return (
    <html>
      <HTMLReportHead {...props}/>
      <HTMLReportBodySourceFile
        assets={props.assets}
        coverageGeneratedAt={props.coverageGeneratedAt}
        htmlTemplateOptions={props.htmlTemplateOptions}
        coverageSummaryData={props.coverageSummaryData}
        coverageData={props.coverageData}
        fileName={props.fileName}
        fileContent={props.fileContent}
        summaryRelLink={props.summaryRelLink}
      />
    </html>
  );
};
