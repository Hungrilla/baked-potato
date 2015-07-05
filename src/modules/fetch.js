/**
 * Author: Umayr Shahid <umayrr@hotmail.com>,
 * Created: 23:26, 05/06/15.
 */

'use strict';

var chalk = require('chalk');
var Promise = require('bluebird');

var url = require('./url');
var request = require('./request');
var scrap = require('./scrap');

/**
 * Module that fetches restaurant list and their menu items.
 * @module modules/fetch
 */
module.exports = {
  listing: listing
};

/**
 * Fetches menu items for a given restaurant.
 *
 * @private
 * @param restaurant
 * @returns {Promise}
 */
function menu(restaurant) {
  if (typeof restaurant !== 'undefined') {
    var src = url.getMenuListingUrl(restaurant.url);

    return request.make(src)
      .then(function ($response) {
        var items = $response('#single-outlet #menu .tab-content > .tab-pane');
        for (var i = 0; i < items.length; i++) {
          scrap.item(restaurant.uuid, items[i]);
        }
      })
      .catch(function (error) {
        handler(error, 'restaurant', src);
      });
  }
}

/**
 * Fetches listing of restaurants for a given page.
 *
 * @param page
 * @returns {Promise}
 */
function listing(page) {
  page = page || 0;

  var src = url.getListingUrl(page);
  return request.make(src)
    .then(function ($response) {
      var q = [];
      var items = $response('#listing-container > article');
      for (var i = 0; i < items.length; i++) {
        q.push(scrap.restaurant(items[i]).then(menu));
      }
      return Promise.all(q);
    })
    .catch(function (error) {
      handler(error, 'listing', src);
    });
}

/**
 * Handles the request errors.
 *
 * @private
 * @param error - error object contains error details and stack.
 * @param type - either its a menu or a restaurant that is failed to be fetched
 * @param url - url of the failed request.
 */
function handler(error, type, url) {
  var message = chalk.red('Failed to fetch [{0}]: `{1}`').replace('{0}', type).replace('{1}', url);
  console.log(message);
}
