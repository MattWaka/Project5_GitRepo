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

// Add the line for the first time
// g.append("path")
//     .attr("class", "line")
//     .attr("fill", "none")
//     .attr("stroke", "grey")
//     .attr("stroke-width", "3px");

// X-axis
// var xAxisCall = d3.axisBottom()
//     .ticks(4);
// var xAxis = g.append("g")
//     .attr("class", "x axis")
//     .attr("transform", "translate(0," + height +")");

// // Y-axis
// var yAxisCall = d3.axisLeft()
// var yAxis = g.append("g")
//     .attr("class", "y axis");

// NEW STUFF
var capital_amount = [];

 // add the x Axis
 var x = d3.scaleLinear()
 .range([0, width]);
svg.append("g")
.attr("transform", "translate(0," + height + ")")
.call(d3.axisBottom(x));

// add the y Axis
var y = d3.scaleLinear()
 .range([height, 0])
svg.append("g")
.call(d3.axisLeft(y));

var numTrials = $("#numTrialsFromGUI").val(); 
var numSim = $("#numSimsFromGUI").val(); 
var percentBet = $("#percentToBetFromGUI").val();
var winMulti = $("#winMultiplierFromGUI").val();
var BlowupChance = $("#chanceOfBlowupFromGUI").val();
var percentBlowup = $("#percentOfBetToBlowupFromGUI").val();
var Binsize = $("#binNumberFromGUI").val();
var kerenelEp = $("#kernelEpFromGUI").val();

// get the initial data
updateSimulation();

// Compute kernel density estimation
var kde = kernelDensityEstimator(kernelEpanechnikov(kerenelEp), x.ticks(Binsize))
var density =  kde(capital_amount)

// Plot the area
var curve = svg
.append('g')
.append("path")
.attr("class", "mypath")
.datum(density)
.attr("fill", "#69b3a2")
.attr("opacity", ".8")
.attr("stroke", "#000")
.attr("stroke-width", 1)
.attr("stroke-linejoin", "round")
.attr("d",  d3.line()
.curve(d3.curveBasis)
.x(function(d) { return x(d[1]); })
.y(function(d) { return y(d[0]); })
);
// NEW STUFF END
    
// Set event callbacks and listeners
$("#numTrialsFromGUI").on("change",  function(d){
    numTrials = this.value;
    console.log("Num of Trials: " + numTrials);
    updateSimulation();
    updateChart();
});
$("#numSimsFromGUI").on("change",  function(d){
    numSim = this.value;
    console.log("Num of Sim: " + numSim);
    updateSimulation();
    updateChart();
});
$("#percentToBetFromGUI").on("change",  function(d){
    percentBet = this.value;
    console.log("Bet %: " + percentBet);
    updateSimulation();
    updateChart();
});
$("#winMultiplierFromGUI").on("change",  function(d){
    winMulti = this.value;
    console.log("Win Multiplier: " + winMulti);
    updateSimulation();
    updateChart();
});
$("#chanceOfBlowupFromGUI").on("change",  function(d){
    BlowupChance = this.value;
    console.log("Chance of Blowup" + BlowupChance);
    updateSimulation();
    updateChart();
});   
$("#percentOfBetToBlowupFromGUI").on("change",  function(d){
    percentBlowup = this.value;
    console.log("Percent of Blowup: " + percentBlowup);
    updateSimulation();
    updateChart();
});  
$("#binNumberFromGUI").on("change",  function(d){
    Binsize = this.value;
    console.log("Num of Bin: " + Binsize);
    updateChart();
});  
$("#kernelEpFromGUI").on("change",  function(d){
    kerenelEp = this.value;
    console.log("Kernel Ep: " + kerenelEp);
    updateChart();
});  

function updateChart()
{
    
}


function updateSimulation() {

    //Calculate
    capital_amount = [];
    for(i = 0 ; i < numSim; ++i)
    {
        var money = 100;
        for(j = 0; j < numTrials; ++j)
        {
            var bet = money * percentBet / 100;
            money = money - bet;
            var rand_num = Math.random() * 100.0;
            if(rand_num < BlowupChance) //blowup
            {
                bet = bet - bet * percentBlowup/100.0;
            }
            else //win
            {
                bet = bet * winMulti;
            }
            money = money + bet;
        }
        console.log("Capital Money : " + money);
        capital_amount.push(Math.floor(money));
    }
}

// Function to compute density
function kernelDensityEstimator(kernel, X) {
    return function(V) {
      return X.map(function(x) {
        return [x, d3.mean(V, function(v) { return kernel(x - v); })];
      });
    };
  }
  function kernelEpanechnikov(k) {
    return function(v) {
      return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
    };
  }


