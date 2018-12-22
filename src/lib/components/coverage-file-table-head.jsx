'use strict';

// @flow

import React from 'react';

export default function FlowCoverageFileTableHead() {
  return (
    <thead>
      <tr>
        <th key="filename" data-sort-default>Filename</th>
        <th key="annotation">Annotation</th>
        <th key="percent">Percent</th>
        <th key="total">Total</th>
        <th key="covered">Covered</th>
        <th key="uncovered">Uncovered</th>
      </tr>
    </thead>
  );
}
