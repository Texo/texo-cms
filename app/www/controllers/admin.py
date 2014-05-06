import os
import bottle
import config
import logging
import zipfile
import markdown
import requests
import pytz

from datetime import datetime

from bottle import route
from bottle import request
from bottle import response
from bottle import redirect
from bottle import static_file
from bottle import mako_view as view
from bottle import mako_template as template
from pytz   import timezone

from services.aws import awsservice
from services.aws import s3service
from services.datetimehelper import dthelper
from services.identity import userservice
from services.http import httpservice
from services.engine import postservice
from services.engine import engineservice
from services.engine import reportservice
from decorators.requireSessionDecorator import *

try:
	import zlib
	compression = zipfile.ZIP_DEFLATED

except:
	compression = zipfile.ZIP_STORED


@route("/admin", method="GET")
@view("admin-dashboard.html")
@requireSession
def adminDashboard():
	return {
		"title"  : "Administrator",
	}

@route("/admin/utilities/deleteallposts", method="GET")
@route("/admin/utilities/deleteallposts", method="POST")
@view("admin-delete-all-posts.html")
@requireSession
def adminDeleteAllPosts():
	if "delete" in request.all:
		postservice.deleteAllPosts()
		redirect("/admin/posts")

	return {
		"title": "Delete All Posts",
	}

@route("/admin/editpost/<id>", method="GET")
@route("/admin/editpost/<id>", method="POST")
@view("admin-edit-post.html")
@requireSession
def adminEditPost(id=0):
	success = True
	message = ""
	mode = ""

	if "btnDraft" in request.all:
		mode = "Draft"

	if "btnPublish" in request.all:
		mode = "Published"

	if mode != "":
		post = postservice.updatePost(
			id                = id,
			title             = request.all["postTitle"],
			slug              = request.all["postSlug"],
			content           = request.all["postContent"],
			tags              = request.all["postTags"],
			status            = mode,
			publishedDateTime = dthelper.utcNow() if mode == "Published" else None,
			publishedYear     = dthelper.utcNow() if mode == "Published" else None,
			publishedMonth    = dthelper.utcNow() if mode == "Published" else None
		)

		message = "Your post has been updated and %s successfully." % ("saved as a draft" if mode == "Draft" else "published")
		redirect("/admin/posts/" + message)

	else:
		post = postservice.getPostById(id=id)

	return {
		"title": "Write Post",
		"success": success,
		"message": message,
		"id": post["id"],
		"postTitle": post["title"],
		"postSlug": post["slug"],
		"postTags": post["tagList"],
		"postContent": post["content"],
	}

@route("/admin/utilities/exportmarkdownfiles", method="GET")
@route("/admin/utilities/exportmarkdownfiles", method="POST")
@view("admin-export-markdown-files.html")
@requireSession
def adminExportMarkdownFiles():
	logger = logging.getLogger(__name__)

	if "btnExport" in request.all:
		posts = postservice.getAllPosts()
		zipfilePath = os.path.join(config.UPLOAD_PATH, "blog-posts.zip")

		zf = zipfile.ZipFile(zipfilePath, mode="w")
		filenames = []

		try:
			#
			# Write each post to a file, adding each file to a ZIP
			#
			for post in posts:
				filename = postservice.generateMarkdownFile(post=post)
				filenames.append(filename)

				writtenFilename = "%s/%s/%s" % (post["publishedYear"], post["publishedMonth"], os.path.basename(filename),)
				zf.write(filename, compress_type=compression, arcname=writtenFilename)

		except Exception as e:
			logger.error("There was an error writing zipfile: %s", e.message)

		finally:
			zf.close()

		#
		# Clean out markdown files
		#
		for filename in filenames:
			try:
				os.remove(filename)
			except Exception as e:
				logger.error("Unable to remove %s" % (filename,))

		#
		# Serve up the ZIP file as a download
		#
		return static_file(os.path.basename(zipfilePath), root=config.UPLOAD_PATH)

	return {
		"title": "Export Markdown Files"
	}

@route("/admin/utilities/importmarkdownfiles", method="GET")
@view("admin-import-markdown-files.html")
@requireSession
def adminImportMarkdownFiles():
	return {
		"title": "Import Markdown Files"
	}

