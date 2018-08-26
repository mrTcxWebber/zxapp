var jwt = require('jsonwebtoken');

var Jwt = {
    
    sign: function(options) {
        var options = Object.assign({
            payload: {},
            secret: 'zxapp',
            opt: { expiresIn: '10d' }
        },options);
        return new Promise((resolve, reject) => {
            jwt.sign(options.payload, options.secret, options.opt, (err, token) => {
                error ? reject(error) : resolve(decoded);
            });
        })
    },
    verify: function(options) {
        var options = Object.assign({
            payload: {},
            secret: 'zxapp',
            opt: { expiresIn: '10d' }
        },options);
        console.log(1)
        return new Promise((resolve, reject) => {
            console.log(10)
            jwt.verify(options.payload, options.secret, options.opt, (error, decoded) => {
                error ? reject(error) : resolve(decoded);
            });
        })
    }

}

module.exports = Jwt;