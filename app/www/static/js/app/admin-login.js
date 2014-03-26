/**
 * File: admin-login.js
 * Page controller for the administrator login page.
 *
 * Dependencies:
 *    jquery
 *    rajo.ui.bootstrapmodal
 *    bootstrapValidator
 */
require(["/static/js/config.js"], function() {
	require(
		[
			"jquery", "rajo.ui.bootstrapmodal", "bootstrapValidator"
		],
		function($, Modal) {
			"use strict";

			/*
			 * Apply form validation
			 */
			$("#frmLogin").bootstrapValidator({
				message: "This value is not valid",
				live: "disabled",
				fields: {
					email: {
						validators: {
							notEmpty: { message: "Email address is required to log in" },
							emailAddress: { message: "The email address provided does not appear valid" }
						}
					},
					password: {
						validators: {
							notEmpty: { message: "Please provide your password to log in" }
						}
					}
				}
			});

			$("#email").focus();
		}
	);
});
