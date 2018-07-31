var mongoose = require('mongoose');
var db = require("../database");

var userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    regTime: { type: Date, default: Date.now }
})
var Model = mongoose.model('usertests', userSchema);
module.exports = Model;