'use strict';

// @flow

import React from 'react';

const FlowCoverageMeterBar = (
  props: {+percent: number, +threshold: number}
) => {
  const {threshold} = props;
  const color = props.percent >= threshold ? 'green' : 'red';
  const style = {
    padding: 0, height: 12
  };
  return (
    <div className={'row ' + color} style={style}/>
  );
};

export default FlowCoverageMeterBar;
