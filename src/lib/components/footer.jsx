'use strict';

// @flow

import React from 'react';

import type {FlowCoverageReportProps} from './html-report-page'; // eslint-disable-line import/no-unresolved

export default function HTMLReportFooter(props: FlowCoverageReportProps) {
  return (
    <footer>
      Flow Coverage Report generated by
      <a href="https://flowtype.org"> flow </a>
      and
      <a href="https://github.com/rpl/flow-coverage-report"> flow-coverage-report </a>
      at {props.coverageGeneratedAt}
    </footer>
  );
}
