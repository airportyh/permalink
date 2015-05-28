var request = require('request-promise');
var cheerio = require('cheerio');

module.exports = function(url) {
  return request(`https://web.archive.org/save/${url}`)
    .then(function() {
      return true
    })
    .error(function(err) {
      var $ = cheerio.load(err.message);
      err = new Error;
      err.message = $('#error').text().replace(/\s+/g, ' ').trim();
      err.learnMore = $('.wm-nav-link-div').html();
      throw err;
    });
};