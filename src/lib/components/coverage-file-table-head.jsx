'use strict';

// @flow

import React from 'react';
import type {Node} from 'react';

export const FlowCoverageFileTableHead = (): Node => {
  return (
    <thead>
      <tr>
        <th key="filename" className="sorted ascending">Filename</th>
        <th key="annotation">Annotation</th>
        <th key="percent">Percent</th>
        <th key="total">Total</th>
        <th key="covered">Covered</th>
        <th key="uncovered">Uncovered</th>
      </tr>
    </thead>
  );
};

export default FlowCoverageFileTableHead;
