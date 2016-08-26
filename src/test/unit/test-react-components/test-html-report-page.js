'use babel';

/* eslint-disable react/jsx-filename-extension */

import {test} from 'ava';

import React from 'react';
import {shallow} from 'enzyme';

import {FLOW_COVERAGE_SUMMARY_DATA} from '../fixtures';

import {BASE_DIR} from './common';

const REACT_COMPONENT = `${BASE_DIR}/html-report-page`;
const HEAD = `${BASE_DIR}/head`;
const BODY_SUMMARY = `${BASE_DIR}/body-coverage-summary`;

test('<HTMLReportPage reportType="summary"/>', t => {
  const HTMLReportPage = require(REACT_COMPONENT);
  const HTMLReportHead = require(HEAD);
  const HTMLReportBodySummary = require(BODY_SUMMARY);
  const props = {
    reportType: 'summary',
    coverageSummaryData: FLOW_COVERAGE_SUMMARY_DATA
  };
  const wrapper = shallow(<HTMLReportPage {...props}/>);

  t.is(wrapper.find(HTMLReportHead).length, 1);
  t.is(wrapper.find(HTMLReportBodySummary).length, 1);
});

test.todo('<HTMLReportPage reportType="sourcefile"/>');
