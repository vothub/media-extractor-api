var youtubedl = require('youtube-dl');
var cache = require('../../memcache');
var _ = require('lodash');

const omitListFormats = ['http_headers', 'protocol', 'player_url', 'manifest_url'];
const omitListTopLevel = ['http_headers', 'protocol', 'player_url', 'manifest_url', 'url', 'categories', 'resolution', 'width', 'height', 'creator', 'format', 'ext', 'abr', 'uploader_url', 'webpage_url_basename', 'automatic_captions', 'requested_subtitles', 'extractor_key', 'license', 'alt_title', 'vcodec'];

module.exports = function (url, cb) {
  if (cache.shouldUseCache('ytdl', url)) {
    return cb(null, cache.get('ytdl', url));
  }

  return youtubedl.getInfo(url, function (ytErr, ytInfo) {

    ytInfo = ytInfo || {};
    ytInfo.formats = ytInfo.formats || [];

    ytInfo.formats = _.map(ytInfo.formats, function (f) {
      return _.omit(f, omitListFormats);
    });

    var rtnInfo = _.omit(ytInfo, omitListTopLevel);

    cache.save('ytdl', url, rtnInfo);
    return cb(ytErr, rtnInfo);
  });
}
