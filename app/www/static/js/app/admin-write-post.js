/**
 * File: admin-write-post.js
 * Page controller for the Write Post page in the administrator.
 *
 * Dependencies:
 *    jquery
 *    rajo.pubsub
 *    bootstrapValidator
 *    markdown-editor-s3-widget
 */
require(["/static/js/config.js"], function() {
	"use strict";

	require(
		[
			"jquery", "rajo.pubsub", "tools-service", "bootstrapValidator",
			"widgets/editor/MarkdownEditorS3"
		],
		function($, PubSub, ToolsService) {
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

			/*
			 * Auto-populate slug upon blur of title
			 */
			$("#postTitle").on("blur", function() {
				$("#postSlug").val(ToolsService.slugifyPostTitle($(this).val()));
			});

			$("#postContent").MarkdownEditorS3();
			$("#postTitle").focus();
		}
	);
});
