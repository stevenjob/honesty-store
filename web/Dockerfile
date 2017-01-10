FROM node:latest

ENV NPM_CONFIG_LOGLEVEL error
ENV NODE_ENV production
EXPOSE 8080

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN npm install -g http-server

COPY web /usr/src/app

ENTRYPOINT ["http-server", "/usr/src/app/build"]
