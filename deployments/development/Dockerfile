FROM python:3.9-slim

SHELL ["/bin/bash", "-ex", "-o", "pipefail", "-c"]

WORKDIR /mnt
VOLUME /mnt

EXPOSE 5000

ENV PATH=/root/.local/bin:$PATH

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    inotify-tools \
    libpcre3-dev \
    rsync \
    silversearcher-ag \
 && curl -sL https://deb.nodesource.com/setup_16.x | bash -ex \
 && apt-get install -y --no-install-recommends \
    nodejs \
 && pip install --no-cache-dir --user pipenv \
 && apt-get purge -y \
    curl \
 && apt-get autoremove -y \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

COPY package.json \
     package-lock.json \
     Pipfile \
     Pipfile.lock \
     ./
RUN pipenv sync -d --pre \
 && npm ci \
 && mv node_modules /tmp

ENTRYPOINT ["./deployments/development/entrypoint.sh"]
