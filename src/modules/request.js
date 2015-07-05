/**
 * Author: Umayr Shahid <umayrr@hotmail.com>,
 * Created: 23:09, 05/06/15.
 */

'use strict';

var Promise = require('bluebird');
var request = require('request');
var cheerio = require('cheerio');
var chalk = require('chalk');

/**
 * A module to handle http requests via `request`.
 *
 * @module modules/url
 * @exports make
 */
module.exports = {
  make: make
};

/**
 * Makes a generic request via `request`. Check out Request Package: {@link https://github.com/request/request|Link}
 *
 * If its successful, resolves after parsing `raw` response into a `cheerio` object.
 *
 * @param url - Url to fetch.
 * @returns {bluebird|exports|module.exports}
 */
function make(url) {
  return new Promise(function (resolve, reject) {
    console.log(chalk.blue('Requesting: ') + chalk.white(url));

    //  request.debug = true;

    var options = {
      method: 'GET',
      url: url,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/43.0.2357.130 Safari/537.36'
      }
    };
    request(options, function (error, response) {
      if(!error){
        var $ = parseResponse(response.body);
        resolve($);
      }
      else{
        reject(error);
      }
    });
  });
}

/**
 * Wraps the raw response into cheerio object.
 *
 * @private
 * @param response
 * @returns {object}
 */
function parseResponse(response) {
  return cheerio.load(response, {
    normalizeWhitespace: true
  });
}
