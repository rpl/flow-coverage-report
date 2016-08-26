'use babel';

/* eslint-disable react/jsx-filename-extension */

import {test} from 'ava';

import React from 'react';
import {shallow} from 'enzyme';

import {BASE_DIR} from './common';

const REACT_COMPONENT = `${BASE_DIR}/coverage-meter-bar`;

test('<FlowCoverageMeterBar />', t => {
  const FlowCoverageMeterBar = require(REACT_COMPONENT);
  const props = {
    percent: 20,
    threshold: 80
  };
  const wrapper = shallow(<FlowCoverageMeterBar {...props}/>);

  t.is(wrapper.find('div.row.red').length, 1);
});

test.todo('<FlowCoverageMeterBar /> with missing props');
