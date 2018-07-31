var schedule = require('node-schedule');
var fetchArticle = require('./pq');

var curpage = 0;

function scheduleCronstyle() {
    schedule.scheduleJob('30 28 15 * * *', function() {
        for (var j = 1; j <= 20; j++) {
            fetchArticle(j);
        }

    });
}

scheduleCronstyle();