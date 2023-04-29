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
        const div = d3.select("#scatter_area").selectAll("div")
        div.selectAll("*").remove();
        div.remove();
    }

    var cat_attrs = ['Price', 'Rating', 'ABV', 'Rate Count'];
    var colors = d3.scaleOrdinal().range(['#5bfc70', '#23fcd4','#82ccc6', '#41ae76', '#005824']);
    var geo_regions = ['Africa','Americas','Eastern Mediterranean','Europe'];

    var xattr = 'Price'
    var yattr = 'Rating'

    var draw_scatter = function(){
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
    
        //set values
        var margin = { top: 50, right: 100, bottom: 60, left: 50 },
        width  = 700 - margin.left - margin.right,
        height = 410 - margin.top  - margin.bottom;
    
        var num_attrs = Object.keys(props.data[0]).filter(function(d) { return cat_attrs.includes(d); });
    
        // X-axis dropdown menu
        var x_opt = d3.select("#scatter_area")
                        .append("div")
                        .style("display",  "table-cell")
                        .style("padding-left","50px")
                        .style("width","150px");
    
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
                            .property("selected", (d) => d === xattr);
        
        // Y-axis dropdown menu
        var y_opt = d3.select("#scatter_area")
                        .append("div")
                        .style("display",  "table-cell")
                        .style("padding-left","50px")
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
                                .property("selected", (d) => d === yattr);
    
        // create canvas for scatter plot
        var svg1 = d3.select("#scatter_area")
                        .append("svg")
                        .attr("width",  width  + margin.left + margin.right)
                        .attr("height", height + margin.top  + margin.bottom);
    
        var canvas1 = svg1.append("g")
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        var x = d3.scaleLinear().range([0, width]).domain(d3.extent(props.data, (d) => Number(d.Price)));
        var yextent = d3.extent(props.data, (d) => d.Rating)

        var y = d3.scaleLinear().range([height, 0]).domain([yextent[0], 1.02 * yextent[1]]);
        
        //insert  x axis
        var x_axis = canvas1.append("g")
                            .attr("transform", "translate(0," + height + ")")
                            .attr("class", "myaxis")
                            .call(d3.axisBottom().scale(x)); 
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
            brushed_data.sort(function(a,b){ // 这是比较函数
                return b['Rate Count'] - a['Rate Count'];    // 降序
            })
            var top10 = brushed_data.slice(0, 10).reverse()
            props.selectChange(top10);
        }
      }
    
      function highLightPoint(filterVar, filterVal){
          xattr = d3.select("#xSelect").node().value;
          yattr = d3.select('#ySelect').node().value;
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
        props.selectChange(brushed_data)
      }

        draw_scatter.highLightPoint = highLightPoint;
    
         // Add scatter plots for new data
        var scatters = canvas1.selectAll(".circle")
                            .data(props.data);
                                
        scatters.enter()
                .append("circle")
                .attr("class", "circle")
                .attr('cx',(d) => x(+d[xattr])  )
                .attr('cy',(d) => y(+d[yattr]) )
                .attr("r", 5)
                .style("opacity",0.6)
                .on("mouseover", function (event, d) {

                    tooltipBox
                        .style("left", (event.layerX+10) + "px")
                        .style("top", (event.layerY-10) + "px")
                        .transition().duration(1)
                        .style('opacity', 1);
    
                    //tooltipBox.html("<span class='tooltipHeader'>" + d['Date'] + "</span></br>" + "<span class='tooltip-row-name'>Team: </span><span class='tooltip-opponent'>" + d['Team'] + "</span></br>" + "<span class='tooltip-row-name'>Win / Loss: </span><span class='tooltip-win'>Win" + "</span></br>" + "<span class='tooltip-row-name'>Opponent: </span><span class='tooltip-opponent'>" + d['Opponent'] + "</span>");
                    tooltipBox.html("<span class='tooltipHeader'>" + d['Name'] + "</span></br>" + 
                        "<span class='tooltip-row-name'>Country </span><span class='tooltip-win'>" + d['Country'] + 
                        "</span></br>" + "<span class='tooltip-row-name'>Brand </span><span class='tooltip-win'>" + d['Brand'] + 
                        " </span></br>" + "<span class='tooltip-row-name'>ABV: </span><span class='tooltip-win'>" + d['ABV'] + 
                        "</span>");
                    // tooltipBox.show();
            
                })
                .on("mouseout",function(){tooltipBox.style('opacity', 0);})
                .style("fill", (d) => colors(geo_regions.indexOf(d.region)));
        // if there is no brush, select top10 at the beginning
        var data_cp = JSON.parse(JSON.stringify(props.data))
        data_cp.sort(function(a,b){ // 这是比较函数
            return b['Rate Count'] - a['Rate Count'];    // 降序
        })
        var top10 = data_cp.slice(0, 10).reverse()
        props.selectChange(top10);
        
        function xChange() {
            d3.select(".brush").remove();
            xattr = this.value
            x.domain(d3.extent(props.data, (d) => +d[xattr] ) );
   
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
                    .style("fill", (d) => colors(geo_regions.indexOf(d.region)));
            canvas1.call(brush);
          }
    
        function yChange() {
        d3.select(".brush").remove();

        yattr = this.value

        y.domain(d3.extent(props.data, (d) => +d[yattr]));

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
                .style("fill", (d) => colors(geo_regions.indexOf(d.region)));
        canvas1.call(brush);
        }
    
        function brushended(event) {
            if (!event.selection) {
                canvas1.selectAll('circle')
                  .transition()
                  .duration(150)
                  .ease(d3.easeLinear)
                  .style("fill", (d) => colors(geo_regions.indexOf(d.region)));
            }
        }
    }

    return <div id="scatter_area"></div>
}


export default Scatterplot