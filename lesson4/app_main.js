var eventproxy = require('eventproxy');
var superagent = require('superagent');
var cheerio = require('cheerio');
var url = require('url');

var cnodeUrl = 'https://cnodejs.org/';
superagent.get(cnodeUrl)
    .end(function(err, res){
        if(err) {
            return console.error(err);
        }

        var topicUrls = [];
        var topic = 'topic';

        var $ = cheerio.load(res.text);
        $('#topic_list .topic_title').each(function (idx, elements) {
            var $elements = $(elements);
            var href = url.resolve(cnodeUrl, $elements.attr('href'));
            topicUrls.push(href);
            console.log(href);
        })

        var ep = new eventproxy();

        ep.after(topic, topicUrls.length, function (topics) {
            topics.forEach(function (item) {
                var topicUrl = item[0];
                var html = item[1];
                var $ = cheerio.load(html);
                return({
                    title: $('.topic_full_title').text().trim(),
                    href: topicUrl,
                    comment: $('.reply_content').eq(1).text().trim(),
                });
            })
            console.log(topics)
        });

        topicUrls.forEach(function (topicUrl) {
            superagent.get(topicUrl).end(function (err, res) {
                ep.emit(topic, [topicUrl, res.text])
            })
        })

    });


