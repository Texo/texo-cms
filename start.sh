#!/bin/bash

export PYTHONPATH="./:./app"
export PYTHONDONTWRITEBYTECODE="True"
export TEXO_SETTINGS_DEBUG="True"

export TEXO_SERVER_ADDRESS=localhost
export TEXO_SERVER_PORT=8081

source ./virtualenv/bin/activate
python -B ./app/www/texo.py
deactivate