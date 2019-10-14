var margin =   {
    outer:20,
    inner: 20,
    fontSize:10,
    fontPadding:4,
    sideLabel:40,
    chartOverlap:1/9,
    patternSize:4,
    chartPadding:1/3,
    blok:9.3,
    tri: 5,
    line: 4,
}

var totalHeight = 800
var totalWidth = 450    

var actualTwo = "PL"
var deltaOne = "ΔPL%"
var deltaTwo = "ΔPL"
var deltaCharts = [deltaOne, deltaTwo]
var deltaChartsCount = 0

for(i = 0; i < deltaCharts.length; i++){
    if(deltaCharts[i] != "None"){deltaChartsCount++}
}

var color = {
    black:"#000000",
    darkGray:"#404040",
    gray:"#939393",
    lightGray: "#F5F5F5",
    white:"#FFFFFF",
    green:"#7ACA00",
    red:"#FF0000"
}

function makePattern() {
    var patternsArray = [
        {"type":'positive', "color":color.green}, 
        {"type":'negative', "color":color.red}, 
        {"type":'neutral', "color":color.darkGray}
    ]
    var pattern = d3.select("body").append("svg")
        .attr("class","pattern")
        .attr("width", 0)
        .attr("height", 0)
    for (i=0; i<patternsArray.length;i++) {
        var patternDefault = pattern.append("pattern")
            .attr("id","diagonal-hash-"+patternsArray[i].type)
            .attr("patternUnits","userSpaceOnUse")
            .attr("width",margin.patternSize)
            .attr("height",margin.patternSize)
            .attr("patternTransform","rotate(45)")
        patternDefault.append("rect")
            .attr("width",margin.patternSize)
            .attr("height",margin.patternSize)
            .attr("transform","translate(0,0)")
            .attr("style","fill: #FFFFFF")
        patternDefault.append("rect")
            .attr("class",patternsArray[i].type+"-pattern")
            .attr("width",margin.patternSize/2)
            .attr("height",margin.patternSize)
            .attr("transform","translate(0,0)")
            .attr("style","fill:"+patternsArray[i].color)
    }
}
makePattern()

color.hatchedGray = "url(#diagonal-hash-neutral)"
color.hatchedGreen = "url(#diagonal-hash-positive)",
color.hatchedRed = "url(#diagonal-hash-negative)",

