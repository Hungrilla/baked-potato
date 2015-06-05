/**
 * Author: Umayr Shahid <umayrr@hotmail.com>,
 * Created: 23:26, 05/06/15.
 */

'use strict';

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
      var items = $response('#listing-container > article');
      for (var i = 0; i < items.length; i++) {
        scrap.restaurant(items[i]).then(menu);
      }
    });
}
