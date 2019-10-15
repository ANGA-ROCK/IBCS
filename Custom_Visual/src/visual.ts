import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import DataViewObjects = powerbi.DataViewObjects;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import { VisualSettings } from "./settings";
// import ISelectionId = powerbi.visuals.ISelectionId;
// import ISelectionIdBuilder = powerbi.visuals.ISelectionIdBuilder;
// import ISelectionManager = powerbi.extensibility.ISelectionManager
import * as d3 from "d3";
type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

interface DataPoint {
    category: string;
    value: number;
};

interface ViewModel {
    dataPoints: DataPoint[];
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
    private axisGroup: Selection<SVGElement>;
    private visualSettings: VisualSettings;
    private viewModel: ViewModel;
    
    private xPadding: number = 1/3;
    private margin = {
        outer: 20,
        inner: 20,
        fontSize:10,
        fontPadding:4,
        sideLabel:40,
        chartOverlap:1/9,
        patternSize:4,
        blok:9.3,
        tri: 5,
        line: 4,
        xPadding: 1/3
    }

    private color = {
        black:"#000000",
        darkGray:"#404040",
        gray:"#939393",
        lightGray: "#F5F5F5",
        white:"#FFFFFF",
        green:"#7ACA00",
        red:"#FF0000"
    }

    private setting = {

    }

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.svg = d3.select(options.element)
            .append("svg");
        this.barGroup = this.svg.append("g").attr("class","actual");
        this.axisGroup = this.svg.append("g").attr("class","axis");
    }

    public update(options: VisualUpdateOptions) {

        this.updateSettings(options);

        this.viewModel = this.getViewModel(options);

        let width = options.viewport.width;
        let height = options.viewport.height;

        this.svg.attr("width", width);
        this.svg.attr("height", height);

        let y = d3.scaleLinear()
            .domain([0,this.viewModel.maxValue])
            .range([height - 50 ,0]);

        let x = d3.scaleBand()
            .domain(this.viewModel.dataPoints.map(function(d){return d.category; }))
            .range([0, width])
            .paddingInner(this.margin.xPadding);

        let bars = this.barGroup.selectAll("rect.ac")
            .data(this.viewModel.dataPoints)
            .enter()
            .append("rect")
                .attr("class","ac")
                .attr("transform","translate(0,-50)")
                .attr("x", function(d) { return x(d.category); })
                .attr("y", function(d) { return y(d.value); })
                .attr("width", x.bandwidth())
                .attr("height", function(d) { return height - y(d.value); })
                .attr("style","fill:#404040");

        let axis = this.axisGroup.selectAll("text.label")
            .data(this.viewModel.dataPoints)
            .enter()
            .append("text")
                .text(function (d) {return d.category}) 
                .attr("transform","translate(0,"+ (height) +")")
                .attr("class","label")
                .attr("x", function (d) { return x(d.category) + x.bandwidth() / 2; })
                .attr("y", 0)
                .attr("style","text-align: center; text-anchor: middle; font-family: Arial ;font-size: 10pt;")

        bars.exit()
            .remove();
    }

    private updateSettings(options: VisualUpdateOptions) {

    }

    private getViewModel(options: VisualUpdateOptions): ViewModel {

        let dv = options.dataViews;
        let viewModel: ViewModel = {
            dataPoints: [],
            maxValue: 0,
        };
        
        if (!dv
            || !dv[0]
            || !dv[0].categorical
            || !dv[0].categorical.categories
            || !dv[0].categorical.categories[0].source
            || !dv[0].categorical.values
            || !dv[0].metadata)
            return viewModel;
        
        let view = dv[0].categorical;
        let categories = view.categories[0];
        let values = view.values[0];
        let highlights = values.highlights;

        for (let i = 0, len = Math.max(categories.values.length, values.values.length); i < len; i++) {
            viewModel.dataPoints.push({
                category: <string>categories.values[i],
                value: <number>values.values[i],
            });
        }

        viewModel.maxValue = d3.max(viewModel.dataPoints, function(d){return d.value; });
        return viewModel;
    }
}