/**
 * Class: PostService
 * Defines a service for working with individual post data. This
 * communicates with the server via RESTful services.
 *
 * Endpoint:
 *    /admin/ajax/post
 *
 * Dependencies:
 *    * <rajo.service>
 *
 * Example:
 *    (start code)
 *    PostService.publish("ABCDEFG").done(function(data) {
 *       alert("Post published!");
 *    });
 *    (end)
 */
define(["rajo.service"], function($service) {
	return $service.create({
		endpoint: "/admin/ajax/post",

		/**
		 * Function: archive
		 * Archives a post.
		 *
		 * Parameters:
		 *		id - ID of the post to archive
		 *
		 * Returns:
		 *		A jQuery AJAX promise object
		 */
		archive: function(id) {
			return this.$delete([id, "archive"]);
		},

		/**
		 * Function: delete
		 * Deletes a post
		 *
		 * Parameters:
		 *		id - ID of the post to delete
		 *
		 * Returns:
		 *		A jQuery AJAX promise object
		 */
		delete: function(id) {
			return this.$delete([id, "delete"]);
		},

		/**
		 * Function: publish
		 * Sets a post's status to Published
		 *
		 * Parameters:
		 *		id - ID of the post to publish
		 *
		 * Returns:
		 *		A jQuery AJAX promise object
		 */
		publish: function(id) {
			return this.$put([id, "publish"]);
		}
	});
});