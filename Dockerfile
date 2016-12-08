FROM node:latest

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NODE_ENV production
EXPOSE 8080

RUN npm install -g http-server

# do this first to speed up incremental builds
COPY package.json /usr/src/app/
RUN npm install

COPY . /usr/src/app

ENTRYPOINT ["http-server", "/usr/src/app/build"]
