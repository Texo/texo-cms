/**
 * File: ToolsService.js
 * A service full of super-useful tools.
 *
 * Dependencies:
 *    jquery
 */
define(
	[
		"jquery"
	],
	function($) {
		"use strict";

		return {
			slugifyPostTitle: function(title) {
				var
					ignores = [" a", " the", " an"],
					result = title.toLowerCase();

				$.each(ignores, function(index, item) {
					var replacer = new RegExp("\\b" + item + "\\b", "gi");
					result = result.replace(replacer, "");
				});

				result = $.trim(result).replace(/\s+/g, "-");
				return result;
			}
		};
	}
);
