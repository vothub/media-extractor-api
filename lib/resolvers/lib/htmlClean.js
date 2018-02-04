var htmlRaw = require('./htmlRaw');
var cheerio = require('cheerio');
var unfluff = require('unfluff');
var _ = require('lodash');
var cache = require('../../memcache');

module.exports = function getInfo(url, cb) {
  // console.log('EXTRACT', url);
  if (!url) {
    return cb('No URL provided');
  }

  if (cache.shouldUseCache('extract', url)) {
    return cb(null, cache.get('extract', url));
  }

  htmlRaw(url, function(err, data) {
    if (err || !data) {
      return cb(err || 'No data');
    }
    data = _.cloneDeep(data);

    var $ = cheerio.load(data.body);
    var unfluffed = unfluff(data.body);

    var rtn = {
      url: data.url,

      date: unfluffed.date,
      publisher: unfluffed.publisher,
      author: unfluffed.author,

      title: unfluffed.softTitle,
      description: unfluffed.description,
      text: unfluffed.text,

      links: unfluffed.links,
      image: unfluffed.image,
      videos: unfluffed.videos
    }

    const metaTags = _.map($('meta'), 'attribs');
    rtn.metaTags = metaTags;
    // rtn.text = rtn.text.replace('\n', '<br /><br />');

    // $('img').each(function(i, e) {
    //   rtn.images.push($(e).attr('src'));
    // });

    cache.save('extract', url, rtn);
    cb(null, rtn);
  });
};
