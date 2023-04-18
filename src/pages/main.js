import React, { useState, useEffect } from "react";
import { Row, Col } from 'antd';
import { csv } from "d3-fetch";
import WorldMap from '../components/map/worldMap'
import Radar from '../components/radar'
import { processRadar } from '../utils/process.js'
import '../css/main.css'

var init = true;

export default function Main() {
    const [consumptionData, setConsumptionData] = useState([]);
    const [countries, setCountries] = useState(['United States','China','Australia']);
    const [radarData, setRadarData] = useState([]);
    
    useEffect(() => {
      const load = async () => {
        let data = await csv(`/data/conusmption_gdp_happiness_year_processed.csv`);
        setConsumptionData(data.filter(item => item.Year === '2015'));
      }
      load();
    }, []);

    useEffect(() => {
       if(consumptionData.length === 0) return;
       setRadarData(processRadar(countries, consumptionData));
    }, [consumptionData])

    useEffect(() => {
      if(consumptionData.length === 0) return;
      setRadarData(processRadar(countries, consumptionData));
   }, [countries])


    const selectCountry = (country) => {
        const index = countries.findIndex(
          (name) => name === country
        );
        if (index > -1 && !init) {
          setCountries(countries.filter((item) => item !== country));
        } else {
          setCountries((prevState) => {
            if(init) {
              init = false;
              console.log([country])
              return [country]
            } else {
              console.log([...prevState, country])
              return [...prevState, country]
            }
          });
        }
    }

    return (
        <div className="main-wrapper">
            <Row gutter={0}>
                <Col span={10}>
                    <WorldMap selectCountry={selectCountry} data={consumptionData} countries={countries}/>
                </Col>
                <Col span={7}>
                    { 
                      radarData.length > 0 && 
                      <Radar data={radarData}/>
                    }
                </Col>
            </Row>
        </div>
    )
}
