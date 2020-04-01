var numberFormatter = d3.format(",");
var dateFormatter = d3.timeFormat("%m/%d");
var changeFormatter = function (n) {
  if (n < 0) return "-" + numberFormatter(n)
  if (n > 0) return "+" + numberFormatter(n)
  return " " + numberFormatter(n)
}

function renderInlineLatest(selector, data, attribute, formatter) {
  formatter = formatter || numberFormatter
  return d3.select(selector)
    .datum(data[data.length - 1][attribute])
    .text(formatter)
}

function renderInlineDelta(selector, data, attribute, formatter) {
  formatter = formatter || numberFormatter
  let current = data[data.length - 1];
  let previous = data[data.length - 2];

  return d3.select(selector)
    .datum(current[attribute] - previous[attribute])
    .text(formatter)
}

function renderStackedChart({ chartSelector, data, attributes, colors }) {
  let svg = d3.select(chartSelector);
  let width = 700;
  let height = 400;
  let margin = { left: 28, right: 55, bottom: 55, top: 15 };

  let series = d3.stack().keys(attributes)(data)
  let xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([margin.left, width - margin.right])

  let yScale = d3.scaleLinear()
    .domain([0, d3.max(series, d => d3.max(d, d => d[1]))]).nice()
    .range([height - margin.bottom, margin.top])

  let xAxis = g => {
    let [min, max] = xScale.domain()
    let step = Math.max(1, data.length / 10);
    let tickValues = d3.timeDay.range(min, max, step)

    if (tickValues[tickValues.length - 1] !== max) {
      tickValues.push(max)
    }
    let axis = d3.axisBottom(xScale)
      .tickValues(tickValues)
      .tickFormat(dateFormatter)

    return g.attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(axis)
      .selectAll("text")
      .attr("class", "axis-text numeral")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");
  }

  let yAxis = g => {
    let axis = d3.axisRight(yScale).ticks(8);

    return g
      .attr("transform", `translate(${width - margin.right}, 0)`)
      .call(axis)
      .selectAll("text")
      .attr("class", "axis-text numeral")
  }

  let area = d3.area()
    .x(d => xScale(d.data.date))
    .y0(d => yScale(d[0]))
    .y1(d => yScale(d[1]))

  svg.attr("viewBox", [0, 0, width, height])


  svg.append("g")
    .selectAll("path")
    .data(series)
    .join("path")
    .attr("fill", ({ key }) => colors[key].area)
    .attr("d", area)
    .append("title")
    .text(({ key }) => key);

  svg.append("g")
    .selectAll("path")
    .data(series)
    .join("path")
    .attr("class", "case-line")
    .attr("stroke", ({ key }) => colors[key].line)
    .attr("d", area.lineY1())

  svg.append("g")
    .call(xAxis)

  svg.append("g")
    .call(yAxis)
}

function renderOpposingChart({ chartSelector, data, positiveAttributes, negativeAttributes, colors }) {
  let svg = d3.select(chartSelector);
  let width = 700;
  let height = 400;
  let margin = { left: 28, right: 55, bottom: 55, top: 15 };

  let positiveSeries = d3.stack().keys(positiveAttributes)(data)
  let negativeSeries = d3.stack().keys(negativeAttributes)(data)
  let fullSeries = positiveSeries.concat(negativeSeries)

  let xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([margin.left, width - margin.right])

  let yPositiveScale = d3.scaleLinear()
    .domain([0, d3.max(fullSeries, d => d3.max(d, d => d[1]))]).nice()
    .range([height / 2, margin.top])

  let yNegativeScale = d3.scaleLinear()
    .domain([0, d3.max(fullSeries, d => d3.max(d, d => d[1]))]).nice()
    .range([(height / 2), height - margin.bottom])

  let xAxis = g => {
    let [min, max] = xScale.domain()
    let step = Math.max(1, data.length / 10);
    let tickValues = d3.timeDay.range(min, max, step)

    if (tickValues[tickValues.length - 1] !== max) {
      tickValues.push(max)
    }
    let axis = d3.axisBottom(xScale)
      .tickValues(tickValues)
      .tickFormat(dateFormatter)

    g.append("g").attr("transform", `translate(0,-1)`)
      .selectAll("line")
      .data(xScale.ticks())
      .join("line")
      .attr("class", "chart-gridline")
      .attr("x1", d => 0.5 + xScale(d))
      .attr("x2", d => 0.5 + xScale(d))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)


    g.append("g").attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(axis)
      .selectAll("text")
      .attr("class", "axis-text numeral")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");
  }

  let yPositiveAxis = g => {
    let axis = d3.axisRight(yPositiveScale).ticks(8);

    return g
      .attr("transform", `translate(${width - margin.right}, 0)`)
      .call(axis)
      .selectAll("text")
      .attr("class", "axis-text numeral")
  }

  let yNegativeAxis = g => {
    let axis = d3.axisRight(yNegativeScale).ticks(8);

    return g
      .attr("transform", `translate(${width - margin.right}, 0)`)
      .call(axis)
      .selectAll("text")
      .attr("class", "axis-text numeral")
  }

  let positiveArea = d3.area()
    .x(d => xScale(d.data.date))
    .y0(d => yPositiveScale(d[0]))
    .y1(d => yPositiveScale(d[1]))

  let negativeArea = d3.area()
    .x(d => xScale(d.data.date))
    .y0(d => yNegativeScale(d[0]))
    .y1(d => yNegativeScale(d[1]))

  svg.attr("viewBox", [0, 0, width, height])


  svg.append("g")
    .selectAll("path")
    .data(positiveSeries)
    .join("path")
    .attr("fill", ({ key }) => colors[key].area)
    .attr("d", positiveArea)
    .append("title")
    .text(({ key }) => key);

  svg.append("g")
    .selectAll("path")
    .data(positiveSeries)
    .join("path")
    .attr("class", "case-line")
    .attr("stroke", ({ key }) => colors[key].line)
    .attr("d", positiveArea.lineY1())

  svg.append("g")
    .selectAll("path")
    .data(negativeSeries)
    .join("path")
    .attr("fill", ({ key }) => colors[key].area)
    .attr("d", negativeArea)
    .append("title")
    .text(({ key }) => key);

  svg.append("g")
    .selectAll("path")
    .data(negativeSeries)
    .join("path")
    .attr("class", "case-line")
    .attr("stroke", ({ key }) => colors[key].line)
    .attr("d", negativeArea.lineY1())

  svg.append("g")
    .call(xAxis)

  svg.append("g")
    .call(yPositiveAxis)

  svg.append("g")
    .call(yNegativeAxis)
}
