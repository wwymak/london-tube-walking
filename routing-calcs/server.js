/**
 * File to run an OSRM query to get travel directions and distance between all of london's tube
 * stations as per London_tube_stations.csv from http://www.doogal.co.uk/
 * using async.series together with async.eachSeries to make sure that the loop queries run in sequence
 * (I am still not completely sure I grasp the complexities yet but due to the way js keeps a reference
 * to values rather than the actual values you can't do nested async loops the way you would sync loops
 * as the values aren't really what you expect them to be)
 *
 *  ***REMEMBER MUST USE NODE v0.10 or v0.12 WITH node-osrm***
 */



var OSRM = require('osrm'),
    fs = require('fs'),
    parse = require('csv').parse,
    promisify = require('promisify-node'),
    mongoskin = require('mongoskin'),
    polyline = require('polyline'),
    async = require('async');

var database = require(__dirname + '/config/database');
global.__base = __dirname + '/';
var mongoskinDB = mongoskin.db(database.dburl);
var routeCollection = mongoskinDB.collection('tubeRoutingCollection');

var osrm = new OSRM("node_modules/osrm/greater-london-latest.osrm");

var routeSave = function(start, end){
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
                //routePoints: polyline.decode(route.route_geometry)
            };
            routeCollection.insertOne(doc, function(err, r){
                console.log(r.insertedCount);
            });
        }

    });
}

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





