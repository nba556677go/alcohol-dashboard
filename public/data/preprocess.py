import pandas as pd

###Category list 
categoryList = {"wine" : ["Red Wine", "White Wine"], 
              "spirits" : ["Whiskey", "Gin", "Rum", "Vodka", "Tequila", "Brandy", "Liqueur"],
               "beer" : ["IPA", "ALE", "Lager", "Seltzer"] }

def replaceCategory(df, key):
       for index, row in df.iterrows():
              for type in categoryList[key]:
                     #print(row["Categories"])
                     #print(i)
                     if type in row["Categories"]:
                            df.at[index, "Categories" ] = type
                            break
                     else: 
                            df.at[index, "Categories" ] = "Others"
       #print(df["Categories"])
       #input()
       return df


###process alcohol-consumption-vs-gdp-per-capita and who_life_exp. merge two with years of 2000,2005,2010,2015
df = pd.read_csv("./alcohol-consumption-vs-gdp-per-capita.csv")
df  = df[df["GDP per capita, PPP (constant 2017 international $)"].notnull()]
df = df.loc[df['Year'].isin([2000,2005,2010,2015,2018])]
df  = df[df["Total alcohol consumption per capita (liters of pure alcohol, projected estimates, 15+ years of age)"].notnull()]
df.rename(columns={'Entity': 'Country'}, inplace=True)

df2 = pd.read_csv("./who_life_exp.csv")
df2.rename(columns={'year': 'Year', 'country': 'Country'}, inplace=True)
df2 = df2.loc[df2['Year'].isin([2000,2005,2010,2015])]
#some country name need to be change to merge...

df2['Country'].replace('United States of America', 'United States', inplace=True)
df2['Country'].replace('Russian Federation', 'Russia', inplace=True)
df2['Country'].replace('United Kingdom of Great Britain and Northern Ireland', 'United Kingdom', inplace=True)
df2['Country'].replace('Syrian Arab Republic', 'Syria', inplace=True)





# perform an inner join on the 'id' column
df_inner = pd.merge(df, df2, on=['Year', 'Country'], how='inner')

df3 = pd.read_csv("./HappinessAlcoholConsumption.csv")
df3['Country'].replace('Czech Republic', 'Czechia', inplace=True)
df3["Beer_PerCapita"] = df3["Beer_PerCapita"]/80
df3["Spirit_PerCapita"] = df3["Spirit_PerCapita"]/80
df3["Wine_PerCapita"] = df3["Wine_PerCapita"]/80
#create Alcoholpercapita
df3["Alcohol_PerCapita"] = df3["Beer_PerCapita"] + df3["Spirit_PerCapita"] + df3["Wine_PerCapita"]
#df3.rename(columns={'Country': 'Entity'}, inplace=True)
df_inner = pd.merge(df_inner, df3, on=['Country'], how='inner')

#create  region/code map to add to wine/beer/spirits
regionMap = dict(zip(df2.Country, df2.region))
codeMap = dict(zip(df2.Country, df2.country_code))
#add Scotland in particular - its an area
regionMap['Scotland'] = 'Europe'
codeMap['Scotland'] = 'GBR'

#df.to_csv("./data/conusmption_gdp_year_processed.csv")
df_inner.to_csv("./conusmption_gdp_happiness_year_processed.csv")


df_capital = pd.read_csv("./capital_geo.csv")

###wine
df = pd.read_csv("./wine_data.csv")
df = df.drop(df.columns[0], axis=1)
#delete blank data
df  = df[df["Rate Count"] > 1.0]
df  = df[df["ABV"].notnull()]
df  = df[df["Suggested Serving Temperature"].notnull()]
df  = df[df["Sweet-Dry Scale"].notnull()]
df  = df[df["Food Pairing"].notnull()]
df  = df[df["Body"].notnull()]
df  = df[df["Tasting Notes"].notnull()]


df['Price'] = df['Price'].replace('[\$\,\.]', '', regex=True).astype(float)
df['ABV'] = df['ABV'].str.replace('%', '').astype(float)
#only one inside
df = df[df["Suggested Serving Temperature"] != '18-20°C° F']

