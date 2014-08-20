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
	return blogapi.decorateDictionaryWithAPI(object=_getPost(year=year, month=month, slug=slug))


###############################################################################
# Tag routes
###############################################################################
@route("/tags.json", method="GET")
def getTagsAsJson():
	return {
		"tags": postservice.getPostTags()
	}

@route("/tag/<id:int>.json", method="GET")
def getTagByIdAsJson(id):
	tag = postservice.getPostTagById(id=id)

	if tag:
		return postservice.makeFriendlyTag(tag=tag)
	else:
		return httpservice.notFound(response=response, message="Tag not found")


###############################################################################
# Private methods
###############################################################################

def _getPosts(page, tag=None, dateRange=None):
	posts, postCount, numPages = postservice.getPosts(page=page, status="Published", postsPerPage=config.POSTS_PER_PAGE, tag=tag)

	return {
		"posts": map(postservice.makePageFriendlyPost, posts),
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

def _getPost(year, month, slug):
	post = postservice.getPostByDateAndSlug(year=year, month=month, slug=slug)

	return {
		"post": postservice.makePageFriendlyPost(post),
		"numPages": 1,
		"numPosts": 1,
		"currentPage": 1,
		"previousPage": 1,
		"nextPage": 1,
		"lastPage": 1,
		"showFirstPageNavButton": False,
		"showLastPageNavButton": False,
		"showNextPageNavButton": False,
		"showPrevPageNavButton": False,
		"showPageNavigation": False,
	}

def _searchPosts(searchTerm):
	posts, postCount = postservice.searchPosts(searchTerm=searchTerm)

	return {
		"posts": map(postservice.makePageFriendlyPost, posts),
		"numPosts": int(postCount),
	}

