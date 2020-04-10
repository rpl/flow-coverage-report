'use strict';

// @flow

import React from 'react';

function LinkToSourceFileReport(props: {targetFilename: string}) {
  const filename = props.targetFilename;
  const href = `sourcefiles/${filename}.html`;
  return <a href={href}>{filename}</a>;
}

export default function FlowCoverageFileTableRow(
  props: {
    filename: string,
    annotation: string,
    covered_count: number,
    uncovered_count: number,
    percent: number,
    disableLink: boolean,
    threshold: number,
    thresholdUncovered: number,
    isError: boolean,
    isFlow: boolean,
    flowCoverageError: ?string,
    flowCoverageParsingError: ?string,
    flowCoverageException: ?string,
    flowCoverageStderr: ?string|?Buffer,
  }
) {
  /* eslint-disable camelcase */
  const {
    filename,
    annotation,
    covered_count,
    uncovered_count,
    percent,
    isError,
    isFlow,
    disableLink,
    threshold,
    thresholdUncovered
  } = props;

  let aboveThreshold;

  if (thresholdUncovered) {
    aboveThreshold = uncovered_count <= thresholdUncovered;
  } else {
    aboveThreshold = percent >= threshold;
  }

  let className = (!isError && isFlow && aboveThreshold) ?
    'positive' : 'negative';

  let errorPopup;

  if (isError) {
    className = 'error';
    let errorType;
    let errorContent;

    if (props.flowCoverageError) {
      errorType = 'flow coverage';
      errorContent = <pre>{props.flowCoverageError}</pre>;
    }

    if (props.flowCoverageParsingError) {
      errorType = 'JSON Parsing';
      errorContent = <pre>{props.flowCoverageParsingError}</pre>;
    }

    if (props.flowCoverageException) {
      errorType = 'Flow command unexpected error';
      errorContent = <pre>{props.flowCoverageException}</pre>;
    }

    if (props.flowCoverageStderr) {
      errorType = 'Flow command stderr';
      errorContent = <pre>{props.flowCoverageStderr}</pre>;
    }

    errorPopup = (
      <div className="ui popup">
        <div className="header">Flow Error: {errorType}</div>
        <div>{errorContent}</div>
      </div>
    );
  }

  return (
    <tr key={filename} className={className}>
      <td key="filename" className={disableLink ? '' : 'selectable'}>
        {disableLink ? filename : <LinkToSourceFileReport targetFilename={filename}/>}
      </td>
      <td key="annotation"> @{annotation} </td>
      <td key="percent" className={isError ? 'error' : ''}>
        {
          isError ?
            <span>
              <i className="attention icon" data-position="bottom right"/>
              Error
              {errorPopup}
            </span> :
            <span>{percent} %</span>
        }
      </td>
      <td key="total"> {covered_count + uncovered_count} </td>
      <td key="covered"> {covered_count} </td>
      <td key="uncovered"> {uncovered_count} </td>
    </tr>
  );
  /* eslint-enable camelcase */
}
