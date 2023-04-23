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

    var level_thresh = [0.22948346,0.49744762,0.79435826];
    var greens =['#f0f9e8', '#bae4bc','#7bccc4','#43a2ca','#0868ac'];

    //set values
    var margin = { top: 20, right: 80, bottom: 60, left: 10 },
    width  = 400 - margin.left - margin.right,
    height = 450 - margin.top  - margin.bottom;

    var y = d3.scaleBand().range([height, 0]).padding(0.3);
    var x = d3.scaleLinear().range([0, width]);

    var draw_bars = function () {
        var confData = Array.from(d3.rollup(props.data, v => d3.mean(v, function(d) { return +d.BARTHAG; }), d => d.CONF))
        console.log(confData);
        // Create canvas
        var svg1 = d3.select("#recommand")
            .append("svg")
            .attr("width",  width  + margin.left + margin.right)
            .attr("height", height + margin.top  + margin.bottom)
            .attr("id","bar_svg");

        var canvas = svg1.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // insert x axis
        var x_axis = canvas.append("g")
                .attr("transform", "translate(0," + height + ")")
                .attr("class","myaxis")
                .call(d3.axisBottom(x));

        var x_grid =canvas.append("g")			
            .attr("class", "grid")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
                    .ticks(8)
                    .tickSize(-height)
                    .tickFormat(""));

        updateBars(confData, x_axis, x_grid, canvas);
    }

    var updateBars = function(data, x_axis, x_grid, canvas) {
        // debugger
        // var Data_cp = JSON.parse(JSON.stringify(data)); 
        // var Data_cp = JSON.parse(JSON.stringify(data))
        // console.log(Data_cp);

        // Data_cp.forEach((e)=>e.value = 0);
        // console.log(Data_cp);
        // Data_cp.forEach(function(e) {
        //     for(var j = 0; j < data.length; j++){
        //         if(data[j].key == e.key){
        //             return e.value = data[j].value;
        //         }
        //     }
        // });
        // console.log(Data_cp);
    
        // update the y-axis domain -----------
        //y.domain( data.map(function(d){ return d[myVar]; }) );
        y.domain(data.map(function(d){ return d[0]; }) );


        x.domain([0,1]);
        x_axis.call(d3.axisBottom(x))
                .selectAll("text")
                .attr("y", 15)
                .attr("x", 10)
                .attr("dy", ".35em")
                .attr("transform", "rotate(30)")
                .attr("class","myaxis");
        // add the X gridlines
        x_grid.call(d3.axisBottom(x)
                    .ticks(8)
                    .tickSize(-height)
                    .tickFormat(""));

        // canvas.selectAll(".bar")
        //     .data(Data_cp)
        //     .enter().append("rect")
        //     .attr("class", "bar")
        //     .attr("x", (d) => xScale(d.key) )
        //     .attr("y", (d) => yScale(d.value))
        //     .attr("width", xScale.bandwidth())
        //     .attr("height", (d) => height - yScale(d.value))
        //     .attr("fill", "steelblue");

        var barGroups = canvas.selectAll(".bargroup").data(data);
        console.log(barGroups)
    
        barGroups.exit().remove(); // exit, remove the g
        // enter, append the g
        const bargEnter = barGroups.enter() 
            .append("g")
            .attr("class", "bargroup");
        
        bargEnter.append("rect")
                .attr("class", "bar")
                .attr("width", function(d) { return x(+d[1]); } )
                .attr("height", y.bandwidth())
                .style("opacity",0.8)
                .style("fill",function(d){
                    var temp_val = level_thresh.find((element) => element >= (+d[1]) )
                    if (temp_val === undefined){
                        return greens[3];
                    }else{
                        return greens[level_thresh.indexOf(temp_val)];
                    }
                })
                .on("mouseover", onMouseOver)
                .on("mouseout", onMouseOut)
                .on("click",onMouseClick)
                ;
        
        bargEnter.append("text")
                    .attr("class", "bar_tick")
                    .attr("fill","white")
                    .attr("dx", ".5em")
                    .attr("dy", "1em")
                    .text(function(d) { return d[0]; });
    
        barGroups = bargEnter.merge(barGroups); // enter + update on the g
    
        barGroups.attr('transform', function(d){ // enter + update, position the g
            return 'translate(0,' + y(d[0]) + ')';
        });
    
        barGroups.select("rect")
            .transition().duration(300)
            .attr("width", function(d) { return x(+d[1]); } )
            .attr("height", y.bandwidth())
            .style("fill",function(d){
            var temp_val = level_thresh.find( (element) => element >= (+d[1]) )
            if (temp_val === undefined){
                return greens[3];
            }else{
                return greens[level_thresh.indexOf(temp_val)];
            }
        });
    
        //Handler for mouseover event
        function onMouseOver(d, i) {
            d3.select(this)
                .transition()
                .duration(400)
                .attr('width', function(d) { return x(+d[1]) +10; });

            var hilt_text = canvas.append("g")
                                    .attr("id","hilt_text");
            hilt_text.append("text")
                    .attr('class', 'bar_val')
                    .attr("fill","white")
                    .attr('x', function() {return x(+d[1]) + 15;})
                    .attr('y', function() {return y(d.key);})
                    .attr("dy", "1em")
                    .text(function() {return (+d[1]).toFixed(4); });};
    
    
        //Handler for mouseout event
        function onMouseOut(d, i) {
            // use the text label class to remove label on mouseout
            d3.select(this)
                .transition()
                .duration(400)
                .attr("width", function(d) { return x(+d[1]); } );

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

        barGroups.select("text") // enter + update on subselection
            .transition().duration(300)
            .text(function(d) { return d[0]; });
    }

    return <div id="recommand" class="bar_area"></div>
}

export default Recommand