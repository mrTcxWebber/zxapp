var express = require('express');
var router = express.Router();
var infoModel = require('../models/infoModel');
var userModel = require('../models/userModel');
var crypto = require('crypto');
var schedule = require('node-schedule');
var fetchArticle = require('../public/javascripts/pq');



/* GET home page. */
router.get('/', function(req, res, next) {
    var userInfo = req.session.user;
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
            res.render('index', { title: '发现', user: userInfo, article: doc, pageNum: pageNum, page: 1 });
        })
    })
});
// 分页
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

// 登录
router.post('/login', function(req, res, next) {
    var username = req.body.username;
    var pwd = req.body.pwd;
    var hash = crypto.createHash('md5');
    var ncrypPwd = hash.update(pwd).digest('hex');

    var userLogin = new userModel({ username: username, password: ncrypPwd });

    userLogin.login(function(err, doc) {
        if (err) {
            return errCallback(function() {
                res.json({ response: { msg: err, code: 500 } });
            });
        }

        req.session.user = doc[0];
        res.json({ response: { msg: '登录成功！', code: 200 } });
    });

    // userModel.find({ username: username }, function(err, doc) {
    //     if (err) {
    //         return errCallback(function() {
    //             res.json({ response: { msg: '查询出错请重试!', code: 500 } });
    //         });
    //     }
    //     if (!doc.length) {
    //         return errCallback(function() {
    //             res.json({ response: { msg: '账号不存在，请先注册!', code: 500 } });
    //         });
    //     }
    //     if (doc[0].password != ncrypPwd) {
    //         return errCallback(function() {
    //             res.json({ response: { msg: '密码错误，请重试!', code: 500 } });
    //         });
    //     }

    //     req.session.user = doc[0];
    //     res.json({ response: { msg: '登录成功！', code: 200 } });
    // });
});

// 注册 regist
router.post('/regist', function(req, res, next) {
    var username = req.body.username;
    var pwd = req.body.pwd;
    var hash = crypto.createHash('md5');
    var ncrypPwd = hash.update(pwd).digest('hex');
    var datas = { username: username, password: ncrypPwd };

    var userReg = new userModel({ username: username, password: ncrypPwd });

    userReg.regist(function(err, doc) {
        if (err) {
            return errCallback(function() {
                res.json({ response: { msg: err, code: 500 } });
            });
        }

        req.session.user = doc;
        res.json({ response: { msg: '注册成功!', code: 200 } });
    });

    // userModel.find({ username: username }, function(err, doc) {
    //     if (err) {
    //         return errCallback(function() {
    //             res.json({ response: { msg: '查询出错请重试!', code: 500 } });
    //         });
    //     }
    //     if (doc.length) {
    //         return errCallback(function() {
    //             res.json({ response: { msg: '该账号已注册!', code: 500 } });
    //         });
    //     }
    //     userModel.create(datas, function(err, doc) {
    //         if (err) {
    //             return errCallback(function() {
    //                 res.json({ response: { msg: '查询出错请重试!', code: 500 } });
    //             });
    //         };
    //         req.session.user = doc;
    //         res.json({ response: { msg: '注册成功!', code: 200 } });
    //     });
    // })
});

// 退出登录
router.get('/logout', function(req, res, next) {
    req.session.user = null;
    setTimeout(function() { res.redirect('/'); }, 1000);
});
// 发布页
router.get('/edit', function(req, res, next) {
    var userInfo = req.session.user;
    if (!userInfo) {
        res.redirect('/');
        return;
    }
    res.render('edit', { title: '发布文章', user: userInfo });
});
// 发布文章
router.post('/edit', function(req, res, next) {
    var username = req.session.user.username;
    var articleTitle = req.body.title;
    var articleContent = req.body.content;
    var articleTag = 'web前端';
    var articleTime = getDate();
    articleAuthor: username;
    articlePvn: '阅读(0)';
    var datas = {};

    userModel.create(datas, function(err, doc) {
        if (err) {
            return errCallback(function() {
                res.json({ response: { msg: '查询出错请重试!', code: 500 } });
            });
        };
        res.json({ response: { msg: '注册成功!', code: 200 } });
    });

});

function errCallback(cb) {
    typeof cb === 'function' && cb();
    return false;
}

function getDate() {
    var d = new Date();
    return d.getFullYear + '-' + (d.getMonth + 1) + '-' + d.getDate
}

module.exports = router;