'use strict';

// @flow

import React from 'react';

export default function FlowCoverageMeterBar(
  props: {
    percent: number,
    threshold: number,
    thresholdUncovered: number,
    uncoveredCount: number
  }
) {
  const {
    threshold,
    thresholdUncovered,
    uncoveredCount,
    percent
  } = props;

  let color;
  if (thresholdUncovered) {
    color = uncoveredCount <= thresholdUncovered ? 'green' : 'red';
  } else {
    color = percent >= threshold ? 'green' : 'red';
  }

  const style = {
    padding: 0, height: 12
  };
  return (
    <div className={'row ' + color} style={style}/>
  );
}
