/**
 * File: admin-edit-post.js
 * Page controller for the Edit Post page in the administrator.
 *
 * Dependencies:
 *    jquery
 *    boostrapValidator
 *    markdown-editor-s3-widget
 */
require(["/static/js/config.js"], function() {
	"use strict";

	require(
		[
			"jquery", "bootstrapValidator", "widgets/editor/MarkdownEditorS3"
		],
		function($) {
			"use strict";

			/*
			 * Apply form validation
			 */
			$("#frmEditPost").bootstrapValidator({
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

			$("#btnBack").click(function() {
				window.history.back();
			});

			$("#postContent").MarkdownEditorS3();
			$("#postTitle").focus();
		}
	);
});
