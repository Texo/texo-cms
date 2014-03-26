/**
 * Class: Admin
 * A small class providing basic functions used throughout the
 * administrator.
 *
 * Dependencies:
 *    - jquery
 *    - jquery.blockUI
 */
define(
	[
		"jquery", "blockui"
	],
	function($) {
		"use strict";

		return {
			block: function(msg) {
				$.blockUI({ message: "<h3>" + msg + "</h3>" });
			},
			unblock: function() {
				$.unblockUI();
			}
		};
	}
);
