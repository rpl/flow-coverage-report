'use babel';

/* eslint-disable react/jsx-filename-extension */

import {test} from 'ava';

import React from 'react';
import {shallow} from 'enzyme';

import {BASE_DIR} from './common';

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

test('<FlowCoverageFileTableRow /> with errors', t => {
  const FlowCoverageFileTableRow = require(REACT_COMPONENT);
  const baseErrorProps = {
    filename: 'fake-filename.js',
    disableLink: true,
    isError: true,

    /* eslint-disable camelcase */
    covered_count: 0,
    uncovered_count: 0
    /* eslint-enable camelcase */
  };

  const testErrorProp = (props, expectedErrorRegEx) => {
    let wrapper = shallow(<FlowCoverageFileTableRow {...props}/>);

    const expectedKeys = [
      'filename', 'percent', 'total', 'covered', 'uncovered'
    ];

    t.is(wrapper.find('tr').length, 1);
    t.true(wrapper.find('tr').hasClass('error'), 1);

    t.is(wrapper.find('td').length, expectedKeys.length);

    let i = 0;
    for (const expectedKey of expectedKeys) {
      t.is(wrapper.find('td').at(i).key(), expectedKey);
      i++;
    }

    let errorIcon = wrapper.find('.attention.icon');
    t.is(errorIcon.length, 1);

    let errorPopup = wrapper.find('.ui.popup');
    t.is(errorPopup.length, 1);

    t.regex(errorPopup.text(), expectedErrorRegEx);
  };

  let flowCoverageErrorProps = {
    ...baseErrorProps,
    flowCoverageError: 'Fake Coverage Error'
  };
  testErrorProp(flowCoverageErrorProps, /Fake Coverage Error/);

  let flowCoverageParsingErrorProps = {
    ...baseErrorProps,
    flowCoverageParsingError: 'Fake Parsing Error'
  };
  testErrorProp(flowCoverageParsingErrorProps, /Fake Parsing Error/);

  let flowCoverageExceptionErrorProps = {
    ...baseErrorProps,
    flowCoverageException: 'Fake Coverage Exception'
  };
  testErrorProp(flowCoverageExceptionErrorProps, /Fake Coverage Exception/);

  let flowCoverageUnrecognizedErrorProps = {
    ...baseErrorProps,
    flowCoverageStderr: 'Fake flow unrecognized error stderr'
  };
  testErrorProp(flowCoverageUnrecognizedErrorProps, /Fake flow unrecognized error stderr/);
});

test.todo('<FlowCoverageFileTableRow /> with missing props');
