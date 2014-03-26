require.config({
	baseUrl: "/static/js",
	paths: {
		"app": "app",
		"services": "services",
		"jquery-plugins": "jquery-plugins",

		"jqueryui": "jqueryui/jquery-ui-1.10.4.custom.min",
		"blockui": "jquery-plugins/jquery.blockUI",
		"bootstrapValidator": "jquery-plugins/bootstrapValidator",

		"rajo.dom": "rajo/rajo.dom",
		"rajo.identity.persona": "rajo/rajo.identity.persona",
		"rajo.pubsub": "rajo/rajo.pubsub",
		"rajo.service": "rajo/rajo.service",
		"rajo.singlepage": "rajo/rajo.singlepage",
		"rajo.ui.bootstrapmodal": "rajo/rajo.ui.bootstrapmodal",
		"rajo.util": "rajo/rajo.util",

		"datatables": "datatables/jquery.dataTables",
		"datatables-bootstrap": "datatables/datatables-bootstrap",

		"jqplot": "jqplot/jquery.jqplot.min",
		"jqplot.canvasTextRenderer": "jqplot/jqplot.canvasTextRenderer.min",
		"jqplot.canvasAxisTickRenderer": "jqplot/jqplot.canvasAxisTickRenderer.min",
		"jqplot.categoryAxisRenderer": "jqplot/jqplot.categoryAxisRenderer.min",

		"uploadify": "uploadify/jquery.uploadify.min"
	},
	shim: {
		"jqueryui": { deps: ["jquery"] },
		"bootstrap": { deps: ["jquery"] },
		"blockui": { deps: ["jquery"] },
		"bootstrapValidator": { deps: ["jquery"] },

		"jqplot": { deps: ["jquery"], exports: "$.jqplot" },
		"jqplot.canvasTextRenderer": { deps: ["jqplot"] },
		"jqplot.canvasAxisTickRenderer": { deps: ["jqplot"] },
		"jqplot.categoryAxisRenderer": { deps: ["jqplot"] },

		"uploadify": { deps: ["jquery"] }
	}
});