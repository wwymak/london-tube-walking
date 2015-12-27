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
            zoom: 12 // starting zoom
        });
        return map;
    },

    /**
     * query db for tube stations data that are within five mins walk of each other
     * @returns {*} jquery deferred promise
     */
    loadFiveMinsData: function loadFiveMinsData() {
        return $.ajax('/api/five-mins-walk');
    },

    parseToGeojson: function parseToGeojson(data) {
        var geoJson = {};
        geoJson.type = "FeatureCollection";
        geoJson.features = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var i = _step.value;

                var routePoints = [];
                i.routePoints.forEach(function (d) {
                    var b = d[1];
                    d[1] = d[0];
                    d[0] = b;
                    routePoints.push(d);
                });
                var feature = {};
                feature.type = "Feature";
                feature.properties = {
                    distance: i.distance
                };
                feature.geometry = {
                    "type": "LineString",
                    "coordinates": [[i.point1.lng, i.point1.lat]].concat(routePoints, [[i.point2.lng, i.point2.lat]])
                };
                geoJson.features.push(feature);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        return geoJson;
    }
};

var ldnMap = mapWidget.initMap();

ldnMap.on('style.load', function () {
    mapWidget.loadFiveMinsData().then(mapWidget.parseToGeojson).then(function (geojson) {
        console.log(JSON.stringify(geojson));
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
                "line-width": { "stops": [[2, 0.5], [12, 2]] }
                //"line-width": 2
            }
        });
    });
});
//# sourceMappingURL=tube-walking-map.js.map
