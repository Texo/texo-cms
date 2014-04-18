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
				onFocus: function(e) {
					try {
						e.disableButtons("cmdImage");
					} catch (e) {}
				},
				onShow: function(e) {
					try {
						e.disableButtons("cmdImage");
					} catch (e) {}
				},
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
										var
											selected           = e.getSelection(),
											cursor             = selected.start,
											defaultDescription = "Description",
											startPos           = cursor + 2,
											endPos             = defaultDescription.length + startPos;

										if (!subscriberIsSetup) {
											subscriberIsSetup = true;

											PubSub.subscribe("s3browser-widget.select", function(info) {
												$("#s3browser").S3Browser("close");

												var chunk = "![" + defaultDescription + "](" + info.imageUrl + ")";

												e.replaceSelection(chunk);
												e.setSelection(info.callbackOptions.startPos, info.callbackOptions.endPos);
											});
										}

										$("#s3browser").S3Browser("open", {
											startPos: startPos,
											endPos: endPos
										});

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
