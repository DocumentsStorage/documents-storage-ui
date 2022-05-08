### Stage 1: build ###
FROM node:17.8-alpine as builder
MAINTAINER Daniel Goliszewski "taafeenn@gmail.com"
LABEL version="0.8.2"

# Set working directory.
RUN mkdir /documents-storage-ui
WORKDIR /documents-storage-ui

# Copy app dependencies.
COPY package*.json /documents-storage-ui/

# Install app dependencies.
RUN npm install

# Copy app files.
COPY . /documents-storage-ui

# Build app
RUN npm run build

### Stage 2: delivery ###

EXPOSE 5000
CMD ["npm", "start"]