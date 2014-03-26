/**
 * Class: SearchWidget
 * This class provides a visual widget used to search for blog posts.
 * Results of the search are put into a scroll box, each result containing
 * a link for going directly to a blog entry.
 *
 * This widget is based on the jQuery UI dialog widget. As such all the
 * same options available to the dialog widget are available in the SearchWidget.
 *
 * Exports:
 *    $.ui.SearchWidget
 *
 * RequireJS Name:
 *    search-widget
 *
 * Dependencies:
 *    jquery
 *    widget-tools
 *    jqueryui
 *
 * Example:
 *    > require(["jquery", "search-widget"], function($) {
 *    >    $("#someDiv").SearchWidget();
 *    >    $("#someDiv").SearchWidget("open");
 *    > });
 */
define(["jquery", "widget-tools", "jqueryui"], function($, WidgetTools) {
	"use strict";

	/***************************************************************************
	 * Private methods
	 **************************************************************************/
	var
		clearSearch = function(widgetEl) {
			var
				$searchTerm = getSearchTermElement(widgetEl),
				$searchResults = getSearchResultsElement(widgetEl);

			$($searchTerm).val("");
			$($searchResults).empty();
			$searchTerm.focus();
		},

		createSearchDom = function() {
			var
				searchTermId    = WidgetTools.generateId("searchTerm"),
				searchResultsId = WidgetTools.generateId("searchResults"),
				body = "<div class=\"input-group\">" +
					"  <span class=\"input-group-addon\"><span class=\"glyphicon glyphicon-search\"></span></span>" +
					"  <input id=\"" + searchTermId + "\" type=\"text\" class=\"form-control searchWidgetTerm\" placeholder=\"Enter search term\" />" +
					"</div>" +

					"<br />" +

					"<div id=\"" + searchResultsId + "\" class=\"searchWidgetResults\" style=\"width: 100%; height: 200px; overflow-y: scroll;\"></div>";

			return body;
		},

		getSearchResultsElement = function(widgetEl) {
			return $(widgetEl).children(".searchWidgetResults")[0];
		},

		getSearchTermElement = function(widgetEl) {
			return $(widgetEl).find(".searchWidgetTerm")[0];
		},

		performSearch = function(widgetEl) {
			var
				$searchTerm = getSearchTermElement(widgetEl),
				$searchResults = getSearchResultsElement(widgetEl),
				searchTerm = $searchTerm.value;

			if ($.trim(searchTerm).length > 0) {
				$.ajax({
					url: "/posts/search/" + searchTerm + ".json"
				}).done(function(response) {
					renderSearchResults($searchResults, response.posts);
				});
			}

			$($searchTerm).focus();
		},

		renderSearchResults = function(el, posts) {
			var
				html = "";

			html = "<table class=\"table table-condensed table-striped\" width=\"100%\" height=\"100%\"><tbody>";

			if (posts.length > 0) {
				$.each(posts, function(index, post) {
					html += "<tr>" +
						"  <td style=\"width: 80%;\">" +
						"    <a href=\"" + post.permalink + "\">" + post.title + "</a>" +
						"    <br />" +
						"    " + $.trim(post.renderedContent).substring(0, 55) + "..." +
						"  </td>" +
						"  <td style=\"text-align: right;\">" + post.publishedDateUSFormat + " " + post.publishedTime12Hour + "</td>" +
						"</tr>";
				});
			} else {
				html += "<tr><td colspan=\"2\">No posts found</td></tr>";
			}

			html += "</tbody></table>";
			$(el).html(html);
		};


	/***************************************************************************
	 * This is the search widget proper. It uses the jQuery WidgetFactory
	 * to export $.ui.SearchWidget.
	 **************************************************************************/
	$.widget("ui.SearchWidget", $.ui.dialog, {
		_create: function() {
			var self = this;

			this.element.html(createSearchDom());
			$("#" + this.element[0].id + " .searchWidgetTerm").on("keydown", function(e) {
				if (e.which === 13) {
					e.preventDefault();
					performSearch(self.element[0]);
				}
			});
			this._super();
		},

		options: {
			title   : "Seach",
			width   : 400,
			autoOpen: false,
			modal   : true,
			resizable: false,
			buttons : [
				{ text : "Search", click: function() { performSearch(this); } },
				{ text : "Clear", click: function() { clearSearch(this); } }
			]
		}
	});
});