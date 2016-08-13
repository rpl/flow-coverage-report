'use strict';

// @flow

import React from 'react';

module.exports = function FlowCoverageMeterBar(
  props: {percent: number, threshold?: number}
) {
  const threshold = props.threshold || 80;
  const color = props.percent >= threshold ? 'green' : 'red';
  const style = {
    padding: 0, height: 12
  };
  return (
    <div className={'row ' + color} style={style}/>
  );
};
