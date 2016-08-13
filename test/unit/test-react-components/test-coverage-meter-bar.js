'use babel';

/* eslint-disable react/jsx-filename-extension */

import {test} from 'ava';

import React from 'react';
import {render} from 'enzyme';

const BASE_DIR = '../../../src/components/flow-coverage-html-report';

const REACT_COMPONENT = `${BASE_DIR}/coverage-meter-bar`;

test('<FlowCoverageMeterBar />', t => {
  const FlowCoverageMeterBar = require(REACT_COMPONENT);
  const props = {
    percent: 20,
    threshold: 80
  };
  const wrapper = render(<FlowCoverageMeterBar {...props}/>);

  t.is(wrapper.find('div.row.red').length, 1);
});

test.todo('<FlowCoverageMeterBar /> with missing props');
