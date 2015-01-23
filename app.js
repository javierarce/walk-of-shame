function getCurrentDate() {

  var today = new Date();
  var dd    = today.getDate();
  var mm    = today.getMonth() + 1; //January is 0!

  var yyyy  = today.getFullYear();

  if (dd < 10) {
    dd = '0' + dd;
  }

  if (mm < 10) {
    mm = '0' + mm;
  }

  return yyyy + '-' + mm + '-' + dd;
}

function addGraph(w, h) {

  var margin = { top: 15, right: 5, bottom: 25, left: 45 };
  var width  = w - margin.left - margin.right;
  var height = h - margin.top - margin.bottom;

  var y = d3.scale.linear()
  .range([height, 0]);

  var chart = d3.select(".chart")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.json("http://monitor.javierarce.com/api/month", function(error, json) {
    if (error) return console.warn(error);

    data = json.slice(0, 15);

    var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S+01:00").parse;
    var xExtent   = d3.extent(data, function(d) { return parseDate(d.created_at); });
    var nxExtent = [xExtent[0], xExtent[1]];

    var barWidth = width/data.length;

    var x = d3.time.scale()
    .domain(nxExtent)
    .range([0, width - barWidth - 1]);

    y.domain([0, d3.max(data, function(d) { return d.steps; } )]);

    var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5);

    chart.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + -5 + ",0)")
    .call(yAxis);

    var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(d3.time.days,1)
    .tickFormat(d3.time.format("%d/%m"))
    .orient("bottom");

    chart.append("g")
    .attr("class", "x axis")
    .call(xAxis);

    var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return d.steps + " steps";
    });

    chart.call(tip);

    chart.selectAll(".x.axis ")  // select all the text elements for the xaxis
    .attr("transform", function(d, i) {
      return "translate(" + barWidth/2 + ", " + height + ")";
    });

    // Draw Y-axis grid lines
    chart.selectAll("line.y")
    .data(y.ticks(5))
    .enter().append("line")
    .attr("class", "y")
    .attr("x1", 5)
    .attr("x2", width + 5)
    .attr("y1", y)
    .attr("y2", y);

    var bar = chart.selectAll(".bar")
    .data(data.reverse())
    .enter()
    .append("rect")
    .attr("class", function(d) {
      var date = d.created_at.split("T")[0];
      if (date == getCurrentDate()) {
        return "bar today";
      } else {
        return "bar";
      }
    })
    .attr("transform", function(d, i) { return "translate(" + (i * barWidth) + ", 0 )"; })
    .attr("y", function(d){  return height; })
    .attr("height", 0)
    .attr("width", barWidth - 1);

    bar.transition()
    .ease("quad")
    .duration(function(d, i) { return 200; })
    .delay(function(d, i) { return i*100 })
    .attr("height", function(d) { return d.steps ? height - y(d.steps) : 0; })
    .attr("y", function(d){ return d.steps ? y(d.steps) : height; });

    bar
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);

    var median = d3.median(data, function(d) { return d.steps; });

    chart.append("line")
    .attr("class", "median")
    .attr("x1", 0)
    .attr("y1", y(median))
    .attr("y2", y(median))
    .attr("x2", width);

    chart.append("text")
    .attr("class", "median-label")
    .attr("x", width)
    .attr("y", y(median))
    .attr("dy", "-0.5em")
    .style("text-anchor","end") 
    .attr("startOffset","100%")
    .text("Median: " + median);

  });
}


window.onload = function() {
  addGraph(900, 300);
}
