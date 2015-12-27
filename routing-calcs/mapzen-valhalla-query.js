/**
 * Created by wwymak on 27/12/2015.
 */

var  fs = require('fs'),
    parse = require('csv').parse,
    promisify = require('promisify-node'),
    mongoskin = require('mongoskin'),
    polyline = require('polyline'),
    async = require('async'),
    https = require('https'),
    queryString = require('querystring');

var database = require(__dirname + '/config/database');
global.__base = __dirname + '/';
var mongoskinDB = mongoskin.db(database.dburl);
var routeCollection = mongoskinDB.collection('tubeWalkingValhalla');

var routingURL = "http://valhalla.mapzen.com/route";
var apiKey = "valhalla-nsYDWhg";

//var

var routeSaveAsync = function(start, end, callback){
    osrm.route({
        coordinates: [[+start.Latitude, +start.Longitude],[+end.Latitude, +end.Longitude]],
        alternateRoute: false,
        printInstructions: false}, function(err, route) {
        if(err){
            console.log(err);
            return
        }else{
            var doc = {
                point1: {
                    name:start.Station,
                    lat: +start.Latitude,
                    lng: +start.Longitude
                },
                point2: {
                    name:end.Station,
                    lat: +end.Latitude,
                    lng: +end.Longitude
                },
                distance: route.route_summary.total_distance /1000, //convert to km
                routePoints: route.route_geometry
            };
            routeCollection.insertOne(doc, function(err, r){
                if(err){
                    console.log(err, "routeCollectioninsert err");
                }else{
                    //if(callback) callback('null');
                    callback()
                }

            });

        }

    });
}
var parser = parse({
    delimiter: ',',
    columns: true
}, function(err, data){

    function calcRouteAndSaveToDB(tubeStationDataArr){
        var arr = tubeStationDataArr.map(function(d, i){
            return {
                startData: d,
                dataArr: tubeStationDataArr.slice(i + 1)
            }
        });

        arr.pop();


        var taskArr = arr.map(function(d, i){
            //if(i == 0){
            return function (callback){
                console.log(d.startData);
                async.eachSeries(d.dataArr, function(dataPoint, callback1){
                        routeSaveAsync(d.startData, dataPoint, callback1);
                    },
                    //function(err){
                    //callback('null')
                    //if(err){
                    //    console.log("err taskArr", err)
                    //}else{
                    //    console.log("1 set", i)
                    //    callback('null')
                    //}
                    //}
                    callback);

            }
        });
        async.series(taskArr, function(err, r){
            console.log(err, r, "done")
        });
    }
    calcRouteAndSaveToDB(data)

});

fs.createReadStream('data/London_tube_stations.csv').pipe(parser);