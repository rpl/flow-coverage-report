'use babel';

import React from 'react';
import renderer from 'react-test-renderer';

import {FLOW_COVERAGE_SUMMARY_DATA} from '../fixtures';

import {BASE_DIR} from './common';

const REACT_COMPONENT = `${BASE_DIR}/html-report-page`;

test('<HTMLReportSummaryPage/>', () => {
  const {HTMLReportSummaryPage} = require(REACT_COMPONENT);
  const props = {
    coverageSummaryData: {...FLOW_COVERAGE_SUMMARY_DATA, threshold: 40}
  };
  const tree = renderer.create(<HTMLReportSummaryPage {...props}/>).toJSON();
  expect(tree).toMatchSnapshot();
});

test.skip('<HTMLReportSourceFilePage/>');
