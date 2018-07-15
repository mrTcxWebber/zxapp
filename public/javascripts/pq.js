var http = require('http');
var cheerio = require('cheerio');
var infoModel = require('../../models/infoModel');

function fetchData(page) {
    http.get('http://www.daqianduan.com/page/' + page, function(res) {
        res.setEncoding('utf-8');
        if (res.statusCode !== 200) {
            throw new Error("请求失败 " + res.statusMessage);
            res.resume();
            return;
        }
        var html = '',
            articleData = [];
        res.on('data', function(chunk) {
            html += chunk;
        });
        res.on('end', function() {
            var $ = cheerio.load(html);
            var articleItem = $('.excerpt');
            articleItem.each(function(i) {
                var articleItemData = {
                    'articleId': articleItem.eq(i).find('.focus').attr('href').slice(26, 30),
                    'articleTitle': articleItem.eq(i).children('header').find('a:not(.cat)').text(),
                    'articleLink': articleItem.eq(i).find('.focus').attr('href'),
                    'articleTag': articleItem.eq(i).children('header').find('.cat').text(),
                    'articleTime': articleItem.eq(i).find('time').text(),
                    'articleAuthor': articleItem.eq(i).find('.author').text(),
                    'articlePvn': articleItem.eq(i).find('.pv').text()
                }
                articleData.push(articleItemData);
            });
            infoModel.create(articleData, function(err, doc) {
                if (err) {
                    throw new Error('填入出错 ' + err);
                    return;
                }
                console.log("添加数据成功! " + doc);
            })
        });
    }).on('error', function(e) {
        console.log('爬虫出错' + e)
    });
}

for (var j = 1; j <= 3; j++) {
    fetchData(j);
}