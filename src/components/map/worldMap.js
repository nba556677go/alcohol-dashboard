import React, { useState } from "react";
import MapChart from "./mapChart";

function WorldMap({selectCountry, data, countries}) {
  const [content, setContent] = useState("");

  return (
    <div className="Chart" >
      <div>
        <MapChart data={data} selectCountry={selectCountry} countries={countries}/>
      </div>
    </div>
  );
}

export default WorldMap;