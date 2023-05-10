import * as d3 from "d3";
import { useEffect , useState} from "react";
import draw_scatter from "./scatterplot/consumptionScatterplot"
const ConsumptionHorizonBar= (props) => {
    const allKeys = ["Wine_PerCapita", "Spirit_PerCapita", "Beer_PerCapita"]
    const [keys, setKeys] = useState(allKeys);
    useEffect(() => {
        if(props.data.length == 0) return;
        removeChart();
        //setKeys(allKeys)
        draw_bars();
    }, [props.data, keys])

    const removeChart = () => {
        const svg = d3.select("#recommand").select("svg")
        svg.selectAll("*").remove();
        svg.remove();
    }


    // // var level_thresh = [0.22948346,0.49744762,0.79435826];
    var greens =['#f0f9e8', '#bae4bc','#7bccc4','#43a2ca','#0868ac'];
    const colors = ["green", "orange", "#50a1ca"]
    // var geo_regions = ['Africa','Americas','Eastern Mediterranean','Europe'];
    
    //set values
    var margin = { top: 50, right: 50, bottom: 50, left: 50 },
    width  = 450 - margin.left - margin.right,
    height = 450 - margin.top  - margin.bottom;

    var y = d3.scaleBand().range([height, 0]).padding(0.3);
    var x = d3.scaleLinear().range([0, width]);
    
    var tooltipBox;

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
            .style("visibility", "visible")

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
        updateBars(props.data, props.selectCountry, canvas);
    }

    var updateBars = function(data, selectCountry ,canvas) {
        var groups = data.map(d => d.Country);
        
        x.domain([0,d3.max(data, d => d.Alcohol_PerCapita)]);
        y.domain(groups);
        // color palette = one color per subgroup
        var color = d3.scaleOrdinal()
        .domain(keys)
        .range(colors)
        
        

        canvas.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .attr("class","myaxis")
            .append("text")
            .attr("y", 30)
            .attr("x", width + 50)
            .attr("text-anchor", "end")
            .attr("stroke", "white")
            .style("font-size", "14px")
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
            .attr("stroke", "white")
            .style("font-size", "14px")
            .text("Country")
        // x.domain(d3.extent(data, (d) => d["Rate Count"]));

        //stack the data? --> stack per subgroup
        var stackedData = d3.stack()
        .keys(keys)
        (data)
        console.log(stackedData)
        console.log(data)
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
          .attr("y", function(d) { return y(d.data.Country) + y.bandwidth()/4; })
          .attr("height",y.bandwidth()/2)
          .attr("width", function(d) { return - (x(d[0]) - x(d[1])); })
               .on("mouseover", onMouseOver)
                 .on("mouseout", onMouseOut)
                 .on("click",onMouseClick)   
          
        

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
                .attr('width', function(d) { return - (x(i[0]) - x(i[1])) + 10; });
            
            tooltipBox
                .style("left", (d.layerX+10) + "px")
                .style("top", (d.layerY-10) + "px")
                .transition().duration(1)
                .style('opacity', 1)
                .style('z-index', 1);

            //tooltipBox.html("<span class='tooltipHeader'>" + d['Date'] + "</span></br>" + "<span class='tooltip-row-name'>Team: </span><span class='tooltip-opponent'>" + d['Team'] + "</span></br>" + "<span class='tooltip-row-name'>Win / Loss: </span><span class='tooltip-win'>Win" + "</span></br>" + "<span class='tooltip-row-name'>Opponent: </span><span class='tooltip-opponent'>" + d['Opponent'] + "</span>");
            tooltipBox.html(
                "<span class='tooltip-row-name'>Country: </span><span class='tooltip-win'>" + i.data.Country + 
                "</span></br>" + "<span class='tooltip-row-name'>Wine: </span><span class='tooltip-win'>" + i.data['Wine_PerCapita'] + 
                " </span></br>" + "<span class='tooltip-row-name'>Spirit: </span><span class='tooltip-win'>" + i.data['Spirit_PerCapita'] + 
                " </span></br>" + "<span class='tooltip-row-name'>Beer: </span><span class='tooltip-win'>" + i.data['Beer_PerCapita'] + 
                "</span>");


            // var hilt_text = canvas.append("g")
            //                         .attr("id","hilt_text");
            // hilt_text.append("text")
            //         .attr('class', 'bar_val')
            //         .attr("fill","white")
            //         .attr('x', function() {return width - 20;})
            //         .attr('y', function() {return y(i["data"].Country) + y.bandwidth()/4 + 5;})
            //         .attr("dy", "1em")
            //         .text(function() { 
                    
            //             let display_alcohol = 0.0
            //             keys.forEach((key) => display_alcohol += +i["data"][key] )               
            //             return (+display_alcohol).toFixed(4); 
            //         });
        };
    
    
        //Handler for mouseout event
        function onMouseOut(d, i) {
            // use the text label class to remove label on mouseout
            d3.select(this)
                .transition()
                .duration(400)
                .attr("width", function(d) { return - (x(d[0]) - x(d[1])); } );
            
            tooltipBox.style('opacity', 0)
            .style('z-index', -1);
            // d3.selectAll('.bar_val').remove()
        };
    
        //Handler for mouseclick event
        function onMouseClick(d, i) {
            
            Window.init = true;
            //console.log(i["data"].Country)
            selectCountry(i["data"].Country)
            
            d3.select("#scatter_area").selectAll('circle')
            .classed("hidden", function(d){
                //console.log(Window.displayCountry)
                
                if (d["Country"] === i["data"].Country){
                    //alert("in1")
                    return false;
                }else{
                    return true;
                }
            })
            // .classed("brushed", function(d){
            //     if (d["Country"] === i["data"].Country){
            //         return true;
            //         //alert("in2")
            //     }else{
            //         return false;
            //     }
            // });
            // //process radio?
            // var brushed_data =  d3.selectAll(".brushed").data();     
            //props.selectClick(brushed_data)
        
    
            // var stateTemp = d3.nest()
            //         .key(function(d) { return d.STATE; })
            //         .rollup(function(v) { return  v.length; })
            //         .entries(brushed_data);
            // draw_choro.updateMap(stateTemp);

        };
    }

    return (
        <div>
            <h3 style={{position:'absolute', top: '-30px', left: '0'}}>Wine/Spirit/Beer Consumption per capita</h3>
            <div id="recommand" class="bar_area"></div>
            <div className="fields">
            {allKeys.map(key => (
            <div key={key} className="field">
                <input
                id={key}
                type="checkbox"
                checked={keys.includes(key)}
                onChange={e => {
                    e.target.checked ?
                    setKeys(Array.from(new Set([...keys, key]))) : setKeys(keys.filter(_key => _key !== key));
                }}
                />
                <label htmlFor={key} style={{ color: colors[key] }}>
                {key.split('_')[0]}
                </label>
            </div>
            ))}
        </div>
      </div>
        )
}

export default ConsumptionHorizonBar