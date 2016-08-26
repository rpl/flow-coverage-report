'use babel';

/* eslint-disable react/jsx-filename-extension */

import {test} from 'ava';

import React from 'react';
import {shallow} from 'enzyme';

import {FLOW_COVERAGE_SUMMARY_DATA} from '../fixtures';

import {BASE_DIR} from './common';

const REACT_COMPONENT = `${BASE_DIR}/coverage-summary-table`;

test('<FlowCoverageSummaryTable />', t => {
  const FlowCoverageSummaryTable = require(REACT_COMPONENT);
  const props = {
    coverageSummaryData: FLOW_COVERAGE_SUMMARY_DATA
  };
  const wrapper = shallow(<FlowCoverageSummaryTable {...props}/>);

  t.is(wrapper.find('table').length, 1);
});

test.todo('<FlowCoverageSummaryTable /> with missing props');
