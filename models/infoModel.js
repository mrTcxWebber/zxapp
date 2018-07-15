var mongoose = require('mongoose');
var db = require("../database");

var infoSchema = new mongoose.Schema({
    articleId: String, // 录入的信息类型如果不对应就回报错，所以前端要验证
    articleTitle: String,
    articleLink: String,
    articleTag: String,
    articleTime: String,
    articleAuthor: String,
    articlePvn: String
})
var Model = mongoose.model('dqdtests', infoSchema);
module.exports = Model;