"use strict";

function renderCaseChart(svg, reports, attribute) {
  var chart = svg;
  var width = 700;
  var height = 400;
  var day0 = reports[0];
  var today = reports[reports.length - 1];
  var margin = {
    left: 15,
    right: 45,
    bottom: 45,
    top: 45
  };
  var dateFormatter = d3.timeFormat("%m/%d");

  var access = function access(report) {
    return report[attribute];
  };

  var yScale = d3.scaleLinear().domain([0, today[attribute]]).range([height - margin.bottom, margin.top]);
  var xScale = d3.scaleTime().domain([day0.date, today.date]).range([margin.left, width - margin.right]);
  chart.attr("viewBox", [0, 0, width, height]);
  var xAxis = d3.axisBottom(xScale).ticks(d3.timeDay.every(1)).tickFormat(dateFormatter);
  var yAxis = d3.axisRight(yScale);
  chart.append("g").attr("transform", "translate(0, ".concat(height - margin.bottom, ")")).call(xAxis).attr("font-family", "").attr("class", "numeral").selectAll("text").style("text-anchor", "end").attr("dx", "-.8em").attr("dy", ".15em").attr("transform", "rotate(-65)");
  chart.append("g").attr("transform", "translate(".concat(width - margin.right, ", 0)")).call(yAxis).attr("font-family", "").attr("class", "numeral");
  var curve = d3.curveLinear;
  var area = d3.area().curve(curve).x(function (report) {
    return xScale(report.date);
  }).y0(yScale(0)).y1(function (report) {
    return yScale(access(report));
  });
  var line = d3.line().defined(function (report) {
    return !isNaN(access(report));
  }).x(function (report) {
    return xScale(report.date);
  }).y(function (report) {
    return yScale(access(report));
  });
  chart.append("path").datum(reports).attr("class", "case-area").attr("d", area);
  chart.selectAll("rect").data(reports).enter().append("rect").attr("class", "case-bar").attr("x", function (report) {
    return xScale(report.date);
  }).attr("y", function (report, i) {
    if (i === 0) return yScale(access(report));
    return yScale(access(report) - access(reports[i - 1]));
  }).attr("height", function (report, i) {
    if (i === 0) return yScale(0) - yScale(access(report));
    return yScale(0) - yScale(access(report) - access(reports[i - 1]));
  }).attr("width", "1"); //xscale.bandwidth() ??

  chart.append("path").datum(reports).attr("class", "case-line").attr("d", line);
}