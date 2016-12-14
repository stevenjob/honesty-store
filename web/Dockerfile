FROM node:latest

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NODE_ENV production
EXPOSE 8080

RUN npm install -g http-server

COPY . /usr/src/app

ENTRYPOINT ["http-server", "/usr/src/app/build"]
