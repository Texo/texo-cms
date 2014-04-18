define(
	[
		"jquery", "rajo.pubsub", "widget-tools", "s3browser-widget", "markdown-editor"
	],
	function($, PubSub, WidgetTools) {
		"use strict";

		$.widget("adampresley.MarkdownEditorS3", {
			_create: function() {
				var
					self = this,
					subscriberIsSetup = false;

				/*
				 * Create the S3 Browser DIV and initialize it
				 */
				this.options.s3BrowserId = WidgetTools.generateId("s3browser");
				$("<div />")
					.attr("id", this.options.s3BrowserId)
					.appendTo("body");

				$("#" + this.options.s3BrowserId).S3Browser();

				/*
				 * Initialize the Markdown Editor component.
				 */
				$("#" + this.element[0].id).markdown({
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
													$("#" + info.callbackOptions.s3BrowserId).S3Browser("close");

													var chunk = "![" + defaultDescription + "](" + info.imageUrl + ")";

													e.replaceSelection(chunk);
													e.setSelection(info.callbackOptions.startPos, info.callbackOptions.endPos);
												});
											}

											$("#" + self.options.s3BrowserId).S3Browser("open", {
												startPos   : startPos,
												endPos     : endPos,
												s3BrowserId: self.options.s3BrowserId
											});
										}
									}
								]
							}
						]
					]
				});
			}
		});
	}
);
