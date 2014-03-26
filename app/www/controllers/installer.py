import imp
import config
import database

from bottle import view
from bottle import route
from bottle import request
from bottle import response
from bottle import redirect
from bottle import mako_view as view
from bottle import mako_template as template

from services.installer import installservice
from services.datetimehelper import dthelper

@route("/install", method="GET")
@route("/install", method="POST")
@view("install.html")
def install():
	if "btnSubmit" in request.all:
		installservice.setupConfigFile(
			dbServer      = request.all["databaseServer"],
			dbName        = request.all["databaseName"],
			dbUser        = request.all["databaseUserName"],
			dbPass        = request.all["databasePassword"],
			blogTitle     = request.all["blogTitle"],
			postsPerPage  = request.all["postsPerPage"],
			hashKey1      = request.all["hashKey1"],
			hashKey2      = request.all["hashKey2"],
			encryptionKey = request.all["encryptionKey"],
			encryptionIV  = request.all["encryptionIV"]
		)

		installservice.setupDatabase(
			dbServer  = request.all["databaseServer"],
			dbPort    = 3306,
			dbName    = request.all["databaseName"],
			dbUser    = request.all["databaseUserName"],
			dbPass    = request.all["databasePassword"],
			email     = request.all["adminEmail"],
			password  = request.all["adminPassword"],
			firstName = request.all["adminFirstName"],
			lastName  = request.all["adminLastName"],
			timezone  = request.all["timezone"],
			hashKey1  = request.all["hashKey1"],
			hashKey2  = request.all["hashKey2"],
		)

		database.disconnect()
		imp.reload(config)

		database.connect(
			engine   = "mysql",
			host     = config.ENVIRONMENT["DB_HOST"],
			port     = config.ENVIRONMENT["DB_PORT"],
			database = config.ENVIRONMENT["DB_NAME"],
			user     = config.ENVIRONMENT["DB_USER"],
			password = config.ENVIRONMENT["DB_PASSWORD"]
		)

		redirect("/installcomplete")

	return {
		"timezones": dthelper.getTimezoneArray()
	}

@route("/installcomplete", method="GET")
@view("installcomplete.html")
def installComplete():
	return {}