var mongoose = require('mongoose');
// {useNewUrlParser:true}
var db = mongoose.connect('mongodb://localhost:27017/test');

module.exports = db;