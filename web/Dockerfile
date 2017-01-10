FROM node:latest

ENV NPM_CONFIG_LOGLEVEL error

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN npm install -g http-server

COPY web /usr/src/app

RUN npm install
RUN npm run ci

ENV NODE_ENV production
EXPOSE 8080

# prune after setting production env to remove dev dependencies
RUN npm prune

ENTRYPOINT ["http-server", "/usr/src/app/build"]
