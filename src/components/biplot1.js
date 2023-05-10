import * as d3 from "d3";
import { useEffect, useState, useRef } from 'react'
import '../css/biplot.css'
import Slider from 'react-rangeslider'
// To include the default styles
import 'react-rangeslider/lib/index.css'

const Biplot1 = (props) => {

    const [year, setYear] = useState("2015");
    useEffect(() => {
        
        if(props.data.length == 0 || props.wdata.length == 0) return;
        //genre changed, but consumption data not changed
        if (props.genre === 'consumption' && props.data.scatter.length != 438) return;
        removeChart();
        draw_scatter(year);
        
    }, [props.data, props.genre, year])

    const removeChart = () => {
        const svg = d3.select("#biplot").select("svg")
        svg.selectAll("*").remove();
        svg.remove();
        const div = d3.select("#biplot").selectAll("div")
        div.selectAll("*").remove();
        div.remove();
    }
    
    
    var draw_scatter = function(year){


        console.log(props.genre);
        //console.log(props.data);
        let data = []
        props.genre === 'consumption' ? 
                data = {scatter : props.data.scatter.filter(item => item.Year === year), vector: props.data.vector} : data = props.data 
        
        var cat_attrs = ["first_pca","second_pca"];
        var colors = d3.scaleOrdinal().range(['#5bfc70', '#23fcd4','#82ccc6', '#41ae76', '#005824']);
        var geo_regions = [...new Set(data.scatter.map(item => item.label))];
        
        var xattr = cat_attrs[0]
        var yattr = cat_attrs[1]

        var tooltipBox = d3.select("#biplot")
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
        var margin = { top: 50, right: 50, bottom: 50, left: 50 },
        width  = 600 - margin.left - margin.right,
        height = 410 - margin.top  - margin.bottom;
    
    
    
        // create canvas for scatter plot
        var svg1 = d3.select("#biplot")
                        .append("svg")
                        .attr("width",  width  + margin.left + margin.right)
                        .attr("height", height + margin.top  + margin.bottom);
    
        var canvas1 = svg1.append("g")
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        var x = d3.scaleLinear().range([0, width]).domain(d3.extent(data.scatter, (d) => Number(d[xattr])));
        var yextent = d3.extent(data.scatter, (d) => +d[yattr])

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
                return b["first_pca"] - a["first_pca"];    // 降序
            })
            var top10 = brushed_data.slice(0, 10).reverse()
            //props.selectChange(top10);
        }
      }
    
      function highLightPoint(filterVar, filterVal){
         console.log(filterVal)
         alert("in hightlight")
          canvas1.selectAll('circle')
                .classed("hidden", function(d){
                    if (d[filterVar] in filterVal){
                        return false;
                    }else{
                        return true;
                    }
                })
                .classed("brushed", function(d){
                    if (d[filterVar] in filterVal){
                        return true;
                    }else{
                        return false;
                    }
                });
        // update radar
        var brushed_data =  d3.selectAll(".brushed").data(); 
        //props.selectChange(brushed_data)
      }

        draw_scatter.highLightPoint = highLightPoint;
    
         // Add scatter plots for new data
        var scatters = canvas1.selectAll(".circle")
                            .data(data.scatter)
                            .enter()
                            .append("circle")
                            .attr("class", "circle")
                            .attr('cx',(d) => x(+d[xattr])  )
                            .attr('cy',(d) => y(+d[yattr]) )
                            .attr("r", 5)
                            .style("opacity",0)
                            .on("mouseover", function (event, d) {

                            tooltipBox
                                .style("left", (event.layerX+10) + "px")
                                .style("top", (event.layerY-10) + "px")
                                .transition().duration(1)
                                .style('opacity', 1);
            
                            //tooltipBox.html("<span class='tooltipHeader'>" + d['Date'] + "</span></br>" + "<span class='tooltip-row-name'>Team: </span><span class='tooltip-opponent'>" + d['Team'] + "</span></br>" + "<span class='tooltip-row-name'>Win / Loss: </span><span class='tooltip-win'>Win" + "</span></br>" + "<span class='tooltip-row-name'>Opponent: </span><span class='tooltip-opponent'>" + d['Opponent'] + "</span>");
                            tooltipBox.html("<span class='tooltipHeader'>" + d['Country'] + "</span></br>" + 
                                "<span class='tooltip-row-name'>Consumption: </span><span class='tooltip-win'>" + d['Total alcohol consumption per capita (liters of pure alcohol, projected estimates, 15+ years of age)'] + " liters" +
                                "</span></br>" + "<span class='tooltip-row-name'>GDP: </span><span class='tooltip-win'>" + Number(d['GDP per capita, PPP (constant 2017 international $)']).toFixed(2) + 
                                " </span></br>" + "<span class='tooltip-row-name'>Population: </span><span class='tooltip-win'>" + (Number(d['Population (historical estimates)'])/1000000).toFixed(2) + "M" +
                                "</span>");
                            // tooltipBox.show();
                        
                            })
                            .on("mouseout",function(){tooltipBox.style('opacity', 0);})
                            //.on("click",onMouseClick)  
                            .style("fill", (d) => colors(d.label));
                    // if there is no brush, select top10 at the beginning
                    var data_cp = JSON.parse(JSON.stringify(data.scatter))
                    data_cp.sort(function(a,b){ // 这是比较函数
                        return (
                        b['first_pca'] - a['first_pca']
                        )
                    })
        var top10 = data_cp.slice(0, 10).reverse()
        //props.selectChange(top10);

        scatters.transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .style('opacity', 0.6)

        //add path for PCA vector
        const path_x = data.vector.map(s => s.first_pca)
        const path_y = data.vector.map(s => s.second_pca)
        const ind = data.vector.map(s => s.ind)
        var x_path = []
        var y_path = []
        for(let i = 0;i<path_x.length;i++){
            x_path.push(0)
            x_path.push(path_x[i])
            y_path.push(0)
            y_path.push(path_y[i])
        }


        canvas1.append("g")
            .selectAll("dot")
            .data(path_y)
            .enter()
            .append("circle")
                .attr("cx", (d,i)=>x(path_x[i]))
                .attr("cy", d=>y(d))
                .attr("r", 3)
                .attr("fill", "black")

        canvas1.selectAll(".lines")
            .data(path_y)
            .enter().append("text")
            .attr("class", "lines")
            .attr("x", (d,i)=> path_x[i] > 0 ? x(3*path_x[i]) + 5 : x(3*path_x[i]) - 5)
            .attr("y",(d, i)=> i==1 ? y(3*d) - 5: y(3*d) + 2)
            .attr("text-anchor", (d,i)=>path_x[i] > 0 ? 'start' : 'end')
            .text((d,i)=>ind[i])
            .style("font-size", "12px")      
            .attr("stroke", "white")
            .attr('stroke-width', '1px');

        
        canvas1.append("path")
            .datum(y_path)
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x((d,i)=>x(3*x_path[i]))
                .y(d=>y(3*d)))
            .attr('stroke-width', '4px');



        
        function xChange() {
            d3.select(".brush").remove();
            xattr = this.value
            x.domain(d3.extent(data.scatter, (d) => +d[xattr] ) );
   
            x_axis.transition()
                .duration(200)
                .call(d3.axisBottom(x)); 

            x_text.transition()
                .duration(200)
                .text(xattr);  
    
            
            d3.select('#biplot')        
                    .selectAll('circle')
                    .transition()
                    .duration(800)
                    .attr('cx',function (d) { return x(+d[xattr]) })
                    .style("fill", (d) => colors(d.label));
            //if (props.genre === 'production')
                canvas1.call(brush);
          }
    
        function yChange() {
        d3.select(".brush").remove();

        yattr = this.value

        y.domain(d3.extent(data.scatter, (d) => +d[yattr]));

        y_axis.transition()
                .duration(200)
                .call(d3.axisLeft(y)); 

        y_text.transition()
                .duration(200)
                .text(yattr);  

        
        
        d3.select('#biplot')        
                .selectAll('circle')
                .transition()
                .duration(800)
                .attr('cy',function (d) { return y(+d[yattr]) })
                .style("fill", (d) => colors(d.label));
                //if (props.genre === 'production')
                    canvas1.call(brush);
        }
    
        function brushended(event) {
            if (!event.selection) {
                canvas1.selectAll('circle')
                  .transition()
                  .duration(150)
                  .ease(d3.easeLinear)
                  .style("fill", (d) => colors(d.label));
            }
        }

       
    }

    const handleChange = (value) => {
        console.log(value.toString());
        //alert("setYear called!!")
        setYear(value.toString());
      };

     const handleChangeStart = () => {
        //console.log('Change event started')
      };
    
    
    const  handleChangeComplete = () => {
        //console.log('Change event completed')
      };

    return (

        <div>
            <div id="biplot"></div>
            { (props.genre === 'consumption') ? 
                <div className='slider'>
                    <Slider
                    min={2000}
                    max={2015}
                    step={5}
                    value={year}
                    onChangeStart={handleChangeStart}
                    onChange={handleChange}
                    onChangeComplete={handleChangeComplete}
                    />
                    <div className='value'>{year}</div>
                </div>
            : <div></div> }
            
        </div>
    );
}


export default Biplot1