var express = require('express');
var router = express.Router();
var infoModel = require('../models/infoModel');
var userModel = require('../models/userModel');
var crypto = require('crypto');
var schedule = require('node-schedule');


/* GET home page. and search result page */
router.get('/', function(req, res, next) {
    var ks = req.query.kw;
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
    var param = req.body;
    var articleTime = getDate();
    var datas = {
        articleId: '',
        articleTitle: param.articleTitle,
        articleLink: '',
        articleTag: param.articleTag,
        articleTime: articleTime,
        articleAuthor: username,
        articleContent: param.articleContent
    };

    infoModel.create(datas, function(err, doc) {
        if (err) {
            return errCallback(function() {
                res.json({ response: { msg: '查询出错请重试!', code: 500 } });
            });
        };
        res.json({ response: { msg: '注册成功!', code: 200 } });
    });
});

// 我的发布
router.get('/m_issue', function(req, res, next) {
    var userInfo = req.session.user;

    if (!userInfo) {
        res.redirect('/');
        return;
    }
    infoModel.find({ articleAuthor: userInfo.username }, (err, doc) => {
        var pageNum = Math.ceil(doc.length / 8);
        if (err) {
            throw new Error(err);
            res.end('查询出错，请重试!')
            return;
        }

        res.render('m_issue', { title: '我的发布', user: userInfo, article: doc, pageNum: pageNum, page: 1 });
    });
});

// 文章详情页
router.get('/articles/:articleID', function(req, res, next) {
    var userInfo = req.session.user;
    var _id = req.params.articleID;

    infoModel.find({ _id: _id }, function(err, doc) {
        if (err) {
            throw err;
            res.end('查询出错，请重试!')
            return;
        }
        res.render('articles', { title: '文章详情', user: userInfo, data: doc[0] });
    })
});

function errCallback(cb) {
    typeof cb === 'function' && cb();
    return false;
}

function getDate() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

module.exports = router;