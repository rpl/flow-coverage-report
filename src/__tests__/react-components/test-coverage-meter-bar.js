'use babel';

/* eslint-disable react/jsx-filename-extension, import/no-dynamic-require */

import React from 'react';
import renderer from 'react-test-renderer';

import {BASE_DIR} from './common';

const REACT_COMPONENT = `${BASE_DIR}/coverage-meter-bar`;

test('<FlowCoverageMeterBar />', () => {
  const FlowCoverageMeterBar = require(REACT_COMPONENT).default;
  const props = {
    percent: 20,
    threshold: 80
  };
  const tree = renderer.create(<FlowCoverageMeterBar {...props}/>).toJSON();
  expect(tree).toMatchSnapshot();
});

test.skip('<FlowCoverageMeterBar /> with missing props');
