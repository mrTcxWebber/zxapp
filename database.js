var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser:true});

module.exports = db;