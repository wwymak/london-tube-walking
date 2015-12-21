/**
 * Created by wwymak on 19/12/2015.
 */

//var OSRM = require('osrm')
//var osrm = new OSRM("berlin-latest.osrm");
//
//osrm.locate([52.4224,13.333086], function (err, result) {
//    console.log(result);
//    // Output: {"status":0,"mapped_coordinate":[52.422442,13.332101]}
//});


var OSRM = require('osrm'),
    fs = require('fs'),
    parse = require('csv').parse,
    promisify = require('promisify-node'),
    mongoskin = require('mongoskin');

var database = require(__dirname + '/config/database');


var osrm = new OSRM("node_modules/osrm/greater-london-latest.osrm");
var tubeStationData;

var router = function(coords){
    osrm.route({
        coordinates: coords,
        alternateRoute: false,
        printInstructions: false}, function(err, route) {
        if(err){
            console.log(err);
            return
        }else{
            console.log(route)
        }

    });
}

var parser = parse({
    delimiter: ',',
    columns: true
}, function(err, data){
    console.log(data[0]);
    tubeStationData = data;
    var coords = []
    //var coords = [[52.519930,13.438640], [52.513191,13.415852]];
    for(var i = 0; i< 2; i++){
        coords.push([+data[i].Latitude, +data[i].Longitude])
    }
    console.log(coords);
    router(coords)
    osrm.table({coordinates: coords}, function(err, table) {
        console.log(table)
    })

});

fs.createReadStream('data/London_tube_stations.csv').pipe(parser);


//osrm.locate([52.4224,13.333086], function (err, result) {
//    console.log(result);
//    // Output: {"status":0,"mapped_coordinate":[52.422442,13.332101]}
//});




