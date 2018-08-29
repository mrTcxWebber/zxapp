var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var infoModel = require('../models/infoModel');
var userModel = require('../models/userModel');
var crypto = require('crypto');
const jwt = require('jsonwebtoken');
var schedule = require('node-schedule');

/* GET home page. and search result page */
router.get('/', function(req, res, next) {
    var ks = req.query.kw || '';
    var userInfo = req.session.user;

    var _filter = {
        $or: [ // 多字段同时匹配
            { articleAuthor: { $regex: ks } },
            { articleTitle: { $regex: ks, $options: '$i' } }, //  $options: '$i' 忽略大小写
        ]
    };

    infoModel.find(_filter, (err, doc) => {
        if (err) {
            throw new Error(err);
            return;
        }
        var pageNum = Math.ceil(doc.length / 8);
        infoModel.find(_filter, {}, { limit: 8, sort: { '_id': -1 } }, (err, doc) => {
            if (err) {
                throw new Error(err);
                return;
            }
            res.render('index', { title: '发现', user: userInfo, article: doc, pageNum: pageNum, page: 1 });
        });
    });
});
// 分页
router.post('/list', function(req, res, next) {
    var ks = req.query.kw || '';
    var page = req.query.page || 1;
    var skipNum = (page - 1) * 8;
    var _filter = {
        $or: [ // 多字段同时匹配
            { articleAuthor: { $regex: ks } },
            { articleTitle: { $regex: ks, $options: '$i' } }, //  $options: '$i' 忽略大小写
        ]
    };

    infoModel.find(_filter, function(err, doc) {
        if (err) {
            throw new Error(err);
            return;
        }
        var pageNum = Math.ceil(doc.length / 8);
        infoModel.find({}, {}, { limit: 8, skip: skipNum, sort: { '_id': -1 } }, function(err, doc) {
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

    userLogin.login((err, doc) => {
        if (err) {
            return errCallback(function() {
                res.json({ response: { msg: err, code: 500 } });
            });
        }
        
        const token = jwt.sign({
            name: doc.username,
            _id: doc._id
        }, 'zxapp', { expiresIn: '10d' });
        req.session.user = doc;
        res.json({ response: { msg: '登录成功！', code: 200, token: token, user: doc.username} });
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
    // if (!userInfo) {
    //     res.redirect('/');
    //     return;
    // }
    res.render('edit', { title: '发布文章', articleType: 'edit' });
});
// 发布文章
router.post('/edit', function(req, res, next) {
    var param = req.body;    
    var articleType = param.articleType;
    var _id = param.articleId;
    let token = param.token;
    var username = '';
    try {
        tokenDecode = jwt.verify(token, 'zxapp');
        if(tokenDecode.iat > tokenDecode.exp){
            res.json({ response: { msg: '请重新登录!', code: 500 } });
            return;
        }
        username = tokenDecode.name;
    }catch(e) {
        console.log(e)
        res.json({ response: { msg: '请登录!', code: 500 } });
        return;
    }

    // var username = req.session.user.username;
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
    if(articleType == 'edit'){
        infoModel.create(datas, function(err, doc) {
            if (err) {
                return errCallback(function() {
                    res.json({ response: { msg: '查询出错请重试!', code: 500 } });
                });
            };
            res.json({ response: { msg: '发布成功!', code: 200 } });
        });
    }else {
        infoModel.findOneAndUpdate({articleAuthor:username,_id:_id}, datas, function(err, doc) {
            if (err) {
                return errCallback(function() {
                    res.json({ response: { msg: '修改出错,请重试!', code: 500 } });
                });
            };
            res.json({ response: { msg: '发布成功!', code: 200 } });
        });
    }
});

// 我的发布
router.get('/m_issue', function(req, res, next) {
    var username = req.session.user.username;
    
    infoModel.find({ articleAuthor: username }, (err, doc) => {
        var pageNum = Math.ceil(doc.length / 8);
        if (err) {
            throw new Error(err);
            res.end('查询出错，请重试!')
            return;
        }
        res.render('m_issue', { title: '我的发布', article: doc, pageNum: pageNum, page: 1 });
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

// 修改文章
router.get('/updateAtl/:articleID', function(req, res, next) {
    var _id = req.params.articleID;
    
    infoModel.findOne({_id:_id}, function(err, doc) {
        if (err) {
            throw err
        };
        
        res.render('edit', { title: '发布文章', data: doc, articleId: _id, articleType:'modifly' });
    });
});

// 删除文章
router.post('/rmAricle', function(req, res, next) {
    var _id = req.body.articleId;
    let token = req.headers.authorization;
    var username = '';
    try {
        tokenDecode = jwt.verify(token, 'zxapp');
        if(tokenDecode.iat > tokenDecode.exp){
            res.json({ response: { msg: '请重新登录!', code: 500 } });
            return;
        }
        username = tokenDecode.name;
    }catch(e) {
        console.log(e)
        res.json({ response: { msg: '请登录!', code: 500 } });
        return;
    }

    infoModel.find({_id:_id,articleAuthor:username}).remove().then(result => { //{ n: 1, ok: 1 }
        res.json({ response: { msg: '删除成功!', code: 200 } });
    }).catch(err => {
        throw err;
        res.json({ response: { msg: '删除失败请重试!', code: 500 } });
    })
});



// 接受告警信息
router.all('/alarm', function(req, res, next) {
    var param = req.params;
    var bodyArg = req.body;
    console.log(req.params)
    var logTxt = path.join(__dirname, 'public/log.txt');

    fs.appendFile(logTxt, data, (err) => {
        if (err) {
            return errCallback(() => {
                res.json({ response: { msg: err, code: 500 } });
            });
        }
        fs.readFile(logTxt, 'utf8', function(rderr, data) {
            if (rderr) {
                return errCallback(() => {
                    res.json({ response: { msg: err, code: 500 } });
                });
            }
            res.json({ response: { msg: '读取成功！', code: 500 }, result: data });
        });
    });
})

function errCallback(cb) {
    typeof cb === 'function' && cb();
    return false;
}

function getDate() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

module.exports = router;