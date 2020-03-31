"use strict";

var numberFormatter = d3.format(",");
var dateFormatter = d3.timeFormat("%m/%d");

var changeFormatter = function changeFormatter(n) {
  if (n < 0) return "-" + numberFormatter(n);
  if (n > 0) return "+" + numberFormatter(n);
  return " " + numberFormatter(n);
};

function renderInlineLatest(selector, data, attribute) {
  return d3.select(selector).datum(data[data.length - 1][attribute]).text(numberFormatter);
}

function renderInlineDelta(selector, data, attribute) {
  var current = data[data.length - 1];
  var previous = data[data.length - 2];
  return d3.select(selector).datum(current[attribute] - previous[attribute]).text(numberFormatter);
}

function renderStackedCaseChart(_ref) {
  var chartSelector = _ref.chartSelector,
      data = _ref.data,
      attributes = _ref.attributes,
      colors = _ref.colors;
  var svg = d3.select(chartSelector);
  var width = 700;
  var height = 400;
  var margin = {
    left: 20,
    right: 55,
    bottom: 55,
    top: 15
  };
  var series = d3.stack().keys(attributes)(data);
  var xScale = d3.scaleTime().domain(d3.extent(data, function (d) {
    return d.date;
  })).range([margin.left, width - margin.right]);
  var yScale = d3.scaleLinear().domain([0, d3.max(series, function (d) {
    return d3.max(d, function (d) {
      return d[1];
    });
  })]).nice().range([height - margin.bottom, margin.top]);

  var xAxis = function xAxis(g) {
    var axis = d3.axisBottom(xScale).ticks(d3.timeDay.every(1)).tickFormat(dateFormatter);
    return g.attr("transform", "translate(0, ".concat(height - margin.bottom, ")")).call(axis).selectAll("text").attr("class", "axis-text").style("text-anchor", "end").attr("dx", "-.8em").attr("dy", ".15em").attr("transform", "rotate(-65)");
  };

  var yAxis = function yAxis(g) {
    var axis = d3.axisRight(yScale).ticks(8);
    return g.attr("transform", "translate(".concat(width - margin.right, ", 0)")).call(axis).selectAll("text").attr("class", "axis-text");
  };

  var area = d3.area().x(function (d) {
    return xScale(d.data.date);
  }).y0(function (d) {
    return yScale(d[0]);
  }).y1(function (d) {
    return yScale(d[1]);
  });
  svg.attr("viewBox", [0, 0, width, height]);
  svg.append("g").call(xAxis);
  svg.append("g").call(yAxis);
  svg.append("g").selectAll("path").data(series).join("path").attr("fill", function (_ref2) {
    var key = _ref2.key;
    return colors[key].area;
  }).attr("d", area).append("title").text(function (_ref3) {
    var key = _ref3.key;
    return key;
  });
  svg.append("g").selectAll("path").data(series).join("path").attr("class", "case-line").attr("stroke", function (_ref4) {
    var key = _ref4.key;
    return colors[key].line;
  }).attr("d", area.lineY1());
}