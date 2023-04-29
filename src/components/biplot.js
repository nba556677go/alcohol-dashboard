import * as d3 from "d3";
import { useEffect } from 'react'
import '../css/biplot.css'

const Biplot = (props) => {
    useEffect(() => {
        if(props.data.length == 0 || props.wdata.length == 0) return;
        removeChart();
        drawChart();
    }, [props])

    const removeChart = () => {
        const svg = d3.select("#biplot").select("svg")
        svg.selectAll("*").remove();
        svg.remove();
    }

    const drawChart = () => {
        const svg = d3.select("#biplot")
            .append("svg")
            .attr("width",  450)
            .attr("height", 450)

        // set up the dimensions and margins of the plot
        const margin = 100;
        const width = 450 - margin;
        const height = 450 - margin;

        var container = svg.append("g").attr("transform", "translate(" + margin/2 + "," + margin/2 + ")");

        //const { scatter, path_x,  path_y, ind} = data
        
        const scatter = props.data.scatter
        const path_x = props.data.vector.map(s => s.first_pca)
        const path_y = props.data.vector.map(s => s.second_pca)
        const ind = props.data.vector.map(s => s.ind)
        var x_path = []
        var y_path = []
        for(let i = 0;i<path_x.length;i++){
            x_path.push(0)
            x_path.push(path_x[i])
            y_path.push(0)
            y_path.push(path_y[i])
        }

        const component1 = scatter.map(s => s.first_pca);
        const component2 = scatter.map(s => s.second_pca);

        console.log(d3.min(component1))//min is not getting actual mimimum
        console.log(d3.min(component1))

        var xScale = d3.scaleLinear()
            .domain([-4, 4])
            .range([0, width]);

        var yScale = d3.scaleLinear()
            .domain([-3.5, 3.5])
            .range([height, 0]);

        var xAxis = d3.axisBottom()
            .scale(xScale)
        
        var xAxis2 = d3.axisTop().scale(xScale).tickFormat(() => {})

        var yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(10);

        var yAxis2 = d3.axisRight().scale(yScale).tickFormat(() => {});

        const ZAxis = d3.map(scatter, (s) => s.label);
        // array of z-values
        const zDomain = new d3.InternSet(ZAxis);
        const zScale = d3.scaleOrdinal(zDomain, d3.schemeCategory10);

        // x axis
        container.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", ".3em")
            .attr("dy", ".8em")
            .attr("transform", "rotate(-0)");
        
        container.append("g")
            .call(xAxis2);

        //y axis
        container.append("g")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end");

        container.append("g")
            .call(yAxis2)
            .attr("transform", "translate(" + width + ", 0)");
        
        container.selectAll(".circle")
            .data(scatter)
            .enter()
            .append("circle")
            .attr("r", 2)
            .attr("cx", (d,i)=>xScale(component1[i]) )
            .attr("cy", (d, i)=>yScale(component2[i]))
            .style("fill", "white")
            .attr("stroke-width", 2)
            .attr("stroke", (d) => zScale(d.label));

        container.append("g")
            .selectAll("dot")
            .data(path_y)
            .enter()
            .append("circle")
                .attr("cx", (d,i)=>xScale(path_x[i]))
                .attr("cy", d=>yScale(d))
                .attr("r", 3)
                .attr("fill", "black")

        container.selectAll(".lines")
            .data(path_y)
            .enter().append("text")
            .attr("class", "lines")
            .attr("x", (d,i)=> path_x[i] > 0 ? xScale(path_x[i]) + 5 : xScale(path_x[i]) - 5)
            .attr("y",(d, i)=> i==1 ? yScale(d) - 5: yScale(d) + 2)
            .attr("text-anchor", (d,i)=>path_x[i] > 0 ? 'start' : 'end')
            .text((d,i)=>ind[i])
            .style("font-size", "12px")
            .attr("stroke", "black");

        
        container.append("path")
            .datum(y_path)
            .attr("fill", "none")
            .attr("stroke", "#3944fb")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x((d,i)=>xScale(x_path[i]))
                .y(d=>yScale(d)));
        
        container
                .append("text")
                .attr("class", "axis-label")
                .attr("x", -(height) / 2)
                .attr("y", -40)
                .attr("transform", "rotate(-90)")
                .attr("text-anchor", "middle")
                .text("Component 2");
        
        container
                .append("text")
                .attr("class", "axis-label")
                .attr("text-anchor", "middle")
                .attr("x", width / 2)
                .attr("y", height + 40)
                .text("Component 1");

        container
                .append("text")
                .attr("class", "title")
                .attr("stroke", "black")
                .style("font-size", "16px")
                .attr("text-anchor", "middle")
                .attr("x", width / 2)
                .attr("y", -35)
                .text("Biplot");

        const lengend = container.append("rect")
                        .attr("x",width - 110)
                        .attr("y",10)
                        .attr("width", 100)
                        .attr("height", 60)
                        .attr("fill", "#f8f9fa");


        container.append("circle")
                    .attr("cx",width - 100)
                    .attr("cy",24)
                    .attr("r", 2)
                    .style("fill", "white")
                    .attr("stroke-width", 2)
                    .attr("stroke", "rgb(44, 160, 44)");
        
        container.append("circle")
                    .attr("cx",width - 100)
                    .attr("cy",39)
                    .attr("r", 2)
                    .style("fill", "white")
                    .attr("stroke-width", 2)
                    .attr("stroke", "rgb(255, 127, 14)");
        
        container.append("circle")
                    .attr("cx",width - 100)
                    .attr("cy",54)
                    .attr("r", 2)
                    .style("fill", "white")
                    .attr("stroke-width", 2)
                    .attr("stroke", "rgb(31, 119, 180)");
        
        container.append("text").attr("x", width - 80).attr("y", 25).text("Cluster 1").style("font-size", "12px").attr("alignment-baseline","middle")
        container.append("text").attr("x", width - 80).attr("y", 40).text("Cluster 2").style("font-size", "12px").attr("alignment-baseline","middle")
        container.append("text").attr("x", width - 80).attr("y", 55).text("Cluster 3").style("font-size", "12px").attr("alignment-baseline","middle")


    }

    return (
        <div id="biplot"></div>
    );

}

export default Biplot