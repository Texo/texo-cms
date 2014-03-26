#
# File: blogapi.py
# This package defines functions to provide users who implement Texo
# CMS with methods and data to create content sites.
#
# Author:
#    Adam Presley
#
import config

from bottle import request
from services.engine import postservice
from services.engine import themeservice
from services.datetimehelper import dthelper

#
# Function: decorateDictionaryWithAPI
# Takes a dictionary used in a controller response and
# decorates it with all available public API methods and data.
# The following information is placed in the variable *object*.
#
#    - BLOG_TITLE
#    - BLOG_TAGLINE
#    - POSTS_PER_PAGE
#    - THEME_NAME
#    - THEME_PATH
#    - THEME_STATIC_PATH
#
# This next list is the methods placed in *object* for content
# applications' usage.
#
#    - formatDateTime
#    - formatDate
#    - formatTime
#    - getPostTags
#
# Parameters:
#    object - A dictionary to decorate
#
def decorateDictionaryWithAPI(object={}):
	# Settings info
	object["BLOG_TITLE"] = config.BLOG_TITLE
	object["BLOG_TAGLINE"] = config.BLOG_TAGLINE
	object["POSTS_PER_PAGE"] = config.POSTS_PER_PAGE
	object["THEME_NAME"] = request.themeName

	# Path info
	object["THEME_PATH"] = themeservice.getFullThemePath(themeName=request.themeName)
	object["THEME_STATIC_PATH"] = themeservice.getThemeStaticPath(themeName=request.themeName)

	# Date/time methods
	object["formatDateTime"] = dthelper.formatDateTime
	object["formatDate"] = dthelper.formatDate
	object["formatTime"] = dthelper.formatTime

	# Tag methods
	object["getPostTags"] = postservice.getPostTags

	return object
