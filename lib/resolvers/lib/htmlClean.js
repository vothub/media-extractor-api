var htmlRaw = require('./htmlRaw');
var cheerio = require('cheerio');
// var unfluff = require('unfluff');
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

    var $ = cheerio.load(data.response);
    // var unfluffed = unfluff(data.response);

    var rtn = {
      url: data.url,
      title: $('title').text(),
      description: $('meta[name="description"]').text(),
      // title: unfluffed.softTitle,
      // description: unfluffed.description,
      // text: unfluffed.text,
      // links: unfluffed.links,
      // image: unfluffed.image,
      // videos: unfluffed.videos,
      // author: unfluffed.author,
      // publisher: unfluffed.publisher,
      // images: [],
      // adapter: 'extract',
    }
    // console.log($('meta').html());
    // rtn.text = rtn.text.replace('\n', '<br /><br />');

    // $('img').each(function(i, e) {
    //   rtn.images.push($(e).attr('src'));
    // });

    cache.save('extract', url, rtn);
    cb(null, rtn);
  });
};