d3.csv("ibcs_column_chart.csv")
    .row(function(d){
        return{
            jaar: d.Jaar,sales:Number(d.Sales),plan:Number(d.Plan),forecast:Number(d.Forecast),previous:Number(d.Vorig_Jaar)
        }
    })
    .get(function(error,data){
        if (error) throw error

        //Minimale en maximale datapunt ACTUAL berekenen
        var maxActuals =    d3.max(data, function(d){return d.sales})
        var minActuals =    d3.min(data, function(d){return d.sales})
        var maxPlan =       d3.max(data, function(d){return d.plan})
        var minPlan =       d3.min(data, function(d){return d.plan})

        var maxActual =         Math.max(maxActuals, maxPlan)
        var minActual=          Math.min(minActuals, minPlan)

        //Minimale en maximale datapunt DELTA berekenen
        var maxAbsoluteActualPlan =        d3.max(data, function(d){return (d.sales === 0 ? 0 : d.sales - d.plan)})
        var minAbsoluteActualPlan =        d3.min(data, function(d){return (d.sales === 0 ? 0 : d.sales - d.plan)})
        var maxRelativeActualPlan =        d3.max(data, function(d){return (d.sales === 0 ? 0 : (d.sales - d.plan)/Math.abs(d.plan)*100)})
        var minRelativeActualPlan =        d3.min(data, function(d){return (d.sales === 0 ? 0 : (d.sales - d.plan)/Math.abs(d.plan)*100)})

        //Vershil in minimale en maximale datapunt berekenen
        var varianceActual = maxActual - (minActual < 0 ? minActual : 0)
        var varianceActualPlan = maxAbsoluteActualPlan - minAbsoluteActualPlan

        //Verdeling variance
        var totalVarianceCharts = [
            varianceActual,
            varianceActualPlan * 2,
        ].reduce(sum)

        var actualHeightLabels = (minActual < 0 ? 2 : 1) * (margin.fontSize + margin.fontPadding)
        var absoluteActualPlanHeightLabels = (minAbsoluteActualPlan < 0 ? 2 : 1) * (margin.fontSize + margin.fontPadding)
        var relativeActualPlanHeightLabels = (minRelativeActualPlan < 0 ? 2 : 1) * (margin.fontSize + margin.fontPadding)
        var axisHeightLabels = margin.fontSize + margin.fontPadding

        var totalHeightLabels = [
            actualHeightLabels,
            absoluteActualPlanHeightLabels, 
            relativeActualPlanHeightLabels,
            axisHeightLabels
        ].reduce(sum)

        var totalHeightBloks = [
            (minRelativeActualPlan < 0 ? 1 : 0.5) * margin.blok
        ].reduce(sum)

        function sum(total, num) {
            return total + num;
        }

        var totalHeightMargin = [
            margin.outer * 2,
            margin.inner * deltaChartsCount
        ].reduce(sum)

        var totalHeightCharts = totalHeight - totalHeightLabels - totalHeightMargin - totalHeightBloks

        heightActual = varianceActual / totalVarianceCharts * totalHeightCharts
        heightDeltaActualPlan = varianceActualPlan / totalVarianceCharts * totalHeightCharts

        //GRAFIEKEN MAKEN ================================================================================================================

        var y = d3.scaleLinear()
            .domain([
                Math.min(minActual,0),
                Math.max(maxActual,0)
            ])
            .range([heightActual,0])

        var actualX = d3.scaleBand()
            .domain(data.map(function(d){return d.jaar}))
            .range([0, totalWidth - margin.outer * 2 - margin.sideLabel])
            .paddingInner(margin.chartPadding)

        var x = d3.scaleBand()
            .domain(data.map(function(d){return d.jaar}))
            .range([0, totalWidth - margin.outer * 2 - margin.sideLabel - actualX.bandwidth()/9])
            .paddingInner(margin.chartPadding)

        var svg = d3.select("body").append("svg").attr("height","100%").attr("width","100%")

        function makeActuals() {
            
            var actualGroup = svg.append("g")
            .attr("transform","translate("+(margin.outer + margin.sideLabel + x.bandwidth()/9)+","+(totalHeight - margin.outer - axisHeightLabels - heightActual - actualHeightLabels + margin.fontSize + margin.fontPadding)+")")

            // PLAN
            actualGroup.selectAll("rect.pl")
            .data(data)
            .enter()
            .append("rect")
                .attr("class","pl")
                .attr("x", function(d) { return x(d.jaar); })
                .attr("y", function(d) { return Math.min(y(d.plan),y(0)); })
                .attr("width", x.bandwidth())
                .attr("height", function(d) { return Math.abs(y(d.plan)-y(0)); })
                .attr("transform","translate("+(-x.bandwidth() * margin.chartOverlap)+",0)")
                .attr("style","stroke-width:0.1em;stroke:"+color.gray+";fill:"+color.white)

            // ACTUALS
            actualGroup.selectAll("rect.ac")
                .data(data)
                .enter()
                .append("rect")
                    .attr("class","ac")
                    .attr("x", function(d) { return x(d.jaar); })
                    .attr("y", function(d) { return Math.min(y(d.sales), y(0)); })
                    .attr("width", x.bandwidth())
                    .attr("height", function(d) { return Math.abs(y(d.sales) - y(0)); })
                    .attr("style","fill:"+color.darkGray)
            
            //DRIEKHOEKJES
            actualGroup.selectAll(".bar")
                .data(data)
                .enter()
                .append("polygon")
                    .attr("points",function(d) {
                        var left = x(d.jaar) - margin.tri/2;
                        var top = y(d.previous) + margin.tri;
                        var bottom = y(d.previous) - margin.tri;
                        var middle = y(d.previous)

                        return left + ',' + bottom + ' '
                        + left + ',' + top + ' '
                        + (left + margin.tri*2 ) + ',' + middle})
                        .attr("style","stroke-width:0.1em;stroke:"+color.white+";fill:"+color.gray)
                   
            //BASE LINE    
            actualGroup.append("line")
                .attr("x1", -x.bandwidth()/4.5)
                .attr("y1", y(0))
                .attr("x2",totalWidth - margin.outer * 2 - margin.sideLabel)
                .attr("y2", y(0))
                .attr("style","stroke-width: 0.1em;stroke:" + color.darkGray)

            //DATALABELS
            actualGroup.append("g").selectAll("text")
                .data(data)
                .enter()
                .append("text")
                    .text(function (d) {return d.sales.toFixed(1)}) 
                    .attr("class","label")
                    .attr("x", function (d) { return x(d.jaar) + x.bandwidth() / 2; })
                    .attr("y", function (d) { if  (d.sales > 0) {return y(d.sales) - margin.fontPadding }
                                                           else {return y(d.sales) + margin.fontPadding + margin.fontSize}})
                    .attr("style","text-align: center; text-anchor: middle; font-family: Arial ;font-size: " + margin.fontSize + "pt;")
            
            //SIDE LABEL
            actualGroup.append("text")
                .text("AC")
                .attr("x", -x.bandwidth()/4.5 - margin.fontPadding)
                .attr("y", y(data[0].sales/2) + margin.fontSize/2)
                .attr("style","text-align: right; text-anchor: end; font-family: Arial ;font-size: " + margin.fontSize + "pt;")
        }
        makeActuals()

        function makeDeltaOne() {
            
            var absoluteActualPlan = svg.append("g")
                .attr("transform","translate("+(margin.outer + margin.sideLabel + x.bandwidth()/9)+","+(margin.outer + heightDeltaActualPlan + relativeActualPlanHeightLabels + margin.inner + totalHeightBloks + margin.fontSize + margin.fontPadding)+ ")")
            
            var absolutePlanY = d3.scaleLinear()
                .domain([
                    Math.min(minAbsoluteActualPlan,0),
                    Math.max(maxAbsoluteActualPlan,0)
                ])
                .range([heightDeltaActualPlan,0])

            for (i = 0; i < 2; i++) {
                var dubbel = [4/3,-4/3]
                absoluteActualPlan.append("line")
                .attr("x1", -x.bandwidth()/4.5)
                .attr("y1", absolutePlanY(0))
                .attr("x2",totalWidth - margin.outer * 2 - margin.sideLabel)
                .attr("y2", absolutePlanY(0))
                .attr("style","stroke-width: 0.1em;stroke:" + color.darkGray)
                .attr("transform","translate(0,"+dubbel[i]+")")
            }

            //DELTA RECT    
            absoluteActualPlan.selectAll("rect.absolute-ac")
                .data(data)
                .enter().append("rect")
                    .attr("x", function(d) { return x(d.jaar); })
                    .attr("y", function(d) { return Math.min(absolutePlanY(0), absolutePlanY(d.sales - d.plan)); })
                    .attr("width", x.bandwidth())
                    .attr("height", function(d) { return Math.abs((absolutePlanY(d.sales - d.plan)) - absolutePlanY(0)); })
                    .attr("style", function (d) { return "fill:" + (d.sales - d.plan > 0 ? color.green : color.red)})
                                                                             
            //DATA LABELS    
            absoluteActualPlan.append("g").selectAll("text")
                .data(data)
                .enter()
                .append("text")
                    .text(function (d) {return (d.sales - d.plan).toFixed(1)})
                    .attr("x", function (d) { return x(d.jaar) + x.bandwidth() / 2; })
                    .attr("y", function (d) { if  (d.sales - d.plan > 0) {return absolutePlanY(d.sales - d.plan) - margin.fontPadding }
                                                                    else {return absolutePlanY(d.sales - d.plan) + margin.fontPadding + margin.fontSize}})  
                    .attr("style","text-align: center; text-anchor: middle; font-family: Arial ;font-size: " + margin.fontSize + "pt;")
        
            //SIDE LABEL
            absoluteActualPlan.append("text")
                .text("ΔPL")
                .attr("x", -x.bandwidth()/4.5 - margin.fontPadding)
                .attr("y", absolutePlanY((data[0].sales - data[0].plan)/2) + margin.fontSize/2)
                .attr("style","text-align: right; text-anchor: end; font-family: Arial ;font-size: " + margin.fontSize + "pt;")
        }
        makeDeltaOne()

        function makeDeltaTwo() {

            var relativeActualPlan = svg.append("g")
                .attr("transform","translate("+(margin.outer + margin.sideLabel + x.bandwidth()/9) +","+(margin.outer + margin.fontSize + margin.fontPadding + margin.blok / 2)+ ")")

            var relativePlanY = d3.scaleLinear()
                .domain([
                    Math.min(minRelativeActualPlan,0),
                    Math.max(maxRelativeActualPlan,0)
                ])
                .range([heightDeltaActualPlan,0])          

            //BASE LINE    
            for (i = 0; i < 2; i++) {
                var dubbel = [4/3,-4/3]
                relativeActualPlan.append("line")
                    .attr("x1", -x.bandwidth()/4.5)
                    .attr("y1", relativePlanY(0))
                    .attr("x2",totalWidth - margin.outer * 2 - margin.sideLabel)
                    .attr("y2", relativePlanY(0))
                    .attr("style","stroke-width: 0.1em;stroke:" + color.darkGray)
                    .attr("transform","translate(0,"+dubbel[i]+")")
            }

            //BLOKKEN
            relativeActualPlan.selectAll("rect.blok-ac")
                .data(data)
                .enter().append("rect")
                    .attr("x", function(d) { return x(d.jaar) + x.bandwidth()/2 - margin.blok/2; })
                    .attr("y", function(d) {return relativePlanY((d.sales - d.plan)/Math.abs(d.plan)*100) - margin.blok/2; })
                    .attr("width", margin.blok)
                    .attr("height", margin.blok)
                    .attr("style","fill:"+color.darkGray)
                    
            //DELTA RECT    
            relativeActualPlan.selectAll("rect.relative-ac")
                .data(data)
                .enter().append("rect")
                    .attr("x", function(d) { return x(d.jaar) + (x.bandwidth() - margin.line)/2; })
                    .attr("y", function(d) { return Math.min(relativePlanY(0), relativePlanY((d.sales - d.plan)/Math.abs(d.plan)*100)); })
                    .attr("width", margin.line)
                    .attr("height", function(d) {return Math.abs((relativePlanY((d.sales - d.plan)/Math.abs(d.plan)*100)) - relativePlanY(0)); })
                    .attr("style", function (d) { return "fill:" + ((d.sales - d.plan)/Math.abs(d.plan)*100 > 0 ? color.green : color.red)})

            //DATA LABELS
            relativeActualPlan.append("g").selectAll("text")
                .data(data)
                .enter()
                .append("text")
                    .text(function (d) {return ((d.sales - d.plan)/Math.abs(d.plan)*100).toFixed(1) + "%"})
                    .attr("class","label")
                    .attr("x", function (d) { return x(d.jaar) + x.bandwidth() / 2; })
                    .attr("y", function (d) { if  ((d.sales - d.plan)/Math.abs(d.plan)*100 > 0) {return relativePlanY((d.sales - d.plan)/Math.abs(d.plan)*100) - margin.fontPadding - margin.blok/2}
                                                                                           else {return relativePlanY((d.sales - d.plan)/Math.abs(d.plan)*100) + margin.fontPadding + margin.fontSize + margin.blok/2}})
                    .attr("style","text-align: center; text-anchor: middle; font-family: Arial ;font-size: " + margin.fontSize + "pt;")                                                            
            
            //SIDE LABEL
            relativeActualPlan.append("text")
                .text("ΔPL%")
                .attr("x", -x.bandwidth()/4.5 - margin.fontPadding)
                .attr("y", relativePlanY((data[0].sales - data[0].plan)/Math.abs(data[0].plan)*100/2) + margin.fontSize/2)
                .attr("style","text-align: right; text-anchor: end; font-family: Arial ;font-size: " + margin.fontSize + "pt;")
        }
        makeDeltaTwo()

        function makeAxis() {

            var axisGroup = svg.append("g")
            .attr("transform","translate("+(margin.outer + margin.sideLabel + x.bandwidth()/9)+","+(totalHeight - margin.outer)+")")

            //AXIS LABELS
            axisGroup.append("g").selectAll("text")
            .data(data)
            .enter()
            .append("text")
                .text(function (d) {return d.jaar}) 
                .attr("class","label")
                .attr("x", function (d) { return x(d.jaar) + x.bandwidth() / 2; })
                .attr("y", 0)
                .attr("style","text-align: center; text-anchor: middle; font-family: Arial ;font-size: " + margin.fontSize + "pt;")
        }
        makeAxis()
        
        function makeHelpLines(){
            //HULP LINE    
            svg.append("line")
                .attr("style","stroke-width: 0.1em;stroke:" + color.darkGray)
                .attr("x1",totalWidth)
                .attr("y1", 0)
                .attr("x2",totalWidth)
                .attr("y2", totalHeight)
            svg.append("line")
                .attr("style","stroke-width: 0.1em;stroke:" + color.darkGray)
                .attr("x1",0)
                .attr("y1", totalHeight)
                .attr("x2",totalWidth)
                .attr("y2", totalHeight)
            svg.append("line")
                .attr("style","stroke-width: 0.1em;stroke:" + color.darkGray)
                .attr("x1",0)
                .attr("y1", 0)
                .attr("x2",totalWidth)
                .attr("y2", 0)

        
            // svg.append("line")
            //     .attr("style","stroke-width: 0.1em;stroke:" + color.darkGray)
            //     .attr("x1",0)
            //     .attr("y1", totalHeight - margin.outer - axisHeightLabels - heightActual - actualHeightLabels + 14)
            //     .attr("x2",totalWidth)
            //     .attr("y2", totalHeight - margin.outer - axisHeightLabels - heightActual - actualHeightLabels + 14)
            //     svg.append("line")
            //     .attr("style","stroke-width: 0.1em;stroke:" + color.darkGray)
            //     .attr("x1",0)
            //     .attr("y1", totalHeight - margin.outer - axisHeightLabels - actualHeightLabels + 14)
            //     .attr("x2",totalWidth)
            //     .attr("y2", totalHeight - margin.outer - axisHeightLabels - actualHeightLabels + 14)

            
            // svg.append("line")
            //     .attr("style","stroke-width: 0.1em;stroke:" + color.darkGray)
            //     .attr("x1",0)
            //     .attr("y1", totalHeight - margin.outer - axisHeightLabels - actualHeightLabels - heightActual - margin.inner)
            //     .attr("x2",totalWidth)
            //     .attr("y2", totalHeight - margin.outer - axisHeightLabels - actualHeightLabels - heightActual - margin.inner)
            // svg.append("line")
            //     .attr("style","stroke-width: 0.1em;stroke:" + color.darkGray)
            //     .attr("x1",0)
            //     .attr("y1", totalHeight - margin.outer - axisHeightLabels - actualHeightLabels - heightActual)
            //     .attr("x2",totalWidth)
            //     .attr("y2", totalHeight - margin.outer - axisHeightLabels - actualHeightLabels - heightActual)
            
            // svg.append("line")
            //     .attr("style","stroke-width: 0.1em;stroke:" + color.darkGray)
            //     .attr("x1",0)
            //     .attr("y1", 20 + 14 + heightDeltaActualPlan + totalHeightBloks + margin.fontPadding + margin.fontSize)
            //     .attr("x2",totalWidth)
            //     .attr("y2", 20 + 14 + heightDeltaActualPlan + totalHeightBloks + margin.fontPadding + margin.fontSize)
            // svg.append("line")
            //     .attr("style","stroke-width: 0.1em;stroke:" + color.darkGray)
            //     .attr("x1",0)
            //     .attr("y1", 20 + 14 + heightDeltaActualPlan + totalHeightBloks + margin.fontPadding + margin.fontSize + margin.inner)
            //     .attr("x2",totalWidth)
            //     .attr("y2", 20 + 14 + heightDeltaActualPlan + totalHeightBloks + margin.fontPadding + margin.fontSize + margin.inner)
            // svg.append("line")
            //     .attr("style","stroke-width: 0.1em;stroke:" + color.darkGray)
            //     .attr("x1",0)
            //     .attr("y1", 20 + 14 + heightDeltaActualPlan + totalHeightBloks)
            //     .attr("x2",totalWidth)
            //     .attr("y2", 20 + 14 + heightDeltaActualPlan + totalHeightBloks)
            // svg.append("line")
            //     .attr("style","stroke-width: 0.1em;stroke:" + color.darkGray)
            //     .attr("x1",0)
            //     .attr("y1", 20 + 14)
            //     .attr("x2",totalWidth)
            //     .attr("y2", 20 + 14)

            // svg.append("line")
            //     .attr("style","stroke-width: 0.1em;stroke:" + color.darkGray)
            //     .attr("x1",0)
            //     .attr("y1", totalHeight - 20)
            //     .attr("x2",totalWidth)
            //     .attr("y2", totalHeight - 20)
        }
        makeHelpLines() 

    })