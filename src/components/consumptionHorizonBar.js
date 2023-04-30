import * as d3 from "d3";
import { useEffect , useRef} from "react";

const ConsumptionHorizonBar= (props) => {

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


    // // var level_thresh = [0.22948346,0.49744762,0.79435826];
    var greens =['#f0f9e8', '#bae4bc','#7bccc4','#43a2ca','#0868ac'];
    // var geo_regions = ['Africa','Americas','Eastern Mediterranean','Europe'];
    
    //set values
    var margin = { top: 30, right: 80, bottom: 60, left: 8 },
    width  = 400 - margin.left - margin.right,
    height = 450 - margin.top  - margin.bottom;

    var y = d3.scaleBand().range([height, 0]).padding(0.3);
    var x = d3.scaleLinear().range([0, width]);

    var draw_bars = function () {
        var svg1 = d3.select("#recommand")
            .append("svg")
            .attr("width",  width  + margin.left + margin.right)
            .attr("height", height + margin.top  + margin.bottom)
            .attr("id","bar_svg");

        var canvas = svg1.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        

        // var x_axis = canvas.append("g")
        //         .attr("transform", "translate(0," + height + ")")
        //         .attr("class","myaxis")
        //         .call(d3.axisBottom().scale(x));

        

        // var x_grid = canvas.append("g")			
        //     .attr("class", "grid")
        //     .attr("transform", "translate(0," + height + ")")
        //     .call(d3.axisBottom()
        //             .scale(x)
        //             .ticks(8)
        //             .tickSize(-height)
        //             .tickFormat(""));
        
        var slicedData = props.data.slice(0, 5);
        Window.data =slicedData;
        updateBars(slicedData, props.selectCountry, canvas);
    }

    var updateBars = function(data, selectedCountry ,canvas) {

        var groups = data.map(d => d.Country);
        var subgroups = ["Wine_PerCapita", "Spirit_PerCapita", "Beer_PerCapita"]
        x.domain([0,1000]);
        y.domain(groups);
        // color palette = one color per subgroup
        var color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(["green", "orange", "purple"])
        
        

        canvas.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .attr("class","myaxis")
            .append("text")
            .attr("y", 30)
            .attr("x", width + 10)
            .attr("text-anchor", "end")
            .attr("stroke", "black")
            .text("consumption/capita");

        canvas.append("g")
            .call(d3.axisLeft(y).tickFormat((d) => {
                return d;
            }).ticks(10))
            .append("text")
            .attr("y", -5   )
            .attr("x", 2.5 * 4)
            .attr("dy", "-0.71em")
            .attr("text-anchor", "center")
            .attr("stroke", "black")
            .text("Country")
        // x.domain(d3.extent(data, (d) => d["Rate Count"]));

        //stack the data? --> stack per subgroup
        var stackedData = d3.stack()
        .keys(subgroups)
        (data)
        console.log(stackedData)
        var barGroups = canvas.selectAll(".bargroup").data(stackedData);
    
        barGroups.exit().remove(); // exit, remove the g
        // enter, append the g
        const bargEnter = barGroups
        .enter().append("g")
        .attr("fill", function(d) { return color(d.key); })
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(function(d) { return d; })
        .enter().append("rect")
          .attr("x", function(d) { return x(d[0]); })
          .attr("y", function(d) { return y(d.data.Country); })
          .attr("height",y.bandwidth()/2)
          .attr("width", function(d) { return - (x(d[0]) - x(d[1])); })
            //   .on("mouseover", onMouseOver)
            //     .on("mouseout", onMouseOut)
            //     .on("click",onMouseClick)   
          
        

        /*
        bargEnter.append("rect")
                .attr("class", "bar")
                .attr("x", (d) => x(d.Name) )
                .attr("y", (d) => y(d['Rate Count']))
                .attr("width", function(d) { return Math.max(x(d['Rate Count']), 10); } )
                .attr("height", y.bandwidth())
                .style("opacity",0.8)
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
                .on("click",onMouseClick)
                ;
        */
        
        bargEnter.append("text")
                    .attr("class", "bar_tick")
                    .attr("fill","grey")
                    .attr("dx", ".5em")
                    .attr("dy", "1.2em")
                    .text(function(d) { return d.Country; });
    
        // barGroups = bargEnter.merge(barGroups); // enter + update on the g
    
        // barGroups.attr('transform', function(d){ // enter + update, position the g
        //     return 'translate(0,' + y(d.Name) + ')';
        // });
    
        // barGroups.select("rect")
        //     .transition().duration(300)
        //     .attr("x", (d) => x(d.Name) )
        //     .attr("y", (d) => y(d['Rate Count']))
        //     .style("fill",function(d){
        //         var index = geo_regions.indexOf(d.region);
        //         return greens[index];
        // });

        // barGroups.select("text") // enter + update on subselection
        //     .transition().duration(300)
        //     .text(function(d) { return d.Name; });
    
        //Handler for mouseover event
        function onMouseOver(d, i) {
            d3.select(this)
                .transition()
                .duration(400)
                .attr('width', function(d) { return x(+d['Wine_PerCapita']) +10; });

            var hilt_text = canvas.append("g")
                                    .attr("id","hilt_text");
            hilt_text.append("text")
                    .attr('class', 'bar_val')
                    .attr("fill","grey")
                    .attr('x', function() {return x(+d['Wine_PerCapita']) + 15;})
                    .attr('y', function() {return y(d.Country);})
                    .attr("dy", "1em")
                    .text(function() {return (+d['Wine_PerCapita']).toFixed(4); });};
    
    
        //Handler for mouseout event
        function onMouseOut(d, i) {
            // use the text label class to remove label on mouseout
            d3.select(this)
                .transition()
                .duration(400)
                .attr("width", function(d) { return Math.max(x(d['Wine_PerCapita']), 10); } );

            d3.selectAll('.bar_val').remove()
        };
    
        //Handler for mouseclick event
        function onMouseClick(d, i) {
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

    return <div id="recommand" class="bar_area"></div>
}

export default ConsumptionHorizonBar