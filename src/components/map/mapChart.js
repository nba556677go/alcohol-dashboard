import * as d3 from "d3"
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";

const geoUrl = "/features.json";

const colorScale = d3.scaleThreshold()
  .domain([0, 1, 3, 6, 12, 18])
  .range(d3.schemeBlues[7]);

const MapChart = ({ data, selectCountry, countries }) => {
  var tooltip = d3.select("#geo-map")
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

  return (
    <div id="geo-map">
      <ComposableMap
        data-tip=""
        width="500"
        height="300"
        projectionConfig={{
            rotate: [-10, 0, 0],
            center: [20, 8],
            scale: 90
        }}
      >
        <ZoomableGroup>
          {data.length > 0 && (
              <Geographies geography={geoUrl}>
              {({ geographies }) =>
                  geographies.map((geo) => {
                  const d = data.find((s) => s.Code === geo.id);
                  return (
                      <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={ 
                            d ? (countries.includes(geo.properties.name) ? '#F53' : colorScale(d['Total alcohol consumption per capita (liters of pure alcohol, projected estimates, 15+ years of age)'])): "#F5F4F6"}
                          onMouseEnter={(event) => {
                              const { name } = geo.properties;

                              tooltip
                                .html(name)
                                .style("left", (event.pageX+10) + "px")
                                .style("top", (event.pageY-10) + "px")
                                .transition().duration(1)
                                .style('opacity', 1);
                          }}
                          onClick={function() {
                            const { name } = geo.properties;
                            selectCountry(name);
                            tooltip.transition().duration(200)
				                        .style("opacity", 0);
                          }}
                          onMouseLeave={() => {
                            tooltip.transition().duration(200)
				                        .style("opacity", 0);
                          }}
                          style={{
                            hover: {
                              fill: "#F53",
                              outline: "none"
                            },
                            default: {
                              outline: "none"
                            }
                          }}
                      />
                  );
                  })
              }
            </Geographies>
          )}
        </ZoomableGroup>
      </ComposableMap>
      <div id="map-legend"></div>
    </div>
  );
};

export default MapChart;
