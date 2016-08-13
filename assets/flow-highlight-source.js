$(function() {
  // Convert the text area into a CodeMirror area in readOnly mode.
  var cm = CodeMirror.fromTextArea(document.querySelector("textarea"), {
    readOnly: true,
    lineNumbers: true,
    mode: "text/typescript",
    scrollbarStyle: "simple",
    gutters: [
      "Flow-lineuncovered",
      "CodeMirror-linenumbers"
    ]
  });

  // TODO: handle corrupted coverage data?
  var coverageData = JSON.parse(document.querySelector("#file-coverage-data").textContent);
  var uncoveredLocs = coverageData.expressions.uncovered_locs;

  // Create uncovered range markers.
  for (var loc of uncoveredLocs) {
    cm.markText(
      {line: loc.start.line - 1, ch: loc.start.column - 1},
      {line: loc.end.line - 1, ch: loc.end.column},
      {
        className: "cm-flow-uncovered",
      }
    );
  }

  // Create uncovered ranges scrollbar annotations.
  var scrollbarAnnotations = cm.annotateScrollbar({
    className: "cm-flow-uncovered",
    listenForUpdates: false,
  });

  scrollbarAnnotations.update(uncoveredLocs.map(function (loc) {
    return {
      from: {line: loc.start.line - 1, ch: loc.start.column -1},
      to: {line: loc.end.line - 1, ch: loc.start.column},
    };
  }));

  // Create the line gutters.
  for (var i = 0; i < cm.lineCount(); i++) {
    var count = uncoveredLocs.reduce(function (acc, loc) {
      if (i >= loc.start.line - 1 && i <= loc.end.line - 1) {
        acc += 1;
      }

      return acc;
    }, 0);

    if (count > 0) {
      var el = document.createElement("div");
      el.textContent =  count + "x";
      el.style.textAlign = "center";
      el.style.fontSize = "0.6em";
      var color = "rgba(255,0,0," + count * 0.2 + ")";
      el.style.background = color;
      cm.setGutterMarker(i, "Flow-lineuncovered", el);
    }
  }

  // Refresh the uncovered range markers background alpha
  // (number of time the marker span appears in an uncovered range * alpha step).
  CodeMirror.on(cm, "viewportChange", function(cm, marker){
    for (var el of document.querySelectorAll(".cm-flow-uncovered")) {
      var count = Array.from(el.classList).filter(function (cls) {
        if (cls !== "cm-flow-uncovered") {
          return false;
        }
        return true;
      }).length;
      var color = "rgba(255,0,0," + count * 0.2 + ")";
      el.style.background = color;
    }
  });

  // Configure the dropdowns

  $('.ui.dropdown.uncovered-locations')
    .dropdown({
      action: 'hide',
      onChange: function (value) {
        if (value == "") {
          return;
        }
        $('.ui.dropdown.uncovered-locations').dropdown('set value', "");
        cm.scrollIntoView({line: parseInt(value)}, 150);
      }
    });

  $('.ui.dropdown.syntax-highlighting')
    .dropdown({
      onChange: function (value) {
        var mode = "typescript";

        switch (value) {
        case "es":
          mode = "text/typescript";
          break;
        case "js":
          mode = "javascript";
          break;
        default:
          mode = "";
        }

        console.log("SET MODE", mode);
        cm.setOption("mode", mode);
      }
    });
});
