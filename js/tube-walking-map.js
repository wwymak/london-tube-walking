'use strict';

/**
 * Created by wwymak on 19/12/2015.
 */

var mapWidget = {
    initMap: function initMap() {
        mapboxgl.accessToken = 'pk.eyJ1Ijoid3d5bWFrIiwiYSI6IkxEbENMZzgifQ.pxk3bdzd7n8h4pKzc9zozw';
        var map = new mapboxgl.Map({
            container: 'map', // container id
            style: 'mapbox://styles/mapbox/emerald-v8', //stylesheet location
            center: [-0.1275, 51.5072], // starting position
            zoom: 15 // starting zoom
        });
        return map;
    },

    loadTubeDataPoints: function loadTubeDataPoints() {
        Papa.parse("data/London_tube_stations.csv", {
            download: true,
            header: true,
            complete: function complete(results) {
                console.log("Finished:", results.data);
                var data = results.data;
                var formatted = data.map(function (obj) {
                    var newObj = {};
                    newObj.type = "Feature";
                    newObj.geometry = {};
                    newObj;
                });
            }
        });
    }
};

var ldnMap = mapWidget.initMap();

ldnMap.on('style.load', function () {
    mapWidget.loadTubeDataPoints();
});
//# sourceMappingURL=tube-walking-map.js.map
