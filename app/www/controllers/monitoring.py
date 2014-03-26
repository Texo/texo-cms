import config
from bottle import route

@route("/heartbeat", method = "GET")
def heartbeat():
	return "A-OK ya'll!"
