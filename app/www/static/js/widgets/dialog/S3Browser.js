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
 *    $.S3Browser
 *
 * RequireJS Name:
 *    widgets/dialog/S3Browser
 *
 * Dependencies:
 *    jquery
 *    jqueryui
 *    modules/util/PubSub
 *    modules/util/WidgetTools
 *    uploadify
 *
 * Commands:
 *    open - Opens the S3 Browser. Can pass an option object that is passed on in events
 *    close - Closes the S3 Browser
 *
 * Example:
 *    (start code)
 *    require(["jquery", "s3browser-widget"], function($) {
 *       $("#someDiv").S3Browser();
 *       $("#someDiv").S3Browser("open");
 *    });
 *    (end)
 */
define(
	[
		"jquery", "modules/util/PubSub", "modules/util/WidgetTools", "jqueryui", "uploadify"
	],
	function($, PubSub, WidgetTools) {
		"use strict";

		var
			_dialogs = {},

			/**
			 * Fuction: _createDom
			 * Method that creates the DOM for a single instance of this dialog widget.
			 *
			 * Parameters:
			 *    getBucketListEndpoint - URL to the service endpoint to get the list of items in an S3 bucket
			 *    uploadEndpoint        - URL to the service endpoint to upload a file
			 *    deleteEndpoint        - URL to the service endpoint to delete a file
			 *    dialogEl              - A reference to the dialog element to render to
			 *    dialogElId            - ID of the dialog element to render to
			 */
			_createDom = function(getBucketListEndpoint, uploadEndpoint, deleteEndpoint, dialogEl, dialogElId) {
				var
					body = "<div class=\"s3BrowserWidgetItems\" style=\"width: 100%; height: auto;\"></div>",
					el = "#" + dialogElId + " .s3BrowserWidgetItems";

				/*
				 * Add the initial body container to the dialog. The thumbnails
				 * are loaded via AJAX and attached via the _createThumbnailsDom method.
				 */
				dialogEl.html(body);

				PubSub.publish(dialogElId + ".loadthumbnails", {
					getBucketListEndpoint: getBucketListEndpoint,
					el: el
				});

				/*
				 * Assign a click event handler to any element with a class of
				 * "s3BrowserWidgetItem" that is a child of our container element.
				 */
				$(el).on("click", ".s3BrowserWidgetItem", function() {
					$(el + " .s3BrowserWidgetItem").removeClass("img-thumbnail");
					$(this).toggleClass("img-thumbnail");
				});

				/*
				 * Create markup for the upload dialog
				 */
				_createUploadDom(getBucketListEndpoint, uploadEndpoint, dialogElId, el);
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
				targetEl.html("");
				$.each($.map(data, _createThumbnailItemDom), function(index, el) { targetEl.append(el); });
			},

			/**
			 * Function: _createUploadDom
			 * Creates the DOM and dialogs for uploading images.
			 */
			_createUploadDom = function(getBucketListEndpoint, uploadEndpoint, dialogElId, widgetItemsEl) {
				_dialogs[dialogElId].uploadDialogId = WidgetTools.generateId("uploadDialog");
				_dialogs[dialogElId].uploadDialogUploaderId = WidgetTools.generateId("filesToUpload");
				_dialogs[dialogElId].uploadDialogUploadResultId = WidgetTools.generateId("results");

				/*
				 * Function to create a message
				 */
				var createMessage = function(fileName, success, errorMessage) {
					var $el = $("<div />");

					$el.addClass("alert");
					$el.addClass("alert-dismissable")
					$el.addClass((success) ? "alert-success" : "alert-danger");

					if (!success) {
						$el.html(fileName + " - " + errorMessage);
					} else {
						$el.html(fileName + " uploaded successfully");
					}

					$el.append($("<button />").addClass("close").attr({ "type": "button", "data-dismiss": "alert", "aria-hidden": "true" }).html("&times;"));
					return $el;
				};

				var body = "<div id=\"" + _dialogs[dialogElId].uploadDialogId + "\" title=\"Upload Images\">";
				body += "<div id=\"" + _dialogs[dialogElId].uploadDialogUploaderId + "\"></div>";
				body += "<div id=\"" + _dialogs[dialogElId].uploadDialogUploadResultId + "\"></div>";
				body += "</div>";

				$("body").append(body);

				$("#" + _dialogs[dialogElId].uploadDialogId).dialog({
					resizable: false,
					width: 300,
					height: 300,
					modal: true,
					autoOpen: false,
					buttons: [
						{
							text: "Close",
							click: function() { $(this).dialog("close"); }
						}
					],
					open: function(e, ui) {
						$("#" + _dialogs[dialogElId].uploadDialogUploaderId).uploadify({
							"swf"            : "/static/flash/uploadify.swf",
							"uploader"       : "/admin/upload/image",
							"fileObjName"    : "upload",
							"auto"           : true,
							"buttonText"     : "Select Files",
							"fileTypeExts"   : "*.jpg; *.jpeg; *.png",
							"fileTypeDesc"   : "Image Files",

							"onUploadSuccess": function(file, response) {
								if (response !== "ok") {
									$("#" + _dialogs[dialogElId].uploadDialogUploadResultId).append(createMessage(file.name, false, response));
								} else {
									$("#" + _dialogs[dialogElId].uploadDialogUploadResultId).append(createMessage(file.name, true));

									/*
									 * Publish event to this dialog to reload thumbnails
									 */
									PubSub.publish(dialogElId + ".loadthumbnails", {
										getBucketListEndpoint: getBucketListEndpoint,
										el: widgetItemsEl
									});
								}
							},
							"onUploadError"  : function(file, code, message) {
								$("#" + _dialogs[dialogElId].uploadDialogUploadResultId).append(createMessage(file.name, false, "There was a problem uploading your file"));
							}
						});
					}
				});
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
			 * *{element id}.delete* with a reference to the dialog element, the
			 * URL of the image, and the S3 key name. It will also append any callback options
			 * passed in the "open" method.
			 */
			_onDelete = function(dialogEl) {
				var selectedImageEl = $(dialogEl).find(".s3BrowserWidgetItem.img-thumbnail");

				if (selectedImageEl.length > 0) {
					PubSub.publish(dialogEl.id + ".delete", {
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
			 * Function: _onUpload
			 * Event handler for the *Upload* button. This will open a secondary
			 * dialog where the user can upload images to Amazon S3.
			 */
			_onUpload = function(dialogEl) {
				var uploadDialogId = _dialogs[dialogEl.id].uploadDialogId;
				$("#" + uploadDialogId).dialog("open");
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
		$.widget("rajo.S3Browser", $.ui.dialog, {
			_create: function() {
				var id = this.element[0].id;
				var self = this;

				/*
				 * Listen for event to load thumbnails.
				 */
				PubSub.subscribe(id + ".loadthumbnails", function(info) {
					var onSuccess = function(response) { _createThumbnailsDom($(info.el), response.data); };
					$.ajax({ url: info.getBucketListEndpoint }).done(onSuccess);
				});


				/*
				 * Listen for event to delete an item
				 */
				PubSub.subscribe(id + ".delete", function(info) {
					var answer = confirm("Are you sure you want to delete this image from Amazon S3?");
					if (answer === true) {
						$.ajax({
							url: self.options.deleteEndpoint,
							type: "DELETE",
							data: {
								key: info.name
							}
						}).done(function(response) {
							/*
							 * Publish event to this dialog to reload thumbnails
							 */
							PubSub.publish(id + ".loadthumbnails", {
								getBucketListEndpoint: self.options.getBucketListEndpoint,
								el: "#" + id + " .s3BrowserWidgetItems"
							});
						});
					}
				});

				_dialogs[id] = {};
				_createDom(
					this.options.getBucketListEndpoint,
					this.options.uploadEndpoint,
					this.options.deleteEndpoint,
					this.element,
					id
				);

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
						text : "Upload",
						click: function() { _onUpload(this); }
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

				getBucketListEndpoint: "/admin/ajax/s3/bucket",
				uploadEndpoint: "/admin/upload/image",
				deleteEndpoint: "/admin/upload/image"
			}
		});
	}
);
