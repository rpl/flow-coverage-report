'use babel';

import React from 'react';
import renderer from 'react-test-renderer';

import {BASE_DIR} from './common';

const REACT_COMPONENT = `${BASE_DIR}/coverage-file-table-row`;

test('<FlowCoverageFileTableRow />', () => {
  const FlowCoverageFileTableRow = require(REACT_COMPONENT).default;
  const props = {
    /* eslint-disable camelcase */
    filename: 'fake-filename.js',
    annotation: 'flow',
    covered_count: 1,
    uncovered_count: 2,
    disableLink: false
    /* eslint-enable camelcase */
  };
  const tree = renderer.create(<FlowCoverageFileTableRow {...props}/>).toJSON();
  expect(tree).toMatchSnapshot();
});

test('<FlowCoverageFileTableRow /> with errors', () => {
  const FlowCoverageFileTableRow = require(REACT_COMPONENT).default;
  const baseErrorProps = {
    filename: 'fake-filename.js',
    annotation: 'no flow',
    disableLink: true,
    isError: true,

    /* eslint-disable camelcase */
    covered_count: 0,
    uncovered_count: 0
    /* eslint-enable camelcase */
  };

  const testErrorProp = props => {
    const tree = renderer.create(<FlowCoverageFileTableRow {...props}/>).toJSON();
    expect(tree).toMatchSnapshot();
  };

  const flowCoverageErrorProps = {
    ...baseErrorProps,
    flowCoverageError: 'Fake Coverage Error'
  };
  testErrorProp(flowCoverageErrorProps);

  const flowCoverageParsingErrorProps = {
    ...baseErrorProps,
    flowCoverageParsingError: 'Fake Parsing Error'
  };
  testErrorProp(flowCoverageParsingErrorProps);

  const flowCoverageExceptionErrorProps = {
    ...baseErrorProps,
    flowCoverageException: 'Fake Coverage Exception'
  };
  testErrorProp(flowCoverageExceptionErrorProps);

  const flowCoverageUnrecognizedErrorProps = {
    ...baseErrorProps,
    flowCoverageStderr: 'Fake flow unrecognized error stderr'
  };
  testErrorProp(flowCoverageUnrecognizedErrorProps);
});

test.todo('<FlowCoverageFileTableRow /> with missing props');
