import os
import bottle
import config
import logging

from bottle import route
from bottle import request
from bottle import response
from bottle import redirect

from services.aws import s3service
from services.aws import awsservice
from services.util import urlservice
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

@route("/admin/ajax/s3/bucket", method="GET")
@requireSession
def ajaxGetBucket():
	try:
		awsSettings = awsservice.getSettings()
		connection = s3service.connect(accessKeyId=awsSettings["accessKeyId"], secretAccessKey=awsSettings["secretAccessKey"])
		items = s3service.getBucketItems(connection=connection, bucketName=awsSettings["s3Bucket"])

		data = []

		for i in items:
			_, ext = os.path.splitext(i.name)
			if ext in [".png", ".jpg", ".jpeg", ".gif"]:
				fullUrl = i.generate_url(expires_in=300, force_http=True)
				sanitizedUrl = urlservice.removeQueryString(url=fullUrl)
				data.append({ "url": sanitizedUrl, "name": i.name })

		return {
			"success": True,
			"data": data
		}

	except Exception as e:
		return httpservice.error(response=response, message=e.message)

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
