FROM node:14-alpine
WORKDIR /usr/src/app

RUN npm install -g create-react-app
RUN npm install -g react