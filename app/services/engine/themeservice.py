#
# File: themeservice.py
# This module provides methods for working with Text CMS themes. It helps
# in getting theme path information, as well as adding path info
# to the Bottle template path environment.
#
# Author:
#    Adam Presley
#
import os
import bottle
import config
import logging
import database
import logging.handlers

from services.engine import engineservice

#
# Function: addThemeToTemplatePath
# Adds the path to a theme to the Bottle template path.
#
# Parameters:
#    themeName - Name of the theme to add to the template path
#
def addThemeToTemplatePath(themeName):
	fullPath = getFullThemePath(themeName=themeName)
	logger = logging.getLogger(__name__)

	if not fullPath in bottle.TEMPLATE_PATH:
		#
		# First remove any existing theme paths
		#
		bottle.TEMPLATE_PATH = [p for p in bottle.TEMPLATE_PATH if config.THEME_PATH not in p]

		bottle.TEMPLATE_PATH.append(fullPath)
		logger.debug("Theme path: %s" % fullPath)

#
# Function getFullThemePath
# Returns the full path for a specified theme.
#
# Parameters:
#    themeName - Name of the theme to retrieve the path to
#
def getFullThemePath(themeName):
	return os.path.join(config.THEME_PATH, themeName)

#
# Function: getThemeName
# Returns the active theme name from the database.
#
def getThemeName():
	settings = engineservice.getSettings()
	return settings["themeName"]

#
# Function: getThemeStaticPath
# Returns the static resource path for a specified theme.
#
# Parameters:
#    themeName - Name of the theme to serve static files from
#
def getThemeStaticPath(themeName):
	return os.path.join(getFullThemePath(themeName=themeName), "static")
