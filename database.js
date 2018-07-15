var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost:27017/test');

module.exports = db;