// Table:
// bold last row
// highlight last row? #f3d4402e
// eliding

function renderCasesTable(table, reports, attribute, omitDate) {
  let dateFormatter = d3.timeFormat("%m/%d");
  let access = (report) => report[attribute];

  //todo JOIN??
  let positiveTableRows = table.selectAll("tbody > tr")
    .data(reports)
    .enter()
    .append("tr")

  if (!omitDate) {
    positiveTableRows
      .append("td")
      .attr("class", ["case-table-date"])
      .text((report) => dateFormatter(report.date))
  }

  positiveTableRows
    .append("td")
    .attr("class", ["numeral case-table-delta"])
    .text(function (report, i) {
      if (i == 0) { return 0 }
      return changeFormatter(access(report) - access(reports[i-1]))
    })

  positiveTableRows
    .append("td")
    .attr("class", ["numeral case-table-cumulative"])
    .text((report) => d3.format(",")(access(report)))
}

function changeFormatter (n) {
  let number = d3.format(",");
  if (n < 0) return "-" + number(n)
  if (n > 0) return "+" + number(n)
  return " " + number(n)
}
