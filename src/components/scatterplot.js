import * as d3 from "d3";
import { useEffect } from "react";

const Scatterplot = (props) => {

    useEffect(() => {
        if (!props.data.length) return;
        removeChart();
        draw_scatter();
    }, [props.data])

    const removeChart = () => {
        const svg = d3.select("#scatter_area").select("svg")
        svg.selectAll("*").remove();
        svg.remove();
        const div1 = d3.select("#scatter_area").select("div")
        div1.selectAll("*").remove();
        div1.remove();
        const div2 = d3.select("#scatter_area").select("div")
        div2.selectAll("*").remove();
        div2.remove();
    }

    var cat_attrs = ['TEAM', 'CONF', 'POSTSEASON', 'SEED', 'STATE', 'GEO_REGION',"G","W"];
    var colors = d3.scaleOrdinal().range(['#5bfc70', '#23fcd4','#82ccc6', '#41ae76', '#005824']);
    var geo_regions = ['West','Southeast','Midwest','Southwest','Northeast'];

    var tooltipBox = d3.select("#scatter_area")
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

    var draw_scatter = function(){
        //set values
        var margin = { top: 50, right: 100, bottom: 60, left: 50 },
        width  = 600 - margin.left - margin.right,
        height = 390 - margin.top  - margin.bottom;
    
        var num_attrs = Object.keys(props.data[0]).filter(function(d) { return !cat_attrs.includes(d); });
    
        // X-axis dropdown menu
        var x_opt = d3.select("#scatter_area")
                        .append("div")
                        .style("display",  "table-cell")
                        .style("padding-left","150px")
                        .style("width","450px");
    
        x_opt.append('label').text('X-Axis:');
        x_opt.append('br');
        var x_change = x_opt.append('select')
                                .attr('id','xSelect')
                                .on('change',xChange)
                                .selectAll('option')
                                .data(num_attrs)
                                .enter()
                            .append('option')
                                .attr('value', (d)=>d)
                                .text((d)=>d)
                                .property("selected", (d) => d === "2P_O");
        
        // Y-axis dropdown menu
        var y_opt = d3.select("#scatter_area")
                        .append("div")
                        .style("display",  "table-cell")
                        .style("padding-left","150px")
                        .style("width","450px");
                        
    
        y_opt.append('label').text('Y-Axis:');
        y_opt.append('br');
        var y_change = y_opt.append('select')
                                .attr('id','ySelect')
                                .on('change',yChange)
                                .selectAll('option')
                                .data(num_attrs)
                                .enter()
                                .append('option')
                                .attr('value', (d)=>d)
                                .text((d)=>d)
                                .property("selected", (d) => d === "EFG_O");
    
        // create canvas for scatter plot
        var svg1 = d3.select("#scatter_area")
                        .append("svg")
                        .attr("width",  width  + margin.left + margin.right)
                        .attr("height", height + margin.top  + margin.bottom);
    
        var canvas1 = svg1.append("g")
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        // canvas1.call(tooltipBox);
       
        var x = d3.scaleLinear().range([0, width]).domain([35, 65]);
        var y = d3.scaleLinear().range([height, 0]).domain([40, 60]);
        
        //insert  x axis
        var x_axis = canvas1.append("g")
                            .attr("transform", "translate(0," + height + ")")
                            .attr("class", "myaxis")
                            .call(d3.axisBottom(x)); 
        // x label
        var x_text = canvas1.append("g")
            .attr("transform", "translate(0," + height + ")");
        x_text.append("text")
            .attr("y", height - 400)
            .attr("x", width )
            .attr("text-anchor", "end")
            .attr("fill","black")
            .attr("font-weight","bold")
            .attr("font-size","12px");            
        
    
        // insert y axis
        var y_axis = canvas1.append("g")
            .attr("class", "myaxis")
            .call(d3.axisLeft(y));
        // y label 
        var y_text = canvas1.append("g")
                            .attr("transform", "translate(20,40)")
        y_text.append("text")
                .attr("x",10)
                .attr("y", 10)
                .attr("dy", "-5.1em")
                .attr("text-anchor", "end")
                .attr("fill","black")
                .attr("font-weight","bold")
                .attr("font-size","12px");
        
        var brush = d3.brush()
            .on("start", brushstart)
            .on("brush", brushmove)
            .on("end", brushend)
            .extent([[0,0],[width,height]]);
    
        canvas1.call(brush);
        var brushCell;
        // Clear the previously-active brush, if any.
        function brushstart() {
            if (brushCell !== this) {
                d3.select(brushCell).call(brush.move, null);
                brushCell = this;
            }
        }
    
      // Highlight the selected circles.
      function brushmove(event) {
          var xattr = d3.select("#xSelect").node().value;
          var yattr = d3.select('#ySelect').node().value;
    
          var high_region = event.selection,
          x0 = high_region[0][0],
          y0 = high_region[0][1],
          dx = high_region[1][0] - x0,
          dy = high_region[1][1] - y0;
    
          canvas1.selectAll('circle')
            .classed("hidden", function(d){
                if (x(+d[xattr]) >= x0 && x(+d[xattr]) <= x0 + dx && y(+d[yattr]) >= y0 && y(+d[yattr]) <= y0 + dy){
                    return false;
                } else {
                    return true;
                }
            })
            .classed("brushed", function(d){
                if (x(+d[xattr]) >= x0 && x(+d[xattr]) <= x0 + dx && y(+d[yattr]) >= y0 && y(+d[yattr]) <= y0 + dy){
                    return true;
                }else{
                    return false;
                }
            });
      }
    
      // If the brush is empty, select all circles.
      function brushend() {
        var e = d3.brushSelection(this);
        if (e === null) {canvas1.selectAll(".hidden").classed("hidden", false);}
        else {
            var brushed_data =  d3.selectAll(".brushed").data(); 
            // draw_radars(brushed_data);
    
            //update bars
            // check the status of btns
            // if (d3.select("#conflb").classed('active') == true ){
                // when CONF is checked
            // var confTemp = d3.nest()
            //         .key(function(d) { return d.CONF; })
            //         .rollup(function(v) { return  d3.mean(v, function(d) { return +d.BARTHAG; });})
            //         .entries(brushed_data);

            // var confTemp = d3.rollup(brushed_data, v => d3.mean(v, function(d) { return +d.BARTHAG; }), d => d.CONF)

                    
            // draw_bars.updateBars(confTemp,'CONF');

            props.selectChange(brushed_data)


            // } else {
            //     // when SEED is checked
            //     var seedTemp = d3.nest()
            //             .key(function(d) { return d.SEED; })
            //             .rollup(function(v) { return  d3.mean(v, function(d) { return +d.BARTHAG; });})
            //             .entries(brushed_data);
                        
            //     draw_bars.updateBars(seedTemp,'SEED');
            // }
        }
      }
    
      function highLightPoint(filterVar, filterVal){
          var xattr = d3.select("#xSelect").node().value;
          var yattr = d3.select('#ySelect').node().value;
          canvas1.selectAll('circle')
                .classed("hidden", function(d){
                    if (d[filterVar] == filterVal){
                        return false;
                    }else{
                        return true;
                    }
                })
                .classed("brushed", function(d){
                    if (d[filterVar] == filterVal){
                        return true;
                    }else{
                        return false;
                    }
                });
        // update radar
        var brushed_data =  d3.selectAll(".brushed").data(); 
        // debugger
        // draw_radars(brushed_data);
    
        //update bars
        // if (d3.select("#conflb").classed('active') == true ){
        // when CONF is checked
        // var confTemp = d3.nest()
        //         .key(function(d) { return d.CONF; })
        //         .rollup(function(v) { return  d3.mean(v, function(d) { return +d.BARTHAG; });})
        //         .entries(brushed_data);

        // var confTemp = d3.rollup(brushed_data, v => d3.mean(v, function(d) { return +d.BARTHAG; }), d => d.CONF)
                
        // draw_bars.updateBars(confTemp,'CONF');
        props.selectChange(brushed_data)

        // } else {
        //     // when SEED is checked
        //     var seedTemp = d3.nest()
        //             .key(function(d) { return d.SEED; })
        //             .rollup(function(v) { return  d3.mean(v, function(d) { return +d.BARTHAG; });})
        //             .entries(brushed_data);
                    
        //     draw_bars.updateBars(seedTemp,'SEED');
        // }
      }
      draw_scatter.highLightPoint = highLightPoint;
    
         // Add scatter plots for new data
        var scatters = canvas1.selectAll(".circle")
                            .data(props.data);
                                
        scatters.enter()
                .append("circle")
                .attr("class", "circle")
                .attr('cx',(d) => x(+d[num_attrs[11]])  )
                .attr('cy',(d) => y(+d[num_attrs[3]]) )
                .attr("r", 5)
                .style("opacity",0.6)
                .on("mouseover", function (event, d) {
    
                    //tooltipBox.html("<span class='tooltipHeader'>" + d['Date'] + "</span></br>" + "<span class='tooltip-row-name'>Team: </span><span class='tooltip-opponent'>" + d['Team'] + "</span></br>" + "<span class='tooltip-row-name'>Win / Loss: </span><span class='tooltip-win'>Win" + "</span></br>" + "<span class='tooltip-row-name'>Opponent: </span><span class='tooltip-opponent'>" + d['Opponent'] + "</span>");
                    tooltipBox.html("<span class='tooltipHeader'>" + d['TEAM'] + "</span></br>" + 
                    "<span class='tooltip-row-name'>Conference </span><span class='tooltip-win'>" + d['CONF'] + 
                    "</span></br>" + "<span class='tooltip-row-name'>SEED </span><span class='tooltip-win'>" + d['SEED'] + 
                    " </span></br>" + "<span class='tooltip-row-name'>Post Season: </span><span class='tooltip-win'>" + d['POSTSEASON'] + 
                    "</span>");
                    // tooltipBox.show();
                    tooltipBox
                    .style("left", (event.layerX+10) + "px")
                    .style("top", (event.layerY-10) + "px")
                    .transition().duration(1)
                    .style('opacity', 1);
                })
                .on("mouseout",function(){tooltipBox.style('opacity', 0);})
                .style("fill", (d) => colors(geo_regions.indexOf(d.GEO_REGION)));
        
        function xChange() {
            d3.select(".brush").remove();
    
            var xattr = this.value
            switch(xattr) {
                case "LON":
                    x.domain([-130,-65]);
                    break;
                case "LAT":
                    x.domain([24,50]);
                    break;
                default:
                    x.domain(d3.extent(props.data, (d) => +d[xattr] ) );
                    break;
            }
    
              x_axis.transition()
                    .duration(200)
                    .call(d3.axisBottom(x)); 
    
              x_text.transition()
                    .duration(200)
                    .text(xattr);  
    
            
            d3.select('#scatter_area')        
                    .selectAll('circle')
                    .transition()
                    .duration(800)
                    .attr('cx',function (d) { return x(+d[xattr]) })
                    .style("fill", (d) => colors(geo_regions.indexOf(d.GEO_REGION)));
            canvas1.call(brush);
          }
    
        function yChange() {
        d3.select(".brush").remove();

        var yattr = this.value

        switch(yattr){
            case "LON":
                y.domain([-130,-65]);
                break;
            case "LAT":
                y.domain([24,50]);
                break;
            default:
                y.domain(d3.extent(props.data, (d) => +d[yattr]  ));
                break;
        }

        
        y_axis.transition()
                .duration(200)
                .call(d3.axisLeft(y)); 

        y_text.transition()
                .duration(200)
                .text(yattr);  

        
        
        d3.select('#scatter_area')        
                .selectAll('circle')
                .transition()
                .duration(800)
                .attr('cy',function (d) { return y(+d[yattr]) })
                .style("fill", (d) => colors(geo_regions.indexOf(d.GEO_REGION)));
        canvas1.call(brush);
        }
    
        function brushended(event) {
            if (!event.selection) {
                canvas1.selectAll('circle')
                  .transition()
                  .duration(150)
                  .ease(d3.easeLinear)
                  .style("fill", (d) => colors(geo_regions.indexOf(d.GEO_REGION)));
            }
        }
        
    }

    return <div id="scatter_area"></div>
}


export default Scatterplot