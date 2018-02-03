function (req, res) {
  // use job here!
  resolvers(input, {ytdl: true}, function (data) {
    data.description = data.description.replace('\n', '<br />');

    res.locals.page = {title: 'URLGent: ' + data.title};
    res.locals.data = data;

    res.render('pages/results');
  });
}
