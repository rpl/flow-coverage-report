'use babel';

import React from 'react';
import renderer from 'react-test-renderer';

import {FLOW_COVERAGE_SUMMARY_DATA} from '../fixtures';

import {BASE_DIR} from './common';

const REACT_COMPONENT = `${BASE_DIR}/body-coverage-sourcefile`;

test('<HTMLReportBodySourceFile />', () => {
  const HTMLReportBodySourceFile = require(REACT_COMPONENT).default;
  const fileName = 'src/a.js';
  const props = {
    coverageSummaryData: FLOW_COVERAGE_SUMMARY_DATA,
    coverageData: FLOW_COVERAGE_SUMMARY_DATA.files[fileName],
    summaryRelLink: '../index.html',
    fileName
  };

  const tree = renderer.create(<HTMLReportBodySourceFile {...props}/>).toJSON();
  expect(tree).toMatchSnapshot();
});

test.todo('<HTMLReportBodySourceFile /> with missing props');
