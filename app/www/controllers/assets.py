import config
from bottle import route
from bottle import request
from bottle import response
from bottle import static_file

from services.engine import themeservice

@route("/static/<filepath:path>")
def serveStaticResources(filepath):
	return static_file(filepath, root=config.STATIC_PATH)

@route("/theme/static/<filepath:path>")
def serveStaticThemeResources(filepath):
	return static_file(filepath, root=themeservice.getThemeStaticPath(themeName=request.themeName))

@route("/views/<filepath:path>")
def serveStaticViews(filepath):
	return static_file(filepath, root=config.BASE_TEMPLATE_PATH)

@route("/sitemap.xml")
def serveSitemap():
	return static_file("sitemap.xml", root=config.APP_PATH)

@route("/robots.txt")
def serveRobots():
	return static_file("robots.txt", root=config.APP_PATH)
