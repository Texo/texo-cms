#
# File: fabfile.py
# This script contains the Fabric deployment tasks. There
# are tasks here for setup and management. Please note that
# this must be run with the virtual environment activated.
#
# (start code)
# $ source ../virtualenv/bin/activate
# $ fab -l
# $ deactivate
#
from __future__ import with_statement

import os
import re
import sys
import boto
import shutil
import slimit
import boto.ec2
import subprocess
from datetime import datetime

from fabric.api import *
from fabric.api import task
from fabric.colors import red
from fabric.colors import green
from fabric.colors import yellow
from zipfile import ZipFile

from boto.ec2.connection import EC2Connection

currentPath = os.path.dirname(__file__)
parentPath = os.path.abspath(os.path.join(currentPath, os.path.pardir))

sys.path.insert(0, currentPath)
sys.path.insert(0, parentPath)

import app.config

APP_OUTPUT_PATH = os.path.join(parentPath, "dist/app")
DIST_CONF_PATH = os.path.join(parentPath, "dist/conf")
HTML_DOC_OUTPUT_PATH = os.path.join(parentPath, "dist/docs/html")
HTML_DOC_PROJECT_PATH = os.path.join(parentPath, "dist/docs/project")


###############################################################################
# Variables
###############################################################################


###############################################################################
# Private methods
###############################################################################
def _cleanBuildFolder():
	print("Cleaning build folder...")

	for f in os.listdir(APP_OUTPUT_PATH):
		if os.path.isdir(os.path.join(APP_OUTPUT_PATH, f)):
			shutil.rmtree(os.path.join(APP_OUTPUT_PATH, f))
		else:
			if ".zip" not in f and f not in [".gitignore"]:
				os.remove(os.path.join(APP_OUTPUT_PATH, f))

def _connect():
	return EC2Connection()

def _copyBuildFiles(includeConfig=False):
	#
	# Clean out sessions folders prior to copy
	#
	print("Cleaning out session files...")

	sessionDataPath = os.path.join(app.config.SESSION_PATH, "data")
	sessionLockPath = os.path.join(app.config.SESSION_PATH, "lock")

	for f in os.listdir(sessionDataPath):
		p = os.path.join(sessionDataPath, f)

		if os.path.isdir(p):
			shutil.rmtree(p)
		else:
			if f != ".gitignore":
				os.remove(p)

	for f in os.listdir(sessionLockPath):
		p = os.path.join(sessionLockPath, f)

		if os.path.isdir(p):
			shutil.rmtree(p)
		else:
			if f != ".gitignore":
				os.remove(p)

	#
	# Copy application files
	#
	print("Copying build files...")
	ignoreFiles = [".gitignore", "application.log"]

	if not includeConfig:
		ignoreFiles.append("config.py")

	for f in os.listdir(app.config.ROOT_PATH):
		source = os.path.join(app.config.ROOT_PATH, f)
		dest = os.path.join(APP_OUTPUT_PATH, f)

		if os.path.isdir(source):
			shutil.copytree(source, dest, False, None)
		else:
			if f not in ignoreFiles and ".pyc" not in f:
				shutil.copy2(source, dest)

def _getInstances():
	connection = _connect()
	reservations = connection.get_all_instances()
	instances = []

	print ""
	print green("** Getting instances **")

	for reservation in reservations:
		for instance in reservation.instances:
			print("Instance: %s (%s) @ %s" % (instance.id, instance.state, instance.public_dns_name))
			if instance.state == "running" and "group" in instance.tags and instance.tags["group"] == "texocms":
				print("Appending instance")
				instances.append(instance)

	return instances


def _getDNSEntriesFromInstances(instances):
	results = [x.public_dns_name for x in instances]
	return results

def _minifyBuildJavaScriptFiles():
	print("Minifying build JavaScript files...")

	sourceJsPath = os.path.join(app.config.STATIC_PATH, "js")
	targetJsPath = os.path.join(APP_OUTPUT_PATH, "www/static/js")

	def visit(arg, dirname, names):
		for f in names:
			source = os.path.join(dirname, f)

			if os.path.isfile(source):
				trimmedDirName = dirname.replace(sourceJsPath + "/", "")

				if trimmedDirName == sourceJsPath:
					dest = os.path.join(targetJsPath, f)
				else:
					dest = os.path.join(os.path.join(targetJsPath, trimmedDirName), f)

				_minifyJavaScriptFile(source, dest)

	os.path.walk(sourceJsPath, visit, None)

def _minifyJavaScriptFile(sourceFilename, targetFilename):
	outputFile = open(targetFilename, "w")

	try:
		with open(sourceFilename, "r") as inputFile:
			sourceData = inputFile.read()

			try:
				minifiedData = slimit.minify(sourceData)
				print(sourceFilename)

			except:
				print(red("Minification failed for %s" % (sourceFilename,)))
				minifiedData = sourceData

		outputFile.write(minifiedData)

	finally:
		outputFile.close()

def _zipBuild():
	with ZipFile(os.path.join(APP_OUTPUT_PATH, "texocms.zip"), "w") as z:
		def visit(arg, dirname, names):
			for f in names:
				source = os.path.join(dirname, f)
				name = source.replace(APP_OUTPUT_PATH, "")

				if f not in ["texocms.zip"]:
					z.write(source, name)

		os.path.walk(APP_OUTPUT_PATH, visit, None)

###############################################################################
# Actions
###############################################################################

@task
def version():
	print(green("** Texo CMS Management Tools **"))
	print(yellow("Version 1.0"))


