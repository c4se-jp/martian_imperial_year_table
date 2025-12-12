#!/bin/bash -eux

# /usr/local/bin/precopy_appsync
rsync -auv \
      --delete \
      --exclude='.#*' \
      --exclude='.git/*' \
      --exclude='.venv/*' \
      --exclude='__target__/*' \
      --exclude='node_modules/*' \
      /host_sync/ /app_sync
