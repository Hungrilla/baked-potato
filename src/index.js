#!/usr/bin/env node

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

// comment the line below to update the entries instead of fetching a clean copy.
clean();

var queue = makeQueue();

Promise.all(queue)
  .spread(function () {
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
  var serving = require('../lib/repositories/serving');

  restaurant.sync(true);
  menu.sync(true);
  serving.sync(true);
}

/**
 * Displays `Time Consumed`.
 */
function result() {
  var end = Date.now();
  console.log(chalk.yellow('Time Consumed: ') + chalk.bold(end - start + 'ms'));
}

/**
 * Generates a queue of all pages that needs to be fetched.
 *
 * @returns {Array}
 */
function makeQueue() {
  var q = [];
  for (var i = 0; i <= MAX_PAGE_SIZE; i++) {
    q.push(fetcher.listing(i));
  }
  return q;
}
