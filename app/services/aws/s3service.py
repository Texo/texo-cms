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
# Function: getBucketList
# This function retrieves Amazon S3 buckets for the
# specified account.
#
# Parameters:
#    accessKeyId     - AWS Access Key ID
#    secretAccessKey - AWS Secret Access Key
#
def getBucketList(accessKeyId, secretAccessKey):
	connection = S3Connection(accessKeyId, secretAccessKey)
	return connection.get_all_buckets()
