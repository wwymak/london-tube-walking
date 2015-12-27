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
            zoom: 12 // starting zoom
        });
        return map;
    },

    /**
     * query db for tube stations data that are within five mins walk of each other
     * @returns {*} jquery deferred promise
     */
    loadFiveMinsData: function(){
        return $.ajax('/api/five-mins-walk')
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
    }
};

var ldnMap = mapWidget.initMap();

ldnMap.on('style.load', () =>{
    mapWidget.loadFiveMinsData().then(mapWidget.parseToGeojson)
        .then(function(geojson){
            console.log(JSON.stringify(geojson))
            ldnMap.addSource("route", {
                "type": "geojson",
                "data": geojson
            });

            ldnMap.addLayer({
                "id": "route",
                "type": "line",
                "source": "route",
                "interactive": true,
                "layout": {
                    "line-join": "round",
                    "line-cap": "round"
                },
                "paint": {
                    "line-color": "#888",
                    "line-dasharray": [2, 2],
                    "line-width": {"stops": [[2, 0.5], [12, 2]]}
                    //"line-width": 2
                }
            });
        })
});