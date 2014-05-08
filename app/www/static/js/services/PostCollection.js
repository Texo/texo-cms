define(
	[
		"modules/util/Http"
	],
	function(Http) {
		"use strict";

		var 
			adminEndpoint = "/admin/ajax/posts",

			service = {
				getAdminPosts: function(page) {
					return Http.get(adminEndpoint + "/" + page);
				}
			};

		return service;
	}
);