'use babel';

/* eslint-disable react/jsx-filename-extension */

import {test} from 'ava';

import React from 'react';
import {shallow} from 'enzyme';

import {BASE_DIR} from './common';

const REACT_COMPONENT = `${BASE_DIR}/head`;

test('<HTMLReportHead />', t => {
  const HTMLReportHead = require(REACT_COMPONENT);
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
  const wrapper = shallow(<HTMLReportHead assets={fakeAssets}/>);

  t.is(wrapper.find('head').length, 1);
  t.is(wrapper.find('meta').length, 1);
  t.is(wrapper.find('meta').props().charSet, 'utf-8');
  t.is(wrapper.find('link').length, fakeAssets.css.length);
  t.is(wrapper.find('script').length, fakeAssets.js.length);
});

test.todo('<HTMLReportPage /> with missing assets');
