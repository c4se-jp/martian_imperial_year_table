FROM python:3.9-slim AS builder

SHELL ["/bin/bash", "-ex", "-o", "pipefail", "-c"]

WORKDIR /mnt

ENV PATH=/root/.local/bin:$PATH

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libpcre3-dev \
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
 && npm ci --no-audit

COPY ui_main.py webpack.common.js webpack.production.js ./
COPY imperial_calendar/ imperial_calendar/
COPY static/ static/
COPY ui/ ui/
RUN mkdir -p static/css static/js \
 && cp node_modules/bulma/css/* static/css/ \
 && pipenv run npx webpack --config webpack.production.js \
 && mv dist/* static/js/


FROM python:3.9-slim

SHELL ["/bin/bash", "-ex", "-o", "pipefail", "-c"]

WORKDIR /mnt

ENV FLASK_ENV=production \
    PATH=/root/.local/bin:$PATH

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    build-essential \
    libpcre3-dev \
 && pip install --no-cache-dir --user pipenv \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

COPY Pipfile \
     Pipfile.lock \
     ./
RUN pipenv sync --pre

COPY --from=builder /mnt/static/ static/
COPY web_main.py web.yml ./
COPY imperial_calendar/ imperial_calendar/
COPY templates/ templates/
COPY web/ web/

EXPOSE 5000 9191
ENTRYPOINT ["pipenv", "run", "uwsgi", \
            "--die-on-term", \
            "--master", \
            "--uid", "uwsgi"]
CMD ["--callable", "app", \
     "--http", ":5000", \
     "--processes", "2", \
     "--stats", "127.0.0.1:9191", \
     "--threads", "2", \
     "--wsgi-file", "web_main.py"]
