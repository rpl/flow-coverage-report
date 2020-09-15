'use babel';

import React from 'react';
import renderer from 'react-test-renderer';

import {BASE_DIR} from './common';

const REACT_COMPONENT = `${BASE_DIR}/coverage-file-table-head`;

test('<FlowCoverageFileTableHead />', () => {
  const FlowCoverageFileTableHead = require(REACT_COMPONENT).default;
  const tree = renderer.create(<FlowCoverageFileTableHead/>).toJSON();
  expect(tree).toMatchSnapshot();
});

test.skip('<FlowCoverageFileTableHead /> with missing props');
