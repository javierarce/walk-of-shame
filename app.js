function getCurrentDate() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!

  var yyyy = today.getFullYear();
  if(dd<10){
    dd='0'+dd;
  } 
  if(mm<10){
    mm='0'+mm;
  } 
  return yyyy+'-'+mm+'-'+dd;
}

function addGraph(w, h) {

  var margin = { top: 15, right: 5, bottom: 25, left: 40 };
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

    var barWidth = width/data.length;

    y.domain([0, d3.max(data, function(d) { return d.steps; } )]);

    var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5);

    chart.append("g")
    .attr("class", "y axis")
    .call(yAxis);

    // Draw Y-axis grid lines
    chart.selectAll("line.y")
    .data(y.ticks(5))
    .enter().append("line")
    .attr("class", "y")
    .attr("x1", 5)
    .attr("x2", width + 5)
    .attr("y1", y)
    .attr("y2", y);

    var label = chart.append("text")
    .attr("x", 0)
    .attr("y", height)
    .attr("dy", "1.5em")
    .attr("font-size", ".7em")
    .attr("font-style", "italic")
    .text("Number of steps per day. The red bar indicates the current day.");

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
    .attr("transform", function(d, i) { return "translate(" + (5 + i * barWidth) + ", 0 )"; })
    .attr("y", function(d){  return height; })
    .attr("height", 0)
    .attr("width", barWidth - 1);

    bar.transition()
    .ease("quad")
    .duration(function(d, i) { return 200; })
    .delay(function(d, i) { return i*100 })
    .attr("height", function(d) { return d.steps ? height - y(d.steps) : 0; })
    .attr("y", function(d){ return d.steps ? y(d.steps) : height; });
  });
}


window.onload = function() {
  addGraph(600, 300);
}
