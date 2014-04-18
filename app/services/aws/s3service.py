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

from boto.s3.key import Key
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
# Function: deleteFile
# Deletes a file from Amazon S3.
#
# Parameters:
#    connection - An S3Connection object
#    bucketName - Name of an S3 bucket
#    keyName    - Name of the key to delete
#
def deleteFile(connection, bucketName, keyName):
	logger = logging.getLogger(__name__)

	try:
		bucket = getBucket(connection=connection, bucketName=bucketName)
		key = bucket.get_key(keyName)
		key.delete()

	except Exception as e:
		logger.error(e.message)
		raise e

#
# Function: getBucket
# Returns an Amazon S3 bucket object.
#
# Parameters:
#    connection - An S3Connection object
#    bucketName - Name of an S3 bucket
#
def getBucket(connection, bucketName):
	logger = logging.getLogger(__name__)

	try:
		bucket = connection.get_bucket(bucketName)
		return bucket

	except Exception as e:
		logger.error(e.message)
		raise e

#
# Function: getBucketItems
# Returns a list of all items in an Amazon S3 bucket.
#
# Parameters:
#    connection - An S3Connection object
#    bucketName - Name of an S3 bucket
#
def getBucketItems(connection, bucketName):
	logger = logging.getLogger(__name__)

	try:
		bucket = getBucket(connection=connection, bucketName=bucketName)
		return bucket.list()

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

#
# Function: saveFile
# Saves a file (by name) from the local filesystem to
# the specified Amazon S3 bucket. Returns a Key object.
#
# Parameters:
#    connection      - An S3Connection object
#    bucketName      - Name of an S3 bucket
#    filePathAndName - Name of a local file (including path)
#    keyName         - Name of the key to store this file in
#
def saveFile(connection, bucketName, filePathAndName, keyName):
	logger = logging.getLogger(__name__)

	try:
		if not os.path.isfile(filePathAndName):
			raise Exception("The file %s is not a valid file" % filePathAndName)

		bucket = getBucket(connection=connection, bucketName=bucketName)
		key = Key(bucket)

		key.key = keyName
		key.set_contents_from_filename(filePathAndName)

		logger.debug("Saved file to S3 using key %s" % key.key)
		return key

	except Exception as e:
		logger.error(e.message)
		raise e