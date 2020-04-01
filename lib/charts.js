"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var numberFormatter = d3.format(",");
var dateFormatter = d3.timeFormat("%m/%d");

var changeFormatter = function changeFormatter(n) {
  if (n < 0) return "-" + numberFormatter(n);
  if (n > 0) return "+" + numberFormatter(n);
  return " " + numberFormatter(n);
};

function renderInlineLatest(selector, data, attribute, formatter) {
  formatter = formatter || numberFormatter;
  return d3.select(selector).datum(data[data.length - 1][attribute]).text(formatter);
}

function renderInlineDelta(selector, data, attribute, formatter) {
  formatter = formatter || numberFormatter;
  var current = data[data.length - 1];
  var previous = data[data.length - 2];
  return d3.select(selector).datum(current[attribute] - previous[attribute]).text(formatter);
}

function renderStackedChart(_ref) {
  var chartSelector = _ref.chartSelector,
      data = _ref.data,
      attributes = _ref.attributes,
      colors = _ref.colors;
  var svg = d3.select(chartSelector);
  var width = 700;
  var height = 400;
  var margin = {
    left: 28,
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
    var _xScale$domain = xScale.domain(),
        _xScale$domain2 = _slicedToArray(_xScale$domain, 2),
        min = _xScale$domain2[0],
        max = _xScale$domain2[1];

    var step = Math.max(1, data.length / 10);
    var tickValues = d3.timeDay.range(min, max, step);

    if (tickValues[tickValues.length - 1] !== max) {
      tickValues.push(max);
    }

    var axis = d3.axisBottom(xScale).tickValues(tickValues).tickFormat(dateFormatter);
    return g.attr("transform", "translate(0, ".concat(height - margin.bottom, ")")).call(axis).selectAll("text").attr("class", "axis-text numeral").style("text-anchor", "end").attr("dx", "-.8em").attr("dy", ".15em").attr("transform", "rotate(-45)");
  };

  var yAxis = function yAxis(g) {
    var axis = d3.axisRight(yScale).ticks(8);
    return g.attr("transform", "translate(".concat(width - margin.right, ", 0)")).call(axis).selectAll("text").attr("class", "axis-text numeral");
  };

  var area = d3.area().x(function (d) {
    return xScale(d.data.date);
  }).y0(function (d) {
    return yScale(d[0]);
  }).y1(function (d) {
    return yScale(d[1]);
  });
  svg.attr("viewBox", [0, 0, width, height]);
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
  svg.append("g").call(xAxis);
  svg.append("g").call(yAxis);
}

function renderOpposingChart(_ref5) {
  var chartSelector = _ref5.chartSelector,
      data = _ref5.data,
      positiveAttributes = _ref5.positiveAttributes,
      negativeAttributes = _ref5.negativeAttributes,
      colors = _ref5.colors;
  var svg = d3.select(chartSelector);
  var width = 700;
  var height = 400;
  var margin = {
    left: 28,
    right: 55,
    bottom: 55,
    top: 15
  };
  var positiveSeries = d3.stack().keys(positiveAttributes)(data);
  var negativeSeries = d3.stack().keys(negativeAttributes)(data);
  var fullSeries = positiveSeries.concat(negativeSeries);
  var xScale = d3.scaleTime().domain(d3.extent(data, function (d) {
    return d.date;
  })).range([margin.left, width - margin.right]);
  var yPositiveScale = d3.scaleLinear().domain([0, d3.max(fullSeries, function (d) {
    return d3.max(d, function (d) {
      return d[1];
    });
  })]).nice().range([height / 2, margin.top]);
  var yNegativeScale = d3.scaleLinear().domain([0, d3.max(fullSeries, function (d) {
    return d3.max(d, function (d) {
      return d[1];
    });
  })]).nice().range([height / 2, height - margin.bottom]);

  var xAxis = function xAxis(g) {
    var _xScale$domain3 = xScale.domain(),
        _xScale$domain4 = _slicedToArray(_xScale$domain3, 2),
        min = _xScale$domain4[0],
        max = _xScale$domain4[1];

    var step = Math.max(1, data.length / 10);
    var tickValues = d3.timeDay.range(min, max, step);

    if (tickValues[tickValues.length - 1] !== max) {
      tickValues.push(max);
    }

    var axis = d3.axisBottom(xScale).tickValues(tickValues).tickFormat(dateFormatter);
    g.append("g").attr("transform", "translate(0,-1)").selectAll("line").data(xScale.ticks()).join("line").attr("class", "chart-gridline").attr("x1", function (d) {
      return 0.5 + xScale(d);
    }).attr("x2", function (d) {
      return 0.5 + xScale(d);
    }).attr("y1", margin.top).attr("y2", height - margin.bottom);
    g.append("g").attr("transform", "translate(0, ".concat(height - margin.bottom, ")")).call(axis).selectAll("text").attr("class", "axis-text numeral").style("text-anchor", "end").attr("dx", "-.8em").attr("dy", ".15em").attr("transform", "rotate(-45)");
  };

  var yPositiveAxis = function yPositiveAxis(g) {
    var axis = d3.axisRight(yPositiveScale).ticks(8);
    return g.attr("transform", "translate(".concat(width - margin.right, ", 0)")).call(axis).selectAll("text").attr("class", "axis-text numeral");
  };

  var yNegativeAxis = function yNegativeAxis(g) {
    var axis = d3.axisRight(yNegativeScale).ticks(8);
    return g.attr("transform", "translate(".concat(width - margin.right, ", 0)")).call(axis).selectAll("text").attr("class", "axis-text numeral");
  };

  var positiveArea = d3.area().x(function (d) {
    return xScale(d.data.date);
  }).y0(function (d) {
    return yPositiveScale(d[0]);
  }).y1(function (d) {
    return yPositiveScale(d[1]);
  });
  var negativeArea = d3.area().x(function (d) {
    return xScale(d.data.date);
  }).y0(function (d) {
    return yNegativeScale(d[0]);
  }).y1(function (d) {
    return yNegativeScale(d[1]);
  });
  svg.attr("viewBox", [0, 0, width, height]);
  svg.append("g").selectAll("path").data(positiveSeries).join("path").attr("fill", function (_ref6) {
    var key = _ref6.key;
    return colors[key].area;
  }).attr("d", positiveArea).append("title").text(function (_ref7) {
    var key = _ref7.key;
    return key;
  });
  svg.append("g").selectAll("path").data(positiveSeries).join("path").attr("class", "case-line").attr("stroke", function (_ref8) {
    var key = _ref8.key;
    return colors[key].line;
  }).attr("d", positiveArea.lineY1());
  svg.append("g").selectAll("path").data(negativeSeries).join("path").attr("fill", function (_ref9) {
    var key = _ref9.key;
    return colors[key].area;
  }).attr("d", negativeArea).append("title").text(function (_ref10) {
    var key = _ref10.key;
    return key;
  });
  svg.append("g").selectAll("path").data(negativeSeries).join("path").attr("class", "case-line").attr("stroke", function (_ref11) {
    var key = _ref11.key;
    return colors[key].line;
  }).attr("d", negativeArea.lineY1());
  svg.append("g").call(xAxis);
  svg.append("g").call(yPositiveAxis);
  svg.append("g").call(yNegativeAxis);
}