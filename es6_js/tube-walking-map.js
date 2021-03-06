/**
 * Created by wwymak on 19/12/2015.
 */

var mapWidget = {
    initMap(){
        mapboxgl.accessToken = 'pk.eyJ1Ijoid3d5bWFrIiwiYSI6IkxEbENMZzgifQ.pxk3bdzd7n8h4pKzc9zozw';
        var map = new mapboxgl.Map({
            container: 'map', // container id
            style: 'mapbox://styles/mapbox/emerald-v8', //stylesheet location
            //style: 'mapbox://styles/mapbox/streets-v8',
            center: [-0.1275, 51.5072], // starting position
            zoom: 12, // starting zoom
            minZoom: 9
        });
        this.mapLayerIDs = [];

        return map;
    },

    initControls() {
        $("#settingBtn").on('click', (e) =>{
            $(".toolbar").find(".btn-selected").removeClass("btn-selected");
            $(e.currentTarget).addClass("btn-selected");
            $("#map-panel-content").animate({"width": 280}, 500, () => {
                $("#closeMenuBtn").addClass('panel-active');
            });
            $("#routes-all-selector").removeClass('content-inactive').addClass('content-active')
            $("#search-routes").removeClass('content-active').addClass('content-inactive')
        });

        $("#searchBtn").on('click', (e) =>{
            $(".toolbar").find(".btn-selected").removeClass("btn-selected");
            $(e.currentTarget).addClass("btn-selected");
            $("#map-panel-content").animate({"width": 280}, 500, () => {
                $("#closeMenuBtn").addClass('panel-active');
            });

            mapWidget.mapLayerIDs.forEach(d => {
                mapWidget.showOrHIdeLayer(ldnMap, d, "none")
            });

            $("#search-routes").removeClass('content-inactive').addClass('content-active')
            $("#routes-all-selector").removeClass('content-active').addClass('content-inactive')
        });

        $("#closeMenuBtn").on('click', () =>{
            $(".toolbar").find(".btn-selected").removeClass("btn-selected");
            $("#map-panel-content").animate({"width": 0}, 500, () =>{
                $("#closeMenuBtn").removeClass('panel-active');
            });
        });

        $("#infoBtn").on("click", (e) => {
            $(".toolbar").find(".btn-selected").removeClass("btn-selected");
            $(e.currentTarget).addClass("btn-selected");
            $("#infoLightBox").show();
            $("#closeMenuBtn").trigger("click");
        });

        $(document).on('keyup', (e) => {
            if(e.keyCode == 27){
                $("#infoLightBox").hide();
                $("#infoBtn").removeClass("btn-selected");
            }
        });

        $("#closeLightBoxBtn").on("click", ()=>{
            $("#infoLightBox").hide();
            $("#infoBtn").removeClass("btn-selected");
        });

        $("#less5minsBtn").on('click', (e) => {
            mapWidget.mapLayerIDs.forEach(d => {
                mapWidget.showOrHIdeLayer(ldnMap, d, "none")
            });
            mapWidget.showOrHIdeLayer(ldnMap, "less5mins", "visible");
            $(".layer-selector").each((d, el) => $(el).removeClass("selected"));
            $(e.currentTarget).addClass("selected");
        });

        $("#less15minsBtn").on('click', (e) => {
            mapWidget.mapLayerIDs.forEach(d => {
                mapWidget.showOrHIdeLayer(ldnMap, d, "none")
            });
            mapWidget.showOrHIdeLayer(ldnMap, "less15mins", "visible");
            $(".layer-selector").each((d, el) => $(el).removeClass("selected"));
            $(e.currentTarget).addClass("selected");
        });

        $("#less30minsBtn").on('click', (e) => {
            mapWidget.mapLayerIDs.forEach(d => {
                mapWidget.showOrHIdeLayer(ldnMap, d, "none");
            });
            mapWidget.showOrHIdeLayer(ldnMap, "less30mins", "visible");
            $(".layer-selector").each((d, el) => $(el).removeClass("selected"));
            $(e.currentTarget).addClass("selected");
        });
    },

    /**
     *
     * @param range e.g. 0.6-1.2 (in kms) for approx walking time of 5-10 mins
     * @returns {*} jquery deferred
     */
    loadDataInDistanceRange(range){
        return $.ajax('/api/distRange/' + range);
    },

    parseToGeojson(data){
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

        console.log(geoJson)
        return geoJson;
    },

    parseToMarkerGeojson(data){
        var geoJson = {};
        geoJson.type = "FeatureCollection";
        geoJson.features = [];
        for (let i of data){
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
        return geoJson
    },

    addDataToMap(map, sourceName, geojson, lineColor, opacity = 1, visibility = "none") {
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
                "line-cap": "round",
            },
            "paint": {
                "line-color": lineColor,
                "line-dasharray": [2, 2],
                "line-width": {"stops": [[2, 0.5], [12, 2]]},
                "line-opacity": opacity,
            }
        });

        this.mapLayerIDs.push(sourceName);

        this.showOrHIdeLayer(map, sourceName, visibility);
    },

    addMarkerToMap(map, sourceName, geojson) {
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
                "icon-image": "rail-metro-15", // note emerald doesn't come with these icons...
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
    showOrHIdeLayer(map, layerID, show = 'visible'){
        map.setLayoutProperty(layerID, 'visibility', show);
    },

    plotOneRoute(data, map) {
        var geojsonRoute = this.parseToGeojson(data),
            geojsonMarkers = this.parseToMarkerGeojson(data);

console.log(geojsonMarkers)
        if(map.getLayer('searchRoute')){
            map.removeSource('searchRoute')
            map.removeLayer('searchRoute')
        }

        this.addDataToMap(map, "searchRoute", geojsonRoute, "blue", 1, "visible");
        //
        if(map.getLayer('searchRouteMarker')){
            map.removeLayer('searchRouteMarker');
            map.removeSource('searchRouteMarker');
        }

        this.addMarkerToMap(map, "searchRouteMarker", geojsonMarkers);
        var bounds = [];
        geojsonMarkers.features.forEach(d => {
            bounds.push(d.geometry.coordinates)
        });
        this.zoomToBounds(bounds, ldnMap);
    },

    zoomToBounds(lngLatArr, map) {
        map.fitBounds(lngLatArr)
    }
};

