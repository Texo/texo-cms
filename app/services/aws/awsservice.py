#
# File: awsservice.py
# This module offers functions to handle basic connection information
# and lower-level functions of AWS.
#
# Author:
#    Adam Presley
#
import os
import boto
import config
import logging
import database

#
# Function: getSettings
# Returns a dict of Amazon Web Services settings as specified
# by a user in the adminstrator.
#
def getSettings():
	logger = logging.getLogger(__name__)

	result = database.query(sql="""
		SELECT
			  accessKeyId
			, secretAccessKey
			, s3Bucket

		FROM awssettings
		LIMIT 1
	""")

	if len(result) < 1:
		logger.error("Attempted to get AWS settings, but none were found")
		raise Exception("No Amazon Web Service settings found")

	return result[0]

#
# Function: saveSettings
# Saves Amazon Web Services settings to the database.
#
# Parameters:
#    accessKeyId     - AWS Access Key ID
#    secretAccessKey - AWS Secret Access Key
#    s3Bucket        - Name of an AWS S3 bucket
#
def saveSettings(accessKeyId, secretAccessKey, s3Bucket):
	database.execute(sql="""
		UPDATE awssettings SET
			  accessKeyId=%s
			, secretAccessKey=%s
			, s3Bucket=%s
	""", parameters=(
		accessKeyId,
		secretAccessKey,
		s3Bucket,
	))
