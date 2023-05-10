
from flask import Flask, request, render_template, jsonify, Response
import threading
#from flask_classful import FlaskView,route
from flask_cors import CORS
import json
import pprint
import pandas as pd
import numpy as np
import copy
from matplotlib import pyplot as plt
from collections import Counter
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.manifold import MDS

#from task1_2 import getScreeData
##########################################################################

########################################################################
app = Flask(__name__)
CORS(app)
pca_dict = {}

#best number of cluster - NOT TESTED
best_k = {"wine":3, "spirits": 3, "beer":3, "consumption": 3}
feature_dict = {"wine" : ["Country", "Brand", "ABV", "Categories",  "Rate Count", "Price","region"],
                    "spirits" : ["Country", "Brand","Categories", "ABV", "region"],
                    "beer" : ["Country", "Brand","Categories", "ABV", "region"],
                    "consumption" : ["Country","Total alcohol consumption per capita (liters of pure alcohol, projected estimates, 15+ years of age)", "GDP per capita, PPP (constant 2017 international $)", "Population (historical estimates)",'life_expect', 'HappinessScore']}


def buildProduce_PCA(alcohol):
    df = pd.read_csv(f"./public/data/{alcohol}_processed.csv")
    #ignore first column since it is index
    features = feature_dict[alcohol]
    country_col = df["Country"]
    country_col.reset_index(drop=True, inplace=True)
    id_col  = df['Unnamed: 0']
    id_col.reset_index(drop=True, inplace=True)
    name_col = df["Name"]
    name_col.reset_index(drop=True, inplace=True)
    # convert string columns to categorical data
    for col in df.columns:
        # Check if the column is of type string
        if df[col].dtype == 'object':
            # Convert the column to numerical categories
            df[col] = pd.Categorical(df[col]).codes

    X = df[features].to_numpy()

    # normalzie the data 
    scaler = StandardScaler()
    X_norm = scaler.fit_transform(X)
    # perform PCA transformation
    pca = PCA()
    X_pca = pca.fit_transform(X_norm)
    loadings = pd.DataFrame(pca.components_.T, index=features)
    #top_loadings = copy.deepcopy(loadings)

    #add kmeans label for all PC selected 
    from threadpoolctl import threadpool_limits
    with threadpool_limits(user_api="openmp", limits=4):
        biplot_cluster = KMeans(n_clusters=best_k[alcohol],max_iter=500, random_state=0).fit(X_norm)
    scat_df = pd.DataFrame(X_pca[:,0:2], columns=['first_pca','second_pca'])
    scat_df["label"] = biplot_cluster.labels_
    scat_df["Country"] = country_col
    scat_df["ID"] = id_col
    scat_df["Name"] = name_col

    axes_df = pd.DataFrame((pca.components_[0:2, :]).T, columns=['first_pca','second_pca'])
    axes_df["ind"] = features
    pca_dict[alcohol] = {"scatters" : scat_df, "vectors" : axes_df}

    axes_df.to_csv(f'./public/data/pca_{alcohol}_vectors.csv', index=False)
    scat_df.to_csv(f'./public/data/pca_{alcohol}_scatters.csv', index=False)
    
    # # draw the biplot
    # plt.figure(figsize=(10,8))
    # plt.scatter(X_pca[:,0], X_pca[:,1],alpha=.8)
    # origin = np.zeros((2,len(features)))
    # plt.quiver(*origin, pca.components_[0,:], pca.components_[1,:], scale=3, alpha=.5)
    # plt.show()


def buildConsump_PCA():
    df = pd.read_csv("./public/data/conusmption_gdp_happiness_year_processed.csv")
    #ignore first column since it is index
    features = feature_dict["consumption"]
    #filter out year 2015
    #df = df[df["Year"] == 2015]
    country_col = df["Country"]
    year_col = df["Year"]
    country_col.reset_index(drop=True, inplace=True)
    year_col.reset_index(drop=True, inplace=True)
    # convert string columns to categorical data
    for col in df.columns:
        # Check if the column is of type string
        if df[col].dtype == 'object':
            # Convert the column to numerical categories
            df[col] = pd.Categorical(df[col]).codes

    X = df[features].to_numpy()

    # normalzie the data 
    scaler = StandardScaler()
    X_norm = scaler.fit_transform(X)
    # perform PCA transformation
    pca = PCA()
    X_pca = pca.fit_transform(X_norm)
    loadings = pd.DataFrame(pca.components_.T, index=features)
    #top_loadings = copy.deepcopy(loadings)

    #add kmeans label for all PC selected 
    from threadpoolctl import threadpool_limits
    with threadpool_limits(user_api="openmp", limits=4):
        biplot_cluster = KMeans(n_clusters=best_k["consumption"],max_iter=500, random_state=0).fit(X_norm)
    scat_df = pd.DataFrame(X_pca[:,0:2], columns=['first_pca','second_pca'])
    scat_df["label"] = biplot_cluster.labels_
    scat_df["Country"] = country_col
    scat_df["Year"] = year_col

    axes_df = pd.DataFrame((pca.components_[0:2, :]).T, columns=['first_pca','second_pca'])
    display_dict = {'Total alcohol consumption per capita (liters of pure alcohol, projected estimates, 15+ years of age)': 'Consumption',
                     "GDP per capita, PPP (constant 2017 international $)": "GDP", 
                     "Population (historical estimates)": "Population"}
    axes_df["ind"] = [display_dict.get(n, n) for n in features]
    pca_dict["consumption"] = {"scatters" : scat_df, "vectors" : axes_df}

    axes_df.to_csv(f'./public/data/pca_consumption_vectors.csv', index=False)
    scat_df.to_csv(f'./public/data/pca_consumption_scatters.csv', index=False)



buildProduce_PCA("wine")
buildProduce_PCA("spirits")
buildProduce_PCA("beer")

buildConsump_PCA()








@app.route('/getWineBiplotData', methods=['GET'])
def returnWineBiPlotData():
   
    
    return jsonify({'biplot_scatters' : pca_dict["wine"]["scatters"].to_dict(orient='records'),
                    'biplot_vectors' : pca_dict["wine"]["vectors"].to_dict(orient='records'),
                    })

@app.route('/getBeerBiplotData', methods=['GET'])
def returnBeerBiPlotData():
   
    #axes_df.to_csv('./backend/pca_vectors.csv', index=False)
    #scat_df.to_csv('./backend/pca_scatters.csv', index=False)
    
    return jsonify({'biplot_scatters' : pca_dict["beer"]["scatters"].to_dict(orient='records'),
                    'biplot_vectors' : pca_dict["beer"]["vectors"].to_dict(orient='records'),
                    })

@app.route('/getSpiritsBiplotData', methods=['GET'])
def returnSpiritBiPlotData():
   
    #axes_df.to_csv('./backend/pca_vectors.csv', index=False)
    #scat_df.to_csv('./backend/pca_scatters.csv', index=False)
    
    return jsonify({'biplot_scatters' : pca_dict["spirits"]["scatters"].to_dict(orient='records'),
                    'biplot_vectors' : pca_dict["spirits"]["vectors"].to_dict(orient='records'),
                    })





if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)
