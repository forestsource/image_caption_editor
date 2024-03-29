FROM node:20-alpine
WORKDIR /usr/src/app

RUN npm install -g create-react-app react-scripts
RUN npm install -g react