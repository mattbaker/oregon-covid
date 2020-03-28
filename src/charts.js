function renderCaseChart(svg, reports, attribute) {
  let chart = svg;
  let width = 700;
  let height = 400;
  let day0 = reports[0];
  let today = reports[reports.length - 1];
  let margin = { left: 15, right: 45, bottom: 45, top: 45 };
  let dateFormatter = d3.timeFormat("%m/%d");
  let access = (report) => report[attribute];

  let yScale = d3.scaleLinear()
    .domain([0, today[attribute]])
    .range([height - margin.bottom, margin.top])

  let xScale = d3.scaleTime()
    .domain([day0.date, today.date])
    .range([margin.left, width - margin.right])

  chart.attr("viewBox", [0, 0, width, height])

  let xAxis = d3.axisBottom(xScale)
    .ticks(d3.timeDay.every(1))
    .tickFormat(dateFormatter)

  let yAxis = d3.axisRight(yScale);

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


  let curve = d3.curveLinear
  let area = d3.area()
    .curve(curve)
    .x(report => xScale(report.date))
    .y0(yScale(0))
    .y1(report => yScale(access(report)))

  let line = d3.line()
    .defined(report => !isNaN(access(report)))
    .x(report => xScale(report.date))
    .y(report => yScale(access(report)))


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
