from bottle import request
from bottle import install
from bottle import redirect
from services.identity import userservice

def requireSession(fn):
	def wrapper(*args, **kwargs):
		if hasattr(request, "session"):
			if not userservice.userInSession(session=request.session):
				print ("redirect because of invalid session")
				redirect("/admin/login")

		return fn(*args, **kwargs)

	return wrapper
