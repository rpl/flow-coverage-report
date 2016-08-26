'use strict';

// @flow

import React from 'react';

function LinkToSourceFileReport(props: {targetFilename: string}) {
  const filename = props.targetFilename;
  const href = `sourcefiles/${filename}.html`;
  return <a href={href}>{filename}</a>;
}

module.exports = function FlowCoverageFileTableRow(
  props: {
    filename: string, covered_count: number, uncovered_count: number,
    percent: number, disableLink?: boolean, threshold?: number
  }
) {
  /* eslint-disable camelcase */
  const {
    filename,
    covered_count, uncovered_count,
    percent
  } = props;

  let {
    disableLink, threshold
  } = props;

  disableLink = props.disableLink;
  threshold = props.threshold || 80;

  return (
    <tr key={filename} className={percent >= threshold ? 'positive' : 'negative'}>
      <td key="filename" className={disableLink ? '' : 'selectable'}>
        {disableLink ? filename : <LinkToSourceFileReport targetFilename={filename}/>}
      </td>
      <td key="percent"> {percent} %</td>
      <td key="total"> {covered_count + uncovered_count} </td>
      <td key="covered"> {covered_count} </td>
      <td key="uncovered"> {uncovered_count} </td>
    </tr>
  );
  /* eslint-enable camelcase */
};
