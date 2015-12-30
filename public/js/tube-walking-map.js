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
            zoom: 12, // starting zoom
            minZoom: 9
        });
        mapWidget.mapLayerIDs = [];
        return map;
    },

    initControls: function initControls() {
        $("#settingBtn").on('click', function () {
            $("#map-panel-content").animate({ "width": 280 }, 500, function () {
                $("#closeMenuBtn").addClass('panel-active');
            });
        });

        $("#closeMenuBtn").on('click', function () {
            $("#map-panel-content").animate({ "width": 0 }, 500, function () {
                $("#closeMenuBtn").removeClass('panel-active');
            });
        });

        $("#less5minsBtn").on('click', function () {
            console.log("clikc");
            mapWidget.mapLayerIDs.forEach(function (d) {
                mapWidget.showOrHIdeLayer(ldnMap, d, "none");
            });
            mapWidget.showOrHIdeLayer(ldnMap, "less5mins", "none");
        });

        $("#less15minsBtn").on('click', function () {
            mapWidget.mapLayerIDs.forEach(function (d) {
                mapWidget.showOrHIdeLayer(ldnMap, d, "none");
            });
            mapWidget.showOrHIdeLayer(ldnMap, "less15mins", "none");
        });

        $("#less30minsBtn").on('click', function () {
            mapWidget.mapLayerIDs.forEach(function (d) {
                mapWidget.showOrHIdeLayer(ldnMap, d, "none");
            });
            mapWidget.showOrHIdeLayer(ldnMap, "less30mins", "none");
        });
    },

    /**
     * query db for tube stations data that are within five mins walk of each other
     * @returns {*} jquery deferred promise
     */
    loadFiveMinsData: function loadFiveMinsData() {
        return $.ajax('/api/five-mins-walk');
    },

    /**
     *
     * @param range e.g. 0.6-1.2 (in kms) for approx walking time of 5-10 mins
     * @returns {*} jquery deferred
     */
    loadDataInDistanceRange: function loadDataInDistanceRange(range) {
        return $.ajax('/api/distRange/' + range);
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
    },

    addDataToMap: function addDataToMap(map, sourceName, geojson, lineColor) {
        var opacity = arguments.length <= 4 || arguments[4] === undefined ? 1 : arguments[4];

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
                "line-cap": "round"
            },
            "paint": {
                "line-color": lineColor,
                "line-dasharray": [2, 2],
                "line-width": { "stops": [[2, 0.5], [12, 2]] },
                "line-opacity": opacity
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
    showOrHIdeLayer: function showOrHIdeLayer(map, layerID) {
        var show = arguments.length <= 2 || arguments[2] === undefined ? 'visible' : arguments[2];

        map.setLayoutProperty(layerID, 'visibility', show);
    }
};

var ldnMap = mapWidget.initMap();

ldnMap.on('style.load', function () {
    mapWidget.loadDataInDistanceRange('0-0.6').then(mapWidget.parseToGeojson).then(function (geojson) {
        mapWidget.addDataToMap(ldnMap, "less5mins", geojson, "#dd3497", 0.8);
    });
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

    mapWidget.loadDataInDistanceRange('0.6-1.8').then(mapWidget.parseToGeojson).then(function (geojson) {
        mapWidget.addDataToMap(ldnMap, "less15mins", geojson, "#005a32", 0.5);
    });

    mapWidget.loadDataInDistanceRange('1.8-3.6').then(mapWidget.parseToGeojson).then(function (geojson) {
        mapWidget.addDataToMap(ldnMap, "less30mins", geojson, "#8c96c6");
    });

    mapWidget.initControls();
});
//# sourceMappingURL=tube-walking-map.js.map
