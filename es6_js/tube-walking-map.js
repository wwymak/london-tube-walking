/**
 * Created by wwymak on 19/12/2015.
 */

var mapWidget = {
    initMap: function(){
        mapboxgl.accessToken = 'pk.eyJ1Ijoid3d5bWFrIiwiYSI6IkxEbENMZzgifQ.pxk3bdzd7n8h4pKzc9zozw';
        var map = new mapboxgl.Map({
            container: 'map', // container id
            style: 'mapbox://styles/mapbox/emerald-v8', //stylesheet location
            center: [-0.1275, 51.5072], // starting position
            zoom: 12, // starting zoom
            minZoom: 9
        });
        mapWidget.mapLayerIDs = [];
        return map;
    },

    initControls: function() {
        $("#settingBtn").on('click', () =>{
            $("#map-panel-content").animate({"width": 280}, 500, () => {
                $("#closeMenuBtn").addClass('panel-active');
            });
        });

        $("#closeMenuBtn").on('click', () =>{
            $("#map-panel-content").animate({"width": 0}, 500, () =>{
                $("#closeMenuBtn").removeClass('panel-active');
            });
        });

        $("#less5minsBtn").on('click', () => {
            console.log("clikc")
            mapWidget.mapLayerIDs.forEach(d => {
                mapWidget.showOrHIdeLayer(ldnMap, d, "none")
            });
            mapWidget.showOrHIdeLayer(ldnMap, "less5mins", "visible")
        });

        $("#less15minsBtn").on('click', () => {
          mapWidget.mapLayerIDs.forEach(d => {
              mapWidget.showOrHIdeLayer(ldnMap, d, "none")
          });
          mapWidget.showOrHIdeLayer(ldnMap, "less15mins", "visible")
        })

        $("#less30minsBtn").on('click', () => {
            mapWidget.mapLayerIDs.forEach(d => {
                mapWidget.showOrHIdeLayer(ldnMap, d, "none")
            });
            mapWidget.showOrHIdeLayer(ldnMap, "less30mins", "visible")
        })
    },

    /**
     * query db for tube stations data that are within five mins walk of each other
     * @returns {*} jquery deferred promise
     */
    loadFiveMinsData: function(){
        return $.ajax('/api/five-mins-walk')
    },

    /**
     *
     * @param range e.g. 0.6-1.2 (in kms) for approx walking time of 5-10 mins
     * @returns {*} jquery deferred
     */
    loadDataInDistanceRange: function(range){
        return $.ajax('/api/distRange/' + range);
    },

    parseToGeojson: function(data){
        var geoJson = {};
        geoJson.type = "FeatureCollection";
        geoJson.features = []
        for (let i of data){
            var routePoints = [];
            i.routePoints.forEach(function(d){
                var b = d[1];
                d[1] = d[0];
                d[0] = b;
                routePoints.push(d)
            });
            let feature = {};
            feature.type = "Feature";
            feature.properties= {
                distance: i.distance
            };
            feature.geometry = {
                "type": "LineString",
                "coordinates": ([[i.point1.lng,i.point1.lat]]).concat(routePoints, [[i.point2.lng,i.point2.lat]])
            };
            geoJson.features.push(feature);
        }
        return geoJson;
    },

    addDataToMap: function (map, sourceName, geojson, lineColor, opacity = 1) {
        map.addSource(sourceName, {
            "type": "geojson",
            "data": geojson
        });

        ldnMap.addLayer({
            "id": sourceName,
            "type": "line",
            "source": sourceName,
            "interactive": true,
            "layout": {
                "line-join": "round",
                "line-cap": "round",
            },
            "paint": {
                "line-color": lineColor,
                "line-dasharray": [2, 2],
                "line-width": {"stops": [[2, 0.5], [12, 2]]},
                "line-opacity": opacity,
            }
        });

        mapWidget.mapLayerIDs.push(sourceName);

        mapWidget.showOrHIdeLayer(ldnMap, sourceName, "none");
    },

    /**
     *
     * @param map
     * @param layerID -- maplayer id as specified in addLayer
     * @param show -- 'visible' or 'none'
     */
    showOrHIdeLayer: function(map, layerID, show = 'visible'){
        map.setLayoutProperty(layerID, 'visibility', show);
    }
};

var ldnMap = mapWidget.initMap();


ldnMap.on('style.load', () =>{
    mapWidget.loadDataInDistanceRange('0-0.6').then(mapWidget.parseToGeojson)
        .then(function(geojson){
        mapWidget.addDataToMap(ldnMap, "less5mins", geojson, "#dd3497", 0.8)
    })
    //mapWidget.loadFiveMinsData().then(mapWidget.parseToGeojson)
    //    .then(function(geojson){
    //        ldnMap.addSource("route5mins", {
    //            "type": "geojson",
    //            "data": geojson
    //        });
    //
    //        ldnMap.addLayer({
    //            "id": "route5mins",
    //            "type": "line",
    //            "source": "route5mins",
    //            "interactive": true,
    //            "layout": {
    //                "line-join": "round",
    //                "line-cap": "round"
    //            },
    //            "paint": {
    //                "line-color": "#6e016b",
    //                "line-dasharray": [2, 2],
    //                "line-width": {"stops": [[2, 0.5], [12, 2]]}
    //                //"line-width": 2
    //            }
    //        });
    //    })

    mapWidget.loadDataInDistanceRange('0.6-1.8').then(mapWidget.parseToGeojson)
        .then(function(geojson){
            mapWidget.addDataToMap(ldnMap, "less15mins", geojson, "#005a32", 0.5)
        });

    mapWidget.loadDataInDistanceRange('1.8-3.6').then(mapWidget.parseToGeojson)
        .then(function(geojson){
            mapWidget.addDataToMap(ldnMap, "less30mins", geojson, "#8c96c6")
        })

    mapWidget.initControls();

});