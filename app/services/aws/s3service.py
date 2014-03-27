#
# File: s3service.py
# This module offers functions to work with Amazon S3 file
# services.
#
# Author:
#    Adam Presley
#
import os
import boto
import config
import logging

from boto.s3.connection import S3Connection

#
# Function: connect
# Establishes a connection with Amazon S3 services. This returns
# an S3Connection object.
#
# Parameters:
#    accessKeyId     - AWS Access Key ID
#    secretAccessKey - AWS Secret Access Key
#
def connect(accessKeyId, secretAccessKey):
	logger = logging.getLogger(__name__)

	try:
		connection = S3Connection(accessKeyId, secretAccessKey)
		return connection

	except Exception as e:
		logger.error(e.message)
		raise e

#
# Function: getBucketList
# This function retrieves Amazon S3 buckets for the
# specified account.
#
# Parameters:
#    connection - An S3Connection object
#
def getBucketList(connection):
	buckets = connection.get_all_buckets()
	return buckets
