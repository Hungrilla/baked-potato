/**
 * Author: Umayr Shahid <umayrr@hotmail.com>,
 * Created: 23:49, 05/06/15.
 */

'use strict';

var Promise = require('bluebird');
var chalk = require('chalk');

var fetcher = require('./modules/fetch');

var start = Date.now();
var MAX_PAGE_SIZE = 3; // TODO: Do we need a whole constant file for this? pfft.

// uncomment the line below to fetch a clean copy.
clean();

var promises = [];

for (var i = 0; i <= MAX_PAGE_SIZE; i++) {
  // Let the race begin.
  promises.push(fetcher.listing(i));
}

// TODO: This doesn't work properly. Need a fix.
// This should run in the end, but due to the heavy usage of `http request`; promises aren't working as they should.
// Maybe, I'm wrong but there has to be a way.

Promise.all(promises)
  .then(function () {
    console.log(chalk.green('Completed without errors!'));
    result();
  }, function () {
    console.log(chalk.green('Completed with a few errors!'));
    result();
  });

/**
 * Enforces `Sequelize` to drop the tables before inserting anything.
 */
function clean() {
  var restaurant = require('../lib/repositories/restaurant');
  var menu = require('../lib/repositories/menu');

  restaurant.sync(true);
  menu.sync(true);
}

/**
 * Displays `Time Consumed`.
 */
function result() {
  var end = Date.now();
  console.log(chalk.yellow('Time Consumed: ') + chalk.bold(end - start + 'ms'));
}
