import React, {Component} from 'react';
import * as d3 from "d3";

class MapVis extends Component {
    constructor(props) {
        super(props);

        // set state
        this.state = {
            data: this.props.data,
            svg: 'test'
        };
    }

    // method that is fired once component mounts
    componentDidMount() {

        // logs
        console.log(this.state, this.props);

        // when component mounts, call initVis method
        this.initVis();
    }

    // method that initializes the visualization - gets called by component did mount
    initVis() {
        let vis = this;

        vis.margin = {top: 50, right: 50, bottom: 50, left: 50};
        vis.width = 500 - vis.margin.left - vis.margin.right;
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select('#mapVis').append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // then, render
        this.updateVis();
    }

    updateVis() {
        console.log('hello', this.state, this.svg);

        // then, render
        this.render();
    }

    render(){
        return (
            <div id='mapVis'/>
        );
    }
}

export default MapVis;