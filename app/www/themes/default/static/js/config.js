require.config({
	baseUrl: "/theme/static/js",
	paths: {
		"jqueryui": "jqueryui/jquery-ui-1.10.4.custom.min",
		"search-widget": "widgets/search-widget",
		"widget-tools": "widgets/widget-tools"
	},
	shim: {
		"jqueryui": { deps: ["jquery"] },
		"bootstrap": { deps: ["jquery"] }
	}
});
