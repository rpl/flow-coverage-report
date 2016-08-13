"use strict";

var exec = require("child_process").exec;
var EventEmitter = require("events").EventEmitter;
var glob = require("glob");
var path = require("path");
var fs = require("fs");
var mkdirp = require("mkdirp");
var react = require("react-dom/server");

var FlowCoverageHTMLReport = require("./lib/components/flow-coverage-html-report");

function checkFlowStatus(flowCommandPath, projectDir, cb) {
  exec(
    flowCommandPath + " status",
    {cwd: projectDir},
    function (err, stdout, stderr) {
      if (err && err.message.includes("Could not find a .flowconfig")) {
        // FLOW CONFIG NOT FOUND
        return cb(err);
      }

      return cb();
    }
  );
}

function generateFlowCoverageForFile(flowCommandPath, projectDir, file, cb) {
  exec(
    flowCommandPath + " coverage --json " + file,
    {cwd: projectDir},
    function (err, stdout, stderr) {
      if (err && err.message.includes("Could not find a .flowconfig")) {
        // Flow config not found
        return cb(err);
      }

      try {
        var data = JSON.parse(stdout);
      } catch (e) {
        // JSON parsing error.
        return cb(e);
      }

      return cb(null, data);
    }
  );
}

function renderHTMLReport(type, coverageGeneratedAt, projectDir, filename, data, outputDir, cb) {
  if (filename && filename.includes("..")) {
    return cb(new Error(
      "filename is not relative to the projectDir: " +
        [projectDir, filename].join(" - ")
    ));
  }

  if (type == "summary") {
    var summaryPath = path.join(outputDir, "index.html");

    var content = "<!DOCTYPE html>\n" +
          react.renderToStaticMarkup(FlowCoverageHTMLReport({
            coverageGeneratedAt: coverageGeneratedAt,
            assets: {
              "css": [
                path.relative(path.dirname(filename), "semantic.min.css"),
                path.relative(path.dirname(filename), "flow-coverage-report.css"),
              ],
              "js": [
                path.relative(path.dirname(filename), "jquery-3.1.0.min.js"),
                path.relative(path.dirname(filename), "semantic.min.js"),
                path.relative(path.dirname(filename), "semantic-tablesort.js"),
                path.relative(path.dirname(filename), "index.js"),
              ]
            },
            reportType: type, coverageSummaryData: data,
          }));

    return fs.writeFile(summaryPath, content, function (err) {
      if (err) {
        return cb(err);
      }

      return cb();
    });
  }

  if (type == "sourcefile") {
    var fullPath = path.join(projectDir, filename);
    var dirName = path.dirname(filename);

    return mkdirp(path.join(outputDir, dirName), function (err) {
      if (err) {
        return cb(err);
      }

      return fs.readFile(path.join(fullPath), function (err, buff) {
        var content = "<!DOCTYPE html>\n" +
              react.renderToStaticMarkup(FlowCoverageHTMLReport({
                coverageGeneratedAt: coverageGeneratedAt,
                reportType: type,
                fileName: filename, fileContent: buff, coverageData: data,
                summaryRelLink: path.relative(path.dirname(filename), "index.html"),
                assets: {
                  "css": [
                    path.relative(path.dirname(filename), "semantic.min.css"),
                    path.relative(path.dirname(filename), "codemirror.css"),
                    path.relative(path.dirname(filename), "flow-highlight-source.css"),
                    path.relative(path.dirname(filename), "flow-coverage-report.css"),
                    path.relative(path.dirname(filename), "codemirror-simplescrollbars-addon.css"),
                  ],
                  "js": [
                    path.relative(path.dirname(filename), "jquery-3.1.0.min.js"),
                    path.relative(path.dirname(filename), "semantic.min.js"),
                    path.relative(path.dirname(filename), "semantic-tablesort.js"),
                    path.relative(path.dirname(filename), "codemirror.js"),
                    path.relative(path.dirname(filename), "codemirror-javascript-mode.js"),
                    path.relative(path.dirname(filename), "codemirror-annotatescrollbar-addon.js"),
                    path.relative(path.dirname(filename), "codemirror-simplescrollbars-addon.js"),
                    path.relative(path.dirname(filename), "flow-highlight-source.js")
                  ]
                }
              }));

        fs.writeFile(path.join(outputDir, filename)+".html", content, function (err) {
          if (err) {
            return cb(err);
          }

          return cb();
        });
      });
    });
  }

  return cb(new Error("Unknown report type: " + type));
}

