/**
 * File: admin-dashboard.js
 * Page controller for the administrator dashboard page. The
 * dashboard displays statistic information and such.
 *
 * This page makes use of OOCharts for integrating with Google
 * Analytics data. If you do not have an account setup visit
 * https://app.oocharts.com/login and setup an account. You may
 * then generate an API key and hook it up to your Google Analytics.
 * Once that's done put in your API key and Profile ID into the
 * *oochartsApiKey* and *oochartsProfileId* in the file ApiKeys.js.
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
			"jquery", "modules/bean/ApiKeys",
			"blockui",
			"jqplot", "jqplot.canvasTextRenderer", "jqplot.categoryAxisRenderer",
			"oocharts"
		],
		function($, ApiKeys) {
			$.blockUI({ message: "<h4>Loading...</h4>"} );

			/*
			 * Only load OOCharts data if keys are provided
			 */
			if (ApiKeys.oochartsApiKey && ApiKeys.oochartsProfileId) {
				oo.setAPIKey(ApiKeys.oochartsApiKey);
				oo.load(function() {
					var
						timeline = new oo.Timeline(ApiKeys.oochartsProfileId, "30d"),
						browsers = new oo.Pie(ApiKeys.oochartsProfileId, "30d"),
						pageTraffic = new oo.Table(ApiKeys.oochartsProfileId, "30d");

					timeline.addMetric("ga:visits", "Visits");
					timeline.addMetric("ga:newVisits", "New Visits");
					timeline.draw("timelineChart");

					browsers.setMetric("ga:visits", "Visits");
					browsers.setDimension("ga:browser");

					browsers.draw("browserChart");

					pageTraffic.addMetric("ga:pageviews", "Page Views");
					pageTraffic.addMetric("ga:avgTimeOnPage", "Avg. Time/Page");
					pageTraffic.addDimension("ga:pageTitle", "Page Title");

					pageTraffic.draw("pageChart");
				});
			} else {
				$("#timelineChart").html("No OOCharts keys provided");
				$("#browserChart").html("No OOCharts keys provided");
				$("#pageChart").html("No OOCharts keys provided");
			}

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