function renderCasesTable(selector, reports) {
  let reportsDescending = reports.slice().reverse()
  let rows = d3.select(selector)
    .selectAll("tbody > tr")
      .data(reportsDescending)
      .enter()
      .append("tr")

  rows
    .append("td")
    .attr("class", (_, i) => `numeral ${i == 0 ? "cases-first-row" : ""}`)
    .text((report) => d3.timeFormat("%m/%d")(report.date))

  rows.append("td").attr("class", "spacer")

  appendCellsForCaseCategory(rows, reportsDescending, "positive", "positive-case-cell")

  rows.append("td").attr("class", "spacer")

  appendCellsForCaseCategory(rows, reportsDescending, "negative", "negative-case-cell")

  rows.append("td").attr("class", "spacer")

  appendCellsForCaseCategory(rows, reportsDescending, "deaths", "deaths-cell")
}

function appendCellsForCaseCategory(rows, reportsDescending, attribute, className) {
  rows
    .append("td")
    .attr("class", (_,i) => {
      return `numeral case-table-delta ${className} ${i == 0 ? "cases-first-row" : ""}`
    })
    .text(function (report, i) {
      if (i == reportsDescending.length-1) { return 0 }
      return changeFormatter(report[attribute] - reportsDescending[i+1][attribute])
    })

  rows
    .append("td")
    .attr("class", (_,i) => {
      return `numeral case-table-cumulative ${className} ${i == 0 ? "cases-first-row" : ""}`
    })
    .text((report) => d3.format(",")(report[attribute]))
}

function changeFormatter (n) {
  let number = d3.format(",");
  if (n < 0) return "-" + number(n)
  if (n > 0) return "+" + number(n)
  return " " + number(n)
}
