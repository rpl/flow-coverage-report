'use strict';

// @flow

import React from 'react';

import type {FlowCoverageReportProps} from './html-report-page';

module.exports = function HTMLReportHead(props: FlowCoverageReportProps) {
  var links = !props.assets || !props.assets.css ? [] :
    props.assets.css.map(
      css => <link key={css} rel="stylesheet" href={css}/>
    );
  var scripts = !props.assets || !props.assets.js ? [] :
    props.assets.js.map(
      js => <script key={js} src={js}/>
    );
  var charset = <meta key="charset" charSet="utf-8"/>;
  return (
    <head>
     {[charset].concat(links, scripts)}
    </head>
  );
};