@route("/admin/login", method="GET")
@route("/admin/login", method="POST")
@view("login.html")
def adminLogin():
	logger = logging.getLogger(__name__)

	message = ""
	performRedirect = False

	if "btnSubmit" in request.all:
		try:
			#
			# First just validate the inputs
			#
			if not userservice.isUserEmailValid(email=request.all["email"]):
				raise ValueError("The email address provided is invalid")

			if not userservice.isUserPasswordValid(password=request.all["password"]):
				raise ValueError("The password provided is invalid")

			#
			# Find our user. If found validate the password.
			#
			user = userservice.getUserByEmail(email=request.all["email"])
			if not user:
				logger.error("Invalid login attempt: could not find email %s" % request.all["email"])
				raise ValueError("The provided credentials are invalid")

			if userservice.isCorrectUserPassword(user=user, password=request.all["password"]) != (True, None):
				logger.error("Invalid login attempt: incorrect password")
				raise ValueError("The provided credentials are invalid")

			#
			# Attempt to set the user in our session.
			#
			(sessionSuccess, sessionMessage) = userservice.setUserSession(session=request.session, user=user)

			if (sessionSuccess, sessionMessage) != (True, None):
				raise Exception("Problem saving session: %s" % sessionMessage)

			performRedirect = True

		except ValueError as ve:
			message = ve.message

		except Exception as e:
			message = "An unexpected error has occurred"
			logger.error(e.message, exc_info=True)


	if performRedirect:
		redirect("/admin")

	return {
		"title": "Log In",
		"message": message,
	}

@route("/admin/logout", method="GET")
@requireSession
def adminLogout():
	userservice.deleteUserFromSession(session=request.session)
	redirect("/admin/login")

@route("/admin/posts", method="GET")
@route("/admin/posts/<message>", method="GET")
@view("admin-posts.html")
@requireSession
def adminPosts(message=""):
	logger = logging.getLogger(__name__)

	result = {
		"title": "Manage Posts",

		"success": True,
		"message": message,
	}

	try:
		posts, postCount, numPages = postservice.getPosts(page=0)

		result["posts"] = map(postservice.makePageFriendlyPost, posts)
		result["numPages"] = int(numPages)

	except Exception as e:
		logger.error(e.message, exc_info=True)

		result["success"] = False
		result["message"] = e.message

	return result

@route("/admin/settings", method="GET")
@route("/admin/settings", method="POST")
@view("admin-settings.html")
@requireSession
def adminSettings():
	logger = logging.getLogger(__name__)

	result = engineservice.getSettings()

	result["success"] = True
	result["message"] = ""

	if "btnSave" in request.all:
		try:
			if request.all["timezone"] not in pytz.common_timezones:
				raise ValueError("Please provide a valid timezone")

			if request.all["theme"] not in engineservice.getInstalledThemeNames():
				raise ValueError("Please provide a valid theme name")

			engineservice.saveSettings(
				timezone = request.all["timezone"],
				theme    = request.all["theme"]
			)

			awsservice.saveSettings(
				accessKeyId=request.all["awsAccessKeyId"],
				secretAccessKey=request.all["awsSecretAccessKey"],
				s3Bucket="" if "awsBucket" not in request.all else request.all["awsBucket"]
			)

			result["timezone"] = request.all["timezone"]
			result["themeName"] = request.all["theme"]
			result["awsAccessKeyId"] = request.all["awsAccessKeyId"]
			result["awsSecretAccessKey"] = request.all["awsSecretAccessKey"]
			result["awsBucket"] = "" if "awsBucket" not in request.all else request.all["awsBucket"]

			result["message"] = "Settings updated"

		except Exception as e:
			result["success"] = False
			result["message"] = e.message

	awsSettings = awsservice.getSettings()

	result["title"] = "Settings"
	result["timezones"] = dthelper.getTimezoneArray()
	result["themes"] = engineservice.getInstalledThemeNames()

	result["awsAccessKeyId"] = awsSettings["accessKeyId"]
	result["awsSecretAccessKey"] = awsSettings["secretAccessKey"]
	result["awsBucket"] = awsSettings["s3Bucket"]
	result["awsBuckets"] = []

	if len(result["awsAccessKeyId"]) and len(result["awsSecretAccessKey"]):
		awsConnection = s3service.connect(accessKeyId=result["awsAccessKeyId"], secretAccessKey=result["awsSecretAccessKey"])
		result["awsBuckets"] = s3service.getBucketList(connection=awsConnection)

	return result

@route("/admin/upload/image", method="DELETE")
@requireSession
def adminUploadDeleteImageFile():
	logger = logging.getLogger(__name__)

	try:
		awsSettings = awsservice.getSettings()
		connection = s3service.connect(accessKeyId=awsSettings["accessKeyId"], secretAccessKey=awsSettings["secretAccessKey"])

		s3service.deleteFile(connection=connection, bucketName=awsSettings["s3Bucket"], keyName=request.all["key"])

	except Exception as e:
		logger.error(e.message, exc_info=True)
		return e.message

	return "ok"

