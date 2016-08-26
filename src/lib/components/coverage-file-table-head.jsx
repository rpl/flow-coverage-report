'use strict';

// @flow

import React from 'react';

module.exports = function FlowCoverageFileTableHead() {
  return (
    <thead>
      <tr>
        <th key="filename" className="sorted ascending">Filename</th>
        <th key="percent">Percent</th>
        <th key="total">Total</th>
        <th key="covered">Covered</th>
        <th key="uncovered">Uncovered</th>
      </tr>
    </thead>
  );
};
