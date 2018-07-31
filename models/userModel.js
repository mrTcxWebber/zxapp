var mongoose = require('mongoose');
var db = require("../database");

var userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    regTime: { type: Date, default: Date.now }
})
var UserModel = mongoose.model('usertests', userSchema);

function User(user) {
    this.username = user.username;
    this.password = user.password;
};

User.prototype.regist = function(callback) { // 注册
    var user = {
        username: this.username,
        password: this.password,
    };

    UserModel.find({ username: user.username }, function(err, doc) {
        if (err) {
            // res.json({ response: { msg: '查询出错请重试!', code: 500 } });
            return callback('查询出错请重试!');
        }
        if (doc.length) {
            // res.json({ response: { msg: '该账号已注册!', code: 500 } });
            return callback('该账号已注册!');
        }
        UserModel.create(user, function(err, doc) {
            callback(err, doc);
        });
    });
};

User.prototype.login = function(callback) {
    var user = {
        username: this.username,
        password: this.password,
    };

    UserModel.find({ username: user.username }, function(err, doc) {
        if (err) {
            // res.json({ response: { msg: '查询出错请重试!', code: 500 } });
            return callback('查询出错请重试!');
        }
        if (!doc.length) {
            // res.json({ response: { msg: '账号不存在，请先注册!', code: 500 } });
            return callback('账号不存在，请先注册!');
        }
        if (doc[0].password != user.password) {
            // res.json({ response: { msg: '密码错误，请重试!', code: 500 } });
            return callback('密码错误，请重试!');
        }

        callback(err, doc);
    });
};


module.exports = User;