function generateFlowCoverageReport(
  flowCommandPath, projectDir, globIncludePattern, outputDir
) {
  checkFlowStatus(flowCommandPath, projectDir, function(err) {
    if (err) {
      throw err;
    }

    if (!outputDir) {
      outputDir = path.join(projectDir, "flow-coverage");
    }

    var now = new Date();
    var coverageGeneratedAt = now.toDateString() + " " + now.toTimeString();

    glob(
      globIncludePattern,
      {cwd: projectDir, root: projectDir},
      function (err, files) {
        if (err) {
          throw err;
        }

        var coverageSummaryData = {
          covered_count: 0, uncovered_count: 0,
          files: {}
        };

        Promise.all(
          files.map(
            function (filename) {
              return new Promise(function (resolve, reject) {
                generateFlowCoverageForFile(
                  flowCommandPath, projectDir, filename, function (err, data) {
                    if (err) {
                      reject(err);
                      return;
                    }

                    coverageSummaryData.covered_count += data.expressions.covered_count;
                    coverageSummaryData.uncovered_count += data.expressions.uncovered_count;
                    coverageSummaryData.files[filename] = {
                      covered_count: data.expressions.covered_count,
                      uncovered_count: data.expressions.uncovered_count,
                    };

                    renderHTMLReport(
                      "sourcefile", coverageGeneratedAt, projectDir, filename, data, outputDir,
                      function (err) {
                        if (err) {
                          return reject(err);
                        }

                        return resolve(filename);
                      }
                    );
                  });
              });
            }
          )
        ).then(function (filenames) {
          var generateSummary = new Promise(function (resolve, reject) {
            renderHTMLReport(
              "summary", coverageGeneratedAt, projectDir, null, coverageSummaryData, outputDir,
              function (err) {
                if (err) {
                  return reject(err);
                }

                return resolve();
              }
            );
          });

          function copyAsset(assetName) {
            return new Promise(function(resolve, reject) {
              fs.readFile(
                path.join(__dirname, "assets", assetName),
                function (err, data) {
                  if (err) {
                    reject(err);
                  } else {
                    mkdirp(path.join(outputDir, path.dirname(assetName)), function (err) {
                      if (err) {
                        reject(err);
                      } else {
                        fs.writeFile(
                          path.join(outputDir, assetName),
                          data,
                          function (err) {
                            if (err) {
                              reject(err);
                            }
                            resolve();
                          }
                        );
                      }
                    });
                  }
                });
            });
          }

          var copyCodeMirrorAssets = Promise.all(
            [
              "jquery-3.1.0.min.js",
              "semantic.min.js",
              "semantic.min.css",
              "semantic-tablesort.js",
              "index.js",
              "codemirror.js",
              "codemirror.css",
              "codemirror-javascript-mode.js",
              "codemirror-annotatescrollbar-addon.js",
              "codemirror-simplescrollbars-addon.js",
              "codemirror-simplescrollbars-addon.css",
              "flow-highlight-source.js",
              "flow-highlight-source.css",
              "flow-coverage-report.css",
            ].concat(
              [
                ["themes", "default", "assets", "images", "flags.png"],
                ["themes", "default", "assets", "fonts", "icons.eot"],
                ["themes", "default", "assets", "fonts", "icons.otf"],
                ["themes", "default", "assets", "fonts", "icons.svg"],
                ["themes", "default", "assets", "fonts", "icons.ttf"],
                ["themes", "default", "assets", "fonts", "icons.woff"],
                ["themes", "default", "assets", "fonts", "icons.woff2"],
              ].map(function (el) {
                return path.join.apply(null, el);
              })
            ).map(copyAsset)
          );
          return Promise.all([
            generateSummary,
            copyCodeMirrorAssets,
          ]);
        }).catch(function (e) {
          console.error("ERROR", e, e.stack);
        });
      }
    );
  });
}

generateFlowCoverageReport("~/Applications/flow/flow", process.argv[2], process.argv[3]);
