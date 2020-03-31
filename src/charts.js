var numberFormatter = d3.format(",");
var dateFormatter = d3.timeFormat("%m/%d");
var changeFormatter = function (n) {
  if (n < 0) return "-" + numberFormatter(n)
  if (n > 0) return "+" + numberFormatter(n)
  return " " + numberFormatter(n)
}

function renderInlineLatest(selector, data, attribute) {
  return d3.select(selector)
    .datum(data[data.length-1][attribute])
    .text(numberFormatter)
}

function renderInlineDelta(selector, data, attribute) {
  let current = data[data.length-1];
  let previous = data[data.length-2];

  return d3.select(selector)
    .datum(current[attribute] - previous[attribute])
    .text(numberFormatter)
}

function renderCaseChart(svg, reports, attribute) {
  let chart = svg;
  let width = 700;
  let height = 400;
  let day0 = reports[0];
  let today = reports[reports.length - 1];
  let margin = { left: 15, right: 45, bottom: 45, top: 15 };
  let access = (report) => report[attribute];

  let yScale = d3.scaleLinear()
    .domain([0, today[attribute]])
    .range([height - margin.bottom, margin.top])
    .nice()

  let xScale = d3.scaleTime()
    .domain([day0.date, today.date])
    .range([margin.left, width - margin.right])

  let xAxis = d3.axisBottom(xScale)
    .ticks(d3.timeDay.every(1))
    .tickFormat(dateFormatter)

  let yAxis = d3.axisRight(yScale);

  let area = d3.area()
    .curve(d3.curveLinear)
    .x(report => xScale(report.date))
    .y0(yScale(0))
    .y1(report => yScale(access(report)))

  let line = d3.line()
    .defined(report => !isNaN(access(report)))
    .x(report => xScale(report.date))
    .y(report => yScale(access(report)))

  chart.attr("viewBox", [0, 0, width, height])

  chart.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(xAxis)
    .attr("font-family", "")
    .attr("class", "numeral")
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");


  chart.append("g")
    .attr("transform", `translate(${width - margin.right}, 0)`)
    .call(yAxis)
    .attr("font-family", "")
    .attr("class", "numeral")

  chart.append("path")
    .datum(reports)
    .attr("class", "case-area")
    .attr("d", area);

  chart.selectAll("rect")
    .data(reports)
    .enter()
    .append("rect")
    .attr("class", "case-bar")
    .attr("x", report => xScale(report.date))
    .attr("y", (report, i) => {
      if (i === 0) return yScale(access(report))
      return yScale(access(report) - access(reports[i - 1]))
    })
    .attr("height", (report, i) => {
      if (i === 0) return yScale(0) - yScale(access(report))
      return yScale(0) - yScale(access(report) - access(reports[i - 1]))
    })
    .attr("width", "1"); //xscale.bandwidth() ??

  chart.append("path")
    .datum(reports)
    .attr("class", "case-line")
    .attr("d", line)
}

function renderStackedCaseChart({chartSelector, data, attributes, colors}) {
  let svg = d3.select(chartSelector);
  let width = 700;
  let height = 400;
  let margin = { left: 15, right: 45, bottom: 45, top: 15 };

  let series = d3.stack().keys(attributes)(data)
  let xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([margin.left, width - margin.right])

  let yScale = d3.scaleLinear()
    .domain([0, d3.max(series, d => d3.max(d, d => d[1]))]).nice()
    .range([height - margin.bottom, margin.top])

  let xAxis = g => {
    let axis = d3.axisBottom(xScale)
      .ticks(d3.timeDay.every(1))
      .tickFormat(dateFormatter)

    return g.attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(axis)
      .attr("font-family", "")
      .attr("class", "numeral")
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");
  }

  let yAxis = g => {
    let axis = d3.axisRight(yScale);

    return g
      .attr("transform", `translate(${width - margin.right}, 0)`)
      .call(axis)
      .selectAll("text")
        .attr("class", "numeral")
  }

  let area = d3.area()
    .x(d => xScale(d.data.date))
    .y0(d => yScale(d[0]))
    .y1(d => yScale(d[1]))

  svg.attr("viewBox", [0, 0, width, height])

  svg.append("g")
    .call(xAxis)

  svg.append("g")
    .call(yAxis)

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
}
