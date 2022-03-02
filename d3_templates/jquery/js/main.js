/*
    Header Here
 */

var margin = { left:80, right:50, top:50, bottom:100 },
height = 400 - margin.top - margin.bottom, 
width = 600 - margin.left - margin.right;

var svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + 
            ", " + margin.top + ")");

var t = function(){ return d3.transition().duration(1000); }

// Add the line for the first time
g.append("path")
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "grey")
    .attr("stroke-width", "3px");

// Labels
var xLabel = g.append("text")
    .attr("class", "x axisLabel")
    .attr("y", height + 50)
    .attr("x", width / 2)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Year");
var yLabel = g.append("text")
    .attr("class", "y axisLabel")
    .attr("transform", "rotate(-90)")
    .attr("y", -60)
    .attr("x", -170)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Colonies Lost")

// Scales
var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// X-axis
var xAxisCall = d3.axisBottom()
    .ticks(5);
var xAxis = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height +")");

// Y-axis
var yAxisCall = d3.axisLeft()
var yAxis = g.append("g")
    .attr("class", "y axis");

g.append("text")
    .attr("x", (width / 2))             
    .attr("y", -30)
    .style("font-size", "16px") 
    .attr("text-anchor", "middle")  
    .style("text-decoration", "underline")  
    .text("American Bee Colony Turnover");

// Set event callbacks and listeners
$("#var-select").on("change", update)

d3.json("data/bees.json").then(function(data){

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    var states = data.map((d) => {return d.state;});
    var unique_states = states.filter(onlyUnique);
    const average = (array) => array.reduce((a,b) => a+b) / array.length;

    filteredData = {}
    for (var state in unique_states) {
        //dataByStates
        dataByStates = data.filter(jsonObject => jsonObject.state == unique_states[state] 
                         && jsonObject.colony_lost != "NA");
        console.log(dataByStates);
        var map = {2015 : [], 2016 : [],2017 : [],2018 : [],2019 : [],2020 : [],2021 : []};
        dataByStates.forEach(function(d){
            var curr_year = d.year;
            map[curr_year].push(d.colony_lost);
        });
        
        var dic = [];
        for(var y in map)
        {
            var colony_lost_average = 0;
            if(map[y].length > 0)
                colony_lost_average = average(map[y]);

            dic.push({"year" : parseInt(y), "colony_lost" : colony_lost_average});
        }
        console.log(dic);
        filteredData[unique_states[state]] = dic;
        
    }

    console.log(filteredData);

    // we do not run d3.interval because we dont have any time-based automated tasks.

    // Run the visualization for the first time
    update();
})

function update() {

    var curr_state = $("#var-select").val();
    console.log(curr_state);
    // Update scales
    x.domain(d3.extent(filteredData[curr_state], function(d){ return d.year; }));
    y.domain(d3.extent(filteredData[curr_state], function(d){ return d.colony_lost; }));

    // Fix for format values
    var formatSi = d3.format(".2s");
    function formatAbbreviation(x) {
      var s = formatSi(x);
      switch (s[s.length - 1]) {
        case "G": return s.slice(0, -1) + "B";
        case "k": return s.slice(0, -1) + "K";
      }
      return s;
    }

    // Update axes
    xAxisCall.scale(x);
    xAxis.transition(t()).call(xAxisCall);
    yAxisCall.scale(y);
    yAxis.transition(t()).call(yAxisCall.tickFormat(formatAbbreviation));

    // Clear old tooltips
    d3.select(".focus").remove();
    d3.select(".overlay").remove();

    // Tooltip code
    var focus = g.append("g")
        .attr("class", "focus")
        .style("display", "none");
    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", height);
    focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", 0)
        .attr("x2", width);
    focus.append("circle")
        .attr("r", 5);
    focus.append("text")
        .attr("x", 15)
        .attr("dy", ".31em");
    svg.append("rect")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); });

    // Path generator
    line = d3.line()
        .x(function(d){ return x(d.year); })
        .y(function(d){ return y(d.colony_lost); });

    // Update our line path
    g.select(".line")
        .transition(t)
        .attr("d", line(filteredData[curr_state]));

}



