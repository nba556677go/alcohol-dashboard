import pandas as pd
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

df['Price'] = df['Price'].replace('[\$\,\.]', '', regex=True).astype(float)
#only one inside
df = df[df["Suggested Serving Temperature"] != '18-20°C° F']

temp_class = { '55-60° F' : 5, '50-55° F' : 4, '45-50° F' : 3 , '60-65° F' : 6, '40-45° F' : 2,
       '70-75° F' : 8, '35-40° F': 1 , '65-70° F' : 7}
df = df.replace({"Suggested Serving Temperature": temp_class})


#drop ID and reset row

df.drop(columns=["Volume", "Description"], inplace=True)
df.reset_index(drop=True, inplace=True)

df.to_csv("./wine_processed.csv")

###spirits
df = pd.read_csv("./spirits_data.csv")
df = df.drop(df.columns[0], axis=1)
#delete blank data
df  = df[df["Rate Count"] > 1.0]    
df  = df[df["ABV"].notnull()]
df  = df[df["Price"].notnull()]
#df  = df[df["Years Aged"].notnull()]

df['Price'] = df['Price'].replace('[\$\,\.]', '', regex=True).astype(float)



#drop ID and reset row
df.drop(columns=["Volume", "Description"], inplace=True)
df.reset_index(drop=True, inplace=True)

df.to_csv("./spirits_processed.csv")

###Beer

df = pd.read_csv("./beer_data.csv")
df = df.drop(df.columns[0], axis=1)
#delete blank data
df  = df[df["Rate Count"] > 1.0]
df  = df[df["ABV"].notnull()]
df  = df[df["Suggested Serving Temperature"].notnull()]
df  = df[df["Calories Per Serving (12 OZ/0.35L)"].notnull()]



df['Price'] = df['Price'].replace('[\$\,\.]', '', regex=True).astype(float)


temp_class = { '55-60° F' : 5, '50-55° F' : 4, '45-50° F' : 3 , '60-65° F' : 6, '40-45° F' : 2,
       '70-75° F' : 8, '35-40° F': 1 , '65-70° F' : 7}
df = df.replace({"Suggested Serving Temperature": temp_class})


#drop ID and reset row

df.drop(columns=["Volume", "Description", "IBU"], inplace=True)
df.reset_index(drop=True, inplace=True)

df.to_csv("./beer_processed.csv")

###process alcohol-consumption-vs-gdp-per-capita and who_life_exp. merge two with years of 2000,2005,2010,2015
df = pd.read_csv("./alcohol-consumption-vs-gdp-per-capita.csv")
df  = df[df["GDP per capita, PPP (constant 2017 international $)"].notnull()]
df = df.loc[df['Year'].isin([2000,2005,2010,2015,2018])]
df  = df[df["Total alcohol consumption per capita (liters of pure alcohol, projected estimates, 15+ years of age)"].notnull()]

df2 = pd.read_csv("./who_life_exp.csv")
df2.rename(columns={'year': 'Year', 'country': 'Entity'}, inplace=True)
df2 = df2.loc[df2['Year'].isin([2000,2005,2010,2015])]
#some country name need to be change to merge...

df['Entity'].replace('Russia', 'Russian Federation', inplace=True)
df2['Entity'].replace('United States of America', 'United States', inplace=True)

# perform an inner join on the 'id' column
df_inner = pd.merge(df, df2, on=['Year', 'Entity'], how='inner')

df3 = pd.read_csv("./HappinessAlcoholConsumption.csv")
df3.rename(columns={'Country': 'Entity'}, inplace=True)
df_inner = pd.merge(df_inner, df3, on=['Entity'], how='inner')



#df.to_csv("./data/conusmption_gdp_year_processed.csv")
df_inner.to_csv("./conusmption_gdp_happiness_year_processed.csv")

