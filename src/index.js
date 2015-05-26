/**
 * Author: Umayr Shahid <umayrr@hotmail.com>,
 * Created: 2:11 AM, 27/05/15.
 */

'use strict';

var request = require('request-promise');
var cheerio = require('cheerio');

var base = 'https://eatoye.pk/karachi/delivery?&s=rating'; // TODO : Need to move this into constants.

var restaurant = require('../lib/repositories/restaurant');

request(base).then(function (response) {
    var $ = parseResponse(response);
    var items = $('#listing-container > article'); // TODO: See L43.

    for (var i = 0; i < items.length; i++) {
        parseItem(items[i]);
    }

});

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
 */
function parseItem(item) {
    var $item = cheerio.load(item);

    // TODO: Below all paths are hard coated. This either needs to be moved into a JSON or separate constants file.
    var url = $item('.item-pic > a').attr('href');
    var name = $item('.item-details > .item-title > a').text();
    var rating = $item('.item-details > .item-title > span').data('rating');
    var type = $item('.item-details > .item-meta > .item-address').text();

    // TODO: Parse detailed restaurant view.

    insertRestaurant({
        url: url,
        name: name,
        rating: rating,
        type: type
    });
}

/**
 * Inserts a parsed restaurant into database.
 *
 * @param details {object}
 */
function insertRestaurant(details) {
    restaurant.insert(details).then(function () {
        console.log('woot woot');
    }).catch(function (err) {
        console.log(err);
    })
}