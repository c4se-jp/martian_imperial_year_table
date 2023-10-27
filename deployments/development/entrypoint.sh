#!/bin/sh -eux
# shellcheck shell=dash
if [ ! -d node_modules ] ; then
  rsync -au /tmp/node_modules .
fi
set +u
if [ -z "$1" ] ; then
  set -u
  ENV=development pipenv run flask --app web_main --debug run -h 0.0.0.0 -p 5000
else
  set -u
  # shellcheck disable=SC2068
  exec "$@"
fi
