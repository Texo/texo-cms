import config
import markdown
import requests

from bottle import route
from bottle import template
from bottle import mako_view as view
from bottle import mako_template as template

from services.publicapi import blogapi
from services.engine import engineservice

###############################################################################
# Posts Routes
###############################################################################

@route("", method="GET")
@route("/", method="GET")
@view("posts.html")
def index():
	posts = requests.get(engineservice.buildUrl("/posts/1")).json()
	posts["posts"] = map(renderMarkdown, posts["posts"])

	return blogapi.decorateDictionaryWithAPI(object=posts)

@route("/posts/<page:int>", method="GET")
@view("posts.html")
def getPosts(page):
	posts = requests.get(engineservice.buildUrl("/posts/%d" % (page,))).json()
	posts["posts"] = map(renderMarkdown, posts["posts"])

	return blogapi.decorateDictionaryWithAPI(object=posts)

@route("/posts/search/<searchTerm>.json", method="GET")
def getPostsBySearchAsJson(searchTerm):
	posts = requests.get(engineservice.buildUrl("/posts/1/search/%s" % (searchTerm,))).json()
	posts["posts"] = map(renderMarkdown, posts["posts"])

	return posts

@route("/posts/<tag>", method="GET")
@route("/posts/<tag>/<page:int>", method="GET")
@view("posts.html")
def getPostsByTag(tag, page=1):
	posts = requests.get(engineservice.buildUrl("/posts/%d/tag/%s" % (page, tag,))).json()
	posts["posts"] = map(renderMarkdown, posts["posts"])

	result = blogapi.decorateDictionaryWithAPI(object=posts)
	result["tag"] = tag
	return result


###############################################################################
# Single post routes
###############################################################################
@route("/post/<year:int>/<month:int>/<slug>", method="GET")
@view("post.html")
def getPostByDateAndSlug(year, month, slug):
	post = requests.get(engineservice.buildUrl("/post/%d/%d/%s" % (year, month, slug,))).json()
	post["post"] = renderMarkdown(post["post"])

	return blogapi.decorateDictionaryWithAPI(object=post)


def renderMarkdown(post):
	extensions = [
		"codehilite(css_class=highlight",
		"tables",
		"extra",
	]

	if config.CODE_LINE_NUMBERS:
		extensions[0] = extensions[0] + ",linenums=True)"
	else:
		extensions[0] = extensions[0] + ")"

	post["content"] = markdown.markdown(post["content"].decode("utf-8"), output_format="html5", extensions=extensions)
	return post
