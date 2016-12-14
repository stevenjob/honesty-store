FROM node:latest

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NODE_ENV production
EXPOSE 3000

COPY . /usr/src/app

ENTRYPOINT ["node", "."]