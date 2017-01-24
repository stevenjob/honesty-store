FROM node:slim

ENV NPM_CONFIG_LOGLEVEL error
ENV NODE_ENV production
EXPOSE 8080

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY web /usr/src/app

ENTRYPOINT ["node", "/usr/src/app/index.js"]
