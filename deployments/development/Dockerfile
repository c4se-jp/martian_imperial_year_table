FROM python:3.7-alpine

SHELL ["/bin/ash", "-ex", "-o", "pipefail", "-c"]

WORKDIR /mnt
VOLUME /mnt

EXPOSE 5000

ENV PATH=/root/.local/bin:$PATH

RUN apk add --no-cache -t .build-deps \
    curl \
 && apk add --no-cache -t .runtime-deps \
    build-base \
    git \
    inotify-tools \
    libffi-dev \
    linux-headers \
    nodejs \
    npm \
    openssl-dev \
    pcre-dev \
    python3-dev \
    rsync \
    the_silver_searcher \
 && pip install --no-cache-dir --user pipenv \
 && apk del --purge .build-deps \
 && rm -rf /var/cache/apk/*

COPY package.json \
     package-lock.json \
     Pipfile \
     Pipfile.lock \
     ./
RUN pipenv sync -d --pre \
 && npm ci \
 && mv node_modules /tmp

ENTRYPOINT ["./deployments/development/entrypoint.sh"]
