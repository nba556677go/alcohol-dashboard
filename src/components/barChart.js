import * as d3 from "d3";
import { useEffect } from "react";

const BarChart = () => {

    useEffect(() => {
        removeChart();
        drawChart();
    }, [])

    const removeChart = () => {
        const svg = d3.select("#barChart").select("svg")
        svg.selectAll("*").remove();
        svg.remove();
    }

    const drawChart = () => {

        var data = [{key: 'Angola', value: 1200},{key: 'China', value: 1100},{key: 'Comoros', value: 900}, {key: 'France', value: 800}, {key: 'US', value: 500}, {key: 'UK', value: 500}, {key: 'India', value: 400}, {key: 'Russia', value: 300}, {key: 'Germany', value: 200}]
         
        const svg = d3.select("#barChart")
                    .append("svg")
                    .attr("width",  400)
                    .attr("height", 200)

        var margin = 100;
        var width = 400 - margin;
        var height = 200 - margin;

        var xScale = d3.scaleBand().range([0, width]).padding(0.4);
        var yScale = d3.scaleLinear().range ([height, 0]);

        var container = svg.append("g").attr("transform", "translate(" + margin/2 + "," + margin/2 + ")");

        xScale.domain(data.map((d) => { return d.key; }));
        yScale.domain([0, d3.max(data, (d) => { return d.value; }) * 1.25]);

        container.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", (d) => xScale(d.key) )
            .attr("y", (d) => yScale(d.value))
            .attr("width", xScale.bandwidth())
            .attr("height", (d) => height - yScale(d.value))
            .attr("fill", "steelblue");

        container.append("g")
            .classed("bar-labels", true)
            .selectAll("text")
            .data(data)
            .join("text")
            .attr("x", (d) => xScale(d.key) + xScale.bandwidth() / 2 - 10)
            .attr("y", (d) => yScale(d.value) - 10)

        container.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale))
            .append("text")
            .attr("y", 30)
            .attr("x", width + 10)
            .attr("text-anchor", "end")
            .attr("stroke", "black")
            .text("number");

        container.append("g")
            .call(d3.axisLeft(yScale).tickFormat((d) => {
                return d;
            }).ticks(10))
            .append("text")
            .attr("y", -10)
            .attr("x", 2.5 * 7)
            .attr("dy", "-0.71em")
            .attr("text-anchor", "center")
            .attr("stroke", "black")
            .text('country')
        
        container
            .append("text")
            .attr("x", width / 2)
            .attr("y", 0 - (margin / 4))
            .attr("text-anchor", "middle")
            .attr("stroke", "black")
            .style("font-size", "16px")
            .text('Consumption');
    }

    return <div id="barChart"></div>
}

export default BarChart