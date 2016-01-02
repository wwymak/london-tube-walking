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
        this.mapLayerIDs = [];

        return map;
    },
    initControls: function initControls() {
        $("#settingBtn").on('click', function (e) {
            $(".toolbar").find(".btn-selected").removeClass("btn-selected");
            $(e.currentTarget).addClass("btn-selected");
            $("#map-panel-content").animate({ "width": 280 }, 500, function () {
                $("#closeMenuBtn").addClass('panel-active');
            });
            $("#routes-all-selector").removeClass('content-inactive').addClass('content-active');
            $("#search-routes").removeClass('content-active').addClass('content-inactive');
        });

        $("#searchBtn").on('click', function (e) {
            $(".toolbar").find(".btn-selected").removeClass("btn-selected");
            $(e.currentTarget).addClass("btn-selected");
            $("#map-panel-content").animate({ "width": 280 }, 500, function () {
                $("#closeMenuBtn").addClass('panel-active');
            });

            mapWidget.mapLayerIDs.forEach(function (d) {
                mapWidget.showOrHIdeLayer(ldnMap, d, "none");
            });

            $("#search-routes").removeClass('content-inactive').addClass('content-active');
            $("#routes-all-selector").removeClass('content-active').addClass('content-inactive');
        });

        $("#closeMenuBtn").on('click', function () {
            $(".toolbar").find(".btn-selected").removeClass("btn-selected");
            $("#map-panel-content").animate({ "width": 0 }, 500, function () {
                $("#closeMenuBtn").removeClass('panel-active');
            });
        });

        $("#infoBtn").on("click", function (e) {
            $(".toolbar").find(".btn-selected").removeClass("btn-selected");
            $(e.currentTarget).addClass("btn-selected");
            $("#infoLightBox").show();
            $("#closeMenuBtn").trigger("click");
        });

        $(document).on('keyup', function (e) {
            if (e.keyCode == 27) {
                $("#infoLightBox").hide();
                $("#infoBtn").removeClass("btn-selected");
            }
        });

        $("#closeLightBoxBtn").on("click", function () {
            $("#infoLightBox").hide();
            $("#infoBtn").removeClass("btn-selected");
        });

        $("#less5minsBtn").on('click', function (e) {
            mapWidget.mapLayerIDs.forEach(function (d) {
                mapWidget.showOrHIdeLayer(ldnMap, d, "none");
            });
            mapWidget.showOrHIdeLayer(ldnMap, "less5mins", "visible");
            $(".layer-selector").each(function (d, el) {
                return $(el).removeClass("selected");
            });
            $(e.currentTarget).addClass("selected");
        });

        $("#less15minsBtn").on('click', function (e) {
            mapWidget.mapLayerIDs.forEach(function (d) {
                mapWidget.showOrHIdeLayer(ldnMap, d, "none");
            });
            mapWidget.showOrHIdeLayer(ldnMap, "less15mins", "visible");
            $(".layer-selector").each(function (d, el) {
                return $(el).removeClass("selected");
            });
            $(e.currentTarget).addClass("selected");
        });

        $("#less30minsBtn").on('click', function (e) {
            mapWidget.mapLayerIDs.forEach(function (d) {
                mapWidget.showOrHIdeLayer(ldnMap, d, "none");
            });
            mapWidget.showOrHIdeLayer(ldnMap, "less30mins", "visible");
            $(".layer-selector").each(function (d, el) {
                return $(el).removeClass("selected");
            });
            $(e.currentTarget).addClass("selected");
        });
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

        console.log(geoJson);
        return geoJson;
    },
    parseToMarkerGeojson: function parseToMarkerGeojson(data) {
        var geoJson = {};
        geoJson.type = "FeatureCollection";
        geoJson.features = [];
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = data[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var i = _step2.value;

                geoJson.features.push({
                    type: "Feature",
                    properties: {
                        "marker-symbol": "rail-metro",
                        "marker-size": "medium",
                        "description": i.point2.name
                    },
                    geometry: {
                        "type": "Point",
                        "coordinates": [i.point2.lng, i.point2.lat]
                    }
                }, {
                    type: "Feature",
                    properties: {
                        "marker-symbol": "rail",
                        "marker-size": "medium",
                        "description": i.point1.name
                    },
                    geometry: {
                        "type": "Point",
                        "coordinates": [i.point1.lng, i.point1.lat]
                    }
                });
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }

        return geoJson;
    },
    addDataToMap: function addDataToMap(map, sourceName, geojson, lineColor) {
        var opacity = arguments.length <= 4 || arguments[4] === undefined ? 1 : arguments[4];
        var visibility = arguments.length <= 5 || arguments[5] === undefined ? "none" : arguments[5];

        map.addSource(sourceName, {
            "type": "geojson",
            "data": geojson
        });

        map.addLayer({
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

        this.mapLayerIDs.push(sourceName);

        this.showOrHIdeLayer(map, sourceName, visibility);
    },
    addMarkerToMap: function addMarkerToMap(map, sourceName, geojson) {
        map.addSource(sourceName, {
            "type": "geojson",
            "data": geojson
        });

        map.addLayer({
            "id": sourceName,
            "type": "symbol",
            "source": sourceName,
            "interactive": true,
            "layout": {
                "marker-symbol": "monument",
                "text-field": "{description}"
            }
        });
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
    },
    plotOneRoute: function plotOneRoute(data, map) {
        var geojsonRoute = this.parseToGeojson(data),
            geojsonMarkers = this.parseToMarkerGeojson(data);

        console.log(geojsonMarkers);
        if (map.getLayer('searchRoute')) {
            map.removeSource('searchRoute');
            map.removeLayer('searchRoute');
        }

        this.addDataToMap(map, "searchRoute", geojsonRoute, "blue", 1, "visible");
        //
        if (map.getLayer('searchRouteMarker')) {
            map.removeLayer('searchRouteMarker');
            map.removeSource('searchRouteMarker');
        }

        this.addMarkerToMap(map, "searchRouteMarker", geojsonMarkers);

        //if(!this.searchRouteMarkerSource) {
        //    this.searchRouteMarkerSource = new mapboxgl.GeoJSONSource({
        //        data: geojsonMarkers
        //    });
        //    map.addSource('searchRouteMarker', this.searchRouteMarkerSource);
        //    map.addLayer({
        //        "id": "searchRouteMarker",
        //        "type": "symbol",
        //        "source": "searchRouteMarker",
        //        "layout": {
        //            "icon-image": "{marker-symbol}",
        //            "text-field": "{description}"
        //        }
        //    });
        //}else {
        //    this.searchRouteMarkerSource.setData(geojsonMarkers);
        //}

        //this.zoomToBounds([[data.point1.lng, data.point1.lat],
        //    [data.point2.lng, data.point2.lat]
        //], ldnMap);
    },
    zoomToBounds: function zoomToBounds(lngLatArr, map) {
        map.fitBounds(lngLatArr);
    }
};

var mapControls = {
    initAutoComplete: function initAutoComplete() {
        var fromInput = document.getElementById("fromStationInput"),
            toInput = document.getElementById("toStationInput");

        mapControls.resetStationQueryParams();
        mapControls.getStationNames().then(function (dataArr) {
            mapControls.fromAutoComplete = new Awesomplete(fromInput, { list: dataArr });
            mapControls.toAutoComplete = new Awesomplete(toInput, { list: dataArr });

            document.addEventListener('awesomplete-selectcomplete', function () {
                mapControls.stationQueryFrom = document.querySelector("#fromStationInput").value;
                mapControls.enableSearchRouteBtn();
            });

            document.addEventListener('awesomplete-selectcomplete', function () {
                mapControls.stationQueryTo = document.querySelector("#toStationInput").value;
                mapControls.enableSearchRouteBtn();
            });
        });

        $("#mapCustomRouteBtn").on("click", function () {
            $.ajax({
                url: '/api/custom-route-search',
                method: "POST",
                //contentType: "application/json",
                data: {
                    point1: mapControls.stationQueryFrom,
                    point2: mapControls.stationQueryTo
                }
            }).then(function (data) {
                mapWidget.plotOneRoute(data, ldnMap);
            }, function (err) {
                alert("cannot find route...");
            });
        });
    },

    resetStationQueryParams: function resetStationQueryParams() {
        mapControls.stationQueryFrom = null;
        mapControls.stationQueryTo = null;
        $("#mapCustomRouteBtn").prop("disabled", true);
    },

    enableSearchRouteBtn: function enableSearchRouteBtn() {
        var searchRouteBtn = $("#mapCustomRouteBtn");
        if (mapControls.stationQueryFrom != "" && mapControls.stationQueryFrom != null && mapControls.stationQueryTo != null && mapControls.stationQueryTo != "") {
            searchRouteBtn.prop("disabled", false);
        }
    },

    getStationNames: function getStationNames() {
        return $.ajax("/api/tube-stations-names").then(function (dataArr) {
            mapControls.tubeStationList = dataArr;
            return dataArr;
        });
    },

    hideSearchSection: function hideSearchSection() {
        mapControls.resetStationQueryParams();
        $("#search-routes").removeClass('content-active').addClass('content-inactive');
    }
};

var ldnMap = mapWidget.initMap();

ldnMap.on('style.load', function () {
    mapWidget.loadDataInDistanceRange('0-0.6').then(mapWidget.parseToGeojson).then(function (geojson) {
        mapWidget.addDataToMap(ldnMap, "less5mins", geojson, "#dd3497", 0.8);
    });

    mapWidget.loadDataInDistanceRange('0.6-1.8').then(mapWidget.parseToGeojson).then(function (geojson) {
        mapWidget.addDataToMap(ldnMap, "less15mins", geojson, "#005a32", 0.5, "visible");
    }).then(function () {
        $("#initLoadingScreen").addClass("inactive");
        $("#infoLightBox").removeClass("inactive");
    });

    mapWidget.loadDataInDistanceRange('1.8-3.6').then(mapWidget.parseToGeojson).then(function (geojson) {
        mapWidget.addDataToMap(ldnMap, "less30mins", geojson, "#8c96c6");
    });

    ldnMap.on('load', function () {
        mapWidget.initControls();
        mapControls.initAutoComplete();
    });
});
//# sourceMappingURL=tube-walking-map.js.map
