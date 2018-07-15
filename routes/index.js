var express = require('express');
var router = express.Router();
var infoModel = require('../models/infoModel');

/* GET home page. */
router.get('/', function(req, res, next) {
    infoModel.find({}, function(err, doc) {
        if (err) {
            throw new Error(err);
            return;
        }
        var pageNum = Math.ceil(doc.length / 8);
        infoModel.find({}, {}, { limit: 8 }, function(err, doc) {
            if (err) {
                throw new Error(err);
                return;
            }
            res.render('index', { article: doc, pageNum: pageNum, page: 1 });
        })
    })
});

router.post('/list', function(req, res, next) {
    var page = req.query.page || 1;
    var skipNum = (page - 1) * 8;
    infoModel.find({}, function(err, doc) {
        if (err) {
            throw new Error(err);
            return;
        }
        var pageNum = Math.ceil(doc.length / 8);
        infoModel.find({}, {}, { limit: 8, skip: skipNum }, function(err, doc) {
            if (err) {
                throw new Error(err);
                return;
            }
            res.json({ code: 200, msg: 'ok', data: doc, pageNum: pageNum, page: page });
        })
    })
});

module.exports = router;