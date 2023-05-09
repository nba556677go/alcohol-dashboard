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
import { processRadar, processHorizonBar, findtop10Data } from '../utils/process.js'
import * as d3 from "d3"
import '../css/main.css'

Window.init = true;
Window.displayCountry = [];
//Window.isBarSelected = false;
export default function Main() {
    const [consumptionData, setConsumptionData] = useState([]);
    const [productionData, setProductionData] = useState([]);
    const [countries, setCountries] = useState([]);
    const [radarData, setRadarData] = useState([]);
    const [genre, setGenre] = useState(["production"]);
    
    const [type, setType] = useState("Wine"); 
    const [row2Data, setRow2Data] = useState([]);
    const [PCAData, setPCAData] = useState([]);

    const [recommandData, setRecommandData] = useState([])
    const [consumpHorizonData, setConsumpHorizonData] = useState([])
    

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

        let productionData = await csv("/data/productionMap_data.csv")
        setProductionData(productionData);
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
        setConsumpHorizonData(processHorizonBar(findtop10Data( 'Alcohol_PerCapita',consumptionData))); 
      } else {
        setRadarData(processRadar(countries, consumptionData));
        setConsumpHorizonData(processHorizonBar(countries, consumptionData));
      }
   }, [countries])

    const selectCountry = (country) => {
        const index = countries.findIndex(
          (name) => name === country
        );
        if (index > -1 && !Window.init ) {
          setCountries(countries.filter((item) => item !== country));
        } else {
          setCountries((prevState) => {
            if(Window.init) {
              Window.init = false;
              console.log([country])
              //highlightPoint(country)//highlight single country in scatters
              return [country]
            } 
            
            else {
              console.log([...prevState, country])
              hideScatters([...prevState, country])
              //Window.displayCountry = [...prevState, country];
              return [...prevState, country]
            }
          });
        }
    }
    const hideScatters = (countries) => {
      d3.select("#scatter_area").selectAll('circle')
                .classed("hidden", function(d){
                //console.log(Window.displayCountry)
                
                if (countries.includes(d["Country"])){
                    return false;
                }else{
                    return true;
                }
              })
    }

  
    const selectScatter = (data) => {
        genre === 'production' ? 
        setRecommandData(data):
        setConsumpHorizonData(data)  
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
    const selectConsumptionData = async (type) => {
      
      //let scatter_data= await csv(`/data/conusmption_gdp_happiness_year_processed.csv`);
      Window.displayCountry = [];
      Window.init = true;
      setGenre("consumption");
      setRow2Data(consumptionData);
      let PCAScat = await csv(`/data/pca_consumption_scatters.csv`);
      let PCAVec = await csv(`/data/pca_consumption_vectors.csv`);
      setPCAData({scatter : PCAScat, vector : PCAVec});
      
    }
    
    return (
        <div className="main-wrapper">
            <h2 style={{textAlign:'center',marginBottom: '5px'}}>Alcohol Consumption and Production</h2>
            <Row>
                <Col span={9}>
                    <WorldMap 
                        selectCountry={selectCountry} 
                        data={consumptionData} 
                        countries={countries}
                        selectAlcoholType={selectAlcoholType}
                        selectConsumptionData={selectConsumptionData}/>
                </Col>
                <Col span={8}>
                    <PieChart genre={genre} type={type} data={genre==='consumption'?consumptionData:productionData}/>
                    {/* <BarChart genre={genre} type={type} data={genre==='consumption'?consumptionData:productionData}/> */}
                </Col>
                <Col span={7}>
                    { 
                      radarData.length > 0 && 
                      <Radar data={radarData}/>
                    }
                </Col>
            </Row>
            <Row> 
              <Col span={9}>
              {genre === 'production' ? 
                  <Scatterplot data={row2Data} selectChange={selectScatter} />:
                  <ConsumptionScatterplot data={row2Data} selectChange={selectScatter} />
                }
              </Col>

              <Col span={8}>
                {genre === 'production' ? 
                  <Recommand data={recommandData} type={type}/>:
                  
                  <ConsumptionHorizonBar data={consumpHorizonData} selectCountry={selectCountry} mapCountries={countries} />//TODO: display wine/spirit/beer consumption per capita
                  } 
              </Col>
              <Col span={7}>
                  <Biplot data={PCAData} wdata={row2Data}/>
              </Col>
            </Row>
        </div>
    )
}