@route("/admin/upload/image", method="POST")
@requireSession
def adminUploadImageFile():
	logger = logging.getLogger(__name__)

	f = request.files.get("upload")
	name, ext = os.path.splitext(f.filename)

	if ext not in (".jpg", ".jpeg", ".png",):
		return "Invalid file type"

	#
	# Upload the file, then send it to Amazon S3
	#
	f.save(config.UPLOAD_PATH, True)

	try:
		fullUploadedFilePath = os.path.join(config.UPLOAD_PATH, f.filename)

		awsSettings = awsservice.getSettings()
		connection = s3service.connect(accessKeyId=awsSettings["accessKeyId"], secretAccessKey=awsSettings["secretAccessKey"])

		name = os.path.basename(fullUploadedFilePath)
		keyName = "/posts/%s" % name

		s3service.saveFile(connection=connection, bucketName=awsSettings["s3Bucket"], filePathAndName=fullUploadedFilePath, keyName=keyName)

	except Exception as e:
		logger.error(e.message, exc_info=True)
		return e.message

	finally:
		try:
			os.remove(fullUploadedFilePath)

		except OSError as ose:
			logger.error(ose.message, exc_info=True)

	return "ok"

@route("/admin/upload/markdownfile", method="POST")
@requireSession
def adminUploadMarkdownFile():
	logger = logging.getLogger(__name__)

	f = request.files.get("upload")
	name, ext = os.path.splitext(f.filename)

	if ext not in (".md"):
		return "Invalid file type"

	#
	# Upload the file, then parse it
	#
	f.save(config.UPLOAD_PATH, True)

	try:
		fullUploadedFilePath = os.path.join(config.UPLOAD_PATH, f.filename)
		metadata, content = postservice.parseMarkdownFile(fullUploadedFilePath, config.TIMEZONE)

		#
		# Find the author based on name
		#
		firstName, lastName = metadata["author"].split(" ")
		possibleAuthors = userservice.getUsersByName(firstName=firstName, lastName=lastName)

		if len(possibleAuthors) <= 0:
			raise Exception("Could not find author")

		#
		# Find status by name
		#
		status = postservice.getPostStatus(status="Published")

		dt = metadata["date"]
		d, t = metadata["date"].split(" ")

		#
		# Do we already have a matching post? If so say no
		#
		matchingPost = postservice.getPostByDateAndSlug(
			year=dthelper.getYear(date=d),
			month=dthelper.getMonth(date=d),
			slug=metadata["slug"]
		)

		if matchingPost:
			raise Exception("Already have a post that matches this slug, year and month")

		postservice.createPost(
			title             = metadata["title"],
			author            = possibleAuthors[0],
			slug              = metadata["slug"],
			content           = content,
			createdDateTime   = metadata["date"],
			tags              = metadata["tags"],
			status            = status,
			publishedDateTime = metadata["date"],
			publishedMonth    = d,
			publishedYear     = d
		)


	except Exception as e:
		logger.error(e.message, exc_info=True)
		return e.message

	finally:
		try:
			os.remove(fullUploadedFilePath)

		except OSError as ose:
			logger.error(ose.message, exc_info=True)

	return "ok"

@route("/admin/utilities", method="GET")
@view("admin-utilities.html")
@requireSession
def adminUtilities():
	result = {
		"title": "Utilities",
	}

	return result

@route("/admin/writepost", method="GET")
@route("/admin/writepost", method="POST")
@view("admin-write-post.html")
@requireSession
def adminWritePost():
	success = True
	message = ""
	mode = ""

	if "btnDraft" in request.all:
		mode = "draft"

	if "btnPublish" in request.all:
		mode = "publish"

	if mode != "":
		post = postservice.createPost(
			title             = request.all["postTitle"],
			author            = request.session["user"],
			slug              = request.all["postSlug"],
			content           = request.all["postContent"],
			createdDateTime   = dthelper.utcNow(),
			tags              = request.all["postTags"],
			status            = postservice.getPostStatus(status=("Draft" if mode == "draft" else "Published")),
			publishedDateTime = dthelper.utcNow() if mode == "publish" else None,
			publishedYear     = dthelper.utcNow() if mode == "publish" else None,
			publishedMonth    = dthelper.utcNow() if mode == "publish" else None
		)

		message = "Your post has been %s." % ("saved as a draft" if mode == "draft" else "published")
		redirect("/admin/posts/" + message)

	return {
		"title": "Write Post",
		"success": success,
		"message": message,
		"postTitle": "" if not "postTitle" in request.all else request.all["postTitle"],
		"postSlug": "" if not "postSlug" in request.all else request.all["postSlug"],
		"postTags": "" if not "postTags" in request.all else request.all["postTags"],
		"postContent": "" if not "postContent" in request.all else request.all["postContent"],
	}

@route("/admin/ajax/getPostCountsForLast12Months", method="GET")
@requireSession
def getPostCountsForLast12Months():
	return {
		"data": reportservice.getPostCountsForLast12Months()
	}
