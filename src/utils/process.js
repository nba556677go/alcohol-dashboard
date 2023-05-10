import { sort } from "d3";

export const processRadar = (countries, consumptionData) => {
    let result = [];
    let data = [];
    let maxGDP = 0,
        maxConsumption = 0,
        maxLife_expect = 0,
        maxPopulation = 0,
        maxHappinessScore = 0;
    
    for (var i = 0; i < countries.length; i++) {
      const targetData = consumptionData.find(item => item.Country === countries[i])
      //console.log(targetData)
      if(targetData !== undefined){
        data.push(targetData)
          
        maxGDP = Math.max(maxGDP, targetData['GDP per capita, PPP (constant 2017 international $)'])
        maxConsumption = Math.max(maxConsumption, targetData['Total alcohol consumption per capita (liters of pure alcohol, projected estimates, 15+ years of age)'])
        maxLife_expect = Math.max(maxLife_expect, targetData['life_expect'])
        maxPopulation = Math.max(maxPopulation, targetData['Population (historical estimates)'])
        maxHappinessScore = Math.max(maxHappinessScore, targetData['HappinessScore'])
      }
      //console.log(data)
    }
  
    for (var i = 0; i < countries.length; i++) {
      let item = [
        {
          axis: "GDP",
          value: parseFloat(data[i]['GDP per capita, PPP (constant 2017 international $)']) / maxGDP,
          country: countries[i]
        },
        {
          axis: "Population",
          value: parseFloat(data[i]['Population (historical estimates)']) / maxPopulation,
          country: countries[i]
        },
        {
          axis: "Consumption",
          value: parseFloat(data[i]['Total alcohol consumption per capita (liters of pure alcohol, projected estimates, 15+ years of age)']) / maxConsumption,
          country: countries[i]
        },
        {
           axis: "Life Expectancy",
           value: parseFloat(data[i]['life_expect']) / maxLife_expect,
           country: countries[i]
        },
        {
          axis: "Happiness",
          value: parseFloat(data[i]['HappinessScore']) / maxHappinessScore,
          country: countries[i]
       },
      ];
  
      result.push(item);
    }

    console.log(result);
    return result;
  };

const djb2 = (str) => {
    var hash = 5381;
    for (var i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
    }
    return hash;
}

export const hashStringToColor = (str) => {
    var hash = djb2(str);
    var r = (hash & 0xFF0000) >> 16;
    var g = (hash & 0x00FF00) >> 8;
    var b = hash & 0x0000FF;
    return "#" + ("0" + r.toString(16)).substr(-2) + ("0" + g.toString(16)).substr(-2) + ("0" + b.toString(16)).substr(-2);
  }



export const processWine = (wineData) => {
    let result = [];
    let data = [];
    return wineData;
};

export const findtop10Data = (field , data) => {
  let result = [];


  var sortedData = data.sort((a, b) => b[field] - a[field]);
  sortedData = sortedData.slice(0, 7);    

  return sortedData;
};



export const processHorizonBar = (countries, consumptionData) => {
  
  let data = [];

  for (var i = 0; i < countries.length; i++) {
    const targetData = consumptionData.find(item => item.Country === countries[i])
    data.push(targetData)
  }
  return data;
};


export const processRecommandBar = (countries, row2Data) => {
  
  let data = [];

  for (var i = 0; i < countries.length; i++) {
    const target = row2Data.filter(item => item.Country === countries[i])
    
    data.push(target)
  }
  data = data.flat()
  return findtop10Data('Rate Count' , data).reverse();
};

