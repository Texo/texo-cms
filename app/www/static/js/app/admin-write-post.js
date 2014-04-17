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
			"jquery", "admin", "rajo.pubsub", "bootstrapValidator", "markdown-editor",
			"s3browser-widget"
		],
		function($, Admin, PubSub) {
			var
				subscriberIsSetup = false;


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

			$("#s3browser").S3Browser();

			$("#postContent").markdown({
				additionalButtons: [
					[
						{
							name: "s3group",
							data: [
								{
									name: "cmdS3Browser",
									title: "S3 Browser",
									icon: "glyphicon glyphicon-list-alt",
									callback: function(e) {
										if (!subscriberIsSetup) {
											subscriberIsSetup = true;

											PubSub.subscribe("s3browser-widget.select", function(info) {
												console.log(info);
												e.replaceSelection(info.imageUrl);
												$("#s3browser").S3Browser("close");
											});
										}

										$("#s3browser").S3Browser("open");

									}
								}
							]
						}
					]
				]
			});

			$("#postTitle").focus();
		}
	);
});