@task
def amazon(keyFile):
	"""Sets up the user and host environment for Amazon deployment and uses the provided keyFile. Use before setup and deployment tasks"""

	env.user = "ubuntu"
	env.key_filename = keyFile
	env.hosts = _getDNSEntriesFromInstances(_getInstances())
	return env.hosts

@task
def build(includeConfig=False):
	"""Builds the application. This copies the source files into the *dist/app* folder and minifies JS and CSS"""

	print(green("** Build Application **"))

	_cleanBuildFolder()
	_copyBuildFiles(includeConfig=False)
	_minifyBuildJavaScriptFiles()

	#_zipBuild()
	#_cleanBuildFolder()

@task
def buildall():
	"""Performs the application build and generates docs"""

	generateDocs()
	build()

@task
def cleanBuildFolder():
	"""Cleans out the build folder"""

	_cleanBuildFolder()

@task
def generateDocs():
	"""Generates the service documentation for Texo CMS using NaturalDocs"""

	print("")
	print(green("** Generate Documentation **"))

	#
	# Clean out existing HTML documentation
	#
	fileList = [os.path.join(HTML_DOC_OUTPUT_PATH, f) for f in os.listdir(HTML_DOC_OUTPUT_PATH)]

	for f in fileList:
		if os.path.isdir(f):
			shutil.rmtree(f)
		else:
			if f != ".gitignore":
				os.remove(f)

	#
	# Rebuild
	#
	args = [
		"naturaldocs",
		"-i %s" % (app.config.ROOT_PATH,),
		"-i %s" % (os.path.join(app.config.ROOT_PATH, "services"),),
		"-i %s" % (os.path.join(app.config.STATIC_PATH, "js/app"),),
		"-o HTML %s" % (HTML_DOC_OUTPUT_PATH,),
		"-p %s" % (HTML_DOC_PROJECT_PATH,),
		"-r"
	]

	local(" ".join(args))

@task
def restartTexoService():
	"""Restarts the Texo Upstart Service Jop"""

	sudo("service texocms restart")

@task
def setupAppRequirements():
	"""Sets up the software necessary for a clean OS to run Texo CMS"""

	sudo("apt-get update")
	sudo("apt-get -y -q install python-setuptools python-dev python-virtualenv python-mysqldb mysql-client libmysqlclient-dev nginx")

@task
def setupAppDirectory(user):
	"""Sets up the blog software home directory on a clean OS install. Use after setupAppRequirements"""

	sudo("mkdir /webapps")
	sudo("mkdir /webapps/texocms")

	sudo("chown {user}:{user} /webapps".format(user=user))
	sudo("chown {user}:{user} /webapps/texocms".format(user=user))

@task
def setupMySQL():
	"""Sets up a MySQL database server"""

	sudo("apt-get update")
	sudo("apt-get -y -q install mysql-client mysql-server")

@task
def setupNginx(port, serverName):
	"""Sets up Nginx for proxying requests on port 80 to 8080. Should be run after setupUpstartJob"""

	with open(os.path.join(DIST_CONF_PATH, "texo-cms-nginx"), "r") as f:
		confFile = f.read()

	#
	# Modify the Nginx config
	#
	pattern1 = re.compile(r'\$\{port\}', re.I)
	pattern2 = re.compile(r'\$\{serverName\}', re.I)

	confFile = pattern1.sub(port, confFile, count=1)
	confFile = pattern2.sub(serverName, confFile, count=1)

	newConfFilePath = os.path.join("./", "texo-cms-nginx")

	with open(newConfFilePath, "w") as f:
		f.write(confFile)

	put(newConfFilePath, "/webapps/texocms")
	sudo("mv /webapps/texocms/texo-cms-nginx /etc/nginx/sites-available/default")
	sudo("chown root:root /etc/nginx/sites-available/default")

	os.remove(newConfFilePath)

	sudo("service nginx restart")
	sudo("service texocms restart")

@task
def setupUpstartJob(user):
	"""Sets up the Upstart service job. Run after uploadApp (pretty much last)"""

	with open(os.path.join(DIST_CONF_PATH, "texocms.conf"), "r") as f:
		confFile = f.read()

	#
	# Modify the file with the user to run Texo as and copy it up
	#
	pattern = re.compile(r'\$\{user\}', re.I)
	confFile = pattern.sub(user, confFile, count=1)

	newConfFilePath = os.path.join("./", "texocms.conf")

	with open(newConfFilePath, "w") as f:
		f.write(confFile)

	put(newConfFilePath, "/webapps/texocms")
	sudo("mv /webapps/texocms/texocms.conf /etc/init/texocms.conf")
	sudo("chown root:root /etc/init/texocms.conf")

	os.remove(newConfFilePath)

	#
	# Copy up the start script for the Upstart script to run
	#
	put(os.path.join(DIST_CONF_PATH, "start.sh"), "/webapps/texocms")
	sudo("chmod +x /webapps/texocms/start.sh")

@task
def setupVirtualEnvironment():
	"""Sets up the Python virtual environment. Run after setupAppRequirements and setupAppDirectory"""

	#
	# Read requirements file
	#
	requirements = open("./requirements.txt").read().strip()

	run("virtualenv -p /usr/bin/python2 /webapps/texocms/virtualenv")

	with prefix("source /webapps/texocms/virtualenv/bin/activate"):
		for req in requirements.split("\n"):
			run("pip install {req}".format(req=req))

@task
def uploadApp():
	"""Uploads the application. Be sure to run the *build* task first. App requirements, directory, and virtual env must be configured as well"""

	put("../dist/app/**", "/webapps/texocms")
