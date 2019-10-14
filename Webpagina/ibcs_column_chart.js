var margin =   {
    left:4,
    right:4,
    top:4,
    buttom:4,
    fontSize: 10,
    between:10,
    negatief:15,
    positief:15,
    axisOverlap:5,
    chartOverlap:1/9,
    patternWidth:4,
    chartPadding:1/3,
    labelSpace:10,
    labelDistance:5
}
               
var totalHeight = 360
var totalWidth = 250    

var actual = true;
var absolutePlan = true;
var relativePlan = false;
var absolutePrevious = false;
var relativePrevious = false;
var absoluteForecast = false;
var relativeForecast = false;
var deltaCharts = [absolutePlan, relativePlan, absolutePrevious, relativePrevious, absoluteForecast, relativeForecast]
var deltaChartsCount = 0

for(i = 0; i < deltaCharts.length; i++){
    if(deltaCharts[i]){deltaChartsCount++}
}


function makePattern() {
    var patternsArray = ['positive', 'negative', 'neutral']
    var pattern = d3.select("body").append("svg")
        .attr("class","pattern")
        .attr("width", 0)
        .attr("height", 0)
    for (i=0; i<patternsArray.length;i++) {
        var patternDefault = pattern.append("pattern")
            .attr("id","diagonal-hash-"+patternsArray[i])
            .attr("patternUnits","userSpaceOnUse")
            .attr("width",margin.patternWidth)
            .attr("height",margin.patternWidth)
            .attr("patternTransform","rotate(45)")
        patternDefault.append("rect")
            .attr("width",margin.patternWidth)
            .attr("height",margin.patternWidth)
            .attr("transform","translate(0,0)")
            .attr("style","fill: #FFFFFF")
        patternDefault.append("rect")
            .attr("class",patternsArray[i]+"-pattern")
            .attr("width",margin.patternWidth/2)
            .attr("height",margin.patternWidth)
            .attr("transform","translate(0,0)")
    }
}

makePattern()

