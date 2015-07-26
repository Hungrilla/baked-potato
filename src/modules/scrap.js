/**
 * Author: Umayr Shahid <umayrr@hotmail.com>,
 * Created: 23:33, 05/06/15.
 */

'use strict';

var cheerio = require('cheerio');
var Promise = require('bluebird');
var chalk = require('chalk');

var _restaurant = require('../../lib/repositories/restaurant');
var _menu = require('../../lib/repositories/menu');

/**
 * Module that contains all main logic for scrapping.
 *
 * @module modules/scrap
 */
module.exports = {
  restaurant: restaurant,
  item: item
};

/**
 * Parses single item in main listing.
 *
 * @param item {object}
 * @returns {Promise}
 */
function restaurant(item) {
  var $item = cheerio.load(item);

  var url = $item('.item-pic > a').attr('href');
  var name = $item('.item-details > .item-title > a').text();
  var rating = $item('.item-details > .item-title > span').data('rating');
  var type = $item('.item-details > .item-meta > .item-address').text();
  var img = $item('.item-pic > a > img').attr('src');

  return _restaurant.insert({
    url: url,
    img: img.replace(/.*?:\/\/cdn.eatoye.pk/g, ""),
    name: name,
    rating: rating,
    type: type
  }).catch(function () {
    console.log(chalk.red('Restaurant `' + name + '` already exists.'));
  });
}

/**
 * Parses single item in the whole menu list for a given restaurant.
 *
 * @param uuid - Unique Id for restaurant.
 * @param html - Raw html of the item that needs to be scraped.
 * @returns {Promise}
 */
function item(uuid, html) {
  var $parent = cheerio.load(html);

  var type = $parent('h4').text();

  var $children = $parent('.menu-item');
  var array = [];

  var $child = null;
  var description = null;
  var name = null;
  var serves = null;
  var price = null;

  function handler() {
    console.log(chalk.red('Restaurant: ' + uuid + ' - Item `' + name.trim() + '` already exists.'));
  }

  for (var i = 0; i < $children.length; i++) {
    $child = cheerio.load($children[i]);
    description = $child('.menu-item-name small').text();
    name = $child('.menu-item-name').contents()[0].data;
    serves = $child('.menu-subitems .menu-subitem .subitem-name').text();
    price = $child('.menu-subitems .menu-subitem .subitem-price > span').text();

    var promise = _menu.insert({
      restaurantId: uuid,
      name: name.trim(),
      type: type.trim(),
      description: description.trim()
    }).catch(handler);

    array.push(promise);
  }

  return Promise.all(array);
}
