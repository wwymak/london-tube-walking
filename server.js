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
                routePoints: polyline.decode(route.route_geometry)
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
                routePoints: polyline.decode(route.route_geometry)
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
    //tubeStationData = data;
    //var coords = []
    ////var coords = [[52.519930,13.438640], [52.513191,13.415852]];
    //for(var i = 0; i< 2; i++){
    //    coords.push([+data[i].Latitude, +data[i].Longitude])
    //}

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
            //}else {
            //    return function (j, callback){
            //        console.log(j, d.startData, arr[i].startData)
            //        async.each(d.dataArr, function(dataPoint, callback1){
            //            routeSaveAsync(d.startData, dataPoint, callback1);
            //        }, function(err){
            //            if(err){
            //                console.log(err)
            //            }else{
            //                callback('null', j)
            //            }
            //        })
            //
            //    }
            //}
        });

        console.log(taskArr.length)

        function routeCall(data, callback){
            async.each(d.dataArr, function(dataPoint, callback1){
                routeSaveAsync(d.startData, dataPoint, callback1);
            }, function(err){
                if(err){
                    console.log(err)
                }else{
                    callback('null', i)
                }
            })

        }

        //async.each(arr, routeCall, function(err){
        //    // if any of the file processing produced an error, err would equal that error
        //    if( err ) {
        //        console.log('error', err);
        //    } else {
        //        console.log('All files have been processed successfully');
        //    }
        //    })
        async.series(taskArr, function(err, r){
            console.log(err, r, "done")
        })

        //async.ser
    }

    function getRouteAndSave(unsavedTubeData){
        //async.each(unsavedTubeData, function())
        for(var k = 0; k < unsavedTubeData.length; k++){

            (function(k){setTimeout(function(){
                console.log(k)
                for(var j = k + 1; j< unsavedTubeData.length; j++ ){
                    console.log(k, j)
                    routeSave(unsavedTubeData[k], unsavedTubeData[j])
                }
            }, 100)})(k)
        }


        //var processUsers = function(callback) {
        //    getAllUsers(function(err, users) {
        //        async.forEach(users, function(user, callback) {
        //            getContactsOfUser(users.userId, function(err, contacts) {
        //                async.forEach(unsavedTubeData, function(data, callback) {
        //                    getPhonesOfContacts(contacts.contactId, function(err, phones) {
        //                        contact.phones = phones;
        //                        callback();
        //                    });
        //                }, function(err) {
        //                    // All contacts are processed
        //                    user.contacts = contacts;
        //                    callback();
        //                });
        //            });
        //        }, function(err) {
        //            // All users are processed
        //            // Here the finished result
        //            callback(undefined, users);
        //        });
        //    });
        //};
        //
        //processUsers(function(err, users) {
        //    // users here
        //});


    }
    //getRouteAndSave(data)
    calcRouteAndSaveToDB(data)

});

fs.createReadStream('data/London_tube_stations.csv').pipe(parser);


//osrm.locate([52.4224,13.333086], function (err, result) {
//    console.log(result);
//    // Output: {"status":0,"mapped_coordinate":[52.422442,13.332101]}
//});




