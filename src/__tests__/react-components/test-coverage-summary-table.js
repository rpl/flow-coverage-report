'use babel';

/* eslint-disable react/jsx-filename-extension, import/no-dynamic-require */

import React from 'react';
import renderer from 'react-test-renderer';

import {FLOW_COVERAGE_SUMMARY_DATA} from '../fixtures';

import {BASE_DIR} from './common';

const REACT_COMPONENT = `${BASE_DIR}/coverage-summary-table`;

test('<FlowCoverageSummaryTable />', () => {
  const FlowCoverageSummaryTable = require(REACT_COMPONENT).default;

  // Expect positive with lower threshold.
  const positiveSummaryProps = {
    coverageSummaryData: {...FLOW_COVERAGE_SUMMARY_DATA, threshold: 40}
  };
  const positiveSummaryTree = renderer.create(<FlowCoverageSummaryTable {...positiveSummaryProps}/>).toJSON();
  expect(positiveSummaryTree).toMatchSnapshot();

  // Expect negative with higher threshold.
  const negativeSummaryProps = {
    coverageSummaryData: {...FLOW_COVERAGE_SUMMARY_DATA, threshold: 90}
  };
  const negativeSummaryTree = renderer.create(<FlowCoverageSummaryTable {...negativeSummaryProps}/>).toJSON();
  expect(negativeSummaryTree).toMatchSnapshot();

  // Expect negative with uncovered_count >= thresholdUncovered
  const negativeSummaryUncoveredProps = {
    coverageSummaryData: {...FLOW_COVERAGE_SUMMARY_DATA, uncoveredThreshold: 4}
  };
  const negativeSummaryUncoveredTree = renderer.create(<FlowCoverageSummaryTable {...negativeSummaryUncoveredProps}/>).toJSON();
  expect(negativeSummaryUncoveredTree).toMatchSnapshot();
});

test.skip('<FlowCoverageSummaryTable /> with missing props');
