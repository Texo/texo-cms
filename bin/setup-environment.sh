#!/bin/bash

sudo apt-get -y -q install python-setuptools python-dev python-virtualenv python-mysqldb mysql-server mysql-client libmysqlclient-dev
sudo apt-get build-dep python-mysqldb fabric

# Setup a virtual environment for our application
cd ..
virtualenv -p /usr/bin/python ./virtualenv
cd virtualenv

# Select this virtual environment and setup all the necessary stuff
source ./bin/activate

pip install -r ../bin/requirements.txt

deactivate
cd ../bin
