#
# File: bottle_starter.py
# Bottle plugin that runs every request. This wrapper performs
# the following tasks.
#
#    - Establishes a database connection
#    - Determine the theme name and configures pathing
#    - Sets up session management
#    - Concatenates URL and FORM variables into *request.all*
#    - Configures timezone requirements
#    - Executes requested action and view
#    - Disconnects from the database
#
# Author:
#    Adam Presley
#
import re
import bottle
import config
import database

from bottle import request
from bottle import redirect
from bottle import response

from services.engine import themeservice
from services.engine import engineservice
from services.installer import installservice

def starter(callback):
	def wrapper(*args, **kwargs):
		passthrough = False

		passthroughExtensions = (".html", ".xml", "txt")
		passthroughPaths = ("/resources", "/views", "/static", "/theme/static")

		test1 = [ext for ext in passthroughExtensions if ext in request.path]
		test2 = [p for p in passthroughPaths if request.path.startswith(p)]
		passthrough = (len(test1) > 0 or len(test2) > 0)

		#
		# Connect to our database
		#
		if len(config.ENVIRONMENT["DB_HOST"]):
			database.connect(
				engine   = "mysql",
				host     = config.ENVIRONMENT["DB_HOST"],
				port     = config.ENVIRONMENT["DB_PORT"],
				database = config.ENVIRONMENT["DB_NAME"],
				user     = config.ENVIRONMENT["DB_USER"],
				password = config.ENVIRONMENT["DB_PASSWORD"]
			)


		#
		# Get the current theme and add framework paths
		#
		if installservice.isEngineInstalled():
			request.themeName = themeservice.getThemeName()
			themeservice.addThemeToTemplatePath(themeName=request.themeName)

		if not passthrough:
			if not installservice.isEngineInstalled() and not request.path.startswith("/install"):
				redirect("/install")

			#
			# Setup session and environment stuff
			#
			request.session = request.environ.get("beaker.session")
			request.all = dict(list(request.query.items()) + list(request.forms.items()))

			if installservice.isEngineInstalled():
				request.timezone = engineservice.getBlogTimezone()
				config.TIMEZONE = request.timezone
			else:
				config.TIMEZONE = "UTC"

			#
			# Finally call the the next method in the chain
			#
			body = callback(*args, **kwargs)
			database.disconnect()

			return body

		else:
			body = callback(*args, **kwargs)
			database.disconnect()

			return body

	return wrapper

