#
# File: reportservice.py
# This module provides functions to generate report and dashbaord
# data.
#
# Author:
#    Adam Presley
#
import config
import database

from services.datetimehelper import dthelper

#
# Function: getPostCountsForLast12Months
# Function to get post counts for the last 12 months. The post cound and the
# month for that count is returned in each row.
#
def getPostCountsForLast12Months():
	qry = database.query(sql="""
		SELECT
			  COUNT(post.id) AS postCount
			, DATE_FORMAT(post.publishedDateTime, '%b') AS postMonth
		FROM post
			INNER JOIN poststatus ON poststatus.id=post.postStatusId
		WHERE
			poststatus.status='Published'
			AND post.publishedDateTime >= DATE_SUB(NOW(), INTERVAL 12 MONTH)

		GROUP BY
			DATE_FORMAT(post.publishedDateTime, '%b')
		ORDER BY
			post.publishedDateTime ASC
	""")

	return qry