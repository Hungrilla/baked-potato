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


    return _restaurant.insert({
        url: url,
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
 * @param item - Raw html of the item that needs to be scraped.
 * @returns {Promise}
 */
function item(uuid, item) {
    var $parent = cheerio.load(item);

    var type = $parent('h4').text();

    var $children = $parent('.menu-item');
    var array = [];

    for (var i = 0; i < $children.length; i++) {
        var $child = cheerio.load($children[i]);
        var description = $child('.menu-item-name small').text();
        var name = $child('.menu-item-name').contents()[0].data;
        var serves = $child('.menu-subitems .menu-subitem .subitem-name').text();
        var price = $child('.menu-subitems .menu-subitem .subitem-price > span').text();

        var promise = _menu.insert({
            restaurantId: uuid,
            name: name.trim(),
            type: type.trim(),
            description: description.trim(),
            serves: serves.trim(),
            price: price.trim()
        }).catch(function () {
            console.log(chalk.red('Restaurant: ' + uuid + ' - Item `' + name.trim() + '` already exists.'));
        });

        array.push(promise);
    }

    return Promise.all(array);
}
