/**
 * Author: Umayr Shahid <umayrr@hotmail.com>,
 * Created: 23:08, 05/06/15.
 */

'use strict';

var BASE_URL = 'https://eatoye.pk';

/**
 * Very tiny module to handle urls for the scrapper.
 *
 * @module modules/url
 */
module.exports = {
    getListingUrl: getListingUrl,
    getMenuListingUrl: getMenuListingUrl
};

/**
 * Returns complete url to fetch `restaurant` listing from.
 *
 * @param {Number} [page=0] - Page no for the Url.
 * @returns {string}
 */
function getListingUrl(page) {
    return BASE_URL + '/karachi/delivery?&s=rating&Search_PageNo=' + (typeof page === 'undefined' ? 0 : page);
}

/**
 * Returns complete url to fetch `menu item` listing for a given restaurant.
 *
 * @param suffix
 * @returns {string}
 */
function getMenuListingUrl(suffix) {
    return BASE_URL + suffix;
}