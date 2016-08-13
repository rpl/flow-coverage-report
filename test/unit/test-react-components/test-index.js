'use babel';

/* eslint-disable react/jsx-filename-extension */

import {test} from 'ava';

import React from 'react';
import {render} from 'enzyme';

import {FLOW_COVERAGE_SUMMARY_DATA} from '../fixtures';

const BASE_DIR = '../../../src/components/flow-coverage-html-report';

const REACT_COMPONENT = `${BASE_DIR}/index`;

test('<HTMLReportPage reportType="summary"/>', t => {
  const HTMLReportPage = require(REACT_COMPONENT);
  const props = {
    coverageSummaryData: FLOW_COVERAGE_SUMMARY_DATA
  };
  const wrapper = render(<HTMLReportPage {...props}/>);

  t.is(wrapper.find('head').length, 1);
  t.is(wrapper.find('body').length, 1);
});

test.todo('<HTMLReportPage reportType="sourcefile"/>');
