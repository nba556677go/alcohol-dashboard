import * as d3 from "d3";
import { useEffect } from "react";

const Recommand = (props) => {

    useEffect(() => {
        if(props.data.length == 0) return;
        removeChart();
        draw_bars();
    }, [props.data])

    const removeChart = () => {
        const svg = d3.select("#recommand").select("svg")
        svg.selectAll("*").remove();
        svg.remove();
    }

    // var level_thresh = [0.22948346,0.49744762,0.79435826];
    var greens = ['#52ad66', '#e2ad0d','#f75639', '#a37720', '#43a2ca','#0868ac', '#e2ad0d'];
    var geo_regions = ['Americas','Western Pacific', 'Europe', 'Eastern Mediterranean', 'Africa', 'South-East Asia', 'Eastern Mediterranean'];

    //set values
    var margin = { top: 30, right: 80, bottom: 60, left: 8 },
    width  = 400 - margin.left - margin.right,
    height = 450 - margin.top  - margin.bottom;

    var y = d3.scaleBand().range([height, 0]).padding(0.3);
    var x = d3.scaleLinear().range([0, width]);

    var tooltipBox

    var draw_bars = function () {
        tooltipBox = d3.select("#recommand")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background-color", "black")
            .style("border", "solid")
            .style("border-width", "0px")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("color", "white")
            .style("visibility", "visible");

        var svg1 = d3.select("#recommand")
            .append("svg")
            .attr("width",  width  + margin.left + margin.right)
            .attr("height", height + margin.top  + margin.bottom)
            .attr("id","bar_svg");

        var canvas = svg1.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // insert x axis
        x.domain(d3.extent(props.data, (d) => Number(d['Rate Count'])));
        
        y.domain(props.data.map(function(d){ return d.Name; }));

        // var x_axis = canvas.append("g")
        //         .attr("transform", "translate(0," + height + ")")
        //         .attr("class","myaxis")
        //         .call(d3.axisBottom().scale(x));

        canvas.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .attr("class","myaxis")
            .append("text")
            .attr("y", 30)
            .attr("x", width + 10)
            .style("font-size", "14px")
            .attr("text-anchor", "end")
            .attr("stroke", "white")
            .text("Rate Count");

        canvas.append("g")
            .call(d3.axisLeft(y).tickFormat((d) => {
                return d;
            }).ticks(10))
            .append("text")
            .attr("y", -5)
            .attr("x", 4 * (props.type.length + 3))
            .attr("dy", "-0.71em")
            .attr("text-anchor", "center")
            .attr("stroke", "white")
            .style("font-size", "14px")
            .text(props.type)

        // var x_grid = canvas.append("g")			
        //     .attr("class", "grid")
        //     .attr("transform", "translate(0," + height + ")")
        //     .call(d3.axisBottom()
        //             .scale(x)
        //             .ticks(8)
        //             .tickSize(-height)
        //             .tickFormat(""));

        updateBars(props.data, canvas, props.selectCountry);
    }

    var updateBars = function(data, canvas, selectCountry) {

        y.domain(data.map(function(d){ return d.Name; }));
        // x.domain(d3.extent(data, (d) => d["Rate Count"]));

        var barGroups = canvas.selectAll(".bargroup").data(data);
    
        barGroups.exit().remove(); // exit, remove the g
        // enter, append the g
        const bargEnter = barGroups.enter() 
            .append("g")
            .attr("class", "bargroup");
        
        bargEnter.append("rect")
                .attr("class", "bar")
                .attr("x", (d) => x(d.Name) )
                .attr("y", (d) => y(d['Rate Count']))
                .attr("width", function(d) { return Math.max(x(d['Rate Count']), 10); } )
                .attr("height", y.bandwidth())
                .style("opacity",1)
                .style("fill",function(d){
                    var index = geo_regions.indexOf(d.region);
                    return greens[index] || 'red';
                    // var temp_val = level_thresh.find((element) => element >= (+d[1]) )
                    // if (temp_val === undefined){
                    //     return greens[3];
                    // }else{
                    //     return greens[level_thresh.indexOf(temp_val)];
                    // }
                })
                .on("mouseover", onMouseOver)
                .on("mouseout", onMouseOut)
                .on("click",onMouseClick);
        
        bargEnter.append("text")
                    .attr("class", "bar_tick")
                    .attr("fill","white")
                    .attr("dx", ".5em")
                    .attr("dy", "1.2em")
                    .style("cursor", "pointer")
                    .text(function(d) { return d.Name; })
                    .on("mouseover", onMouseOver)
                    .on("mouseout", onMouseOut);
    
        barGroups = bargEnter.merge(barGroups); // enter + update on the g
    
        barGroups.attr('transform', function(d){ // enter + update, position the g
            return 'translate(0,' + y(d.Name) + ')';
        });
    
        barGroups.select("rect")
            .transition().duration(300)
            .attr("x", (d) => x(d.Name) )
            .attr("y", (d) => y(d['Rate Count']))
            .style("fill",function(d){
                var index = geo_regions.indexOf(d.region);
                return greens[index];
        });

        barGroups.select("text") // enter + update on subselection
            .transition().duration(300)
            .text(function(d) { return d.Name; });
    
        //Handler for mouseover event
        function onMouseOver(d, i) {
            d3.select(this)
                .transition()
                .duration(400)
                .attr('width', function(d) { return x(+d['Rate Count']) +10; });

            tooltipBox
                .style("left", (d.layerX+10) + "px")
                .style("top", (d.layerY-10) + "px")
                .transition().duration(1)
                .style('opacity', 1);

            tooltipBox.html("<span class='tooltipHeader'>" + i['Name'] + "</span></br>" + 
                "<span class='tooltip-row-name'>Country: </span><span class='tooltip-win'>" + i['Country'] + 
                "</span></br>" + "<span class='tooltip-row-name'>Brand: </span><span class='tooltip-win'>" + i['Brand'] + 
                " </span></br>" + "<span class='tooltip-row-name'>ABV: </span><span class='tooltip-win'>" + i['ABV'] + 
                " </span></br>" + "<span class='tooltip-row-name'>Price: </span><span class='tooltip-win'>" + i['Price'] + 
                " </span></br>" + "<span class='tooltip-row-name'>Rating: </span><span class='tooltip-win'>" + i['Rating'] + 
                " </span></br>" + "<span class='tooltip-row-name'>Rate Count: </span><span class='tooltip-win'>" + i['Rate Count'] + 
                "</span>");


            // var hilt_text = canvas.append("g")
            //                         .attr("id","hilt_text");
            // hilt_text.append("text")
            //         .attr('class', 'bar_val')
            //         .attr("fill","white")
            //         .attr('x', function() {return width - 15;})
            //         .attr('y', function() {return y(i.Name);})
            //         .attr("dy", "1em")
            //         .text(function() {  return (+i['Rate Count']).toFixed(1); });
            };
    
    
        //Handler for mouseout event
        function onMouseOut(d, i) {
            // use the text label class to remove label on mouseout
            d3.select(this)
                .transition()
                .duration(400)
                .attr("width", function(d) { return Math.max(x(d['Rate Count']), 10); } );

            // d3.selectAll('.bar_val').remove()

            tooltipBox.style('opacity', 0);

        };
    
        //Handler for mouseclick event
        function onMouseClick(d, i) {
            
            selectCountry(i["Country"])
            // if (d3.select("#conflb").classed('active') == true ){
            //     // when CONF is checked
            // draw_scatter.highLightPoint('CONF',d.key);
            // }else{
            //     draw_scatter.highLightPoint('SEED',d.key);
            // }
    
            // var stateTemp = d3.nest()
            //         .key(function(d) { return d.STATE; })
            //         .rollup(function(v) { return  v.length; })
            //         .entries(brushed_data);
            // draw_choro.updateMap(stateTemp);

        };
    }

    return (
        <div>
            <h3 style={{position:'absolute', top: '-50px', left: '0'}}>Most Rated {props.type}</h3>
            <div id="recommand" class="bar_area"></div>
        </div>
    )
}

export default Recommand