var dbUrl = 'mongodb://localhost/london-tube-stations-routing';
module.exports.dburl = process.env.MONGO_URL || dbUrl;
