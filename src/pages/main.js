import React, { useState, useEffect } from "react";
import { Row, Col } from 'antd';
import { csv } from "d3-fetch";
import WorldMap from '../components/map/worldMap'
import Radar from '../components/radar'
import PieChart from '../components/pieChart'
import BarChart from '../components/barChart'
import Biplot from '../components/biplot'
import Scatterplot from "../components/scatterplot/scatterplot";
import ConsumptionScatterplot from "../components/scatterplot/consumptionScatterplot";
import Recommand from "../components/recommand";
import ConsumptionHorizonBar from "../components/consumptionHorizonBar";
import { processRadar, processWine } from '../utils/process.js'
import '../css/main.css'

var init = true;

export default function Main() {
    const [consumptionData, setConsumptionData] = useState([]);
    const [countries, setCountries] = useState([]);
    const [radarData, setRadarData] = useState([]);
    const [genre, setGenre] = useState(["production"]);
    
    const [type, setType] = useState("Wine"); 
    const [row2Data, setRow2Data] = useState([]);
    const [PCAData, setPCAData] = useState([]);

    const [recommandData, setRecommandData] = useState([])

    useEffect(() => {
      const load = async () => {
        let cData = await csv(`/data/conusmption_gdp_happiness_year_processed.csv`);
        setConsumptionData(cData.filter(item => item.Year === '2015'));
        let wineData = await csv(`/data/wine_processed.csv`);
        setRow2Data(wineData);
//default load
        let PCAScat = await csv(`/data/pca_wine_scatters.csv`);
        let PCAVec = await csv(`/data/pca_wine_vectors.csv`);
        setPCAData({scatter : PCAScat, vector : PCAVec});
        setGenre("production");
      }
    
      
      load();
      console.log(PCAData)
    }, []);

    useEffect(() => {
       if(consumptionData.length === 0) return;
       setRadarData(processRadar(['United States','China','Australia'], consumptionData));
    }, [consumptionData])

    useEffect(() => {
      if(consumptionData.length === 0) return;
      if(countries.length == 0) {
        setRadarData(processRadar(['United States','China','Australia'], consumptionData));
      } else {
        setRadarData(processRadar(countries, consumptionData));
      }
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
    
    // alcolhol type change
    const selectAlcoholType = async (type) => {
      setType(type);
      type = type.toLowerCase();
      let data = await csv(`/data/${type}_processed.csv`);
      setGenre("production");
      setRow2Data(data);
      let PCAScat = await csv(`/data/pca_${type}_scatters.csv`);
      let PCAVec = await csv(`/data/pca_${type}_vectors.csv`);
      setPCAData({scatter : PCAScat, vector : PCAVec});
    }

    //switch to consumption data
    //TODO : switch to consumption data for barchart
    const selectConsumptionData = async (type) => {
      
      let scatter_data= await csv(`/data/conusmption_gdp_happiness_year_processed.csv`);
      setGenre("consumption");
      setRow2Data(scatter_data);
      let PCAScat = await csv(`/data/pca_consumption_scatters.csv`);
      let PCAVec = await csv(`/data/pca_consumption_vectors.csv`);
      setPCAData({scatter : PCAScat, vector : PCAVec});
      
    }
    
    return (
        <div className="main-wrapper">
            <h2 style={{textAlign:'center',marginBottom: '5px'}}>Alcohol Consumption and Production</h2>
            <Row gutter={0}>
                <Col span={10}>
                    <WorldMap 
                        selectCountry={selectCountry} 
                        data={consumptionData} 
                        countries={countries}
                        selectAlcoholType={selectAlcoholType}
                        selectConsumptionData={selectConsumptionData}/>
                </Col>
                <Col span={6}>
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
              {genre === 'production' ? 
                  <Scatterplot data={row2Data} selectChange={selectScatter} />:
                  <ConsumptionScatterplot data={row2Data} selectChange={selectScatter} />
                }
              </Col>

              <Col span={6}>
                {genre === 'production' ? 
                  <Recommand data={recommandData} type={type}/>:
                  <ConsumptionHorizonBar data={recommandData} type={type}/>//TODO: display wine/spirit/beer consumption per capita
                  } 
              </Col>
              <Col span={7}>
                  <Biplot data={PCAData} wdata={row2Data}/>
              </Col>
            </Row>
        </div>
    )
}
