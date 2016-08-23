'use babel';

/* eslint-disable react/jsx-filename-extension */

import {test} from 'ava';

import React from 'react';
import {shallow} from 'enzyme';

const BASE_DIR = '../../../src/components';

const REACT_COMPONENT = `${BASE_DIR}/coverage-file-table-row`;

test('<FlowCoverageFileTableRow />', t => {
  const FlowCoverageFileTableRow = require(REACT_COMPONENT);
  const props = {
    /* eslint-disable camelcase */
    filename: 'fake-filename.js',
    covered_count: 1,
    uncovered_count: 2,
    disableLink: false
    /* eslint-enable camelcase */
  };
  const wrapper = shallow(<FlowCoverageFileTableRow {...props}/>);

  const expectedKeys = [
    'filename', 'percent', 'total', 'covered', 'uncovered'
  ];

  t.is(wrapper.find('tr').length, 1);
  t.is(wrapper.find('td').length, expectedKeys.length);

  const shallowWrapper = shallow(<FlowCoverageFileTableRow {...props}/>);

  let i = 0;
  for (const expectedKey of expectedKeys) {
    t.is(shallowWrapper.find('td').at(i).key(), expectedKey);
    i++;
  }
});

test.todo('<FlowCoverageFileTableRow /> with missing props');
