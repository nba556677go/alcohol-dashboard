import * as d3 from "d3";
import { useEffect } from "react";

const PieChart = (props) => {
    useEffect(() => {
        if(props.data.length === 0) return;
        removeChart();
        drawChart();
    }, [props.data, props.radio, props.type])

    const removeChart = () => {
        const svg = d3.select("#pieChart").select("svg")
        svg.selectAll("*").remove();
        svg.remove();
    }

    const drawChart = () => {
        var data = {}
        var regions = []

        // consumption region distribution
        if(props.genre === 'consumption') {     
            props.data.forEach((d) => {
                const value = Number(d['Total alcohol consumption per capita (liters of pure alcohol, projected estimates, 15+ years of age)'])
                if(!value) return
                if(!regions.includes(d.region)) {
                    regions.push(d.region);
                    data[d.region] = 0
                }
                data[d.region] += value
            })
        } else {
            var alcoholType = props.type.toLowerCase();
            props.data.forEach((d) => {
                const value = Number(d[alcoholType])
                if(!value) return
                if(!regions.includes(d.region)) {
                    regions.push(d.region);
                    data[d.region] = 0
                }
                data[d.region] += value
            })
        }

        // data.sort((a, b) => b.value - a.value)
        // data = Object.fromEntries(Object.entries(data).sort((prev, next) => prev[1] - next[1]))

        var width = 550,
            height = 450,
            margin = 100;
                
        // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
        var radius = Math.min(width, height) / 2 - margin
        
        // append the svg object to the div called 'my_dataviz'
        var svg = d3.select("#pieChart")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + (width) / 2 + "," + (height) / 2 + ")");
                
            // set the color scale
            var color = d3.scaleOrdinal()
                .domain(regions)
                .range(d3.schemeDark2);
            
            // Compute the position of each group on the pie:
            const pie = d3.pie()
            .sort(null) // Do not sort group by size
            .value(d => d[1])
            const data_ready = pie(Object.entries(data))
                
            // The arc generator
            var arc = d3.arc()
                .innerRadius(radius * 0.5)         // This is the size of the donut hole
                .outerRadius(radius * 0.8)
            
            // Another arc that won't be drawn. Just for labels positioning
            var outerArc = d3.arc()
                .innerRadius(radius * 0.9)
                .outerRadius(radius * 0.9)
                
            // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
            svg
                .selectAll('allSlices')
                .data(data_ready)
                .join('path')
                .attr('d', arc)
                .attr('fill', d => color(d.data[1]))
                .attr("stroke", "white")
                .style("stroke-width", "2px")
                .style("opacity", 0)
                .transition()
                .duration(1000)
                .ease(d3.easeLinear)
                .style("opacity", 0.7)
                .attrTween("d", function(d) {
                    var interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                    return function(t) {
                      return arc(interpolate(t));
                    };
                })
            
            svg
                .selectAll('allPolylines')
                .data(data_ready)
                .join('polyline')
                  .attr("stroke", "white")
                  .style("fill", "none")
                  .attr("stroke-width", 1)
                  .attr('points', function(d, i) {
                    const midangle = d.startAngle + ( d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
                    const posA = arc.centroid(d) // line insertion in the slice
                    // line break: we use the other arc generator that has been built only for that
                    var posB = outerArc.centroid(d);
                    var posC = outerArc.centroid(d); // Label position = almost the same as posB

                    if (midangle > 6.15) {
                        posB[1]+= -15 * (data_ready.length - i - 1)
                        posC[1]+= -15 * (data_ready.length - i - 1)
                    }
                    posC[0] = radius * 0.95 * (midangle < Math.PI || midangle > 6.15 ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
                    return [posA, posB, posC]
                  })
                  .style("opacity", 0)
                  .transition()
                  .duration(1000)
                  .ease(d3.easeLinear)
                  .style("opacity", 1)
            
            // Add the polylines between chart and labels:
            svg
                .selectAll('allLabels')
                .data(data_ready)
                .join('text')
                  .text(d => d.data[0])
                  .attr('transform', function(d, i) {
                      const pos = outerArc.centroid(d);
                      const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                      console.log(midangle)
                      pos[0] = radius * 0.99 * (midangle < Math.PI || midangle > 6.15 ? 1 : -1);
                      if (midangle > 6.15) {
                        pos[1]+= -15 * (data_ready.length - i - 1)
                    }
                      return `translate(${pos})`;
                  })
                  .style('text-anchor', function(d) {
                      const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                      return (midangle < Math.PI || midangle > 6.15 ? 'start' : 'end')
                  })
                  .attr("stroke", "white")
                  .attr("stroke-width", 1)
                  .style('font-size', '12px')
                  .style("opacity", 0)
                  .transition()
                  .duration(1000)
                  .ease(d3.easeLinear)
                  .style("opacity", 1)
    }
    
    return <div id="pieChart"></div>
}

export default PieChart