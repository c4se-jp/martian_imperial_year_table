FROM python:3.12-slim

SHELL ["/bin/bash", "-ex", "-o", "pipefail", "-c"]

WORKDIR /mnt
VOLUME /mnt

EXPOSE 5000

ENV PATH=/root/.local/bin:$PATH
ENV NODE_MAJOR=20

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    curl \
    gnupg \
    inotify-tools \
    libpcre3-dev \
    rsync \
    silversearcher-ag \
 && mkdir -p /etc/apt/keyrings \
 && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
 && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends \
    nodejs \
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
