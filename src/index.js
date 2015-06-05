/**
 * Author: Umayr Shahid <umayrr@hotmail.com>,
 * Created: 2:11 AM, 27/05/15.
 */

'use strict';

var request = require('request-promise');
var cheerio = require('cheerio');
var Promise = require('bluebird');

var base = 'https://eatoye.pk/karachi/delivery?&s=rating'; // TODO : Need to move this into constants.

var restaurant = require('../lib/repositories/restaurant');
var menu = require('../lib/repositories/menu');


restaurant.sync(true);
menu.sync(true);

request(base).then(function (response) {
    var $ = parseResponse(response);
    var items = $('#listing-container > article'); // TODO: See L45.

    for (var i = 0; i < items.length; i++) {
        parseRestaurant(items[i])
            .then(fetchMenuItems)
            .spread(function () {
                console.log('Item inserted.');
            });
    }

});

/**
 * Fetches menu items for a given restaurant.
 *
 * @param restaurant
 */
function fetchMenuItems(restaurant) {
    request('https://eatoye.pk' + restaurant.url).then(function (response) {
        var $ = parseResponse(response);
        var items = $('#single-outlet #menu .tab-content > .tab-pane');
        for (var i = 0; i < items.length; i++) {
            parseMenuItem(restaurant.uuid, items[i]);
        }
    });
}

/**
 * Wraps the raw response into cheerio object.
 *
 * @param response
 * @returns {object}
 */
function parseResponse(response) {
    return cheerio.load(response, {
        normalizeWhitespace: true
    });
}

/**
 * Parses single item in main listing.
 *
 * @param item {object}
 * @returns {Promise}
 */
function parseRestaurant(item) {
    var $item = cheerio.load(item);

    // TODO: Below all paths are hard coated. This either needs to be moved into a JSON or separate constants file.
    var url = $item('.item-pic > a').attr('href');
    var name = $item('.item-details > .item-title > a').text();
    var rating = $item('.item-details > .item-title > span').data('rating');
    var type = $item('.item-details > .item-meta > .item-address').text();

    // TODO: Parse detailed restaurant view.

    return insertRestaurant({
        url: url,
        name: name,
        rating: rating,
        type: type
    });
}

/**
 * Parses single item in the whole menu list for a given restaurant.
 *
 * @param uuid
 * @param item
 */
function parseMenuItem(uuid, item) {
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

        array.push(insertMenuItems(
            {
                restaurantId: uuid,
                name: name,
                type: type,
                description: description,
                serves: serves,
                price: price
            }
        ));
    }

    return Promise.all(array);
}

/**
 * Inserts a parsed restaurant into database.
 *
 * @param details {object}
 * @returns {Promise}
 */
function insertRestaurant(details) {
    return restaurant.insert(details).catch(function (err) {
        throw new Error(err, details);
    })
}

/**
 * Inserts a single menu item for a given restaurant.
 *
 * @param details
 */
function insertMenuItems(details) {
    return menu.insert(details).catch(function (err) {
        console.log(err, details);
        process.exit(1);
    });
}


