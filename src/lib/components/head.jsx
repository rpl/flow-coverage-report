'use strict';

// @flow

import React from 'react';

import type {FlowReportMetaProps} from './html-report-page'; // eslint-disable-line import/no-unresolved

const AUTO_HEIGHT_SOURCE = `
.ui .CodeMirror {
  border: 1px solid rgba(34,36,38,.15);
  height: auto;
}
`;

export default function HTMLReportHead(props: FlowReportMetaProps) {
  const links = !props.assets || !props.assets.css ? [] :
    props.assets.css.map(
      css => <link key={css} rel="stylesheet" href={css}/>
    );
  const scripts = !props.assets || !props.assets.js ? [] :
    props.assets.js.map(
      js => <script key={js} src={js}/>
    );

  let customStyle;

  if (props.htmlTemplateOptions && props.htmlTemplateOptions.autoHeightSource) {
    customStyle = (
      <style key="custom-style">
        {AUTO_HEIGHT_SOURCE}
      </style>
    );
  }

  const charset = <meta key="charset" charSet="utf-8"/>;
  return (
    <head>
      {[charset].concat(links, scripts, customStyle)}
    </head>
  );
}
