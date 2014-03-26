import config

from bottle import error
from bottle import static_file

@error(404)
def error404(error):
	return static_file("404.html", root=config.BASE_TEMPLATE_PATH)

@error(500)
def error500(error):
 	return static_file("500.html", root=config.BASE_TEMPLATE_PATH)