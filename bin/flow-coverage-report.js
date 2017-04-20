#!/usr/bin/env node
const path = require('path');

require(path.join(__dirname, '../dist/lib/cli')).run(); // eslint-disable-line import/no-dynamic-require
