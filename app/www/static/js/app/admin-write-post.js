/**
 * File: admin-write-post.js
 * Page controller for the Write Post page in the administrator.
 *
 * Dependencies:
 *    jquery
 *    admin
 *    bootstrapValidator
 *    markdown-editor
 */
require(["/static/js/config.js"], function() {
	"use strict";

	require(
		[
			"jquery", "admin", "bootstrapValidator", "markdown-editor"
		],
		function($, Admin) {

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

			$("#postContent").markdown();
			$("#postTitle").focus();
		}
	);
});
