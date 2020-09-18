'use babel';

import React from 'react';
import renderer from 'react-test-renderer';

import {BASE_DIR} from './common';

const REACT_COMPONENT = `${BASE_DIR}/head`;

test('<HTMLReportHead />', () => {
  const HTMLReportHead = require(REACT_COMPONENT).default;
  const fakeAssets = {
    css: [
      'fake.css',
      'fake2.css'
    ],
    js: [
      'fake.js',
      'fake2.js'
    ]
  };
  const tree = renderer.create(<HTMLReportHead assets={fakeAssets}/>).toJSON();
  expect(tree).toMatchSnapshot();
});

test.skip('<HTMLReportPage /> with missing assets');
