/**
 * File: app.js
 * Page controller for the default AdamPresley.com theme.
 *
 * Dependencies:
 *    jquery
 *    bootstrap
 *    search-widget
 */
require(["/theme/static/js/config.js"], function() {
	"use strict";

	require(
		[
			"jquery", "search-widget", "bootstrap", "raptorize"
		],
		function($) {

			/******************************************************************
			 * Document ready and setup events
			 *****************************************************************/
			$(document).ready(function() {
				/*
				 * Load Google Analytics
				 */
				(function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){
				(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
				m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
				})(window,document,"script","//www.google-analytics.com/analytics.js","ga");

				ga("create", "UA-44927419-1", "adampresley.com");
				ga("send", "pageview");

				/*
				 * Setup search feature
				 */
				if ($("#searchLink").length) {
					$("#searchDialog").SearchWidget({
						position: { my: "left top", at: "left bottom", of: "#btnDiscover" }
					});
				}

				$("#searchLink").click(function() { $("#searchDialog").SearchWidget("open"); });
				$("body").raptorize({
					enterOn: "konami-code"
				});
			});
		}
	);
});
