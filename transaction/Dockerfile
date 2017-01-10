FROM node:latest

ENV NPM_CONFIG_LOGLEVEL error

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY transaction /usr/src/app

RUN npm install
RUN npm run ci

ENV NODE_ENV production
EXPOSE 3000

# prune after setting production env to remove dev dependencies
RUN npm prune

ENTRYPOINT ["node", "."]