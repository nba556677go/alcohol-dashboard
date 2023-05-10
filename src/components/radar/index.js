import * as d3 from "d3";
import React, { useEffect } from "react";
import Radar from "./radar";

function RadarWrapper({ data }) {
  useEffect(() => {
    let svg = d3.select(".radarChart");
    svg.selectAll("*").remove();
    draw();
  }, [data]);

  const draw = () => {
    var margin = { top: 75, right: 80, bottom: 80, left: 80 },
      width =
        Math.min(400, window.innerWidth - 10) - margin.left - margin.right,
      height = Math.min(
        width,
        window.innerHeight - margin.top - margin.bottom - 20
      );

    var color = ["#EDC951", "#CC333F", "#00A0B0"];

    var radarChartOptions = {
      w: width,
      h: height,
      margin: margin,
      maxValue: 0.5,
      levels: 5,
      roundStrokes: true,
      color: color,
    };
    Radar(".radarChart", data, radarChartOptions);
  };

  return (
    <div>
      <h3 style={{position:'absolute', top: '5px', left: '0'}}>National Index</h3>
      <div id="radChart" class="radarChart" style={{padding: 0, margin: 0}}></div>
    </div>
  )
}

export default RadarWrapper;
