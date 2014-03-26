/**
 * File: admin-delete-all-posts.js
 * Page controller for the Delete All Posts functionality
 * in the administrator found under Utilities.
 *
 * Dependencies:
 *    jquery
 *    rajo.ui.bootstrapmodal
 */
require(["/static/js/config.js"], function() {
	require(
		[
			"jquery", "rajo.ui.bootstrapmodal"
		],
		function($, BootstrapModal) {
			$("#btnDelete").click(function(e) {
				BootstrapModal.Modal.YesNo({
					header: "Are you sure?",
					body: "Are you sure you wish to delete ALL posts and related data? This cannot be undone!!",
					handler: function(response) {
						if (response === "yes") {
							$("#frmDeleteAll").submit();
						}
					}
				});
			});
		}
	);
});