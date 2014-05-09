define(
	[
		"modules/util/Http"
	],
	function(Http) {
		"use strict";

		var 
			adminEndpoint = "/admin/ajax/posts",

			service = {
				getAdminPosts: function(page, packet) {
					var url = adminEndpoint + "/" + page;

					if (packet !== undefined) {
						url += "/" + packet.year;
						if (packet.status.length > 0) url += "/" + packet.status;
						if (packet.term.length > 0) url += "/" + packet.term;
					}

					return Http.get(url);
				}
			};

		return service;
	}
);