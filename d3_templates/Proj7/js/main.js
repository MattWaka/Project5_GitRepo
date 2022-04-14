/*
    Header Here
 */


var margin = { left:80, right:100, top:50, bottom:100 },
height = 500 - margin.top - margin.bottom, 
width = 800 - margin.left - margin.right;

var svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + 
            ", " + margin.top + ")");

var t = function(){ return d3.transition().duration(1000); }

var parseTime = d3.timeParse("%d/%m/%Y");
var formatTime = d3.timeFormat("%d/%m/%Y");
var bisectDate = d3.bisector(function(d) { return d.Time; }).left;

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
    .text("Time");
var yLabel = g.append("text")
    .attr("class", "y axisLabel")
    .attr("transform", "rotate(-90)")
    .attr("y", -60)
    .attr("x", -170)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Attacks")

// Scales
var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// X-axis
var xAxisCall = d3.axisBottom()
    .ticks(4);
var xAxis = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height +")");

// Y-axis
var yAxisCall = d3.axisLeft()
var yAxis = g.append("g")
    .attr("class", "y axis");

fileNames = new Array();
data_array = new Array();
max_times = new Array();

setTimeout(loadFileNames, 100);
setTimeout(setUI, 300);
setTimeout(updateDropdownMenu, 500);

function loadFileNames(dir) {
    return new Promise((resolve, reject) => {
        try {
            
            $.ajax({
                url: dir,
                success: function (data) {
                    for(var i = 1; i < $(data).find('li').length; i++){
                        var curr_file = $(data).find('li')[i].textContent;
                        var extension = curr_file.substr((curr_file.lastIndexOf('.') +1));
                        if(extension == 'json')
                            fileNames.push(curr_file);
                     }
                     return resolve(fileNames);
                }
            });
        } catch (ex) {
            return reject(new Error(ex));
        }
    });
}

function updateDropdownMenu() {

    const container = document.querySelector('#var-select');
    const index = fileNames.findIndex(item => "Codebase : " + item == $("#game-select").val());
    
    if(data_array[index] == undefined)
        return; 

    for(k in Object.keys(data_array[index][0]))
    {
        var curr_key = Object.keys(data_array[index][0])[k];
        if(curr_key == "Time" || curr_key == "FIELD7")
            continue;

        var option = document.createElement("option");
        option.value = curr_key;
        option.text = curr_key;

        container.appendChild(option);
    }

    update();

}



loadFileNames('http://localhost:8000/d3_templates/Proj7/data').then((data) => {

    const container = document.querySelector('#game-select');
    
    for(f in data)
    {
        var curr_key = data[f];
        var option = document.createElement("option");
        option.value = "Codebase : " + curr_key;
        option.text = "Codebase : " + curr_key;

        container.appendChild(option);

        d3.json("data/"+curr_key).then(function(filedata){

            var max = 0;
            filedata.forEach(el => {
                if (el['Time'] > max){
                    max = el['Time'];
                }
            });

            max_times.push(Math.ceil(max));
            data_array.push(filedata);
            
        })


    }

    updateDropdownMenu();
 
})
.catch((error) => {
    console.log('Files could not be loaded. please check console for details');
});


function setUI() {
    // Set event callbacks and listeners
    $("#game-select").on("change", function(){
        const removeChilds = (parent) => {
            while (parent.lastChild) {
                parent.removeChild(parent.lastChild);
            }
        };

        const container = document.querySelector('#var-select');
        removeChilds(container);

        const index = fileNames.findIndex(item => "Codebase : " + item == $("#game-select").val());
        
        if(data_array[index] == undefined)
            return; 

        for(k in Object.keys(data_array[index][0]))
        {
            var curr_key = Object.keys(data_array[index][0])[k];
            if(curr_key == "Time" || curr_key == "FIELD7")
                continue;

            var option = document.createElement("option");
            option.value = curr_key;
            option.text = curr_key;

            container.appendChild(option);
        }

        update();
    })
    $("#var-select").on("change", update)

    const index = fileNames.findIndex(item => "Codebase : " + item == $("#game-select").val());
    curr_time = max_times[index];
    // Add jQuery UI slider
    $("#time-slider").slider({
        range: true,
        max: curr_time,
        min: 0,
        step: 0.05, 
        values: [0, curr_time],
        slide: function(event, ui){
            $("#timeLabel1").text(ui.value[0]);
            $("#timeLabel2").text(ui.value[1]);
            update();
        }
    });
}

function update() {

    // Filter data based on selections
    var game = $("#game-select").val(),
        yValue = $("#var-select").val();
        if(yValue == "Giant")
            //console.log(yValue);
        sliderValues = $("#time-slider").slider("values");
    const index = fileNames.findIndex(item => "Codebase : " + item == $("#game-select").val());

    var FilteredData = data_array[index].filter(function(d){
        return ((d.Time >= sliderValues[0]) && (d.Time <= sliderValues[1]))
    });

    
    //change image
    if(game == "Codebase: Elegon")
        document.getElementById("logo").setAttribute('src', "img/elegon.png");
    else
        document.getElementById("logo").setAttribute('src', "img/atalantis_icon.png");

    // Update scales
    x.domain(d3.extent(FilteredData, function(d){ return d.Time; }));
    y.domain([d3.min(FilteredData, function(d){ return d[yValue]; }) / 1.005, 
        d3.max(FilteredData, function(d){ return d[yValue]; }) * 1.005]);


    // Update axes
    xAxisCall.scale(x);
    xAxis.transition(t()).call(xAxisCall);
    yAxisCall.scale(y);
    yAxis.transition(t()).call(yAxisCall);
    //yAxis.transition(t()).call(yAxisCall.tickFormat(formatAbbreviation));

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
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);
        
    function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(FilteredData, x0, 1),
            d0 = FilteredData[i - 1],
            d1 = FilteredData[i],
            d = (d1 && d0) ? (x0 - d0.Time > d1.Time - x0 ? d1 : d0) : 0;
            focus.attr("transform", "translate(" + x(d.Time) + "," + y(d[yValue]) + ")");
            focus.select("text").text(function() { return d3.format(",")(d[yValue].toFixed(2)); });
            focus.select(".x-hover-line").attr("y2", height - y(d[yValue]));
        focus.select(".y-hover-line").attr("x2", -x(d.Time));
    }

    // Path generator
    line = d3.line()
        .x(function(d){ return x(d.Time); })
        .y(function(d){ return y(d[yValue]); });

    // Update our line path
    g.select(".line")
        .transition(t)
        .attr("d", line(FilteredData));

    // Update y-axis label
    yLabel.text(yValue);
}



