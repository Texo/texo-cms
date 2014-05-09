define(
	[
		"jquery",
		"modules/util/FuncTools",

		"bootstrap",
		"jqueryui"
	],
	function($, FuncTools) {
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
				onApply: function(data) { },
				onClear: function() { }
			},

			_create: function() {
				var 
					self = this,
					thisId = this.element.context.id,
					triggerEl = null,
					formEl = null,
					inputEls = null;

				/*
				 * Find the trigger element
				 */
				triggerEl = $("#" + thisId).children(":first");
				if (triggerEl.length <= 0) throw "You must provide a trigger element";

				/*
				 * There should be a form element with inputs there
				 */
				formEl = $("#" + thisId).children("form");
				if (formEl.length <= 0) throw "You must provide a form element";

				/*
				 * Collect a list of all the input elements
				 * that will make up our filter popup.
				 */
				inputEls = $(formEl[0]).find(":input");
				if (inputEls.length <= 0) throw "You must provide some type of form elements in your form.";

				/*
				 * Store this config
				 */
				_popups[thisId] = {
					options: this.options,
					triggerEl: $(triggerEl[0]),
					html: _createDom($(formEl[0]).html()),
					inputEls: FuncTools.map(inputEls, function(item) { return item.id; })
				};

				/* 
				 * Delete the original form piece 
				 */
				$(formEl[0]).remove();

				/* 
				 * Create the popover 
				 */
				_popups[thisId].triggerEl.popover({
					html: true,
					placement: this.options.placement,
					trigger: this.options.trigger,
					title: this.options.title,
					content: _popups[thisId].html
				});

				_popups[thisId].triggerEl.on("shown.bs.popover", function() {
					$("#" + _popups[thisId].inputEls[0]).focus();
				});

				/*
				 * Attach the Apply and Clear button events
				 */
				$("#" + thisId).on("click", ".filter-popup-apply", function() {
					var packet = FuncTools.mapArrayToObject(_popups[thisId].inputEls, function(item) {
						return {
							key: item,
							value: $("#" + item).val()
						};
					});

					self.options.onApply(packet);
				});

				$("#" + thisId).on("click", ".filter-popup-clear", this.options.onClear);

				this._super();
			}
		});
	}
);