var mongoose = require('mongoose');
var db = require("../database");

var infoSchema = new mongoose.Schema({
    articleId: { type: String, default: '' }, // 录入的信息类型如果不对应就回报错，所以前端要验证
    articleTitle: String,
    articleLink: { type: String, default: '' },
    articleTag: String,
    articleTime: String,
    articleAuthor: String,
    articlePvn: { type: String, default: '' },
    articleContent: { type: String, default: '' }
})
var Model = mongoose.model('dqdtests', infoSchema);
module.exports = Model;