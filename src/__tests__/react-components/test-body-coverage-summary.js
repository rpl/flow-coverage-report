'use babel';

/* eslint-disable react/jsx-filename-extension, import/no-dynamic-require */

import React from 'react';
import renderer from 'react-test-renderer';

import {FLOW_COVERAGE_SUMMARY_DATA} from '../fixtures';

import {BASE_DIR} from './common';

const REACT_COMPONENT = `${BASE_DIR}/body-coverage-summary`;

test('<HTMLReportBodySummary />', () => {
  const HTMLReportBodySummary = require(REACT_COMPONENT).default;
  const props = {
    coverageSummaryData: FLOW_COVERAGE_SUMMARY_DATA
  };
  const tree = renderer.create(<HTMLReportBodySummary {...props}/>).toJSON();
  expect(tree).toMatchSnapshot();
});

test.skip('<HTMLReportBodySummary /> with missing props');
