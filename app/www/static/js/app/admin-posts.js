/**
 * File: admin-posts.js
 * Page controller for the Manage Posts page in the administrator.
 * This page allows users to edit, archive, publish posts.
 *
 * Dependencies:
 *    jquery
 *    services/PostService
 *    rajo.ui.bootstrapmodal
 *    datatables-bootstrap
 *    bootstrap
 *    blockui
 */
require(["/static/js/config.js"], function() {
	"use strict";
	
	require(
		[
			"jquery", "services/PostService", "rajo.ui.bootstrapmodal",
			"ractive", "services/PostCollection", "modules/util/Blocker",
			"bootstrap"
		],
		function($, PostService, BootstrapModal, Ractive, PostCollection, Blocker) {
			var
				ractive = null,

				/*
				 * Function: attachMenus
				 * Attaches event handlers to Bootstrap menus when Datatables
				 * reloads.
				 */
				attachMenus = function() {
					$(".dropdown-toggle").dropdown();

					$(".archiveLink").click(function() {
						var postId = window.parseInt($(this).attr("data-id"));

						confirm("Are you sure you wish to archive this post?", function() {
							PostService.archive(postId).done(function() {
								window.location = "/admin/posts";
							}).fail(function() {
								BootstrapModal.Modal.Error({
									body: "<p>There was an error when trying to archive your post.</p>"
								});
							});
						});
					});

					$(".deleteLink").click(function() {
						var postId = window.parseInt($(this).attr("data-id"));

						confirm("Are you sure you wish to delete this post?", function() {
							PostService.delete(postId).done(function() {
								window.location = "/admin/posts";
							}).fail(function() {
								BootstrapModal.Modal.Error({
									body: "<p>There was an error when trying to delete your post.</p>"
								});
							});
						});
					});

					$(".publishLink").click(function() {
						var postId = window.parseInt($(this).attr("data-id"));

						confirm("Are you sure you wish to publish this post?", function() {
							PostService.publish(postId).done(function() {
								window.location = "/admin/posts";
							}).fail(function() {
								BootstrapModal.Modal.Error({
									body: "<p>There was an error when trying to publish your post.</p>"
								});
							});
						});
					});
				},

				/*
				 * Function: confirm
				 * Asks for Yes/No for a specific message, then calls a function
				 * when the answer is Yes.
				 */
				confirm = function(message, onYesFn) {
					BootstrapModal.Modal.YesNo({
						header: "Confirmation",
						body: "<p>" + message + "</p>",
						handler: function(response) {
							if (response === "yes") {
								$.blockUI();
								onYesFn();
							}
						}
					});
				},

				loading = function() {
					Blocker.block("Loading posts...");
				},

				loadPosts = function(page) {
					PostCollection.getAdminPosts(page)
						.done(function(response) {
							updatePostGrid(response);
						})
						.fail(function() {
							Blocker.unblock();
							alert("There was an error retrieving posts!");
						});
				},

				setupDomBinding = function() {
					ractive = new Ractive({
						el: "postsTable",
						template: "#postsTableTemplate",
						data: {
							numPages: 0,
							posts: [],
							showPageNavigation: false,
							showFirstPageNavButton: false,
							showPrevPageNavButton: false,
							showNextPageNavButton: false,
							showLastPageNavButton: false,
							previousPage: 0,
							nextPage: 0
						},

						complete: function() {
							loadPosts(1);
						}
					});

					ractive.on({
						firstPage: function(e) {
							loading();
							loadPosts(1);
						},

						lastPage: function(e) {
							loading();
							loadPosts(e.context.numPages);
						},

						nextPage: function(e) {
							loading();
							loadPosts(e.context.nextPage);
						},

						previousPage: function(e) {
							loading();
							loadPosts(e.context.previousPage);
						}
					});
				},

				updatePostGrid = function(response) {
					ractive.set({
						posts: response.posts,
						numPages: response.numPages,
						showPageNavigation: response.showPageNavigation,
						showFirstPageNavButton: response.showFirstPageNavButton,
						showPrevPageNavButton: response.showPrevPageNavButton,
						showNextPageNavButton: response.showNextPageNavButton,
						showLastPageNavButton: response.showLastPageNavButton,
						previousPage: response.previousPage,
						nextPage: response.nextPage
					}, function() {
						attachMenus();
						Blocker.unblock(function() {
							$("html, body").animate({ scrollTop: 0 }, "fast");
						});						
					});

				};


			loading();
			setupDomBinding();

			/*
			 * Set modal default image locations
			 */
			BootstrapModal.dialogInformationImage = "/static/images/dialog-information.png";
			BootstrapModal.dialogErrorImage = "/static/images/dialog-error.png";
		}
	);
});