d3.csv("ibcs_column_chart.csv")
    .row(function(d){
        return{
            jaar: d.Jaar,sales:Number(d.Sales),plan:Number(d.Plan),forecast:Number(d.Forecast),previous:Number(d.Vorig_Jaar)
        }
    })
    .get(function(error,data){
        if (error) throw error

        var totalCharts = [
            actual === false ? 0 : 1,
            absolutePlan === false ? 0 : 1,
            absoluteForecast === false ? 0 : 1, 
            absolutePrevious === false ? 0 : 1 
        ].reduce(sum)

        var maxActuals =    d3.max(data, function(d){return d.sales})
        var minActuals =    d3.min(data, function(d){return d.sales})
        var maxForecast =   d3.max(data, function(d){return d.forecast})
        var minForecast =   d3.min(data, function(d){return d.forecast})
        var maxPlan =       d3.max(data, function(d){return d.plan})
        var minPlan =       d3.min(data, function(d){return d.plan})
        var maxPrevious =   d3.max(data, function(d){return d.previous})
        var minPrevious =   d3.min(data, function(d){return d.previous})
        
        var maxDeltaActualPlan =        d3.max(data, function(d){return (d.sales === 0 ? 0 : d.sales - d.plan)})
        var minDeltaActualPlan =        d3.min(data, function(d){return (d.sales === 0 ? 0 : d.sales - d.plan)})
        var maxDeltaActualPrevious =    d3.max(data, function(d){return (d.sales === 0 ? 0 : d.sales - d.previous)})
        var minDeltaActualPrevious =    d3.min(data, function(d){return (d.sales === 0 ? 0 : d.sales - d.previous)})
        var maxDeltaForecastPlan =      d3.max(data, function(d){return (d.forecast === 0 ? 0 : d.forecast - d.plan)})
        var minDeltaForecastPlan =      d3.min(data, function(d){return (d.forecast === 0 ? 0 : d.forecast - d.plan)})
        var maxDeltaForecastPrevious =  d3.max(data, function(d){return (d.forecast === 0 ? 0 : d.forecast - d.previous)})
        var minDeltaForecastPrevious =  d3.min(data, function(d){return (d.forecast === 0 ? 0 : d.forecast - d.previous)})

        var maxDeltaForecast =  d3.max(data, function(d){return (d.sales === 0 ? 0 : d.sales - d.forecast)})
        var minDeltaForecast =  d3.min(data, function(d){return (d.sales === 0 ? 0 : d.sales - d.forecast)})
        var maxDeltaPlan =      Math.max(maxDeltaActualPlan, maxDeltaForecastPlan)
        var minDeltaPlan =      Math.min(minDeltaActualPlan, minDeltaForecastPlan)
        var maxDeltaPrevious =  Math.max(maxDeltaActualPrevious, maxDeltaForecastPrevious)
        var minDeltaPrevious =  Math.min(minDeltaActualPrevious, minDeltaForecastPrevious)
        var maxActual =         Math.max(maxActuals, maxForecast, maxPlan, maxPrevious)
        var minActual=          Math.min(minActuals, minForecast, minPlan, minPrevious)

        var heightLabels = [
            actual === false ? 0 : minActual < 0 ? 2 : 1,
            absoluteForecast === false ? 0 : minDeltaForecast < 0 ? 2 : 1, 
            absolutePlan === false ? 0 : minDeltaPlan < 0 ? 2 : 1,
            absolutePrevious === false ? 0 : minDeltaPrevious < 0 ? 2 : 1
        ].reduce(sum)*margin.labelSpace

        function sum(total, num) {
            return total + num;
        }

        var widthTotal = totalWidth - margin.right - margin.left
        var heightTotal = [
            totalHeight, -margin.top, -margin.buttom, -heightLabels, + margin.axisOverlap
            -(totalCharts -1) * margin.between
        ].reduce(sum)   

        var varianceActual = maxActual - minActual
        var varianceDeltaPlan = maxDeltaPlan - minDeltaPlan
        var varianceDeltaForecast = maxDeltaForecast - minDeltaForecast
        var varianceDeltaPrevious = maxDeltaPrevious - minDeltaPrevious

        var varianceTotal = [
            actual === false ? 0 : varianceActual,
            absolutePlan === false ? 0 : varianceDeltaPlan,
            absoluteForecast === false ? 0 : varianceDeltaForecast, 
            absolutePrevious === false ? 0 : varianceDeltaPrevious
        ]

        var varianceTotal = varianceTotal.reduce(sum)

        var heightVarianceActual = heightTotal/varianceTotal*varianceActual
        var heightVariancePlan = heightTotal/varianceTotal*varianceDeltaPlan
        var heightVarianceForecast = heightTotal/varianceTotal*varianceDeltaForecast
        var heightVariancePrevious = heightTotal/varianceTotal*varianceDeltaPrevious
        
        var totalHeightActual =  actual === false ? 0 : heightVarianceActual + (minActual < 0 ? 2 : 1) * margin.labelSpace 
        var totalHeightAbsolutePlan =  absolutePlan === false ? 0 : heightVariancePlan + (minPlan < 0 ? 2 : 1) * margin.labelSpace 
        var totalHeightAbsoluteForecast =  absoluteForecast === false ? 0 : heightVarianceForecast + (minForecast < 0 ? 2 : 1) * margin.labelSpace 
        var totalHeightAbsolutePrevious =  absolutePrevious === false ? 0 : heightVariancePrevious + (minPrevious < 0 ? 2 : 1) * margin.labelSpace 

        var heightAxis = [
            totalHeightActual, totalHeightAbsolutePlan, totalHeightAbsoluteForecast, totalHeightAbsolutePrevious, 
            margin.between *  (totalCharts-1),
            - margin.axisOverlap * 2,
            margin.top
        ].reduce(sum)

        var heightActual = [
            totalHeightAbsolutePlan, totalHeightAbsoluteForecast, totalHeightAbsolutePrevious, 
            margin.between *  (totalCharts-1),
            margin.top
        ].reduce(sum)

        var heightAbsolutePlan = [
            totalHeightAbsoluteForecast, totalHeightAbsolutePrevious,
            margin.top
        ].reduce(sum)

        //CREATE VISUAL------------------------------------------------------------------------------------

        var y = d3.scaleLinear()
            .domain([0,maxActual])
            .range([heightVarianceActual,0])

        var x = d3.scaleBand()
            .domain(data.map(function(d){return d.jaar}))
            .range([0, widthTotal])
            .paddingInner(margin.chartPadding)

            

        var yAxis = d3.axisLeft(y)
        var xAxis = d3.axisBottom(x).tickSize([]).tickPadding([margin.fontSize*0.4]) //0.4em == 10.0pt: 4.0px


        var svg = d3.select("body").append("svg").attr("height","100%").attr("width","100%")      

        var actualGroup = svg.append("g")
            .attr("transform","translate("+margin.left+","+heightActual+")")


        //PREVIOS YEAR
        actualGroup.selectAll("rect.py")
            .data(data)
            .enter().append("rect")
            .attr("class","py")
            .attr("style","fill:#b8b8b8")
            .attr("x", function(d) { return x(d.jaar); })
            .attr("y", function(d) { return y(d.previous); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return heightVarianceActual - y(d.previous); })
            // .attr("transform","translate(-"+margin.chartOverlap+",0)")
            .attr("transform","translate(-"+x.bandwidth()/6+",0)")


        //PLAN
        // actualGroup.selectAll("rect.pl")
        //     .data(data)
        //     .enter().append("rect")
        //     .attr("class","pl")
        //     .attr("style","stroke-width:1;stroke:#afafaf;fill:#ffffff")
        //     .attr("x", function(d) { return x(d.jaar); })
        //     .attr("y", function(d) { return y(d.plan); })
        //     .attr("width", x.bandwidth())
        //     .attr("height", function(d) { return heightVarianceActual - y(d.plan); })
        //     .attr("transform","translate("+margin.chartOverlap+",0)")
        
        // FORECAST
        // actualGroup.selectAll("rect.fc")
        // .data(data)
        // .enter().append("rect")
        // .attr("class","fc")
        // .attr("x", function(d) { return x(d.jaar); })
        // .attr("y", function(d) { return y(d.forecast); })
        // .attr("width", x.bandwidth())
        // .attr("height", function(d) { return (d.sales != 0) ? 0 : heightVarianceActual - y(d.forecast)})

        // ACTUALS
        actualGroup.selectAll("rect.ac")
            .data(data)
            .enter().append("rect")
            .attr("class","ac")
            .attr("style","fill:#404040")
            .attr("x", function(d) { return x(d.jaar); })
            .attr("y", function(d) { return y(d.sales); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return heightVarianceActual - y(d.sales); })

console.log(margin.fontSize*(1+1/3))

        //X AXIS
        var buttomAxis = svg.append("g")
            .attr("class","x axis")
            .style("font-size", margin.fontSize*(1+1/3)+"px")
            // .style("font-size", "10px")
            .attr("transform","translate("+margin.right+","+heightAxis+")")
            .call(xAxis)
        buttomAxis.selectAll(".x.axis path, .x.axis line")
            .attr("stroke","none")

        //DATALABELS
        actualGroup.append("g").selectAll("text")
            .data(data)
            .enter().append("text")
            .text(function (d) { if (d.sales != 0) {return d.sales} 
                                else if (d.forecast != 0) {return d.forecast}})
            .attr("class","label")
            .attr("x", function (d) { return x(d.jaar) + x.bandwidth() / 2; })
            .attr("y", function (d) { if (d.sales != 0) {return y(d.sales ) - margin.labelDistance } 
                                    else if (d.forecast != 0) {return y(d.forecast) - margin.labelDistance }})

        
    
        var deltaY = d3.scaleLinear()
            .domain([minDeltaPlan,maxDeltaPlan])
            .range([heightVariancePlan,0])
        var deltaGroupPlan = svg.append("g")
            .attr("transform","translate("+margin.left+","+(margin.top)+")")
        
        
        //DELTA PLAN  -----------------------------------------------------------------------------------
        deltaGroupPlan.selectAll("rect.delta-ac")
            .data(data)
            .enter().append("rect")
            .attr("class", function (d) {
                return (d.sales - d.plan > 0 || d.forecast - d.plan > 0 ? "delta-ac positive" : "delta-ac negative")})
            .attr("x", function(d) { return x(d.jaar); })
            .attr("y", function(d) {
                if (d.sales === 0) {
                    return Math.min(deltaY(0),
                                    deltaY(d.forecast - d.plan));}
                else {
                    return Math.min(deltaY(0),
                                    deltaY(d.sales - d.plan)); }
                }
            )
            .attr("width", x.bandwidth())
            .attr("height", function(d) { 
                if (d.sales === 0 && d.forecast != 0) {
                    return Math.abs((deltaY(d.forecast - d.plan)) - deltaY(0));}
                else if (d.sales != 0) {
                    return Math.abs((deltaY(d.sales - d.plan)) - deltaY(0)); }
                else {return 0}
                }
            )
            .attr("transform", "translate(0,"+margin.top+")")

        deltaGroupPlan.selectAll(".tick line, path")
            .attr("stroke", "none")
        
        deltaGroupPlan.append("g").selectAll("text")
            .data(data)
            .enter().append("text")
            .text(function (d) { if (d.sales === 0 && d.forecast != 0) {return d.forecast - d.plan} 
                                else if (d.sales != 0) {return d.sales - d.plan}})
            .attr("class","label")
            .attr("x", function (d) { return x(d.jaar) + x.bandwidth() / 2; })


            .attr("y", function (d) { if (d.sales === 0 && d.forecast != 0) {return deltaY(d.forecast - d.plan) - 5 } 
                                    else if (d.sales != 0) {return deltaY(d.sales - d.plan) - 5 }})

            // .attr("transform","translate(0,"+heightVariancePlan+")")



        //HULP LINE    
        svg.append("line")
            .attr("class","base-line")
            .attr("x1",totalWidth)
            .attr("y1", 0)
            .attr("x2",totalWidth)
            .attr("y2", totalHeight)
        svg.append("line")
            .attr("class","base-line")
            .attr("x1",0)
            .attr("y1", totalHeight)
            .attr("x2",totalWidth)
            .attr("y2", totalHeight)


        

    })
