import * as d3 from "d3";
import { useEffect } from "react";

const BarChart = (props) => {

    useEffect(() => {
        if(props.data.length === 0) return;
        removeChart();
        drawChart();
    }, [props.data, props.type, props.genre])

    const removeChart = () => {
        const svg = d3.select("#barChart").select("svg")
        svg.selectAll("*").remove();
        svg.remove();
    }

    const drawChart = () => {
        var data = []
        // top 7 countries
        if(props.genre === 'consumption') {
            var sortedData = props.data.sort((a, b) => b['Total alcohol consumption per capita (liters of pure alcohol, projected estimates, 15+ years of age)'] - a['Total alcohol consumption per capita (liters of pure alcohol, projected estimates, 15+ years of age)']);
            data = sortedData.slice(0, 7).map((d) => {
                return {key: d.Country, value: Number(d['Total alcohol consumption per capita (liters of pure alcohol, projected estimates, 15+ years of age)'])}
            })         
        } else {
            var alcoholType = props.type.toLowerCase();
            var sortedData = props.data.sort((a, b) => b[alcoholType] - a[alcoholType]);
            data = sortedData.slice(0, 7).map((d) => {
                return {key: d.Country, value: Number(d[alcoholType])}
            })  
        }
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
            .text("country");

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
            .text(props.genre)
    }

    return <div id="barChart"></div>
}

export default BarChart