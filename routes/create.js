var jobLib = require('../lib/job')

module.exports = function (req, res) {
  var inputUrl = (req.body.lookupInput || '').trim();

  if (!inputUrl.length) {
    return res.status(404).send('No URL provided :(');
  }
  var jobData = {url: inputUrl, opts: {ytdl: true}};

  const jobId = jobLib.create(jobData);
  jobLib.start(jobId);
  res.redirect('/view/' + jobId);
}
