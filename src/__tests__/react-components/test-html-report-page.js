'use babel';

/* eslint-disable react/jsx-filename-extension, import/no-dynamic-require */

import React from 'react';
import renderer from 'react-test-renderer';

import {FLOW_COVERAGE_SUMMARY_DATA} from '../fixtures';

import {BASE_DIR} from './common';

const REACT_COMPONENT = `${BASE_DIR}/html-report-page`;

test('<HTMLReportPage reportType="summary"/>', () => {
  const HTMLReportPage = require(REACT_COMPONENT).default;
  const props = {
    reportType: 'summary',
    coverageSummaryData: FLOW_COVERAGE_SUMMARY_DATA
  };
  const tree = renderer.create(<HTMLReportPage {...props}/>).toJSON();
  expect(tree).toMatchSnapshot();
});

test.skip('<HTMLReportPage reportType="sourcefile"/>');
