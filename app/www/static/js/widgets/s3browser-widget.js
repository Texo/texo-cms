/**
 * Class: S3Browser
 * This class provides a visual widget for viewing files in an Amazon
 * S3 bucket. A user can select images to get a full URL to the
 * S3 location. This window also allows uploading files to Amazon S3.
 *
 * This widget is based on the jQuery UI dialog widget. As such all the
 * same options available to the dialog widget are available in the S3Browser
 * widget.
 *
 * When an image is selected in the S3 Browser an event labeled
 * *s3browser-widget.select* is fired.
 *
 * Exports:
 *    $.ui.S3Browser
 *
 * RequireJS Name:
 *    s3browser-widget
 *
 * Dependencies:
 *    jquery
 *    jqueryui
 *
 * Commands:
 *    open - Opens the S3 Browser
 *    close - Closes the S3 Browser
 *
 * Example:
 *    > require(["jquery", "s3browser-widget"], function($) {
 *    >    $("#someDiv").S3Browser();
 *    >    $("#someDiv").S3Browser("open");
 *    > });
 */
define(
	[
		"jquery", "rajo.pubsub", "jqueryui"
	],
	function($, PubSub) {
		"use strict";

		var
			_dialogs = {},

			/**
			 * Fuction: _createDom
			 * Method that creates the DOM for a single instance of this dialog widget.
			 *
			 * Parameters:
			 *    getBucketListEndpoint - URL to the service endpoint to get the list of items in an S3 bucket
			 *    dialogEl              - A reference to the dialog element to render to
			 *    dialogElId            - ID of the dialog element to render to
			 */
			_createDom = function(getBucketListEndpoint, dialogEl, dialogElId) {
				var
					body = "<div class=\"s3BrowserWidgetItems\" style=\"width: 100%; height: auto;\"></div>",
					el = "#" + dialogElId + " .s3BrowserWidgetItems",

					onSuccess = function(response) { _createThumbnailsDom($(el), response.data); };

				$.ajax({ url: getBucketListEndpoint }).done(onSuccess);

				/*
				 * Add the initial body container to the dialog. The thumbnails
				 * are loaded via AJAX and attached via the _createThumbnailsDom method.
				 */
				dialogEl.html(body);

				/*
				 * Assign a click event handler to any element with a class of
				 * "s3BrowserWidgetItem" that is a child of our container element.
				 */
				$(el).on("click", ".s3BrowserWidgetItem", function() {
					$(el + " .s3BrowserWidgetItem").removeClass("img-thumbnail");
					$(this).toggleClass("img-thumbnail");
				});
			},

			/**
			 * Function: _createThumbnailItemDom
			 * Creates an individual thumbnail DOM item and returns it.
			 *
			 * Parameters:
			 *    thumbnailUrl - URL to the image thumbnail
			 */
			_createThumbnailItemDom = function(thumbnailItem) {
				return $("<img />")
					.attr("src", thumbnailItem.url)
					.attr("data-name", thumbnailItem.name)
					.addClass("s3BrowserWidgetItem")
					.css({
						width: "150px",
						height: "150px",
						margin: "15px"
					});
			},

			/**
			 * Function: _createThumbnailsDom
			 * This function creates all thumbnail DOM elements in a set of data
			 * and appends them to a target DOM element. The data parameter
			 * is an array of thumbnail URLs.
			 *
			 * Parameters:
			 *    targetEl - Element to attach thumbnail DOM items to
			 *    data     - Array of thumbnail URLs
			 */
			_createThumbnailsDom = function(targetEl, data) {
				$.each($.map(data, _createThumbnailItemDom), function(index, el) { targetEl.append(el); });
			},

			/**
			 * Function: _onClose
			 * Event handler for the *Close* button. This will close the dialog
			 * which owns the button responsible for this event.
			 */
			_onClose = function(dialogEl) {
				_dialogs[dialogEl.id].dialog.close();
			},

			/**
			 * Function: _onDelete
			 * Event handler for the *Delete* button. This will publish an event named
			 * *s3browser-widget.delete* with a reference to the dialog element, the
			 * URL of the image, and the S3 key name. It will also append any callback options
			 * passed in the "open" method.
			 */
			_onDelete = function(dialogEl) {
				var selectedImageEl = $(dialogEl).find(".s3BrowserWidgetItem.img-thumbnail");

				if (selectedImageEl.length > 0) {
					PubSub.publish("s3browser-widget.delete", {
						dialogEl       : dialogEl,
						imageUrl       : selectedImageEl[0].src,
						name           : selectedImageEl[0].getAttribute("data-name"),
						callbackOptions: _dialogs[dialogEl.id].callbackOptions
					});
				}
			},

			/**
			 * Function: _onSelect
			 * Event handler for the *Select* button. This will publish an event
			 * named *s3browser-widget.select* with a reference to the dialog element, the
			 * URL of the image, and the S3 key name. It will also append any callback options
			 * passed in the "open" method.
			 */
			_onSelect = function(dialogEl) {
				var selectedImageEl = $(dialogEl).find(".s3BrowserWidgetItem.img-thumbnail");

				if (selectedImageEl.length > 0) {
					PubSub.publish("s3browser-widget.select", {
						dialogEl       : dialogEl,
						imageUrl       : selectedImageEl[0].src,
						name           : selectedImageEl[0].getAttribute("data-name"),
						callbackOptions: _dialogs[dialogEl.id].callbackOptions
					});
				}
			},

			/**
			 * Function: _onView
			 * Event handler for the *View* button. This will open up the selected
			 * image in a new tab/window.
			 */
			_onView = function(dialogEl) {
				var selectedImageEl = $(dialogEl).find(".s3BrowserWidgetItem.img-thumbnail");

				if (selectedImageEl.length > 0) {
					window.open(selectedImageEl[0].src);
				}
			};

		/*
		 * Create the widget in the "adampresley" namespace using the
		 * jQuery UI WidgetFactory.
		 */
		$.widget("adampresley.S3Browser", $.ui.dialog, {
			_create: function() {
				_createDom(this.options.getBucketListEndpoint, this.element, this.element[0].id);
				_dialogs[this.element[0].id] = {};
				this._super();
			},

			open: function(callbackOptions) {
				this.options.callbackOptions = callbackOptions;

				_dialogs[this.element[0].id].callbackOptions = callbackOptions;
				_dialogs[this.element[0].id].dialog = this;

				this._super();
			},

			options: {
				title   : "Amazon S3 Browser",
				width   : 450,
				height  : 450,
				autoOpen: false,
				modal   : true,
				resizable: true,
				buttons : [
					{
						text : "Select",
						click: function() { _onSelect(this); }
					},
					{
						text : "View",
						click: function() { _onView(this); }
					},
					{
						text : "Delete",
						click: function() { _onDelete(this); }
					},
					{
						text : "Close",
						click: function() { _onClose(this); }
					}
				],

				getBucketListEndpoint: "/admin/ajax/s3/bucket"
			}
		});
	}
);
