'use babel';

/* eslint-disable react/jsx-filename-extension */

import {test} from 'ava';

import React from 'react';
import {shallow} from 'enzyme';

import {FLOW_COVERAGE_SUMMARY_DATA} from '../fixtures';

const BASE_DIR = '../../../src/components/flow-coverage-html-report';

const REACT_COMPONENT = `${BASE_DIR}/body-coverage-summary`;

test('<HTMLReportBodySummary />', t => {
  const HTMLReportBodySummary = require(REACT_COMPONENT);
  const props = {
    coverageSummaryData: FLOW_COVERAGE_SUMMARY_DATA
  };
  const wrapper = shallow(<HTMLReportBodySummary {...props}/>);

  t.is(wrapper.find('table#files').length, 1);
});

test.todo('<HTMLReportBodySummary /> with missing props');
