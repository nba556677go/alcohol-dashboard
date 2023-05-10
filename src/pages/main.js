import React, { useState, useEffect } from "react";
import { Row, Col } from 'antd';
import { csv } from "d3-fetch";
import WorldMap from '../components/map/worldMap'
import Radar from '../components/radar'
import PieChart from '../components/pieChart'
// import BarChart from '../components/barChart'
import Biplot from '../components/biplot'
import Scatterplot from "../components/scatterplot/scatterplot";
import ConsumptionScatterplot from "../components/scatterplot/consumptionScatterplot";
import Recommand from "../components/recommand";
import ConsumptionHorizonBar from "../components/consumptionHorizonBar";
import { processRadar, processHorizonBar, findtop10Data } from '../utils/process.js'
import Biplot1 from "../components/biplot1";
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
        console.log(countries)
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
              hideScatters("#scatter_area", "Country",  [...prevState, country])
              hideScatters("#biplot", "Country",  [...prevState, country])
              //Window.displayCountry = [...prevState, country];
              return [...prevState, country]
            }
          });
        }
    }
    const hideScatters = (divid, field , changeList) => {

        if(field === "") field = "ID";
        //console.log(d3.select("#biplot"))
        d3.select(divid).selectAll('.circle')
                  .classed("hidden", function(d, i){
                    
                
                  if (changeList.includes(d[field])){
                      console.log(d[field])
                      //console.log(countries.includes(d["Country"]))
                      return false;
                  }else{
                      return true;
                  }
                })
      

        // //select biplot
        // d3.select("#biplot").selectAll('circle')
        //         .classed("hidden", function(d){
            
        //         //console.log(Window.displayCountry)
        //         console.log(d)
        //         if (countries.includes(d.Country)){//some bug
        //             return false;
        //         }else{
        //             return true;
        //         }
        //       })
    }

  //brushed
    const selectScatter = (data, PCAdata) => {
      //alert()
      console.log(data);
      if(!data.length) return;
      let countryList = [...new Set(data.map(d => d["Country"]))]
          console.log(countryList)
          if (!Window.init) {setRadarData(processRadar(countryList, consumptionData));}
          
          setCountries(countryList)
        if(genre === 'production') { 
          let idList = [...new Set(data.map(d => d[""]))]//update all ids in biplot
          hideScatters("#biplot", "", idList)
          setRecommandData(data)
        }
        else{
          //biplot hidden 
          //set radar plot based on brushed scatters
          hideScatters("#biplot", "Country", countryList)
          setConsumpHorizonData(data) 
        }  
    }

    const selectHorizonBar = (country) => {
      hideScatters("#scatter_area", "Country",  [country])
      hideScatters("#biplot", "Country",  [country])
      setCountries([country])
    }
    const selectProdMap = (country) => {
      setCountries([country])
      hideScatters("#biplot", "Country", [country])
      hideScatters("#scatter_area", "Country",  [country])
      Window.data = row2Data;
      let recommendData = row2Data.filter((item) => item.Country == country)
      recommendData.sort(function(a,b){ // 这是比较函数
        return b['Rate Count'] - a['Rate Count'];    // 降序
      })
      let sortdata = recommendData.slice(0, 7).reverse()
      //console.log(recommendData)
      setRecommandData(sortdata)
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
      Window.scat = PCAScat
      let PCAVec = await csv(`/data/pca_consumption_vectors.csv`);
      setPCAData({scatter : PCAScat, vector : PCAVec});
      
    }

    
    
    return (
        <div className="main-wrapper">
            <h1 style={{textAlign:'center',marginBottom: '5px'}}>Alcohol Consumption and Production</h1>
            <Row>
                <Col span={9}>
                    <WorldMap 
                        selectCountry={selectCountry} 
                        data={consumptionData} 
                        countries={countries}
                        selectAlcoholType={selectAlcoholType}
                        selectConsumptionData={selectConsumptionData}
                        selectProdMap={selectProdMap}/>
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
                  <ConsumptionScatterplot data={row2Data} selectChange={selectScatter} selectCountry={selectCountry} />
                }
              </Col>

              <Col span={8}>
                {genre === 'production' ? 
                  <Recommand data={recommandData} selectCountry={selectCountry} type={type}/>:
                  
                  <ConsumptionHorizonBar data={consumpHorizonData} selectCountry={selectHorizonBar} mapCountries={countries} />//TODO: display wine/spirit/beer consumption per capita
                  } 
              </Col>
              <Col span={7}>
                  {/* <Biplot genre={genre} data={PCAData} wdata={row2Data}/> */}
                  <Biplot1 genre={genre} data={PCAData} wdata={row2Data} />
              </Col>
            </Row>
        </div>
    )
}
