import React, { useState } from "react";
import MapChart from "./mapChart";
import ProductionMap from './productionMap'
import { Radio } from 'antd';
import { OmitProps } from "antd/es/transfer/ListBody";


function WorldMap({selectCountry, data, countries, selectAlcoholType}) {
  const [radioValue, setRadioValue] = useState("Consumption");
  const [alcoholType, setAlcoholType] = useState("Wine");

  const options = [
    {
      label: 'Consumption',
      value: 'Consumption',
    },
    {
      label: 'Production',
      value: 'Production',
    }
  ];

  const alcohol = [
    {
      label: 'Wine',
      value: 'Wine',
    },
    {
      label: 'Spirits',
      value: 'Spirits',
    },
    {
      label: 'Beer',
      value: 'Beer',
    }
  ]

  const handleRadioChange = (val) => {
    setRadioValue(val.target.value);
  }

  const handleChangeAlcohol = (val) => {
    setAlcoholType(val.target.value);
    selectAlcoholType(val.target.value)
  }
  
  return (
    <div className="Chart">
      <Radio.Group
        options={options}
        onChange={handleRadioChange}
        value={radioValue}
        optionType="button"
        style={{position:'absolute', top:'20px', left:'30px'}}
      />
      { radioValue === 'Production' && <Radio.Group 
         options={alcohol} 
         onChange={handleChangeAlcohol} 
         value={alcoholType}
         style={{position:'absolute', top:'24px', left:'280px'}} />
      }
      <div>
         { radioValue === 'Consumption' ? 
            <MapChart data={data} selectCountry={selectCountry} countries={countries}/>: 
            <ProductionMap/>
         }
      </div>
    </div>
  );
}

export default WorldMap;