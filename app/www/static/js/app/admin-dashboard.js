/**
 * File: admin-dashboard.js
 * Page controller for the administrator dashboard page. The
 * dashboard displays statistic information and such.
 *
 * Dependencies:
 *    jquery
 *    blockui
 *    jqplot
 *    jqplot.canvasTextRenderer
 *    jqplot.categoryAxisRenderer
 */
require(["/static/js/config.js"], function() {
	require(
		[
			"jquery", "blockui",
			"jqplot", "jqplot.canvasTextRenderer", "jqplot.categoryAxisRenderer"
		],
		function($) {
			$.blockUI({ message: "<h4>Loading...</h4>"} );

			$.ajax({
				url: "/admin/ajax/getPostCountsForLast12Months"
			}).done(function(response) {
				var
					series = [],
					labels = [];

				$.each(response.data, function(index, item) {
					series.push(item.postCount);
					labels.push(item.postMonth);
				});

				if (series.length > 0) {
					$.jqplot("chart", [
						series,
					], {
						axes: {
							xaxis: {
								renderer: $.jqplot.CategoryAxisRenderer,
								ticks: labels
							}
						}
					});
				}

				$.unblockUI();
			});
		}
	);
});