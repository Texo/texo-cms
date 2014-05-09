define(
	[
		"jquery",
		"modules/util/WidgetTools",
		"modules/util/PubSub",
		"modules/util/FuncTools",

		"bootstrap",
		"jqueryui"
	],
	function($, WidgetTools, PubSub, FuncTools) {
		"use strict";

		var
			_popups = {},

			_createDom = function(html) {
				html += "<button type=\"button\" class=\"btn btn-primary filter-popup-apply\">Apply</button>&nbsp;";
				html += "<button type=\"button\" class=\"btn filter-popup-clear\">Clear</button>";

				return html;
			};

		$.widget("rajo.FilterPopup", {
			options: {
				placement: "bottom",
				trigger: "click",
				title: "Filter",
				apply: function(data) { }
			},

			_create: function() {
				console.log("Here");
				var 
					self = this,
					thisId = this.element.context.id,
					triggerEl = null,
					formEl = null,
					inputEls = null;

				console.log(this.element);
				console.log($("#" + thisId).children(":first"));

				triggerEl = $("#" + thisId).children(":first");
				if (triggerEl.length <= 0) throw "You must provide a trigger element";

				formEl = $("#" + thisId).children("form");
				if (formEl.length <= 0) throw "You must provide a form element";

				_popups[thisId] = {
					options: this.options,
					triggerEl: $(triggerEl[0]),
					html: _createDom($(formEl[0]).html())
				};

				/*
				 * Collect a list of all the input elements
				 * that will make up our filter popup.
				 */
				inputEls = $(formEl[0]).find(":input");
				if (inputEls.length <= 0) throw "You must provide some type of form elements in your form.";

				_popups[thisId].inputEls = FuncTools.map(inputEls, function(item) { return $("#" + item.id); });

				/* Delete the original form piece */
				$(formEl[0]).remove();

				/* Create the popover */
				_popups[thisId].triggerEl.popover({
					html: true,
					placement: this.options.placement,
					trigger: this.options.trigger,
					title: this.options.title,
					content: _popups[thisId].html
				});

				$("#" + thisId).on("click", ".filter-popup-apply", function() {

				});

				this._super();
			}
		});
	}
);