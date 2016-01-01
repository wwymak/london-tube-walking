/**
 * Created by wwymak on 26/12/2015.
 */

var express  = require('express');
var app      = express();
var morgan = require('morgan');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var port = process.env.PORT || 8080;
var methodOverride = require('method-override');
var database = require(__dirname + '/config/database');
var mongoskin = require('mongoskin');
var mongoskinDB = mongoskin.db(database.dburl);

global.__base = __dirname + '/';

app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
app.use(favicon(__dirname + '/public/images/favicon.png'));
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'false'}));            //
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/*+json' })) // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());


app.use(function(req, res, next){
    req.db = {};
    req.db.tubeRoutingColl = mongoskinDB.collection('tubeWalkingOSRM');
    next();
});

// routes ======================================================================
require(__dirname + '/app/routes.js')(app);

app.listen(port);
console.log("app listening on port 8080");