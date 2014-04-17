#
# File: urlservice.py
# This module provides services for working with and
# manipulating URLs.
#
# Author:
#    Adam Presley
#
import urlparse


# 
# Function: removeQueryString
# Takes a URL and removes any query string. This
# returns the URL without the query string portion.
#
# Parameters:
#    url - String containing a URL
#
def removeQueryString(url):
	parts = urlparse.urlsplit(url)
	return "%s://%s%s" % (parts[0], parts[1], parts[2],)
	