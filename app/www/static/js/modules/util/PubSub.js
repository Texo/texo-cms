// Copyright 2013-2014 Adam Presley. All rights reserved
// Use of this source code is governed by the MIT license
// that can be found in the LICENSE file.

define(["modules/util/FuncTools"], function(FuncTools) {
	"use strict";

	var pubsub = {
		subscribers: {},

		/**
		 * Function: subscribe
		 * This method registers a handler for a specified event.
		 *
		 * Author:
		 *    Adam Presley
		 *
		 * Parameters:
		 *    eventName - String name of the event to subscribe to
		 *    handler - Function called to handle published events of this type
		 *    scope - The scope in which to call the handler function
		 */
		subscribe: function(eventName, handler, scope) {
			var def = {
				eventName: eventName,
				handler: handler,
				scope: (scope || undefined)
			};

			if (eventName in pubsub.subscribers) {
				pubsub.subscribers[eventName].push(def);
			}
			else {
				pubsub.subscribers[eventName] = [ def ];
			}
		},

		/**
		 * Function: publish
		 * Tells the object to publish an event by name, sending a series of parameters
		 * along with the message for any subscribers to pick up.
		 *
		 * Author:
		 *    Adam Presley
		 *
		 * Parameters:
		 *    eventName - String name of the event to publish
		 *    params - An object of optional parameters to send with the message
		 */
		publish: function(eventName, params) {
			var i = 0;

			params = (params || {});

			if (pubsub.subscribers.hasOwnProperty(eventName)) {
				FuncTools.each(pubsub.subscribers[eventName], function(subscriber) {
					if (subscriber.hasOwnProperty("scope") && subscriber.scope !== undefined) {
						subscriber.handler.call(subscriber.scope, params);
					} else {
						subscriber.handler(params);
					}
				});
			}
		}
	};

	return pubsub;
});