import React, { useState, useEffect } from "react";
import { Row, Col } from 'antd';
import { csv } from "d3-fetch";
import WorldMap from '../components/map/worldMap'
import Radar from '../components/radar'
import PieChart from '../components/pieChart'
import BarChart from '../components/barChart'
import Biplot from '../components/biplot'
import Scatterplot from "../components/scatterplot";
import Recommand from "../components/recommand";
import { processRadar, processWine } from '../utils/process.js'
import '../css/main.css'

var init = true;

export default function Main() {
    const [consumptionData, setConsumptionData] = useState([]);
    const [countries, setCountries] = useState(['United States','China','Australia']);
    const [radarData, setRadarData] = useState([]);

    const [wineData, setWineData] = useState([]);
    const [PCAData, setPCAData] = useState([]);

    const [scatterData, setScatterData] = useState([])
    const [recommandData, setRecommandData] = useState([])

    useEffect(() => {
      const load = async () => {
        let cData = await csv(`/data/conusmption_gdp_happiness_year_processed.csv`);
        setConsumptionData(cData.filter(item => item.Year === '2015'));
        let wineData = await csv(`/data/wine_processed.csv`);
        setWineData(wineData) ;
        let PCAScat = await csv(`/data/pca_wine_scatters.csv`);
        let PCAVec = await csv(`/data/pca_wine_vectors.csv`);
        setPCAData({scatter : PCAScat, vector : PCAVec});

        let scatterData = await csv(`/data/Final_NCAA.csv`);
        setScatterData(scatterData);
        // const [cData, wineData, PCAScat, PCAVec] = await Promise.all([
        //   csv(`/data/conusmption_gdp_happiness_year_processed.csv`),
        //   csv( `/data/wine_processed.csv`),
        //   csv(`/data/pca_wine_scatters.csv`),
        //   csv(`/data/pca_wine_vectors.csv`)
        // ])
        // setConsumptionData(cData.filter(item => item.Year === '2015'));
        // setWineData(wineData);
        // setPCAData({scatter : PCAScat, vector : PCAVec});
      }
    
      
      load();
      console.log(PCAData)
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

    const selectScatter = (data) => {
        setRecommandData(data)
    }

    return (
        <div className="main-wrapper">
            <h2 style={{textAlign:'center'}}>Alcohol Consumption and Produce</h2>
            <Row gutter={0}>
                <Col span={10}>
                    <WorldMap selectCountry={selectCountry} data={consumptionData} countries={countries}/>
                </Col>
                <Col span={7}>
                    <PieChart/>
                    <BarChart/>
                </Col>
                <Col span={7}>
                    { 
                      radarData.length > 0 && 
                      <Radar data={radarData}/>
                    }
                </Col>
            </Row>
            <Row>
              <Col span={10}>
                  <Scatterplot data={wineData} selectChange={selectScatter}/>
              </Col>
              <Col span={7}>
                  <Recommand data={recommandData}/>
              </Col>
              <Col span={7}>
                  <Biplot data={PCAData} wdata={wineData}/>
              </Col>
            </Row>
        </div>
    )
}
