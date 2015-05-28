var request = require('request');

module.exports = function(url, timeout) {
  timeout = timeout || 2000;
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve(false);
    }, timeout);
    request(url, function(err) {
      if (err) return resolve(false);
      resolve(true);
    });
  });
};