import config
import requests

from bottle import route
from bottle import template
from bottle import request
from bottle import response
from bottle import static_file
from bottle import mako_view as view
from bottle import mako_template as template

from datetime import datetime

from services.http import httpservice
from services.publicapi import blogapi
from services.engine import postservice
from services.engine import engineservice

###############################################################################
# Posts Routes
###############################################################################

@route("", method="GET")
@route("/", method="GET")
@view("posts.html")
def index():
	posts = requests.get(engineservice.buildUrl("/posts/1"))
	return blogapi.decorateDictionaryWithAPI(object=posts.json())

@route("/posts/<page:int>", method="GET")
@view("posts.html")
def getPosts(page):
	posts = requests.get(engineservice.buildUrl("/posts/%d" % (page,)))
	return blogapi.decorateDictionaryWithAPI(object=posts.json())

@route("/posts/search/<searchTerm>.json", method="GET")
def getPostsBySearchAsJson(searchTerm):
	posts = requests.get(engineservice.buildUrl("/posts/1/search/%s" % (searchTerm,)))
	return posts.json()

@route("/posts/<tag>", method="GET")
@route("/posts/<tag>/<page:int>", method="GET")
@view("posts.html")
def getPostsByTag(tag, page=1):
	posts = requests.get(engineservice.buildUrl("/posts/%d/tag/%s" % (page, tag,)))
	result = blogapi.decorateDictionaryWithAPI(object=posts.json())
	result["tag"] = tag
	return result


###############################################################################
# Single post routes
###############################################################################
@route("/post/<year:int>/<month:int>/<slug>", method="GET")
@view("post.html")
def getPostByDateAndSlug(year, month, slug):
	post = requests.get(engineservice.buildUrl("/post/%d/%d/%s" % (year, month, slug,)))
	return blogapi.decorateDictionaryWithAPI(object=post.json())
