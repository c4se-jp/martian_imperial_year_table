FROM python:3.12-slim AS builder

SHELL ["/bin/bash", "-ex", "-o", "pipefail", "-c"]

WORKDIR /mnt

ENV PATH=/root/.local/bin:$PATH
ENV NODE_MAJOR=20

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    curl \
    gnupg \
    libpcre2-dev \
    python3-dev \
 && mkdir -p /etc/apt/keyrings \
 && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
 && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends \
    nodejs \
 && pip install --upgrade pip \
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
 && npm ci --no-audit

COPY ui_main.py webpack.common.js webpack.production.js ./
COPY imperial_calendar/ imperial_calendar/
COPY static/ static/
COPY ui/ ui/
RUN mkdir -p static/css static/js \
 && cp node_modules/bulma/css/bulma.min.css static/css/ \
 && chmod 0644 static/css/* \
 && pipenv run npx webpack --config webpack.production.js \
 && mv dist/* static/js/


FROM python:3.12-slim

SHELL ["/bin/bash", "-ex", "-o", "pipefail", "-c"]

WORKDIR /mnt

ENV PATH=/root/.local/bin:$PATH

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    build-essential \
    libpcre2-dev \
 && pip install --upgrade pip \
 && pip install --no-cache-dir pipenv \
 && useradd uwsgi --no-create-home --user-group \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

COPY Pipfile \
     Pipfile.lock \
     ./
RUN pipenv sync --pre --system

COPY --from=builder /mnt/static/ static/
COPY uwsgi.yaml web_main.py web.yml ./
COPY imperial_calendar/ imperial_calendar/
COPY templates/ templates/
COPY web/ web/
RUN pipenv run python -c 'print("")'

EXPOSE 5000 9191
ENTRYPOINT ["pipenv", "run", "uwsgi", "--plugin", "python3", "--yaml", "uwsgi.yaml"]
