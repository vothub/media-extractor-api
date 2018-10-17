const youtubedl = require('youtube-dl');
// const cache = require('../../cache');
const _ = require('lodash');

const omitListFormats = ['http_headers', 'protocol', 'player_url', 'manifest_url'];
const omitListTopLevel = ['http_headers', 'protocol', 'player_url', 'manifest_url', 'url', 'categories', 'resolution', 'width', 'height', 'creator', 'format', 'ext', 'abr', 'uploader_url', 'webpage_url_basename', 'automatic_captions', 'requested_subtitles', 'extractor_key', 'license', 'alt_title', 'vcodec'];

module.exports = function ytdlResolve(url, cb) {
  // if (cache.shouldUseCache('ytdl', url)) {
  //   return cb(null, cache.get('ytdl', url));
  // }

  return youtubedl.getInfo(url, (ytErr, ytInfo) => {
    ytInfo = ytInfo || {};
    ytInfo.formats = ytInfo.formats || [];

    ytInfo.formats = _.map(ytInfo.formats, (f) => {
      return _.omit(f, omitListFormats);
    });

    const rtnInfo = _.omit(ytInfo, omitListTopLevel);

    // cache.save('ytdl', url, rtnInfo);
    return cb(ytErr, rtnInfo);
  });
};
