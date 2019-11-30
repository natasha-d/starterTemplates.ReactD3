import React, {Component} from 'react';
import * as d3 from "d3";
import * as topojson from "topojson-client";


class MapVis extends Component {

    // constructor
    constructor(props) {
        super(props);

        // set state
        this.state = {
            loading: true,
            data: null,
            topographicalData: null,
            vis: {},
            color: 'red'
        };
    }

    // method that loads data
    componentDidMount(){
        this.loadData();
        this.initVis();
    }

    // method that gets called when a state changed
    componentDidUpdate(prevProps, prevState, snapshot) {

        this.wrangleData();

    }

    // render component
    render(){
        return (
            <div style={{width: '100%', height: '100%'}} id='mapVis'/>
        );
    }

    // load data
    loadData(){
        let component = this;

        let promises = [
            d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-albers-10m.json"),
            d3.csv("data.csv")
        ];

        Promise.all(promises)
            .then( function(data){

                // init wrangleData;
                let parseDate = d3.timeParse("%Y");

                data[1].forEach(function(d){
                    d.date = parseDate(d.date);
                    d.average = parseFloat(d.average);
                    d.salary = parseFloat(d.salary);
                });


                // set new state;
                component.setState({
                    data: data[1],
                    topographicalData : data[0],
                    loading: false})
            })
            .catch( function (err){console.log(err)} );
    }

    // method that initializes the visualization (margins, canvas, etc)
    initVis() {
        let vis = this.state.vis;

        // parent container dimensions
        let dimensions = document.getElementById('mapVis').getBoundingClientRect();

        // color scale
        vis.colorScale = d3.scaleLinear().range(['white','steelblue']).domain([0,100]);

        vis.margin = {top: 20, right: 20, bottom: 20, left: 10};
        vis.width = dimensions.width- vis.margin.left - vis.margin.right;
        vis.height = dimensions.height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#mapVis").append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (0, ${vis.margin.top})`);

        // add title
        vis.svg.append('g')
            .attr('class', 'title')
            .append('text')
            .text('Title for Map')
            .attr('transform', `translate(${vis.width/2}, 20)`)
            .attr('text-anchor', 'middle');


        // since projections don't work for some reason, we will use some basic math & transformations;
        vis.viewpoint = {'width': 975, 'height': 610};
        vis.zoom = vis.width/vis.viewpoint.width;

        // adjust map position
        vis.map = vis.svg.append("g")
            .attr("class", "states")
            .attr('transform', `scale(${vis.zoom} ${vis.zoom})`);

        // path generator
        vis.path = d3.geoPath();
    }

    wrangleData(){
        let component = this;
        let vis = this.state.vis;

        console.log('wrangleData()', this);


        // filter according to selectedRegion, init empty array
        let filteredData = [];

        // if there is a region selected
        if (component.props.range.length !== 0){

            // iterate over all rows the csv (dataFill)
            component.state.data.forEach( row => {
                // and push rows with proper dates into filteredData
                if (component.props.range[0].getTime() <= row.date.getTime() && row.date.getTime() <= component.props.range[1].getTime() ){
                    filteredData.push(row);
                }
            });
        } else {
            filteredData = component.state.data;
        }

        // sort by state - nest data(filteredData) by state
        let dataByState = d3.nest()
            .key(function(d) { return d.state; })
            .entries(filteredData);

        let displayData = [];

        // iterate over each year
        dataByState.forEach( state => {
            let tmpSum = 0;
            let tmpLength = state.values.length;
            let tmpState = state.values[0].state;
            state.values.forEach( value => {
                tmpSum += +value.average;
            });
            displayData.push (
                {state: tmpState, average: tmpSum/tmpLength}
            )
        });

        component.state.displayData = displayData;
        this.updateVis();
    }

    // method that binds data to objects and creates the actual visualization
    updateVis() {
        let component = this;
        let vis = this.state.vis;
        let topographicalData = this.state.topographicalData;

        // log
        console.log('map, updateVis, displayData:', this.state.displayData);

        let allStates = vis.map.selectAll("path")
            .data(topojson.feature(topographicalData, topographicalData.objects.states).features);

        allStates.enter()
            .append("path")
            .attr('class', 'state')
            .attr("d", vis.path)
            .merge(allStates)
            .transition()
            .duration(800)
            .attr("fill",function(d){
                let color;
                component.state.displayData.forEach(function (element) {
                    if (element.state === d.properties.name){
                        color = vis.colorScale(element.average);
                    }
                });
                return color;
            })
            .attr("stroke", 'black')
            .attr("stroke-width", 1);

        d3.selectAll('.state')
            .on('mouseover', function(d){
                d3.select(this).attr('fill', 'red')
            })
            .on('mouseout', function(d){
                d3.select(this).attr('fill', function(d) {
                    let color;
                    component.state.displayData.forEach(function (element) {
                        if (element.state === d.properties.name) {
                            color = vis.colorScale(element.average);
                        }
                    });
                    return color;
                })
            })
    }
}

export default MapVis;



