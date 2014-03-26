import os
import bottle
import config
import logging

from bottle import route
from bottle import request
from bottle import response
from bottle import redirect

from services.http import httpservice
from services.engine import postservice
from decorators.requireSessionDecorator import *

@route("/admin/ajax/post/<postId:int>/archive", method="DELETE")
@requireSession
def ajaxArchivePost(postId):
	try:
		if not postId:
			return httpservice.badRequest(response=response)

		numAffected = postservice.archivePost(postId=postId)
		if numAffected <= 0:
			return httpservice.noFound(response=response)

	except Exception as e:
		return httpservice.error(response=response, message=e.message)

	return { "message": "Post archived successfully!" }

@route("/admin/ajax/post/<postId:int>/delete", method="DELETE")
@requireSession
def ajaxDeletePost(postId):
	try:
		if not postId:
			return httpservice.badRequest(response=response)

		postservice.deletePost(postId=postId)

	except Exception as e:
		return httpservice.error(response=response, message=e.message)

	return { "message": "Post deleted successfully!" }

@route("/admin/ajax/post/<postId:int>/publish", method="PUT")
@requireSession
def ajaxPublishPost(postId):
	try:
		if not postId:
			return httpservice.badRequest(response=response)

		numAffected = postservice.publishPost(postId=postId)
		if numAffected <= 0:
			return httpservice.noFound(response=response)

	except Exception as e:
		return httpservice.error(response=response, message=e.message)

	return { "message": "Post published successfully!" }
