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
	require(
		[
			"jquery", "services/PostService", "rajo.ui.bootstrapmodal",
			"datatables-bootstrap", "bootstrap", "blockui"
		],
		function($, PostService, BootstrapModal) {
			var
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
				};


			/*
			 * Set modal default image locations
			 */
			BootstrapModal.dialogInformationImage = "/static/images/dialog-information.png";
			BootstrapModal.dialogErrorImage = "/static/images/dialog-error.png";

			/*
			 * Initialize datatables
			 */
			$("#postsTable").dataTable({
				aaSorting: [
					[2, "asc"],
					[3, "desc"]
				],
				aoColumnDefs: [
					{ bSortable: false, aTargets: [0]}
				],
				fnDrawCallback: attachMenus
			});
		}
	);
});