import React, { useEffect, useState, useMemo } from "react";
import { ComposableMap, Geographies, Geography, Marker} from "react-simple-maps";
import { csv } from "d3-fetch";
import { scaleLinear } from "d3-scale";
import sortBy from "lodash/sortBy";

const geoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/world-continents.json";

const MapChart = ({alcoholType}) => {
  const [data, setData] = useState([]);
  const [maxValue, setMaxValue] = useState(0);

  useEffect(() => {
    csv("/data/productionMap_data.csv").then((cities) => {
      console.log(cities)//ONLY read 1 row of data?
      // filter the ones that value is large than 0
      cities = cities.filter(item => item[alcoholType.toLowerCase()])
      const sortedCities = sortBy(cities, (o) => -o.wine);
      //console.log(sortedCities)
      setMaxValue(sortedCities[0].wine);
      setData(sortedCities);
      
    });
  }, [alcoholType]);

  const popScale = useMemo(
    () => scaleLinear().domain([0, maxValue]).range([4, 20]),
    [maxValue]
  );

  return (
    <ComposableMap 
        projectionConfig={{rotate: [-10, 0, 0], center: [20, 8], scale: 90 }}  
        width="500"
        height="300">
      <Geographies geography={geoUrl}>
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography key={geo.rsmKey} geography={geo} fill="#DDD" />
          ))
        }
      </Geographies>
      {data.map(({ id, Country, Capital  , lng, lat, wine, spirits, beer }) => {
        return (
          <Marker key={id} coordinates={[lng, lat]}>
            <circle fill="#F53" stroke="#FFF" r={popScale(wine)} />
          </Marker>
        );
      })}
    </ComposableMap>
  );
};

export default MapChart;
