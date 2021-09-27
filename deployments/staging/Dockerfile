FROM python:3.7-alpine AS builder

SHELL ["/bin/ash", "-ex", "-o", "pipefail", "-c"]

WORKDIR /mnt

ENV PATH=/root/.local/bin:$PATH

RUN apk add --no-cache -t .build-deps \
    curl \
 && pip install --no-cache-dir --user pipenv \
 && apk del --purge .build-deps \
 && rm -rf /var/cache/apk/*

COPY package.json \
     package-lock.json \
     Pipfile \
     Pipfile.lock \
     ./
RUN apk add --no-cache -t .build-deps \
    build-base \
    linux-headers \
    pcre-dev \
    python3-dev \
 && apk add --no-cache -t .runtime-deps \
    nodejs \
    npm \
 && pipenv sync --pre \
 && npm ci \
 && apk del --purge .build-deps \
 && rm -rf /var/cache/apk/*

COPY ui_main.py webpack.common.js webpack.production.js ./
COPY imperial_calendar/ imperial_calendar/
COPY static/ static/
COPY ui/ ui/
RUN mkdir -p static/css static/js \
 && cp node_modules/bulma/css/* static/css/ \
 && pipenv run npx webpack --config webpack.production.js \
 && mv dist/* static/js/


FROM python:3-alpine

SHELL ["/bin/ash", "-ex", "-o", "pipefail", "-c"]

WORKDIR /mnt

ENV FLASK_ENV=production \
    PATH=/root/.pipenv/bin:$PATH

RUN apk add --no-cache -t .build-deps \
    curl \
    shadow \
 && apk add --no-cache -t .runtime-deps \
    pcre \
 && pip install --no-cache-dir --user pipenv \
 && useradd uwsgi --no-create-home --user-group \
 && apk del --purge .build-deps \
 && rm -rf /var/cache/apk/*

COPY package.json \
     package-lock.json \
     Pipfile \
     Pipfile.lock \
     ./
RUN apk add --no-cache -t .build-deps \
    build-base \
    linux-headers \
    pcre-dev \
    python3-dev \
 && pipenv sync --pre \
 && apk del --purge .build-deps \
 && rm -rf /var/cache/apk/*

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
