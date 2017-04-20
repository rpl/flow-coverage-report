'use babel';

/* eslint-disable react/jsx-filename-extension, import/no-dynamic-require */

import React from 'react';
import renderer from 'react-test-renderer';

import {FLOW_COVERAGE_SUMMARY_DATA} from '../fixtures';

import {BASE_DIR} from './common';

const REACT_COMPONENT = `${BASE_DIR}/body-coverage-summary`;

test('<HTMLReportBodySummary />', () => {
  const HTMLReportBodySummary = require(REACT_COMPONENT).default;

  // Expect positive rows on lower threshold.
  const positiveProps = {
    coverageSummaryData: {...FLOW_COVERAGE_SUMMARY_DATA, threshold: 40}
  };
  const positiveTree = renderer.create(<HTMLReportBodySummary {...positiveProps}/>).toJSON();
  expect(positiveTree).toMatchSnapshot();

  // Expect negative rows on higher threshold.
  const negativeProps = {
    coverageSummaryData: {...FLOW_COVERAGE_SUMMARY_DATA, threshold: 90}
  };
  const negativeTree = renderer.create(<HTMLReportBodySummary {...negativeProps}/>).toJSON();
  expect(negativeTree).toMatchSnapshot();
});

test.skip('<HTMLReportBodySummary /> with missing props');