var mapControls = {
    initAutoComplete: function(){
        var fromInput = document.getElementById("fromStationInput"),
            toInput = document.getElementById("toStationInput");

        mapControls.resetStationQueryParams();
        mapControls.getStationNames().then(dataArr =>{
            mapControls.fromAutoComplete = new Awesomplete(fromInput, {list: dataArr});
            mapControls.toAutoComplete = new Awesomplete(toInput, {list: dataArr});

            document.addEventListener('awesomplete-selectcomplete', () => {
                mapControls.stationQueryFrom = document.querySelector("#fromStationInput").value;
                mapControls.enableSearchRouteBtn();
            });

            document.addEventListener('awesomplete-selectcomplete', () => {
                mapControls.stationQueryTo = document.querySelector("#toStationInput").value;
                mapControls.enableSearchRouteBtn();
            });
        });



        $("#mapCustomRouteBtn").on("click", () => {
            $.ajax({
                url: '/api/custom-route-search',
                method: "POST",
                //contentType: "application/json",
                data: {
                    point1: mapControls.stationQueryFrom,
                    point2: mapControls.stationQueryTo
                }
            }).then(function(data){
                mapWidget.plotOneRoute(data, ldnMap);


            }, function(err){
                alert("cannot find route...");
            })
        })
    },

    resetStationQueryParams: function(){
        mapControls.stationQueryFrom = null;
        mapControls.stationQueryTo = null;
        $("#mapCustomRouteBtn").prop("disabled", true);
    },

    enableSearchRouteBtn: function(){
        var searchRouteBtn = $("#mapCustomRouteBtn");
        if(mapControls.stationQueryFrom != "" && mapControls.stationQueryFrom != null
            && mapControls.stationQueryTo != null && mapControls.stationQueryTo != ""){
            searchRouteBtn.prop("disabled", false);
        }
    },

    getStationNames: function(){
        return $.ajax("/api/tube-stations-names").then(dataArr =>{
            mapControls.tubeStationList = dataArr
            return dataArr
        })
    },

    hideSearchSection: function(){
        mapControls.resetStationQueryParams();
        $("#search-routes").removeClass('content-active').addClass('content-inactive');
    }
}

var ldnMap = mapWidget.initMap();


ldnMap.on('style.load', () =>{
    mapWidget.loadDataInDistanceRange('0-0.6').then(mapWidget.parseToGeojson)
        .then(function(geojson){
        mapWidget.addDataToMap(ldnMap, "less5mins", geojson, "#dd3497", 0.8)
    });

    mapWidget.loadDataInDistanceRange('0.6-1.8').then(mapWidget.parseToGeojson)
        .then(function(geojson){
            mapWidget.addDataToMap(ldnMap, "less15mins", geojson, "#005a32", 0.5, "visible");

        }).then(function(){
            $("#initLoadingScreen").addClass("inactive");
            $("#infoLightBox").removeClass("inactive")
        });

    mapWidget.loadDataInDistanceRange('1.8-3.6').then(mapWidget.parseToGeojson)
        .then(function(geojson){
            mapWidget.addDataToMap(ldnMap, "less30mins", geojson, "#8c96c6")
        });

    ldnMap.on('load', ()=> {
        mapWidget.initControls();
        mapControls.initAutoComplete();
    });




});