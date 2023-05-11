import React, { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup} from "react-simple-maps";
import { csv } from "d3-fetch";
import { scaleLinear } from "d3-scale";
import sortBy from "lodash/sortBy";
import * as d3 from "d3"

const geoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/world-continents.json";

const MapChart = ({alcoholType, selectProdMap, countries}) => {
  const [data, setData] = useState([]);
  const [maxValue, setMaxValue] = useState(0);

  var tooltip = d3.select("#production-map")
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

    useEffect(() => {
      if(countries == undefined) return;
      if (countries.length == 0 ) return ;
      console.log(countries)
    }, [countries]);
  
  useEffect(() => {
    setData([])
    d3.selectAll('.production-circles')
    .style('opacity', 0)
    .transition()
    .duration(1000)
    .ease(d3.easeLinear)
    .style('opacity', 1)

    csv("/data/productionMap_data.csv").then((cities) => {
      console.log(cities)//ONLY read 1 row of data?
      // filter the ones that value is large than 0
      cities = cities.filter(item => item[alcoholType.toLowerCase()])
      const sortedCities = sortBy(cities, (o) => -o[alcoholType.toLowerCase()]);
      setMaxValue(sortedCities[0][alcoholType.toLowerCase()]);
      //console.log(sortedCities)
      setData(sortedCities);
    });
  }, [alcoholType]);

  const popScale = scaleLinear().domain([0, maxValue]).range([4, 20])


  return (
    <div id="production-map">
      <ComposableMap 
        projectionConfig={{rotate: [-10, 0, 0], center: [20, 8], scale: 90 }}  
        width="500"
        height="300">
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography 
                  key={geo.rsmKey} 
                  geography={geo} 
                  fill="#DDD"
                   />
              ))
            }
          </Geographies>
          {data.map((item) => {
            let color = ""
            if (Window.init) color = "#F53"
            else{(countries.includes(item.Country)) ? color = "green" : color = "#F53"}
            return (
              <Marker key={item.id} coordinates={[item.lng, item.lat]}>
                <circle 
                  fill = {color}
                  stroke="#FFF" 
                  class="production-circles"
                  r={popScale(item[alcoholType.toLowerCase()])}
                  onMouseEnter={(event) => {
                    tooltip
                      .style("left", (event.pageX+10) + "px")
                      .style("top", (event.pageY-10) + "px")
                      .transition().duration(1)
                      .style('opacity', 1)
                      .style('z-index', 1);

                      tooltip.html("<span class='tooltipHeader'>" + item.Country + "</span></br>" + 
                      "<span class='tooltip-row-name'>Production:</span><span class='tooltip-win'>" + Number.parseInt(item[alcoholType.toLowerCase()]) +
                      "</span>");
                      
                  }}
                  onMouseLeave={() => {
                    tooltip.transition().duration(200)
                        .style("opacity", 0)
                        .style('z-index', -1);
                  }}
                  onClick={(event) => {
                    d3.select("#recommand").selectAll(".tooltip").style("opacity", 0)
                    d3.select("#biplot").selectAll(".tooltip").style("opacity", 0)
                    d3.select("#scatter_area").selectAll(".tooltip").style("opacity", 0)
                    //Window.init = false
                    console.log(item)
                    tooltip.style("opacity", 0);
                    
                    selectProdMap(item.Country)
                    
                    
                  }} 
                  />
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default MapChart;
