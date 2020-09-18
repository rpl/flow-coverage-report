'use babel';

import React from 'react';
import renderer from 'react-test-renderer';

import {BASE_DIR} from './common';

const REACT_COMPONENT = `${BASE_DIR}/footer`;

test('<HTMLReportFooter />', () => {
  const HTMLReportFooter = require(REACT_COMPONENT).default;
  const props = {
    coverageGeneratedAt: 'fakeGeneratedAt'
  };
  const tree = renderer.create(<HTMLReportFooter {...props}/>).toJSON();
  expect(tree).toMatchSnapshot();
});

test.skip('<HTMLReportFooter /> with missing props');
