/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import { VisualSettings } from "./settings";

import * as d3 from "d3";
import { sum } from "d3";
type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

interface DataPoint {
    category: string;
    value: number;
};
interface DataPoint1 {
    category: string;
    value: number;
};

interface ViewModel {
    dataPoints: DataPoint[];
    maxValue: number;
};
interface ViewModel1 {
    dataPoints: DataPoint1[];
    maxValue: number;
};


export class Visual implements IVisual {
    private target: HTMLElement;
    private updateCount: number;
    private settings: VisualSettings;
    private textNode: Text;
    private host: IVisualHost;
    private svg: Selection<SVGElement>;
    private barGroup: Selection<SVGElement>;
    private visualSettings: VisualSettings;

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.svg = d3.select(options.element)
            .append("svg")
            .classed("IBCS", true);
        this.barGroup = this.svg.append("g")
            .classed("bar-group", true);

        this.target = options.element;
        this.updateCount = 0;
        if (typeof document !== "undefined") {
            const new_p: HTMLElement = document.createElement("p");
            new_p.appendChild(document.createTextNode("Update count:"));
            const new_em: HTMLElement = document.createElement("em");
            this.textNode = document.createTextNode(this.updateCount.toString());
            new_em.appendChild(this.textNode);
            new_p.appendChild(new_em);
            this.target.appendChild(new_p);
        }
    }

    public update(options: VisualUpdateOptions) {
  /*      let sample: DataPoint[] = [
            {
                category: "Apples",
                value: 10
            },
            {
                category: "Bananas",
                value: 20
            },
            {
                category: "Cherries",
                value: 30
            },
            {
                category: "Dates",
                value: 40
            },
            {
                category: "Elderberries",
                value: 50
            }
        ];*/

        let LY: DataPoint1[] = [
            {
                category: "Apples",
                value: 5
            },
            {
                category: "Bananas",
                value: 10
            },
            {
                category: "Cherries",
                value: 20
            },
            {
                category: "Dates",
                value: 20
            },
            {
                category: "Elderberries",
                value: 35
            }
        ];

 /*       let viewModel: ViewModel = {
            dataPoints: sample,
            maxValue: d3.max(sample, x => x.value)
        };
        */
       let viewModel = this.getViewModel(options);
        let dataLY: ViewModel1 = {
            dataPoints: LY,
            maxValue: d3.max(LY, x => x.value)
        };

        let width = options.viewport.width;
        let height = options.viewport.height;

        this.svg.attr("width", width);
        this.svg.attr("height", height);


        // X en Y as
        var x = d3.scaleLinear()
            .domain([0, 100])
            .range([0, width]);
        var y = d3.scaleBand()
            .range([0, height])
            .domain(viewModel.dataPoints.map(function (d) { return d.category }))
            .paddingInner(0.2);

        // Last year bars border
        let barsLY = this.barGroup
            .selectAll(".barLY")
            .data(dataLY.dataPoints)
            .enter().append("rect")
            .classed("barLY", true)
            .attr("x", x(0))
            .attr("width", function (d) { return x(d.value); })
            .attr("height", y.bandwidth())
            .attr("y", function (d) { return y(d.category); })
            .attr("transform", "translate(125,2 )")
            .attr('fill', 'none')
            .attr('stroke', '#000000')
            .attr('stroke-width', 1);

        // Actual bars black
        let bars = this.barGroup
            .selectAll(".bar")
            .data(viewModel.dataPoints)
            .enter().append("rect")
            .classed("bar", true)
            .attr("x", x(0))
           // .attr("width", function (d) { return x(d.value) - 100; })
           .attr("width", function (d) { return x(d.value) / 1000000; })
            .attr("height", y.bandwidth())
            .attr("y", function (d) { return y(d.category); })
            .attr("transform", "translate(125,10 )");

        // Add the x Axis
        this.svg.append("g")
            .attr("transform", "translate(125,10 )")
            .style("font", "24px times")
            .call(d3.axisLeft(y));

        // labels on top of the bar
        this.svg.selectAll(".text")
            .data(viewModel.dataPoints)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", (function (d) { return x(d.value) + y.bandwidth() + 65; }))
            .attr("y", function (d) { return y(d.category) + y.bandwidth() / 2; })
            .attr("dy", ".75em")
            .text(function (d) { return d.value; });

        bars.exit()
            .remove();

       

         // Add the x Axis for delta - WERKEND!
 /*        this.svg.append("g")
         .attr("transform", "translate(700,10 )")
         .call(d3.axisLeft(y))
         .selectAll("text").remove(); 
*/

        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
        console.log('Visual update', options);
        if (typeof this.textNode !== "undefined") {
            this.textNode.textContent = (this.updateCount++).toString();
        }
    }

    //add data from power bi 
    private getViewModel(options: VisualUpdateOptions): ViewModel{
       let dv = options.dataViews;

       let viewModel: ViewModel={
           dataPoints: [],
           maxValue:0
       };

       if (!dv
        || !dv[0]
        || !dv[0].categorical
        || !dv[0].categorical.categories
        || !dv[0].categorical.categories[0].source
        || !dv[0].categorical.values)
        return viewModel;

        let view = dv[0].categorical;
        let categories = view.categories[0];
        let values = view.values[0];

        for(let i=0, len=Math.max(categories.values.length, values.values.length); i<len; i++){
            viewModel.dataPoints.push({
                category: <string>categories.values[i],
                value: <number>values.values[i]
            });
        }
        viewModel.maxValue = d3.max(viewModel.dataPoints, d => d.value);
       //verwijder null
       return viewModel;
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return VisualSettings.parse(dataView) as VisualSettings;
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
}