temp_class = { '55-60° F' : 5, '50-55° F' : 4, '45-50° F' : 3 , '60-65° F' : 6, '40-45° F' : 2,
       '70-75° F' : 8, '35-40° F': 1 , '65-70° F' : 7}
df = df.replace({"Suggested Serving Temperature": temp_class})


#drop ID and reset row

df.drop(columns=["Volume", "Description"], inplace=True)
df.reset_index(drop=True, inplace=True)

df['region'] = df['Country'].map(regionMap)
df['Code'] = df['Country'].map(codeMap)
df  = df[df["region"].notnull()]

#count country wine count

df_productionCount = df['Country'].value_counts().rename_axis('Country').reset_index(name='wine')
df_capital = pd.merge(df_capital, df_productionCount, on=['Country'], how='left')
#df_productionMap_data.to_csv("./productionMap_data.csv")

## category separation
df = replaceCategory(df, "wine")
df.to_csv("./wine_processed.csv")

###spirits
df = pd.read_csv("./spirits_data.csv")
df = df.drop(df.columns[0], axis=1)
#delete blank data
df  = df[df["Rate Count"] > 1.0]    
df  = df[df["ABV"].notnull()]
df  = df[df["Price"].notnull()]
df  = df[df["Categories"].notnull()]

df['Price'] = df['Price'].replace('[\$\,\.]', '', regex=True).astype(float)
df['ABV'] = df['ABV'].str.replace('%', '').astype(float)


#drop ID and reset row
df.drop(columns=["Volume", "Description", "Tasting Notes" ,"Base Ingredient" , "Years Aged"], inplace=True)
df.reset_index(drop=True, inplace=True)
#create ID column based on index
df['region'] = df['Country'].map(regionMap)
df['Code'] = df['Country'].map(codeMap)
df  = df[df["region"].notnull()]

#production map data
df_productionCount = df['Country'].value_counts().rename_axis('Country').reset_index(name='spirits')
df_capital = pd.merge(df_capital, df_productionCount, on=['Country'], how='left')


## category separation
df = replaceCategory(df, "spirits")
df.to_csv("./spirits_processed.csv")

###Beer

df = pd.read_csv("./beer_data.csv")
df = df.drop(df.columns[0], axis=1)
#delete blank data
df  = df[df["Rate Count"] > 1.0]
df  = df[df["ABV"].notnull()]
df  = df[df["Suggested Serving Temperature"].notnull()]
df  = df[df["Calories Per Serving (12 OZ/0.35L)"].notnull()]
df  = df[df["Carbs Per Serving (12 OZ/0.35L)"].notnull()]
df  = df[df["Type"].notnull()]




df['Price'] = df['Price'].replace('[\$\,\.]', '', regex=True).astype(float)
df['ABV'] = df['ABV'].str.replace('%', '').astype(float)


temp_class = { '55-60° F' : 5, '50-55° F' : 4, '45-50° F' : 3 , '60-65° F' : 6, '40-45° F' : 2,
       '70-75° F' : 8, '35-40° F': 1 , '65-70° F' : 7}
df = df.replace({"Suggested Serving Temperature": temp_class})


#drop ID and reset row
df.drop(columns=["Volume", "Description", "IBU", "Food Pairing", "Tasting Notes" ], inplace=True)
df.reset_index(drop=True, inplace=True)

df['region'] = df['Country'].map(regionMap)
df['Code'] = df['Country'].map(codeMap)
df  = df[df["region"].notnull()]
#production map data
df_productionCount = df['Country'].value_counts().rename_axis('Country').reset_index(name='beer')
df_capital = pd.merge(df_capital, df_productionCount, on=['Country'], how='left')


df = replaceCategory(df, "beer")
df.to_csv("./beer_processed.csv")

#add region in productionmap
df_capital['region'] = df_capital['Country'].map(regionMap)
df_capital['Code'] = df_capital['Country'].map(codeMap)
df_capital  = df_capital[df_capital["region"].notnull()]

df_capital.to_csv("./productionMap_data.csv")

