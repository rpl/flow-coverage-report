"use strict";

$(function () {
  Array.prototype.slice.call(
    document.getElementsByClassName('sortable')
  ).forEach(function (table) {
    new Tablesort(table);
  });

  $('td.error .attention.icon').popup({inline: true});
});
