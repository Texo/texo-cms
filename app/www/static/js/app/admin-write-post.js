/**
 * File: admin-write-post.js
 * Page controller for the Write Post page in the administrator.
 *
 * Dependencies:
 *    jquery
 *    admin
 *    bootstrapValidator
 */
require(["/static/js/config.js"], function() {
	require(
		[
			"jquery", "admin", "bootstrapValidator"
		],
		function($, Admin) {
			"use strict";

			/*
			 * Apply form validation
			 */
			$("#frmWritePost").bootstrapValidator({
				message: "This value is not valid",
				live: "disabled",
				fields: {
					"postTitle": {
						validators: {
							notEmpty: { message: "A title must be provided for this post" }
						}
					},
					"postSlug": {
						validators: {
							notEmpty: { message: "Your post must have a slug so it can have a URL" }
						}
					},
					"postTags": {
						validators: {
							notEmpty: { message: "Please provide one or more tags to categorize this post" }
						}
					},
					"postContent": {
						validators: {
							notEmpty: { message: "Your post should contain *some* content..." }
						}
					}
				}
			});

			$("#btnCancel").click(function() {
				window.location = "/admin/posts";
			});

			$("#postTitle").focus();
		}
	);
});
