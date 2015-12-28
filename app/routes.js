/**
 * Express routes
 * todo figure out what to do with the large datasets e.g. all-data which crashes thee routine as it runs out
 * of memory...
 */

var express  = require('express');
var router = express.Router();
var polyline = require('polyline');

router.get('/' , function (req, res) {
    console.log("getting base indexhtml");
    res.sendFile(__base + 'public/tube-walking-map.html'); // load the single view file (angular will handle the page changes on the front-end)
});

//api end point to get data about tube station pairs that are within 5 mins walk of each other
//assume 2m per second
router.get('/api/five-mins-walk', function(req, res, next){
    req.db.tubeRoutingColl.find({distance: {$lt: 0.6}})
    .toArray(function(err, result){
        if(err) return next(err);
        var out = []
        result.forEach(function(doc){
            doc.routePoints = polyline.decode(doc.routePoints, 6);
            out.push(doc);
        })
        res.json(result);
    });

});

router.get('/api/all-data', function(req, res, next){
    req.db.tubeRoutingColl.find({})
        .toArray(function(err, result){
            if(err) return next(err);
            var out = [];
            result.forEach(function(doc){
                doc.routePoints = polyline.decode(doc.routePoints, 6);
                out.push(doc);
            })
            res.json(result);
        });

});

router.param('maxDist', function(req, res, next, dist) {
    req.dist = dist;
    next();
});

router.get('/api/maxDist/:maxDist', function(req, res, next){
    //res.set('Content-Type', 'application/json')
    var dist = req.dist;
    var stream = req.db.tubeRoutingColl.find({distance: {$lt: +dist}}).stream();
    var first = true;

    stream.on('data', function(item) {
        var prefix = first ? '' : ', ';
        item.routePoints = polyline.decode(item.routePoints, 6);
        res.write(prefix + JSON.stringify(item));
        first = false;
    });
    stream.on('end', function() {
        res.write(']}');
        res.end();
    });
    //req.db.tubeRoutingColl.find({distance: {$lt: +dist}})
    //    .toArray(function(err, result){
    //        if(err) return next(err);
    //        var out = [];
    //        result.forEach(function(doc){
    //            doc.routePoints = polyline.decode(doc.routePoints, 6);
    //            out.push(doc);
    //        })
    //        res.json(result);
    //    });

});

router.param('minDist', function(req, res, next, dist) {
    req.dist = dist;
    next();
});

router.get('/api/minDist/:minDist', function(req, res, next){
    var dist = req.dist;
    req.db.tubeRoutingColl.find({distance: {$gt: +dist}})
        .toArray(function(err, result){
            if(err) return next(err);
            var out = [];
            result.forEach(function(doc){
                doc.routePoints = polyline.decode(doc.routePoints, 6);
                out.push(doc);
            })
            res.json(result);
        });

});

router.param('distRange', function(req, res, next, dist) {
    req.dist = dist;
    next();
});

/**
 * exepct the disrRange to be e.g. 5-10
 */
router.get('/api/distRange/:distRange', function(req, res, next){
    var maxMinArr = req.dist.split('-');
    var minDist = maxMinArr[0],
        maxDist = maxMinArr[1];

    req.db.tubeRoutingColl.find({distance: {$lt: +maxDist, $gt: +minDist}})
        .toArray(function(err, result){
            if(err) return next(err);
            var out = []
            result.forEach(function(doc){
                doc.routePoints = polyline.decode(doc.routePoints, 6);
                out.push(doc);
            })
            res.json(result);
        });

});


module.exports = function(app){
    app.use('/' ,router);
}