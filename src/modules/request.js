/**
 * Author: Umayr Shahid <umayrr@hotmail.com>,
 * Created: 23:09, 05/06/15.
 */

'use strict';

var Promise = require('bluebird');
var request = require('request-promise');
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

        request(url).then(function (response) {
            var $ = parseResponse(response);
            resolve($);
        }).catch(reject);
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