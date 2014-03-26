/**
 * File: admin-import-markdown-files.js
 * Page controller for the Import Markdown Files utility.
 *
 * Dependencies:
 *    jquery
 *    uploadify
 */
require(["/static/js/config.js"], function() {
	require(
		[
			"jquery", "uploadify"
		],
		function($) {
			"use strict";

			var
				addMessageDivToResultsDiv = function(messageEl) {
					$("#resultsList").append(messageEl);
				},

				createMessage = function(fileName, success, errorMessage) {
					var $el = $("<div />");

					$el.addClass("alert");
					$el.addClass("alert-dismissable")
					$el.addClass((success) ? "alert-success" : "alert-danger");

					if (!success) {
						$el.html(fileName + " - " + errorMessage);
					} else {
						$el.html(fileName + " imported successfully");
					}

					$el.append($("<button />").addClass("close").attr({ "type": "button", "data-dismiss": "alert", "aria-hidden": "true" }).html("&times;"));
					return $el;
				};


			$("#filesToUpload").uploadify({
				"swf"            : "/static/flash/uploadify.swf",
				"uploader"       : "/admin/upload/markdownfile",
				"fileObjName"    : "upload",
				"auto"           : true,
				"buttonText"     : "Select Files",
				"fileTypeExts"   : "*.md",
				"fileTypeDesc"   : "Markdown Files",

				"onUploadSuccess": function(file, response) {
					if (response !== "ok") {
						addMessageDivToResultsDiv(createMessage(file.name, false, response));
					} else {
						addMessageDivToResultsDiv(createMessage(file.name, true));
					}
				},
				"onUploadError"  : function(file, code, message) {
					addMessageDivToResultsDiv(createMessage(file.name, false, "There was a problem uploading your file"));
				}
			});
		}
	);
});