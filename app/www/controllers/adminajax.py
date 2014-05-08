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

@route("/admin/ajax/posts", method="GET")
@route("/admin/ajax/posts/<page:int>", method="GET")
@requireSession
def ajaxGetPosts(page=1):
	logger = logging.getLogger(__name__)

	result = {}

	try:
		posts, postCount, numPages = postservice.getPosts(page=page, postsPerPage=25)

		result = {
			"posts": map(postservice.makeAdminTableFriendlyPost, posts),
			"numPages": int(numPages),
			"numPosts": int(postCount),
			"currentPage": 0 if postCount <= 0 else int(page),
			"previousPage": 1 if page < 2 else int(page - 1),
			"nextPage": page if page >= numPages else int(page + 1),
			"lastPage": int(numPages),
			"showFirstPageNavButton": True if postCount > 0 and page > 1 else False,
			"showLastPageNavButton": True if postCount > 0 and page < numPages else False,
			"showNextPageNavButton": True if postCount > 0 and page < numPages else False,
			"showPrevPageNavButton": True if postCount > 0 and page > 1 else False,
			"showPageNavigation": True if postCount > 0 and numPages > 1 else False,
		}

	except Exception as e:
		logger.error(e.message, exc_info=True)

		result["success"] = False
		result["message"] = e.message

	return result

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
