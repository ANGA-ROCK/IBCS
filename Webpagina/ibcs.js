var patternStroke = 4
var chartDistance = 4
var showYaxis = true
var patternsArray = ['positive', 'negative', 'neutral']
var pattern = d3.select("body").append("svg")
            .attr("class","pattern")
            .attr("width", 0)
            .attr("height", 0)

for (i=0; i<patternsArray.length;i++) {
    var patternDefault = pattern.append("pattern")
            .attr("id","diagonal-hash-"+patternsArray[i])
            .attr("patternUnits","userSpaceOnUse")
            .attr("width",patternStroke)
            .attr("height",patternStroke)
            .attr("patternTransform","rotate(45)")
        patternDefault.append("rect")
            .attr("width",patternStroke)
            .attr("height",patternStroke)
            .attr("transform","translate(0,0)")
            .attr("style","fill: #FFFFFF")
        patternDefault.append("rect")
            .attr("class",patternsArray[i]+"-pattern")
            .attr("width",patternStroke/2)
            .attr("height",patternStroke)
            .attr("transform","translate(0,0)")
}


d3.csv("Test_Data.csv")
    .row(function(d){return{jaar: d.Jaar, sales:Number(d.Sales), plan:Number(d.Plan), forecast:Number(d.Forecast), previous:Number(d.Vorig_Jaar)};})
    .get(function(error,data){
        if (error) throw error
  
        var height = 200
        var deltaHeight = height/60*35
        var width = 250
        var margin = {left:50,right:20,top:30,buttom:20}
        
        var maxY = Math.max(d3.max(data, function(d){return d.sales}),
                            d3.max(data, function(d){return d.plan}))
        var y = d3.scaleLinear()
            .domain([0,maxY])
            .range([height,0])
        
        maxDeltaAc = d3.max(data, function(d){return (d.sales === 0 ? 0 : d.sales - d.plan)})
        minDeltaAc = d3.min(data, function(d){return (d.sales === 0 ? 0 : d.sales - d.plan)})
        maxDeltaFc = d3.max(data, function(d){return (d.forecast === 0 ? 0 : d.forecast - d.plan)})
        minDeltaFc = d3.min(data, function(d){return (d.forecast === 0 ? 0 : d.forecast - d.plan)})
        maxDelta= Math.max(maxDeltaAc, maxDeltaFc)
        minDelta = Math.min(minDeltaAc, minDeltaFc)

        var deltaY = d3.scaleLinear()
            .domain([minDelta-5,maxDelta+5])
            .range([deltaHeight,0])
        var x = d3.scaleBand()
            .domain(data.map(function(d){return d.jaar}))
            .range([0, width])
            .paddingInner(0.1)
        var center = d3.scaleLinear()
            .range([0, width])

        var yDelta = d3.axisLeft(deltaY).ticks(5)
        var yAxis = d3.axisLeft(y)
        var xAxis = d3.axisBottom(x)
        var centerLine = d3.axisTop(center)

        var svg = d3.select("body").append("svg").attr("height","100%").attr("width","100%")

        var chartGroup = svg.append("g")
            .attr("transform","translate("+margin.left+","+(margin.top+margin.buttom+deltaHeight)+")")

        //PLAN
        chartGroup.selectAll("rect.pl")
            .data(data)
            .enter().append("rect")
            .attr("class","pl")
            .attr("x", function(d) { return x(d.jaar); })
            .attr("y", function(d) { return y(d.plan); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - y(d.plan); })
            .attr("transform","translate("+chartDistance+",0)")
        
        //PREVIOUS YEAR
        chartGroup.selectAll("rect.py")
            .data(data)
            .enter().append("rect")
            .attr("class","py")
            .attr("x", function(d) { return x(d.jaar); })
            .attr("y", function(d) { return y(d.previous); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - y(d.previous); })
            .attr("transform","translate(-"+chartDistance+",0)")

        //Forecast
        chartGroup.selectAll("rect.fc")
            .data(data)
            .enter().append("rect")
            .attr("class","fc")
            .attr("x", function(d) { return x(d.jaar); })
            .attr("y", function(d) { return y(d.forecast); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - y(d.forecast); })
        
        //ACTUALS
        chartGroup.append("g").attr("class","x axis").attr("transform","translate(0,"+height+")").call(xAxis)
        chartGroup.append("g").attr("class","y axis").call(yAxis)
        chartGroup.selectAll("rect.ac")
            .data(data)
            .enter().append("rect")
            .attr("class","ac")
            .attr("x", function(d) { return x(d.jaar); })
            .attr("y", function(d) { return y(d.sales); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - y(d.sales); })
        
        //BASE LINE    
        chartGroup.append("line")
            .attr("class","base-line")
            .attr("x1",-10)
            .attr("y1", y(0))
            .attr("x2",width + 10)
            .attr("y2", y(0))

        //LABELS
        chartGroup.append("g").selectAll("text")
            .data(data)
            .enter().append("text")
            .text(function (d) { if (d.sales != 0) {return d.sales} 
                                else if (d.forecast != 0) {return d.forecast}})
            .attr("class","label")
            .attr("x", function (d) { return x(d.jaar) + x.bandwidth() / 2; })
            .attr("y", function (d) { if (d.sales != 0) {return y(d.sales ) -5 } 
                                    else if (d.forecast != 0) {return y(d.forecast) -5 }})                        
        chartGroup.append("text")
            .attr("class","delta-label")
            .text("AC")
            .attr("y", y(data[0].sales))
            .attr("x",-30)

        var deltaGroup = svg.append("g")
            .attr("transform","translate("+margin.left+","+(margin.top)+")")

        //TITLE
        var titleGroup = svg.append("g")
                .attr("transform","translate("+margin.left+","+(margin.top)+")")
        titleGroup.append("text")
                .attr("class","title bold")
                .attr("y", 0)
                .attr("x",-30)
                .text("EBIT")
                .append("tspan")
                .text(" in mEUR")

        titleGroup.append("text")
            .attr("class","title")
            .text("jan 2019 .. jun 2019 AC, FC and ΔPL")
            .attr("y", 10)
            .attr("x",-30)
        titleGroup.append("text")
            .attr("class","title")
            .text("RODO B.V.")
            .attr("y", -10)
            .attr("x",-30)

        //BASE LINE DELTA
        for (i = 0; i < 2; i++) {
            deltaGroup.append("line")
                .attr("class","base-line-delta")
                .attr("x1",-10)
                .attr("y1", deltaY(0+i*0.4-0.4))
                .attr("x2",width + 10)
                .attr("y2", deltaY(0+i*0.4-0.4))}

        //ACTUALS DELTA    
        deltaGroup.append("g").attr("class","x axis delta").attr("transform","translate(0,"+deltaHeight+")").call(xAxis)
        deltaGroup.append("g").attr("class","centerline").attr("transform","translate(0,"+deltaY(0)+")").call(centerLine)
        deltaGroup.append("g").attr("class","y axis delta").call(yDelta)
        deltaGroup.selectAll("rect.delta-ac")
            .data(data)
            .enter().append("rect")
            .attr("class", function (d) {
                return (d.sales - d.plan < 0 ? "delta-ac negative" : "delta-ac positive")})
            .attr("x", function(d) { return x(d.jaar); })
            .attr("y", function(d) { return Math.min(deltaY(0),deltaY(d.sales - d.plan)); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return (d.sales === 0 ? 0 :
                Math.abs((deltaY(d.sales - d.plan)) - deltaY(0)))})
        
        //FORECAST DELTA        
        deltaGroup.selectAll("rect.fc")
            .data(data)
            .enter().append("rect")
            .attr("class", function (d) {
                return (d.forecast - d.plan < 0 ? "delta-fc negative" : "delta-fc positive")})
            .attr("x", function(d) { return x(d.jaar); })
            .attr("y", function(d) { return Math.min(deltaY(0),deltaY(d.forecast - d.plan)); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return (d.forecast === 0 ? 0 :
                Math.abs((deltaY(d.forecast - d.plan)) - deltaY(0)))})

        //LABELS DELTA
        deltaGroup.append("text")
            .attr("class","delta-label")
            .text("ΔPL")
            .attr("y", deltaY(minDelta + (maxDelta-minDelta)/2))
            .attr("x",-30)
            
        deltaGroup.append("g").selectAll("text")
            .data(data)
            .enter().append("text")
            .text(function(d) { if (d.sales != 0) {return d.sales - d.plan} 
                                else if (d.forecast != 0) {return d.forecast - d.plan}})

            .attr("class","label")
            .attr("x", function (d) { return x(d.jaar) + x.bandwidth() / 2; })
            .attr("y", function (d) { if (d.sales != 0) {
                                        if (d.sales - d.plan > 0) {return deltaY(d.sales - d.plan) - 7}
                                        else {return deltaY(d.sales - d.plan) + 14 }} 
                                      else if (d.forecast != 0) {
                                        if (d.forecast - d.plan > 0) {return deltaY(d.forecast - d.plan) - 7}
                                        else {return deltaY(d.forecast - d.plan) + 14 }}}) 
        //FORECAST LINE    
        chartGroup.append("line")
            .attr("class","forecast-line")
            .attr("x1",171)
            .attr("y1", y(0) + margin.buttom)
            .attr("x2",171)
            .attr("y2", y(0)- height - deltaHeight - margin.buttom)
    })
