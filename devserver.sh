#!/bin/sh
source .venv/bin/activate
python -m flask --app dad run -p $PORT --debug