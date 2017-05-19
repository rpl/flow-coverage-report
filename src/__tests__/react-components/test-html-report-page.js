'use babel';

/* eslint-disable react/jsx-filename-extension, import/no-dynamic-require */

import React from 'react';
import renderer from 'react-test-renderer';

import {FLOW_COVERAGE_SUMMARY_DATA} from '../fixtures';

import {BASE_DIR} from './common';

const REACT_COMPONENT = `${BASE_DIR}/html-report-page`;

test('<HTMLReportSummaryPage/>', () => {
  const HTMLReportSummaryPage = require(REACT_COMPONENT).HTMLReportSummaryPage;
  const props = {
    coverageSummaryData: {...FLOW_COVERAGE_SUMMARY_DATA, threshold: 40}
  };
  const tree = renderer.create(<HTMLReportSummaryPage {...props}/>).toJSON();
  expect(tree).toMatchSnapshot();
});

test.skip('<HTMLReportSourceFilePage/>');
